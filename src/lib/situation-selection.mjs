// Only positively documented features satisfy a rule. Unknown is never false.
export function selectSituation(config, getProducts, fallbackSubs = []) {
  const used = new Set(), selected = [];
  const identity = config.identity ?? (p => p.asin);
  const pools = config.rules.map(rule => {
    const pool = getProducts(rule.sub).filter(p => p.availability !== 'OUT_OF_STOCK' && rule.match(p));
    if (rule.price) pool.sort((a,b) => (a.amount ?? Infinity) - (b.amount ?? Infinity));
    return {rule, pool};
  });
  const add = (p, rule, verified = true) => {
    if (!p || used.has(identity(p)) || selected.length >= 3) return;
    used.add(identity(p));
    selected.push({product:p, reason:rule.reason(p), label:rule.label, verified});
  };
  // Give each use case a place before filling remaining cards.
  for (const {rule,pool} of pools) add(pool.find(p => !used.has(identity(p))),rule);
  for (const {rule,pool} of pools) for (const p of pool) add(p,rule);
  if (!selected.length) {
    for (const sub of fallbackSubs) {
      for (const p of getProducts(sub).filter(p => p.availability !== 'OUT_OF_STOCK')) {
        add(p,{label:'Eignung noch prüfen',reason:()=>'Aus einem thematisch verwandten Vergleich. Die entscheidenden Merkmale für diese Situation sind in unseren Produktdaten nicht ausreichend belegt.'},false);
      }
    }
  }
  return selected;
}
