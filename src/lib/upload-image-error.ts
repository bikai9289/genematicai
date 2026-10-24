import { m } from '@/paraglide/messages.js';

/** Map upload-image API error messages to localized UI copy. */
export function resolveUploadImageErrorMessage(
  message?: string | null
): string {
  if (!message) return m['stp.common.image_upload_failed']();
  if (message.includes('MEDIA_CONTENT_REJECTED'))
    return m['media.error.rejected']();
  if (message.includes('MEDIA_REUPLOAD_REQUIRED'))
    return m['media.error.reupload']();
  if (
    /MEDIA_SCREENING|PRIVATE_STORAGE|PRIVATE_MEDIA|MEDIA_UPLOAD_UNAVAILABLE/.test(
      message
    )
  )
    return m['media.error.unavailable']();
  if (/MEDIA_IMAGE_FORMAT|MEDIA_INVALID_IMAGE|MEDIA_ANIMATED/.test(message))
    return m['media.error.format']();
  if (/MEDIA_FILE_TOO_LARGE/.test(message))
    return m['stp.common.image_size_limit_exceeded']();
  if (/image too large/i.test(message)) {
    return m['stp.common.image_size_limit_exceeded']();
  }
  return message;
}

export function isUploadUnauthorized(
  message?: string | null,
  status?: number
): boolean {
  return status === 401 || message === 'Unauthorized';
}
