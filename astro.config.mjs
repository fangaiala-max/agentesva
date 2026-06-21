import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://agentesva.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // /ir/* es la salida afiliado (no indexable)
      filter: (page) => !page.includes('/ir/'),
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
