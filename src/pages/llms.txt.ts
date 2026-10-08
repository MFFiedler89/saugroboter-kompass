// llms.txt: eine kompakte Inhaltsübersicht für Sprachmodelle und KI-Suchen
// (ChatGPT, Perplexity, Claude und ähnliche). Wird bei jedem Build neu aus
// Taxonomie und Inhalten erzeugt.
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { kategorien, subsOf } from '../data/taxonomy.mjs';

export async function GET(context: APIContext) {
  const base = context.site?.origin ?? 'https://saugradar.de';
  const url = (p: string) => `${base}${p}`;
  const L: string[] = [];

  L.push(`# ${SITE.name}`);
  L.push('');
  L.push(`> ${SITE.description}`);
  L.push('');
  L.push(
    `${SITE.name} ist ein unabhängiges Vergleichsportal für Saugroboter aus Deutschland. ` +
      'Die Vergleiche beruhen auf Herstellerangaben und Produktdaten, die mehrmals täglich automatisch aktualisiert werden, ' +
      'nicht auf erfundenen Praxistests. Merkmale, die in den Produktangaben nicht eindeutig stehen, bleiben leer. ' +
      'Die Auswahlkriterien sind offengelegt. Produktlinks sind Amazon-Partnerlinks und als Anzeige gekennzeichnet.',
  );
  L.push('');
  L.push(`Herausgeber: ${SITE.name}. Kontakt: ${SITE.operator.email}. Sprache: Deutsch. Markt: Deutschland.`);
  L.push('');

  L.push('## Vergleiche nach Kategorie');
  L.push('');
  for (const k of kategorien) {
    L.push(`### ${k.label}`);
    L.push(`- [${k.label}](${url(`/${k.slug}/`)}): ${k.short}`);
    for (const s of subsOf(k.slug)) {
      L.push(`- [${s.label}](${url(`/${k.slug}/${s.slug}/`)}): Aktueller Vergleich mit Preisen, Saugkraft, Wischsystem und Station.`);
    }
    L.push('');
  }

  const ratgeber = (await getCollection('ratgeber', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
  if (ratgeber.length) {
    L.push('## Ratgeber');
    L.push('');
    for (const p of ratgeber) L.push(`- [${p.data.h1 ?? p.data.title}](${url(`/ratgeber/${p.id}/`)}): ${p.data.description}`);
    L.push('');
  }

  const situationen = await getCollection('situationen', ({ data }) => !data.draft);
  if (situationen.length) {
    L.push('## Nach Wohnsituation');
    L.push('');
    for (const p of situationen) L.push(`- [${p.data.h1 ?? p.data.title}](${url(`/situationen/${p.id}/`)}): ${p.data.description}`);
    L.push('');
  }

  const lexikon = (await getCollection('lexikon')).sort((a, b) => a.data.term.localeCompare(b.data.term, 'de'));
  if (lexikon.length) {
    L.push('## Lexikon');
    L.push('');
    for (const e of lexikon) L.push(`- [${e.data.term}](${url(`/lexikon/${e.id}/`)}): ${e.data.short}`);
    L.push('');
  }

  L.push('## Rechner');
  L.push('');
  L.push(`- [Fläche und Akkulaufzeit](${url('/rechner/flaeche/')}): Geschätzte Reinigungsdauer und nötige Akkulaufzeit für eine Wohnfläche.`);
  L.push(`- [Entleeren und Absaugstation](${url('/rechner/entleerung/')}): Entleerungsintervall des Staubbehälters und Beutelwechsel.`);
  L.push(`- [Folgekosten](${url('/rechner/folgekosten/')}): Beutel, Filter, Bürsten, Wischpads und Strom pro Jahr.`);
  L.push('');

  L.push('## Nachschlagen');
  L.push('');
  L.push(`- [Marktdaten Saugroboter](${url('/marktdaten/')}): Preisspannen, Medianpreise, Anbietervielfalt und Ausstattungsanteile über alle Produktgruppen, täglich aktualisiert. Zitierfähig unter CC BY 4.0.`);
  L.push(`- [So vergleichen wir](${url('/so-vergleichen-wir/')}): Methodik, Datenquellen und welche Merkmale bewusst fehlen.`);
  L.push(`- [Lexikon](${url('/lexikon/')}): Begriffe rund um Saugroboter kurz erklärt.`);
  L.push(`- [Über uns](${url('/ueber-uns/')})`);
  L.push('');

  L.push('## Optional');
  L.push('');
  L.push(`- [Sitemap](${url('/sitemap-index.xml')})`);
  L.push(`- [RSS der Ratgeber](${url('/rss.xml')})`);
  L.push(`- [Impressum](${url('/impressum/')})`);
  L.push(`- [Datenschutz](${url('/datenschutz/')})`);
  L.push('');

  return new Response(L.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
