// Zaehlt, wie oft ein Merkmal tatsaechlich in Titel und Produktmerkmalen steht.
//
// Grundlage fuer die Entscheidung, ob aus einem Merkmal ein Filter oder eine
// eigene Seitenfamilie werden darf. Dieselbe Logik wie bei der Messung an 16
// Geraeten vor dem Aufbau: Was zu selten eindeutig dasteht, wird nicht
// gefiltert, sondern im Text erklaert.
//
// Liest src/data/live.json, das im Build-Lauf direkt vor diesem Schritt von
// `npm run live` geschrieben wird. Macht selbst keine API-Anfragen und
// verbraucht damit kein Kontingent.
//
// Wichtige Einschraenkung: Gemessen wird die Auswahl, die wir ohnehin listen,
// nicht der Gesamtmarkt. Fuer die Frage "taugt das als Filter auf unseren
// Seiten" ist genau das die richtige Grundgesamtheit.

import { readFileSync, existsSync } from 'node:fs';

const FILE = 'src/data/live.json';

if (!existsSync(FILE)) {
  console.log('Messung uebersprungen: live.json fehlt.');
  process.exit(0);
}

const live = JSON.parse(readFileSync(FILE, 'utf8'));
const items = Object.values(live.items ?? {});

if (items.length === 0) {
  console.log('Messung uebersprungen: keine Produkte in live.json.');
  process.exit(0);
}

// Text je Produkt: Titel plus alle Produktmerkmale, klein geschrieben.
const texte = items.map((p) => [p.title ?? '', ...(p.features ?? [])].join(' \n ').toLowerCase());

// Kandidaten fuer kuenftige Filter und Seitenfamilien.
// re trifft das Merkmal, die Stichprobe unten zieht den gefundenen Ausschnitt
// heraus, damit sich Fehltreffer in der Ausgabe erkennen lassen.
const KANDIDATEN = [
  { key: 'Ausfahrbarer Arm', re: /(ausfahrbar|ausfahrend|ausklappbar|schwenkarm|flexiarm|extend)\w*\s*(arm|seitenb(ü|ue)rste|b(ü|ue)rste|mopp)|(seitenb(ü|ue)rste|mopp)\w*\s*(ausfahrbar|ausfahrend|ausklappbar)/i },
  { key: 'Lautstaerke in dB', re: /(\d{2,3})\s*(db\b|dezibel)/i },
  { key: 'Teppichanhebung in mm', re: /(?:anhebung|angehoben|hebt|lift)[^.]{0,40}?(\d{1,2})\s*mm|(\d{1,2})\s*mm[^.]{0,30}?(?:anhebung|angehoben)/i },
  { key: 'Mehretagenkarte', re: /(mehrere|multi|\d)\s*(etagen|stockwerke|karten|ebenen)|multi[- ]?floor|mehretagen/i },
  { key: 'Sprachsteuerung', re: /\balexa\b|google assistant|\bsiri\b|sprachsteuerung|sprachbefehl/i },
  { key: 'Matter', re: /\bmatter\b(?!\s*of)/i },
  { key: 'Heissluftrocknung', re: /hei(ß|ss)luft|warmluft|trocknung|getrocknet/i },
  { key: 'Warmwasser-Moppwaesche', re: /(\d{2,3})\s*(°|grad)\s*c?[^.]{0,30}(wasch|reinig|mopp)|warmwasser|hei(ß|ss)wasser/i },
  { key: 'Vibrationswischen', re: /vibration|schwingung|\d{3,5}\s*(mal|schwingungen|vibrationen)\s*(pro|\/)\s*(minute|min)|sonic/i },
  // Nur zaehlen, wenn die Milliliter auch wirklich zum Wassertank gehoeren.
  // Ohne diese Einschraenkung trifft die Regel jede Angabe zum Staubbehaelter.
  { key: 'Wassertank in ml', re: /(\d{2,4})\s*ml[^.]{0,25}?(wassertank|frischwasser|wasserbeh(ä|ae)lter)|(?:wassertank|frischwasser|wasserbeh(ä|ae)lter)[^.]{0,25}?(\d{2,4})\s*ml/i },
  { key: 'Staubbehaelter in ml/l', re: /(\d{2,4})\s*ml\s*(staub|schmutz)|staubbeh(ä|ae)lter[^.]{0,20}?(\d[.,]?\d*)\s*(ml|l\b)/i },
  { key: 'Beutelkapazitaet', re: /(\d[.,]?\d*)\s*(l|liter)[^.]{0,25}(beutel|staubbeutel)|beutel[^.]{0,25}(\d[.,]?\d*)\s*(l|liter)/i },
  { key: 'Ladezeit', re: /(\d{1,3})\s*(stunden|std\.?|h)\b[^.]{0,20}?(laden|ladezeit|aufgeladen)|ladezeit[^.]{0,20}?(\d{1,3})\s*(stunden|std\.?|h)\b/i },
  { key: 'Selbstleerung Tage/Wochen', re: /(\d{1,3})\s*(tage|wochen)[^.]{0,30}(ohne|freih(ä|ae)ndig|selbst|leeren|entleeren)/i },
  { key: 'Absturzsensor', re: /absturz|treppensicher|fallschutz|cliff/i },
  { key: 'Kantenreinigung', re: /kantenreinigung|randreinigung|eckenreinigung|kantenmodus|entlang der wand/i },
];

