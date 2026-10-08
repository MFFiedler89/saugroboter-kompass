// Holt bei JEDEM Build frische Daten (Titel, Marke, Merkmale, Bild, Preis, Beliebtheit)
// für alle ASINs aus src/data/asins/*.json und schreibt src/data/live.json.
// So ist keine Amazon-Information älter als der letzte Build (Amazon-Vorgabe: max. 24 h).
//
// Bei Fehlern bleibt eine vorhandene live.json erhalten; der Build läuft weiter.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { getItems, normalize } from './amazon.mjs';

const DIR = 'src/data/asins';
const OUT = 'src/data/live.json';

mkdirSync(DIR, { recursive: true });

const asins = new Set();
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
  const hidden = new Set(d.hidden ?? []);
  for (const a of d.asins ?? []) if (!hidden.has(a)) asins.add(a);
}

if (!asins.size) {
  console.log('ℹ️  Noch keine ASINs – zuerst den Workflow „Produkte finden“ (npm run discover) laufen lassen.');
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify({ updatedAt: null, items: {} }));
  process.exit(0);
}

try {
  const { items, errors } = await getItems([...asins]);
  const map = {};
  for (const it of items) map[it.asin ?? it.ASIN] = normalize(it);
  writeFileSync(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items: map }) + '\n');
  const missing = [...asins].filter((a) => !map[a]);
  console.log(`✅ ${Object.keys(map).length}/${asins.size} Produkte aktualisiert.`);
  if (missing.length) console.warn(`⚠️  Nicht mehr verfügbar (${missing.length}): ${missing.join(', ')}`);
  if (errors.length) console.warn('⚠️  API-Hinweise:', JSON.stringify(errors).slice(0, 600));
} catch (err) {
  console.error('❌ Aktualisierung fehlgeschlagen – vorhandene Daten bleiben erhalten:', err.message || err);
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify({ updatedAt: null, items: {} }));
  process.exit(process.env.STRICT_PRICES ? 1 : 0);
}
