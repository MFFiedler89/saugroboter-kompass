import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = (await getCollection('ratgeber', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
  return rss({
    title: `${SITE.name}: Ratgeber`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.h1 ?? p.data.title,
      description: p.data.description,
      pubDate: p.data.publishDate,
      link: `/ratgeber/${p.id}/`,
    })),
    customData: '<language>de-de</language>',
  });
}
