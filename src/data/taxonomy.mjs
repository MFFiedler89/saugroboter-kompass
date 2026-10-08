// ─────────────────────────────────────────────────────────────────────────────
// Taxonomie: Kategorien, Unterkategorien (= Vergleichsseiten) und wie die
// Produkte automatisch gefunden und ausgewertet werden.
//
//  discover  → Suchbegriffe + Filter für die ASIN-Suche (scripts/discover.mjs)
//  specs     → welche Ausstattungsmerkmale aus Titel/Produktmerkmalen gelesen werden
//  card      → welche 3 Merkmale auf der Produktkachel stehen
//  picks     → Empfehlungen je Anwendungsfall (transparente Regeln, kein „Test“)
//
// Spec-Typen: number | range | dims | bool | enum   (siehe src/lib/extract.mjs)
//
// ─────────────────────────────────────────────────────────────────────────────
// MESSUNG VOM 07.10.2026, 16 Saugroboter aus der Amazon.de-Suche, Titel UND
// Produktmerkmale einzeln geprüft. Diese Zahlen entscheiden, was Filter wird
// und was nur Zusatzspalte bleibt:
//
//   Tierhaare als Einsatzzweck   16/16   → Filter
//   Saugleistung in Pa           15/16   → Filter, Hauptmerkmal
//   Wischsystem                  15/16   → Filter
//   Station (Absaugen/Komplett)  10/16   → Filter
//   Akkulaufzeit in Minuten       7/16   → nur Spalte
//   Bauhöhe                       6/16   → nur Spalte, siehe Warnung unten
//   Schwellenhöhe                 5/16   → nur Spalte
//
// ─────────────────────────────────────────────────────────────────────────────

const has = (k) => (p) => p.specs[k] === true;
const is = (k, v) => (p) => p.specs[k] === v;
const not = (k, v) => (p) => p.specs[k] !== v;
const max = (k, n) => (p) => typeof p.specs[k] === 'number' && p.specs[k] <= n;
const min = (k, n) => (p) => typeof p.specs[k] === 'number' && p.specs[k] >= n;
const and = (...fs) => (p) => fs.every((f) => f(p));

