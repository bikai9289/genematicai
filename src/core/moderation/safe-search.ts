/** SafeSearch screens explicit/violent images; it does not establish age or consent. */
export class MediaPolicyError extends Error {
  constructor(
    public code: string,
    public status = 400
  ) {
    super(code);
  }
}

const likelihoods = [
  'UNKNOWN',
  'VERY_UNLIKELY',
  'UNLIKELY',
  'POSSIBLE',
  'LIKELY',
  'VERY_LIKELY',
];

export function assertSafeSearchResult(annotation: unknown) {
  if (!annotation || typeof annotation !== 'object')
    throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
  const values = annotation as Record<string, unknown>;
  // Fail closed on missing/unknown adult or violence verdicts.
  for (const category of ['adult', 'violence']) {
    const rank = likelihoods.indexOf(String(values[category]));
    if (rank < 1)
      throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
    if (rank >= likelihoods.indexOf('LIKELY'))
      throw new MediaPolicyError('MEDIA_CONTENT_REJECTED', 422);
  }
}

export async function screenImage(body: Uint8Array, apiKey: string) {
  if (!apiKey)
    throw new MediaPolicyError('MEDIA_SCREENING_NOT_CONFIGURED', 503);
  let response: Response;
  try {
    response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
      body: JSON.stringify({
        requests: [
          {
            image: { content: Buffer.from(body).toString('base64') },
            features: [{ type: 'SAFE_SEARCH_DETECTION' }],
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
  }
  if (!response.ok)
    throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
  }
  if (result.responses?.length !== 1 || result.responses[0]?.error)
    throw new MediaPolicyError('MEDIA_SCREENING_UNAVAILABLE', 503);
  assertSafeSearchResult(result.responses[0].safeSearchAnnotation);
}

export function detectUploadImage(body: Uint8Array): {
  extension: string;
  contentType: string;
} {
  if (body.length < 12) throw new MediaPolicyError('MEDIA_INVALID_IMAGE');
  const view = Buffer.from(body);
  if (view[0] === 255 && view[1] === 216 && view[2] === 255)
    return { extension: 'jpg', contentType: 'image/jpeg' };
  if (
    view.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    for (let at = 8; at + 12 <= view.length; ) {
      const size = view.readUInt32BE(at);
      if (at + size + 12 > view.length)
        throw new MediaPolicyError('MEDIA_INVALID_IMAGE');
      if (view.toString('ascii', at + 4, at + 8) === 'acTL')
        throw new MediaPolicyError('MEDIA_ANIMATED_IMAGE_UNSUPPORTED');
      at += size + 12;
    }
    return { extension: 'png', contentType: 'image/png' };
  }
  if (
    view.toString('ascii', 0, 4) === 'RIFF' &&
    view.toString('ascii', 8, 12) === 'WEBP'
  ) {
    for (let at = 12; at + 8 <= view.length; ) {
      const size = view.readUInt32LE(at + 4);
      if (at + size + 8 > view.length)
        throw new MediaPolicyError('MEDIA_INVALID_IMAGE');
      const kind = view.toString('ascii', at, at + 4);
      if (
        kind === 'ANIM' ||
        kind === 'ANMF' ||
        (kind === 'VP8X' && view[at + 8] & 2)
      )
        throw new MediaPolicyError('MEDIA_ANIMATED_IMAGE_UNSUPPORTED');
      at += 8 + size + (size % 2);
    }
    return { extension: 'webp', contentType: 'image/webp' };
  }
  throw new MediaPolicyError('MEDIA_IMAGE_FORMAT_UNSUPPORTED');
}
