import { describe, expect, it } from 'vitest';

import { environmentName, resolveEnvironmentConfigs } from './environment';

describe('environment configuration', () => {
  it('uses Worker bindings before process env and bundled defaults', () => {
    const config = resolveEnvironmentConfigs(
      { app_url: 'http://localhost:3000' },
      {
        VITE_APP_URL: 'https://genematicai.com',
        KIE_API_KEY: 'worker-key',
        STRIPE_ENABLED: 'true',
        R2_BUCKET_NAME: 'assets',
      },
      { KIE_API_KEY: 'old-key' }
    );
    expect(config).toMatchObject({
      app_url: 'https://genematicai.com',
      kie_api_key: 'worker-key',
      stripe_enabled: 'true',
      r2_bucket_name: 'assets',
    });
  });
  it('treats explicit empty bindings as cleared instead of falling back', () => {
    expect(
      resolveEnvironmentConfigs(
        {},
        { KIE_API_KEY: '' },
        { KIE_API_KEY: 'stale' }
      ).kie_api_key
    ).toBe('');
  });
  it('supports custom values without letting them override infrastructure', () => {
    const result = resolveEnvironmentConfigs(
      { auth_secret: 'protected' },
      {
        CUSTOM_CONFIG_JSON: JSON.stringify({
          feature_note: 'hello',
          auth_secret: 'attack',
        }),
      },
      {}
    );
    expect(result.feature_note).toBe('hello');
    expect(result.auth_secret).toBe('protected');
  });
  it('does not import unrelated host environment variables into app config', () => {
    expect(
      resolveEnvironmentConfigs(
        {},
        {},
        { PATH: 'system', UNRELATED_API_KEY: 'hidden' }
      )
    ).not.toHaveProperty('UNRELATED_API_KEY');
  });
  it('keeps public app build variable names compatible', () => {
    expect(environmentName('app_url')).toBe('VITE_APP_URL');
    expect(environmentName('resend_reply_to')).toBe('RESEND_REPLY_TO');
  });
});
