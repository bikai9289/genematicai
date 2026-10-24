import { describe, expect, it } from 'vitest';

import { renewalOrderIdFor } from './service';

// Fulfillment concurrency, repair and rollback use real databases in tests/atomic.test.ts and tests/payment-idempotency.test.ts.
describe('renewalOrderIdFor', () => {
  const base = {
    provider: 'stripe',
    subscriptionNo: 'sub_1',
    currentPeriodStart: new Date('2026-11-01T00:00:00Z'),
  };

  it('uses the transaction id when present', () => {
    const a = renewalOrderIdFor({ ...base, transactionId: 'in_1' });
    const b = renewalOrderIdFor({
      ...base,
      transactionId: 'in_1',
      currentPeriodStart: new Date('2026-12-01T00:00:00Z'),
    });
    expect(a).toBe(b);
    expect(a).not.toBe(renewalOrderIdFor({ ...base, transactionId: 'in_2' }));
  });

  it('without a transaction id, redeliveries of one period share a key', () => {
    const a = renewalOrderIdFor(base);
    const b = renewalOrderIdFor({
      ...base,
      transactionId: null,
      currentPeriodStart: '2026-11-01T00:00:00.000Z',
    });
    expect(a).toBe(b);
  });

  it('without a transaction id, different periods or subscriptions differ', () => {
    const a = renewalOrderIdFor(base);
    expect(
      renewalOrderIdFor({
        ...base,
        currentPeriodStart: new Date('2026-12-01T00:00:00Z'),
      })
    ).not.toBe(a);
    expect(renewalOrderIdFor({ ...base, subscriptionNo: 'sub_2' })).not.toBe(a);
    expect(renewalOrderIdFor({ ...base, provider: 'creem' })).not.toBe(a);
  });
});
