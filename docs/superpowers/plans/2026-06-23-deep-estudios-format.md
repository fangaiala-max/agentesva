# Deep-estudios Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn AgentesVA `estudios` from thin content into a deep, scannable, citable format (resumen, AI-summarize buttons, por-qué-importa, comparison infographic, workflow, rendered FAQ, cited sources, related news), and pilot it on `alternativas-a-chatgpt-en-espanol`.

**Architecture:** New optional frontmatter fields on the `estudios` collection drive seven on-brand HTML/CSS Astro components rendered at fixed positions by `estudios/[slug].astro`. Related noticias are auto-matched by `tema`/`etiquetas`/`herramientas`. No MDX, no raster images. Depth is enforced via a new tom-4pass "estudio depth standard".

**Tech Stack:** Astro 6 content collections (Zod schema), Astro components with inline styles + "Futurista" CSS tokens (`--accent`, `--line`, `--panel`, `--fg-2..5`, `--serif/sans/mono`, `--bg-2`), Playwright for visual QA.

**Verification note:** This is a static content site with **no unit-test harness**. Per-task verification is `npm run build` (0 errors) plus grepping built HTML in `dist/`. Components must render **nothing** when their prop is absent, so existing estudios keep building.

---

## File Structure

- Modify: `src/content.config.ts` — add optional estudio fields.
- Create: `src/components/EstudioResumen.astro`
- Create: `src/components/EstudioResumirIA.astro`
- Create: `src/components/EstudioNota.astro`
- Create: `src/components/EstudioComparativa.astro`
- Create: `src/components/EstudioWorkflow.astro`
- Create: `src/components/EstudioFaq.astro`
- Create: `src/components/EstudioFuentes.astro`
- Modify: `src/pages/estudios/[slug].astro` — import + render components in order, add related-noticias auto-match, add JSON-LD `citation`.
- Modify: `.claude/skills/tom-4pass/SKILL.md` — estudio depth standard.
- Modify: `src/content/estudios/alternativas-a-chatgpt-en-espanol.md` — pilot rewrite.

---

## Task 1: Schema additions

**Files:**
- Modify: `src/content.config.ts` (estudios collection)

- [ ] **Step 1: Add optional fields to the estudios schema**

In `src/content.config.ts`, inside the `estudios` `z.object({ ... })`, after the existing `faq` line, add:

```ts
    resumen: z.array(z.string()).default([]),
    porQueImporta: z.string().optional(),
    comparativa: z
      .object({
        criterios: z.array(z.string()),
        filas: z.array(
          z.object({
            herramienta: z.string(),
            celdas: z.array(z.string()),
            score: z.number().min(0).max(100).optional(),
          }),
        ),
      })
      .optional(),
    workflow: z
      .object({
        titulo: z.string().optional(),
        pasos: z.array(z.object({ titulo: z.string(), detalle: z.string() })),
      })
      .optional(),
    fuentes: z
      .array(
        z.object({
          titulo: z.string(),
          url: z.string().url(),
          editor: z.string().optional(),
          fecha: z.string().optional(),
        }),
      )
      .default([]),
    iaPrompt: z.string().optional(),
```

- [ ] **Step 2: Verify existing estudios still build**

