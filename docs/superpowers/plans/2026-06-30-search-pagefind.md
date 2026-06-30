# Global Pagefind Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a site-wide static search (Pagefind) across herramientas + cursos + estudios + noticias, surfaced as a header modal (⌘K) and a shareable `/buscar?q=` page, styled with the Futurista design.

**Architecture:** Pagefind indexes the built static HTML at the end of the build (`postbuild` CLI over the Vercel-served output dir) and emits a `/pagefind/` bundle. Only the four *detail/article* templates carry `data-pagefind-body` (so listing/home/legal pages never become results). A single shared engine (`src/scripts/search.ts → createSearch(root)`) lazy-loads Pagefind on first use; the header `SearchModal` and the `/buscar` page both mount it. CSP gains `'wasm-unsafe-eval'` (Pagefind is WASM).

**Tech Stack:** Astro 5/6 static + `@astrojs/vercel` (served output = `.vercel/output/static`), `pagefind` CLI (devDependency), vanilla TS client scripts, Futurista CSS tokens. No unit-test framework — verification is `npm run build`, serving the built output + `curl`/browser, and Lighthouse.

**Branch:** `feat/search-pagefind` (already created).

**Spec:** [`docs/superpowers/specs/2026-06-30-search-pagefind-design.md`](../specs/2026-06-30-search-pagefind-design.md) · Mockups: `scratchpad/search-modal.html`, `scratchpad/buscar-page.html`.

### Testing approach (read first)

No Jest/Vitest. Gates:
- **Build:** `npm run build` runs `astro build` then the `postbuild` Pagefind index. Green build = schema/types OK + index generated.
- **Served output:** with the Vercel adapter the deployable static site is `.vercel/output/static`. Pagefind writes `/pagefind/` THERE. To test search locally, serve that dir: `npx --yes serve .vercel/output/static -l 4321` (correct ESM MIME types) and hit `http://localhost:4321`. (`astro dev` has NO index — search degrades to a friendly message there, by design.)
- **a11y/Lighthouse:** browser checks in Phase 4.

Commit after each green task.

---

## Phase 1 — Indexing + markup + CSP (tracer: build emits a usable index)

### Task 1: Install Pagefind + wire the postbuild index

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the dependency**

Run: `npm install -D pagefind`
Expected: `pagefind` appears under `devDependencies`; install runs its postinstall to fetch the platform binary.

- [ ] **Step 2: Add the `postbuild` script**

In `package.json` `"scripts"`, add a `postbuild` entry (npm runs it automatically after `build`). The final scripts block:
```json
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "postbuild": "pagefind --site .vercel/output/static",
    "preview": "astro preview",
    "astro": "astro",
    "ai:faqs": "node --env-file-if-exists=.env.local scripts/generate-faqs.mjs",
    "ai:estudios": "node --env-file-if-exists=.env.local scripts/generate-estudios.mjs"
  }
```
> Why `.vercel/output/static`: the `@astrojs/vercel` adapter copies the static build there during `astro build`, and Vercel deploys `.vercel/output`. Indexing it in `postbuild` is deterministic (runs after the copy) and works identically locally and on Vercel. **Alternative DX** (if you prefer the index to also live in `dist/`): the `astro-pagefind` integration — not used here because hook-ordering with the Vercel adapter is non-deterministic.

- [ ] **Step 3: Build and confirm the index lands in the served output**

Run: `npm run build`
Expected: after the Astro build, Pagefind logs "Running Pagefind … Indexed N pages" and:
```bash
ls .vercel/output/static/pagefind/pagefind.js
```
prints the path (exists). At this point NO page has `data-pagefind-body`, so Pagefind indexes every page's `<body>` — that's expected; Task 2 scopes it to the 4 detail types.

- [ ] **Step 4: Ignore the build artifact + commit**

