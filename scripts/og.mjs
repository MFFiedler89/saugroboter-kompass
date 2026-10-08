// Erzeugt nach dem Build das Vorschaubild fuer geteilte Links (Open Graph).
// Es wird aus public/logo.svg zusammengesetzt, es gibt also nur eine Quelle
// fuer die Bildmarke und keine Schriftdatei, die mitgeliefert werden muss.
// Titel und Beschreibung zeigen die Netzwerke ohnehin neben dem Bild an.
import { readFileSync, existsSync, statSync } from 'node:fs';

const LOGO = 'public/logo.svg';
const OUT = 'dist/og-default.png';
const W = 1200;
const H = 630;
const MARK_HEIGHT = 300;

function card() {
  const svg = readFileSync(LOGO, 'utf8');
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const box = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!box) throw new Error('viewBox in public/logo.svg nicht gefunden');
  const scale = MARK_HEIGHT / Number(box[2]);
  const lw = Number(box[1]) * scale;

  // Der dunkle Grund traegt die Marke selbst, deshalb wird die Fuellung
  // der Scheibe transparent gesetzt.
  const light = inner.replace(/fill="#1b3a6b"/g, 'fill="#0e1c33"');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + '<defs><radialGradient id="g" cx="78%" cy="18%" r="105%">'
    + '<stop offset="0" stop-color="#2a5699"/>'
    + '<stop offset=".46" stop-color="#1b3a6b"/>'
    + '<stop offset="1" stop-color="#0c1726"/>'
    + '</radialGradient></defs>'
    + `<rect width="${W}" height="${H}" fill="url(#g)"/>`
    + `<g transform="translate(${((W - lw) / 2).toFixed(1)} ${((H - MARK_HEIGHT) / 2).toFixed(1)}) scale(${scale.toFixed(4)})">${light}</g>`
    + '</svg>';
}

if (!existsSync(LOGO)) {
  console.warn(`⚠️  ${LOGO} fehlt, Vorschaubild wird uebersprungen.`);
} else {
  try {
    const { default: sharp } = await import('sharp');
    await sharp(Buffer.from(card()), { density: 144 })
      .resize(W, H)
      .png({ compressionLevel: 9, palette: true })
      .toFile(OUT);
    console.log(`✓ ${OUT} erzeugt (${Math.round(statSync(OUT).size / 1024)} kB)`);
  } catch (e) {
    // Ein fehlendes Vorschaubild darf den Build nicht scheitern lassen.
    console.warn(`⚠️  Vorschaubild konnte nicht erzeugt werden: ${e.message}`);
  }
}
