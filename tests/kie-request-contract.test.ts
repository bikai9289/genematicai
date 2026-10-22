import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calculateCredits,
  getModelSupportedResolutions,
} from '../src/components/sites/shared/models';
import { KieProvider } from '../src/core/ai/kie';
import { AIMediaType } from '../src/core/ai/types';

test('KIE preserves Pro model identity and image references', async () => {
  const originalFetch = globalThis.fetch;
  const payloads: any[] = [];
  globalThis.fetch = async (_url, init) => {
    payloads.push(JSON.parse(String(init?.body)));
    return Response.json({ code: 200, data: { taskId: 'contract-test' } });
  };
  try {
    const provider = new KieProvider({ apiKey: 'test-only' });
    for (const images of [[], ['https://example.com/reference.png']]) {
      await provider.generate({
        params: {
          mediaType: AIMediaType.IMAGE,
          model: 'nano-banana-pro',
          prompt: 'robot',
          options: { image_input: images },
        },
      });
      assert.equal(payloads.at(-1).model, 'nano-banana-pro');
      assert.deepEqual(payloads.at(-1).input.image_input, images);
    }
    await provider.generate({
      params: {
        mediaType: AIMediaType.VIDEO,
        model: 'seedance-2-5',
        prompt: 'robot waves',
        options: {
          image_input: [
            'https://example.com/first.png',
            'https://example.com/last.png',
          ],
        },
      },
    });
    assert.equal(
      payloads.at(-1).input.first_frame_url,
      'https://example.com/first.png'
    );
    assert.equal(
      payloads.at(-1).input.last_frame_url,
      'https://example.com/last.png'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Kling offers only resolutions that match provider billing', () => {
  assert.deepEqual(getModelSupportedResolutions('kling-3-0-turbo', 'kie'), [
    '720p',
    '1080p',
  ]);
  assert.equal(
    calculateCredits('kling-3-0-turbo', 'video', {
      duration: '5s',
      resolution: '720p',
    }),
    35
  );
});
