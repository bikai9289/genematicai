/** A user's declaration is required for reference media; it is not ownership verification. */
export function hasReferenceConsent(
  images: readonly string[],
  consent: unknown
): boolean {
  return images.length === 0 || consent === true;
}
