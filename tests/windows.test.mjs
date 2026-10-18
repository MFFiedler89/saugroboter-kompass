import test from 'node:test';
import assert from 'node:assert/strict';
import { windowModels, reviewedWindow } from '../src/lib/windows.mjs';
test('reviewed identity never transfers between Mini generations or W2 variants', () => {
 assert.ok(reviewedWindow('B0DQ8QPG2Z', 'ECOVACS WINBOT Mini Fensterputzroboter Grau'));
 assert.equal(reviewedWindow('B0DQ8QPG2Z', 'ECOVACS WINBOT Mini 2 Fensterputzroboter'), null);
 assert.equal(reviewedWindow('B0DQ8PCY2V', 'ECOVACS WINBOT W2 PRO OMNI Fensterputzroboter'), null);
 assert.equal(reviewedWindow('B0DQ8V4R88', 'ECOVACS WINBOT W2S PRO OMNI Fensterputzroboter'), null);
 assert.equal(reviewedWindow('UNREVIEWED', 'ECOVACS WINBOT Mini'), null);
});
test('accessories and cleaning fluid never inherit device specifications', () => {
 for (const title of ['ECOVACS WINBOT MINI Reinigungstuch', 'ECOVACS WINBOT MINI Reinigungslösung', 'ECOVACS WINBOT MINI Aufbewahrungsbox']) assert.equal(reviewedWindow('B0DQ8QPG2Z', title), null);
});
test('notfall battery cannot imply cordless operation and enclosure height is explicit', () => {
 assert.equal(windowModels.B0DQ8QPG2Z.specs.betrieb, 'Netzkabel');
 assert.equal(windowModels.B0DQ8PCY2V.specs.betrieb, 'Netzkabel');
 assert.equal(windowModels.B0DQ8QPG2Z.specs.hoehe, 55);
 assert.match(windowModels.B0DQ8QPG2Z.limit, /keine Rollladen-Freigabe/);
 for(const model of Object.values(windowModels)) {assert.ok(model.manual.endsWith('UserManual_DE.pdf'));assert.ok(model.source.startsWith('https://www.ecovacs.com/'));}
});
