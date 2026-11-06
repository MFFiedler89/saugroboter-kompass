// A margin below the API licence's 24-hour limit, shared by build and edge.
export function isFresh(timestamp, now = Date.now()) {
  const age = now - Date.parse(timestamp || '');
  return Number.isFinite(age) && age >= 0 && age < 23 * 3600000;
}