Add `pagefind` output to `.gitignore` if not already covered (the `.vercel/` and `dist/` dirs are typically already ignored — verify, and only add a line if missing):
```bash
grep -qE '^\.vercel|^dist' .gitignore || printf '\n.vercel/\ndist/\n' >> .gitignore
git add package.json package-lock.json .gitignore
git commit -m "build(search): add pagefind + postbuild index over served output (#56)"
```

---

### Task 2: Mark the four detail templates as indexable

Add `data-pagefind-body` (restricts the index to these pages), `data-pagefind-filter` (tipo + categoria facets), and `data-pagefind-meta="tipo:…"` (drives the result badge) to each detail template's `<main>`. Pagefind auto-captures `meta.title` from each page's `<h1>`. Add `data-pagefind-ignore` to the breadcrumb/back nav so it stays out of excerpts.

**Files:**
- Modify: `src/pages/herramienta/[slug].astro`
- Modify: `src/pages/curso/[slug].astro`
- Modify: `src/pages/estudios/[slug].astro`
- Modify: `src/pages/noticias/[slug].astro`

- [ ] **Step 1: Herramienta ficha** — `src/pages/herramienta/[slug].astro`

Replace:
```astro
  <main style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;">
    <a href="/#directorio" class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver al directorio</a>
```
with:
```astro
  <main
    data-pagefind-body
    data-pagefind-filter={`tipo:Herramienta, categoria:${tool.cat}`}
    data-pagefind-meta="tipo:Herramienta"
    style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;"
  >
    <a href="/#directorio" data-pagefind-ignore class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver al directorio</a>
```

- [ ] **Step 2: Curso ficha** — `src/pages/curso/[slug].astro`

Replace:
```astro
  <main style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;">
    <a href="/cursos" class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver a cursos</a>
```
with:
```astro
  <main
    data-pagefind-body
    data-pagefind-filter={`tipo:Curso, categoria:${curso.categoria}`}
    data-pagefind-meta="tipo:Curso"
    style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;"
  >
    <a href="/cursos" data-pagefind-ignore class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver a cursos</a>
```

- [ ] **Step 3: Estudio artículo** — `src/pages/estudios/[slug].astro`

Replace:
```astro
  <main style="max-width: 760px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
```
with:
```astro
  <main
    data-pagefind-body
    data-pagefind-filter={`tipo:Estudio, categoria:${d.tema}`}
    data-pagefind-meta="tipo:Estudio"
    style="max-width: 760px; margin: 0 auto; padding: 40px 32px 64px;"
  >
    <nav aria-label="Migas" data-pagefind-ignore style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
```

- [ ] **Step 4: Noticia artículo** — `src/pages/noticias/[slug].astro`

Replace:
```astro
  <main style="max-width: 760px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
```
with:
```astro
  <main
    data-pagefind-body
    data-pagefind-filter={`tipo:Noticia, categoria:${d.tema}`}
    data-pagefind-meta="tipo:Noticia"
    style="max-width: 760px; margin: 0 auto; padding: 40px 32px 64px;"
  >
    <nav aria-label="Migas" data-pagefind-ignore style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
```

- [ ] **Step 5: Build and confirm the index is scoped to the 4 types**

Run:
```bash
npm run build
cat .vercel/output/static/pagefind/pagefind-entry.json | head -c 200; echo
```
Expected: build green; the entry file exists. Sanity-check the indexed page count is roughly `tools + cursos + estudios + noticias` (not the whole site) — Pagefind's build log prints "Indexed N pages"; N should be in the ~80–95 range (54 tools + 16 cursos + estudios + noticias), NOT ~110+ (which would include listing/legal pages). If listing pages still appear, confirm each `<main>` got `data-pagefind-body`.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/herramienta/[slug].astro" "src/pages/curso/[slug].astro" "src/pages/estudios/[slug].astro" "src/pages/noticias/[slug].astro"
git commit -m "feat(search): mark detail templates as pagefind-indexable (tipo+categoria) (#56)"
```

---

### Task 3: Relax CSP for Pagefind's WebAssembly

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add `'wasm-unsafe-eval'` to `script-src`**

In `vercel.json`, replace the `Content-Security-Policy` value's `script-src 'self'` with `script-src 'self' 'wasm-unsafe-eval'`. The full header value becomes:
```
default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
```
> `connect-src 'self'` already permits Pagefind's same-origin `fetch` of index fragments; the bundle loads from `/pagefind/` (self). Only the WASM directive is needed.

- [ ] **Step 2: Validate JSON + commit**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('vercel.json OK')"`
Expected: `vercel.json OK`
```bash
git add vercel.json
git commit -m "feat(search): allow wasm-unsafe-eval in CSP for Pagefind (#56)"
```

