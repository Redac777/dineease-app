// pr-merge — squash-merge une PR. À n'exécuter QUE sur confirmation humaine explicite (voir /pr-watch).
// Usage : node scripts/pr-merge.mjs <n>
import { execSync } from 'node:child_process';

// Charge .env : le token n'est pas exporté dans le shell (leçon PR #13, sinon NO_TOKEN).
try { process.loadEnvFile(); } catch {}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('pr-merge: NO_TOKEN — renseigne GITHUB_TOKEN dans .env.');
  process.exit(2);
}

const number = process.argv[2];
if (!number) {
  console.error('Usage : node scripts/pr-merge.mjs <n>');
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
  console.error('pr-merge: repo introuvable depuis origin. ' + err.message);
  process.exit(2);
}

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/merge`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'pr-merge',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  body: JSON.stringify({ merge_method: 'squash' }),
});
const data = await res.json();
if (!res.ok) {
  console.error(`pr-merge: PR #${number} -> ${res.status} ${JSON.stringify(data)}`);
  process.exit(1);
}
console.log(`pr-merge: PR #${number} mergée (squash). ${data.message || ''}`);