// ── Wiederverwendbare Spec-Definitionen ──────────────────────────────────────
const S = {
  /**
   * Saugleistung in Pascal. Hauptmerkmal, 15 von 16 Produkten nennen sie.
   *
   * Schreibweisen im Feld: „25.000 Pa“, „8000Pa“, „18.500 Pa“, „3.000 Pa“.
   * Der deutsche Tausenderpunkt wird über `thousands: true` entfernt, sonst
   * würde aus 25.000 der Wert 25 (siehe src/lib/extract.mjs).
   *
   * Bewusst NICHT erkannt: „15k Pa“ (iRobot) und „0,22 bar“ (ECOVACS).
   * Beides fällt durch `min: 1000` heraus und wird zu „k. A.“.
   * Raten wäre hier schlimmer als eine leere Zelle.
   */
  saugkraft: {
    key: 'saugkraft',
    label: 'Saugkraft',
    type: 'number',
    unit: 'Pa',
    // Zwei Alternativen: mit Tausenderpunkt („18.500“) und ohne („8000“).
    // Eine einzige Gruppe \d{1,3}(?:[.,]\d{3})? verschluckt sich an „5000 Pa“.
    re: /(\d{1,3}[.,]\d{3}|\d{3,5})\s*pa\b/gi,
    thousands: true,
    pick: 'max',
    min: 1000,
    max: 60000,
    sort: 'desc',
    filter: 'min',
  },

  /**
   * Wischsystem. 15 von 16 lassen sich eindeutig zuordnen.
   * Reihenfolge ist wichtig: spezifisch vor allgemein.
   */
  wischsystem: {
    key: 'wischsystem',
    label: 'Wischsystem',
    type: 'enum',
    filter: 'select',
    options: [
      { value: 'Mopprolle', re: /mopprolle|ozmo roller|walze|rollenmopp|roller mop/i },
      { value: 'Rotierende Mopps', re: /rotierende?\s*(?:wisch)?mopp|zwei\s*(?:rotierende)?\s*mopps|dualclean|drehende?\s*mopp|mopps?,?\s*die sich.{0,20}drehen|\d{2,3}\s*u\/min/i },
      { value: 'Wischpad', re: /wischpad|wischtuch|mikrofaser|wischmopp|wischfunktion|moppen|wischen|\bmopp/i },
      { value: 'Ohne Wischfunktion', re: /ohne wischfunktion|nur saugen|keine wischfunktion|ohne wassertank/i },
    ],
  },

  /**
   * Station. 10 von 16. „Komplettstation“ nur, wenn der Text ausdrücklich
   * mehr als Absaugen nennt (Moppwäsche, Wasser nachfüllen, Trocknen).
   */
  station: {
    key: 'station',
    label: 'Station',
    type: 'enum',
    filter: 'select',
    options: [
      { value: 'Komplettstation', re: /omni[- ]?station|all[- ]in[- ]one[- ]?(dock|station)|multifunktions[- ]?(dock|station)|moppw(ä|ae)sche|mopp.{0,25}(gewaschen|reinigt|selbstreinig)|heißwasser|warmlufttrocknung|autowash/i },
      { value: 'Absaugstation', re: /absaugstation|selbstentleer|automatische staubentleerung|staubentleerung|selbstentl|basisstation|dockingstation|staubbeutel/i },
    ],
  },

  /** Anti-Tangle. Sehr gut belegt und für Tierhaare das entscheidende Merkmal. */
  antiTangle: {
    key: 'anti_tangle',
    label: 'Anti-Tangle',
    type: 'bool',
    re: /anti[- ]?tangle|zerotangle|anti[- ]?verwick|anti[- ]?verhedder|verhedderungsfrei|verwicklungsfrei|tricut|duobrush|duodivide|entwirr|verheddern?\s*(verhindert|vermeidet|reduziert)/i,
    filter: 'bool',
  },

  /** Navigation. */
  navigation: {
    key: 'navigation',
    label: 'Navigation',
    type: 'enum',
    filter: 'select',
    options: [
      { value: 'LiDAR', re: /lidar|lds[- ]navigation|laser[- ]?navigation|precisense|dtof/i },
      { value: 'Kamera / KI', re: /aivi|rgb[- ]kamera|ki[- ]hinderniserkennung|kameragest/i },
      { value: 'Gyroskop', re: /gyroskop|gyro[- ]navigation/i },
    ],
  },

  /** Akkulaufzeit. Nur 7 von 16, daher kein Filter, nur Spalte. */
  laufzeit: {
    key: 'laufzeit',
    label: 'Akkulaufzeit',
    type: 'number',
    unit: 'min',
    re: /(?:bis zu\s*)?(\d{2,3})\s*(?:min\.?|minuten)\b/gi,
    pick: 'max',
    min: 30,
    max: 400,
    sort: 'desc',
  },

  /**
   * ⚠️ BAUHÖHE – die gefährlichste Zeile dieser Datei.
   *
   * Nur 6 von 16 Produkten nennen sie, und zwei Formulierungen sehen aus wie
   * eine Bauhöhe, sind aber keine:
   *
   *   roborock Qrevo S Pro: „Reinigung in Bereichen mit nur 9,65 cm
   *   Bodenfreiheit“ → das ist die Lücke unter dem Möbel, NICHT die
   *   Gerätehöhe. Wer das als Höhe liest, liegt rund 2 cm daneben.
   *
   *   iRobot Roomba Plus 576: „um 46 % kleiner als der Roomba 505“
   *   → Relativwert ohne Bezugsgröße, nicht umrechenbar.
   *
   * Deshalb greift die Regex nur bei eindeutigen Formulierungen und der
   * Negativ-Check unten wirft alles weg, was im Umfeld von „Bodenfreiheit“
   * oder „Bereich“ steht. Lieber „k. A.“ als eine falsche Zahl.
   *
   * Einheit ist cm; Millimeterangaben („81 mm flach“) werden über `convert`
   * geteilt. Die Seitenfamilie „Saugroboter flach 5/6/7 cm“ wird erst gebaut,
   * wenn eine gezielte Messung in diesem Segment eine bessere Quote zeigt.
   */
  bauhoehe: {
    key: 'bauhoehe',
    label: 'Bauhöhe',
    type: 'number',
    unit: 'cm',
    re: /(?:nur|ultraflach|ultra[- ]flach|bauh(?:ö|oe)he|h(?:ö|oe)he von)\s*(\d{1,3}(?:[.,]\d{1,2})?)\s*(mm|cm)\b|(\d{1,3}(?:[.,]\d{1,2})?)\s*(mm|cm)\s*(?:ultra)?(?:flach|schlank|niedrig|kompaktdesign|h(?:ö|oe)he)\b/gi,
    convert: (v, m) => {
      const unit = (m[2] || m[4] || '').toLowerCase();
      return unit === 'mm' ? v / 10 : v;
    },
    reject: /bodenfreiheit|bereiche?n?\s+mit|durchfahrtsh(?:ö|oe)he|lücke|spalt|t(?:ü|ue)rschwelle|schwelle|teppichkante/i,
    pick: 'min',
    min: 5,
    max: 15,
    sort: 'asc',
  },

  /** Schwellenhöhe. 5 von 16, nur Spalte. */
  schwelle: {
    key: 'schwelle',
    label: 'Schwellen bis',
    type: 'number',
    unit: 'cm',
    re: /(?:schwellen?|t(?:ü|ue)rschwellen?|teppichkanten?|hindernisse?)\D{0,30}?(\d{1,3}(?:[.,]\d)?)\s*(mm|cm)\b/gi,
    convert: (v, m) => ((m[2] || '').toLowerCase() === 'mm' ? v / 10 : v),
    pick: 'max',
    min: 0.5,
    max: 6,
    sort: 'desc',
  },

  app: { key: 'app', label: 'App-Steuerung', type: 'bool', re: /\bapp\b|alexa|google home|sprachsteuerung|sprachbefehl|siri|wlan|wi-?fi/i, filter: 'bool' },
  teppich: { key: 'teppich', label: 'Teppicherkennung', type: 'bool', re: /teppicherkennung|teppich.{0,25}(erkenn|automatisch)|mopp.{0,20}(angehoben|anheb)|auto[- ]lifting/i, filter: 'bool' },
  tierhaare: { key: 'tierhaare', label: 'Für Tierhaare', type: 'bool', re: /tierhaar|haustier|hundehaar|katzenhaar|katzenstreu|fellpflege|tierbesitzer/i, filter: 'bool' },
  staubbehaelter: { key: 'staubbehaelter', label: 'Staubbehälter', type: 'number', unit: 'ml', re: /(\d{3,4})\s*[- ]?ml\s*(?:gro(?:ß|ss)er\s*)?staubb|staubbeh(?:ä|ae)lter\D{0,20}?(\d{3,4})\s*ml/gi, pick: 'max', min: 100, max: 1200, sort: 'desc' },
};

