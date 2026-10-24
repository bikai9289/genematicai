import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { MediaPolicyError } from '@/core/moderation/safe-search';
import {
  ownsMediaKey,
  privateBucket,
  validMediaKey,
  verifyPrivateMediaSignature,
} from '@/core/storage/private';

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  try {
    if (!validMediaKey(key))
      return new Response('MEDIA_NOT_FOUND', { status: 404, headers });
    if (!(await verifyPrivateMediaSignature(url))) {
      const session = await getAuth().api.getSession({
        headers: request.headers,
      });
      if (!session?.user)
        return new Response('UNAUTHORIZED', { status: 401, headers });
      if (!ownsMediaKey(key, session.user.id))
        return new Response('MEDIA_NOT_FOUND', { status: 404, headers });
    }
    let range:
      | { offset?: number; length?: number; suffix?: number }
      | undefined;
    const requestedRange = request.headers.get('range');
    if (requestedRange) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(requestedRange);
      if (!match || (!match[1] && !match[2]))
        return new Response('INVALID_RANGE', { status: 416, headers });
      const start = match[1] ? Number(match[1]) : undefined;
      const end = match[2] ? Number(match[2]) : undefined;
      if (
        (start !== undefined && !Number.isSafeInteger(start)) ||
        (end !== undefined && !Number.isSafeInteger(end)) ||
        (start !== undefined && end !== undefined && end < start) ||
        (start === undefined && end === 0)
      )
        return new Response('INVALID_RANGE', { status: 416, headers });
      const metadata = await privateBucket().head(key);
      if (!metadata)
        return new Response('MEDIA_NOT_FOUND', { status: 404, headers });
      if (start !== undefined && start >= metadata.size)
        return new Response('INVALID_RANGE', {
          status: 416,
          headers: { ...headers, 'Content-Range': `bytes */${metadata.size}` },
        });
      range =
        start === undefined
          ? { suffix: Math.min(end!, metadata.size) }
          : {
              offset: start,
              ...(end !== undefined
                ? { length: Math.min(end - start + 1, metadata.size - start) }
                : {}),
            };
    }
    const object = await privateBucket().get(
      key,
      range ? { range } : undefined
    );
    if (!object)
      return new Response('MEDIA_NOT_FOUND', { status: 404, headers });
    const resultHeaders = new Headers(headers);
    resultHeaders.set(
      'Content-Type',
      object.httpMetadata?.contentType || 'application/octet-stream'
    );
    resultHeaders.set('Accept-Ranges', 'bytes');
    if (requestedRange && object.range) {
      const { offset, length } = object.range;
      resultHeaders.set(
        'Content-Range',
        `bytes ${offset}-${offset + length - 1}/${object.size}`
      );
      resultHeaders.set('Content-Length', String(length));
    } else resultHeaders.set('Content-Length', String(object.size));
    return new Response(object.body, {
      status: requestedRange && object.range ? 206 : 200,
      headers: resultHeaders,
    });
  } catch (e) {
    const error =
      e instanceof MediaPolicyError
        ? e
        : new MediaPolicyError('PRIVATE_MEDIA_UNAVAILABLE', 503);
    return new Response(error.code, { status: error.status, headers });
  }
}
export async function HEAD(args: { request: Request }) {
  const response = await GET(args);
  await response.body?.cancel();
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
export const Route = createFileRoute('/api/storage/private')({
  server: { handlers: { GET, HEAD } },
});
