import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('[prisma-env] Usage: node --env-file=.env.local scripts/prisma-with-env.mjs <prisma args>');
  process.exit(1);
}

const isDemoMode = String(process.env.APP_MODE ?? '')
  .trim()
  .toLowerCase() === 'demo';
const demoDatabaseUrl = process.env.DEMO_DATABASE_URL?.trim();

if (isDemoMode && demoDatabaseUrl) {
  process.env.DATABASE_URL = demoDatabaseUrl;
  console.log('[prisma-env] APP_MODE=demo detected. Using DEMO_DATABASE_URL for Prisma CLI.');
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error('[prisma-env] Missing DATABASE_URL. Set DATABASE_URL or DEMO_DATABASE_URL when APP_MODE=demo.');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const prismaCliPath = require.resolve('prisma/build/index.js');

const result = spawnSync(process.execPath, [prismaCliPath, ...args], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('[prisma-env] Failed to run Prisma CLI:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
