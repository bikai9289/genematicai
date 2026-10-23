import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import ts from 'typescript';

// Explicit production values must win over local development env files.
const { config, error } = ts.parseConfigFileTextToJson(
  'wrangler.jsonc',
  readFileSync('wrangler.jsonc', 'utf8')
);
if (error) throw new Error('Invalid wrangler.jsonc');
const production = existsSync('.env.production')
  ? parseEnv(readFileSync('.env.production', 'utf8'))
  : {};
const env = {
  ...process.env,
  ...production,
  ...config.vars,
  AUTH_URL:
    production.AUTH_URL || process.env.AUTH_URL || config.vars.VITE_APP_URL,
  NODE_ENV: 'production',
  NITRO_PRESET: 'cloudflare_module',
};
function run(args) {
  const result = spawnSync(process.execPath, args, {
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (!process.argv.includes('--deploy-only')) {
  run(['scripts/db-setup.mjs']);
  run(['node_modules/vite/bin/vite.js', 'build']);
}
if (!process.argv.includes('--build-only')) {
  const revision = spawnSync('git', ['rev-parse', '--short=12', 'HEAD'], {
    encoding: 'utf8',
  }).stdout?.trim();
  run([
    'node_modules/wrangler/bin/wrangler.js',
    'deploy',
    ...(process.env.DEPLOY_MESSAGE
      ? ['--message', process.env.DEPLOY_MESSAGE]
      : revision
        ? ['--message', `Release ${revision}`]
        : []),
  ]);
}
