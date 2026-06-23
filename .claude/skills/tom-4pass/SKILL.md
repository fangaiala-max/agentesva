---
name: tom-4pass
description: >
  Use when writing, drafting, or planning AgentesVA content (Spanish) — an
  estudio (comparativa/análisis) or a noticia (actualidad de IA curada) under
  src/content/estudios/ or src/content/noticias/. Runs the 4-pass research and
  verification system (Order → Brief → Writing → Fact-check) adapted from
  SEOwind's Tom Winter. Enforces AgentesVA's Tier A/B/C/D fact-checking protocol,
  humano/editorial tone (no AI-hype slop), the directorio/medio de IA positioning
  (cross-link tool fichas → salida afiliado), and the estudios/noticias content
  schema. Invoke for "write a post", "draft an estudio/comparativa", "draft a
  noticia", "turn this topic into content", or when executing the content calendar.
---

# AgentesVA 4-Pass Content System

> Adapted from **Tom Winter (SEOwind), Croatia SEO Summit 2026.**
> Core law: **Bad process × AI = faster bad results.** A broken process is not
> fixed by AI — AI just scales its mistakes. Run all four passes, in order, and
> honor the **gate** at each boundary. With AI systems *your worst output is your
> average output, not your floor* — so the floor is the whole game.

This is a **rigid process skill.** Do not skip passes or merge them. Create one
todo per pass and per checklist item. Stop at each GATE for sign-off before
proceeding — exactly like Tom's "lock the angle before a word is written."

## What AgentesVA is now (read first)

AgentesVA is a **directorio + medio de IA en español** for PyMEs hispanohablantes
(España + LATAM): a directory of AI tools (`src/content/tools/`, fichas at
`/herramienta/<slug>`) plus original editorial content. The funnel is **discovery →
tool ficha → salida afiliado**, not consulting CTAs. There is **no `blog` collection
and no `pillar` enum** — that was the pre-greenfield consulting site. You write one
of two formats:

- **estudio** — original comparativa/análisis in GEO answer-format (`src/content/estudios/*.md`).
- **noticia** — curated AI actuality, re-summarized in original Spanish **with mandatory source attribution** (`src/content/noticias/*.md`).

The AI Gateway pipeline (`npm run ai:estudios`, `npm run ai:faqs`) can pre-generate
drafts — but pipeline output is a **Pass-3 draft at best**: it still must clear
Pass 4 before publish. The skill is the human-verified path.

## Non-negotiables (every pass, no exceptions)

- **0% hallucination — Tier-classified sourcing.** Every factual claim is
  classified A/B/C/D per `docs/blog-fact-checking-protocol.md` *before* publish.
  Tier A (legal/regulatorio: certificaciones, Red.es, GDPR, cumplimiento) needs
  official mostrable documentation + explicit written user confirmation — NEVER
  "creo que sí". Tier B (números, fechas, precios, planes de herramientas) needs a
  specific official-source URL + fecha + inline attribution. No claim ships
  unverified; flag any gap `[SIN VERIFICAR — falta fuente]` and never ship it that way.
- **Noticias carry a primary `fuente`.** Schema-enforced: every noticia attributes
  a primary source `{ nombre, url }`. Re-summarize in original Spanish — never copy.
  Close with an explicit "Fuente: …" line, as existing noticias do.
- **Tono humano / editorial.** Direct, professional, plain Spanish — the antithesis
  of "AI hype slop". No hedging, no purple prose, no superlatives without a source
  ("el mejor", "el más usado"). Match the existing voice (read 2–3 recent posts in
  `src/content/estudios/` and `src/content/noticias/` first).
- **Directory funnel lens.** Every piece should pull the reader toward tool fichas.
  Reference tools as markdown links `/herramienta/<slug>` in the body **and** list
  their slugs in `herramientas[]` (this powers the cross-link + salida afiliado).
  Every slug MUST be a real file in `src/content/tools/` — invented slugs break the build.
- **Spanish-only, native.** Idiomatic Spanish, not translated. No EN twin. Watch
  ES/LATAM register where the audience spans both markets.