const breite = Math.max(...KANDIDATEN.map((k) => k.key.length));
const n = texte.length;

console.log('');
console.log(`Merkmalsmessung ueber ${n} gelistete Produkte`);
console.log(`Stand der Produktdaten: ${live.updatedAt ?? 'unbekannt'}`);
console.log('');
console.log(`${'Merkmal'.padEnd(breite)}  Treffer   Quote   Empfehlung`);
console.log('-'.repeat(breite + 34));

for (const k of KANDIDATEN) {
  const treffer = texte.filter((t) => k.re.test(t)).length;
  const quote = treffer / n;
  // Dieselben Schwellen wie bei der Erstmessung: ab 80 Prozent taugt ein
  // Merkmal als Filter, ab 50 Prozent als Spalte, darunter nur als Text.
  const empfehlung = quote >= 0.8 ? 'Filter moeglich' : quote >= 0.5 ? 'nur Spalte' : 'nur im Text erklaeren';
  const pct = (quote * 100).toFixed(0).padStart(3);
  console.log(`${k.key.padEnd(breite)}  ${String(treffer).padStart(3)}/${n}  ${pct} %   ${empfehlung}`);
}

console.log('');
console.log('Schwellen: ab 80 Prozent Filter, ab 50 Prozent nur Spalte, darunter nur Text.');
console.log('Stichproben zur Kontrolle auf Fehltreffer:');
console.log('');

// Je Kandidat eine Fundstelle zeigen, damit sich falsch positive Treffer
// erkennen lassen. Ohne diese Kontrolle waere die Quote wertlos.
for (const k of KANDIDATEN) {
  const treffer = texte.find((t) => k.re.test(t));
  if (!treffer) continue;
  const m = treffer.match(k.re);
  const pos = m.index ?? 0;
  const aus = treffer.slice(Math.max(0, pos - 40), pos + 60).replace(/\s+/g, ' ').trim();
  console.log(`  ${k.key}: …${aus}…`);
}
console.log('');

// ---------------------------------------------------------------------------
// Datenfelder statt Freitext.
//
// Marke und Preis kommen als eigene Felder aus der API, nicht aus dem
// Beschreibungstext. Sie sind deshalb die einzigen Kandidaten fuer
// Seitenfamilien, die nicht an unsauberen Produktangaben scheitern.
// Long-Tail-Suchen wie "roborock saugroboter vergleich" laufen genau darauf.

const felder = [
  { key: 'Marke', hat: (p) => Boolean(p.brand && String(p.brand).trim()) },
  { key: 'Preis', hat: (p) => typeof p.amount === 'number' },
  { key: 'Bild', hat: (p) => Boolean(p.image?.url) },
  { key: 'Verkaufsrang', hat: (p) => typeof p.salesRank === 'number' },
];

console.log('Datenfelder aus der API (nicht aus dem Beschreibungstext)');
console.log('');
for (const f of felder) {
  const treffer = items.filter(f.hat).length;
  const pct = ((treffer / n) * 100).toFixed(0).padStart(3);
  console.log(`${f.key.padEnd(breite)}  ${String(treffer).padStart(3)}/${n}  ${pct} %`);
}

// Markenverteilung: zeigt, ob sich eigene Markenseiten ueberhaupt lohnen.
// Unter MIN_PRODUCTS Geraeten je Marke waere eine Seite zu duenn.
const marken = new Map();
for (const p of items) {
  const m = (p.brand ?? '').trim();
  if (m) marken.set(m, (marken.get(m) ?? 0) + 1);
}
const sortiert = [...marken.entries()].sort((a, b) => b[1] - a[1]);
console.log('');
console.log(`Marken: ${sortiert.length} verschiedene, davon ${sortiert.filter(([, c]) => c >= 5).length} mit mindestens 5 Geraeten`);
for (const [m, c] of sortiert) console.log(`  ${String(c).padStart(3)}  ${m}`);
console.log('');
