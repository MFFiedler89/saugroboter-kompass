// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { lexikonPlugin } from './src/lib/satteri-lexikon.mjs';

// Die echte Domain wird über die Umgebungsvariable SITE_URL gesetzt
// (lokal in .env, auf Cloudflare/GitHub als Variable).
const site = process.env.SITE_URL || 'https://saugradar.de';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Automatische Verlinkung der Fachbegriffe aufs Lexikon
  markdown: { processor: satteri({ hastPlugins: [lexikonPlugin()] }) },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(impressum|datenschutz)\/$/.test(page),
      i18n: { defaultLocale: 'de', locales: { de: 'de-DE' } },
    }),
  ],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
