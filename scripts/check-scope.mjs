// check-scope — garde-fou de périmètre : "un agent = un module à la fois".
//
// Fait échouer une PR si :
//   - elle modifie plusieurs modules `src/modules/<X>/` à la fois, ou
//   - elle modifie un module différent du scope déclaré par la branche (`type/owner/scope`).
//
// Ce que le garde NE bloque PAS : les fichiers partagés (docs, CHANGELOG, config, scripts, shared/).
// Ceux-là sont gouvernés par CODEOWNERS + revue, pas par ce garde. Ça préserve la discipline de doc
// (une tâche met à jour CHANGELOG / ARCHITECTURE / ADR…) tout en verrouillant le territoire du CODE.
//
// Adapte le motif `src/modules/<X>/` si ton projet range ses modules ailleurs (ex. `packages/<X>/`).
// Lancé par la CI sur les pull requests. En local : BRANCH=feat/dev/moduleX node scripts/check-scope.mjs
import { execSync } from 'node:child_process';

const head = process.env.GITHUB_HEAD_REF || process.env.BRANCH || '';
const base = process.env.GITHUB_BASE_REF || process.env.BASE || 'dev_branch';

// Scope = 3e segment de `type/owner/scope`. Format non respecté → on ne vérifie pas le nom, mais on
// applique quand même la règle "un seul module".
const parts = head.split('/');
const scope = parts.length >= 3 ? parts[2] : null;

let changed = [];
try {
  const out = execSync(`git diff --name-only origin/${base}...HEAD`, { encoding: 'utf8' });
  changed = out.split('\n').map((s) => s.trim()).filter(Boolean);
} catch (err) {
  console.error('check-scope: impossible de calculer le diff vs origin/' + base);
  console.error(String(err && err.message ? err.message : err));
  process.exit(2);
}

const moduleRe = /^src\/modules\/([^/]+)\//;
const touched = new Set();
for (const file of changed) {
  const m = file.match(moduleRe);
  if (m) touched.add(m[1]);
}

if (touched.size === 0) {
  console.log('check-scope: OK (aucun module touché — changement partagé / doc / config).');
  process.exit(0);
}

if (touched.size > 1) {
  console.error('check-scope: ÉCHEC — la PR touche plusieurs modules : ' + [...touched].join(', '));
  console.error('Règle : un agent = un module à la fois. Sépare en plusieurs PR.');
  process.exit(1);
}

const only = [...touched][0];
if (scope && only !== scope) {
  console.error(`check-scope: ÉCHEC — branche scopée « ${scope} » mais la PR modifie le module « ${only} ».`);
  console.error("Tu ne modifies pas le module d'un autre sans sa revue. Ouvre une PR dédiée à ce module.");
  process.exit(1);
}

console.log(`check-scope: OK (un seul module « ${only} », cohérent avec la branche).`);
