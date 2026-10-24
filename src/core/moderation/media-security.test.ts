import { GET } from '@/routes/api/storage/private';
import { POST } from '@/routes/api/storage/upload-image';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  authorizeReference,
  mediaKey,
  ownsMediaKey,
  privateMediaUrl,
  signPrivateMediaUrl,
  verifyPrivateMediaSignature,
} from '@/core/storage/private';
import { md5 } from '@/lib/hash';

import {
  assertSafeSearchResult,
  detectUploadImage,
  screenImage,
} from './safe-search';

const mocks = vi.hoisted(() => ({ session: null as any }));
vi.mock('@/core/auth', () => ({
  getAuth: () => ({ api: { getSession: async () => mocks.session } }),
}));
vi.mock('@/modules/config/service', () => ({
  getConfig: async () => 'isolated-vision-key',
}));
vi.mock('@/lib/rate-limit', () => ({
  enforceMinIntervalRateLimit: () => null,
}));

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64'
);
let bucket: any;
beforeEach(() => {
  bucket = { put: vi.fn(), get: vi.fn(), head: vi.fn(), delete: vi.fn() };
  vi.stubGlobal('__CF_ENV__', {
    PRIVATE_MEDIA: bucket,
    AUTH_SECRET: 'isolated-media-signing-secret',
  });
  mocks.session = { user: { id: 'owner' } };
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({
        responses: [
          {
            safeSearchAnnotation: {
              adult: 'VERY_UNLIKELY',
              violence: 'UNLIKELY',
            },
          },
        ],
      })
    )
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('SafeSearch fails closed', () => {
  it.each(['LIKELY', 'VERY_LIKELY'])(
    'rejects adult or violence rated %s',
    (rank) => {
      expect(() =>
        assertSafeSearchResult({ adult: rank, violence: 'UNLIKELY' })
      ).toThrow('MEDIA_CONTENT_REJECTED');
      expect(() =>
        assertSafeSearchResult({ adult: 'UNLIKELY', violence: rank })
      ).toThrow('MEDIA_CONTENT_REJECTED');
    }
  );
  it.each([
    undefined,
    {},
    { adult: 'UNKNOWN', violence: 'UNLIKELY' },
    { adult: 'UNLIKELY', violence: 'unexpected' },
  ])('rejects missing or unknown verdicts', (value) => {
    expect(() => assertSafeSearchResult(value)).toThrow(
      'MEDIA_SCREENING_UNAVAILABLE'
    );
  });
  it('does not send an image without a key', async () => {
    await expect(screenImage(png, '')).rejects.toThrow(
      'MEDIA_SCREENING_NOT_CONFIGURED'
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it('logs only a categorical billing reason, never the credential or Google message', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      vi.mocked(fetch).mockResolvedValue(Response.json({error:{status:'PERMISSION_DENIED',message:'private-message-with-key',details:[{reason:'BILLING_DISABLED'}]}},{status:403}));
      await expect(screenImage(png,'isolated-secret-key')).rejects.toThrow('MEDIA_SCREENING_UNAVAILABLE');
      expect(warn).toHaveBeenCalledWith('[media-screening] unavailable',{reason:'BILLING_DISABLED',status:403,upstreamCode:undefined});
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-message');
      expect(JSON.stringify(warn.mock.calls)).not.toContain('isolated-secret-key');
    } finally { warn.mockRestore(); }
  });
  it('uses fixed Google endpoint and does not put credentials in a URL', async () => {
    await screenImage(png, 'isolated-key');
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://vision.googleapis.com/v1/images:annotate');
    expect(JSON.parse(options!.body as string).requests[0].features).toEqual([
      { type: 'SAFE_SEARCH_DETECTION' },
    ]);
  });
  it.each([{}, { responses: [{ error: { code: 429 } }] }, { responses: [] }])(
    'rejects API errors or incomplete responses',
    async (result) => {
      vi.mocked(fetch).mockResolvedValue(Response.json(result));
      await expect(screenImage(png, 'isolated-key')).rejects.toThrow(
        'MEDIA_SCREENING_UNAVAILABLE'
      );
    }
  );
  it('rejects spoofed executable files and identifies actual PNG bytes', () => {
    expect(() =>
      detectUploadImage(Buffer.from('<svg onload="x">malicious</svg>'))
    ).toThrow('MEDIA_IMAGE_FORMAT_UNSUPPORTED');
    expect(detectUploadImage(png).contentType).toBe('image/png');
  });
});

describe('private read grants', () => {
  it('scopes signing to one object and rejects expired/tampered grants', async () => {
    const key = mediaKey('owner', 'png');
    const url = new URL(await signPrivateMediaUrl(key));
    expect(await verifyPrivateMediaSignature(url)).toBe(true);
    url.searchParams.set('key', mediaKey('other', 'png'));
    expect(await verifyPrivateMediaSignature(url)).toBe(false);
    const expired = new URL(await signPrivateMediaUrl(key));
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 3_601_000);
    expect(await verifyPrivateMediaSignature(expired)).toBe(false);
  });
  it('never signs another user input even if the requester knows its URL', async () => {
    const key = mediaKey('other', 'png');
    await expect(
      authorizeReference(privateMediaUrl(key), 'owner')
    ).rejects.toThrow('MEDIA_NOT_FOUND');
    expect(bucket.head).not.toHaveBeenCalled();
    expect(ownsMediaKey(key, 'owner')).toBe(false);
  });
  it('requires a stored screening decision before provider access', async () => {
    const key = mediaKey('owner', 'png');
    bucket.head.mockResolvedValue({ customMetadata: { owner: md5('owner') } });
    await expect(
      authorizeReference(privateMediaUrl(key), 'owner')
    ).rejects.toThrow('MEDIA_REUPLOAD_REQUIRED');
    bucket.head.mockResolvedValue({
      customMetadata: { owner: md5('owner'), moderation: 'safe-search-passed' },
    });
    expect(
      new URL(
        await authorizeReference(privateMediaUrl(key), 'owner')
      ).searchParams.get('signature')
    ).toBeTruthy();
  });
  it('denies unauthenticated and cross-account reads without touching storage', async () => {
    const key = mediaKey('other', 'png');
    let response = await GET({ request: new Request(privateMediaUrl(key)) });
    expect(response.status).toBe(404);
    mocks.session = null;
    response = await GET({ request: new Request(privateMediaUrl(key)) });
    expect(response.status).toBe(401);
    expect(bucket.get).not.toHaveBeenCalled();
  });
  it('allows a provider read only through a valid grant, with private cache headers', async () => {
    const key = mediaKey('owner', 'png');
    mocks.session = null;
    bucket.get.mockResolvedValue({
      body: png,
      size: png.length,
      httpMetadata: { contentType: 'image/png' },
    });
    const response = await GET({
      request: new Request(await signPrivateMediaUrl(key)),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
});

describe('screened uploads', () => {
  function upload(
    file = new File([png], 'portrait.png', { type: 'image/png' })
  ) {
    const form = new FormData();
    form.append('files', file);
    return new Request('https://example.test/api/storage/upload-image', {
      method: 'POST',
      body: form,
    });
  }
  it('does not store rejected images or any part of a rejected selection', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        responses: [
          { safeSearchAnnotation: { adult: 'LIKELY', violence: 'UNLIKELY' } },
        ],
      })
    );
    const response = await POST({ request: upload() });
    expect(response.status).toBe(422);
    expect(bucket.put).not.toHaveBeenCalled();
  });
  it('stores approved inputs with owner and screening metadata in the private bucket', async () => {
    const response = await POST({ request: upload() });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.urls[0]).toContain('/api/storage/private?');
    expect(bucket.put.mock.calls[0][2].customMetadata).toEqual({
      owner: md5('owner'),
      moderation: 'safe-search-passed',
    });
  });
  it('fails closed when Google is unavailable', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network failure'));
    const response = await POST({ request: upload() });
    expect(response.status).toBe(503);
    expect(bucket.put).not.toHaveBeenCalled();
  });
  it('authenticates before screening or storage', async () => {
    mocks.session = null;
    expect((await POST({ request: upload() })).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
    expect(bucket.put).not.toHaveBeenCalled();
  });
});
