// Findet passende Produkte (ASINs) je Vergleichsseite über die Amazon-Suche.
// Läuft wöchentlich als GitHub Action („Produkte finden“) und committet nur die
// ASIN-Listen. Titel, Preise usw. werden bei jedem Build frisch geholt.
//
//   npm run discover                                      → alle Unterkategorien
//   npm run discover -- saugroboter-ohne-app              → nur eine Unterkategorie
//   npm run discover -- --refresh                         → automatische Listen neu aufbauen
//
// Datei je Unterkategorie: src/data/asins/<slug>.json
//   asins:  automatisch + manuell (Reihenfolge egal)
//   hidden: ASINs, die nie angezeigt werden sollen (manuell gepflegt)
//   picks:  { "ASIN": "Redaktionstipp" }, überschreibt automatische Empfehlungen

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { subs } from '../src/data/taxonomy.mjs';
import { searchItems, normalize, isThrottledOut } from './amazon.mjs';

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const only = args.filter((a) => !a.startsWith('--'));

mkdirSync('src/data/asins', { recursive: true });

for (const sub of subs.filter((s) => !only.length || only.includes(s.slug))) {
  const file = `src/data/asins/${sub.slug}.json`;
  const cur = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { asins: [], hidden: [], picks: {} };
  const hidden = new Set(cur.hidden ?? []);
  const { queries, price, include, exclude, target = 14 } = sub.discover;

  const found = [];
  const seen = new Set();
  for (const q of queries) {
    for (const page of [1, 2]) {
      try {
        const items = await searchItems(q, 10, page);
        for (const it of items) {
          const n = normalize(it);
          const a = it.asin ?? it.ASIN;
          if (!a || seen.has(a) || hidden.has(a)) continue;
          seen.add(a);
          const titel = n.title ?? '';
          // include darf auch in den Produktmerkmalen stehen, exclude pruefen wir
          // nur im Titel: "Ersatzfilter im Lieferumfang" wuerde sonst ein
          // passendes Geraet aussortieren.
          const volltext = [titel, ...(n.features ?? [])].join(' | ');
          if (!n.amount || n.amount < price[0] || n.amount > price[1]) continue;
          if (include && !include.test(volltext)) continue;
          if (exclude && exclude.test(titel)) continue;
          found.push({ asin: a, rank: n.salesRank ?? 1e9, title: titel });
        }
      } catch (e) {
        console.warn(`  ⚠️  ${sub.slug} / "${q}" S.${page}: ${e.message}`);
      }
      if (isThrottledOut()) break;
    }
    if (isThrottledOut()) break;
  }

  if (isThrottledOut()) {
    console.error('\n⛔ Abbruch: Amazon drosselt alle Anfragen. Die ASIN-Listen bleiben unverändert.');
    console.error('   Prüfe das Tageskontingent und ob der Creators-API-Zugriff freigeschaltet ist.');
    break;
  }

  // Beliebteste zuerst
  found.sort((x, y) => x.rank - y.rank);
  const base = refresh ? Object.keys(cur.picks ?? {}) : (cur.asins ?? []).filter((a) => !hidden.has(a));
  const list = [...base];
  for (const f of found) {
    if (list.length >= Math.max(target, base.length)) break;
    if (!list.includes(f.asin)) list.push(f.asin);
  }

  writeFileSync(file, JSON.stringify({ asins: list, hidden: [...hidden], picks: cur.picks ?? {} }, null, 2) + '\n');
  console.log(`✅ ${sub.slug}: ${list.length} Produkte (${found.length} passende Treffer)`);
}
