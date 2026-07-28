# CRO — Affiliate Conversion Engine

**Date:** 2026-07-20
**Status:** Approved (design) — ready for implementation plan
**Branch:** `feat/cro-affiliate-engine`

## Summary

Turn AgentesVA from a passive AI-tool directory into a conversion-optimized
**affiliate-click engine**, without dark patterns. The single business metric is
**qualified outbound "Visitar sitio" clicks** to tools (and, once `affiliateUrl`s
are populated, commissions on them).

The build has five phases, sequenced so that **instrumentation ships first** —
nothing built afterward is unmeasured. All work reuses the existing "Futurista"
design system and stays inside the strict CSP (`script-src 'self'`, first-party
scripts only, no inline handlers).

## Decisions locked during brainstorming

| Decision | Choice | Consequence |
|---|---|---|
| Primary money goal | **Affiliate clicks** | Every tactic optimizes outbound `/ir/` clicks; email capture is secondary. |
| Affiliate-link status | **Out of scope — build machinery only** | We build + track the UI; `affiliateUrl` population is the user's job. `/ir/` already falls back to plain `url`, so CTAs work and track immediately and earn the moment a link is added. |
| CRO style | **Honest high-conversion** | Real ratings/counts/deals only. No fabricated urgency, no fake "X viewing now." Fits the "Confianza" brand + EU consumer/DSA law. |
| Tracking | **GA4 (already wired) + server-side `/ir/` logging** | Zero new deps, no CSP change. Accept that GA4 client events are consent-gated (~30–60% loss until accept); server-side `/ir/` log is the 100%-capture source of truth. |
| Content-page email capture | **Deliberately excluded** | Content CTAs point to tools, not the newsletter, to keep focus on the affiliate metric. |

## Non-goals

- Populating `affiliateUrl` for the 54 tools (business task, out of scope).
- Adding a new analytics vendor (no Plausible/PostHog/Vercel Analytics — GA4 only).
- Fake/urgency dark patterns (countdowns, invented viewer counts, spin-to-win).
- Reworking the email/newsletter funnel or digital-product store.
- Contact forms, call booking, or any consulting-funnel resurrection.

## Context (verified from code, 2026-07-20)

- Astro static site on Vercel, **no DB**. Only on-demand routes:
  [`ir/[slug].ts`](../../../src/pages/ir/[slug].ts), `descarga.astro`, and the one
  function `api/subscribe.js`.
- Primary affiliate path today:
  `content → /herramienta/{slug} ficha → "Visitar sitio" → /ir/{slug} → 302`.
  Link already carries `rel="sponsored nofollow noopener"` and `console.log`s.
- **0 of 54 tools have `affiliateUrl`** → every `/ir/` 302s to the raw official URL
  (earns nothing today; harmless — CTAs still work).
- **No analytics in production**: `PUBLIC_GA4_ID` empty in `.env.example`; GA4 is
  consent-gated via [`ConsentBanner.astro`](../../../src/components/ConsentBanner.astro)
  + [`consent.ts`](../../../src/scripts/consent.ts). CSP (`vercel.json`) already allows
  `googletagmanager.com` + `google-analytics.com`.
- Content pages (`estudios`, `noticias`) have **no inline affiliate CTA** — a reader
  is 2 hops from any conversion.