---

## Phase 2 — Shared engine + `/buscar` page

### Task 4: Search engine `src/scripts/search.ts`

**Files:**
- Create: `src/scripts/search.ts`

- [ ] **Step 1: Write the engine**

```ts
// Motor de búsqueda global con Pagefind (lazy). Compartido por el modal de la
// cabecera y la página /buscar. Pagefind se importa solo al primer uso.
// CSP: requiere 'wasm-unsafe-eval' (WebAssembly) — ver vercel.json.

type ResultData = { url: string; meta: Record<string, string> & { title?: string }; excerpt: string };

// Tipo → etiqueta + color del badge (coincide con la maqueta aprobada).
const TYPE_META: Record<string, { label: string; color: string; border: string }> = {
  Herramienta: { label: 'Herramienta', color: '#4fd39a', border: '#235' },
  Curso: { label: 'Curso', color: '#c08bff', border: '#43306a' },
  Estudio: { label: 'Estudio', color: '#5b7cff', border: 'var(--line-2)' },
  Noticia: { label: 'Noticia', color: '#ffb86b', border: '#5a4326' },
};

let pagefindPromise: Promise<any> | null = null;
function loadPagefind(): Promise<any> {
  if (!pagefindPromise) {
    const url = '/pagefind/pagefind.js';
    // Variable + @vite-ignore: import en runtime, no lo empaqueta Vite (el bundle
    // se genera en postbuild y no existe en tiempo de compilación).
    pagefindPromise = import(/* @vite-ignore */ url);
  }
  return pagefindPromise;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string));
}

function renderResult(d: ResultData): string {
  const tipo = d.meta.tipo ?? '';
  const tm = TYPE_META[tipo];
  const color = tm?.color ?? 'var(--accent)';
  const title = d.meta.title ?? d.url;
  const badge = tm
    ? `<span class="sr-badge" style="color:${tm.color};border-color:${tm.border}">${esc(tm.label)}</span>`
    : '';
  return `<a class="sr-row" href="${esc(d.url)}" role="option">
      <span class="sr-mono" style="background:${color}">${esc((title || '?').charAt(0).toUpperCase())}</span>
      <span class="sr-rowmain">
        <span class="sr-top"><span class="sr-title">${esc(title)}</span>${badge}</span>
        <span class="sr-excerpt">${d.excerpt}</span>
      </span>
    </a>`;
}

export interface SearchEngine { run: () => void; focus: () => void }

// Contrato DOM dentro de `root`:
//  [data-search-input]      input de texto
//  [data-search-results]    contenedor de resultados (role=listbox)
//  [data-search-count]      contador
//  [data-search-empty]      estado inicial "escribe para buscar"
//  [data-search-noresults]  estado "sin resultados"
//  [data-search-filter]     chips con data-value ('' = Todo)
export function createSearch(root: HTMLElement): SearchEngine {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  const results = root.querySelector<HTMLElement>('[data-search-results]');
  const count = root.querySelector<HTMLElement>('[data-search-count]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const noresults = root.querySelector<HTMLElement>('[data-search-noresults]');
  const filters = Array.from(root.querySelectorAll<HTMLElement>('[data-search-filter]'));
  const noop = { run: () => {}, focus: () => {} };
  if (!input || !results || !count || !empty || !noresults) return noop;

  let activeFilter = '';
  let timer: number | undefined;
  let seq = 0;

  const setState = (s: 'empty' | 'results' | 'none' | 'error') => {
    empty.hidden = s !== 'empty';
    noresults.hidden = s !== 'none';
    results.hidden = !(s === 'results' || s === 'error');
    count.hidden = s !== 'results';
  };

  const run = async () => {
    const q = input.value.trim();
    if (!q) { results.innerHTML = ''; count.textContent = ''; setState('empty'); return; }
    const my = ++seq;
    let pf: any;
    try { pf = await loadPagefind(); }
    catch {
      results.innerHTML = '<p class="sr-msg">La búsqueda está disponible en el sitio publicado.</p>';
      setState('error');
      return;
    }
    const search = await pf.search(q, activeFilter ? { filters: { tipo: activeFilter } } : undefined);
    if (my !== seq) return;
    const top = await Promise.all(search.results.slice(0, 12).map((r: any) => r.data()));
    if (my !== seq) return;
    if (!top.length) { results.innerHTML = ''; setState('none'); return; }
    results.innerHTML = top.map(renderResult).join('');
    const n = search.results.length;
    count.textContent = `${n} resultado${n === 1 ? '' : 's'}`;
    setState('results');
  };

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 160);
  });

  filters.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.value || '';
      filters.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      run();
    });
  });

  setState('empty');
  return { run, focus: () => input.focus() };
}
```

