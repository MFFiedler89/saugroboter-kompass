// Baut zur Build-Zeit aus Taxonomie + ASIN-Listen + Live-Daten die Produktlisten.
import { subs, subBySlug, katBySlug, subsOf, kategorien } from '../data/taxonomy.mjs';
import { extractAll, formatSpec, specSortValue } from './extract.mjs';
import { AMAZON } from '../config';

export const DEMO = process.env.DEMO === '1';

type Live = {
  title?: string; brand?: string; features?: string[]; amount?: number; display?: string;
  savingsPercent?: number; availability?: string; url?: string; salesRank?: number | null;
  image?: { url: string; width: number; height: number };
};

const liveFiles = import.meta.glob('../data/live.json', { eager: true, import: 'default' }) as Record<string, { updatedAt: string | null; items: Record<string, Live> }>;
const demoLive = import.meta.glob('../data/demo/live.json', { eager: true, import: 'default' }) as typeof liveFiles;
const asinFiles = import.meta.glob('../data/asins/*.json', { eager: true, import: 'default' }) as Record<string, AsinFile>;
const demoAsins = import.meta.glob('../data/demo/asins/*.json', { eager: true, import: 'default' }) as Record<string, AsinFile>;

type AsinFile = { asins: string[]; hidden?: string[]; picks?: Record<string, string> };

const live = (DEMO ? Object.values(demoLive)[0] : Object.values(liveFiles)[0]) ?? { updatedAt: null, items: {} };
const lists: Record<string, AsinFile> = Object.fromEntries(
  Object.entries(DEMO ? demoAsins : asinFiles).map(([p, v]) => [p.split('/').pop()!.replace('.json', ''), v]),
);

export const updatedAt: string | null = live.updatedAt;

export type SpecDef = { key: string; label: string; type: string; unit?: string; sort?: string; filter?: string; options?: { value: string }[] };

export type Product = {
  asin: string;
  title: string;
  brand: string;
  image?: Live['image'];
  url: string;
  amount: number | null;
  display: string | null;
  savingsPercent?: number;
  salesRank: number | null;
  specs: Record<string, unknown>;
  tier: number; // 1 (günstig) … 5 (teuer), 0 = unbekannt
  pick?: { label: string; why: string; manual?: boolean };
  sub: string;
};

const tag = encodeURIComponent(AMAZON.partnerTag);
const withTag = (url: string | undefined, asin: string) => url ?? `https://${AMAZON.marketplace}/dp/${asin}?tag=${tag}`;

const cache = new Map<string, Product[]>();

export function getProducts(subSlug: string): Product[] {
  if (cache.has(subSlug)) return cache.get(subSlug)!;
  const sub = subBySlug[subSlug];
  const list = lists[subSlug] ?? { asins: [] };
  const hidden = new Set(list.hidden ?? []);
  let products: Product[] = [];
  for (const asin of new Set(list.asins)) {
    if (hidden.has(asin)) continue;
    const l = live.items[asin];
    if (!l || !l.title) continue; // nicht (mehr) verfügbar
    products.push({
      asin,
      title: cleanTitle(l.title),
      brand: l.brand?.trim() || l.title.split(' ')[0],
      image: l.image,
      url: withTag(l.url, asin),
      amount: typeof l.amount === 'number' ? l.amount : null,
      display: l.display ?? null,
      savingsPercent: l.savingsPercent,
      salesRank: l.salesRank ?? null,
      specs: extractAll(sub.specs, l.title, l.features ?? []),
      tier: 0,
      sub: subSlug,
    });
  }

  // Preislage: Position innerhalb der Kategorie in 5 Stufen
  const prices = products.map((p) => p.amount).filter((x): x is number => x !== null).sort((a, b) => a - b);
  for (const p of products) {
    if (p.amount === null || prices.length < 3) continue;
    const idx = prices.findIndex((x) => x >= p.amount!);
    p.tier = Math.min(5, Math.floor((idx / prices.length) * 5) + 1);
  }

  // Beliebtheit (Amazon-Verkaufsrang) als Standard-Sortierung
  products.sort((a, b) => (a.salesRank ?? 1e12) - (b.salesRank ?? 1e12));

  // Empfehlungen: manuell (picks) vor automatisch (Regeln aus der Taxonomie)
  const used = new Set<string>();
  for (const [asin, label] of Object.entries(list.picks ?? {})) {
    const p = products.find((x) => x.asin === asin);
    if (p) { p.pick = { label, why: 'Redaktionstipp', manual: true }; used.add(asin); }
  }
  for (const rule of sub.picks ?? []) {
    let pool = products.filter((p) => !used.has(p.asin) && rule.filter(p));
    if (rule.sort === 'price') pool = pool.filter((p) => p.amount !== null).sort((a, b) => a.amount! - b.amount!);
    const p = pool[0];
    if (p) { p.pick = { label: rule.label, why: rule.why }; used.add(p.asin); }
  }

  cache.set(subSlug, products);
  return products;
}

export function getPicks(subSlug: string) {
  return getProducts(subSlug).filter((p) => p.pick);
}

function cleanTitle(t: string) {
  return t.replace(/\s+/g, ' ').trim();
}

export function shortTitle(t: string, n = 80) {
  return t.length > n ? t.slice(0, t.lastIndexOf(' ', n)) + ' …' : t;
}

export const MIN_PRODUCTS = 5;
/** Ab wie vielen Produkten eine Vergleichstabelle sinnvoll ist */
export const hasProducts = (subSlug: string) => getProducts(subSlug).length >= MIN_PRODUCTS;
/**
 * Alle Unterkategorien werden veröffentlicht, auch ohne Produktdaten.
 * Die Seiten tragen den redaktionellen Erklärtext; die Angebotsliste
 * erscheint, sobald genug Produkte vorliegen (siehe hasProducts).
 */
export const activeSubs = () => subs;
export const activeSubsOf = (kat: string) => subsOf(kat);
export const totalProducts = () => subs.reduce((n, s) => n + getProducts(s.slug).length, 0);

export function cardSpecs(subSlug: string, p: Product) {
  const sub = subBySlug[subSlug];
  return sub.card
    .map((k: string) => sub.specs.find((d: SpecDef) => d.key === k))
    .filter(Boolean)
    .map((d: SpecDef) => ({ label: d.label, text: formatSpec(d, p.specs[d.key]), known: p.specs[d.key] !== null }));
}

export function formatDateTime(iso: string | null) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date(iso));
}

export { subs, subBySlug, katBySlug, subsOf, kategorien, formatSpec, specSortValue };
export const subUrl = (slug: string) => `/${subBySlug[slug].kategorie}/${slug}/`;
export const katUrl = (slug: string) => `/${slug}/`;
