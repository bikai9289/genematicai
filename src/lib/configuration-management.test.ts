import { Route as config } from '@/routes/api/admin/config';
import { Route as custom } from '@/routes/api/admin/config/custom';
import { Route as test } from '@/routes/api/admin/settings/test';
import { describe, expect, it, vi } from 'vitest';

import { adminOperations } from './admin-operations';
import { getProbeBlockResponse } from './scanner-probe';

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: unknown) => options,
}));

describe('closed online configuration surfaces', () => {
  it('returns 410 without reading submitted overrides or invoking providers', async () => {
    for (const route of [config, custom, test]) {
      for (const handler of Object.values(
        (route as any).server.handlers
      ) as Function[]) {
        const response = await handler({
          request: new Request('https://example.com/api/admin/config', {
            method: 'POST',
            body: 'invalid json',
          }),
        });
        expect(response.status).toBe(410);
        expect(response.headers.get('cache-control')).toBe('no-store');
      }
    }
  });
  it('does not advertise configuration operations to REST discovery or MCP', () => {
    const names = adminOperations.map((operation) => operation.name);
    for (const name of [
      'settings_get',
      'settings_update',
      'custom_settings_get',
      'custom_settings_replace',
      'settings_test',
    ])
      expect(names).not.toContain(name);
  });
  it('permanently rejects the retired sealed transfer path', () => {
    expect(
      getProbeBlockResponse(
        new Request('https://example.com/api/internal/sealed-config-transfer', {
          method: 'POST',
        })
      )?.status
    ).toBe(404);
  });
});
