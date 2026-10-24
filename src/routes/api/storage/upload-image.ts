import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  detectUploadImage,
  MediaPolicyError,
  screenImage,
} from '@/core/moderation/safe-search';
import {
  mediaKey,
  privateBucket,
  privateMediaUrl,
} from '@/core/storage/private';
import { getConfig } from '@/modules/config/service';
import { md5 } from '@/lib/hash';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const MAX_TOTAL = 20 * 1024 * 1024;
const MAX_FILE = 5 * 1024 * 1024;
async function boundedFormData(request: Request) {
  if (!request.body) throw new MediaPolicyError('MEDIA_NO_FILES');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_TOTAL + 64 * 1024) {
      await reader.cancel();
      throw new MediaPolicyError('MEDIA_UPLOAD_TOO_LARGE', 413);
    }
    chunks.push(value);
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { 'Content-Type': request.headers.get('content-type') || '' },
    }).formData();
  } catch {
    throw new MediaPolicyError('MEDIA_INVALID_FORM');
  }
}
export async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1000,
    keyPrefix: 'upload-image',
  });
  if (limited) return limited;
  const stored: string[] = [];
  let stage = 'auth';
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('UNAUTHORIZED', { status: 401 });
    const userLimited = enforceMinIntervalRateLimit(request, {
      intervalMs: 1000,
      keyPrefix: 'upload-image',
      extraKey: session.user.id,
    });
    if (userLimited) return userLimited;
    if (Number(request.headers.get('content-length')) > MAX_TOTAL + 64 * 1024)
      throw new MediaPolicyError('MEDIA_UPLOAD_TOO_LARGE', 413);
    stage = 'multipart';
    const form = await boundedFormData(request);
    const files = form.getAll(form.has('files') ? 'files' : 'file');
    if (!files.length) throw new MediaPolicyError('MEDIA_NO_FILES');
    if (files.length > 9) throw new MediaPolicyError('MEDIA_TOO_MANY_FILES');
    if (files.some((file) => !(file instanceof File)))
      throw new MediaPolicyError('MEDIA_INVALID_FILE');
    const images = files as File[];
    if (images.reduce((size, file) => size + file.size, 0) > MAX_TOTAL)
      throw new MediaPolicyError('MEDIA_UPLOAD_TOO_LARGE', 413);
    stage = 'private-storage-binding';
    const bucket = privateBucket();
    stage = 'screening-config';
    const key = (await getConfig('google_cloud_vision_api_key')) || '';
    const checked = [];
    for (const file of images) {
      stage = 'image-validation';
      if (!file.size || file.size > MAX_FILE)
        throw new MediaPolicyError('MEDIA_FILE_TOO_LARGE', 413);
      const body = new Uint8Array(await file.arrayBuffer());
      const format = detectUploadImage(body);
      stage = 'google-screening';
      await screenImage(body, key);
      checked.push({ file, body, format });
    }
    const results = [];
    for (const { file, body, format } of checked) {
      stage = 'private-storage-write';
      const objectKey = mediaKey(session.user.id, format.extension);
      stored.push(objectKey);
      await bucket.put(objectKey, body, {
        httpMetadata: { contentType: format.contentType },
        customMetadata: {
          owner: md5(session.user.id),
          moderation: 'safe-search-passed',
        },
      });
      results.push({
        url: privateMediaUrl(objectKey),
        key: objectKey,
        filename: file.name,
        deduped: false,
      });
    }
    return respData({ urls: results.map((r) => r.url), results });
  } catch (error) {
    if (stored.length)
      await Promise.allSettled(
        stored.map((key) => privateBucket().delete(key))
      );
    const failure =
      error instanceof MediaPolicyError
        ? error
        : new MediaPolicyError('MEDIA_UPLOAD_UNAVAILABLE', 503);
    console.warn('[upload-image] failed', {
      stage,
      code: failure.code,
      errorType: error instanceof Error ? error.name : 'Unknown',
    });
    return respErr(failure.code, { status: failure.status });
  }
}
export const Route = createFileRoute('/api/storage/upload-image')({
  server: { handlers: { POST } },
});
