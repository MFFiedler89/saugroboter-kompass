/** Shared section names describe the page's actual topic, not a generic sales step. */
const topics: Record<string, string> = {
  saugroboter: 'Saugroboter',
  wischroboter: 'Saug- und Wischroboter',
  'saugroboter-mit-absaugstation': 'Saugroboter mit Absaugstation',
  'saugroboter-ohne-wischfunktion': 'Saugroboter ohne Wischfunktion',
  'saugroboter-ohne-app': 'Saugroboter ohne App',
  'saugroboter-ohne-kamera': 'Saugroboter ohne Kamera',
  'saugroboter-mit-wischfunktion': 'Saugroboter mit Wischfunktion',
  'saug-wisch-roboter-mit-station': 'Saug-Wisch-Roboter mit Komplettstation',
  'wischroboter-mit-mopprolle': 'Wischroboter mit Mopprolle',
  'saugroboter-ab-20000-pa': 'Saugroboter ab 20.000 Pa',
  'polsterreiniger-geraete': 'Polsterreiniger',
  'fensterputzroboter-geraete': 'Fensterputzroboter',
};

export function headingsFor(key: string) {
  const topic = topics[key];
  if (!topic) throw new Error(`Missing heading topic: ${key}`);
  return {
    early: `${topic} auf einen Blick`,
    fit: `${topic}: Einsatz und Zielgruppe`,
    tradeoffs: 'Vorteile und Grenzen im Alltag',
    checklist: 'Checkliste: Was vor dem Kauf passen muss',
    products: `${topic}: Modelle und Ausstattung vergleichen`,
  };
}
