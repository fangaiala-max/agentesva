import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// El directorio y su posicionamiento editorial se relanzaron por completo en
// esta fecha. Se mantiene explícita para que un build posterior no finja que
// todas las URLs cambiaron cuando solo se recompiló el proyecto.
const SITE_RELAUNCH_LASTMOD = new Date('2026-08-04T00:00:00.000Z');

export default defineConfig({
  site: 'https://agentesva.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // /ir/* es la salida afiliado; /buscar es noindex (búsqueda cliente);
      // /descarga y /entrega son la entrega post-pago (noindex, SSR) — fuera del sitemap
      // /gracias es la entrega post-suscripción y también lleva noindex.
      filter: (page) =>
        !page.includes('/ir/') &&
        !page.includes('/buscar') &&
        !page.includes('/descarga') &&
        !page.includes('/entrega') &&
        !page.includes('/gracias'),
      serialize: (item) => ({ ...item, lastmod: SITE_RELAUNCH_LASTMOD }),
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es' },
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
