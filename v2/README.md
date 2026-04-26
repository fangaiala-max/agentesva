# `/v2/` — Astro Staging Preview

**Generado:** 2026-04-26 desde `astro/dist/` con `base: '/v2'`.

## Qué es esto

Build de Astro deployado como **preview de staging** para QA visual contra el sitio actual (HTML estático en root).

## Cómo comparar

Abre estas URLs en pestañas paralelas:

| Sitio actual (HTML estático) | Astro preview |
|---|---|
| https://agentesva.com/ | https://agentesva.com/v2/ |
| https://agentesva.com/sobre/ | https://agentesva.com/v2/sobre/ |
| https://agentesva.com/precios/ | https://agentesva.com/v2/precios/ |
| https://agentesva.com/como-empezar/ | https://agentesva.com/v2/como-empezar/ |
| https://agentesva.com/diagnostico/ | https://agentesva.com/v2/diagnostico/ |
| https://agentesva.com/faq/ | https://agentesva.com/v2/faq/ |
| https://agentesva.com/servicios/ | https://agentesva.com/v2/servicios/ |
| https://agentesva.com/como-funciona/ | https://agentesva.com/v2/como-funciona/ |
| https://agentesva.com/legal/ | https://agentesva.com/v2/legal/ |
| https://agentesva.com/catalogo/ | https://agentesva.com/v2/catalogo/ |
| https://agentesva.com/catalogo/restaurante/ | https://agentesva.com/v2/catalogo/restaurante/ |
| https://agentesva.com/catalogo/consultorio/ | https://agentesva.com/v2/catalogo/consultorio/ |

## Limitación conocida

Los `<a href="/...">` dentro de las páginas Astro siguen apuntando al root (sitio estático). **No se rompe nada** — al hacer click navegas al sitio actual. Esto es intencional para que la migración sea reversible.

Cuando se decida swap total a Astro:
1. Cambiar `astro.config.mjs` → `base: '/'` (o eliminar)
2. Rebuild
3. Mover output a root + archivar HTML estático
4. Los hrefs se resuelven correctamente

## Cómo regenerar

```bash
cd astro/
npm run build
cd ..
rm -rf v2/
cp -R astro/dist/* v2/
git add v2/
git commit -m "chore: rebuild /v2/ Astro preview"
git push
```

## Estado de migración

- ✅ 24 páginas generadas
- ✅ Tokens v2 unificados (paper/ink/clay)
- ✅ Content collections funcionando (casos x3, industrias x12)
- ✅ HubSpot quiz integrado en /diagnostico/
- ⚠️ Industrias collection vs catalog data file → consolidar en Week 3
- ⚠️ RSS feed `/v2/rss.xml` aún no creado
- ⚠️ API routes (`/api/subscribe`, `/api/wa`) siguen como Vercel functions en root, sin migrar a Astro

## NoIndex

`/v2/` no está en `sitemap-index.xml` del sitio principal. Solo en el sitemap interno del Astro build. Robots.txt puede añadir `Disallow: /v2/` si queremos asegurar que Google no indexa el preview.
