# Testing — AgentesVA

100% de cobertura es la clave para vibe-codear con confianza: los tests te dejan moverte rápido y shippear sin miedo. Sin ellos, es yolo coding.

## Framework

**Vitest** (`vitest run`) con entorno **happy-dom** para los scripts de cliente. Config en [`vitest.config.ts`](./vitest.config.ts); stubs de navegador (IntersectionObserver) en [`tests/setup.ts`](./tests/setup.ts).

## Cómo ejecutar

```bash
npm run test        # suite completa (CI usa esto)
npx vitest          # modo watch en desarrollo
```

CI: `.github/workflows/test.yml` ejecuta la suite en cada push a `main` y en cada PR.

## Capas

La columna "Dónde" nombra ejemplos representativos de cada capa, no el índice completo: `ls tests/` es la lista real.

| Capa | Qué cubre | Dónde |
|---|---|---|
| Unit | Helpers puros (`src/data/*.ts`: FAQs derivadas, alternativas, paleta) | `tests/tools.test.ts` |
| Unit | Colecciones SEO y generador local de prompts, incluidos vacíos y errores de portapapeles | `tests/prompt-landings.test.ts`, `tests/prompt-generator.test.ts` |
| Unit | Distintivos "Nuevo"/"Tendencia" y agrupación por mes de `/noticias` | `tests/noticias-badges.test.ts`, `tests/noticias-meses.test.ts` |
| DOM/integración | Scripts de cliente sobre fixtures de DOM (filtros, vistas, comparador, CTA, marcadores) | `tests/home.test.ts`, `tests/directory.test.ts` |
| Funnel comercial | Clasificación, resultado, cierre por perfil, envío, foco y offset móvil del diagnóstico | `tests/diagnostico.test.ts`, `tests/diagnostico-gracias.test.ts`, `tests/diagnostic-focus.regression-1.test.ts` |
| Contrato de portada comercial | Jerarquía del recorrido, enlaces, atribución de CTAs, precio canónico, fuente única de áreas, claims verificables y duración coherente del diagnóstico | `tests/commercial-navigation.test.ts`, `tests/cro-phase1.test.ts` |
| API/CRM | Validación server-side, creación/actualización en Notion, deduplicación concurrente por instancia, consentimiento y reintentos transitorios | `tests/diagnostic-api.test.ts`, `tests/diagnostic-notion.test.ts` |
| Guards de fuente | Lo que no se puede ejercitar sin arrancar Astro: leen el `.astro` y fallan si se pierde el cableado (props de `ArticleCard`, rutas de prompts) o si vuelve un handler en línea que la CSP bloquea | `tests/noticias-listado.test.ts`, `tests/prompts-pages.test.ts`, `tests/csp-inline-handlers.test.ts` |
| Contrato editorial GEO | Schema, atribución de datos, recursos visuales, enlazado interno, metadatos sociales, sitemap y legibilidad móvil de la guía | `tests/especialista-geo-guide.test.ts` |
| Build | Esquemas Zod de content collections y verificación del HTML/sitemap generado; un contenido o metadato inválido rompe `npm run build` | `src/content.config.ts`, `src/content-schemas/guias.ts`, `scripts/verify-built-geo-guide.mjs`, `scripts/verify-built-bilingual-ui.mjs`, `scripts/verify-built-seo.mjs` |
| Smoke manual | Flujos reales en navegador (dev/preview) antes de shippear | /qa, /verify |

## Convenciones

- Archivos `tests/<módulo>.test.ts`, un `describe` por comportamiento, asserts sobre lo que el usuario ve (`aria-pressed`, `hidden`, `textContent`) — nunca `toBeDefined()`.
- Fixtures de DOM como template strings con datos estáticos del propio test.
- Al escribir una función nueva, escribe su test; al arreglar un bug, escribe el test de regresión; cada condicional nueva, testea ambas ramas.
- Nunca importar secretos ni credenciales en tests.
- Happy DOM mantiene desactivada la evaluación de JavaScript externo. `handleDisabledFileLoadingAsSuccess` evita ruido al probar la inyección de GA4 sin hacer peticiones de red; `tests/happy-dom-settings.test.ts` protege esa configuración.

## Paridad inglés/español

`npm run build` comprueba el HTML de 128 páginas principales y fichas: idioma, navegación móvil, destinos de CTA, intención de precios, timeline, pestañas y datos estructurados. `tests/bilingual-ui.test.ts` cubre filtros combinados, guardado y conservación del contexto al cambiar de idioma.

Las comprobaciones de formulario simulan respuestas HTTP; no prueban autenticación de Brevo, reenvío ni entrega efectiva de email.

### SEO regression guard

`npm run build` now runs `scripts/verify-built-seo.mjs` against generated HTML. It checks descriptive tool/service titles, visible FAQ/schema consistency, four-level tool breadcrumbs, unique indexable category descriptions, empty-category sitemap exclusion and static skip-link targets.