- **Validation gate before publish.** `npm run build` (0 errors) from the **repo root**.
- **Estudio depth standard (estudios only).** An estudio is a deep, citable
  asset, not a blurb. Required before publish (GATE 3):
  - **~1,200–1,800 words** of original prose (per-tool analysis: qué hace bien /
    límites / precio+fuente+fecha / español / mejor-para).
  - **`resumen`** (4–6 puntos clave / TL;DR) and **`porQueImporta`** (por qué importa).
  - **`comparativa`** (criterios + filas con herramienta/celdas/score) — la infografía.
  - **`workflow`** (pasos para elegir/empezar).
  - **`faq`** (ahora visible) y **veredicto** en la prosa.
  - **`fuentes`** — ≥2 fuentes oficiales/primarias citadas (alimentan el bloque
    Fuentes + el `citation` del Article JSON-LD).
  - Las **noticias relacionadas** se autogeneran por `tema`/`etiquetas`/`herramientas`;
    elige `tema`/`etiquetas` que conecten con noticias reales del sitio.
  - **`bonus` ("One more thing").** Cierra con un bloque bonus de alternativas
    **emergentes / menos obvias** (no las más mencionadas): 2–3 cross-linkeadas a
    fichas del directorio + el resto nombradas en `nota` con enlace oficial.

---

## Pass #1 — Order Level
**Rule: Nothing enters the pipeline unvalidated.**

Validate the assignment before any research. No external tools — this is scoping.

- [ ] **Format** — is this an **estudio** (original comparativa/análisis) or a **noticia** (curated actuality with a primary source)? Pick one; they have different schemas.
- [ ] **AI-query target** — the actual question a PyME owner asks ChatGPT / Perplexity / Google AI Mode that this post should win (NOT just a Google keyword). Write it verbatim.
- [ ] **Reader + tema + market** — who, which `tema` (free string, e.g. "Asistentes", "Código", "Atención al cliente"), and España vs LATAM?
- [ ] **Tools to feature** — which directory tools does this cross-link? List candidate `herramientas[]` slugs; confirm each exists in `src/content/tools/`.
- [ ] **Single sharp claim / angle** — the one non-obvious argument in ≤ 20 words. If you can't write it, the post isn't ready.
- [ ] **Tier-A risk flag** — does the angle touch certifications, subvenciones, legal/regulatorio claims? Flag now; those need user confirmation before publish.
- [ ] **Cannibalization check** — does an existing `estudios/` or `noticias/` post already cover this? Differentiate or merge.

**GATE 1 →** Produce a 5-line validated brief (format, AI-query target, reader/tema/market, tools to feature, sharp claim, Tier-A flag). Confirm before Pass #2.

---

## Pass #2 — Brief Level
**Rule: Lock the angle before a word is written.**

Real research. Use the tools — don't write from memory.

- [ ] **SERP + keyword reality** — `Semrush MCP` (keyword_research / organic_research) for volume, difficulty, related terms, who currently ranks (database "es").
- [ ] **What AI engines say now** — query the actual target question and capture the current AI consensus answer + which sources it cites. Write the *gap*, not the consensus.
- [ ] **Real questions** — `Reddit-insights MCP` + WebSearch (People Also Ask) for the language real PyME owners use. Feed the strongest into `faq` (estudios).
- [ ] **Primary source (noticias)** — identify and capture the official `fuente` `{ nombre, url }` you will attribute. For estudios, gather official tool pages (pricing/features) as Tier-B sources.
- [ ] **Tool-slug check** — every slug you plan to put in `herramientas[]` resolves to a real `src/content/tools/<slug>.json`. Fix or drop unknowns now.
- [ ] **Locked outline** — H2/H3 structure, the sharp claim's placement, where tool fichas link out, where the comparison table / `faq` go.
- [ ] **Source shortlist + tier** — candidate sources per claim, each pre-classified A/B/C/D, gathered now (WebSearch / WebFetch — official tool pages, and for any Kit Digital / legal claim, acelerapyme.gob.es, BOE, Red.es), so Pass #4 verifies rather than scrambles.