- [ ] **Step 2: Commit** (verified with the page in Task 6)

```bash
git add src/scripts/search.ts
git commit -m "feat(search): shared Pagefind engine createSearch() (lazy, filters, badges) (#56)"
```

---

### Task 5: Shared result styles in `global.css`

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Append the search-result styles** (used by both the page and the modal, since results are injected as HTML with these classes)

Append to the end of `src/styles/global.css`:
```css

/* ===== Búsqueda global (#56) — resultados compartidos (modal + /buscar) ===== */
.sr-row { display: flex; align-items: flex-start; gap: 13px; padding: 13px 12px; border-radius: 8px; text-decoration: none; }
.sr-row:hover, .sr-row.sel { background: var(--panel-2); outline: 1px solid var(--line-2); }
.sr-mono { width: 38px; height: 38px; border-radius: 9px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 16px; color: #fff; }
.sr-rowmain { flex: 1; min-width: 0; }
.sr-top { display: flex; align-items: center; gap: 10px; }
.sr-title { font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; }
.sr-badge { font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid var(--line-2); border-radius: 20px; padding: 3px 8px; flex: none; }
.sr-excerpt { display: block; font-size: 13px; line-height: 1.45; color: var(--fg-3); margin-top: 3px; }
.sr-excerpt mark { background: rgba(91,124,255,.28); color: #fff; border-radius: 2px; }
.sr-msg { font-size: 14px; color: var(--fg-3); padding: 12px; }
.sr-chip { font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; padding: 7px 13px; border-radius: 30px; background: transparent; color: var(--fg-3); border: 1px solid var(--line-2); cursor: pointer; }
.sr-chip.on { background: var(--accent); color: var(--bg); border-color: var(--accent); }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "style(search): shared Futurista result + chip styles (#56)"
```

---

### Task 6: `/buscar` page

**Files:**
- Create: `src/pages/buscar.astro`

- [ ] **Step 1: Write the page** (mounts `createSearch`, reads `?q=`, keeps the URL in sync)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';

const FILTERS = [
  { v: '', label: 'Todo' },
  { v: 'Herramienta', label: 'Herramientas' },
  { v: 'Curso', label: 'Cursos' },
  { v: 'Estudio', label: 'Estudios' },
  { v: 'Noticia', label: 'Noticias' },
];
---

<BaseLayout
  title="Buscar | AgentesVA"
  description="Busca en todo AgentesVA: herramientas, cursos, estudios y noticias de IA en español."
  noindex={true}
