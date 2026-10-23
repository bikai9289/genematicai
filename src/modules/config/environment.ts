import { getSettings } from './settings';

const aliases: Record<string, string> = {
  app_url: 'VITE_APP_URL',
  app_name: 'VITE_APP_NAME',
  app_description: 'VITE_APP_DESCRIPTION',
  app_logo: 'VITE_APP_LOGO',
  locale: 'VITE_DEFAULT_LOCALE',
  stripe_api_key: 'STRIPE_SECRET_KEY',
  stripe_webhook_secret: 'STRIPE_SIGNING_SECRET',
};
export function environmentName(name: string): string {
  return aliases[name] || name.toUpperCase();
}
export function knownConfigurationKeys(
  defaults: Record<string, string> = {}
): Set<string> {
  return new Set([
    ...getSettings().map((s) => s.name),
    ...Object.keys(defaults),
    ...Object.keys(aliases),
    'auth_secret',
    'auth_url',
    'database_url',
    'database_provider',
    'database_auth_token',
    'mock',
    'kie_base_url',
    'apimart_base_url',
    'r2_account_id',
    'resend_reply_to',
  ]);
}
export function resolveEnvironmentConfigs(
  defaults: Record<string, string>,
  runtime: Record<string, unknown>,
  processEnv: Record<string, unknown>
): Record<string, string> {
  const result = { ...defaults };
  const read = (key: string) =>
    Object.hasOwn(runtime, key) ? runtime[key] : processEnv[key];
  const known = knownConfigurationKeys(defaults);
  for (const name of known) {
    const value = read(environmentName(name));
    if (typeof value === 'string') result[name] = value;
  }
  const customJson = read('CUSTOM_CONFIG_JSON');
  if (typeof customJson === 'string' && customJson.trim()) {
    const custom = JSON.parse(customJson);
    if (!custom || typeof custom !== 'object' || Array.isArray(custom))
      throw new Error('Invalid CUSTOM_CONFIG_JSON');
    for (const [name, value] of Object.entries(custom)) {
      if (
        !known.has(name) &&
        /^[A-Za-z0-9_.:-]{1,191}$/.test(name) &&
        typeof value === 'string'
      )
        result[name] = value;
    }
  }
  return result;
}
