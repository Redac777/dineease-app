// pr-approve — poste une revue sur une PR (APPROVE ou REQUEST_CHANGES).
// À n'exécuter QUE sur décision humaine explicite (voir /pr-watch).
// Usage :
//   node scripts/pr-approve.mjs <n> approve ["message optionnel"]
//   node scripts/pr-approve.mjs <n> request-changes "message obligatoire"
import { execSync } from 'node:child_process';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('pr-approve: NO_TOKEN — renseigne GITHUB_TOKEN dans .env.');
  process.exit(2);
}

const [number, verb, ...rest] = process.argv.slice(2);
const body = rest.join(' ');
const map = { approve: 'APPROVE', 'request-changes': 'REQUEST_CHANGES' };
const event = map[verb];
if (!number || !event) {
  console.error('Usage : node scripts/pr-approve.mjs <n> approve|request-changes ["message"]');
  process.exit(2);
}
if (event === 'REQUEST_CHANGES' && !body) {
  console.error('pr-approve: un message est obligatoire pour request-changes.');
  process.exit(2);
}

let owner;
let repo;
try {
  const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  owner = m[1];
  repo = m[2];
} catch (err) {
  console.error('pr-approve: repo introuvable depuis origin. ' + err.message);
  process.exit(2);
}

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/reviews`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'pr-approve',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  body: JSON.stringify({ event, body: body || undefined }),
});
const data = await res.json();
if (!res.ok) {
  console.error(`pr-approve: PR #${number} -> ${res.status} ${JSON.stringify(data)}`);
  process.exit(1);
}
console.log(`pr-approve: PR #${number} — revue « ${event} » postée par ${data.user && data.user.login}.`);
