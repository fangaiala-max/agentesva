# Diseño — Búsqueda global con Pagefind (épico #56)

**Fecha:** 2026-06-30 · **Épico:** #56 (PRD) · **Rama:** `feat/search-pagefind`
**Fuentes de verdad:** [business brief §8](./2026-06-21-agentesva-directory-business-brief.md) ("Pagefind, estático, gratis") · `DESIGN.md` (Futurista) · `docs/brand-guidelines.md`

## Resumen

Añadir **búsqueda global estática** al sitio con **Pagefind**: índice generado en build sobre las fichas/artículos (herramientas, cursos, estudios, noticias), con UI propia de marca accesible desde **un modal en la cabecera** y una **página `/buscar?q=`** (deep-link compartible). Sin servidor, sin DB — coherente con la arquitectura estática Astro/Vercel. El filtro instantáneo del grid de `/herramientas` y `/cursos` (#50/#54, client-side sobre el DOM) **se mantiene**; Pagefind es la búsqueda **global**, no lo reemplaza.

## Decisiones (resueltas)

| Decisión | Elección | Razón |
|---|---|---|
| Librería | **Pagefind** | brief §8; estático + gratis + facetado nativo |
| Integración | **`astro-pagefind`** (auto en build) · **fallback** `postbuild`: `pagefind --site .vercel/output/static` | encaja con el build estático; el fallback elimina el riesgo de orden de hooks con el adaptador Vercel |
| Alcance del índice | **solo plantillas de detalle/artículo** (`/herramienta/[slug]`, `/curso/[slug]`, estudios, noticias) vía `data-pagefind-body` | resultados = ítems individuales; las páginas de listado/home/legales/`/ir` quedan fuera automáticamente (sin `data-pagefind-ignore`) |
| UI | **propia con tokens Futurista** (no la skin por defecto de Pagefind) | coherencia de marca |
| Superficie | **modal en cabecera** (icono + ⌘K opcional) **+** página `/buscar?q=` | descubrible (modal, sin recargar) + compartible (deep-link) |
| Lógica compartida | un único `src/scripts/search.ts` → `createSearch(rootEl)` que montan **modal y página** | DRY: el comportamiento vive en un sitio |
| Carga del JS | **lazy** — `import('/pagefind/pagefind.js')` solo al abrir/usar | sin coste en el first load |
| Facetas | `data-pagefind-filter="tipo:…"` + `categoria:…` | facetado nativo de Pagefind |
| CSP | añadir **`'wasm-unsafe-eval'`** a `script-src` en `vercel.json` | Pagefind compila WebAssembly; relajación mínima (no permite `eval` de JS) |
| Stemming/idioma | automático vía `<html lang="es">` | Pagefind detecta el idioma; se verifica en build (acentos/plurales) |

## Arquitectura

### Indexado (build)
1. **Integración primaria:** añadir `astro-pagefind` a `astro.config.mjs` (`integrations: [..., pagefind()]`). Hookea `astro:build:done`, indexa la salida y emite el bundle `/pagefind/`.
2. **Riesgo conocido (adaptador Vercel):** `@astrojs/vercel` copia `dist/client → .vercel/output/static` en `build:done`; si Pagefind corre después de esa copia, `/pagefind/` no llega a la salida servida. **Primer paso de verificación del plan:** tras `npm run build`, confirmar que existe `.vercel/output/static/pagefind/pagefind.js`. Si NO existe → **fallback determinista:** quitar la integración y usar un script `postbuild` (`"postbuild": "pagefind --site .vercel/output/static"`, paquete `pagefind` como devDependency), que indexa la salida servida y escribe `/pagefind/` ahí. Vercel ejecuta `postbuild` en su build, así que funciona local y en producción.

### Markup indexable (plantillas de detalle)
En `/herramienta/[slug]`, `/curso/[slug]`, y las plantillas de estudios/noticias, envolver el contenido principal con:
- `data-pagefind-body` — restringe el índice a estas páginas (las demás se ignoran solas).
- `data-pagefind-filter="tipo:Herramienta"` (resp. `Curso` / `Estudio` / `Noticia`) — faceta de tipo.
- `data-pagefind-filter="categoria:<categoría>"` — faceta de categoría (de `cat`/`categoria`/`tema` según colección).
- Título: Pagefind toma el `<h1>` automáticamente; el snippet también. Meta opcional `data-pagefind-meta="tipo:<tipo>"` para pintar el badge en el resultado.

### UI
- **`SiteHeader.astro`** — botón-icono de búsqueda (lupa) que abre el modal; atajo ⌘/Ctrl-K opcional.
- **`src/components/SearchModal.astro`** — overlay con backdrop blur (estilo de la cabecera sticky): input, chips de filtro por tipo, lista de resultados. a11y: `role="dialog"` + `aria-modal="true"`, foco atrapado, `Esc` cierra, resultados navegables por teclado, input etiquetado. Monta `createSearch` sobre su contenedor.
- **`src/pages/buscar.astro`** — página completa con la misma experiencia; lee `?q=` al cargar (deep-link), ejecuta la búsqueda y pinta resultados + filtros; estados claros de **vacío** ("Escribe para buscar…") y **sin resultados**.
- **`src/scripts/search.ts`** — `createSearch(rootEl, opts)`: importa Pagefind de forma perezosa, ejecuta `pagefind.search(q)` (con filtros), debouncea el input, renderiza resultados con tokens Futurista. Único punto de la lógica; modal y página solo le pasan su DOM.

### Estilos
Tokens Futurista (`--panel`, `--line`, `--accent`, fuentes `--sans`/`--mono`/`--serif`). Overlay con blur; resultados como filas/tarjetas con monograma/etiqueta de tipo. Nada de la hoja de estilos por defecto de Pagefind.

### CSP (`vercel.json`)
Cambiar `script-src 'self'` → `script-src 'self' 'wasm-unsafe-eval'`. El resto intacto: el bundle se sirve desde `/pagefind/` (self) y los fragmentos del índice se piden con `fetch` same-origin (`connect-src 'self'` ya lo cubre).

## Flujo de datos

`build` → HTML estático con `data-pagefind-*` → Pagefind indexa → bundle `/pagefind/` en la salida servida. **Runtime:** el usuario abre el modal o `/buscar` → `import('/pagefind/pagefind.js')` perezoso → `pagefind.search(query)` + filtros → render. **Deep-link:** `/buscar` lee `location.search` (`?q=`), prerrellena el input y busca al cargar.

## Manejo de errores

- **`/pagefind/` ausente** (p. ej. `astro dev`, donde no hay índice): el `import()` dinámico falla → `try/catch` → estado amable "La búsqueda está disponible en el sitio publicado." (no rompe la página).
- **Sin resultados:** estado explícito con sugerencia de reformular/quitar filtros.
- **Errores de red/parseo:** se degradan a un mensaje neutro; nunca pantalla en blanco.

## Plan (fases — #56 no está desglosado en sub-issues)

1. **Integración + markup + CSP (tracer):** `astro-pagefind` en config; `data-pagefind-body`/`filter` en las 4 plantillas; CSP `wasm-unsafe-eval`. **Verificar** que el build emite `/pagefind/` en la salida servida (si no, fallback CLI).
2. **Motor + página `/buscar`:** `src/scripts/search.ts` (`createSearch`, lazy, debounce, filtros, render Futurista) + `src/pages/buscar.astro` (deep-link `?q=`, estados vacío/sin-resultados).
3. **Modal en cabecera:** icono en `SiteHeader` (+ ⌘K), `SearchModal.astro` reutilizando `createSearch`, a11y completa (foco atrapado, `Esc`, teclado, `aria`), lazy-load al abrir.
4. **Pulido + verificación:** estilos Futurista, a11y, sin errores CSP en consola, Lighthouse sin regresión de first-load.

## Criterios de aceptación (del PRD)

- [ ] El build genera el índice Pagefind (`/pagefind/`) sobre herramientas + cursos + estudios + noticias, sin pasos manuales (o `postbuild` automático).
- [ ] La cabecera abre un **modal**; teclear devuelve resultados al instante (los 4 tipos).
- [ ] Filtros por **tipo** y **categoría** funcionan (facetas Pagefind).
- [ ] `/buscar?q=término` carga con resultados (deep-link); estados vacío y "sin resultados" claros.
- [ ] JS de Pagefind **lazy** (no en first load); CSP con `wasm-unsafe-eval`; build verde.
- [ ] Accesible: foco atrapado en el modal, `Esc` cierra, `aria` correcto, navegable por teclado; UI con marca Futurista.
- [ ] Lighthouse sin regresión por el lazy-load.

## Fuera de alcance

- Búsqueda con servidor (Algolia/Meilisearch) — fase posterior.
- Autocompletado con sinónimos/IA, búsqueda semántica.
- Analítica de términos sin resultados.

---
_Generado con [Claude Code](https://claude.com/claude-code). Voz: `docs/brand-guidelines.md`._
