// Meldet nach jedem Build alle Seiten per IndexNow an Bing, Yandex, Seznam und
// Naver. Das ist der schnellste Weg, damit neue und geaenderte Seiten gefunden
// werden, ohne auf den naechsten Crawl zu warten.
//
// Der Schluessel liegt zusaetzlich als public/<schluessel>.txt im Projekt.
// Nur so akzeptiert IndexNow die Meldung (Besitznachweis ueber die Domain).
//
// Laeuft automatisch im Build. Bei Fehlern wird nur gewarnt, nie abgebrochen.
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const KEY = process.env.INDEXNOW_KEY || '7c41b0ea52d04f1c9a3e6b8d25f70913';
const HOST = new URL(process.env.SITE_URL || 'https://saugradar.de').host;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const MAX = 10000; // Grenze laut Protokoll

function urls() {
  const out = new Set();
  const files = existsSync('dist') ? readdirSync('dist').filter((f) => /^sitemap-\d+\.xml$/.test(f)) : [];
  for (const f of files) {
    const xml = readFileSync(`dist/${f}`, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = m[1].trim();
      if (u.startsWith(`https://${HOST}/`) && !u.endsWith('.xml')) out.add(u);
    }
  }
  return [...out].slice(0, MAX);
}

if (!existsSync(`public/${KEY}.txt`)) {
  console.warn(`⚠️  IndexNow uebersprungen: public/${KEY}.txt fehlt.`);
} else {
  const list = urls();
  if (!list.length) {
    console.warn('⚠️  IndexNow uebersprungen: keine Sitemap im dist-Ordner gefunden.');
  } else {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: list }),
      });
      // 200 und 202 sind beide in Ordnung, 202 heisst „angenommen, Schluessel wird geprueft“.
      if (res.ok) console.log(`✓ IndexNow: ${list.length} Adressen gemeldet (${res.status})`);
      else console.warn(`⚠️  IndexNow antwortete mit ${res.status}: ${(await res.text()).slice(0, 200)}`);
    } catch (e) {
      console.warn(`⚠️  IndexNow nicht erreichbar: ${e.message}`);
    }
  }
}