>
  <SiteHeader />

  <main id="buscar-root" style="max-width: 1000px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
      <a href="/" class="navlink" style="color: var(--fg-4); text-decoration: none;">Inicio</a> <span aria-hidden="true">/</span> Buscar
    </nav>

    <h1 style="font-family: var(--serif); font-weight: 400; font-size: clamp(32px, 5vw, 46px); letter-spacing: -0.03em; margin: 16px 0 0; color: #fff;">Buscar</h1>
    <p style="font-size: 16px; line-height: 1.6; color: var(--fg-3); margin: 10px 0 0;">Busca en todo AgentesVA: herramientas, cursos, estudios y noticias.</p>

    <form role="search" onsubmit="return false" class="searchwrap" style="display: flex; align-items: center; gap: 13px; max-width: 620px; margin: 26px 0 0; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 6px; padding: 6px 6px 6px 18px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
      <label for="buscar-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Buscar en el sitio</label>
      <input id="buscar-input" data-search-input type="search" autocomplete="off" placeholder="Busca: prompts, ChatGPT, automatizar WhatsApp…" style="flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--sans); font-size: 17px; padding: 11px 0;">
    </form>

    <div role="group" aria-label="Filtrar por tipo" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px;">
      {FILTERS.map((f, i) => (
        <button type="button" class={`sr-chip${i === 0 ? ' on' : ''}`} data-search-filter data-value={f.v} aria-pressed={i === 0 ? 'true' : 'false'}>{f.label}</button>
      ))}
    </div>

    <p data-search-count hidden style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5); margin: 24px 0 0;"></p>

    <div data-search-results role="listbox" aria-label="Resultados" hidden style="display: flex; flex-direction: column; gap: 6px; margin-top: 14px;"></div>

    <p data-search-empty style="font-size: 15px; color: var(--fg-4); margin-top: 28px;">Escribe arriba para buscar en todo el sitio.</p>
    <div data-search-noresults hidden style="border: 1px dashed var(--line-2); border-radius: 8px; padding: 48px 24px; text-align: center; margin-top: 24px;">
      <p style="font-family: var(--sans); font-weight: 600; font-size: 18px; color: #fff; margin: 0;">Sin resultados</p>
      <p style="font-size: 14px; color: var(--fg-5); margin: 8px 0 0;">Prueba otra palabra o quita los filtros.</p>
    </div>
  </main>

  <SiteFooter />
</BaseLayout>

<script>
  import { createSearch } from '../scripts/search';
  document.addEventListener('astro:page-load', () => {
    const root = document.getElementById('buscar-root');
    if (!root) return;
    const engine = createSearch(root);
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const q = new URLSearchParams(location.search).get('q');
    if (q && input) { input.value = q; engine.run(); }
    input?.focus();
    let t: number | undefined;
    input?.addEventListener('input', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const u = new URL(location.href);
        const val = input.value.trim();
        if (val) u.searchParams.set('q', val); else u.searchParams.delete('q');
        history.replaceState(null, '', u);
      }, 300);
    });
  });
</script>
```
> `noindex` on `/buscar` keeps the empty search shell out of Google (results are client-rendered anyway). `BaseLayout` already excludes nothing extra; `astro-sitemap` will still list it — acceptable, but `noindex` is the correct signal.

- [ ] **Step 2: Build + serve + verify the deep-link**

Run:
```bash
npm run build
npx --yes serve .vercel/output/static -l 4321 >/tmp/serve.log 2>&1 &
sleep 2
# the page shell renders:
curl -s http://localhost:4321/buscar | grep -o 'id="buscar-root"'
# pagefind bundle is served:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/pagefind/pagefind.js
kill %1
```
Expected: prints `id="buscar-root"` and `200`. (Live search results need a browser — verified in Phase 4. The `?q=` deep-link runs client-side.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/buscar.astro
git commit -m "feat(search): /buscar deep-link page mounting the shared engine (#56)"
```

---

## Phase 3 — Header modal + ⌘K

### Task 7: `SearchModal` component

**Files:**
- Create: `src/components/SearchModal.astro`