Run: `npm run build 2>&1 | tail -5`
Expected: `[build] Complete!`, 0 errors (all 8 existing estudios build unchanged — new fields are optional/defaulted).

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(estudios): add optional schema fields for deep format"
```

---

## Task 2: EstudioResumen component

**Files:**
- Create: `src/components/EstudioResumen.astro`

- [ ] **Step 1: Create the component**

```astro
---
// TL;DR / puntos clave de un estudio. Renderiza nada si no hay puntos.
interface Props { puntos?: string[]; }
const { puntos = [] } = Astro.props;
---
{puntos.length > 0 && (
  <aside aria-label="Resumen" style="margin-top: 32px; background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: 6px; padding: 22px 24px;">
    <p style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 12px;">En resumen</p>
    <ul style="margin: 0; padding-left: 18px; display: grid; gap: 8px;">
      {puntos.map((p) => (
        <li style="font-family: var(--sans); font-size: 15px; line-height: 1.55; color: var(--fg-2);">{p}</li>
      ))}
    </ul>
  </aside>
)}
```

- [ ] **Step 2: Verify it compiles (wired in Task 9; build now to catch syntax)**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!` (unused file is fine; this confirms no syntax error if imported later).

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioResumen.astro
git commit -m "feat(estudios): EstudioResumen (TL;DR) component"
```

---

## Task 3: EstudioResumirIA component (AI summarize buttons)

**Files:**
- Create: `src/components/EstudioResumirIA.astro`

> **Deep-link note:** params below are the current working forms; if any assistant changes its URL scheme, update here. Gemini has no reliable prefill param, so its button copies the prompt to the clipboard and opens Gemini for the user to paste.

- [ ] **Step 1: Create the component**

```astro
---
// Botonera "resume este estudio con tu IA". Deep-link con prompt + URL canónica.
interface Props { url: string; titulo: string; prompt?: string; }
const { url, prompt } = Astro.props;
const text = prompt ?? `Resume este artículo y dime lo más importante: ${url}`;
const q = encodeURIComponent(text);
const targets = [
  { name: 'ChatGPT', href: `https://chatgpt.com/?q=${q}` },
  { name: 'Claude', href: `https://claude.ai/new?q=${q}` },
  { name: 'Perplexity', href: `https://www.perplexity.ai/search?q=${q}` },
];
const pill = 'font-family: var(--sans); font-size: 13px; font-weight: 600; color: #fff; background: var(--panel); border: 1px solid var(--line-2); border-radius: 30px; padding: 7px 14px; text-decoration: none; cursor: pointer;';
---
<section aria-label="Resumir con IA" style="margin-top: 22px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
  <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5);">Resúmelo con tu IA</span>
  {targets.map((t) => (
    <a href={t.href} target="_blank" rel="noopener" class="lift" style={pill}>{t.name}</a>
  ))}
  <button type="button" data-ia-gemini data-prompt={text} class="lift" style={pill}>Gemini</button>
