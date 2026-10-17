import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewedUpholstery, upholsterySpecs, upholstery } from '../src/lib/upholstery.mjs';
import { formatSpec } from '../src/lib/extract.mjs';

test('only the reviewed ASIN and matching model can enter the new comparison', () => {
  assert.ok(reviewedUpholstery('B0DBLD211L', 'KÄRCHER Waschsauger SE 3 Compact, Weiß'));
  assert.equal(reviewedUpholstery('UNREVIEWED', 'Kärcher SE 3 Compact'), null);
  assert.equal(reviewedUpholstery('B0DBLD211L', 'Kärcher SE 3-18 Compact'), null);
  assert.equal(reviewedUpholstery('B0DBLD211L', 'Kärcher SE 3 Compact Home Shoe'), null);
  assert.equal(reviewedUpholstery('B0FYQQWB6L', 'BISSELL SpotClean Mini Cordless 4103N'), null);
  assert.equal(reviewedUpholstery('B084PSXMQM', 'BISSELL SpotClean HydroSteam 3689N'), null);
});
test('millilitre tanks convert correctly and never use a cleaning fluid sample', () => {
  const text = 'BISSELL SpotClean Mini mit Kabel 4103N';
  const s = upholsterySpecs('B0FYQQWB6L', text, ['500 ml Frischwassertank und 430 ml Schmutzwassertank', 'Reinigungslösung 236 ml', '1,3 m langen Schlauch']);
  assert.equal(s.frischwasser, 0.5);
  assert.equal(s.schmutzwasser, 0.43);
  assert.equal(formatSpec({ key: 'schmutzwasser', type: 'number', unit: 'l', precision: 2 }, s.schmutzwasser), '0,43 l');
  assert.equal(s.schlauch, 1.3);
  assert.equal(upholsterySpecs('B0FYQQWB6L', text, ['Reinigungslösung 236 ml']).frischwasser, null);
  assert.equal(s.gewicht, null);
});
test('reviewed specifications distinguish empty tanks and do not invent accessory weight', () => {
  const s = upholsterySpecs('B0FPGHCD96', 'Kärcher Waschsauger SE 2 Spot Care');
  assert.equal(s.frischwasser, 1.5);
  assert.equal(s.schmutzwasser, 0.8);
  assert.equal(s.gewicht, 4);
  assert.equal(s.schlauch, 1.8);
  assert.equal(upholsterySpecs('UNKNOWN', 'Unknown device'), null);
});
test('every approved model has its own manufacturer source and limits', () => {
  assert.equal(Object.keys(upholstery).length, 5);
  for (const model of Object.values(upholstery)) {
    assert.match(model.source, /^https:\/\/(?:www\.|support\.)?(?:kaercher|karcher|bissell)\.com|^https:\/\/(?:www\.|support\.)?bissell\.de/);
    assert.ok(model.reason && model.limit);
  }
});
