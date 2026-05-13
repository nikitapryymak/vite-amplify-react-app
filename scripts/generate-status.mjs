import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

function resolveVersion() {
  if (process.env.AWS_COMMIT_ID) return process.env.AWS_COMMIT_ID.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

const status = {
  version: resolveVersion(),
  maintenance: process.env.VITE_MAINTENANCE_MODE === 'true',
};

const outPath = 'public/status.json';
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(status, null, 2) + '\n');
console.log(`Wrote ${outPath}:`, status);
