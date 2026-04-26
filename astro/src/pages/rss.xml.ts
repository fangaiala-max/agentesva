import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: 'AgentesVA Blog',
    description: 'Tutoriales técnicos, casos reales y análisis de automatización con IA para PyMEs en España y Latinoamérica.',
    site: context.site!,
    items: posts.slice(0, 30).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: `<language>es-ES</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
