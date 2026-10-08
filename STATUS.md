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

69 Seiten, davon rund 50 Inhaltsseiten:

| Sammlung | Anzahl |
|---|---|
| Kategorie-Hubs | 2 |
| Vergleichsseiten | 8 |
| Situationen | 10 |
| Ratgeber | 12 |
| Lexikonbegriffe | 23 |
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

## Offen, bevor die Seite live geht

- [ ] Die beiden Workflow-Dateien unter `.github/workflows/` einspielen. Der
      Claude-GitHub-Connector darf keine Workflows schreiben, deshalb fehlen
      sie im Repo und liegen separat bereit.
- [ ] Domain saugradar.de bei STRATO registrieren, DNS auf Cloudflare
- [ ] Tracking-ID **saugradar-21** im Amazon PartnerNet anlegen und die Seite
      dort anmelden. Eine ID staubradar-21 besteht bereits, wird aber nicht
      verwendet, weil Domain und Marke Saugradar heißen.
- [ ] Creators-API-Zugangsdaten erzeugen
- [ ] Secrets und Variables im GitHub-Repo eintragen (`AMAZON_PARTNER_TAG`
      bekommt `saugradar-21`)
- [ ] `npm run discover` einmal laufen lassen, damit ASIN-Listen entstehen
- [ ] Impressum und Datenschutz prüfen (Vorlagen, Betreiberangaben stehen in
      `src/config.ts`)
- [ ] Kontaktadresse einrichten (Cloudflare Email Routing)
- [ ] Search Console und Bing Webmaster Tools
- [ ] Optional: Repo von `saugroboter-kompass` nach `saugradar` umbenennen
