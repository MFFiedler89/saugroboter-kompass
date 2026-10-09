# Saugradar, Projektstand und Regeln

Kurzfassung für jede neue Sitzung. Was hier steht, gilt.

## Was die Seite ist

Amazon-Affiliate-Vergleichsseite für Saugroboter und Saug-Wisch-Roboter.
Statische Astro-Seite, Produktdaten kommen bei jedem Build frisch aus der
Amazon Creators API, Auslieferung über Cloudflare Pages.

Aufgebaut nach derselben Blaupause wie ergo-kompass.de, mit eigener
Taxonomie, eigener Farbwelt (Tintenblau und Bernstein) und eigenen Rechnern.

## Harte Regeln

- **Amazon:** Daten nur aus der API, bei jedem Build frisch. Preise mit
  Zeitstempel, maximal 24 Stunden alt, danach automatisch ausgeblendet.
  Bilder nur über API-URLs. Partner-Hinweis sichtbar. Jeder Amazon-Link mit
  `rel="sponsored nofollow noopener"` und sichtbarem Hinweis "Anzeige".
- **Merkmale:** Werden aus Titel und Produktmerkmalen gelesen. Was dort nicht
  eindeutig steht, wird "k. A." und wird **niemals** geraten.
- **In Texten** keine konkreten Produkte oder Modelle mit Spezifikationen,
  keine festen Produktanzahlen, keine Euro-Preise. Produkte nur über
  `<ProductTeaser>` oder `<PicksBox>` einbinden.
- **Keine erfundenen Tests, Testsieger, Studien, Zitate oder Bewertungen.**
  Keine erfundenen Erfahrungsberichte. Es gibt bewusst keine Seite
  "Unsere Erfahrung" und keine ErfahrungBox, weil zu Saugrobotern keine
  eigene Praxis vorliegt.
- **Keine Gedankenstriche in Texten.** Bereiche als "70 bis 80 cm" schreiben.
  Es soll sich nicht nach KI lesen.
- **Keine Secrets im Code.** Vor jedem Push `npm run build` fehlerfrei.
- **Sven macht keine Terminal-Arbeit.**
- **Repo bleibt privat.** GitHub läuft über die Firma, das Amazon-Thema ist
  privat, es dürfen keine Kosten über die Firmenabrechnung entstehen.

## Die Messung, auf der die Taxonomie beruht

Vor dem Aufbau wurde an 16 echten Saugrobotern auf Amazon.de ausgezählt,
welche Merkmale tatsächlich in Titel und Produktmerkmalen stehen:

| Merkmal | Trefferquote | Verwendung |
|---|---|---|
| Tierhaare als Einsatzzweck | 16 von 16 | Filter |
| Saugleistung in Pa | 15 von 16 | Filter, Hauptmerkmal |
| Wischsystem | 15 von 16 | Filter |
| Station (Absaugen/Komplett) | 10 von 16 | Filter |
| Akkulaufzeit in Minuten | 7 von 16 | nur Spalte |
| Bauhöhe | 6 von 16 | nur Spalte, siehe unten |
| Schwellenhöhe | 5 von 16 | nur Spalte |

**Bauhöhe ist bewusst kein Filter.** Sie steht zu selten eindeutig da, und wo
eine Zahl steht, meint sie oft etwas anderes, nämlich die Höhe der Lücke,
unter die das Gerät noch fährt. Ein Filter darauf würde falsche Ergebnisse
liefern. Eine eigene Seitenfamilie "Saugroboter flach 5/6/7 cm" wird erst
gebaut, wenn eine gezielte Messung in diesem Segment eine bessere Quote zeigt.

Dieselbe Logik gilt für die Wiederaufnahme nach dem Laden: im Alltag das
wichtigste Merkmal bei großer Fläche, steht aber kaum je im Titel. Wird
deshalb in Texten erklärt, nicht als Filter angeboten.

Ebenso die Lautstärke: steht zu selten und zwischen Herstellern nicht
vergleichbar in den Angaben. Eigener Ratgeber, kein Filter.

## Umfang

83 Seiten, davon rund 65 Inhaltsseiten:

| Sammlung | Anzahl |
|---|---|
| Kategorie-Hubs | 2 |
| Vergleichsseiten | 8 |
| Situationen | 13 |
| Ratgeber | 15 |
| Lexikonbegriffe | 31 |
| Rechner | 4 |

Dazu Startseite, Marktdaten, Über uns, So vergleichen wir, Impressum,
Datenschutz, 404.

Ziel bleibt "lieber 100 wirklich sinnvolle Seiten als 1.000 automatisch
generierte". Jede neue Seite braucht eine eigene Suchintention, keine
Variation einer bestehenden.

## Technik

