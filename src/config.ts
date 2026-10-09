// Zentrale Einstellungen der Seite. Für weitere Nischen-Seiten wird nur diese Datei
// (plus Inhalte und Taxonomie) angepasst, der Rest bleibt identisch.

export const SITE = {
  name: 'Saugradar',
  tagline: 'Saugroboter vergleichen nach Zahlen, nicht nach Werbetexten',
  description:
    'Saugroboter und Saug-Wisch-Roboter im Vergleich: Saugkraft in Pa, Wischsystem, Absaugstation und Eignung für Tierhaare, Teppich und Hartboden. Preise mehrmals täglich frisch von Amazon.',
  locale: 'de_DE',
  lang: 'de',
  // Beiträge erscheinen unter der Redaktion, nicht unter einem Personennamen.
  // Der Name der verantwortlichen Person steht im Impressum, wo er hingehört.
  author: {
    name: 'Redaktion Saugradar',
    role: 'Redaktion',
    bio: 'Saugradar vergleicht Saugroboter nach offengelegten Kriterien. Preise und Produktangaben kommen mehrmals täglich direkt von Amazon, die Auswahlregeln stehen an jeder Empfehlung. Es gibt keine erfundenen Tests und keine gekauften Platzierungen.',
  },
  // Betreiber für Impressum. Die Seite wird privat betrieben, daher keine Firma.
  // TODO Sven: Angaben prüfen, bevor die Seite online geht.
  operator: {
    company: '',
    person: 'Mary Fiedler',
    street: 'Frohnbergstraße 30',
    city: '79539 Lörrach',
    email: 'kontakt@saugradar.de',
    vatId: '',
  },
};

export const AMAZON = {
  // Eigene Tracking-ID für diese Seite, NICHT die von Ergo-Kompass.
  // Wird beim Build aus der Umgebungsvariable gelesen, Fallback hier.
  // Der Tag ist kein Geheimnis, er steht in jedem Affiliate-Link.
  partnerTag: import.meta.env.AMAZON_PARTNER_TAG || 'saugradar-21',
  marketplace: 'www.amazon.de',
  // Pflichthinweis laut Amazon-Partnerprogramm-Vereinbarung
  disclosure: 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.',
  // Preise, die älter als dieses Fenster sind, werden im Browser ausgeblendet
  maxPriceAgeHours: 24,
};

/**
 * Einwilligung (Cookie-Banner).
 *
 * Solange die Seite keine Cookies und kein Tracking einsetzt, bleibt die Liste
 * leer und es wird nichts angezeigt.
 */
export const CONSENT = {
  version: 1,
  categories: [] as { key: string; label: string; description: string; required?: boolean }[],
};

export const NAV_SECONDARY = [
  { href: '/deals/', label: 'Aktuelle Deals %' },
  { href: '/situationen/', label: 'Situationen' },
  { href: '/rechner/', label: 'Rechner' },
  { href: '/ratgeber/', label: 'Ratgeber' },
  { href: '/lexikon/', label: 'Lexikon' },
];
