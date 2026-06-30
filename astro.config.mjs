import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://agentesva.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // /ir/* es la salida afiliado; /buscar es noindex (búsqueda cliente) — fuera del sitemap
      filter: (page) => !page.includes('/ir/') && !page.includes('/buscar'),
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES' },
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
