import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectDeals, isCurrentOffer, isFreshSnapshot } from '../src/lib/deals.mjs';
import { normalize } from '../scripts/amazon.mjs';

const now = Date.parse('2026-10-09T12:00:00Z');
const fresh = '2026-10-09T10:00:00Z';
const product = (asin, extra = {}) => ({
  asin, amount: 100, display: '100,00 €', savingsPercent: 20, availability: 'IN_STOCK', ...extra,
});

test('only available products with a positive, valid Amazon reduction are deals', () => {
  const offers = [
    product('valid'), product('scarce', { availability: 'IN_STOCK_SCARCE' }),
    product('without-underscores', { availability: 'INSTOCK' }),
    ...[undefined, 0, -5, NaN, Infinity, 100, '25'].map((value, i) => product('invalid-discount-' + i, { savingsPercent: value })),
    ...['OUT_OF_STOCK', 'PREORDER', 'UNKNOWN', undefined].map((availability, i) => product('unavailable-' + i, { availability })),
    product('no-price', { amount: null }), product('nan-price', { amount: NaN }), product('free', { amount: 0 }),
    product('no-display', { display: null }),
  ];
  assert.deepEqual(selectDeals(offers, fresh, 24, now).map((p) => p.asin).sort(), ['scarce', 'valid', 'without-underscores']);
});

test('data without a valid current snapshot must not produce deals', () => {
  for (const stamp of [null, 'invalid', '2026-10-08T12:00:00Z', '2026-10-09T12:01:00Z']) {
    assert.equal(selectDeals([product('a')], stamp, 24, now).length, 0);
  }
  assert.equal(isFreshSnapshot('2026-10-08T12:00:01Z', 24, now), true);
});

test('expired, future and malformed timed offers are excluded', () => {
  for (const deal of [
    { endTime: '2026-10-09T12:00:00Z' }, { startTime: '2026-10-09T13:00:00Z' },
    { endTime: 'invalid' }, { startTime: 'invalid' },
  ]) assert.equal(isCurrentOffer(product('a', { deal }), now), false);
  assert.equal(isCurrentOffer(product('a', { deal: { startTime: fresh, endTime: '2026-10-09T13:00:00Z' } }), now), true);
});

test('duplicates across comparison lists appear once and sort by discount then price', () => {
  const input = [product('a'), product('a'), product('b', { savingsPercent: 40 }),
    product('c', { savingsPercent: 40, amount: 50 })];
  assert.deepEqual(selectDeals(input, fresh, 24, now).map((p) => p.asin), ['c', 'b', 'a']);
  assert.equal(input.length, 4);
});

test('normalization uses the buy-box offer and preserves actual deal restrictions and reference price', () => {
  const output = normalize({ offersV2: { listings: [
    { price: { money: { amount: 1 }, savings: { percentage: 99 } } },
    { isBuyBoxWinner: true, availability: { type: 'IN_STOCK' },
      price: { money: { amount: 80, currency: 'EUR' }, savings: { percentage: 20 },
        savingBasis: { money: { amount: 100 }, savingBasisTypeLabel: 'UVP' } },
      dealDetails: { startTime: fresh, endTime: '2026-10-09T13:00:00Z', accessType: 'PRIME_EXCLUSIVE' } },
  ] } });
  assert.equal(output.amount, 80);
  assert.equal(output.savingsPercent, 20);
  assert.equal(output.referencePrice, 100);
  assert.equal(output.referencePriceLabel, 'UVP');
  assert.equal(output.deal.accessType, 'PRIME_EXCLUSIVE');
  assert.equal(output.deal.endTime, '2026-10-09T13:00:00Z');
});

test('ordinary discounts have no invented timed deal details or reference price', () => {
  const output = normalize({ offersV2: { listings: [{ price: { money: { amount: 80, currency: 'EUR' }, savings: { percentage: 20 } } }] } });
  assert.equal(output.deal, undefined);
  assert.equal(output.referencePrice, undefined);
});


test('Prime early access starts before the general deal start', () => {
  const deal = { startTime: '2026-10-09T12:15:00Z', endTime: '2026-10-09T13:00:00Z', accessType: 'PRIME_EARLY_ACCESS', earlyAccessDurationInMilliseconds: 1800000 };
  assert.equal(isCurrentOffer(product('a', { deal }), now), true);
  assert.equal(isCurrentOffer(product('a', { deal: { ...deal, accessType: 'ALL' } }), now), false);
});