</section>
<script>
  document.addEventListener('astro:page-load', () => {
    document.querySelectorAll('[data-ia-gemini]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const p = btn.getAttribute('data-prompt') || '';
        try { await navigator.clipboard.writeText(p); } catch {}
        window.open('https://gemini.google.com/app', '_blank', 'noopener');
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioResumirIA.astro
git commit -m "feat(estudios): EstudioResumirIA (open-in-AI) buttons"
```

---

## Task 4: EstudioNota component (por qué importa)

**Files:**
- Create: `src/components/EstudioNota.astro`

- [ ] **Step 1: Create the component**

```astro
---
// Callout contextual ("por qué importa"). Renderiza nada sin texto.
interface Props { texto?: string; titulo?: string; }
const { texto, titulo = 'Por qué importa' } = Astro.props;
---
{texto && (
  <aside style="margin-top: 32px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 6px; padding: 20px 22px;">
    <p style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin: 0 0 8px;">{titulo}</p>
    <p style="font-family: var(--sans); font-size: 15.5px; line-height: 1.6; color: var(--fg-2); margin: 0;">{texto}</p>
  </aside>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioNota.astro
git commit -m "feat(estudios): EstudioNota (por qué importa) callout"
```

---

## Task 5: EstudioComparativa component (infographic)

**Files:**
- Create: `src/components/EstudioComparativa.astro`

- [ ] **Step 1: Create the component**

```astro
---
// Matriz comparativa = la infografía. Resuelve icono/nombre/color de cada
// herramienta desde la colección tools por slug.
import { getCollection } from 'astro:content';
import { toTool } from '../data/tools';

interface Fila { herramienta: string; celdas: string[]; score?: number; }
interface Props { criterios?: string[]; filas?: Fila[]; }
const { criterios = [], filas = [] } = Astro.props;

const tools = (await getCollection('tools')).map(toTool);
const rows = filas.map((f) => ({ ...f, tool: tools.find((t) => t.slug === f.herramienta) }));
const hasScore = rows.some((r) => typeof r.score === 'number');

const th = 'font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5); text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line-2); white-space: nowrap;';
const td = 'font-family: var(--sans); font-size: 14px; color: var(--fg-2); padding: 12px 14px; border-bottom: 1px solid var(--line); vertical-align: middle;';
---
{criterios.length > 0 && rows.length > 0 && (
  <section aria-label="Comparativa" style="margin-top: 40px;">
    <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 16px;">Comparativa</h2>
    <div style="overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--panel);">
      <table style="width: 100%; border-collapse: collapse; min-width: 520px;">
        <thead>
          <tr>
            <th style={th}>Herramienta</th>
            {criterios.map((c) => <th style={th}>{c}</th>)}
            {hasScore && <th style={th}>Valoración</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr>
              <td style={td}>
                <span style="display: inline-flex; align-items: center; gap: 9px;">
                  <span style={`width: 24px; height: 24px; border-radius: 6px; flex: none; display: inline-flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 12px; color: #fff; background: ${r.tool?.color ?? 'var(--line-3)'};`}>{(r.tool?.name ?? r.herramienta).charAt(0)}</span>
                  <span style="font-weight: 600; color: #fff;">{r.tool?.name ?? r.herramienta}</span>
                </span>
              </td>
              {r.celdas.map((c) => <td style={td}>{c}</td>)}
              {hasScore && (
                <td style={td}>
                  {typeof r.score === 'number' ? (
                    <span style="display: inline-flex; align-items: center; gap: 8px;">
                      <span style="width: 64px; height: 6px; border-radius: 3px; background: var(--line-2); overflow: hidden; display: inline-block;">
                        <span style={`display: block; height: 100%; width: ${r.score}%; background: var(--accent);`}></span>
                      </span>
                      <span style="font-family: var(--mono); font-size: 12px; color: var(--fg-3);">{r.score}</span>
                    </span>
                  ) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioComparativa.astro
git commit -m "feat(estudios): EstudioComparativa infographic matrix"
```

---

## Task 6: EstudioWorkflow component

**Files:**
- Create: `src/components/EstudioWorkflow.astro`

- [ ] **Step 1: Create the component**

```astro
---
// Pasos numerados ("cómo elegir / cómo empezar"). Renderiza nada sin pasos.
interface Paso { titulo: string; detalle: string; }
interface Props { titulo?: string; pasos?: Paso[]; }
const { titulo = 'Cómo elegir', pasos = [] } = Astro.props;
---
{pasos.length > 0 && (
  <section aria-label={titulo} style="margin-top: 40px;">
    <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 16px;">{titulo}</h2>
    <ol style="list-style: none; padding: 0; margin: 0; display: grid; gap: 12px;">
      {pasos.map((p, i) => (
        <li style="display: flex; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px 18px;">
          <span style="flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: var(--bg); font-family: var(--sans); font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center;">{i + 1}</span>
          <div>
            <p style="font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; margin: 2px 0 4px;">{p.titulo}</p>
            <p style="font-family: var(--sans); font-size: 14px; line-height: 1.55; color: var(--fg-3); margin: 0;">{p.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioWorkflow.astro
git commit -m "feat(estudios): EstudioWorkflow step cards"
```

---

## Task 7: EstudioFaq component (render FAQ visibly)

**Files:**
- Create: `src/components/EstudioFaq.astro`

- [ ] **Step 1: Create the component**

```astro
---
// Renderiza el faq visiblemente (hasta ahora solo iba en JSON-LD).
interface Faq { q: string; a: string; }
interface Props { items?: Faq[]; }
const { items = [] } = Astro.props;
---
{items.length > 0 && (
  <section aria-label="Preguntas frecuentes" style="margin-top: 40px;">
    <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 16px;">Preguntas frecuentes</h2>
    <div style="display: grid; gap: 10px;">
      {items.map((f) => (
        <details style="background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px 18px;">
          <summary style="font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; cursor: pointer;">{f.q}</summary>
          <p style="font-family: var(--sans); font-size: 14.5px; line-height: 1.6; color: var(--fg-3); margin: 10px 0 0;">{f.a}</p>
        </details>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioFaq.astro
git commit -m "feat(estudios): EstudioFaq visible FAQ render"
```

---

## Task 8: EstudioFuentes component (cited sources)

**Files:**
- Create: `src/components/EstudioFuentes.astro`

- [ ] **Step 1: Create the component**

```astro
---
// Fuentes citadas (E-E-A-T / "fuente recomendada"). Renderiza nada sin items.
interface Fuente { titulo: string; url: string; editor?: string; fecha?: string; }
interface Props { items?: Fuente[]; }
const { items = [] } = Astro.props;
---
{items.length > 0 && (
  <section aria-label="Fuentes" style="margin-top: 40px; border-top: 1px solid var(--line); padding-top: 24px;">
    <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px;">Fuentes</h2>
    <ol style="margin: 0; padding-left: 20px; display: grid; gap: 8px;">
      {items.map((f) => (
        <li style="font-family: var(--sans); font-size: 14px; line-height: 1.5; color: var(--fg-3);">
          <a href={f.url} target="_blank" rel="noopener nofollow" style="color: var(--accent); text-decoration: none;">{f.titulo}</a>
          {f.editor && <span> — {f.editor}</span>}
          {f.fecha && <span> ({f.fecha})</span>}
        </li>
      ))}
    </ol>
  </section>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/components/EstudioFuentes.astro
git commit -m "feat(estudios): EstudioFuentes cited sources"
```

---

## Task 9: Wire components + related noticias + citation into the template

**Files:**
- Modify: `src/pages/estudios/[slug].astro`

- [ ] **Step 1: Add imports**

After the existing `import { toTool } from '../../data/tools';` line, add:

```ts
import EstudioResumen from '../../components/EstudioResumen.astro';
import EstudioResumirIA from '../../components/EstudioResumirIA.astro';
import EstudioNota from '../../components/EstudioNota.astro';
import EstudioComparativa from '../../components/EstudioComparativa.astro';
import EstudioWorkflow from '../../components/EstudioWorkflow.astro';
import EstudioFaq from '../../components/EstudioFaq.astro';
import EstudioFuentes from '../../components/EstudioFuentes.astro';
```

- [ ] **Step 2: Add related-noticias auto-match**

After the existing `const related = ...` block (related tools), add:

```ts
const canonical = `${site}/estudios/${entry.id}`;
const noticias = await getCollection('noticias');
const relatedNoticias = noticias
  .map((n) => {
    const tagOverlap = n.data.etiquetas.filter((t) => d.etiquetas.includes(t)).length;
    const toolOverlap = (n.data.herramientas ?? []).filter((h) => d.herramientas.includes(h)).length;
    const temaMatch = n.data.tema === d.tema ? 2 : 0;
    return { n, score: temaMatch + tagOverlap + toolOverlap };
  })
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .map((x) => x.n);
```

(`getCollection` is already imported in this file.)

- [ ] **Step 3: Add `citation` to the Article JSON-LD**

Immediately after the `if (d.faq?.length) { graph.push({ ... }); }` block, add:

```ts
if (d.fuentes?.length) {
  graph[0].citation = d.fuentes.map((f) => ({ '@type': 'CreativeWork', name: f.titulo, url: f.url }));
}
```

- [ ] **Step 4: Insert the new render blocks**

In the template body, the current order is: `...descripcion <p>`, then `AgentesVA · {fechaFmt}`, then `<article class="prose"><Content /></article>`, then the `{related.length > 0 && (...)}` tools block.

Replace the date `<p>` + `<article>` region so it reads (keep the date `<p>` as-is, then add components around `<Content/>`):

```astro
    <p style="font-family: var(--mono); font-size: 11px; color: var(--fg-5); margin: 16px 0 0;">AgentesVA · {fechaFmt}</p>

    <EstudioResumen puntos={d.resumen} />
    <EstudioResumirIA url={canonical} titulo={d.titulo} prompt={d.iaPrompt} />
    <EstudioNota texto={d.porQueImporta} />
    <EstudioComparativa criterios={d.comparativa?.criterios} filas={d.comparativa?.filas} />

    <article class="prose" style="margin-top: 36px;">
      <Content />
    </article>

    <EstudioWorkflow titulo={d.workflow?.titulo} pasos={d.workflow?.pasos} />
    <EstudioFaq items={d.faq} />
    <EstudioFuentes items={d.fuentes} />
```

- [ ] **Step 5: Add the "Noticias relacionadas" section**

Immediately AFTER the existing `{related.length > 0 && ( ... )}` tools `</section>` block, add:

```astro
    {relatedNoticias.length > 0 && (
      <section style="margin-top: 40px; border-top: 1px solid var(--line); padding-top: 28px;">
        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Noticias relacionadas</h2>
        <div style="display: grid; gap: 10px; margin-top: 16px;">
          {relatedNoticias.map((n) => (
            <a href={`/noticias/${n.id}`} class="lift" style="display: block; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; text-decoration: none;">
              <span style="font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent);">{n.data.tema}</span>
              <span style="display: block; font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; margin-top: 4px;">{n.data.titulo}</span>
            </a>
          ))}
        </div>
      </section>
    )}
```

- [ ] **Step 6: Verify build + all 8 estudios still render**

Run: `npm run build 2>&1 | tail -5`
Expected: `[build] Complete!`, 0 errors; build log lists all `/estudios/<slug>/index.html` (8 pages). Components render nothing for estudios without the new data — no visual change yet for the 7 non-pilot estudios.

- [ ] **Step 7: Commit**

```bash
git add src/pages/estudios/\[slug\].astro
git commit -m "feat(estudios): wire deep-format components + related noticias + citation"
```

---

## Task 10: tom-4pass estudio depth standard

**Files:**
- Modify: `.claude/skills/tom-4pass/SKILL.md`

- [ ] **Step 1: Add the depth standard**

In `.claude/skills/tom-4pass/SKILL.md`, under the `## Non-negotiables` section, add a new bullet block (after the existing bullets):

```markdown
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
```

- [ ] **Step 2: Verify the skill file is valid markdown (no build impact)**

Run: `head -20 .claude/skills/tom-4pass/SKILL.md`
Expected: frontmatter intact, file readable.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/tom-4pass/SKILL.md
git commit -m "docs(tom-4pass): add estudio depth standard"
```

---

## Task 11: Pilot content rewrite (alternativas-a-chatgpt-en-espanol)

**Files:**
- Modify: `src/content/estudios/alternativas-a-chatgpt-en-espanol.md`

> **This is a content task — run the tom-4pass passes.** Invoke the `tom-4pass`
> skill for this estudio (Order → Brief → Writing → Fact-check). All prices,
> plan limits, and capabilities MUST be Tier-B verified (official page + fecha)
> during Pass 4 before they enter the file. Do not hardcode unverified numbers.

- [ ] **Step 1: Run tom-4pass Passes 1–2** (scope + research + locked outline + tier-classified source shortlist). Confirm the GATE-1 brief and GATE-2 outline.

- [ ] **Step 2: Add the frontmatter blocks** to `alternativas-a-chatgpt-en-espanol.md`. Populate with **verified** data from Pass 2/4. Structure (fill values from research):

```yaml
resumen:
  - "<punto clave 1>"
  - "<punto clave 2>"
  - "<punto clave 3>"
  - "<punto clave 4>"
porQueImporta: "<por qué elegir alternativa a ChatGPT importa para una PyME>"
comparativa:
  criterios: ["Precio", "Español", "Plan gratis", "Mejor para"]
  filas:
    - { herramienta: "claude", celdas: ["<precio>", "<español>", "<sí/no>", "<mejor para>"], score: 0 }
    - { herramienta: "gemini", celdas: ["...", "...", "...", "..."], score: 0 }
    - { herramienta: "perplexity", celdas: ["...", "...", "...", "..."], score: 0 }
    - { herramienta: "deepseek", celdas: ["...", "...", "...", "..."], score: 0 }
    - { herramienta: "mistral", celdas: ["...", "...", "...", "..."], score: 0 }
workflow:
  titulo: "Cómo elegir tu alternativa en 4 pasos"
  pasos:
    - { titulo: "<paso 1>", detalle: "<detalle>" }
    - { titulo: "<paso 2>", detalle: "<detalle>" }
    - { titulo: "<paso 3>", detalle: "<detalle>" }
    - { titulo: "<paso 4>", detalle: "<detalle>" }
fuentes:
  - { titulo: "<título fuente 1>", url: "<url oficial>", editor: "<editor>", fecha: "<fecha>" }
  - { titulo: "<título fuente 2>", url: "<url oficial>", editor: "<editor>", fecha: "<fecha>" }
```

Confirm each `herramienta` slug exists in `src/content/tools/` (claude, gemini, perplexity, deepseek, mistral all present per the directory). Expand/confirm the `faq` block too.

- [ ] **Step 3: Expand the prose body** to ~1,200–1,800 words: per-alternative deep analysis (qué hace bien, límites, precio con fuente+fecha, calidad en español, mejor-para), plus a veredicto. Every Tier-B number carries an inline source. Keep tono humano/editorial.

- [ ] **Step 4: Run tom-4pass Pass 4 (fact-check)** — verify every price/claim against its source; ensure GATE-4 passes (zero `[SIN VERIFICAR]`, fuentes resolve, slugs exist, no contradictions).

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `[build] Complete!`, 0 errors; `/estudios/alternativas-a-chatgpt-en-espanol/index.html` emitted.

- [ ] **Step 6: Confirm rendered blocks in built HTML**

Run: `grep -o -E "En resumen|Resúmelo con tu IA|Por qué importa|Comparativa|Cómo elegir|Preguntas frecuentes|Fuentes|Noticias relacionadas" dist/client/estudios/alternativas-a-chatgpt-en-espanol/index.html | sort -u`
Expected: all eight block labels present.

- [ ] **Step 7: Commit**

```bash
git add src/content/estudios/alternativas-a-chatgpt-en-espanol.md
git commit -m "content(estudios): deepen alternativas-a-chatgpt to new standard"
```

---

## Task 12: Visual QA on the pilot page

**Files:** none (verification only)

- [ ] **Step 1: Build and serve / inspect**

Run: `npm run build 2>&1 | tail -3`
Expected: `[build] Complete!`

- [ ] **Step 2: Visual QA** — using the Playwright browser tools, open the pilot estudio (preview deploy URL once pushed, or `npm run preview` locally), screenshot desktop + mobile widths, and confirm: Resumen box, Resumir-en-IA buttons (ChatGPT/Claude/Perplexity/Gemini), Por qué importa callout, Comparativa matrix (with score bars, horizontal scroll on mobile), deep prose, Workflow steps, FAQ accordions, Fuentes list, Herramientas mencionadas, Noticias relacionadas. Check 0 console errors.

- [ ] **Step 3: Verify the AI buttons** — click each (ChatGPT/Claude/Perplexity) and confirm the assistant opens prefilled with the summarize prompt + canonical URL; confirm Gemini copies the prompt and opens Gemini.

- [ ] **Step 4: Open a PR** for review (do not auto-merge — production deploys on merge):

```bash
git push -u origin feat/deep-estudios
gh pr create --base main --head feat/deep-estudios --title "feat(estudios): deep format + pilot (alternativas-a-chatgpt)" --body "Implements docs/superpowers/specs/2026-06-23-deep-estudios-format-design.md. New schema fields + 7 Futurista components (resumen, resumir-en-IA, por-qué-importa, comparativa infographic, workflow, FAQ, fuentes), auto related-noticias, JSON-LD citation, tom-4pass depth standard, and the fact-checked pilot rewrite. Build green; visual QA done."
```

---

## Self-Review

- **Spec coverage:** resumen (T2,T9,T11), resumir-en-IA incl. Gemini fallback (T3,T9,T11), por-qué-importa (T4,T9,T11), comparativa infographic (T5,T9,T11), workflow (T6,T9,T11), rendered FAQ (T7,T9), fuentes + citation (T8,T9,T11), related noticias auto-match (T9), schema (T1), tom-4pass standard (T10), pilot rewrite + fact-check (T11), visual QA (T12). All spec sections covered.
- **Placeholders:** the only `<...>` placeholders are in Task 11's content frontmatter — intentional, because the values are produced by the tom-4pass fact-check pass and must not be hardcoded unverified. Every code task has complete code.
- **Type consistency:** prop names match between components and Task 9 wiring (`puntos`, `url`/`titulo`/`prompt`, `texto`, `criterios`/`filas`, `titulo`/`pasos`, `items`); schema field names (`resumen`, `porQueImporta`, `comparativa.criterios/filas`, `workflow.titulo/pasos`, `faq`, `fuentes`, `iaPrompt`) match Task 1 and the template usage in Task 9.