- [ ] **Step 1: Write the modal** (markup + open/close/focus-trap/⌘K; reuses `createSearch`)

```astro
---
const FILTERS = [
  { v: '', label: 'Todo' },
  { v: 'Herramienta', label: 'Herramientas' },
  { v: 'Curso', label: 'Cursos' },
  { v: 'Estudio', label: 'Estudios' },
  { v: 'Noticia', label: 'Noticias' },
];
---

<div id="search-modal" hidden>
  <div data-search-backdrop style="position: fixed; inset: 0; z-index: 90; background: rgba(6,16,33,.72); backdrop-filter: blur(3px);"></div>
  <div data-search-dialog role="dialog" aria-modal="true" aria-label="Buscar en AgentesVA" style="position: fixed; z-index: 91; top: 90px; left: 50%; transform: translateX(-50%); width: min(680px, 92vw); background: var(--panel); border: 1px solid var(--line-2); border-radius: 12px; box-shadow: 0 30px 80px rgba(0,0,0,.5); overflow: hidden;">
    <div style="display: flex; align-items: center; gap: 13px; padding: 16px 18px; border-bottom: 1px solid var(--line);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--fg-4)" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
      <label for="search-modal-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Buscar en el sitio</label>
      <input id="search-modal-input" data-search-input type="search" autocomplete="off" placeholder="Busca en todo el sitio…" style="flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--sans); font-size: 18px;">
      <button type="button" data-search-close aria-label="Cerrar búsqueda" style="font-family: var(--mono); font-size: 10px; color: var(--fg-5); background: none; border: 1px solid var(--line-2); border-radius: 4px; padding: 4px 8px; cursor: pointer;">esc</button>
    </div>

    <div role="group" aria-label="Filtrar por tipo" style="display: flex; gap: 8px; flex-wrap: wrap; padding: 14px 18px 6px;">
      {FILTERS.map((f, i) => (
        <button type="button" class={`sr-chip${i === 0 ? ' on' : ''}`} data-search-filter data-value={f.v} aria-pressed={i === 0 ? 'true' : 'false'}>{f.label}</button>
      ))}
    </div>

    <p data-search-count hidden style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5); padding: 8px 18px 4px;"></p>
    <div data-search-results role="listbox" aria-label="Resultados" hidden style="padding: 4px 10px 8px; max-height: 46vh; overflow: auto;"></div>
    <p data-search-empty style="font-size: 14px; color: var(--fg-4); padding: 16px 18px 22px;">Escribe para buscar herramientas, cursos, estudios y noticias.</p>
    <div data-search-noresults hidden style="padding: 28px 18px; text-align: center;">
      <p style="font-family: var(--sans); font-weight: 600; font-size: 16px; color: #fff; margin: 0;">Sin resultados</p>
      <p style="font-size: 13px; color: var(--fg-5); margin: 6px 0 0;">Prueba otra palabra o quita los filtros.</p>
    </div>

    <div style="display: flex; gap: 18px; padding: 11px 18px; border-top: 1px solid var(--line); font-family: var(--mono); font-size: 10.5px; color: var(--fg-5);">
      <span><b style="color: var(--fg-3);">↑ ↓</b> navegar</span><span><b style="color: var(--fg-3);">↵</b> abrir</span><span><b style="color: var(--fg-3);">esc</b> cerrar</span>
    </div>
  </div>
</div>

<script>
  import { createSearch } from '../scripts/search';

  function trapFocus(e: KeyboardEvent, container: HTMLElement) {
    const f = Array.from(
      container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initSearchModal() {
    const modal = document.getElementById('search-modal');
    const dialog = modal?.querySelector<HTMLElement>('[data-search-dialog]');
    if (!modal || !dialog) return;
    const backdrop = modal.querySelector<HTMLElement>('[data-search-backdrop]');
    const closeBtn = modal.querySelector<HTMLElement>('[data-search-close]');
    let engine: { focus: () => void } | null = null;
    let lastFocused: HTMLElement | null = null;

    const open = () => {
      if (!modal.hasAttribute('hidden')) return;
      modal.removeAttribute('hidden');
      lastFocused = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      if (!engine) engine = createSearch(dialog);
      requestAnimationFrame(() => engine?.focus());
    };
    const close = () => {
      if (modal.hasAttribute('hidden')) return;
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      lastFocused?.focus?.();
    };

    document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', open));
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      else if (e.key === 'Escape' && !modal.hasAttribute('hidden')) { e.preventDefault(); close(); }
      else if (e.key === 'Tab' && !modal.hasAttribute('hidden')) trapFocus(e, dialog);
    });
  }

  document.addEventListener('astro:page-load', initSearchModal);
</script>
```

