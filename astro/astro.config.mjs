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
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES' },
      },
    }),
  ],
  build: {
    format: 'directory',
  },
});
