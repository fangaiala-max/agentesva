import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? 'https://agentesva.com';
  const estudios = await getCollection('estudios');
  const noticias = await getCollection('noticias');

  const items = [
    ...estudios.map((e) => ({
      title: e.data.titulo,
      description: e.data.descripcion,
      pubDate: e.data.fecha,
      link: `/estudios/${e.id}`,
      categories: [e.data.tema],
    })),
    ...noticias.map((n) => ({
      title: n.data.titulo,
      description: n.data.descripcion,
      pubDate: n.data.fecha,
      link: `/noticias/${n.id}`,
      categories: [n.data.tema],
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'AgentesVA — IA en español',
    description: 'Estudios, comparativas y noticias de inteligencia artificial para PyMEs, en español.',
    site,
    items,
    customData: '<language>es</language>',
  });
}