// ─────────────────────────────────────────────────────────────────────────────

export const kategorien = [
  { slug: 'saugroboter', label: 'Saugroboter', short: 'Reine Sauger, Modelle mit Absaugstation und ohne App', icon: 'robot', order: 1 },
  { slug: 'wischroboter', label: 'Saug- und Wischroboter', short: 'Kombigeräte mit Wischpad, rotierenden Mopps oder Mopprolle', icon: 'drop', order: 2 },
];

// Gemeinsamer Satz Merkmale: Es ist überall dieselbe Produktart, nur anders gefiltert.
const SPECS = [S.saugkraft, S.wischsystem, S.station, S.antiTangle, S.navigation, S.laufzeit, S.bauhoehe, S.schwelle, S.teppich, S.app, S.staubbehaelter];

// Immer ausschließen: Zubehör, Ersatzteile, Poolroboter, Fensterroboter, Mähroboter
const NOISE = /ersatz|zubeh(ö|oe)r|filter\s*set|b(ü|ue)rsten?\s*set|staubbeutel|wischt(ü|ue)cher|pads?\s*\d|poolroboter|pool[- ]?reiniger|fensterroboter|fensterputz|m(ä|ae)hroboter|rasenm(ä|ae)her|handstaubsauger|akkusauger|stielstaubsauger|nass[- ]trocken[- ]sauger/i;

