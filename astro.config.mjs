import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { alternatePath, localeFor } from './src/i18n/routes.ts';

// El directorio y su posicionamiento editorial se relanzaron por completo en
// esta fecha. Se mantiene explícita para que un build posterior no finja que
// todas las URLs cambiaron cuando solo se recompiló el proyecto.
const SITE_RELAUNCH_LASTMOD = new Date('2026-08-04T00:00:00.000Z');
const GUIDES_CLUSTER_LASTMOD = new Date('2026-08-13T00:00:00.000Z');
const ROUTE_LASTMOD = new Map(
  [
    '/guias/',
    '/guias/seo-para-ia/',
    '/guias/como-aparecer-en-chatgpt/',
    '/guias/medir-visibilidad-en-chatgpt/',
    '/guias/como-convertirse-en-especialista-geo/',
  ].map((route) => [route, GUIDES_CLUSTER_LASTMOD]),
);

export default defineConfig({
  site: 'https://agentesva.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // /ir/* es la salida afiliado; /buscar es noindex (búsqueda cliente);
      // /descarga y /entrega son la entrega post-pago (noindex, SSR) — fuera del sitemap
      // /gracias es la entrega post-suscripción o post-diagnóstico y lleva noindex.
      filter: (page) =>
        !page.includes('/ir/') &&
        !page.includes('/buscar') &&
        !page.includes('/descarga') &&
        !page.includes('/entrega') &&
        !page.includes('/gracias') &&
        !page.includes('/assessment/thanks') &&
        !page.includes('/404') &&
        !['/recursos/contenido/','/recursos/ventas-marketing/','/resources/category/contenido/','/resources/category/ventas-marketing/'].includes(new URL(page).pathname),
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        const originalLastmod = ROUTE_LASTMOD.get(pathname) ?? SITE_RELAUNCH_LASTMOD;
        const alternate = alternatePath(pathname);
        const english = localeFor(pathname) === 'en';
        const enUrl = english ? item.url : alternate ? new URL(alternate, item.url).href : undefined;
        const esUrl = english ? alternate ? new URL(alternate, item.url).href : undefined : item.url;
        const seoRefresh = /^\/(herramienta(?:s)?|cursos|recursos|servicios)\//.test(pathname) || ['/precios-automatizacion-ia/','/como-trabajamos/'].includes(pathname);
        return { ...item, lastmod: english || seoRefresh || pathname === '/es/' ? new Date('2026-09-06T00:00:00Z') : originalLastmod,
          links: enUrl && esUrl ? [{lang:'en',url:enUrl},{lang:'es',url:esUrl},{lang:'x-default',url:enUrl}] : undefined };

      },

    }),
  ],
  build: {
    format: 'directory',
    // Emit client scripts as external files so a strict CSP (script-src 'self')
    // allows them — Astro would otherwise inline small scripts, which CSP blocks.
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
