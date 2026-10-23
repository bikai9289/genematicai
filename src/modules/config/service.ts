import { envConfigs } from '@/config';

import { resolveEnvironmentConfigs } from './environment';
import { getSettings } from './settings';

export type ConfigMap = Record<string, string>;
const protectedKeys = new Set([
  'auth_secret',
  'database_url',
  'database_auth_token',
  'database_provider',
  'db_schema',
  'db_singleton_enabled',
  'db_max_connections',
]);
const secretNames = new Set(
  getSettings()
    .filter((s) => s.type === 'password' || s.name.endsWith('_private_key'))
    .map((s) => s.name)
);
const secretPattern =
  /(_secret|_secret_key|_token|_password|_private_key|_api_key|_access_key|_api_v3_key)$/;
export function isSecretConfigKey(name: string): boolean {
  return secretNames.has(name) || secretPattern.test(name);
}

/** Database settings are retired; legacy rows are retained only as an encrypted rollback backup. */
export async function getDbConfigs(): Promise<ConfigMap> {
  return {};
}
export async function getAllConfigs(): Promise<ConfigMap> {
  const runtime =
    (globalThis as any).__CF_ENV__ ?? (globalThis as any).__env__ ?? {};
  const processEnv = typeof process !== 'undefined' ? process.env : {};
  return resolveEnvironmentConfigs(envConfigs, runtime, processEnv);
}
export async function getConfig(name: string): Promise<string | undefined> {
  return (await getAllConfigs())[name];
}
export async function isMockMode(): Promise<boolean> {
  return (await getConfig('mock'))?.trim() === '1';
}

const managedError = () =>
  new Error(
    'System configuration is managed through deployment environment variables.'
  );
export async function saveConfigs(_configs: ConfigMap): Promise<never> {
  throw managedError();
}
export async function getAdminConfigs(): Promise<never> {
  throw managedError();
}
export interface CustomConfig {
  key: string;
  value: string;
}
export async function getCustomConfigs(): Promise<never> {
  throw managedError();
}
export async function replaceCustomConfigs(
  _pairs: CustomConfig[]
): Promise<never> {
  throw managedError();
}

const maskPrefix = '\u2022'.repeat(8);
export function maskConfigValue(value: string): string {
  return value.length > 8 ? maskPrefix + value.slice(-4) : maskPrefix;
}
export function isMaskedConfigValue(value: string): boolean {
  return value.startsWith(maskPrefix);
}
// Kept for offline test helpers; no online endpoint accepts configuration overrides.
export function assertEndpointSecretsResupplied(
  changes: ConfigMap,
  saved: ConfigMap
) {
  for (const [endpoint, secrets] of Object.entries({
    openai_base_url: ['openai_api_key'],
    anthropic_base_url: ['anthropic_api_key'],
    r2_endpoint: ['r2_secret_key'],
    telegram_api_base: ['telegram_bot_token'],
    notify_webhook_url: ['notify_webhook_token'],
  })) {
    if (
      typeof changes[endpoint] !== 'string' ||
      isMaskedConfigValue(changes[endpoint])
    )
      continue;
    if (
      changes[endpoint].trim().replace(/\/+$/, '') ===
      (saved[endpoint] || '').trim().replace(/\/+$/, '')
    )
      continue;
    for (const secret of secrets)
      if (
        saved[secret] &&
        (!changes[secret] || isMaskedConfigValue(changes[secret]))
      )
        throw new Error(`Changing ${endpoint} requires re-entering ${secret}`);
  }
}
export function filterPublicConfigs(
  configs: ConfigMap,
  publicKeys: string[]
): ConfigMap {
  return Object.fromEntries(
    publicKeys
      .filter(
        (key) =>
          !protectedKeys.has(key) && !isSecretConfigKey(key) && key in configs
      )
      .map((key) => [key, configs[key]])
  );
}
