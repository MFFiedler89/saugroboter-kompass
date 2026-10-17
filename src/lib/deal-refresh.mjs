/** Fixed UTC cron slots. A missed refresh stays overdue until a new snapshot arrives. */
export function nextScheduledCheck(updatedAt, minute = 17) {
  const timestamp = Date.parse(updatedAt || '');
  if (!Number.isFinite(timestamp) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  const day = new Date(timestamp);
  day.setUTCHours(0, minute, 0, 0);
  for (let slot = 0; slot <= 4; slot++) {
    const candidate = day.getTime() + slot * 6 * 3600000;
    if (candidate > timestamp) return candidate;
  }
  return null;
}
export function dealRefreshState(updatedAt, minute = 17, maxAgeHours = 24, now = Date.now()) {
  const timestamp = Date.parse(updatedAt || '');
  if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp >= maxAgeHours * 3600000) {
    return { label: 'Preisstand unbestätigt', state: 'unknown', next: null };
  }
  const next = nextScheduledCheck(updatedAt, minute);
  if (next === null) return { label: 'Preisstand unbestätigt', state: 'unknown', next: null };
  if (now >= next) return { label: 'Preisupdate ausstehend', state: 'due', next };
  const total = Math.ceil((next - now) / 60000);
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return { label: `Preisupdate in\n${hours} Std. ${minutes} Min.`, state: 'scheduled', next };
}

/** Re-read public snapshot metadata when due; never invent a successful refresh. */
export function mountDealRefresh(links) {
  let lastRequest = 0, pending = false;
  function render() {
    const now = Date.now();
    let due = false;
    for (const link of links) {
      const state = link.dataset.newSnapshot ? { label: 'Neue Preise verfügbar', state: 'available' } : dealRefreshState(link.dataset.updated, Number(link.dataset.minute), Number(link.dataset.maxAge), now);
      const label = link.querySelector('[data-deal-refresh-label]');
      if (label) label.textContent = state.label;
      link.dataset.refreshState = state.state;
      if (state.state === 'due' || state.state === 'unknown') due = true;
    }
    if (due && !pending && now - lastRequest >= 60000 && document.visibilityState !== 'hidden') {
      lastRequest = now; pending = true;
      fetch('/deal-status.json', { cache: 'no-store', credentials: 'omit' })
        .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
        .then(data => {
          const stamp = Date.parse(data.updatedAt || '');
          if (!Number.isFinite(stamp) || stamp > Date.now()) return;
          for (const link of links) {
            const previous = Date.parse(link.dataset.updated || '');
            if ((!Number.isFinite(previous) || stamp > previous) && Date.now() - stamp < Number(link.dataset.maxAge) * 3600000) link.dataset.newSnapshot = data.updatedAt;
          }
          render();
        }).catch(() => {}).finally(() => { pending = false; });
    }
  }
  render(); setInterval(render, 30000);
  document.addEventListener('visibilitychange', render);
}
