import test from 'node:test';
import assert from 'node:assert/strict';
import { nextScheduledCheck, dealRefreshState, mountDealRefresh } from '../src/lib/deal-refresh.mjs';
const at = Date.parse;
test('uses real six-hour UTC schedule, including manual refreshes and day rollover', () => {
  assert.equal(nextScheduledCheck('2026-10-17T06:20:00Z'), at('2026-10-17T12:17:00Z'));
  assert.equal(nextScheduledCheck('2026-10-17T05:00:00Z'), at('2026-10-17T06:17:00Z'));
  assert.equal(nextScheduledCheck('2026-10-17T23:58:00Z'), at('2026-10-18T00:17:00Z'));
  assert.equal(nextScheduledCheck('2026-10-17T06:40:00Z', 37), at('2026-10-17T12:37:00Z'));
});
test('does not change schedule when German daylight saving time ends', () => {
  assert.equal(nextScheduledCheck('2026-10-25T00:18:00Z'), at('2026-10-25T06:17:00Z'));
});
test('counts down in minutes and never resets a missed check', () => {
  assert.equal(dealRefreshState('2026-10-17T06:20:00Z',17,24,at('2026-10-17T10:17:00Z')).label,'Prüfung in 02:00');
  assert.equal(dealRefreshState('2026-10-17T06:20:00Z',17,24,at('2026-10-17T12:17:00Z')).label,'Prüfung fällig');
  assert.equal(dealRefreshState('2026-10-17T06:20:00Z',17,24,at('2026-10-17T18:18:00Z')).label,'Prüfung fällig');
  assert.equal(dealRefreshState('2026-10-17T12:20:00Z',17,24,at('2026-10-17T12:21:00Z')).state,'scheduled');
});
test('missing, future and stale data never promise current deals', () => {
  for(const stamp of [null,'invalid','2026-10-18T06:00:00Z','2026-10-16T06:00:00Z']) {
    assert.equal(dealRefreshState(stamp,17,24,at('2026-10-17T06:00:00Z')).label,'Stand prüfen');
  }
  assert.equal(dealRefreshState('2026-10-16T07:00:00Z',37,23,at('2026-10-17T06:00:00Z')).state,'unknown');
});

test('new server snapshot prompts navigation without resetting an old page countdown', async () => {
  const originals = { document: globalThis.document, fetch: globalThis.fetch, setInterval: globalThis.setInterval };
  const label = { textContent: '' };
  const oldStamp = new Date(Date.now() - 7 * 3600000).toISOString();
  const newStamp = new Date(Date.now() - 60000).toISOString();
  const link = { dataset: { updated: oldStamp, minute: '17', maxAge: '24' }, querySelector: () => label };
  try {
    globalThis.document = { visibilityState: 'visible', addEventListener() {} };
    globalThis.setInterval = () => 0;
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ updatedAt: newStamp }) });
    mountDealRefresh([link]);
    assert.equal(label.textContent, 'Prüfung fällig');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(label.textContent, 'Neu geprüft');
    assert.equal(link.dataset.updated, oldStamp);
    assert.equal(link.dataset.newSnapshot, newStamp);
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