- [ ] **Step 2: Commit** (verified with the header trigger in Task 8)

```bash
git add src/components/SearchModal.astro
git commit -m "feat(search): SearchModal component (⌘K, focus-trap, Esc, lazy engine) (#56)"
```

---

### Task 8: Header search trigger + include the modal

**Files:**
- Modify: `src/components/SiteHeader.astro`

- [ ] **Step 1: Import + render the modal, add the trigger button**

At the top of the frontmatter (after the `tickerItems` const), add the import:
```astro
import SearchModal from './SearchModal.astro';
```

Replace the `.right`-equivalent CTA block:
```astro
    <a href="/newsletter" class="shimmer magnetic" data-magnetic style="font-family: var(--sans); font-size: 13px; font-weight: 600; color: var(--bg); background: var(--accent); padding: 9px 18px; border-radius: 2px; text-decoration: none; animation: glowPulse 3.4s ease-in-out infinite;">Suscríbete</a>
  </div>
</header>
```
with:
```astro
    <div style="display: flex; align-items: center; gap: 14px;">
      <button type="button" data-search-open aria-label="Buscar en el sitio (⌘K)" style="display: flex; align-items: center; gap: 8px; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 6px; padding: 8px 11px; cursor: pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
        <span style="font-family: var(--mono); font-size: 10px; color: var(--fg-5); border: 1px solid var(--line-2); border-radius: 4px; padding: 2px 6px;">⌘K</span>
      </button>
      <a href="/newsletter" class="shimmer magnetic" data-magnetic style="font-family: var(--sans); font-size: 13px; font-weight: 600; color: var(--bg); background: var(--accent); padding: 9px 18px; border-radius: 2px; text-decoration: none; animation: glowPulse 3.4s ease-in-out infinite;">Suscríbete</a>
    </div>
  </div>
</header>
<SearchModal />
```

- [ ] **Step 2: Build + verify trigger and modal ship on every page**

Run:
```bash
npm run build
grep -o 'data-search-open' .vercel/output/static/index.html | head -1
grep -o 'id="search-modal"' .vercel/output/static/cursos/index.html | head -1
```
Expected: both print their match (the trigger + modal are present site-wide via `SiteHeader`).

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.astro
git commit -m "feat(search): header search trigger + ⌘K, modal on every page (#56)"
```

---

## Phase 4 — Live verification (browser) + polish

### Task 9: End-to-end browser check + a11y + Lighthouse

**Files:** none expected (fix-only if issues surface)

- [ ] **Step 1: Serve the built output**

```bash
npm run build
npx --yes serve .vercel/output/static -l 4321 >/tmp/serve.log 2>&1 &
sleep 2
```

- [ ] **Step 2: Verify search returns cross-type results (gstack browse or chrome-devtools MCP)**

Drive a browser to `http://localhost:4321/buscar?q=whatsapp`. Confirm: the input is prefilled `whatsapp`, results render with **color-coded type badges**, and matched terms are `<mark>`-highlighted. Then test a query that spans types (e.g. `ia`) and click each filter chip (Todo/Herramientas/Cursos/Estudios/Noticias) — the result set must narrow to the chosen `tipo`. Capture a screenshot.

- [ ] **Step 3: Verify the header modal + ⌘K + a11y**

