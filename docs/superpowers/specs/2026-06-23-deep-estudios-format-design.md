# Deep-estudios format — design

**Date:** 2026-06-23
**Status:** Approved design (pending spec review)
**Pilot target:** `src/content/estudios/alternativas-a-chatgpt-en-espanol.md`

## Problem

AgentesVA `estudios` read as **thin content**. The example
`alternativas-a-chatgpt-en-espanol` is **266 words, 2 headings, 0 visuals**.
The current format supports only: markdown prose (`prose`), a "Herramientas
mencionadas" block (from `herramientas[]`), and a `faq` that exists **only as
JSON-LD** (not rendered on the page). There is no infographic, workflow,
summary, sources, or related-news capability. This hurts reader value, E-E-A-T,
and AI/Google citability (GEO/AEO).

## Goals

- Make estudios **deep, scannable, and citable**: more words, more analysis,
  more data, on-brand visuals.
- Add reusable **format capability** (schema + components) so depth is
  systematic and uniform, not per-post artistry.
- Encode the new bar in the **tom-4pass** skill so every future estudio meets it.
- Prove it end-to-end on **one pilot** estudio, then roll out.

## Non-goals (YAGNI)

- No raster/AI-generated images or OG images — visuals are HTML/CSS (the
  comparativa is the required visual).
- No MDX — estudios stay `.md`; structured blocks are frontmatter-driven.
- No manual related-noticias curation field yet — auto-match only.
- Rolling out to the other 7 estudios is **follow-up work** guided by the new
  standard, not part of this pilot.

## Decisions (agreed)

1. **Pilot first**, then roll out.
2. **HTML/CSS** on-brand components, not raster images.
3. **Frontmatter-driven** structured blocks rendered at consistent positions
   (not MDX inline).
4. **Related noticias auto-matched** by shared `tema` + overlapping
   `etiquetas`/`herramientas` — no schema field.

## Schema additions

`src/content.config.ts`, `estudios` collection — all **optional**,
backward-compatible (existing estudios keep building):

```ts
resumen: z.array(z.string()).optional(),            // TL;DR / puntos clave
porQueImporta: z.string().optional(),               // context note
comparativa: z.object({
  criterios: z.array(z.string()),                   // column headers
  filas: z.array(z.object({
    herramienta: z.string(),                        // tool slug (icon/name/color from tools)
    celdas: z.array(z.string()),                    // values aligned to criterios
    score: z.number().min(0).max(100).optional(),   // visual score bar
  })),
}).optional(),
workflow: z.object({
  titulo: z.string().optional(),
  pasos: z.array(z.object({ titulo: z.string(), detalle: z.string() })),
}).optional(),
fuentes: z.array(z.object({
  titulo: z.string(),
  url: z.string().url(),
  editor: z.string().optional(),
  fecha: z.string().optional(),
})).optional(),
iaPrompt: z.string().optional(),                    // optional override for "Resumir en IA"
```

(`faq` already exists; it becomes visibly rendered.)

## New components (`src/components/`, "Futurista" design system)

- `EstudioResumen.astro` — TL;DR box from `resumen[]`.
- `EstudioResumirIA.astro` — "Resume este estudio con tu IA" button row (see below).
- `EstudioNota.astro` — "Por qué importa" callout from `porQueImporta`.
- `EstudioComparativa.astro` — the **infographic**: comparison matrix. Pulls
  tool icon/name/color from the `tools` collection by slug; cells aligned to
  `criterios`; optional 0–100 `score` rendered as a bar. Responsive (stacks on
  mobile).
- `EstudioWorkflow.astro` — numbered step cards from `workflow.pasos`.
- `EstudioFaq.astro` — renders `faq` visibly (today JSON-LD only).
- `EstudioFuentes.astro` — cited sources list from `fuentes[]`.

Each component renders nothing when its data is absent (graceful for existing
estudios).

## "Resumir en IA" feature

A button row letting the reader open the post in their preferred assistant,
pre-filled with a summarize prompt for the canonical URL. Drives GEO and is
on-brand for an AI directory.

