// Wertet die Produktdaten aller Vergleiche aus und liefert die Zahlen für
// /marktdaten/. Alles entsteht zur Build-Zeit aus denselben Daten, die auch
// die Vergleichsseiten zeigen, es gibt also keine zweite Wahrheit.
import { subs, subBySlug, katBySlug, kategorien, getProducts, type Product, type SpecDef } from './catalog';

export type Verteilung = { label: string; anteil: number; anzahl: number };

export type SubStat = {
  slug: string;
  label: string;
  kategorie: string;
  kategorieLabel: string;
  anzahl: number;
  mitPreis: number;
  min: number | null;
  median: number | null;
  max: number | null;
  q1: number | null;
  q3: number | null;
  marken: number;
  topMarken: { name: string; anzahl: number }[];
  merkmale: Verteilung[];
};

const zahl = (p: Product) => p.amount;

function quantil(sortiert: number[], q: number): number | null {
  if (!sortiert.length) return null;
  const pos = (sortiert.length - 1) * q;
  const u = Math.floor(pos);
  const o = Math.ceil(pos);
  if (u === o) return sortiert[u];
  return sortiert[u] + (sortiert[o] - sortiert[u]) * (pos - u);
}

/** Anteile der Ausstattungsmerkmale, nur wo genug Produkte eine Angabe haben. */
function merkmale(specs: SpecDef[], produkte: Product[]): Verteilung[] {
  const out: Verteilung[] = [];
  for (const d of specs) {
    const bekannt = produkte.filter((p) => p.specs[d.key] !== null && p.specs[d.key] !== undefined);
    // Unter fünf Angaben ist ein Anteil nicht aussagekräftig.
    if (bekannt.length < 5) continue;

    if (d.type === 'bool') {
      const ja = bekannt.filter((p) => p.specs[d.key] === true).length;
      out.push({ label: d.label, anteil: ja / bekannt.length, anzahl: ja });
    } else if (d.type === 'enum') {
      const zaehler = new Map<string, number>();
      for (const p of bekannt) {
        const v = String(p.specs[d.key]);
        zaehler.set(v, (zaehler.get(v) ?? 0) + 1);
      }
      const beste = [...zaehler.entries()].sort((a, b) => b[1] - a[1])[0];
      if (beste) out.push({ label: `${d.label}: ${beste[0]}`, anteil: beste[1] / bekannt.length, anzahl: beste[1] });
    }
  }
  return out.sort((a, b) => b.anteil - a.anteil).slice(0, 5);
}

export function subStats(): SubStat[] {
  const out: SubStat[] = [];
  for (const s of subs) {
    const produkte = getProducts(s.slug);
    if (produkte.length < 3) continue;
    const preise = produkte.map(zahl).filter((x): x is number => typeof x === 'number').sort((a, b) => a - b);
    const marken = new Map<string, number>();
    for (const p of produkte) marken.set(p.brand, (marken.get(p.brand) ?? 0) + 1);
    out.push({
      slug: s.slug,
      label: subBySlug[s.slug].label,
      kategorie: s.kategorie,
      kategorieLabel: katBySlug[s.kategorie].label,
      anzahl: produkte.length,
      mitPreis: preise.length,
      min: preise[0] ?? null,
      median: quantil(preise, 0.5),
      max: preise[preise.length - 1] ?? null,
      q1: quantil(preise, 0.25),
      q3: quantil(preise, 0.75),
      marken: marken.size,
      topMarken: [...marken.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, anzahl]) => ({ name, anzahl })),
      merkmale: merkmale(subBySlug[s.slug].specs, produkte),
    });
  }
  return out;
}

export function gesamt(stats: SubStat[]) {
  const alleMarken = new Set<string>();
  let produkte = 0;
  let mitPreis = 0;
  let guenstigster = Infinity;
  let teuerster = 0;
  for (const s of subs) {
    for (const p of getProducts(s.slug)) {
      alleMarken.add(p.brand);
      produkte++;
      if (typeof p.amount === 'number') {
        mitPreis++;
        guenstigster = Math.min(guenstigster, p.amount);
        teuerster = Math.max(teuerster, p.amount);
      }
    }
  }
  return {
    produkte,
    mitPreis,
    vergleiche: stats.length,
    kategorien: kategorien.length,
    marken: alleMarken.size,
    guenstigster: Number.isFinite(guenstigster) ? guenstigster : null,
    teuerster: teuerster || null,
  };
}

export const euro = (n: number | null) =>
  n === null ? 'k. A.' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const prozent = (n: number) => `${Math.round(n * 100)} %`;
