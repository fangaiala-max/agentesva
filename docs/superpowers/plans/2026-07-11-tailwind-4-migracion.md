# Migración Tailwind 3 → 4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar AgentesVA de Tailwind 3.4 a Tailwind 4 vía la integración PostCSS, con el menor diff posible y sin cambiar el render.

**Architecture:** Cambio de build/config únicamente. Tailwind 4 mueve el plugin de PostCSS a `@tailwindcss/postcss` y reemplaza `@tailwind base/components/utilities` por `@import "tailwindcss"`. El `postcss.config.mjs` conserva `autoprefixer` para el CSS custom. La `tailwind.config.mjs` vacía se elimina (TW4 auto-detecta contenido). El único uso de Tailwind en el sitio es la clase `min-h-screen` en el `<body>`.

**Tech Stack:** Astro 7 (estático), Tailwind CSS 4, `@tailwindcss/postcss`, autoprefixer, PostCSS, Vitest.

---

## File Structure

- `package.json` — bump `tailwindcss` a `^4`, añadir `@tailwindcss/postcss` `^4`, mantener `autoprefixer`.
- `postcss.config.mjs` — swap del plugin `tailwindcss` → `@tailwindcss/postcss`; comentario actualizado.
- `src/styles/global.css` — las 3 directivas `@tailwind` → una línea `@import "tailwindcss"`.
- `tailwind.config.mjs` — **eliminar** (vacía; TW4 auto-detecta contenido).

Las cuatro cambian juntas y deben ir en **un solo commit** (un estado intermedio no compila). Por eso la Task 1 agrupa todos los cambios y verifica el build antes de commitear.

**Orden:** Task 1 (migración atómica + build + tests) → Task 2 (regresión visual en preview + PR).

---

## Task 1: Migración a Tailwind 4 (atómica)

**Files:**
- Modify: `package.json` (vía npm)
- Modify: `postcss.config.mjs`
- Modify: `src/styles/global.css:1-3`
- Delete: `tailwind.config.mjs`

- [ ] **Step 1: Instalar Tailwind 4 + el plugin PostCSS**

Run:
```bash
npm install -D tailwindcss@^4 @tailwindcss/postcss@^4
```
Expected: `tailwindcss` sube a 4.x y se añade `@tailwindcss/postcss` 4.x en `devDependencies`; `found 0 vulnerabilities` (o el nivel previo, sin nuevas).

- [ ] **Step 2: Actualizar `postcss.config.mjs`**

Reemplazar el contenido completo de `postcss.config.mjs` por:

```js
// Tailwind 4 (@tailwindcss/postcss) + Autoprefixer. Astro procesa este
// postcss.config automáticamente. autoprefixer prefija el CSS custom del tema;
// Tailwind 4 auto-prefija su propia salida.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Actualizar el import en `src/styles/global.css`**

Reemplazar las tres primeras líneas:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

por una sola:

```css
@import "tailwindcss";
```

El resto del archivo (CSS vars del tema Futurista, reset propio, reglas) NO se toca.

- [ ] **Step 4: Eliminar la config vacía**

Run:
```bash
git rm tailwind.config.mjs
```
Expected: `tailwind.config.mjs` eliminada del índice y del working tree.

- [ ] **Step 5: Build — el criterio de éxito principal (esto rompía #105)**

Run:
```bash
npm run build
```
Expected: build completo SIN errores (Astro build + postbuild pagefind). Si falla con un error de PostCSS/Tailwind, ver "Troubleshooting" al final antes de continuar.

- [ ] **Step 6: Verificar que `min-h-screen` sigue generándose**

El único uso de Tailwind es `min-h-screen` en `src/layouts/BaseLayout.astro`. Confirmar que TW4 lo detectó y emitió la regla. El output estático está en `.vercel/output/static/`. Run:
```bash
grep -rl "min-height:100vh\|min-height: 100vh" .vercel/output/static/
```
Expected: al menos un archivo (CSS en `_astro/`, o HTML si Astro lo inlinea) contiene la regla `.min-h-screen { min-height: 100vh }`. Si vuelve vacío, ver "Troubleshooting".

- [ ] **Step 7: Correr los tests**

Run:
```bash
npm test
```
Expected: 66/66 tests PASS (la migración es de CSS build; no afecta la lógica, pero se corre igual para descartar regresiones).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json postcss.config.mjs src/styles/global.css
git commit -m "build(tailwind): migra a Tailwind 4 (integración PostCSS)"
```
(La eliminación de `tailwind.config.mjs` ya está staged por el `git rm` del Step 4; se incluye en este commit.)

---

## Task 2: Regresión visual + PR

**Files:** ninguno (verificación).

- [ ] **Step 1: Abrir PR y esperar el preview de Vercel**

Run:
```bash
gh pr create --base main --head feat/tailwind-4 --title "build(tailwind): migra a Tailwind 4 (integración PostCSS)" --body "Migración Tailwind 3.4 → 4 vía PostCSS (@tailwindcss/postcss). Diff mínimo: package.json, postcss.config.mjs, global.css (@import), y elimina tailwind.config.mjs vacía. Preflight preservado → render idéntico. Cierra el hueco de #105 (que rompía el build). Spec: docs/superpowers/specs/2026-07-11-tailwind-4-migracion-design.md"
```
Esperar checks verdes (`test` + `Vercel`).

- [ ] **Step 2: Comparación visual home + ficha**

En la URL del preview de Vercel, comparar contra producción (agentesva.com):
- **Home** (`/`): hero, estantes del directorio, tarjetas, footer — sin cambios de espaciado, tipografía ni layout.
- **Una ficha** (`/herramienta/<cualquier-slug>`): cabecera, cuerpo, botones.
- El `<body>` sigue ocupando el viewport completo (efecto de `min-h-screen`): no debe aparecer un fondo cortado en páginas cortas.

Como Preflight se preserva (`@import "tailwindcss"` lo incluye), el render debe ser idéntico. Cualquier diferencia visual es un hallazgo a investigar antes de mergear.

- [ ] **Step 3: Consola sin errores**

En DevTools del preview, confirmar que no hay errores de CSS ni de CSP nuevos, y que las fuentes self-hosted y el resto de estilos cargan igual.

- [ ] **Step 4: Marcar el spec como implementado**

Actualizar el estado del spec `docs/superpowers/specs/2026-07-11-tailwind-4-migracion-design.md` a "Implementado" con la fecha, y dejar el PR listo para merge.

---

## Troubleshooting (solo si algo falla en Task 1)

- **Build falla con `It looks like you're trying to use tailwindcss directly as a PostCSS plugin`:** el Step 2 no se aplicó — `postcss.config.mjs` debe usar `'@tailwindcss/postcss'`, no `tailwindcss`.
- **`min-h-screen` no aparece en el CSS (Step 6 vacío):** TW4 no detectó el contenido. Reintroducir la config: crear `tailwind.config.mjs` con `export default { content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'] }` y añadir `@config "../../tailwind.config.mjs";` justo después del `@import "tailwindcss";` en `global.css` (ajustar la ruta relativa desde `src/styles/`). Rebuild y re-verificar el Step 6. Documentar en el commit que la config se conservó por auto-detección insuficiente.
- **Diferencia visual en el preview:** comparar el CSS generado de TW3 vs TW4 para Preflight; TW4 cambió algunos defaults de Preflight (p. ej. `placeholder` color). Si un default afecta el tema, sobrescribirlo en `global.css` (que ya define su propio reset). No revertir la migración por un default menor — corregirlo puntualmente.
