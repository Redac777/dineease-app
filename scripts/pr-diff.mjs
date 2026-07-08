// pr-diff — imprime le diff unifié d'une PR (pour que l'agent puisse la relire).
// Usage : node scripts/pr-diff.mjs <numero-de-PR>
import { execSync } from 'node:child_process';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('pr-diff: NO_TOKEN — renseigne GITHUB_TOKEN dans .env.');
  process.exit(2);
}

const number = process.argv[2];
if (!number) {
  console.error('Usage : node scripts/pr-diff.mjs <numero-de-PR>');
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
  console.error('pr-diff: repo introuvable depuis origin. ' + err.message);
  process.exit(2);
}

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3.diff',
    'User-Agent': 'pr-diff',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});
if (!res.ok) {
  console.error(`pr-diff: PR #${number} -> ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log(await res.text());
