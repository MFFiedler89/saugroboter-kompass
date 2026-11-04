// Reviewed controls, not a blanket approval for any wooden floor.
// Match both the observed offer and exact model; do not inherit facts from neighbours.
export const floorModels = [
 {
  id: 'qrevo-s-pro',
  asins: ['B0GHN3V6BP', 'B0GHMV8ML5', 'B0GHN9DR1C'],
  title: /\broborock\s+qrevo\s+s\s+pro\b(?!\s*(?:max|ultra|plus|curv|edge|\+))/i,
  name: 'Roborock Qrevo S Pro',
  label: 'Wasserfluss in 30 Stufen',
  reason: 'Roborock dokumentiert 30 Wasserfluss-Stufen und einen reinen Saugmodus. Das ermöglicht die Auswahl der Betriebsart; die passende Feuchtigkeit für deinen Boden ist damit noch nicht bestätigt.',
  limit: 'Sperrzonen sind belegt. Eine No-Go-Zone schließt auch das Saugen aus; sie ist keine No-Mop-Zone. Moppanhebung garantiert keinen trockenen Kontakt auf jedem Teppich.',
  source: 'https://global.roborock.com/pages/roborock-qrevo-s-pro',
  manual: 'https://gl-files.roborock.com/product/center/manuals/Roborock%20Qrevo%20S%20Pro%20CE%20EN%20User%20Manual.vum9ib3jvy2.pdf',
 },
 {
  id: 'q10-s5',
  asins: ['B0DSZJKXBC'],
  title: /\broborock\s+q10\s+s5\b(?!\s*(?:\+|plus|pro|max|ultra))/i,
  name: 'Roborock Q10 S5',
  label: 'Wasserdurchfluss per App',
  reason: 'Die Q10-S5-Anleitung beschreibt den einstellbaren Wasserdurchfluss in der App und eine abnehmbare Wischtuchhalterung. Nach dem Wischen sind Tank und Tuch von Hand zu pflegen.',
  limit: 'Eine bestätigte Zahl der Wasserstufen nennen wir hier nicht. Für eine Reinigung ohne feuchtes Tuch die Halterung nach Anleitung entfernen; bloßes Anheben ist nicht dasselbe.',
  source: 'https://support.roborock.com/hc/de/articles/48301019103129-Roborock-Q10-S5-CE-EN-DE-User-Manual',
  manual: 'https://support.roborock.com/hc/de/article_attachments/51024991851929',
 },
];

const accessory = /ersatz|replacement|reinigungst[üu]ch|wischt[üu]cher|zubeh[öo]r|accessor|staubbeutel|filterset/i;
export function reviewedFloorCare(product) {
 if (!product || accessory.test(product.title ?? '')) return null;
 return floorModels.find(model => model.asins.includes(product.asin) && model.title.test(product.title ?? '')) ?? null;
}
