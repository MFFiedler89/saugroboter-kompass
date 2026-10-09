/** Available Amazon offers with a reported saving, deduplicated across comparisons. */
export function isCurrentOffer(product, now) {
  const availability = (product.availability || '').replaceAll('_', '');
  if (!['INSTOCK', 'INSTOCKSCARCE'].includes(availability)) return false;
  if (!Number.isFinite(product.amount) || product.amount <= 0 || !product.display) return false;
  if (!Number.isFinite(product.savingsPercent) || product.savingsPercent <= 0 || product.savingsPercent >= 100) return false;
  const deal = product.deal;
  if (deal?.startTime) {
    const earlyAccess = deal.accessType?.replaceAll('_', '') === 'PRIMEEARLYACCESS';
    const earlyDuration = earlyAccess && Number.isFinite(deal.earlyAccessDurationInMilliseconds)
      ? Math.max(0, deal.earlyAccessDurationInMilliseconds) : 0;
    if (!(Date.parse(deal.startTime) - earlyDuration <= now)) return false;
  }
  if (deal?.endTime && !(Date.parse(deal.endTime) > now)) return false;
  return true;
}

export function isFreshSnapshot(updatedAt, maxAgeHours, now) {
  const timestamp = Date.parse(updatedAt || '');
  return Number.isFinite(timestamp) && timestamp <= now && now - timestamp < maxAgeHours * 3600000;
}

export function selectDeals(products, updatedAt, maxAgeHours, now = Date.now()) {
  if (!isFreshSnapshot(updatedAt, maxAgeHours, now)) return [];
  const unique = new Map();
  for (const product of products) {
    if (isCurrentOffer(product, now) && !unique.has(product.asin)) unique.set(product.asin, product);
  }
  return [...unique.values()].sort((a, b) =>
    b.savingsPercent - a.savingsPercent || a.amount - b.amount || a.asin.localeCompare(b.asin));
}

