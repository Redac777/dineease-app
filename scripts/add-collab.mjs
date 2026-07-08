// add-collab — actions GitHub pour ajouter un collaborateur (côté OWNER uniquement).
//
// C'est le pendant de /onboard : /onboard (côté collaborateur) CONSTATE l'accès ; add-collab (côté
// owner) le DONNE. La mise à jour de CODEOWNERS (fichier de loi) se fait par PR via la commande
// /add-collab ; ce script fait les deux actions qui vivent côté GitHub :
//   1. ajouter la personne comme collaborateur du repo (droits Write / push) ;
//   2. remonter le nombre d'approbations requises sur les branches protégées (0 -> 1 par défaut),
//      maintenant qu'une vraie revue croisée est possible.
//
// Usage : node scripts/add-collab.mjs <handle-github> [approvals=1] [branches=main,dev_branch]
// Le token de .env doit être celui de l'OWNER (PAT classic, scope repo).
import { execSync } from 'node:child_process';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('add-collab: NO_TOKEN — renseigne le GITHUB_TOKEN de l\'owner dans .env.');
  process.exit(2);
}

const handle = (process.argv[2] || '').replace(/^@/, '');
const approvals = Number(process.argv[3] ?? 1);
const branches = (process.argv[4] || 'main,dev_branch').split(',').map((b) => b.trim()).filter(Boolean);
if (!handle) {
  console.error('add-collab: usage: node scripts/add-collab.mjs <handle-github> [approvals=1] [branches]');
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
  console.error('add-collab: impossible de déterminer le repo depuis origin. ' + err.message);
  process.exit(2);
}

async function api(path, method = 'GET', body) {
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'add-collab',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res;
}

const result = { repo: `${owner}/${repo}`, handle, steps: [], warnings: [] };

// 0. Le handle existe-t-il vraiment ? (évite une faute de frappe → collaborateur fantôme)
const userRes = await api(`/users/${handle}`);
if (!userRes.ok) {
  console.error(`add-collab: le compte GitHub "@${handle}" est introuvable (${userRes.status}). Vérifie le handle.`);
  process.exit(1);
}

// 1. Ajouter comme collaborateur avec droits d'écriture (push).
const addRes = await api(`/repos/${owner}/${repo}/collaborators/${handle}`, 'PUT', { permission: 'push' });
if (addRes.status === 201) {
  result.steps.push(`Invitation Write envoyée à @${handle} (il doit l'accepter par email/GitHub).`);
} else if (addRes.status === 204) {
  result.steps.push(`@${handle} est déjà collaborateur Write.`);
} else {
  result.warnings.push(`Ajout collaborateur: réponse inattendue ${addRes.status} ${await addRes.text()}`);
}

// 2. Remonter les approbations requises sur chaque branche protégée.
for (const branch of branches) {
  const getRes = await api(`/repos/${owner}/${repo}/branches/${branch}/protection`);
  if (getRes.status === 404) {
    result.warnings.push(`Branche "${branch}" non protégée : lance d'abord le verrouillage (init / SETUP).`);
    continue;
  }
  if (!getRes.ok) {
    result.warnings.push(`Lecture protection "${branch}": ${getRes.status} ${await getRes.text()}`);
    continue;
  }
  const cur = await getRes.json();
  const payload = {
    required_status_checks: cur.required_status_checks
      ? { strict: !!cur.required_status_checks.strict, contexts: cur.required_status_checks.contexts || [] }
      : null,
    enforce_admins: !!(cur.enforce_admins && cur.enforce_admins.enabled),
    required_pull_request_reviews: {
      dismiss_stale_reviews: !!(cur.required_pull_request_reviews && cur.required_pull_request_reviews.dismiss_stale_reviews),
      require_code_owner_reviews: cur.required_pull_request_reviews
        ? cur.required_pull_request_reviews.require_code_owner_reviews !== false
        : true,
      required_approving_review_count: approvals,
    },
    restrictions: null,
  };
  const putRes = await api(`/repos/${owner}/${repo}/branches/${branch}/protection`, 'PUT', payload);
  if (putRes.ok) {
    result.steps.push(`Branche "${branch}": approbations requises = ${approvals}.`);
  } else {
    result.warnings.push(`Maj protection "${branch}": ${putRes.status} ${await putRes.text()}`);
  }
}

console.log(JSON.stringify(result, null, 2));
