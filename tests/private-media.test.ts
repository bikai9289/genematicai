import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { after, test } from 'node:test';
import { getPlatformProxy } from 'wrangler';

const directory = await mkdtemp(join(tmpdir(), 'genematicai-private-media-'));
const proxy = await getPlatformProxy<any>({
  configPath: 'wrangler.jsonc',
  persist: { path: directory },
});
(globalThis as any).__CF_ENV__ = {
  ...proxy.env,
  AUTH_SECRET: 'isolated-private-media-test-secret',
};
const { mediaKey, privateMediaUrl, signPrivateMediaUrl, authorizeReference } =
  await import('../src/core/storage/private');
const { md5 } = await import('../src/lib/hash');
const { GET, HEAD } = await import('../src/routes/api/storage/private');

after(async () => {
  await proxy.dispose();
  assert(resolve(directory).startsWith(resolve(tmpdir()) + sep));
  await rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
});

test('real local R2 supports scoped provider reads, ranges and HEAD without public access', async () => {
  const key = mediaKey('owner', 'png');
  const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3, 4]);
  await proxy.env.PRIVATE_MEDIA.put(key, bytes, {
    httpMetadata: { contentType: 'image/png' },
    customMetadata: { owner: md5('owner'), moderation: 'safe-search-passed' },
  });
  const url = await authorizeReference(privateMediaUrl(key), 'owner');
  const response = await GET({ request: new Request(url) });
  assert.equal(response.status, 200);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  const partial = await GET({
    request: new Request(url, { headers: { Range: 'bytes=0-3' } }),
  });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('Content-Range'), 'bytes 0-3/8');
  assert.deepEqual(
    new Uint8Array(await partial.arrayBuffer()),
    bytes.slice(0, 4)
  );
  const head = await HEAD({
    request: new Request(await signPrivateMediaUrl(key), { method: 'HEAD' }),
  });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Length'), '8');
  assert.equal(head.body, null);
});
