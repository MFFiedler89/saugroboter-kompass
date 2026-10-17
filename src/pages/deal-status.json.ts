import { updatedAt } from '../lib/catalog';
export function GET() {
  return new Response(JSON.stringify({ updatedAt }), { headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' } });
}
