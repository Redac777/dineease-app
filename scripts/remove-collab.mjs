// remove-collab — retirer un collaborateur (côté OWNER uniquement).
//
// Deux modes, pour imposer le bon ordre (réaffecter AVANT de retirer) :
//   check   : analyse .github/CODEOWNERS et signale les modules du collaborateur, dont ceux ORPHELINS
//             (dont il est le SEUL owner) qu'il faudra réaffecter. Ne touche à rien.
//   remove  : retire l'accès GitHub (DELETE collaborator) et, si demandé, ajuste les approbations
//             requises (ex. retour à 0 si on retombe à un seul vrai compte).
//
// Usage : node scripts/remove-collab.mjs <handle> <check|remove> [approvals] [branches=main,dev_branch]
// Le token de .env doit être celui de l'OWNER (PAT classic, scope repo).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('remove-collab: NO_TOKEN — renseigne le GITHUB_TOKEN de l\'owner dans .env.');
  process.exit(2);
}

const handle = (process.argv[2] || '').replace(/^@/, '');
const mode = process.argv[3] || 'check';
const approvals = process.argv[4] !== undefined ? Number(process.argv[4]) : null;
const branches = (process.argv[5] || 'main,dev_branch').split(',').map((b) => b.trim()).filter(Boolean);
if (!handle || !['check', 'remove'].includes(mode)) {
  console.error('remove-collab: usage: node scripts/remove-collab.mjs <handle> <check|remove> [approvals] [branches]');
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
  console.error('remove-collab: impossible de déterminer le repo depuis origin. ' + err.message);
  process.exit(2);
}

async function api(path, method = 'GET', body) {
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'remove-collab',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res;
}

// Analyse CODEOWNERS : modules du handle, et ceux dont il est le SEUL owner (orphelins si on le retire).
const modulesOwned = [];
const orphanedModules = [];
for (const p of ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']) {
  try {
    const txt = readFileSync(p, 'utf8');
    for (const rawLine of txt.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      const pattern = parts[0];
      const owners = parts.slice(1);
      if (owners.includes(`@${handle}`)) {
        modulesOwned.push(pattern);
        if (owners.length === 1) orphanedModules.push(pattern); // seul owner -> orphelin
      }
    }
    break;
  } catch {
    // fichier absent ici, on essaie l'emplacement suivant
  }
}

const result = { repo: `${owner}/${repo}`, handle, mode, modulesOwned, orphanedModules, steps: [], warnings: [] };

if (mode === 'check') {
  if (orphanedModules.length) {
    result.warnings.push(
      `Modules dont @${handle} est le SEUL owner : ${orphanedModules.join(', ')}. ` +
        'Réaffecte-les dans CODEOWNERS (par PR) AVANT de lancer le mode remove.',
    );
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// mode remove : garde-fou — refuse tant que des modules restent orphelins dans CODEOWNERS.
if (orphanedModules.length) {
  result.warnings.push(
    `Refus : @${handle} est encore seul owner de ${orphanedModules.join(', ')}. ` +
      'Fais d\'abord la PR de réaffectation CODEOWNERS, puis relance.',
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

// 1. Retirer l'accès GitHub.
const delRes = await api(`/repos/${owner}/${repo}/collaborators/${handle}`, 'DELETE');
if (delRes.status === 204) {
  result.steps.push(`@${handle} retiré des collaborateurs du repo.`);
} else {
  result.warnings.push(`Retrait collaborateur: ${delRes.status} ${await delRes.text()}`);
}

// 2. Ajuster les approbations si demandé (ex. retour à 0 en compte unique).
if (approvals !== null && !Number.isNaN(approvals)) {
  for (const branch of branches) {
    const getRes = await api(`/repos/${owner}/${repo}/branches/${branch}/protection`);
    if (getRes.status === 404) {
      result.warnings.push(`Branche "${branch}" non protégée : rien à ajuster.`);
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
    if (putRes.ok) result.steps.push(`Branche "${branch}": approbations requises = ${approvals}.`);
    else result.warnings.push(`Maj protection "${branch}": ${putRes.status} ${await putRes.text()}`);
  }
}

console.log(JSON.stringify(result, null, 2));