export const subs = [
  // ── SAUGROBOTER ─────────────────────────────────────────────────────────
  {
    slug: 'saugroboter-mit-absaugstation', kategorie: 'saugroboter', label: 'Saugroboter mit Absaugstation', singular: 'Saugroboter',
    discover: {
      queries: ['Saugroboter mit Absaugstation', 'Saugroboter Selbstentleerung Station', 'Staubsauger Roboter Absaugstation Staubbeutel', 'roborock Saugroboter Absaugstation', 'dreame Saugroboter Absaugstation'],
      price: [120, 1500], include: /absaugstation|selbstentleer|staubentleerung|station/i, exclude: NOISE, target: 18,
    },
    specs: SPECS,
    card: ['saugkraft', 'station', 'wischsystem'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell mit Absaugstation und Anti-Tangle-Bürste', filter: and(has('anti_tangle'), not('station', null)) },
      { label: 'Preis-Tipp', why: 'günstigstes Modell mit Absaugstation', filter: not('station', null), sort: 'price' },
      // Label bewusst nicht „Stärkste Saugkraft“: Die Regel wählt das
      // beliebteste Modell oberhalb der Schwelle, nicht das mit dem
      // höchsten Wert. Das Label darf nicht mehr versprechen als die Regel.
      { label: 'Für Hochflorteppich', why: 'beliebtestes Modell ab 20.000 Pa, dort zählt Reserve', filter: min('saugkraft', 20000) },
    ],
  },
  {
    slug: 'saugroboter-ohne-wischfunktion', kategorie: 'saugroboter', label: 'Saugroboter ohne Wischfunktion', singular: 'Saugroboter',
    discover: {
      queries: ['Saugroboter ohne Wischfunktion', 'Staubsauger Roboter nur saugen', 'Saugroboter ohne Wassertank'],
      price: [60, 700], include: /saugroboter|staubsauger\s*roboter|roboterstaubsauger/i, exclude: new RegExp(NOISE.source + '|wischfunktion|wischroboter|2[- ]in[- ]1', 'i'), target: 14,
    },
    specs: SPECS,
    card: ['saugkraft', 'anti_tangle', 'laufzeit'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtester reiner Sauger mit Anti-Tangle-Bürste', filter: has('anti_tangle') },
      { label: 'Preis-Tipp', why: 'günstigstes Modell ohne Wischfunktion', filter: () => true, sort: 'price' },
    ],
  },
  {
    slug: 'saugroboter-ohne-app', kategorie: 'saugroboter', label: 'Saugroboter ohne App und WLAN', singular: 'Saugroboter',
    discover: {
      queries: ['Saugroboter ohne App', 'Saugroboter ohne WLAN Fernbedienung', 'Saugroboter Fernbedienung ohne Internet'],
      price: [60, 400], include: /saugroboter|staubsauger\s*roboter|roboterstaubsauger/i, exclude: NOISE, target: 12,
    },
    specs: SPECS,
    card: ['saugkraft', 'laufzeit', 'bauhoehe'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell, das ohne App-Anbindung auskommt', filter: (p) => p.specs.app !== true },
      { label: 'Preis-Tipp', why: 'günstigstes Modell ohne App-Pflicht', filter: (p) => p.specs.app !== true, sort: 'price' },
    ],
  },
  {
    slug: 'saugroboter-ohne-kamera', kategorie: 'saugroboter', label: 'Saugroboter ohne Kamera', singular: 'Saugroboter',
    discover: {
      queries: ['Saugroboter ohne Kamera', 'Saugroboter LiDAR ohne Kamera Datenschutz', 'Saugroboter Laser Navigation ohne Kamera'],
      price: [80, 900], include: /saugroboter|staubsauger\s*roboter|roboterstaubsauger/i, exclude: NOISE, target: 12,
    },
    specs: SPECS,
    card: ['navigation', 'saugkraft', 'station'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell mit LiDAR-Navigation statt Kamera', filter: is('navigation', 'LiDAR') },
      { label: 'Preis-Tipp', why: 'günstigstes Modell ohne Kameranavigation', filter: not('navigation', 'Kamera / KI'), sort: 'price' },
    ],
  },

  // ── SAUG- UND WISCHROBOTER ──────────────────────────────────────────────
  {
    slug: 'saugroboter-mit-wischfunktion', kategorie: 'wischroboter', label: 'Saugroboter mit Wischfunktion', singular: 'Saug-Wisch-Roboter',
    discover: {
      queries: ['Saugroboter mit Wischfunktion', 'Saug und Wischroboter', 'Wischroboter Saugroboter 2 in 1', 'roborock Saugroboter Wischfunktion', 'ECOVACS Saugroboter Wischfunktion'],
      price: [100, 1500], include: /wisch|moppen|2[- ]in[- ]1/i, exclude: NOISE, target: 18,
    },
    specs: SPECS,
    card: ['saugkraft', 'wischsystem', 'station'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell mit rotierenden Mopps und Teppicherkennung', filter: and(is('wischsystem', 'Rotierende Mopps'), has('teppich')) },
      { label: 'Preis-Tipp', why: 'günstigstes Modell mit Wischfunktion', filter: not('wischsystem', 'Ohne Wischfunktion'), sort: 'price' },
      { label: 'Für Hartböden', why: 'beliebtestes Modell mit Mopprolle', filter: is('wischsystem', 'Mopprolle') },
    ],
  },
  {
    slug: 'saug-wisch-roboter-mit-station', kategorie: 'wischroboter', label: 'Saug-Wisch-Roboter mit Komplettstation', singular: 'Saug-Wisch-Roboter',
    discover: {
      queries: ['Saugroboter mit Wischfunktion und Absaugstation', 'Saugroboter Station Moppwäsche Heißwasser', 'Saug Wisch Roboter All in One Station'],
      price: [250, 1800], include: /station|omni|all[- ]in[- ]one/i, exclude: NOISE, target: 16,
    },
    specs: SPECS,
    card: ['station', 'saugkraft', 'wischsystem'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell mit Komplettstation inklusive Moppwäsche', filter: is('station', 'Komplettstation') },
      { label: 'Preis-Tipp', why: 'günstigstes Modell mit Komplettstation', filter: is('station', 'Komplettstation'), sort: 'price' },
    ],
  },
  {
    slug: 'wischroboter-mit-mopprolle', kategorie: 'wischroboter', label: 'Wischroboter mit Mopprolle', singular: 'Wischroboter',
    discover: {
      queries: ['Wischroboter mit Walze', 'Saugroboter Mopprolle', 'ECOVACS OZMO Roller Wischroboter'],
      price: [200, 1800], include: /walze|rolle|roller/i, exclude: NOISE, target: 10,
    },
    specs: SPECS,
    card: ['wischsystem', 'saugkraft', 'station'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell mit durchgehend gereinigter Mopprolle', filter: is('wischsystem', 'Mopprolle') },
    ],
  },
  {
    slug: 'saugroboter-ab-20000-pa', kategorie: 'wischroboter', label: 'Saugroboter ab 20.000 Pa', singular: 'Saugroboter',
    discover: {
      queries: ['Saugroboter 25000 Pa', 'Saugroboter 20000 Pa starke Saugkraft', 'Saugroboter hohe Saugleistung Teppich'],
      price: [200, 1800], include: /\d{2}[.,]?\d{3}\s*pa/i, exclude: NOISE, target: 14,
    },
    specs: SPECS,
    card: ['saugkraft', 'wischsystem', 'anti_tangle'],
    picks: [
      { label: 'Für die meisten', why: 'beliebtestes Modell ab 20.000 Pa mit Anti-Tangle-Bürste', filter: and(min('saugkraft', 20000), has('anti_tangle')) },
      { label: 'Preis-Tipp', why: 'günstigstes Modell ab 20.000 Pa', filter: min('saugkraft', 20000), sort: 'price' },
    ],
  },
];

export const subBySlug = Object.fromEntries(subs.map((s) => [s.slug, s]));
export const katBySlug = Object.fromEntries(kategorien.map((k) => [k.slug, k]));
export const subsOf = (kat) => subs.filter((s) => s.kategorie === kat);
