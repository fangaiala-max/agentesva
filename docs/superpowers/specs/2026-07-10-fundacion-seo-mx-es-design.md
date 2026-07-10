# Fundación Técnica SEO — Visibilidad en México + España

**Fecha:** 2026-07-10
**Estado:** Diseño aprobado — pendiente de plan de implementación
**Fase:** 1 de N (fundación). No genera tráfico por sí sola; desbloquea y mide para que el contenido futuro compounde.

## Contexto y objetivo

**Objetivo de negocio:** que agentesva.com sea un medio-directorio de IA de referencia, con tráfico creciente y **medible** en México y España (autoridad / tráfico de marca — no CRO ni leads en esta fase).

**Mercados prioritarios:** México + España (una sola web en `es`, sin duplicar contenido).

**Motor elegido:** fundación técnica SEO. No se puede hacer crecer una visibilidad que no se mide, y las señales geo actuales sesgan el sitio a España, frenando México.

### Estado actual (hallazgos de la exploración)

- **Contenido:** ~88 páginas indexables (54 herramientas, 16 cursos, 8 estudios, 7 noticias, 3 recursos).
- **Base SEO existente (correcta):** title/description dinámicos, canonical, OG completo, Twitter card, RSS, JSON-LD de entidades (`entityGraph` serializado en `BaseLayout`), sitemap filtrado (`/ir/`, `/buscar`, `/descarga` excluidos), robots.txt que da bienvenida a crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, etc.).
- **Bloqueadores para México:**
  - `geo.placename: España` + `geo.region: ES` + `og:locale: es_ES` **hardcodeados** en `src/layouts/BaseLayout.astro` → señal "soy de España".
  - **Sin analytics** (solo Search Console verificado vía `public/googleb15b297fd282b611.html`). Vuelo a ciegas.
  - Fuentes desde `fonts.googleapis.com` externo → bloquea render (CWV) + tercero.
  - Sin `hreflang` ni estrategia de doble mercado explícita.
- **Legal:** `src/pages/cookies.astro` declara hoy que NO se instalan cookies de terceros de perfilado y por eso "no es necesario banner". Añadir GA4 rompe ese estado y obliga a consentimiento.
- **CSP:** estricta (`script-src 'self'`) — los scripts de cliente se emiten como archivos externos a propósito. GA4 (script externo de Google) choca con esto.
- **Tooling ya presente:** Vitest + happy-dom (52 tests), CI en cada PR (`.github/workflows/test.yml`).

## Alcance (Lean)

Tres componentes + testing. Explícitamente **fuera de alcance** en esta fase: auditoría completa de schema, arquitectura de enlazado interno, overhaul de imágenes, IndexNow/Bing, páginas por país. Se decidirán con datos una vez haya baseline.

---

## Sección 1 — Medición: GA4 + consentimiento (GDPR)

- **GA4** con **Google Consent Mode v2** en estado `denied` por defecto; solo pasa a `granted` tras aceptación explícita.
- **Banner de consentimiento** (componente nuevo, con estado, en `es`): opciones aceptar / rechazar (y opcional gestionar). Persiste la elección en `localStorage`. GA4 no dispara hasta aceptar.
- **Choque GA4 vs CSP:** resolver ampliando `script-src`/`connect-src`/`img-src` con los dominios de Google necesarios, o cargando GA4 vía Partytown. Decisión técnica a fijar en el plan; requisito: no debilitar la CSP más de lo necesario.
- **Actualizar legales:** `src/pages/cookies.astro` y `src/pages/privacidad.astro` declarando GA4 (finalidad = analítica, tercero = Google, base legal = consentimiento, duración de cookies).
- **Search Console:** verificar cobertura, (re)enviar sitemap, y enlazar GA4 ↔ GSC para ver queries + países juntos.

## Sección 2 — Señales geo: España → México + España

Movimiento ganador: no "fingir ser mexicano" sino **dejar de fingir ser español** y presentarse como español-neutro, quedando elegible en ambos mercados.

- En `src/layouts/BaseLayout.astro`:
  - **Eliminar** `geo.placename: España` y `geo.region: ES` (meta legacy que solo encasillan; no se reemplazan por `MX`).
  - `og:locale: es_ES` → **`es`** neutro (opcionalmente añadir `og:locale:alternate = es_MX`).
- **hreflang mínimo:** `es` + `x-default` apuntando a la misma URL (español universal, cualquier región). **Sin** páginas por país → se evita contenido duplicado y mantenimiento x2.
- `html lang="es"` se mantiene (ya neutro).
- Fechas en `src/components/ArticleCard.astro` (`toLocaleDateString('es-ES', …)`) se mantienen (formato prácticamente idéntico MX/ES; no vale ramificar).

## Sección 3 — Core Web Vitals: self-host de fuentes

- Hoy DM Serif Display, DM Sans y JetBrains Mono cargan desde `fonts.googleapis.com` externo (bloquea render + `preconnect` + tercero de privacidad).
- **Self-host:** descargar `.woff2`, servir desde `/fonts/`, `@font-face` local con `font-display: swap`, quitar `preconnect`/`<link>` a Google Fonts. Mejora LCP/CLS y elimina el tercero.

## Sección 4 — Testing y verificación

- **Build verde** (`npm run build`) tras cada cambio.
- **Tests (Vitest):** cobertura del banner de consentimiento — estado `denied`→`granted`, persistencia en `localStorage`, y que GA4 no dispare sin aceptación.
- **Verificación en preview de Vercel:** el banner aparece; GA4 no carga hasta aceptar (comprobado en Network tab); meta-tags geo correctos en el HTML servido; fuentes desde `/fonts/`.
- **Post-deploy:** GA4 Realtime recibe eventos y el desglose por país separa MX/ES.

## Criterios de éxito (fase 1)

1. GA4 recolectando datos con consentimiento válido (GDPR en regla, legales actualizados).
2. Señales geo España-only eliminadas; sitio presentado como `es` neutro con hreflang `es`/`x-default`.
3. Fuentes self-hosted (sin request a Google Fonts en la carga).
4. Baseline de tráfico por país (MX vs ES) disponible para priorizar la fase 2 con datos.

## Fuera de alcance / fases futuras

- Fase 2 (a decidir con datos): profundización de schema (Article/Breadcrumb/FAQ/ItemList), enlazado interno, indexación/huérfanas, imágenes/CWV avanzado, IndexNow/Bing.
- Motor de contenido (pipeline de noticias diarias — plan ya existente) y distribución off-site: fases posteriores, una vez la fundación mide y no estorba.