On `http://localhost:4321/` : click the header search button → modal opens, input auto-focused. Press `Escape` → closes, focus returns to the trigger. Reopen with `⌘K` (Mac) / `Ctrl+K`. `Tab` cycles within the dialog (focus trap holds). Confirm `role="dialog"`/`aria-modal="true"` on the dialog and `aria-pressed` toggling on chips.

- [ ] **Step 4: Confirm NO CSP violations in the console**

With the browser console open, run a search and check `console`/network: Pagefind's WASM must instantiate and `/pagefind/*` fetches must succeed with **zero** CSP errors. If a CSP error mentions a worker or `blob:`, add `worker-src 'self'` to the CSP in `vercel.json` and rebuild. (Expected: none needed — same-origin script + wasm-unsafe-eval covers it.)

- [ ] **Step 5: Lighthouse — no first-load regression**

Run a Lighthouse audit (chrome-devtools MCP `lighthouse_audit`, categories performance + a11y + seo, or Chrome DevTools manually) on `/` and `/buscar`. Confirm Pagefind JS is **not** in the initial load of `/` (it lazy-loads only on modal open) and that Performance/Accessibility show no regression vs. before. If `lighthouse` can't run in the environment, do a manual checklist (lazy import confirmed by network panel: no `/pagefind/` request until you open the modal) and report honestly.

- [ ] **Step 6: Stop the server; commit any fixes**

```bash
kill %1
git add -A && git commit -m "fix(search): a11y + CSP polish from live verification (#56)" || echo "no fixes needed"
```

---

## Final: open the PR

- [ ] **Step 1: Push + PR**

```bash
git push -u origin feat/search-pagefind
gh pr create --title "feat(search): búsqueda global con Pagefind (épico #56)" --body "$(cat <<'EOF'
Cierra #56. Búsqueda global estática con Pagefind sobre herramientas + cursos + estudios + noticias.

## Incluye
- Índice Pagefind generado en `postbuild` sobre la salida servida (`.vercel/output/static`).
- `data-pagefind-body` + facetas `tipo`/`categoria` solo en las 4 plantillas de detalle (listados/legales fuera).
- Motor compartido `src/scripts/search.ts` (lazy, debounce, filtros, badges por tipo).
- Página `/buscar?q=` (deep-link) + modal en cabecera (icono 🔍 + ⌘K, foco atrapado, Esc).
- CSP: `script-src` con `'wasm-unsafe-eval'`.

## Verificación
- `npm run build` verde + `/pagefind/` en la salida servida.
- Resultados cross-type con badges de color + resaltado; filtros por tipo.
- Modal accesible (dialog/aria-modal, focus-trap, Esc, ⌘K); JS de Pagefind lazy (no en first load).
- Sin errores CSP en consola.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: After merge** — close #56, tick it in roadmap #55, take a real Lighthouse pass on the Vercel preview/prod URL.

---

## Self-review (plan author)

- **Spec coverage:** indexing/integration (A)→Task 1; markup+facets (B/decisions)→Task 2; CSP (decisions)→Task 3; shared engine (E)→Task 4; result styles/badges→Task 5; `/buscar` deep-link→Task 6; modal+⌘K+a11y→Tasks 7–8; lazy-load + states + errors→Tasks 4/6/9; Lighthouse→Task 9. All acceptance criteria map to a step. ✅
- **Placeholder scan:** no TBD/TODO; the only conditionals (worker-src if a CSP error appears; "no fixes needed" commit) are explicit branches, not gaps. ✅
- **Type/contract consistency:** the DOM contract (`[data-search-input|results|count|empty|noresults|filter]`, `data-value`) is identical across `search.ts`, `buscar.astro`, and `SearchModal.astro`; `createSearch` returns `{run, focus}` used by both mounts; `TYPE_META` keys (`Herramienta/Curso/Estudio/Noticia`) match the `data-pagefind-meta="tipo:…"` values written in Task 2 and the filter `data-value`s. ✅