- Astro 7.3.5, `trailingSlash: 'always'`, `build.format: 'directory'`
- Markdown über Sätteri. Achtung: `markdown.remarkPlugins` und
  `rehypePlugins` funktionieren mit Sätteri **nicht**. Erweiterungen laufen
  über die eigene hast-Plugin-API, siehe `src/lib/satteri-lexikon.mjs`.
- Content Collections: kategorien, vergleiche, situationen, ratgeber, lexikon
- **Lexikon ist reines Markdown (`*.md`), kein MDX.** Dort funktionieren die
  Rechner-Komponenten nicht, stattdessen auf `/rechner/…/` verlinken.
- **Doppelpunkte in Frontmatter-Werten gehören in Anführungszeichen**, sonst
  bricht der Build mit "bad indentation of a mapping entry" ab.
- Merkmalstypen in `src/data/taxonomy.mjs`: bool, enum, number, range, dims.
  Erweiterungen gegenüber der Blaupause: `thousands` (deutscher
  Tausenderpunkt), `convert` (Einheitenumrechnung mm zu cm), `reject`
  (Treffer verwerfen, wenn im Umfeld ein anderer Begriff steht)
- `MIN_PRODUCTS = 5`: Unter fünf Produkten erscheint keine Angebotsliste und
  die Seite geht auf noindex.

## Deployment

- `.github/workflows/deploy.yml`: bei jedem Push und alle 6 Stunden
  (`17 */6 * * *`), holt Preise und veröffentlicht auf Cloudflare Pages
- `.github/workflows/discover.yml`: montags (`23 5 * * 1`), sucht neue ASINs
  und committet nur `src/data/asins/`

**Secrets:** `AMAZON_CREDENTIAL_ID`, `AMAZON_CREDENTIAL_SECRET`,
`AMAZON_PARTNER_TAG`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
**Variables:** `SITE_URL`, `CF_PAGES_PROJECT`

## Stand

Die Seite ist live unter **saugradar.pages.dev**. Beide Workflows laufen,
der Deploy ist grün, die Produktsuche hat 107 ASINs über die acht
Vergleichsseiten gefunden. Alle Amazon-Links tragen `tag=saugradar-21`.

## Erledigt

- [x] Workflow-Dateien eingespielt (von Hand über die GitHub-Oberfläche, der
      Claude-Connector darf keine Workflows schreiben)
- [x] Workflow permissions im Repo auf "Read and write" (discover committet selbst)
- [x] Domain saugradar.de bei STRATO registriert
- [x] Tracking-ID `saugradar-21` im PartnerNet angelegt
- [x] Creators-API-Zugangsdaten (dieselben wie Ergo-Kompass, Amazon verlangt
      die Zugangsdaten des Hauptkontos, der Partner-Tag trennt die Seiten)
- [x] Secrets und Variables im Repo eingetragen
- [x] Cloudflare-Pages-Projekt `saugradar` angelegt (vom Workflow selbst)
- [x] Zone saugradar.de in Cloudflare angelegt (Free), Nameserver
      `bradley.ns.cloudflare.com` und `fiona.ns.cloudflare.com`
- [x] Nameserver bei STRATO auf Cloudflare umgestellt (09.10.2026)
- [x] `npm run discover` einmal gelaufen, ASIN-Listen gefüllt

## Offen

- [ ] Warten, bis die Zone in Cloudflare auf "active" springt (bis zu 24 Stunden)
- [ ] Danach in Cloudflare Pages unter Custom domains `saugradar.de` und
      `www.saugradar.de` hinzufügen. Vorher lehnt Pages es ab, die Zone muss
      aktiv sein.
- [ ] Impressum und Datenschutz prüfen (Betreiberangaben in `src/config.ts`)
- [ ] Kontaktadresse einrichten (Cloudflare Email Routing). Achtung: STRATO
      stellt für diese Domain keine E-Mail mehr bereit, seit eigene
      Nameserver gesetzt sind.
- [ ] Search Console und Bing Webmaster Tools
- [ ] Optional: Repo von `saugroboter-kompass` nach `saugradar` umbenennen

## Für die nächsten Nischenseiten

- Jede Seite bekommt eine **eigene Cron-Minute** in `deploy.yml`. Saugradar
  läuft auf `17 */6 * * *`. Die Creators API erlaubt am Anfang nur eine
  Anfrage pro Sekunde, und das Limit gilt pro Konto, nicht pro Anwendung.
- Startkontingent: 1 TPS und 8.640 Anfragen pro Tag. Wächst mit dem
  versandten Umsatz der letzten 30 Tage, gedeckelt bei 10 TPS.
- Der API-Zugang erlischt, wenn 30 Tage am Stück kein qualifizierter Verkauf
  zustande kommt, und kommt zwei Tage nach dem nächsten Versand zurück. Das
  gilt für alle Seiten des Kontos gemeinsam.
