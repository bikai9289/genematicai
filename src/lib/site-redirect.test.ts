import { describe, expect, it } from 'vitest';

import { canonicalRedirect } from './site-redirect';

describe('canonical domain redirects', () => {
  const canonical = 'https://genematicai.com';
  it('preserves localized paths and query parameters on owned aliases', () => {
    for (const host of [
      'www.genematicai.com',
      'genematicai.bikai9289.workers.dev',
    ]) {
      expect(
        canonicalRedirect(`https://${host}/zh/pricing?plan=pro`, canonical)
      ).toBe('https://genematicai.com/zh/pricing?plan=pro');
    }
  });
  it('does not redirect production, local development, or unrelated hosts', () => {
    for (const host of [
      'genematicai.com',
      'localhost:3000',
      'other.workers.dev',
    ]) {
      expect(canonicalRedirect(`https://${host}/`, canonical)).toBeNull();
    }
  });
  it('does not redirect authentication or API writes away from their origin', () => {
    expect(
      canonicalRedirect(
        'https://genematicai.bikai9289.workers.dev/api/auth/get-session',
        canonical
      )
    ).toBeNull();
  });
});
