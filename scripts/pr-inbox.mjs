// pr-inbox — rapporteur pour la "boîte de review" et le suivi de ses propres PR.
//
// Lit le token GitHub depuis .env (GITHUB_TOKEN), détecte le compte courant, déduit le repo depuis
// `origin`, et renvoie en JSON :
//   - toReview : PR ouvertes où le compte courant est reviewer requis (+ fichiers touchés)
//   - mine     : PR ouvertes du compte courant, avec revues, état de merge et CI
//
// L'agent lit ce JSON, l'annonce à l'utilisateur, et n'agit (approuver / refuser / merger) QUE sur
// décision humaine explicite. C'est un rapporteur : il ne modifie rien.
import { execSync } from 'node:child_process';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('pr-inbox: NO_TOKEN — renseigne GITHUB_TOKEN dans .env.');
  process.exit(2);
}

let owner;
let repo;
try {
  const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  if (!m) throw new Error('remote origin non GitHub : ' + url);
  owner = m[1];
  repo = m[2];
} catch (err) {
  console.error('pr-inbox: impossible de déterminer le repo depuis origin. ' + err.message);
  process.exit(2);
}

async function api(path, accept = 'application/vnd.github+json') {
  const res = await fetch('https://api.github.com' + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'User-Agent': 'pr-inbox',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

const me = (await api('/user')).login;
const pulls = await api(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);

const toReview = [];
const mine = [];

for (const pr of pulls) {
  const requested = (pr.requested_reviewers || []).map((u) => u.login);

  if (requested.includes(me)) {
    const files = await api(`/repos/${owner}/${repo}/pulls/${pr.number}/files?per_page=100`);
    toReview.push({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      files: files.map((f) => ({ path: f.filename, status: f.status, added: f.additions, removed: f.deletions })),
    });
  }

  if (pr.user.login === me) {
    const full = await api(`/repos/${owner}/${repo}/pulls/${pr.number}`);
    const reviews = await api(`/repos/${owner}/${repo}/pulls/${pr.number}/reviews`);
    const checks = await api(`/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs`);
    const ci = (checks.check_runs || []).map((c) => c.conclusion || c.status);
    mine.push({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      mergeable_state: full.mergeable_state, // clean = débloquée ; blocked = attend revue/CI
      approvals: reviews.filter((r) => r.state === 'APPROVED').map((r) => r.user.login),
      changesRequested: reviews.filter((r) => r.state === 'CHANGES_REQUESTED').map((r) => r.user.login),
      ci: ci.length ? (ci.every((c) => c === 'success') ? 'verte' : ci.join(',')) : 'aucune',
    });
  }
}

console.log(JSON.stringify({ me, repo: `${owner}/${repo}`, toReview, mine }, null, 2));
