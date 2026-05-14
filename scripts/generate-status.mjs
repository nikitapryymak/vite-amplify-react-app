import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const status = {
  version: pkg.version,
  maintenance: process.env.VITE_MAINTENANCE_MODE === 'true',
};

const outPath = 'dist/status.json';
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(status, null, 2) + '\n');
console.log(`Wrote ${outPath}:`, status);
