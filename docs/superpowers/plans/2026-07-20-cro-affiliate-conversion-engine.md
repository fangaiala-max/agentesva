# CRO Affiliate Conversion Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn AgentesVA into an honest, fully-measured affiliate-click engine — every outbound "Visitar sitio" click is tracked and optimized, so it starts earning the moment an `affiliateUrl` is populated.

**Architecture:** Five phases, instrumentation first. Phase 1 adds a GA4 event helper (reusing the existing consent/dataLayer wiring) + structured server-side `/ir/` click logging. Phase 5 adds optional schema fields. Phase 2 builds a small reusable conversion toolkit (a tracked CTA, honest data-driven badges, trust signals, in-content callouts). Phase 3 restructures the tool ficha into a high-converting page. Phase 4 optimizes the feeders (cards, content pages, home). All logic that can be unit-tested lives in plain `.ts` modules (the repo tests `.ts`, not `.astro`); `.astro` changes are verified by `npm run build`.

**Tech Stack:** Astro 7 (static, Vercel), TypeScript, Zod content collections, Vitest + happy-dom, GA4 (Consent Mode v2, already wired), no new dependencies, no CSP change (GA domains already allowed in `vercel.json`).

**Spec:** `docs/superpowers/specs/2026-07-20-cro-affiliate-conversion-engine-design.md`

---

## Conventions (read once)

- **Tests:** Vitest, `describe`/`it`/`expect`, Spanish test names, files at `tests/<name>.test.ts`, run with `npm run test` (alias for `vitest run`). happy-dom environment; `tests/setup.ts` stubs `IntersectionObserver`.
- **Run a single test file:** `npx vitest run tests/<name>.test.ts`
- **Build (validates all content JSON against Zod schemas):** `npm run build`
- **Client scripts** are plain exported functions in `src/scripts/`, wired from `.astro` `<script>` blocks on `astro:page-load`. CSP is strict (`script-src 'self'`) — **no inline handlers, no external scripts.**
- **Design tokens** (in `src/styles/global.css`, used via `var(--x)`): `--accent` `#5B7CFF` (primary CTA), `--gold` (editor), `--green` (free/positive), `--bg`, `--panel`, `--panel-2`, `--line`, `--line-2`, `--fg`…`--fg-5`, fonts `--sans` / `--serif` / `--mono`.
- **Commit after each task.** Branch is `feat/cro-affiliate-engine` (already created).

---

## Reconciliations with the spec (already decided — do not re-litigate)

1. **No new `rating` field** — `Tool.rating` already exists as a `string`; reuse it.
2. **No new `editorPick` field** — the existing `destacado: boolean` already drives the "★ Editor" badge; reuse it.
3. **No `freeTier` field** — derive the "Plan gratis" badge from `price === 'Freemium'`.
4. **`track()` uses the existing `dataLayer` pattern guarded by `isGA4Loaded()`**, not `window.gtag` (which this codebase never defines). Behavior matches the spec: fire only when consent granted + GA4 loaded, else silent no-op.
5. **Content pages already have a "Herramientas mencionadas/relacionadas" block** linking to fichas — we *enhance* those into `ToolCallout`s with a direct tracked CTA, not add new sections.

---

# PHASE 1 — Instrumentation

## Task 1: Pure `/ir/` helpers (`src/data/ir.ts`)

**Files:**
- Create: `src/data/ir.ts`
- Test: `tests/ir.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/ir.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { affiliateHref, sanitizeSrc, pickToolDest, buildClickLog } from '../src/data/ir';

describe('affiliateHref', () => {
  it('construye /ir/{slug}?src={src}', () => {
    expect(affiliateHref('notion-ai', 'ficha-hero')).toBe('/ir/notion-ai?src=ficha-hero');
  });
  it('codifica el src', () => {
    expect(affiliateHref('x', 'a b')).toBe('/ir/x?src=a%20b');
  });
});

describe('sanitizeSrc', () => {
  it('acepta placements conocidos (minúsculas, dígitos, guiones)', () => {
    expect(sanitizeSrc('ficha-sticky')).toBe('ficha-sticky');
    expect(sanitizeSrc('card-home')).toBe('card-home');
  });
  it('rechaza null, vacío y basura', () => {
    expect(sanitizeSrc(null)).toBeNull();
    expect(sanitizeSrc('')).toBeNull();
    expect(sanitizeSrc('DROP TABLE')).toBeNull();
    expect(sanitizeSrc('a'.repeat(41))).toBeNull();
  });
});

describe('pickToolDest', () => {
  it('usa affiliateUrl cuando existe (hasAffiliate true)', () => {
    expect(pickToolDest({ url: 'https://o.com', affiliateUrl: 'https://a.com?ref=x' }))
      .toEqual({ dest: 'https://a.com?ref=x', hasAffiliate: true });
  });
  it('cae a url oficial cuando no hay afiliado (hasAffiliate false)', () => {
    expect(pickToolDest({ url: 'https://o.com' }))
      .toEqual({ dest: 'https://o.com', hasAffiliate: false });
  });
});

describe('buildClickLog', () => {
  it('produce el payload estructurado del click', () => {
    expect(buildClickLog({
      type: 'tool', slug: 'notion-ai', dest: 'https://a.com',
      hasAffiliate: true, src: 'ficha-hero', referer: 'https://agentesva.com/',
      ts: '2026-07-20T00:00:00.000Z',
    })).toEqual({
      evt: 'ir_click', ts: '2026-07-20T00:00:00.000Z', type: 'tool',
      slug: 'notion-ai', hasAffiliate: true, src: 'ficha-hero',
      referer: 'https://agentesva.com/', dest: 'https://a.com',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ir.test.ts`
Expected: FAIL — `Failed to resolve import "../src/data/ir"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/data/ir.ts`:

```ts
// Lógica pura de la salida afiliado (/ir/[slug]). Sin dependencias de astro:content,
// para poder testearla. La ruta la consume en src/pages/ir/[slug].ts.

/** Enlace de salida tracked: /ir/{slug}?src={placement}. */
export function affiliateHref(slug: string, src: string): string {
  return `/ir/${slug}?src=${encodeURIComponent(src)}`;
}

/** Sólo placements con forma conocida (evita basura/inyección en los logs). */
export function sanitizeSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return /^[a-z0-9-]{1,40}$/.test(raw) ? raw : null;
}

/** Destino de una herramienta: afiliado si existe, si no la url oficial. */
export function pickToolDest(tool: { url: string; affiliateUrl?: string }): {
  dest: string;
  hasAffiliate: boolean;
} {
  const hasAffiliate = Boolean(tool.affiliateUrl);
  return { dest: tool.affiliateUrl || tool.url, hasAffiliate };
}

export interface ClickLog {
  evt: 'ir_click';
  ts: string;
  type: string;
  slug: string;
  hasAffiliate: boolean;
  src: string | null;
  referer: string | null;
  dest: string;
}

/** Payload estructurado que se emite por console.log (fuente de verdad en Vercel logs). */
export function buildClickLog(p: {
  type: string;
  slug: string;
  dest: string;
  hasAffiliate: boolean;
  src: string | null;
  referer: string | null;
  ts: string;
}): ClickLog {
  return {
    evt: 'ir_click',
    ts: p.ts,
    type: p.type,
    slug: p.slug,
    hasAffiliate: p.hasAffiliate,
    src: p.src,
    referer: p.referer,
    dest: p.dest,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ir.test.ts`
