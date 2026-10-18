// Reviewed Amazon.de device identities, matched to model-specific manufacturer sources.
// A device height is never a clearance approval for a roller shutter.
const shop = 'https://www.ecovacs.com/de/shop/winbot-window-cleaning-robot/';
const docs = 'https://site-static.ecovacs.com/upload/file/support/2025/08/27/';
export const windowModels = {
  B0DQ8QPG2Z: {
    model: 'ECOVACS WINBOT MINI', match: /\bECOVACS\b.*\bWINBOT\s+MINI\b(?!\s*2)/i, reject: /\bMINI\s*2\b/i,
    source: shop + 'winbot-mini', manual: docs + '064612_7777%24WINBOTMINIUserManual_DE.pdf',
    specs: { betrieb: 'Netzkabel', hoehe: 55, masse: '215 × 215 × 55 mm', station: 'Ohne Station' },
    reason: 'Mit 55 mm Gerätehöhe und 215 mm Seitenlänge eine kompakte Option, wenn wenig Platz vor der Scheibe bleibt.',
    limit: '55 mm Gerätehöhe sind keine Rollladen-Freigabe. Griff, Kabel, Ansetzen und Entnehmen brauchen ebenfalls Platz. Der Sicherheitsakku ersetzt den Netzanschluss nicht.'
  },
  B0DQ8PCY2V: {
    model: 'ECOVACS WINBOT W2 PRO', match: /\bECOVACS\b.*\bWINBOT\s+W2\s+PRO\b(?!\s+OMNI)/i, reject: /\bW2S\b|\bOMNI\b/i,
    source: shop + 'winbot-w2-pro', manual: docs + '064724_4516%24WINBOTW2PROUserManual_DE.pdf',
    specs: { betrieb: 'Netzkabel', hoehe: 77.5, masse: '271 × 271 × 77,5 mm', station: 'Ohne Station' },
    reason: 'Kabelgebundene Alternative ohne Multifunktionsstation, wenn eine Steckdose und genügend Platz vor der Scheibe vorhanden sind.',
    limit: 'Größer als der MINI. Fenstergröße und Hindernisse anhand der Anleitung prüfen; keine Lösung für eine vollständig unerreichbare Außenseite.'
  },
  B0DQ8V4R88: {
    model: 'ECOVACS WINBOT W2 PRO OMNI', match: /\bECOVACS\b.*\bWINBOT\s+W2\s+PRO\s+OMNI\b/i, reject: /\bW2S\b|\bW3\b/i,
    source: shop + 'winbot-w2-pro-omni', manual: docs + '064640_4712%24WINBOTW2PROOMNIUserManual_DE.pdf',
    specs: { betrieb: 'Akku-Station / Netzbetrieb', hoehe: 77, masse: '271 × 271 × 77 mm', station: 'Multifunktionsstation' },
    reason: 'Station mit Akku- und Netzbetrieb: eine Option, wenn direkt am Fenster keine Steckdose verfügbar ist.',
    limit: 'Auch mit Station bleibt der Roboter über ein Verbindungskabel angeschlossen. Sicheres Aufsetzen, Abnehmen und die vorgeschriebene Sicherung bleiben notwendig.'
  }
};
export function reviewedWindow(asin, title = '') {
  const model = windowModels[asin];
  if (/reinigungst[uü]ch|reinigungspad|ersatzt[uü]ch|reinigungsl[oö]sung|aufbewahrungs|zubeh[oö]r\s+f[uü]r/i.test(title)) return null;
  return model && model.match.test(title.replace(/[\u200e\u200f]/g, '')) && !model.reject.test(title) ? model : null;
}
export const windowSpecDefs = [
  { key: 'betrieb', label: 'Stromversorgung', type: 'enum', filter: 'select' },
  { key: 'station', label: 'Station', type: 'enum', filter: 'select' },
  { key: 'hoehe', label: 'Gerätehöhe', type: 'number', unit: 'mm', precision: 1, sort: 'asc' },
  { key: 'masse', label: 'Robotermaße (L × B × H)', type: 'enum' },
];
