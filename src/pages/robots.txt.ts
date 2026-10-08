// Einzige Quelle für robots.txt. Die Sitemap-Adresse kommt aus der
// Astro-Konfiguration, damit sie bei einer anderen Domain automatisch stimmt.
import type { APIRoute } from 'astro';

// KI-Suchen und Assistenten dürfen die Seite ausdrücklich lesen und zitieren.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'Amazonbot',
  'meta-externalagent',
  'cohere-ai',
];

export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
    `Sitemap: ${new URL('sitemap-index.xml', site).href}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
