# AgentesVA — Astro

Astro 5.x scaffold conviviendo con el sitio HTML estático de la raíz del repo. Producción sigue sirviéndose desde `/index.html` en Vercel; este subdirectorio se migrará página a página.

## Comandos

```bash
cd astro
npm install
npm run dev      # http://localhost:4321
npm run build    # genera ./dist
npm run preview
```

## Stack

- Astro 5 (`output: 'static'`, adapter Vercel)
- `@astrojs/tailwind` (Tailwind 3, modo no-base)
- `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/vercel`, `astro-icon`
- Content Collections: `blog`, `casos`, `industrias`

## Añadir un post de blog

Crea `src/content/blog/<slug>.md`:

```md
---
title: "Cómo automatizar reservas con WhatsApp + Make"
description: "Tutorial paso a paso..."
publishedAt: 2026-05-01
tags: ["make", "whatsapp", "restaurantes"]
pillar: "make-tutorial"
draft: false
---

Contenido del post en Markdown / MDX...
```

(En Week 2 se añadirá `src/pages/blog/[slug].astro` para renderizar.)

## Plan de migración Week 2

Páginas pendientes de migrar desde la raíz HTML:

- [ ] `/servicios/`
- [ ] `/catalogo/`
- [ ] `/como-funciona/`
- [ ] `/precios/`
- [ ] `/diagnostico/`
- [ ] `/sobre/`
- [ ] `/faq/`
- [ ] `/blueprints/`
- [ ] `/guias/`
- [ ] `/gracias/`, `/gracias-gratis/`
- [ ] `/legal/*` (3 páginas)
- [ ] `/templates/*`
- [ ] `/api/*` → `src/pages/api/*.ts` (Vercel functions)
- [ ] `/blog/[slug].astro` + index
- [ ] `/industrias/[slug].astro` (genera 12 páginas)
- [ ] `/casos/[slug].astro` (genera 3 páginas)
- [ ] `MobileNav` real (bottom nav móvil)
- [ ] Sitemap canónico (vía `@astrojs/sitemap`)
- [ ] RSS feed para blog (`src/pages/rss.xml.ts`)
- [ ] Verificar paridad visual con QA + Playwright

## Tracking

- GA4: `G-87SBNWCTWZ`
- Mixpanel: `8fa5118db89d01d0316661d3b0adcc39` (host EU)
- Calendly click tracking en `BaseLayout.astro`
