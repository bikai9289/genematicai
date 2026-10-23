import { describe, expect, it } from 'vitest';

import { hasReferenceConsent } from './media-consent';

describe('reference media consent', () => {
  it('allows text-only generation without a media declaration', () => {
    expect(hasReferenceConsent([], undefined)).toBe(true);
  });
  it('requires an explicit boolean declaration for reference media', () => {
    for (const consent of [undefined, false, 'true', 1]) {
      expect(
        hasReferenceConsent(['https://example.com/photo.png'], consent)
      ).toBe(false);
    }
  });
  it('accepts the declaration without treating it as proof of ownership', () => {
    expect(hasReferenceConsent(['https://example.com/photo.png'], true)).toBe(
      true
    );
  });
});