**GATE 2 →** Present the locked brief + outline + tool slugs + tier-classified source shortlist (incl. the noticia `fuente`). No drafting until approved. (This is Tom's hard gate.)

---

## Pass #3 — Writing Level
**Rule: Research doesn't stop when writing starts.**

- [ ] Draft in tono humano/editorial against the locked outline. Every claim sourced inline as you write, with its tier in mind.
- [ ] **Cross-link tool fichas** — reference each featured tool as `[Nombre](/herramienta/<slug>)` in the body, mirroring the slugs in `herramientas[]`. This is the funnel.
- [ ] **Fill gaps mid-write** — if a section needs a fact you don't have (a price, a plan, a capability), stop and research it (WebSearch / official page). Do not paper over with generic filler.
- [ ] Mark any still-missing fact `[SIN VERIFICAR — falta fuente]`. Every claim grounded, every gap closed or flagged.
- [ ] **Write the schema blocks** for the chosen format (see *Output & publish* for fields): a strong `descripcion`, `etiquetas`, `herramientas`, and for estudios a `faq` (self-contained answers an LLM can quote verbatim → FAQPage JSON-LD). For noticias, the `fuente` object is required.
- [ ] **Data density.** Lead with specific numbers + unit + attributable source — LLMs and AI Overviews quote numbers. Tier-B figures (precios, planes, plazos, %) MUST carry an inline official-source citation + fecha.
- [ ] **External authority** — estudios need ≥2 external authoritative citations (official/primary > vendor). Noticias need at minimum the primary `fuente`, plus the official page of each tool mentioned.

**GATE 3 — must pass ALL:** Draft complete · all schema blocks present for the format (`titulo`, `descripcion`, `fecha`, `tema`, `etiquetas`, `herramientas`; `faq` for estudios; `fuente` for noticias) · Tier-B numbers carry inline source + fecha · external-authority bar met · every claim sourced or flagged. Fail any one → the draft is not done.

---

## Pass #4 — Fact Check + Downstream Impact
**Rule: Fix one thing, check everything. Nothing publishes unverified.**

- [ ] **Identify every checkable claim** (stat, %, name, date, price, plan, capability) and assign its tier.
- [ ] **Verify each** against a reliable source (WebSearch → WebFetch the source). Tier A → official mostrable doc + **explicit user written confirmation**. Tier B → official URL + fecha, inline. Attach the URL or cut the claim.
- [ ] **Verify the `fuente` URL resolves** (noticias) and that every `herramientas[]` slug exists in `src/content/tools/`.
- [ ] If a Tier-B dato (price/plan/capability) is older than ~6–12 months, warn the reader inline and consider setting `actualizado` (estudios) — tool pricing changes fast.
- [ ] **Downstream impact** — when a claim changes, scan the whole post for any contradiction the change creates (e.g. a price update that breaks the "más barato" verdict). A one-pass human editor misses this; the system must not.
- [ ] Re-read for tono humano, no AI-hype slop, no unsourced superlatives.

**GATE 4 →** Zero `[SIN VERIFICAR]` left. Every claim has a source at its required tier. Tier-A claims confirmed by the user in writing. `fuente`/tool slugs resolve. No contradictions.

---

## Output & publish

- **Location:** `src/content/estudios/<slug>.md` **or** `src/content/noticias/<slug>.md` (slug = filename = URL).
- **Frontmatter:** follow `src/content.config.ts` exactly. The build fails on schema violations.
  - **estudio:** required `titulo`, `descripcion`, `fecha` (date), `tema`; optional `actualizado` (date), `etiquetas` (array), `herramientas` (array of tool slugs), `destacado` (bool), `faq` (array of `{ q, a }`).
  - **noticia:** required `titulo`, `descripcion`, `fecha` (date), `tema`, `fuente` (`{ nombre, url }`); optional `etiquetas` (array), `herramientas` (array of tool slugs).
- **No `draft` field exists** in either schema — do **not** add one. Keep work in the worklog and **do not commit until the user approves.**
- **Validation gate:** `npm run build` (0 errors) from the **repo root**.
- **Commit** only when asked; include the build summary in the message.

## Per-post worklog

Keep a short trail so the process is auditable (Tom: *"AI errors are logged"*).
Record, per post: the GATE-1 brief, GATE-2 outline + tool slugs + tier-classified
source shortlist, and the GATE-4 claim→source→tier table. A scratch file under
`docs/content/worklogs/<slug>.md` is fine (not shipped).
