import { MediaPolicyError } from '@/core/moderation/safe-search';
import { envConfigs } from '@/config';
import { getUuid, md5 } from '@/lib/hash';

const PATH = '/api/storage/private';
const TTL = 60 * 60;
type PrivateObject = {
  body: ReadableStream;
  customMetadata?: Record<string, string>;
  httpMetadata?: { contentType?: string };
  size: number;
  range?: { offset: number; length: number };
};
export interface PrivateBucket {
  put(
    key: string,
    body: Uint8Array | ReadableStream,
    options: any
  ): Promise<unknown>;
  get(key: string, options?: any): Promise<PrivateObject | null>;
  head(key: string): Promise<Omit<PrivateObject, 'body'> | null>;
  delete(key: string): Promise<void>;
}
export function privateBucket(): PrivateBucket {
  const bucket = (globalThis as any).__CF_ENV__?.PRIVATE_MEDIA;
  if (!bucket)
    throw new MediaPolicyError('PRIVATE_STORAGE_NOT_CONFIGURED', 503);
  return bucket;
}
export function hasPrivateBucket(): boolean {
  return Boolean((globalThis as any).__CF_ENV__?.PRIVATE_MEDIA);
}
export function mediaKey(
  userId: string,
  extension: string,
  kind: 'input' | 'output' = 'input'
) {
  if (!/^[a-z0-9]{2,5}$/.test(extension))
    throw new MediaPolicyError('MEDIA_INVALID_KEY');
  return `users/${md5(userId)}/${kind}/${getUuid()}.${extension}`;
}
export function ownsMediaKey(key: string, userId: string) {
  return validMediaKey(key) && key.startsWith(`users/${md5(userId)}/`);
}
export function validMediaKey(key: string) {
  return /^users\/[a-f0-9]{32}\/(input|output)\/[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(
    key
  );
}
export function privateMediaUrl(key: string) {
  const url = new URL(PATH, envConfigs.app_url);
  url.searchParams.set('key', key);
  return url.href;
}
function signingSecret() {
  const secret =
    (globalThis as any).__CF_ENV__?.AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    envConfigs.auth_secret;
  if (!secret)
    throw new MediaPolicyError('PRIVATE_MEDIA_SIGNING_NOT_CONFIGURED', 503);
  return secret;
}
async function signingKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}
const payload = (key: string, expires: number) =>
  new TextEncoder().encode(`private-media-read-v1\n${key}\n${expires}`);
export async function signPrivateMediaUrl(key: string) {
  if (!validMediaKey(key)) throw new MediaPolicyError('MEDIA_INVALID_KEY');
  const expires = Math.floor(Date.now() / 1000) + TTL;
  const signature = Buffer.from(
    await crypto.subtle.sign('HMAC', await signingKey(), payload(key, expires))
  ).toString('hex');
  const url = new URL(privateMediaUrl(key));
  url.searchParams.set('expires', String(expires));
  url.searchParams.set('signature', signature);
  return url.href;
}
export async function verifyPrivateMediaSignature(url: URL) {
  const key = url.searchParams.get('key') || '';
  const expires = Number(url.searchParams.get('expires'));
  const signature = url.searchParams.get('signature') || '';
  const now = Math.floor(Date.now() / 1000);
  if (
    !validMediaKey(key) ||
    !Number.isSafeInteger(expires) ||
    expires <= now ||
    expires > now + TTL ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return false;
  return crypto.subtle.verify(
    'HMAC',
    await signingKey(),
    Buffer.from(signature, 'hex'),
    payload(key, expires)
  );
}
export async function authorizeReference(urlString: string, userId: string) {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new MediaPolicyError('MEDIA_REUPLOAD_REQUIRED');
  }
  if (
    url.origin !== new URL(envConfigs.app_url).origin ||
    url.pathname !== PATH
  )
    throw new MediaPolicyError('MEDIA_REUPLOAD_REQUIRED');
  const key = url.searchParams.get('key') || '';
  if (!ownsMediaKey(key, userId))
    throw new MediaPolicyError('MEDIA_NOT_FOUND', 404);
  const object = await privateBucket().head(key);
  if (!object || object.customMetadata?.owner !== md5(userId))
    throw new MediaPolicyError('MEDIA_NOT_FOUND', 404);
  if (object.customMetadata?.moderation !== 'safe-search-passed')
    throw new MediaPolicyError('MEDIA_REUPLOAD_REQUIRED');
  return signPrivateMediaUrl(key);
}
