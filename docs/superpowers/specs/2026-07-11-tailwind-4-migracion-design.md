# Migración Tailwind 3 → 4 — Diseño

**Fecha:** 2026-07-11
**Estado:** Diseño aprobado — pendiente de plan de implementación

## Contexto y objetivo

**Objetivo:** actualizar AgentesVA de Tailwind 3.4 a Tailwind 4 con el menor diff posible, sin cambiar el render, desbloqueando futuras actualizaciones (Dependabot PR #105 se cerró porque la subida automática rompía el build).

**Por qué falló #105:** Tailwind 4 movió el plugin de PostCSS al paquete separado `@tailwindcss/postcss` y reemplazó las directivas `@tailwind base/components/utilities` por `@import "tailwindcss"`. El `postcss.config.mjs` actual con `tailwindcss: {}` revienta el build con TW4.

### Estado actual (hallazgos de la exploración)

- **Integración:** vía `postcss.config.mjs` (`tailwindcss` + `autoprefixer`), NO vía `@astrojs/tailwind` (deprecado). Astro procesa el `postcss.config` automáticamente.
- **Config:** `tailwind.config.mjs` está **vacía** (solo `content`, `theme.extend: {}`, `plugins: []`).
- **Directivas:** `src/styles/global.css` empieza con `@tailwind base; @tailwind components; @tailwind utilities;`.
- **Sin `@apply`, `@layer`, ni `theme()`** en ningún archivo.
- **Footprint real de utilidades Tailwind: 1 clase** — `min-h-screen` en el `<body>` de `src/layouts/BaseLayout.astro`. (Los aparentes usos de `grid`/`w-btn` eran substrings de clases custom: `hero-grid`, `cat-grid`, `view-btn`, `data-view="grid"`.)
- **CSS custom:** `global.css` (160 líneas) con las CSS vars del tema "Futurista" y su **propio reset** (`* { box-sizing }`, `body { margin: 0 }`, `html`). Tailwind aporta hoy: (a) Preflight y (b) esa única utilidad.

**Decisiones tomadas en brainstorming:**
1. **Dirección:** migrar a TW4 (mantener Tailwind), no eliminarlo. Bajo riesgo; conserva Preflight y la opción de usar utilidades a futuro.
2. **Integración:** método **PostCSS** (diff mínimo), no el plugin de Vite. Conserva `autoprefixer` para el CSS custom sobre un pipeline que ya funciona.

## Alcance

Cambios de build/config únicamente. No se toca el CSS del tema ni el markup (salvo lo que la migración exija, que en este caso es nada — `min-h-screen` sigue siendo válido en TW4).

### 1. Dependencias (`package.json`)

- `tailwindcss`: `^3.4.17` → `^4.x` (última estable, la que traía #105 era 4.3.2).
- **Añadir** `@tailwindcss/postcss` `^4.x` (plugin PostCSS de TW4).
- `autoprefixer`: se mantiene (sigue prefijando el CSS custom; TW4 auto-prefija solo su propia salida).

### 2. PostCSS (`postcss.config.mjs`)

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

Actualizar también el comentario de cabecera para reflejar TW4.

### 3. Import en `src/styles/global.css`

Reemplazar las 3 directivas por:

```css
@import "tailwindcss";
```

El resto del archivo (CSS vars, reset propio, reglas del tema) queda intacto debajo.

### 4. Config

- **Borrar** `tailwind.config.mjs` (vacía). TW4 hace auto-detección de contenido (escanea el proyecto respetando `.gitignore`), así que `min-h-screen` se sigue generando sin config JS.
- Fallback: si tras el build faltara alguna clase utilitaria, re-introducir la config vía `@config "./tailwind.config.mjs"` en `global.css`. Con footprint de 1 clase no debería hacer falta.

### 5. Verificación

- `npm run build` verde (esto es lo que rompía #105 — criterio de éxito principal).
- **Regresión visual** en el preview de Vercel: como Preflight se preserva, el render debe ser idéntico. Chequear home (`/`) y una ficha (`/herramienta/[slug]`).
- Confirmar que `min-h-screen` sigue aplicando (body a viewport completo) — inspeccionar el CSS generado o el computed style.
- `npm test` → 66 tests siguen verdes (la migración es de CSS build; no afecta la lógica, pero se corre igual).

## Compatibilidad de navegadores

Tailwind 4 sube el piso a **Safari 16.4+, Chrome 111+, Firefox 128+** (usa CSS moderno: cascade layers, `@property`, `color-mix()`). Aceptable para la audiencia (PyMEs MX+ES con navegadores actuales). Se documenta explícitamente; no se toman medidas de fallback.

## Criterios de éxito

1. Build verde con Tailwind 4 (lo que #105 no lograba).
2. Render visualmente idéntico (Preflight preservado, `min-h-screen` aplicando).
3. 66 tests verdes.
4. `tailwind.config.mjs` eliminada (o, si hizo falta, referenciada vía `@config`).

## Fuera de alcance

- Migrar a la sintaxis CSS-first `@theme` (los tokens del tema son CSS vars planas, no necesitan `@theme`).
- Cambiar al plugin `@tailwindcss/vite`.
- Adoptar nuevas utilidades de TW4 o refactorizar el tema.