- Reusable design system in [`global.css`](../../../src/styles/global.css): accent
  `#5B7CFF` (primary CTA on dark), gold `--gold` (editor's choice), green `--green`
  (free/positive), panels navy. Fonts: DM Serif Display / DM Sans / JetBrains Mono.
  Motion is CSS-only + `prefers-reduced-motion`-guarded.

## Architecture — the phases

### Phase 1 — Instrumentation *(ships first)*

**Goal:** measure affiliate CTR + conversions before optimizing anything.

**1a. Server-side click log** — enhance [`ir/[slug].ts`](../../../src/pages/ir/[slug].ts).
On every resolve, emit one structured `console.log(JSON.stringify({...}))`:

```
{ evt: 'ir_click', ts, slug, type: 'tool'|'curso'|'recurso',
  hasAffiliate: boolean,   // whether affiliateUrl existed (revenue-ready vs fallback)
  src: string|null,        // placement param from ?src=  (e.g. 'ficha-sticky')
  referer: string|null }
```

- Reads a new optional `src` query param; unknown/missing → `null`. Never blocks or
  changes the 302 destination. This is the **100%-capture, consent-free source of
  truth** in Vercel function logs.

**1b. GA4 event helper** — new `src/scripts/track.ts`:

- Exports `track(event: string, params?: Record<string, unknown>): void`.
- Calls `window.gtag('event', event, params)` **only if** `typeof window.gtag ===
  'function'` (i.e. consent granted + `PUBLIC_GA4_ID` set); otherwise silent no-op.
- First-party module (CSP-safe). No effect until GA4 is configured — safe to ship
  even with `PUBLIC_GA4_ID` empty.

**1c. Delegated event wiring** — a small first-party script binds one delegated
`click` listener (CSP-safe, no inline handlers) to elements carrying
`data-track-event`. It reads `data-track-*` attributes into params and calls
`track()`, then lets navigation proceed. Events emitted:

| Event | Fired from | Key params |
|---|---|---|
| `affiliate_click` | any `AffiliateCTA` | `slug`, `src`, `has_affiliate` |
| `view_ficha` | ficha page load | `slug`, `category` |
| `newsletter_submit` | existing [`subscribe.ts`](../../../src/scripts/subscribe.ts) success | `list`, `src` |
| `compare_add` / `compare_view` | comparador | `slug` (add) / count (view) |
| `search` | search modal / `buscar` | `query_len` |

**`src` taxonomy** (stable strings so reports stay comparable): `ficha-hero`,
`ficha-sticky`, `ficha-compare`, `ficha-bottom`, `card-home`, `card-directory`,
`card-category`, `estudio-callout`, `noticia-callout`, `home-featured`,
`compare-modal`.

### Phase 2 — Conversion toolkit *(build once, reuse everywhere)*

New components under `src/components/`, all token-based + reduced-motion-guarded:

- **`AffiliateCTA.astro`** — the single source of truth for outbound tool clicks.
  Props: `slug`, `src`, `variant: 'primary'|'inline'|'sticky'`, `label?`. Renders an
  anchor to `/ir/{slug}?src={src}` with `rel="sponsored nofollow noopener"`,
  `target="_blank"`, and the `data-track-event="affiliate_click"` +
  `data-slug`/`data-src`/`data-has-affiliate` attributes for Phase 1c. Every outbound
  tool link in the codebase migrates to this component.
- **`Badge.astro`** + a pure `badgesFor(tool)` helper (in `src/data/tools.ts`) —
  honest, data-driven badges, **each mapping to a real field**:
  - `Elección del editor` (gold) ← `editorPick === true`
  - `Plan gratis` (green) ← `freeTier === true` (or derived from pricing)
  - `Popular` (accent) ← `popular === true` (editor-curated now; can become
    click-log-driven later)
  - `Nuevo` (subtle) ← `addedAt` within last 30 days
  No badge renders without its backing field. `badgesFor` is unit-tested.
- **`TrustSignals.astro`** — aggregate honest signals: editorial rating (labeled
  *valoración editorial* to avoid implying user reviews), pricing model, "N
  alternativas comparadas", "en el directorio desde {addedAt}". Each signal renders
  only when its data exists.
- **`ToolCallout.astro`** — compact in-content recommendation card (logo + one-line
  pitch + inline `AffiliateCTA`) for estudios/noticias. Closes the "content doesn't
  convert" gap.
- **Context-aware sticky bar** — extend the existing `#cta-bar` (dismiss +
  session-remembered logic reused). On a ficha it shows that tool's sticky
  `AffiliateCTA`; elsewhere it keeps the current email-Pack behavior. Driven by a prop
  from the page, not new global state.

### Phase 3 — Ficha as the money page — [`herramienta/[slug].astro`](../../../src/pages/herramienta/[slug].astro)

Restructure into an honest "recommendation/review" page:

- **Above the fold:** logo, name, category, `TrustSignals`, pricing badge, primary
  `AffiliateCTA` (`src=ficha-hero`), secondary Comparar/Guardar, and a one-line
  **editor verdict** (`verdict` field) — "por qué lo recomendamos".
- **Mobile sticky CTA:** on scroll, the sticky bar shows `AffiliateCTA`
  (`src=ficha-sticky`). Mobile-first (most conversions are mobile).
- **Body:** qué es / para quién, **Pros / Contras** (`pros[]` / `cons[]`), key
  features, pricing detail, **"Cómo se compara"** table vs 2–3 alternatives (each alt
  name → its ficha; each row a mini `AffiliateCTA` `src=ficha-compare`), FAQ (exists,
  keep FAQPage schema), and a **repeated end CTA** (`src=ficha-bottom`).
- Four distinct `src` placements → reporting reveals which placement earns.
- `view_ficha` fires on load.
- Every new block renders only when its data exists (progressive — an unpopulated
  ficha degrades to today's layout, never breaks).

### Phase 4 — Feeders — cards, content, home

- **[`ToolCard.astro`](../../../src/components/ToolCard.astro):** add a `Badge` row,
  a clearer primary path "Ver ficha →", and an optional secondary micro-CTA
  "Visitar ↗" (`AffiliateCTA` inline, `src=card-{surface}`) for high-intent users.
  Bookmark + compare buttons preserved. `surface` passed as a prop.
- **Content** ([`estudios/[slug]`](../../../src/pages/estudios/[slug].astro),
  [`noticias/[slug]`](../../../src/pages/noticias/[slug].astro)): support inline
  `ToolCallout`s and an end-of-article "Herramientas mencionadas" block (tracked
  CTAs, `src=estudio-callout` / `noticia-callout`). Which tools appear is authored in
  content frontmatter (a `herramientas: [slug]` list), not hardcoded.
- **Home** ([`index.astro`](../../../src/pages/index.astro)): badges on cards, tracked
  featured CTA (`src=home-featured`), tracked comparador "visitar" actions
  (`src=compare-modal`).

### Phase 5 — Data model — [`content.config.ts`](../../../src/content.config.ts)

Extend the tools Zod schema with **all-optional** fields (no build break; existing
54 JSONs stay valid; components render only when a field is present):

| Field | Type | Purpose |
|---|---|---|
| `editorPick` | `boolean?` | Gold "Elección del editor" badge |
| `popular` | `boolean?` | "Popular" badge (editor-curated) |
| `rating` | `number?` (0–5) | *Valoración editorial* in `TrustSignals` |
| `pros` | `string[]?` | Ficha Pros list |
| `cons` | `string[]?` | Ficha Contras list |
| `verdict` | `string?` | One-line editor recommendation |
| `freeTier` | `boolean?` | "Plan gratis" badge (or derived from pricing) |
| `addedAt` | `date?` | "Nuevo" badge (< 30 days) + "en el directorio desde" |

`affiliateUrl` already exists in the schema — left untouched for the user to fill.
Fields are populated incrementally; nothing requires all 54 tools at once.

## Data flow

```
Visitor
  │  lands on home / directory / estudio / noticia
  ▼
ToolCard (badges, "Ver ficha", optional "Visitar ↗")  ── Visitar ↗ ─┐
  │  "Ver ficha"                                                     │
  ▼                                                                  │
Ficha (verdict, trust, pros/cons, compare, 4× AffiliateCTA)          │
  │  Visitar sitio (any placement)                                   │
  ▼                                                                  ▼
/ir/{slug}?src=…  ──► server log (100%)  ──► 302 to affiliateUrl||url
  │
  └──► GA4 affiliate_click event (if consent)
```

Content pages inject `ToolCallout` → same `AffiliateCTA` → same `/ir/` path.

## Error handling & edge cases

- **`/ir/` unknown slug:** unchanged current behavior (existing 404/redirect logic
  preserved); logging must not throw on missing/malformed `src`.
- **GA4 absent (no consent / no ID):** `track()` no-ops; navigation and server logging
  are unaffected. Zero user-visible difference.
- **Unpopulated tool fields:** every new component renders conditionally; an empty
  ficha degrades gracefully to the current layout.
- **CSP:** no inline handlers; all scripts first-party under `'self'`; no new external
  domains → `vercel.json` CSP unchanged.
- **`prefers-reduced-motion`:** all new motion guarded, per DESIGN.md.
- **Honesty guard:** a badge/rating/deal renders **only** from a real backing field;
  no component may synthesize social proof.

## Testing (Vitest + happy-dom; CLAUDE.md 100%-coverage goal)

- `track()`: no-ops when `window.gtag` undefined; calls `gtag('event', …)` with exact
  params when present.
- `/ir/[slug]`: builds the correct structured log payload incl. `hasAffiliate` and
  parsed/absent `src`; 302 destination unchanged; no throw on bad input.
- `badgesFor(tool)`: returns exactly the badges whose backing fields are set; empty
  for a bare tool; `Nuevo` respects the 30-day window (inject a fixed "now").
- `AffiliateCTA`: builds `/ir/{slug}?src={src}` with correct `rel`/`target` and
  `data-*` attributes.
- Schema: existing tool JSONs still validate; new optional fields accept valid values
  and reject malformed (`rating` out of 0–5, wrong types).

## Rollout order (each phase independently shippable)

1. **Phase 1** — instrumentation + `track.ts` + `/ir/` logging. Ship, verify events
   fire and logs appear.
2. **Phase 2** — toolkit components (+ migrate existing outbound links to
   `AffiliateCTA`).
3. **Phase 3** — ficha depth.
4. **Phase 5 (schema)** — lands with/just before Phase 3 so ficha fields exist; can be
   merged early since fields are optional.
5. **Phase 4** — feeders (cards, content, home).

## Open follow-ups (post-build, not in scope)

- Populate `affiliateUrl` per tool (unblocks actual revenue).
- Set `PUBLIC_GA4_ID` in prod so client events flow.
- Later: derive `popular` from real click logs instead of editor curation.
