import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateCredits } from '../src/components/sites/shared/models';
import {
  getPricingProduct,
  isPricingProductForSale,
} from '../src/config/pricing';

test('launch packs have independent IDs and preserve legacy purchases', () => {
  for (const [id, price, credits] of [
    ['starter', 999, 400],
    ['creator', 2499, 1100],
    ['studio', 4999, 2300],
  ] as const) {
    const product = getPricingProduct(`genematic_${id}_v2`)!;
    assert.equal(product.priceInCents, price);
    assert.equal(product.credits, credits);
    assert.equal(product.creditsValidDays, 365);
    assert.equal(product.currency, 'usd');
    assert.equal(isPricingProductForSale(product.productId), true);
  }
  assert.equal(getPricingProduct('nanobanana_joyflix_standard')?.credits, 2500);
  assert.equal(isPricingProductForSale('nanobanana_joyflix_standard'), false);
  assert.equal(
    getPricingProduct('nanobanana_joyflix_starter')?.creditsValidDays,
    30
  );
});

test('Seedance prices scale with actual resolution and duration costs', async () => {
  const cases = [
    ['480p', 5, 140],
    ['720p', 5, 300],
    ['1080p', 5, 750],
    ['480p', 10, 280],
    ['720p', 10, 600],
    ['1080p', 10, 1500],
  ] as const;
  await Promise.all(
    cases.map(async ([resolution, duration, expected]) => {
      assert.equal(
        calculateCredits('seedance-2-5', 'video', {
          resolution,
          duration: `${duration}s`,
        }),
        expected
      );
    })
  );
  assert.equal(
    calculateCredits('nano-banana-pro', 'image', { resolution: '1K' }),
    18
  );
  assert.equal(
    calculateCredits('nano-banana-pro', 'image', { resolution: '2K' }),
    18
  );
  assert.equal(
    calculateCredits('nano-banana-pro', 'image', { resolution: '4K' }),
    24
  );
});