Expected: PASS (4 describes, 8 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/data/ir.ts tests/ir.test.ts
git commit -m "feat(cro): pure /ir/ helpers (affiliateHref, sanitizeSrc, pickToolDest, buildClickLog)"
```

---

## Task 2: Structured server-side click logging (`/ir/[slug].ts`)

**Files:**
- Modify: `src/pages/ir/[slug].ts` (full rewrite below)

- [ ] **Step 1: Rewrite the route to read `src`/`referer` and emit a structured log**

Replace the entire contents of `src/pages/ir/[slug].ts` with:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pickToolDest, sanitizeSrc, buildClickLog } from '../../data/ir';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Resuelve primero herramientas (#50), luego cursos (#54), luego recursos (#57).
// Los slugs son únicos entre las tres colecciones (guard de build en /cursos y /recursos).
export const prerender = false;

function redirect(
  dest: string,
  meta: { type: string; slug: string; hasAffiliate: boolean; src: string | null; referer: string | null },
): Response {
  // Log estructurado JSON: 100% de captura, sin cookies/consentimiento (server-side).
  // Fuente de verdad de clicks de afiliado en los logs de la función Vercel.
  console.log(
    JSON.stringify(
      buildClickLog({
        type: meta.type,
        slug: meta.slug,
        dest,
        hasAffiliate: meta.hasAffiliate,
        src: meta.src,
        referer: meta.referer,
        ts: new Date().toISOString(),
      }),
    ),
  );
  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
}

export const GET: APIRoute = async ({ params, url, request }) => {
  const slug = params.slug;
  if (!slug) return new Response('No encontrado', { status: 404 });

  const src = sanitizeSrc(url.searchParams.get('src'));
  const referer = request.headers.get('referer');

  const tool = (await getCollection('tools')).find((t) => t.id === slug);
  if (tool) {
    const { dest, hasAffiliate } = pickToolDest(tool.data);
    return redirect(dest, { type: 'tool', slug, hasAffiliate, src, referer });
  }

  const curso = (await getCollection('cursos')).find((c) => c.id === slug);
  if (curso) {
    // propio → Gumroad (officialUrl es su propia ficha, evita bucle 302); externo → afiliado||oficial.
    const dest =
      curso.data.tipo === 'propio'
        ? curso.data.gumroadUrl || curso.data.officialUrl
        : curso.data.affiliateUrl || curso.data.officialUrl;
    const hasAffiliate = curso.data.tipo === 'propio' ? Boolean(curso.data.gumroadUrl) : Boolean(curso.data.affiliateUrl);
    return redirect(dest, { type: 'curso', slug, hasAffiliate, src, referer });
  }

  const recurso = (await getCollection('recursos')).find((r) => r.id === slug);
  if (recurso) {
    // pago → compraUrl (Gumroad/Stripe); gratis → descarga directa o /newsletter (con puerta).
    const dest =
      recurso.data.precio === 'Pago'
        ? (recurso.data.compraUrl as string)
        : recurso.data.downloadUrl || '/newsletter';
    return redirect(dest, { type: 'recurso', slug, hasAffiliate: recurso.data.precio === 'Pago', src, referer });
  }

  return new Response('No encontrado', { status: 404 });
};
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npm run build`
Expected: build succeeds (88+ pages), no TypeScript errors.

- [ ] **Step 3: Verify existing tests still pass**

Run: `npm run test`
Expected: all pass (including new `tests/ir.test.ts`).

- [ ] **Step 4: Commit**

```bash
git add "src/pages/ir/[slug].ts"
git commit -m "feat(cro): structured JSON click logging on /ir/ (src, referer, hasAffiliate)"
```

---

## Task 3: GA4 event helper + delegated tracking (`src/scripts/track.ts`)

**Files:**
- Create: `src/scripts/track.ts`
- Test: `tests/track.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/track.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { track, initTracking, fireViewEvents } from '../src/scripts/track';

// Simula "GA4 cargado" = consentimiento analítico concedido (mismo marcador que consent.ts).
function loadGA4() {
  const s = document.createElement('script');
  s.setAttribute('data-ga4', '1');
  document.head.appendChild(s);
}
function events(): unknown[] {
  // @ts-expect-error dataLayer inyectado
  return (window.dataLayer as unknown[]) ?? [];
}
function eventNames(): string[] {
  return events()
    .filter((e) => Array.isArray(e) && e[0] === 'event')
    .map((e) => (e as unknown[])[1] as string);
}

beforeEach(() => {
  document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());
  document.body.innerHTML = '';
  // @ts-expect-error reset dataLayer entre tests
  window.dataLayer = undefined;
  // NOTA: no reseteamos __trackingWired — el listener delegado persiste (View
  // Transitions no recrean el documento); initTracking es idempotente a propósito.
});

describe('track', () => {
  it('no hace nada si GA4 no está cargado (sin consentimiento)', () => {
    track('affiliate_click', { slug: 'x' });
    expect(eventNames()).not.toContain('affiliate_click');
  });

  it('empuja ["event", nombre, params] cuando GA4 está cargado', () => {
    loadGA4();
    track('affiliate_click', { slug: 'notion-ai', src: 'ficha-hero' });
    const last = events().at(-1) as unknown[];
    expect(last[0]).toBe('event');
    expect(last[1]).toBe('affiliate_click');
    expect(last[2]).toEqual({ slug: 'notion-ai', src: 'ficha-hero' });
  });
});

describe('initTracking (click delegado)', () => {
  it('dispara affiliate_click leyendo los data-track-* del CTA', () => {
    loadGA4();
    document.body.innerHTML = `
      <a href="#" data-track-event="affiliate_click"
         data-track-slug="notion-ai" data-track-src="ficha-hero"
         data-track-has-affiliate="1">Visitar</a>`;
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('affiliate_click');
    expect(last[2]).toEqual({ slug: 'notion-ai', src: 'ficha-hero', has_affiliate: '1' });
  });

  it('ignora clicks en elementos sin data-track-event', () => {
    loadGA4();
    document.body.innerHTML = `<a href="#">sin tracking</a>`;
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventNames()).toHaveLength(0);
  });

  it('es idempotente: dos initTracking → un solo evento por click', () => {
    loadGA4();
    document.body.innerHTML = `<a href="#" data-track-event="affiliate_click" data-track-slug="a">x</a>`;
    initTracking();
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventNames().filter((n) => n === 'affiliate_click')).toHaveLength(1);
  });
});

describe('fireViewEvents', () => {
  it('dispara el evento de [data-track-view] con sus params', () => {
    loadGA4();
    document.body.innerHTML = `<main data-track-view="view_ficha" data-track-slug="notion-ai" data-track-category="Asistentes"></main>`;
    fireViewEvents();
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('view_ficha');
    expect(last[2]).toEqual({ slug: 'notion-ai', category: 'Asistentes' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/track.test.ts`
Expected: FAIL — `Failed to resolve import "../src/scripts/track"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/scripts/track.ts`:

```ts
// Eventos GA4 respetando el consentimiento. CSP-safe (módulo 'self'; no scripts inline,
// no dependencias nuevas). Reutiliza el patrón dataLayer de consent.ts: sólo emite si
// GA4 está cargado (= consentimiento analítico concedido); si no, no-op silencioso.
import { isGA4Loaded } from './consent';

function dataLayer(): unknown[] {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (!isGA4Loaded()) return;
  dataLayer().push(['event', event, params]);
}

// Recoge data-track-* (excepto -event y -view) en params; guiones → guiones_bajos
// para que las claves sean válidas como parámetros GA4 (snake_case).
function paramsFrom(el: Element): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const attr of Array.from(el.attributes)) {
    const n = attr.name;
    if (n.startsWith('data-track-') && n !== 'data-track-event' && n !== 'data-track-view') {
      params[n.slice('data-track-'.length).replace(/-/g, '_')] = attr.value;
    }
  }
  return params;
}

// Un único listener delegado (idempotente pese a View Transitions) para clicks en
// [data-track-event]. Captura para disparar antes de que empiece la navegación.
export function initTracking(): void {
  const w = window as unknown as { __trackingWired?: boolean };
  if (w.__trackingWired) return;
  w.__trackingWired = true;
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest?.('[data-track-event]');
      if (!el) return;
      const event = el.getAttribute('data-track-event');
      if (event) track(event, paramsFrom(el));
    },
    { capture: true },
  );
}

// Dispara eventos de vista ([data-track-view]) una vez por carga de página.
export function fireViewEvents(): void {
  document.querySelectorAll('[data-track-view]').forEach((el) => {
    const event = el.getAttribute('data-track-view');
    if (event) track(event, paramsFrom(el));
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/track.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/track.ts tests/track.test.ts
git commit -m "feat(cro): GA4 track() helper + delegated click/view instrumentation"
```

---

## Task 4: Wire global tracking into `BaseLayout.astro`

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (add a `<script>` block)

- [ ] **Step 1: Add the global tracking script**

In `src/layouts/BaseLayout.astro`, replace this block (lines ~67-70):

```astro
  <body class="min-h-screen">
    <slot />
    <ConsentBanner />
  </body>
</html>
```

with:

```astro
  <body class="min-h-screen">
    <slot />
    <ConsentBanner />
  </body>
</html>

<script>
  import { initTracking, fireViewEvents } from '../scripts/track';
  document.addEventListener('astro:page-load', () => {
    initTracking();
    fireViewEvents();
  });
</script>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; the module script is bundled and hoisted (a `<script type="module">` appears in output HTML — every page now inits tracking).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(cro): init delegated tracking + view events site-wide in BaseLayout"
```

---

## Task 5: Fire `newsletter_submit` on subscribe success

**Files:**
- Modify: `src/scripts/subscribe.ts` (import `track`, call on success)
- Modify: `tests/subscribe.test.ts` (add one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/subscribe.test.ts` (inside the file, after existing tests). First ensure these imports exist at the top of the file — if `initSubscribe` is already imported, reuse it; add a GA4 loader helper near the top of the file:

```ts
// helper (colócalo junto a los demás helpers del archivo)
function loadGA4ForSubscribe() {
  const s = document.createElement('script');
  s.setAttribute('data-ga4', '1');
  document.head.appendChild(s);
}
```

Then add this test block:

```ts
describe('subscribe → GA4 newsletter_submit', () => {
  it('emite newsletter_submit tras una suscripción correcta (con GA4 cargado)', async () => {
    loadGA4ForSubscribe();
    document.body.innerHTML = `
      <div data-subscribe-root>
        <form data-subscribe data-list="newsletter">
          <input data-subscribe-email value="hola@ejemplo.com" />
          <button data-subscribe-submit>Suscribirse</button>
        </form>
        <div data-subscribe-success hidden></div>
        <div data-subscribe-error hidden></div>
      </div>`;
    // @ts-expect-error mock fetch OK
    global.fetch = async () => ({ ok: true, json: async () => ({}) });
    initSubscribe();
    const form = document.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    // @ts-expect-error dataLayer inyectado
    const evs = (window.dataLayer as unknown[]) ?? [];
    const fired = evs.some((e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'newsletter_submit');
    expect(fired).toBe(true);
  });
});
```

> If `tests/subscribe.test.ts` doesn't reset `window.dataLayer`/`script[data-ga4]` in a `beforeEach`, add `document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());` and `// @ts-expect-error` + `window.dataLayer = undefined;` to its existing `beforeEach` (or add one) so this test is isolated.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/subscribe.test.ts`
Expected: FAIL — `newsletter_submit` not fired (track not called yet).

- [ ] **Step 3: Implement — call `track` on success**

In `src/scripts/subscribe.ts`, add the import at the top (after the header comment, line ~13):

```ts
import { track } from './track';
```

Then, in the `form.addEventListener('submit', …)` success path, locate the two success spots and add the event. Change the honeypot success branch (lines ~47-51):

```ts
    // Honeypot relleno → simula éxito sin enviar nada (los bots no se enteran).
    if (hp && hp.value) {
      form.hidden = true;
      if (ok) ok.hidden = false;
      return;
    }
```

to:

```ts
    // Honeypot relleno → simula éxito sin enviar nada (los bots no se enteran).
    // No emitimos evento: es tráfico bot, no una conversión real.
    if (hp && hp.value) {
      form.hidden = true;
      if (ok) ok.hidden = false;
      return;
    }
```

And change the real success branch (lines ~71-72):

```ts
      form.hidden = true;
      if (ok) ok.hidden = false;
```

to:

```ts
      form.hidden = true;
      if (ok) ok.hidden = false;
      track('newsletter_submit', { list });
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/subscribe.test.ts`
Expected: PASS (existing tests + the new one).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/subscribe.ts tests/subscribe.test.ts
git commit -m "feat(cro): fire GA4 newsletter_submit on successful subscribe"
```

---

# PHASE 5 — Schema fields (landed early so the ficha can use them)

## Task 6: Add optional tool fields (schema + `Tool` interface)

**Files:**
- Modify: `src/content.config.ts` (tools schema)
- Modify: `src/data/tools.ts` (`Tool` interface)

- [ ] **Step 1: Extend the Zod tools schema**

In `src/content.config.ts`, inside the `tools` collection `schema: z.object({ … })` (lines ~8-28), add these fields right before the `faq:` line (all optional → existing 54 JSONs stay valid):

```ts
    // CRO (todos opcionales; se rellenan de forma incremental):
    popular: z.boolean().optional(),        // badge "Popular" (curado editorialmente)
    verdict: z.string().optional(),         // veredicto de una línea ("por qué lo recomendamos")
    pros: z.array(z.string()).optional(),   // lista de pros en la ficha
    cons: z.array(z.string()).optional(),   // lista de contras en la ficha
    addedAt: z.coerce.date().optional(),    // badge "Nuevo" (<30 días) + "en el directorio desde"
```

- [ ] **Step 2: Mirror the fields in the `Tool` interface**

In `src/data/tools.ts`, add to the `Tool` interface (after `destacado?: boolean;`, line ~23):

```ts
  popular?: boolean;
  verdict?: string;
  pros?: string[];
  cons?: string[];
  addedAt?: Date;
```

- [ ] **Step 3: Verify the build validates all content**

Run: `npm run build`
Expected: build succeeds — all 54 tool JSONs validate against the extended (backward-compatible) schema.

- [ ] **Step 4: Verify tests still pass**

Run: `npm run test`
Expected: all pass (the `Tool` factory in `tests/tools.test.ts` still type-checks — new fields are optional).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/data/tools.ts
git commit -m "feat(cro): optional tool schema fields (popular, verdict, pros, cons, addedAt)"
```

---

# PHASE 2 — Conversion toolkit

## Task 7: `badgesFor` helper (honest, data-driven badges)

**Files:**
- Modify: `src/data/tools.ts` (add `badgesFor` + types)
- Modify: `tests/tools.test.ts` (add tests)

- [ ] **Step 1: Write the failing test**

Append to `tests/tools.test.ts`:

```ts
import { badgesFor } from '../src/data/tools';

describe('badgesFor', () => {
  const NOW = new Date('2026-07-20T00:00:00.000Z');

  it('sin campos → sin badges', () => {
    expect(badgesFor(tool({}), NOW)).toEqual([]);
  });

  it('destacado → badge editor', () => {
    expect(badgesFor(tool({ destacado: true }), NOW)).toEqual([{ kind: 'editor', label: '★ Editor' }]);
  });

  it('popular → badge popular', () => {
    expect(badgesFor(tool({ popular: true }), NOW)).toEqual([{ kind: 'popular', label: 'Popular' }]);
  });

  it('price Freemium → badge "Plan gratis"; Gratis y Pago no lo emiten', () => {
    expect(badgesFor(tool({ price: 'Freemium' }), NOW)).toContainEqual({ kind: 'free', label: 'Plan gratis' });
    expect(badgesFor(tool({ price: 'Gratis' }), NOW).some((b) => b.kind === 'free')).toBe(false);
    expect(badgesFor(tool({ price: 'Pago' }), NOW).some((b) => b.kind === 'free')).toBe(false);
  });

  it('addedAt dentro de 30 días → badge Nuevo; más antiguo → no', () => {
    expect(badgesFor(tool({ addedAt: new Date('2026-07-05T00:00:00.000Z') }), NOW).some((b) => b.kind === 'nuevo')).toBe(true);
    expect(badgesFor(tool({ addedAt: new Date('2026-05-01T00:00:00.000Z') }), NOW).some((b) => b.kind === 'nuevo')).toBe(false);
  });

  it('orden estable: editor, popular, free, nuevo', () => {
    const b = badgesFor(tool({ destacado: true, popular: true, price: 'Freemium', addedAt: NOW }), NOW);
    expect(b.map((x) => x.kind)).toEqual(['editor', 'popular', 'free', 'nuevo']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/tools.test.ts`
Expected: FAIL — `badgesFor` is not exported.

- [ ] **Step 3: Implement**

In `src/data/tools.ts`, add at the end of the file:

```ts
// Badges honestos del directorio: cada uno mapea a un campo real (nunca inventados).
export type BadgeKind = 'editor' | 'popular' | 'free' | 'nuevo';
export interface Badge {
  kind: BadgeKind;
  label: string;
}

const NUEVO_DIAS = 30;

export function badgesFor(t: Tool, now: Date = new Date()): Badge[] {
  const badges: Badge[] = [];
  if (t.destacado) badges.push({ kind: 'editor', label: '★ Editor' });
  if (t.popular) badges.push({ kind: 'popular', label: 'Popular' });
  if (t.price === 'Freemium') badges.push({ kind: 'free', label: 'Plan gratis' });
  if (t.addedAt) {
    const dias = (now.getTime() - new Date(t.addedAt).getTime()) / 86_400_000;
    if (dias >= 0 && dias <= NUEVO_DIAS) badges.push({ kind: 'nuevo', label: 'Nuevo' });
  }
  return badges;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/tools.test.ts`
Expected: PASS (existing + new `badgesFor` tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/tools.ts tests/tools.test.ts
git commit -m "feat(cro): badgesFor helper — honest data-driven badges"
```

---

## Task 8: `AffiliateCTA.astro` — the single tracked outbound CTA

**Files:**
- Create: `src/components/AffiliateCTA.astro`

- [ ] **Step 1: Create the component**

Create `src/components/AffiliateCTA.astro`:

```astro
---
// CTA de salida afiliado, tracked. Única fuente de verdad para clicks a herramientas:
// /ir/{slug}?src={placement}, rel sponsored, evento GA4 vía data-track-* (ver track.ts).
import { affiliateHref } from '../data/ir';

interface Props {
  slug: string;
  src: string;
  variant?: 'primary' | 'inline' | 'sticky';
  label?: string;
  hasAffiliate?: boolean;
}
const { slug, src, variant = 'primary', label = 'Visitar sitio →', hasAffiliate = false } = Astro.props;

const base = 'text-decoration: none; font-family: var(--sans); font-weight: 600; text-align: center; white-space: nowrap;';
const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: `${base} background: var(--accent); color: var(--bg); border: none; padding: 13px 24px; border-radius: 2px; font-size: 14px; display: inline-block;`,
  inline: `${base} background: transparent; color: var(--accent); border: 1px solid var(--accent); padding: 7px 14px; border-radius: 2px; font-size: 12.5px; display: inline-block;`,
  sticky: `${base} background: var(--accent); color: var(--bg); border: none; padding: 14px 20px; border-radius: 2px; font-size: 15px; display: block; width: 100%;`,
};
---

<a
  href={affiliateHref(slug, src)}
  target="_blank"
  rel="sponsored nofollow noopener"
  class="lift shimmer"
  data-track-event="affiliate_click"
  data-track-slug={slug}
  data-track-src={src}
  data-track-has-affiliate={hasAffiliate ? '1' : '0'}
  style={styles[variant]}
>{label}</a>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (component unused so far — this just confirms it compiles).

- [ ] **Step 3: Commit**

```bash
git add src/components/AffiliateCTA.astro
git commit -m "feat(cro): AffiliateCTA — single tracked outbound CTA (3 variants)"
```

---

## Task 9: `Badge.astro` — render the honest badges

**Files:**
- Create: `src/components/Badge.astro`

- [ ] **Step 1: Create the component**

Create `src/components/Badge.astro`:

```astro
---
import type { Badge } from '../data/tools';
interface Props {
  badge: Badge;
}
const { badge } = Astro.props;

// Color por tipo, siempre con tokens del sistema.
const palette: Record<Badge['kind'], { fg: string; bg: string; border: string }> = {
  editor: { fg: 'var(--gold)', bg: 'rgba(245,196,81,0.12)', border: 'rgba(245,196,81,0.4)' },
  popular: { fg: 'var(--accent)', bg: 'rgba(91,124,255,0.12)', border: 'rgba(91,124,255,0.4)' },
  free: { fg: 'var(--green)', bg: 'rgba(79,211,154,0.12)', border: 'rgba(79,211,154,0.4)' },
  nuevo: { fg: 'var(--fg-3)', bg: 'var(--panel-2)', border: 'var(--line-2)' },
};
const c = palette[badge.kind];
---

<span
  style={`font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: ${c.fg}; background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 20px; padding: 2px 8px; white-space: nowrap;`}
>{badge.label}</span>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Badge.astro
git commit -m "feat(cro): Badge component (editor/popular/free/nuevo, token colors)"
```

---

## Task 10: `TrustSignals.astro` — honest aggregate signals

**Files:**
- Create: `src/components/TrustSignals.astro`

- [ ] **Step 1: Create the component**

Create `src/components/TrustSignals.astro`:

```astro
---
// Señales de confianza honestas para la ficha. Cada fila se renderiza sólo si hay dato.
import type { Tool } from '../data/tools';
interface Props {
  tool: Tool;
  altsCount?: number;
}
const { tool, altsCount = 0 } = Astro.props;

const fechaAlta = tool.addedAt
  ? new Date(tool.addedAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  : null;

const rows: { label: string; value: string; accent?: boolean }[] = [
  { label: 'Valoración editorial', value: `★ ${tool.rating}`, accent: true },
  { label: 'Modelo de precio', value: tool.price },
  ...(altsCount > 0 ? [{ label: 'Alternativas comparadas', value: String(altsCount) }] : []),
  ...(fechaAlta ? [{ label: 'En el directorio desde', value: fechaAlta }] : []),
];
---

<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;">
  {rows.map((r) => (
    <span style="display: inline-flex; align-items: baseline; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--fg-3); background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 20px; padding: 5px 11px;">
      <span style="color: var(--fg-5); text-transform: uppercase; letter-spacing: 0.06em; font-size: 9.5px;">{r.label}</span>
      <span style={r.accent ? 'color: var(--accent);' : 'color: var(--fg-2);'}>{r.value}</span>
    </span>
  ))}
</div>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/TrustSignals.astro
git commit -m "feat(cro): TrustSignals component (honest aggregate signals)"
```

---

## Task 11: `ToolCallout.astro` — in-content recommendation card

**Files:**
- Create: `src/components/ToolCallout.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ToolCallout.astro`:

```astro
---
// Tarjeta de recomendación in-content (estudios/noticias): logo + pitch + CTA tracked.
// Cierra la brecha "el contenido no convierte" con salida afiliado directa.
import type { Tool } from '../data/tools';
import AffiliateCTA from './AffiliateCTA.astro';
interface Props {
  tool: Tool;
  src: string;
}
const { tool, src } = Astro.props;
---

<div style="display: flex; align-items: center; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 16px; flex-wrap: wrap;">
  <span style={`width: 40px; height: 40px; border-radius: 9px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 18px; color: #fff; background: ${tool.color};`}>{tool.name.charAt(0)}</span>
  <div style="flex: 1; min-width: 180px;">
    <a href={`/herramienta/${tool.slug}`} style="font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; text-decoration: none;">{tool.name}</a>
    <p style="margin: 3px 0 0; font-size: 13px; line-height: 1.45; color: var(--fg-3);">{tool.tagline}</p>
  </div>
  <AffiliateCTA slug={tool.slug} src={src} variant="inline" label="Visitar ↗" hasAffiliate={Boolean(tool.affiliateUrl)} />
</div>
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ToolCallout.astro
git commit -m "feat(cro): ToolCallout — in-content recommendation card with tracked CTA"
```

---

# PHASE 3 — Ficha as the money page

## Task 12: Restructure the tool ficha

**Files:**
- Modify: `src/pages/herramienta/[slug].astro`

- [ ] **Step 1: Add imports + `view_ficha` marker + hero CTA**

In `src/pages/herramienta/[slug].astro`, update the frontmatter imports (line ~6) to add the new components:

```ts
import { toTool, getAlternatives, fallbackFaqs, PRICE_COLOR, badgesFor, type Tool } from '../../data/tools';
```

Add after that import line:

```ts
import AffiliateCTA from '../../components/AffiliateCTA.astro';
import Badge from '../../components/Badge.astro';
import TrustSignals from '../../components/TrustSignals.astro';
```

Add to the frontmatter (after `const priceColor = …`, line ~20):

```ts
const badges = badgesFor(tool);
const hasAffiliate = Boolean(tool.affiliateUrl);
```

- [ ] **Step 2: Add the `data-track-view` marker to `<main>`**

Change the `<main …>` opening tag (lines ~63-68) to add view-tracking attributes:

```astro
  <main
    data-pagefind-body
    data-pagefind-filter="tipo:Herramienta"
    data-pagefind-meta="tipo:Herramienta"
    data-track-view="view_ficha"
    data-track-slug={tool.slug}
    data-track-category={tool.cat}
    style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;"
  >
```

- [ ] **Step 3: Replace the hero block (badges, verdict, tracked hero CTA)**

Replace the hero `<div>` (lines ~71-86, from `<div style="display: flex; align-items: flex-start; gap: 22px; …">` through its closing `</div>` before the grid) with:

```astro
    <div style="display: flex; align-items: flex-start; gap: 22px; margin-top: 26px; border-bottom: 1px solid var(--line); padding-bottom: 32px; flex-wrap: wrap;">
      <div transition:name={`mono-${tool.slug}`} style={`width: 74px; height: 74px; border-radius: 16px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 33px; color: #fff; background: ${tool.color};`}>{initial}</div>
      <div style="flex: 1; min-width: 220px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);">{tool.cat}</span>
          {badges.map((b) => <Badge badge={b} />)}
        </div>
        <h1 style="font-family: var(--sans); font-weight: 700; font-size: clamp(30px, 6vw, 40px); letter-spacing: -0.03em; margin: 6px 0 0; color: #fff;">{tool.name}</h1>
        <p style="font-size: 16.5px; line-height: 1.5; color: var(--fg-3); margin: 8px 0 0; max-width: 34em;">{tool.tagline}</p>
        {tool.verdict && (
          <p style="font-size: 15px; line-height: 1.55; color: var(--fg-2); margin: 12px 0 0; max-width: 40em; border-left: 2px solid var(--accent); padding-left: 12px;"><strong style="color: #fff;">Por qué lo recomendamos:</strong> {tool.verdict}</p>
        )}
        <TrustSignals tool={tool} altsCount={alts.length} />
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; flex: none;">
        <AffiliateCTA slug={tool.slug} src="ficha-hero" hasAffiliate={hasAffiliate} />
        <button type="button" id="save-btn" data-slug={tool.slug} aria-pressed="false" style="background: var(--panel-2); color: var(--fg-2); border: 1px solid var(--line-2); padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap;"><span id="save-label">Guardar</span></button>
      </div>
    </div>
```

- [ ] **Step 4: Add a Pros/Contras block**

In the left column, immediately after the "Qué es" paragraph (after line ~91, the `<p>…{tool.long}…</p>`), insert:

```astro
        {(tool.pros?.length || tool.cons?.length) && (
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 28px;">
            {tool.pros?.length && (
              <div style="border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 18px;">
                <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green);">A favor</span>
                <div style="display: flex; flex-direction: column; gap: 9px; margin-top: 12px;">
                  {tool.pros.map((p) => (
                    <div style="display: flex; gap: 9px; align-items: flex-start;"><span aria-hidden="true" style="color: var(--green); font-family: var(--mono); font-size: 13px;">+</span><span style="font-size: 14px; line-height: 1.5; color: var(--fg-2);">{p}</span></div>
                  ))}
                </div>
              </div>
            )}
            {tool.cons?.length && (
              <div style="border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 18px;">
                <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-4);">A tener en cuenta</span>
                <div style="display: flex; flex-direction: column; gap: 9px; margin-top: 12px;">
                  {tool.cons.map((c) => (
                    <div style="display: flex; gap: 9px; align-items: flex-start;"><span aria-hidden="true" style="color: var(--fg-4); font-family: var(--mono); font-size: 13px;">−</span><span style="font-size: 14px; line-height: 1.5; color: var(--fg-2);">{c}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 5: Add a tracked mini-CTA to each alternative row**

In the alternatives `<aside>` block, change each alt anchor (lines ~146-153) so the row keeps its link to the ficha but gains a tracked "Visitar ↗". Replace the `{alts.map((a) => ( … ))}` body with:

```astro
              {alts.map((a) => (
                <div style="display: flex; align-items: center; gap: 10px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px;">
                  <a href={`/herramienta/${a.slug}`} class="lift" style="display: flex; align-items: center; gap: 12px; text-decoration: none; flex: 1; min-width: 0;">
                    <span style={`width: 34px; height: 34px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 15px; color: #fff; background: ${a.color};`}>{a.name.charAt(0)}</span>
                    <span style="flex: 1; min-width: 0;">
                      <span style="display: block; font-family: var(--sans); font-weight: 600; font-size: 14px; color: #fff;">{a.name}</span>
                      <span style="display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5); margin-top: 2px;"><span style="color: var(--accent);">★</span> {a.rating} · {a.cat}</span>
                    </span>
                  </a>
                  <AffiliateCTA slug={a.slug} src="ficha-compare" variant="inline" label="Visitar ↗" hasAffiliate={Boolean(a.affiliateUrl)} />
                </div>
              ))}
```

- [ ] **Step 6: Add a bottom CTA + a mobile sticky CTA (CSS-only)**

Immediately before the closing `</main>` tag (line ~160), insert a repeated bottom CTA and the mobile sticky bar:

```astro
    <div style="margin-top: 44px; border-top: 1px solid var(--line); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
      <p style="margin: 0; font-size: 15px; color: var(--fg-3);">¿Listo para probar <strong style="color: #fff;">{tool.name}</strong>?</p>
      <AffiliateCTA slug={tool.slug} src="ficha-bottom" hasAffiliate={hasAffiliate} />
    </div>

    {/* Barra fija móvil (CSS-only, sin JS): visible <768px. */}
    <div class="ficha-sticky-cta" style="position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: var(--bg-2); border-top: 1px solid var(--line-2); padding: 10px 16px; box-shadow: 0 -6px 24px rgba(0,0,0,0.35);">
      <AffiliateCTA slug={tool.slug} src="ficha-sticky" variant="sticky" hasAffiliate={hasAffiliate} label={`Visitar ${tool.name} →`} />
    </div>
```

Then add the responsive rule. The ficha has no `<style>` block yet — add one right after the closing `</BaseLayout>` (after line ~163) and before the `<script>`:

```astro
<style>
  .ficha-sticky-cta { display: none; }
  @media (max-width: 767px) {
    .ficha-sticky-cta { display: block; }
    main { padding-bottom: 96px !important; }
  }
</style>
```

- [ ] **Step 7: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; the ficha renders with badges, verdict/pros/cons (only where data exists), a hero + bottom + sticky + per-alt tracked CTA.

- [ ] **Step 8: Manually sanity-check one ficha (optional but recommended)**

Run: `npm run dev`, open `http://localhost:4321/herramienta/<any-slug>`, confirm: hero "Visitar sitio →" links to `/ir/<slug>?src=ficha-hero`, the sticky bar shows on a narrow viewport, and (if the tool has no pros/cons/verdict) the layout degrades cleanly. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add "src/pages/herramienta/[slug].astro"
git commit -m "feat(cro): restructure ficha into high-converting page (badges, verdict, pros/cons, sticky + 4 tracked CTAs)"
```

---

# PHASE 4 — Feeders

## Task 13: `ToolCard` — badges + optional tracked secondary CTA

**Files:**
- Modify: `src/components/ToolCard.astro`

- [ ] **Step 1: Add imports + props**

In `src/components/ToolCard.astro` frontmatter (lines ~1-12), replace the import + Props + destructure block with:

```astro
---
import type { Tool } from '../data/tools';
import { PRICE_COLOR, badgesFor } from '../data/tools';
import Badge from './Badge.astro';
import AffiliateCTA from './AffiliateCTA.astro';

interface Props {
  tool: Tool;
  /** transition:name del monograma — desactivar en renders duplicados (estantes/destacada) */
  morph?: boolean;
  /** botón "Añadir a comparar" (solo donde exista la barra de comparación, ej. home) */
  compare?: boolean;
  /** placement para el CTA de salida (ej. "card-home"); habilita el botón "Visitar ↗" */
  surface?: string;
}
const { tool, morph = true, compare = false, surface } = Astro.props;
const initial = tool.name.charAt(0);
const priceColor = PRICE_COLOR[tool.price];
const badges = badgesFor(tool);
const search = `${tool.name} ${tool.desc} ${tool.cat}`.toLowerCase();
const monoStyle = `width: 42px; height: 42px; border-radius: 9px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 19px; color: #fff; background: ${tool.color};`;
---
```

- [ ] **Step 2: Replace the inline `destacado` badge with the `<Badge>` row**

In the card body, replace the name+badge block (lines ~47-52) with:

```astro
      <div style="display: flex; align-items: center; gap: 7px; flex-wrap: wrap;">
        <span style="font-family: var(--sans); font-weight: 600; font-size: 16px; color: #fff;">{tool.name}</span>
        {badges.map((b) => <Badge badge={b} />)}
      </div>
```

- [ ] **Step 3: Add the optional tracked secondary CTA in the footer**

Replace the footer block (lines ~81-84) with:

```astro
  <div class="tc-foot" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto;">
    <span style="font-family: var(--mono); font-size: 12px; color: var(--fg-2);"><span style="color: var(--gold);">★</span> {tool.rating}</span>
    <div style="display: flex; align-items: center; gap: 8px;">
      {surface && (
        <span style="position: relative; z-index: 2;">
          <AffiliateCTA slug={tool.slug} src={surface} variant="inline" label="Visitar ↗" hasAffiliate={Boolean(tool.affiliateUrl)} />
        </span>
      )}
      <span style={`font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${priceColor}; border: 1px solid var(--line-2); padding: 4px 9px; border-radius: 20px;`}>{tool.price}</span>
    </div>
  </div>
```

> `z-index: 2` on the CTA wrapper keeps it clickable above the full-card overlay `<a>` (which sits at `z-index: 1`).

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds. Cards without a `surface` prop are unchanged except badges now come from `badgesFor` (still renders "★ Editor" for `destacado`).

- [ ] **Step 5: Commit**

```bash
git add src/components/ToolCard.astro
git commit -m "feat(cro): ToolCard badges (badgesFor) + optional tracked 'Visitar' CTA via surface prop"
```

---

## Task 14: Content pages — tracked callouts in "Herramientas mencionadas"

**Files:**
- Modify: `src/pages/estudios/[slug].astro`
- Modify: `src/pages/noticias/[slug].astro`

- [ ] **Step 1: Enhance the estudios block**

In `src/pages/estudios/[slug].astro`, add the import in the frontmatter (near the other component imports):

```ts
import ToolCallout from '../../components/ToolCallout.astro';
```

Replace the "Herramientas mencionadas" section body — the `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">…</div>` containing `{related.map(...)}` (the chips linking to `/herramienta/${t.slug}`) — with a stacked callout list:

```astro
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          {related.map((t) => (
            <ToolCallout tool={t} src="estudio-callout" />
          ))}
        </div>
```

- [ ] **Step 2: Enhance the noticias block**

In `src/pages/noticias/[slug].astro`, add the import in the frontmatter:

```ts
import ToolCallout from '../../components/ToolCallout.astro';
```

Replace the "Herramientas relacionadas" chips block (the `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">…{related.map(...)}…</div>`) with:

```astro
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          {related.map((t) => (
            <ToolCallout tool={t} src="noticia-callout" />
          ))}
        </div>
```

> Verified: in both files `related` is `d.herramientas.map(slug => allTools.find(...)).filter(Boolean)` where `allTools = (await getCollection('tools')).map(toTool)` — i.e. **full `Tool` objects** (with `slug`, `name`, `tagline`, `color`, `affiliateUrl`). `ToolCallout` consumes them directly; no mapping change needed.

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; estudios/noticias now show recommendation cards with a direct tracked `Visitar ↗` (`src=estudio-callout` / `noticia-callout`) plus the name linking to the ficha.

- [ ] **Step 4: Commit**

```bash
git add "src/pages/estudios/[slug].astro" "src/pages/noticias/[slug].astro"
git commit -m "feat(cro): tracked ToolCallouts in estudios/noticias (close the 2-hop gap)"
```

---

## Task 15: Home + directory — badges + tracked card CTAs

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/herramientas/index.astro`
- Modify: `src/pages/herramientas/[categoria].astro`

- [ ] **Step 1: Pass `surface` to the directory-grid `ToolCard`s**

The badges already appear automatically (Task 13). To enable the tracked secondary CTA on high-intent listing surfaces, add a `surface` prop to the `<ToolCard … />` usages.

In `src/pages/herramientas/index.astro`, find each `<ToolCard tool={…} … />` and add `surface="card-directory"`. Example:

```astro
<ToolCard tool={tool} surface="card-directory" />
```

- [ ] **Step 2: Category page**

In `src/pages/herramientas/[categoria].astro`, do the same on its `<ToolCard … />` usages: add `surface="card-category"`.

- [ ] **Step 3: Home**

In `src/pages/index.astro`, badges now render on every `<ToolCard>` automatically. For the main directory grid (the "Tienda" filtered grid), add `surface="card-home"` to those `<ToolCard … />` usages. Leave the duplicated "Escaparate" shelf cards (rendered with `morph={false}`) **without** `surface` to avoid a noisy wall of CTAs — badges alone there.

> If unsure which `<ToolCard>` is which, run `grep -n "ToolCard" src/pages/index.astro`. Add `surface="card-home"` only to the grid instance(s) inside the `#directorio` / "Tienda" view, not the shelf/featured duplicates.

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; directory + category cards show a tracked `Visitar ↗`, home grid cards show badges (+ CTA on the main grid).

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/herramientas/index.astro "src/pages/herramientas/[categoria].astro"
git commit -m "feat(cro): badges + tracked card CTAs across home and directory listings"
```

---

## Task 16: Full verification + CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all test files pass (`ir`, `track`, `tools`, `subscribe`, `consent`, `directory`, `home`).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: build succeeds, all pages generated, Pagefind postbuild runs.

- [ ] **Step 3: Add a CHANGELOG entry**

In `CHANGELOG.md`, add a new entry at the top of the changelog list (match the existing format/version scheme — the repo uses 4-part versions like `0.2.1.0`; bump the feature digit):

```markdown
## [0.3.0.0] — 2026-07-20

### Añadido (CRO — motor de clicks de afiliado)
- Instrumentación: helper GA4 `track()` (respeta consentimiento) + eventos `affiliate_click`, `view_ficha`, `newsletter_submit`; logging estructurado JSON de cada click en `/ir/` (src, referer, hasAffiliate).
- Toolkit de conversión: `AffiliateCTA` (CTA de salida tracked, 3 variantes), `Badge` + `badgesFor` (badges honestos por dato), `TrustSignals`, `ToolCallout`.
- Ficha rediseñada como página de conversión: veredicto editorial, pros/contras, señales de confianza, CTA fija móvil y 4 placements tracked (hero/sticky/compare/bottom).
- Feeders: badges + CTA "Visitar ↗" tracked en tarjetas del home/directorio; `ToolCallout`s en estudios y noticias.
- Esquema: campos opcionales `popular`, `verdict`, `pros`, `cons`, `addedAt`.

### Notas
- Sin nuevas dependencias ni cambios de CSP (dominios GA ya permitidos).
- Pendiente (fuera de alcance): poblar `affiliateUrl` por herramienta y fijar `PUBLIC_GA4_ID` en producción para que fluyan los eventos cliente.
```

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(cro): CHANGELOG entry for affiliate conversion engine (v0.3.0.0)"
```

- [ ] **Step 5: Push the branch**

```bash
git push -u origin feat/cro-affiliate-engine
```

---

## Post-implementation follow-ups (NOT in this plan)

- Populate `affiliateUrl` per tool (unblocks real revenue — every CTA already routes/logs correctly).
- Set `PUBLIC_GA4_ID` in production (Doppler) so client GA4 events flow.
- Optionally migrate the curso ficha CTA (`src/pages/curso/[slug].astro:92`) to `AffiliateCTA` with `src="curso-ficha"` for consistent tracking (server `/ir/` logging already covers curso clicks).
- Later: derive `popular` from real `/ir/` click logs instead of editor curation.

---

## Self-review notes (author)

- **Spec coverage:** Phase 1 (Tasks 1-5), Phase 2 (Tasks 7-11), Phase 3 (Task 12), Phase 4 (Tasks 13-15), Phase 5 (Task 6). Instrumentation ships before optimization. ✅
- **Honesty guard:** every badge maps to a real field (`badgesFor`); `TrustSignals` renders only present data; no fabricated urgency/counts. ✅
- **CSP:** all scripts first-party (`track.ts`), no inline handlers, no new external domains → `vercel.json` untouched. ✅
- **Type consistency:** `Badge`/`BadgeKind` defined in `tools.ts` (Task 7) and consumed by `Badge.astro` (Task 9), `ToolCard` (Task 13), ficha (Task 12); `affiliateHref`/`pickToolDest`/`sanitizeSrc`/`buildClickLog` defined in `ir.ts` (Task 1) and consumed in Tasks 2, 8. `src` placement strings match the taxonomy in the spec. ✅
- **`track()` deviation from spec wording** (dataLayer+`isGA4Loaded` vs `window.gtag`) is documented in "Reconciliations" and behaviorally equivalent. ✅
