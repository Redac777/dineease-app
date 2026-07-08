// check-deps — garde-fou mécanique de la constitution.
// Compare les dépendances du package.json à la liste approuvée dans constitution.md
// (entre les marqueurs deps-allowlist). Échoue (exit 1) si une dépendance n'est pas approuvée.
// C'est ce qui rend la règle « dépendances approuvées » RÉELLE (pas un simple vœu).
//
// Lancé par la CI. En local : node scripts/check-deps.mjs
import { readFileSync } from 'node:fs';

function readAllowlist() {
  const txt = readFileSync('constitution.md', 'utf8');
  const m = txt.match(/<!-- deps-allowlist:start -->([\s\S]*?)<!-- deps-allowlist:end -->/);
  if (!m) {
    console.error('check-deps: marqueurs deps-allowlist introuvables dans constitution.md');
    process.exit(2);
  }
  const allowed = new Set();
  let typesWildcard = false;
  for (let line of m[1].split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('```')) continue; // commentaires / fences
    if (line === '@types/*') { typesWildcard = true; continue; }
    allowed.add(line);
  }
  return { allowed, typesWildcard };
}

const { allowed, typesWildcard } = readAllowlist();
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

const violations = Object.keys(deps).filter((name) => {
  if (allowed.has(name)) return false;
  if (typesWildcard && name.startsWith('@types/')) return false;
  return true;
});

if (violations.length) {
  console.error('check-deps: dépendances NON approuvées par constitution.md :');
  violations.forEach((v) => console.error('  - ' + v));
  console.error('Corrige : soit tu les retires, soit tu les ajoutes à la liste approuvée');
  console.error('(ASK FIRST + ADR), dans le même changement.');
  process.exit(1);
}
console.log(`check-deps: OK (${Object.keys(deps).length} dépendances, toutes approuvées).`);
