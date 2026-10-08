// Erzeugt BEISPIELDATEN für die lokale Vorschau (npm run demo).
// Diese Daten werden NIE veröffentlicht, der Live-Build nutzt nur echte Amazon-Daten.

import { writeFileSync, mkdirSync } from 'node:fs';
import { subs } from '../src/data/taxonomy.mjs';

let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const int = (a, b) => Math.round(a + rnd() * (b - a));

// erste Alternative eines Regex als Beispieltext
const sample = (re) => re.source.split('|')[0].replace(/\\b|\\s\*|\\s|[()?^$\\[\]{}+*.]|\d,\d/g, ' ').replace(/\s+/g, ' ').trim();

const special = {
  saugkraft: () => `${pick([6000, 8000, 12000, 18500, 22000, 25000])} Pa`,
  bauhoehe: () => `nur ${int(75, 98) / 10} cm flach`.replace('.', ','),
  schwelle: () => `überwindet Schwellen bis ${int(15, 25) / 10} cm`.replace('.', ','),
  laufzeit: () => `bis zu ${pick([120, 150, 180, 240, 300])} Minuten Laufzeit`,
  staubbehaelter: () => `${pick([300, 350, 400, 500])} ml Staubbehälter`,
};

function phrase(d) {
  if (special[d.key]) return special[d.key](d);
  switch (d.type) {
    case 'bool': return rnd() < 0.6 ? sample(d.re) : '';
    case 'enum': return rnd() < 0.85 ? sample(pick(d.options).re) : '';
    case 'number': {
      const v = int(d.min ?? 10, Math.min(d.max ?? 100, (d.min ?? 10) * 3));
      return `${v} ${d.unit ?? ''}`;
    }
    case 'range': {
      const lo = d.min ?? 10, hi = d.max ?? 100;
      const a = int(lo, lo + (hi - lo) * 0.3), b = int(lo + (hi - lo) * 0.6, hi);
      return `${a}-${b} ${d.unit}`;
    }
    case 'dims': return `${int(d.aMin, d.aMax)} x ${int(d.bMin, d.bMax)} cm`;
  }
  return '';
}

mkdirSync('src/data/demo/asins', { recursive: true });
const items = {};
let n = 0;
for (const s of subs) {
  const asins = [];
  const count = int(8, 14);
  for (let i = 0; i < count; i++) {
    const asin = `DEMO${String(++n).padStart(6, '0')}`;
    const parts = s.specs.map(phrase).filter(Boolean);
    const brand = `Beispielmarke ${'ABCDEFGH'[int(0, 7)]}`;
    const title = `${brand} ${s.singular} – ${parts.slice(0, 3).join(', ')}`;
    const amount = Math.round((s.discover.price[0] + rnd() ** 1.6 * (s.discover.price[1] - s.discover.price[0]) * 0.6) * 100) / 100 - 0.01;
    items[asin] = {
      title,
      brand,
      features: parts.slice(3),
      amount,
      display: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount),
      savingsPercent: rnd() < 0.25 ? int(5, 25) : undefined,
      availability: 'IN_STOCK',
      url: `https://www.amazon.de/s?k=${encodeURIComponent(s.label)}`,
      salesRank: int(100, 90000),
    };
    asins.push(asin);
  }
  writeFileSync(`src/data/demo/asins/${s.slug}.json`, JSON.stringify({ asins, hidden: [], picks: {} }, null, 2));
}
writeFileSync('src/data/demo/live.json', JSON.stringify({ updatedAt: new Date().toISOString(), demo: true, items }));
console.log(`Demo-Daten: ${n} Beispielprodukte in ${subs.length} Kategorien.`);
