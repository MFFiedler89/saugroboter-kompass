import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewedFloorCare } from '../src/lib/floor-care.mjs';
import { situations } from '../src/lib/situation-rules.mjs';
import { selectSituation } from '../src/lib/situation-selection.mjs';

const product = (asin, title, extra = {}) => ({ asin, title, specs: { teppich: true }, ...extra });
const pro = product('B0GHN3V6BP', 'roborock Qrevo S Pro Set Saugroboter mit Wischfunktion Schwarz');
const white = product('B0GHMV8ML5', 'roborock Qrevo S Pro Set Saugroboter mit Wischfunktion Weiß');
const q10 = product('B0DSZJKXBC', 'roborock Q10 S5-Set Saugroboter mit Wischfunktion');

test('floor evidence requires both reviewed offer and exact model, never a neighbour or accessory', () => {
 assert.equal(reviewedFloorCare(pro)?.id, 'qrevo-s-pro');
 assert.equal(reviewedFloorCare(q10)?.id, 'q10-s5');
 assert.equal(reviewedFloorCare({ ...pro, asin: 'UNKNOWN' }), null);
 for (const title of ['roborock Qrevo Pro', 'roborock Qrevo S Pro Ultra', 'roborock Qrevo S Pro Ersatz-Wischtücher']) {
  assert.equal(reviewedFloorCare({ ...pro, title }), null);
 }
 assert.equal(reviewedFloorCare({ ...q10, title: 'roborock Q10 S5+ Saugroboter' }), null);
});

test('carpet detection alone cannot enter the floor shortlist, even as a fallback', () => {
 const unknown = product('UNKNOWN', 'Saugroboter mit Teppicherkennung und App');
 const selected = selectSituation(situations['parkett-und-laminat'], () => [unknown], ['saugroboter-mit-wischfunktion']);
 assert.deepEqual(selected, []);
});

test('floor shortlist keeps different reviewed models and collapses colour variants', () => {
 const selected = selectSituation(situations['parkett-und-laminat'], () => [pro, white, q10]);
 assert.deepEqual(selected.map(row => row.product.asin), [pro.asin, q10.asin]);
 const withoutStock = selectSituation(situations['parkett-und-laminat'], () => [{ ...pro, availability: 'OUT_OF_STOCK' }, q10]);
 assert.deepEqual(withoutStock.map(row => row.product.asin), [q10.asin]);
});

test('the floor-specific fallback restriction does not change other situation defaults', () => {
 const config = { rules: [{ sub: 'primary', match: () => false } ] };
 assert.equal(selectSituation(config, () => [pro], ['secondary']).length, 1);
 assert.equal(selectSituation(config, () => [pro], ['secondary'])[0].verified, false);
});
