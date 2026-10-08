// Liest Ausstattungsmerkmale aus Produkttitel + Produktmerkmalen (Amazon-Daten).
// Ergebnis ist bewusst vorsichtig: Was nicht eindeutig erkennbar ist, bleibt leer
// und wird als „k. A.“ angezeigt, niemals geraten.
//
// Gegenüber Ergo-Kompass drei Erweiterungen, die für Saugroboter nötig sind
// (abwärtskompatibel, alte Spec-Definitionen funktionieren unverändert):
//
//   thousands: true   → deutscher Tausenderpunkt wird entfernt, damit aus
//                       „25.000 Pa“ nicht der Wert 25 wird
//   convert(v, m)     → Einheitenumrechnung anhand der Treffergruppen,
//                       z. B. „81 mm“ → 8,1 cm
//   reject: /…/       → Treffer verwerfen, wenn im Umfeld ein Begriff steht,
//                       der eine andere Größe bezeichnet (z. B. „Bodenfreiheit“
//                       statt Bauhöhe)

const num = (s, def) => {
  let t = String(s).replace(/\s/g, '');
  if (def?.thousands) t = t.replace(/\./g, '');
  return parseFloat(t.replace(',', '.'));
};

function all(re, text) {
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  return [...text.matchAll(r)];
}

/** Text im Umfeld eines Treffers, für den reject-Check. */
const around = (text, m, span = 60) => text.slice(Math.max(0, m.index - span), m.index + m[0].length + span);

/** Erste nicht-leere Zahlengruppe eines Treffers. */
const firstNum = (m) => {
  for (let i = 1; i < m.length; i++) if (m[i] != null && /\d/.test(m[i])) return m[i];
  return undefined;
};

export function extractSpec(def, text) {
  switch (def.type) {
    case 'bool':
      return def.re.test(text) ? true : null;
    case 'enum': {
      for (const o of def.options) if (o.re.test(text)) return o.value;
      return null;
    }
    case 'number': {
      const vals = all(def.re, text)
        .filter((m) => !(def.reject && def.reject.test(around(text, m))))
        .map((m) => {
          let v = num(firstNum(m), def);
          if (def.convert && Number.isFinite(v)) v = def.convert(v, m);
          return v;
        })
        .filter((v) => Number.isFinite(v) && (def.min == null || v >= def.min) && (def.max == null || v <= def.max));
      if (!vals.length) return null;
      if (def.pick === 'max') return Math.max(...vals);
      if (def.pick === 'min') return Math.min(...vals);
      return vals[0];
    }
    case 'range': {
      for (const m of all(def.re, text)) {
        if (def.reject && def.reject.test(around(text, m))) continue;
        const a = num(m[1], def), b = num(m[2], def);
        if (a < b && (def.min == null || a >= def.min) && (def.max == null || b <= def.max)) return [a, b];
      }
      return null;
    }
    case 'dims': {
      for (const m of all(def.re, text)) {
        if (def.reject && def.reject.test(around(text, m))) continue;
        let a = num(m[1], def), b = num(m[2], def);
        if (b > a) [a, b] = [b, a];
        if (a >= def.aMin && a <= def.aMax && b >= def.bMin && b <= def.bMax) return { a, b };
      }
      return null;
    }
    default:
      return null;
  }
}

export function extractAll(specDefs, title = '', features = []) {
  const text = [title, ...(features || [])].join(' | ');
  return Object.fromEntries(specDefs.map((d) => [d.key, extractSpec(d, text)]));
}

const fmtN = (n) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(n);

export function formatSpec(def, v) {
  if (v === null || v === undefined) return 'k. A.';
  const u = def.unit ? ` ${def.unit}` : '';
  switch (def.type) {
    case 'bool': return v ? 'ja' : 'k. A.';
    case 'range': return `${fmtN(v[0])} bis ${fmtN(v[1])}${u}`;
    case 'dims': return `${fmtN(v.a)} × ${fmtN(v.b)}${u}`;
    case 'number': return def.key === 'traglast' || def.key === 'belast' || def.key === 'schwelle' ? `bis ${fmtN(v)}${u}` : `${fmtN(v)}${u}`;
    default: return String(v);
  }
}

/** Wert für Sortierung/Filter im Browser */
export function specSortValue(def, v) {
  if (v === null || v === undefined) return null;
  if (def.type === 'range') return def.sort === 'max' ? v[1] : v[1] - v[0];
  if (def.type === 'dims') return v.a;
  if (def.type === 'bool') return v ? 1 : 0;
  return v;
}
