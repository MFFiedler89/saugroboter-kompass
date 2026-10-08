import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);
const kat = z.enum(['saugroboter', 'wischroboter', 'allgemein']);
const base = {
  title: z.string().max(70),
  description: z.string().max(170),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
};

// Kategorie-Hubs (/saugroboter/ …) – id = Kategorie-Slug
const kategorien = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/kategorien' }),
  schema: z.object({ ...base, h1: z.string(), intro: z.string() }),
});

// Vergleichsseiten (/saugroboter/saugroboter-mit-absaugstation/) – id = Unterkategorie-Slug aus taxonomy.mjs
const vergleiche = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/vergleiche' }),
  schema: z.object({ ...base, h1: z.string(), intro: z.string(), faq }),
});

// Situationen (/situationen/haushalt-mit-tieren/)
const situationen = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/situationen' }),
  schema: z.object({ ...base, h1: z.string(), navLabel: z.string(), teaser: z.string(), intro: z.string(), subs: z.array(z.string()).default([]), faq }),
});

// Ratgeber
const ratgeber = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ratgeber' }),
  schema: z.object({ ...base, h1: z.string().optional(), cluster: kat, pillar: z.string().optional(), quickAnswer: z.string().optional(), faq }),
});

// Lexikon (/lexikon/lidar-navigation/)
const lexikon = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lexikon' }),
  // aliases: weitere Schreibweisen, unter denen der Begriff im Fließtext
  // automatisch verlinkt wird (siehe src/lib/satteri-lexikon.mjs)
  schema: z.object({ term: z.string(), description: z.string().max(170), short: z.string(), aliases: z.array(z.string()).default([]), related: z.array(z.string()).default([]), subs: z.array(z.string()).default([]) }),
});

export const collections = { kategorien, vergleiche, situationen, ratgeber, lexikon };
