import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  filterPublicConfigs,
  getAdminConfigs,
  getAllConfigs,
  getCustomConfigs,
  getDbConfigs,
  replaceCustomConfigs,
  saveConfigs,
} from './service';

vi.mock('@/core/db', () => {
  throw new Error('Environment config must not import the database');
});

afterEach(() => vi.unstubAllGlobals());
describe('retired database configuration', () => {
  it('reads current Worker bindings and never legacy database settings', async () => {
    vi.stubGlobal('__CF_ENV__', {
      KIE_API_KEY: 'runtime-key',
      STRIPE_ENABLED: 'true',
      R2_BUCKET_NAME: 'new-bucket',
    });
    expect(await getDbConfigs()).toEqual({});
    expect(await getAllConfigs()).toMatchObject({
      kie_api_key: 'runtime-key',
      stripe_enabled: 'true',
      r2_bucket_name: 'new-bucket',
    });
    vi.stubGlobal('__CF_ENV__', { KIE_API_KEY: 'replacement' });
    expect((await getAllConfigs()).kie_api_key).toBe('replacement');
  });
  it('disables read, write and custom configuration APIs at the service layer', async () => {
    await expect(saveConfigs({ stripe_enabled: 'true' })).rejects.toThrow(
      'deployment environment'
    );
    await expect(getAdminConfigs()).rejects.toThrow('deployment environment');
    await expect(getCustomConfigs()).rejects.toThrow('deployment environment');
    await expect(replaceCustomConfigs([])).rejects.toThrow(
      'deployment environment'
    );
  });
  it('does not expose provider or infrastructure secrets through public config', () => {
    const config = {
      app_name: 'App',
      auth_secret: 'private',
      kie_api_key: 'private',
      stripe_secret_key: 'private',
      r2_access_key: 'private',
    };
    expect(filterPublicConfigs(config, Object.keys(config))).toEqual({
      app_name: 'App',
    });
  });
});
