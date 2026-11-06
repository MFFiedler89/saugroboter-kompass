// Expire licensed data before sending HTML, including to clients without JavaScript.
export function isFresh(timestamp, now = Date.now()) {
  const age = now - Date.parse(timestamp || '');
  return Number.isFinite(age) && age >= 0 && age < 23 * 3600000;
}
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;
    const now = Date.now();
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    const guarded = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    return new HTMLRewriter().on('[data-amazon-updated], [data-fetched-at]', {
      element(element) {
        const stamp = element.getAttribute('data-amazon-updated') || element.getAttribute('data-fetched-at');
        if (!isFresh(stamp, now)) element.remove();
      }
    }).transform(guarded);
  }
};
