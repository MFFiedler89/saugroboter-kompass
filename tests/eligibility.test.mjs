import test from 'node:test';
import assert from 'node:assert/strict';
import { eligibility } from '../src/lib/eligibility.mjs';

test('camera absence cannot be inferred from navigation or omitted data', () => {
  for (const title of ['Roboter LiDAR', 'Roboter Gyroskop', 'Roboter', 'Roboter ohne RGB-Kamera', 'Roboter ohne Kameranavigation']) {
    assert.equal(eligibility('saugroboter-ohne-kamera', title), false, title);
  }
});
test('explicit camera absence is accepted only without conflicting evidence', () => {
  assert.equal(eligibility('saugroboter-ohne-kamera', 'Roboter ohne Kamera', ['LiDAR']), true);
  assert.equal(eligibility('saugroboter-ohne-kamera', 'Roboter', ['Keine Kamera verbaut']), true);
  for (const extra of ['mit RGB-Kamera', 'AIVI', 'Videoanruf', 'integrierte Kamera', 'Fernüberwachung']) {
    assert.equal(eligibility('saugroboter-ohne-kamera', 'Roboter ohne Kamera', [extra]), false, extra);
  }
  assert.equal(eligibility('saugroboter-ohne-kamera', 'Nicht ohne Kamera nutzbar'), false);
});
test('missing app or remote control is not offline evidence', () => {
  for (const title of ['Roboter Fernbedienung', 'Roboter LiDAR', 'Roboter ohne App', 'Roboter ohne WLAN', 'Roboter App optional']) {
    assert.equal(eligibility('saugroboter-ohne-app', title), false, title);
  }
});
test('offline evidence is accepted and contradictory live data is vetoed', () => {
  assert.equal(eligibility('saugroboter-ohne-app', 'Roboter ohne App und WLAN'), true);
  assert.equal(eligibility('saugroboter-ohne-app', 'Roboter ohne WLAN und ohne App'), true);
  assert.equal(eligibility('saugroboter-ohne-app', 'Roboter ohne App und WLAN', ['WLAN App-Steuerung']), false);
  assert.equal(eligibility('saugroboter-ohne-app', 'Nicht ohne App und WLAN bedienbar'), false);
  assert.equal(eligibility('saugroboter-ohne-app', 'Nicht ohne WLAN und App bedienbar'), false);
});
test('manufacturer-backed exact eufy models do not admit other variants', () => {
  assert.equal(eligibility('saugroboter-ohne-app', 'eufy RoboVac 11S MAX'), true);
  assert.equal(eligibility('saugroboter-ohne-app', 'eufy RoboVac 11S'), true);
  for (const title of ['eufy RoboVac 11C', 'eufy RoboVac 11S Hybrid', 'eufy RoboVac 11S Pro', 'eufy G30', 'AndereMarke 11S']) {
    assert.equal(eligibility('saugroboter-ohne-app', title), false, title);
  }
  assert.equal(eligibility('saugroboter-ohne-app', 'eufy RoboVac 11S MAX', ['WLAN']), false);
});
test('other comparisons retain their catalogue', () => {
  assert.equal(eligibility('saugroboter-mit-absaugstation', 'LiDAR mit RGB-Kamera und WLAN'), true);
});
test('vacuum-only selection requires proof and excludes combination cleaners', () => {
  for (const title of ['Roboter', 'ECOVACS DEEBOT T50 Omni Gen3', 'dreame D20 Pro Plus', 'XIAOMI H40']) {
    assert.equal(eligibility('saugroboter-ohne-wischfunktion', title), false, title);
  }
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'Roboter ohne Wischfunktion'), true);
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'Roboter ohne Wischfunktion', ['Wassertank']), false);
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'Nicht ohne Wischfunktion nutzbar'), false);
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'eufy Anker Saugroboter C10 mit automatischer Entleerung'), true);
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'eufy C10 Hybrid'), false);
  assert.equal(eligibility('saugroboter-ohne-wischfunktion', 'eufy C10', ['mit Wischfunktion']), false);
});
