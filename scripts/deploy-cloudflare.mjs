import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Load production values before Vite so local development values cannot win.
if (existsSync('.env.production')) process.loadEnvFile('.env.production');
process.env.NODE_ENV = 'production';
process.env.NITRO_PRESET = 'cloudflare_module';

for (const [script, ...args] of [
  ['scripts/db-setup.mjs'],
  ['node_modules/vite/bin/vite.js', 'build'],
  ['node_modules/wrangler/bin/wrangler.js', 'deploy'],
]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
