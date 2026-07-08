// onboard-check — vérifie qu'un collaborateur qui rejoint le projet est bien configuré.
//
// Il CONSTATE, il ne contourne rien : l'accès reste donné côté GitHub (collaborateur + CODEOWNERS +
// protection de branche). Ce script vérifie seulement que la personne et son token correspondent à un
// collaborateur déclaré, et que ses droits d'écriture sont réels.
//
// Vérifie, à partir du GITHUB_TOKEN de .env (jamais du nom tapé) :
//   - l'identité réelle du token (GET /user) et son TYPE (classic vs fine-grained) ;
//   - que ce login est bien listé dans .github/CODEOWNERS (collaborateur déclaré) ;
//   - le niveau d'accès réel sur le repo (permission = write/admin attendu) ;
//   - avertit si le token est fine-grained (les lectures passent, les écritures tomberont en 403 sur
//     le repo perso d'un autre compte -> recommander un PAT classic).
//
// Renvoie un JSON que la commande /onboard lit pour guider la personne. Ne modifie rien.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('onboard-check: NO_TOKEN — colle ton PAT dans .env (GITHUB_TOKEN) puis relance.');
  process.exit(2);
}

// Type de token d'après son préfixe : ghp_ = classic (recommandé) ; github_pat_ = fine-grained.
const tokenType = token.startsWith('github_pat_')
  ? 'fine-grained'
  : token.startsWith('ghp_')
    ? 'classic'
    : 'inconnu';

let owner;
let repo;
try {
  const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  if (!m) throw new Error('remote origin non GitHub : ' + url);
  owner = m[1];
  repo = m[2];
} catch (err) {
  console.error('onboard-check: impossible de déterminer le repo depuis origin. ' + err.message);
  process.exit(2);
}

async function api(path) {
  const res = await fetch('https://api.github.com' + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'onboard-check',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  return res;
}

// 1. Identité réelle du token (jamais le nom tapé).
const userRes = await api('/user');
if (!userRes.ok) {
  console.error(`onboard-check: le token est invalide ou expiré (GET /user -> ${userRes.status}).`);
  process.exit(2);
}
const me = (await userRes.json()).login;

// 2. Le login est-il un collaborateur déclaré dans CODEOWNERS ? Et quels modules possède-t-il ?
let inCodeowners = false;
let codeownersFound = false;
let myModules = []; // les patterns de chemin (modules) dont @me est owner
for (const p of ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']) {
  try {
    const txt = readFileSync(p, 'utf8');
    codeownersFound = true;
    for (const rawLine of txt.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue; // saute vides et commentaires
      const parts = line.split(/\s+/);
      const pattern = parts[0];
      const owners = parts.slice(1);
      if (owners.includes(`@${me}`)) {
        inCodeowners = true;
        myModules.push(pattern);
      }
    }
    break;
  } catch {
    // fichier absent à cet emplacement, on essaie le suivant
  }
}

// 3. Niveau d'accès réel sur le repo.
let permission = 'inconnu';
const permRes = await api(`/repos/${owner}/${repo}/collaborators/${me}/permission`);
if (permRes.ok) {
  permission = (await permRes.json()).permission; // admin | write | read | none
} else if (permRes.status === 403 || permRes.status === 404) {
  permission = 'non collaborateur (ou lecture seule)';
}

const canWrite = permission === 'admin' || permission === 'write';

const warnings = [];
if (tokenType === 'fine-grained') {
  warnings.push(
    "Ton token est fine-grained : les lectures passent mais les écritures (push, PR, review) tomberont " +
      "en 403 sur le repo perso d'un autre compte. Recommande un PAT classic (ghp_, scope repo).",
  );
}
if (tokenType === 'inconnu') {
  warnings.push("Préfixe de token non reconnu : assure-toi que c'est un PAT classic (ghp_, scope repo).");
}
if (codeownersFound && !inCodeowners) {
  warnings.push(
    `Le login réel de ce token est "@${me}", absent de CODEOWNERS. Soit ce n'est pas le bon token, ` +
      "soit tu n'es pas encore déclaré comme owner d'un module : l'owner doit t'ajouter (collaborateur + CODEOWNERS).",
  );
}
if (!codeownersFound) {
  warnings.push('CODEOWNERS introuvable : vérifie que tu es bien sur dev_branch (git checkout dev_branch).');
}
if (!canWrite) {
  warnings.push(
    `Accès insuffisant sur ${owner}/${repo} (permission = ${permission}). L'owner doit t'ajouter comme ` +
      'collaborateur avec les droits Write.',
  );
}

const ok = canWrite && (!codeownersFound || inCodeowners) && tokenType !== 'fine-grained';

console.log(
  JSON.stringify(
    { me, repo: `${owner}/${repo}`, tokenType, permission, inCodeowners, codeownersFound, myModules, canWrite, ok, warnings },
    null,
    2,
  ),
);
