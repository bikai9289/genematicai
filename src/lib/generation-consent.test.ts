import { Route } from '@/routes/api/ai/generate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getBalance, getProvider } = vi.hoisted(() => ({
  getBalance: vi.fn(),
  getProvider: vi.fn(),
}));
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: unknown) => options,
}));
vi.mock('@/core/auth', () => ({
  getAuth: () => ({
    api: { getSession: async () => ({ user: { id: 'consent-test' } }) },
  }),
}));
vi.mock('@/modules/config/service', () => ({
  getConfig: async () => 'false',
  isMockMode: async () => false,
  getAllConfigs: async () => ({}),
}));
vi.mock('@/modules/ai-tasks/service', () => ({
  expireTimedOutTasks: async () => {},
}));
vi.mock('@/modules/ai/service', () => ({
  getActiveAIProvider: getProvider,
  createMockGenerateResult: vi.fn(),
  generateMedia: vi.fn(),
}));
vi.mock('@/modules/credits/service', () => ({
  getBalance,
  planConsume: vi.fn(),
  revoke: vi.fn(),
}));
vi.mock('@/routes/api/ai/task', () => ({ reclaimUserGhostSlots: vi.fn() }));

describe('generation consent boundary', () => {
  beforeEach(() => {
    getBalance.mockClear();
    getProvider.mockClear();
  });
  it('rejects concurrent unconfirmed references before balance or provider access', async () => {
    const results = await Promise.all(
      [undefined, false, 'true'].map(async (consent) => {
        const response = await (Route as any).server.handlers.POST({
          request: new Request('https://example.com/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaType: 'video',
              model: 'seedance-2-5',
              imageUrls: ['https://example.com/photo.png'],
              options: { media_consent: consent },
            }),
          }),
        });
        return response.json();
      })
    );
    for (const result of results) {
      expect(result.code).toBe(-1);
      expect(result.message).toContain('MEDIA_CONSENT_REQUIRED');
    }
    expect(getBalance).not.toHaveBeenCalled();
    expect(getProvider).not.toHaveBeenCalled();
  });
  it('also rejects an unconfirmed first-frame reference supplied through options', async () => {
    const response = await (Route as any).server.handlers.POST({
      request: new Request('https://example.com/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: 'video',
          model: 'seedance-2-5',
          options: { first_frame_image: 'https://example.com/photo.png' },
        }),
      }),
    });
    expect((await response.json()).message).toContain('MEDIA_CONSENT_REQUIRED');
    expect(getProvider).not.toHaveBeenCalled();
  });
});
