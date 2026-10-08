// Verlinkt Fachbegriffe in Artikeln automatisch auf den passenden
// Lexikoneintrag. So ist jeder neue Text ohne Zusatzarbeit sauber vernetzt.
//
// Regeln, damit es nicht nach Linkspam aussieht:
//   - pro Begriff nur die erste Fundstelle im Text
//   - höchstens MAX_PRO_SEITE automatische Links je Seite
//   - handgesetzte Links haben Vorrang: ist der Begriff auf der Seite schon
//     verlinkt, wird nichts ergänzt
//   - nie in Überschriften, Code oder bestehenden Links
//   - ein Lexikoneintrag verlinkt nie auf sich selbst
//
// Die Begriffe kommen direkt aus den Dateien in src/content/lexikon.
// Weitere Schreibweisen lassen sich dort über "aliases" ergänzen.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIR = 'src/content/lexikon';
const MAX_PRO_SEITE = 8;
// In diesen Elementen wird nicht verlinkt.
const TABU = new Set(['a', 'code', 'pre', 'kbd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style']);

function feld(fm, name) {
  const m = new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(fm);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

function liste(fm, name) {
  const m = new RegExp(`^${name}:\\s*\\[([^\\]]*)\\]`, 'm').exec(fm);
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Erlaubt die üblichen deutschen Plural- und Genitivendungen, aber nichts,
// was Teil eines anderen Wortes wäre.
const muster = (name) =>
  new RegExp(`(?<![\\p{L}\\p{N}-])${escape(name)}(en|e|n|s)?(?![\\p{L}\\p{N}-])`, 'u');

let begriffe = null;
function laden() {
  if (begriffe) return begriffe;
  const out = [];
  if (existsSync(DIR)) {
    for (const datei of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
      const slug = datei.slice(0, -3);
      const roh = readFileSync(path.join(DIR, datei), 'utf8');
      const ende = roh.indexOf('\n---', 4);
      const fm = ende > 0 ? roh.slice(4, ende) : '';
      const term = feld(fm, 'term');
      if (!term) continue;
      // Klammerzusätze stehen so nie im Fließtext: aus
      // "Mopprolle (Walze)" wird "Mopprolle".
      const basis = term.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
      for (const name of new Set([basis, ...liste(fm, 'aliases')].filter(Boolean))) {
        out.push({ slug, name, re: muster(name) });
      }
    }
  }
  // Längste zuerst, damit "LiDAR-Navigation" vor "LiDAR" greift.
  begriffe = out.sort((a, b) => b.name.length - a.name.length);
  return begriffe;
}

/** Sammelt rekursiv alle schon vorhandenen Lexikon-Links. */
function vorhandene(knoten, treffer = new Set()) {
  if (knoten?.type === 'element' && knoten.tagName === 'a') {
    const m = /^\/lexikon\/([a-z0-9-]+)\/$/.exec(String(knoten.properties?.href ?? ''));
    if (m) treffer.add(m[1]);
  }
  for (const k of knoten?.children ?? []) vorhandene(k, treffer);
  return treffer;
}

export function lexikonPlugin() {
  return {
    name: 'saugradar-lexikon',
    before(root, ctx) {
      const quelle = ctx.fileURL ? fileURLToPath(ctx.fileURL).replace(/\\/g, '/') : '';
      const eigener = /\/content\/lexikon\/([^/]+)\.mdx?$/.exec(quelle)?.[1];
      ctx.data.lexErledigt = vorhandene(root);
      if (eigener) ctx.data.lexErledigt.add(eigener);
      ctx.data.lexGesetzt = 0;
      // Nur in Artikeln verlinken, nicht in kurzen Teasern oder Daten-Dateien.
      ctx.data.lexAktiv = /\/content\/(ratgeber|situationen|vergleiche|kategorien|lexikon)\//.test(quelle);
    },

    text(knoten, ctx) {
      if (!ctx.data.lexAktiv) return;
      if (ctx.data.lexGesetzt >= MAX_PRO_SEITE) return;

      // Kein Link innerhalb von Überschriften, Code oder bestehenden Links.
      let p = ctx.parent(knoten);
      let tiefe = 0;
      while (p && tiefe++ < 12) {
        if (p.type === 'element' && TABU.has(p.tagName)) return;
        p = ctx.parent(p);
      }

      const teile = [];
      let rest = knoten.value;

      for (const b of laden()) {
        if (ctx.data.lexGesetzt >= MAX_PRO_SEITE) break;
        if (ctx.data.lexErledigt.has(b.slug)) continue;
        const t = b.re.exec(rest);
        if (!t) continue;

        const vor = rest.slice(0, t.index);
        if (vor) teile.push({ type: 'text', value: vor });
        teile.push({
          type: 'element',
          tagName: 'a',
          properties: { href: `/lexikon/${b.slug}/`, class: 'lex' },
          children: [{ type: 'text', value: t[0] }],
        });
        rest = rest.slice(t.index + t[0].length);
        ctx.data.lexErledigt.add(b.slug);
        ctx.data.lexGesetzt++;
      }

      if (!teile.length) return;
      if (rest) teile.push({ type: 'text', value: rest });
      ctx.replaceNode(knoten, teile);
    },
  };
}

export default lexikonPlugin;
