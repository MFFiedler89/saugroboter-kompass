// Reviewed device identities. New search results must be reviewed before appearing.
// Technical dimensions refer to the device, never the shipping package.
export const upholstery = {
  B0DBLD211L: { model: 'Kärcher SE 3 Compact', match: /k[äa]rcher.*\bSE\s*3\s+Compact\b(?!\s+Home\s+Shoe)/i, reject: /SE\s*3[- ]18|Floor|Shoe/i,
    source: 'https://www.karcher.com/de/de/home-and-garden/produkte/se-3-compact-home-p10815300',
    specs: { betrieb: 'Netzkabel', schlauch: 1.9, frischwasser: 1.7, schmutzwasser: 2.9, gewicht: 4.3, masse: '45 × 22,5 × 26 cm' },
    reason: 'Mit Polster- und Fugendüse; eine Option für Sofa und zugängliche textile Autositze.', limit: 'Freien Stellplatz und eine Steckdose einplanen. Materialfreigabe des Polsters bleibt erforderlich.' },
  B0FPGHCD96: { model: 'Kärcher SE 2 Spot Care', match: /k[äa]rcher.*\bSE\s*2\s+Spot\s+Care\b/i,
    source: 'https://www.karcher.com/de/de/home-and-garden/produkte/se-2-spot-care-p10814200',
    specs: { betrieb: 'Netzkabel', schlauch: 1.8, frischwasser: 1.5, schmutzwasser: 0.8, gewicht: 4, masse: '38,5 × 21,5 × 31 cm' },
    reason: 'Polsterdüse und Fleckenbürste für punktuelle Reinigung; 1,8 m Schlauch laut Hersteller.', limit: 'Kleinerer Schmutzwassertank: bei größeren Flächen häufiger entleeren. Keine automatische Trocknung.' },
  B0BQJS6NQ6: { model: 'Kärcher SE 3-18 Compact', match: /k[äa]rcher.*\bSE\s*3[- ]18\s+Compact\b/i,
    source: 'https://www.karcher.com/de/de/home-and-garden/produkte/se-3-18-compact-home-p10815060',
    specs: { betrieb: 'Akku' },
    reason: 'Akku-Gerät mit Polster- und Fugendüse für Stellen ohne nahe Steckdose.', limit: 'Dieses Amazon-Angebot enthält keinen Akku und kein Ladegerät. Gesamtkosten und kompatiblen 18-V-Akku vor dem Kauf prüfen.' },
  B084PSXMQM: { model: 'BISSELL SpotClean Pet Pro 15585', match: /\bBISSELL\b.*\bSpotClean\s+Pet\s+Pro\b.*\b15585\b/i,
    source: 'https://www.bissell.de/tipps/post/spotlight-auf-die-bissell-spotcleaner',
    specs: { betrieb: 'Netzkabel' }, pet: true,
    reason: 'Der Stain-Trapper-Aufsatz sammelt aufgenommene Haustier-Verschmutzungen in einem separaten Behälter.', limit: 'Für Flecken auf freigegebenen Textilien. Lose Haare vorher trocken entfernen; keine Garantie gegen dauerhaft eingezogene Gerüche.' },
  B0FYQQWB6L: { model: 'BISSELL SpotClean Mini 4103N', match: /\bBISSELL\b.*\bSpotClean\s+Mini\b.*\b4103N\b/i, reject: /Cordless|Akku/i,
    source: 'https://support.bissell.de/app/answers/list/c/655/p/182219/',
    specs: { betrieb: 'Netzkabel' },
    reason: 'Kabelgebundener Mini für kleine Fleckenbereiche; Schlauch und Behälter vor dem Kauf mit dem Einsatz abgleichen.', limit: 'Kleine Tanks bedeuten häufigeres Nachfüllen und Entleeren. Die Bezeichnung Mini ersetzt keine Prüfung der Außenmaße.' },
};

export function reviewedUpholstery(asin, title = '') {
  const m = upholstery[asin];
  return m && m.match.test(title) && !m.reject?.test(title) ? m : null;
}
function measurement(text, re, min, max) {
  for (const m of text.matchAll(re)) {
    let n = Number(m[1].replace(',', '.'));
    if (m[2]?.toLowerCase() === 'ml') n /= 1000;
    if (n >= min && n <= max) return n;
  }
  return null;
}
export function upholsterySpecs(asin, title, features = []) {
  const model = reviewedUpholstery(asin, title);
  if (!model) return null;
  const text = [title, ...features].join(' | ');
  return {
    betrieb: null, gewicht: null, masse: null,
    schlauch: measurement(text, /(\d+(?:[.,]\d+)?)\s*[- ]?(?:m|Meter)\s+lang\w*\s+(?:Saug)?schlauch\b/gi, 0.5, 5),
    frischwasser: measurement(text, /(?:Frischwassertank|Frischwasserbehälter)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(ml|l)\b/gi, 0.1, 10)
      ?? measurement(text, /(\d+(?:[.,]\d+)?)\s*(ml|l)\s*Frischwassertank\b/gi, 0.1, 10),
    schmutzwasser: measurement(text, /(?:Schmutzwassertank|Schmutzwasserbehälter)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(ml|l)\b/gi, 0.1, 10)
      ?? measurement(text, /(\d+(?:[.,]\d+)?)\s*(ml|l)\s*Schmutzwassertank\b/gi, 0.1, 10),
    ...model.specs,
  };
}
export const upholsterySpecDefs = [
  { key: 'betrieb', label: 'Stromversorgung', type: 'enum', filter: 'select' },
  { key: 'schlauch', label: 'Schlauchlänge', type: 'number', unit: 'm', sort: 'desc', filter: 'min' },
  { key: 'frischwasser', label: 'Frischwassertank', type: 'number', unit: 'l', precision: 2, sort: 'desc' },
  { key: 'schmutzwasser', label: 'Schmutzwassertank', type: 'number', unit: 'l', precision: 2, sort: 'desc' },
  { key: 'masse', label: 'Maße (L × B × H)', type: 'enum' },
  { key: 'gewicht', label: 'Gewicht ohne Zubehör', type: 'number', unit: 'kg', sort: 'asc' },
];