- Buttons: **ChatGPT, Claude, Perplexity, Gemini**.
- Default prompt (overridable via `iaPrompt`):
  `Resume este artículo y dime lo más importante: <canonical URL>`
- Deep-link patterns (exact params **verified at build**, they drift):
  - ChatGPT — `https://chatgpt.com/?q=<encoded>`
  - Claude — `https://claude.ai/new?q=<encoded>`
  - Perplexity — `https://www.perplexity.ai/search?q=<encoded>`
  - Gemini — best-effort deep-link; if no reliable URL prefill exists, **fall
    back** to copy-prompt-to-clipboard + open `gemini.google.com/app` so the
    user pastes. The fallback path must be obvious (e.g. button copies + opens).
- No schema field required (prompt built from canonical URL + `título`).
- Links open in a new tab; URLs are `encodeURIComponent`-escaped.

## Template changes — `src/pages/estudios/[slug].astro`

New page order (top → bottom):

1. breadcrumb → tema → H1 → `descripcion` (hook)
2. **Resumen** (`EstudioResumen`)
3. **Resumir en IA** (`EstudioResumirIA`) — utility bar high on page
4. **Por qué importa** (`EstudioNota`)
5. **Comparativa** infographic (`EstudioComparativa`)
6. `<Content/>` — deep prose + veredicto
7. **Workflow** (`EstudioWorkflow`)
8. **FAQ** (`EstudioFaq`)
9. **Fuentes** (`EstudioFuentes`)
10. Herramientas mencionadas (existing)
11. **Noticias relacionadas** — auto-matched

**Related-noticias auto-match:** in `getStaticPaths`/page load, load `noticias`
collection; select those sharing `tema` OR with overlapping `etiquetas`/
`herramientas`; rank by overlap; cap (e.g. top 3). Render like "Herramientas
mencionadas". Renders nothing if no match.

**JSON-LD:** Article gains `citation` (array built from `fuentes`) and keeps the
existing FAQPage + BreadcrumbList. Strengthens "recommended/cited source"
signals.

## tom-4pass standard update

Add an **"Estudio depth standard"** to `.claude/skills/tom-4pass/SKILL.md`
(estudio path), required at GATE 3 for estudios:

- ~1,200–1,800 words (from ~266).
- Mandatory blocks: `resumen`, `porQueImporta`, `comparativa`, per-tool prose
  analysis (qué hace bien / límites / precio+fuente+fecha / español / mejor-para),
  `workflow`, rendered `faq`, **≥2 authoritative cited `fuentes`**, veredicto.
- ≥1 visual (the comparativa satisfies it).
- Related noticias auto-surface (no action needed, but the topic should have a
  plausible match).
- Tier-B data inline with source + fecha (already a rule).

## Pilot deliverable

Rewrite `alternativas-a-chatgpt-en-espanol` to the standard:

- Expand prose to ~1,200–1,800 words: per-alternative deep analysis.
- `resumen[]` (4–6 key points), `porQueImporta`.
- `comparativa`: criterios = Precio / Español / Plan gratis / Mejor para; filas =
  Claude, Gemini, Perplexity, DeepSeek, Mistral (vs ChatGPT baseline), with scores.
- `workflow`: "Cómo elegir tu alternativa en 4 pasos".
- Expand `faq`; add `fuentes` (official pricing/announcement pages).
- Full tom-4pass Pass-4 fact-check: every price/claim verified with source + fecha.

## Verification

- `npm run build` → 0 errors (Astro 6); pilot estudio + all 7 existing estudios
  still build (backward-compat).
- Visual QA on the pilot page (Resumen, IA buttons, Comparativa, Workflow, FAQ,
  Fuentes, Noticias relacionadas all render; mobile stacks).
- IA deep-links resolve in each assistant (or Gemini fallback works).

## Rollout (follow-up, not this pilot)

Once the pilot ships and the standard is in tom-4pass, migrate the other 7
estudios one at a time through tom-4pass, each as its own change.
