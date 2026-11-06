import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/_worker.js', import.meta.url), 'utf8');
const { default: worker, isFresh } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
test('API content expiry rejects missing, future and boundary timestamps', () => {
  const now = Date.parse('2026-11-06T12:00:00Z');
  for (const value of [null, '', 'bad', new Date(now + 1).toISOString(), new Date(now - 23 * 3600000).toISOString()]) assert.equal(isFresh(value, now), false);
  assert.equal(isFresh(new Date(now - 23 * 3600000 + 1).toISOString(), now), true);
});
test('HTML is guarded before delivery; static assets pass through', async () => {
  const original = globalThis.HTMLRewriter;
  let handler, selector;
  globalThis.HTMLRewriter = class {
    on(s, h) { selector = s; handler = h; return this; }
    transform(response) { return response; }
  };
  try {
    const response = await worker.fetch(new Request('https://example.test/'), {ASSETS:{fetch:async()=>new Response('<p>editorial</p>',{headers:{'content-type':'text/html'}})}});
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.match(selector, /data-amazon-updated/);
    assert.match(selector, /data-fetched-at/);
    for (const stamp of ['', 'bad', new Date(Date.now() - 24 * 3600000).toISOString(), new Date(Date.now() + 3600000).toISOString()]) {
      let removed = false;
      handler.element({getAttribute:()=>stamp,remove:()=>{removed=true}});
      assert.equal(removed,true);
    }
    let removed=false;
    handler.element({getAttribute:()=>new Date(Date.now()-1000).toISOString(),remove:()=>{removed=true}});
    assert.equal(removed,false);
    assert.equal(await response.text(),'<p>editorial</p>');
    const image=new Response('image',{headers:{'content-type':'image/png'}});
    assert.equal(await worker.fetch(new Request('https://example.test/logo.png'),{ASSETS:{fetch:async()=>image}}),image);
  } finally { globalThis.HTMLRewriter=original; }
});
