# /cursos Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/cursos`, the AI-courses directory (free + affiliate + one own Gumroad product), cloning the proven `#50` tools-directory architecture.

**Architecture:** A new `cursos` content collection (glob over `*.json`, filename = slug) + a small `cursosCategorias` collection. Three SSG routes — `/cursos` (filterable listing), `/cursos/[categoria]` (static category pages), `/curso/[slug]` (ficha, singular). Affiliate CTAs route through the existing `/ir/[slug]` endpoint (extended to also resolve courses, with a build-time slug-collision guard); the one `propio` course links straight to Gumroad. SEO is inline JSON-LD (`Course` / `CollectionPage`+`ItemList` / `BreadcrumbList` / `FAQPage`), matching #50.

**Tech Stack:** Astro 5/6 SSG, `@astrojs/vercel`, Zod 4 (content validation), `@astrojs/sitemap`, vanilla TS client scripts (CSP-safe, no inline handlers). No unit-test framework — verification is `npm run build` (Zod + types), dev-server `curl`/`grep`, Google Rich Results Test, Lighthouse.

**Branch:** `feat/cursos-directory` (already created).

**Spec:** [`docs/superpowers/specs/2026-06-25-cursos-directory-design.md`](../specs/2026-06-25-cursos-directory-design.md)

### Testing approach (read first)

This repo has **no Jest/Vitest**. Each task's "verify" step uses the real gates the project relies on:
- **Build gate:** `npm run build` — Astro runs the Zod schema over every JSON and type-checks `.astro`/`.ts`. Invalid/missing data or type drift fails the build. This is our primary regression test.
- **Runtime gate:** `npm run dev` + `curl`/`grep` to assert rendered HTML, JSON-LD, and `/ir` redirects.
- **SEO gate (#66):** Rich Results Test + Lighthouse.

Commit after every green task. Keep commits small.

---

## Issue #62 — Collection + ficha (tracer bullet)

### Task 1: Add `cursos` + `cursosCategorias` collections

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add both collections before the `export const collections` line**

Insert after the `noticias` collection definition (before line `export const collections = ...`):

```ts
// Directorio de cursos de IA (#54). Clona el patrón de `tools`: el `id` = nombre
// de archivo = slug. El build falla si un JSON no cumple el esquema.
const cursos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cursos' }),
  schema: z
    .object({
      titulo: z.string(),
      proveedor: z.string(),
      categoria: z.string(),
      nivel: z.enum(['principiante', 'intermedio', 'avanzado']),
      desc: z.string(),
      long: z.string(),
      tagline: z.string(),
      ideal: z.string(),
      precio: z.enum(['Gratis', 'Pago']),
      precioDesde: z.string().optional(),
      idioma: z.string(),
      duracion: z.string().optional(),
      certificado: z.boolean().optional(),
      tipo: z.enum(['externo', 'propio']).default('externo'),
      // officialUrl — obligatoria, validada como URL
      officialUrl: z.string().url(),
      affiliateUrl: z.string().url().optional(),
      gumroadUrl: z.string().url().optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      orden: z.number().int(),
      destacado: z.boolean().default(false),
      actualizado: z.string(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    })
    .superRefine((d, ctx) => {
      if (d.tipo === 'propio' && !d.gumroadUrl) {
        ctx.addIssue({
          code: 'custom',
          message: 'Un curso propio (tipo: "propio") requiere gumroadUrl.',
          path: ['gumroadUrl'],
        });
      }
    }),
});

const cursosCategorias = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cursos-categorias' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    orden: z.number().int(),
  }),
});
```

- [ ] **Step 2: Register both in the collections export**

Replace:
```ts
export const collections = { tools, categories, estudios, noticias };
```
with:
```ts
export const collections = { tools, categories, estudios, noticias, cursos, cursosCategorias };
```

- [ ] **Step 3: Verify (build must still pass with empty collections)**

Run: `npm run build`
Expected: PASS (empty `cursos`/`cursos-categorias` dirs are valid — glob just matches nothing yet). If it errors about a missing base dir, create the dirs in Task 3 first, then re-run.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(cursos): add cursos + cursosCategorias content collections (#62)"
```

---

### Task 2: Course data helpers (`src/data/cursos.ts`)

**Files:**
- Create: `src/data/cursos.ts`

- [ ] **Step 1: Write the full helper module**

```ts
// Tipos + constantes + helpers del directorio de cursos. Los DATOS viven en
// content collections (`src/content/cursos`, `src/content/cursos-categorias`).
import type { CollectionEntry } from 'astro:content';

export type Precio = 'Gratis' | 'Pago';
export type Nivel = 'principiante' | 'intermedio' | 'avanzado';
export type TipoCurso = 'externo' | 'propio';

export interface Curso {
  slug: string;
  titulo: string;
  proveedor: string;
  categoria: string;
  nivel: Nivel;
  desc: string;
  long: string;
  tagline: string;
  ideal: string;
  precio: Precio;
  precioDesde?: string;
  idioma: string;
  duracion?: string;
  certificado?: boolean;
  tipo: TipoCurso;
  officialUrl: string;
  affiliateUrl?: string;
  gumroadUrl?: string;
  color: string;
  orden: number;
  destacado: boolean;
  actualizado: string;
  faq?: { q: string; a: string }[];
}

export const PRECIO_COLOR: Record<Precio, string> = {
  Gratis: '#4ec98a',
  Pago: '#5B7CFF',
};

const NIVEL_LABEL: Record<Nivel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
export function nivelLabel(n: Nivel): string {
  return NIVEL_LABEL[n];
}

// Normaliza una entrada de la colección `cursos` a Curso (id → slug).
export function toCurso(entry: CollectionEntry<'cursos'>): Curso {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternativesCursos(all: Curso[], curso: Curso): Curso[] {
  return all.filter((c) => c.categoria === curso.categoria && c.slug !== curso.slug).slice(0, 3);
}

// FAQs de respaldo derivadas de los datos (cuando no hay faq curadas).
// Visibles en la ficha + emitidas como FAQPage (Google exige que coincidan).
export function fallbackFaqsCurso(curso: Curso): { q: string; a: string }[] {
  const precio =
    curso.precio === 'Gratis'
      ? `Sí, ${curso.titulo} es un curso gratuito.`
      : `${curso.titulo} es un curso de pago${curso.precioDesde ? ` (desde ${curso.precioDesde})` : ''}.`;
  return [
    { q: `¿Qué aprenderás en ${curso.titulo}?`, a: curso.long },
    { q: `¿${curso.titulo} es gratis?`, a: precio },
    { q: `¿Para quién es ${curso.titulo}?`, a: `Ideal para ${curso.ideal}.` },
    { q: `¿Qué nivel necesito para ${curso.titulo}?`, a: `Nivel ${NIVEL_LABEL[curso.nivel].toLowerCase()}.` },
  ];
}

// Guard de build: ningún slug de curso puede chocar con uno de herramienta,
// porque ambas colecciones comparten el endpoint /ir/[slug].
export function assertNoSlugCollision(toolSlugs: string[], cursoSlugs: string[]): void {
  const tools = new Set(toolSlugs);
  const dup = cursoSlugs.filter((s) => tools.has(s));
  if (dup.length) {
    throw new Error(
      `[cursos] Colisión de slug con herramientas en /ir: ${dup.join(', ')}. Renombra el JSON del curso.`,
    );
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check 2>&1 | head -20` (or rely on `npm run build` in Task 6)
Expected: no type errors referencing `src/data/cursos.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/data/cursos.ts
git commit -m "feat(cursos): Curso type + helpers (toCurso, alternatives, fallback FAQs, slug guard) (#62)"
```

---

### Task 3: Seed categories + one course (make the build real)

**Files:**
- Create: `src/content/cursos-categorias/fundamentos.json`
- Create: `src/content/cursos-categorias/negocio.json`
- Create: `src/content/cursos-categorias/prompts.json`
- Create: `src/content/cursos-categorias/imagen-generativa.json`
- Create: `src/content/cursos-categorias/automatizacion-agentes.json`
- Create: `src/content/cursos/elementos-de-ia.json`

- [ ] **Step 1: Write the 5 category files**

`src/content/cursos-categorias/fundamentos.json`:
```json
{
  "nombre": "Fundamentos de IA",
  "descripcion": "Qué es la IA y cómo funciona, explicado sin tecnicismos.",
  "orden": 10
}
```

`src/content/cursos-categorias/negocio.json`:
```json
{
  "nombre": "IA para tu negocio",
  "descripcion": "Aplica la IA a tareas reales: ventas, atención, marketing y productividad.",
  "orden": 20
}
```

`src/content/cursos-categorias/prompts.json`:
```json
{
  "nombre": "Prompts e ingeniería de prompts",
  "descripcion": "Aprende a pedirle bien a la IA para obtener mejores resultados.",
  "orden": 30
}
```

`src/content/cursos-categorias/imagen-generativa.json`:
```json
{
  "nombre": "Imagen y generativa",
  "descripcion": "Crea imágenes y contenido visual con IA generativa.",
  "orden": 40
}
```

`src/content/cursos-categorias/automatizacion-agentes.json`:
```json
{
  "nombre": "Automatización y agentes",
  "descripcion": "Conecta la IA a tus herramientas y crea flujos y agentes que trabajan por ti.",
  "orden": 50
}
```

- [ ] **Step 2: Write one real course (tracer-bullet data)**

`src/content/cursos/elementos-de-ia.json` (Elements of AI — Univ. Helsinki + MinnaLearn; free; available in Spanish as "Elementos de IA"). **Verify the URL is live and the free/Spanish status is accurate (Tier A) before committing.**
```json
{
  "titulo": "Elementos de IA",
  "proveedor": "Universidad de Helsinki",
  "categoria": "Fundamentos de IA",
  "nivel": "principiante",
  "desc": "Curso introductorio gratuito sobre qué es la IA y qué puede (y no puede) hacer.",
  "long": "Elementos de IA es un curso online gratuito creado por la Universidad de Helsinki y MinnaLearn para explicar la inteligencia artificial a cualquiera, sin necesidad de programar. Cubre qué es la IA, cómo funciona el aprendizaje automático y qué implicaciones tiene en el día a día y en los negocios. Disponible en español.",
  "tagline": "Entiende la IA desde cero, sin programar y en español.",
  "ideal": "Personas y dueños de negocio que quieren entender la IA antes de aplicarla",
  "precio": "Gratis",
  "idioma": "Español",
  "duracion": "Aprox. 30 horas (a tu ritmo)",
  "certificado": true,
  "tipo": "externo",
  "officialUrl": "https://www.elementsofai.com/es",
  "color": "#0040FF",
  "orden": 10,
  "destacado": false,
  "actualizado": "2026-06-25"
}
```

- [ ] **Step 3: Verify the build validates the new content**

Run: `npm run build`
Expected: PASS. To prove Zod is enforcing the schema, temporarily delete the `"officialUrl"` line from the course JSON and re-run — expected FAIL with a Zod error pointing at `officialUrl`. Restore the line and re-run → PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content/cursos-categorias src/content/cursos
git commit -m "feat(cursos): seed 5 categories + first course (Elementos de IA) (#62)"
```

---

### Task 4: `CourseCard.astro`

**Files:**
- Create: `src/components/CourseCard.astro`

- [ ] **Step 1: Write the component (modeled on `ToolCard.astro`; no rating)**

```astro
---
import type { Curso } from '../data/cursos';
import { PRECIO_COLOR, nivelLabel } from '../data/cursos';

interface Props { curso: Curso }
const { curso } = Astro.props;
const initial = curso.titulo.charAt(0);
const precioColor = PRECIO_COLOR[curso.precio];
const meta = `${nivelLabel(curso.nivel)}${curso.duracion ? ` · ${curso.duracion}` : ''}`;
const search = `${curso.titulo} ${curso.desc} ${curso.proveedor} ${curso.categoria}`.toLowerCase();
---

<article
  class="lift curso-card spotlight"
  data-cat={curso.categoria}
  data-nivel={curso.nivel}
  data-precio={curso.precio}
  data-search={search}
  style="position: relative; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 14px;"
>
  <a
    href={`/curso/${curso.slug}`}
    aria-label={`Ver ${curso.titulo}`}
    style="position: absolute; inset: 0; z-index: 1; border-radius: 8px;"
  ></a>
  <div style="display: flex; align-items: flex-start; gap: 13px;">
    <div transition:name={`mono-curso-${curso.slug}`} style={`width: 42px; height: 42px; border-radius: 9px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 19px; color: #fff; background: ${curso.color};`}>{initial}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-family: var(--sans); font-weight: 600; font-size: 16px; color: #fff;">{curso.titulo}</div>
      <div style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5); margin-top: 3px;">{curso.proveedor}</div>
    </div>
    <button
      type="button"
      class="bookmark-btn"
      data-bookmark={curso.slug}
      aria-label={`Guardar ${curso.titulo}`}
      aria-pressed="false"
      style="position: relative; z-index: 2; background: none; border: none; cursor: pointer; padding: 6px; margin: -6px; display: flex;"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--fg-5)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
    </button>
  </div>
  <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--fg-3);">{curso.desc}</p>
  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
    <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-4);">{meta}</span>
    <span style={`font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${precioColor}; border: 1px solid var(--line-2); padding: 4px 9px; border-radius: 20px;`}>{curso.precio}</span>
  </div>
</article>
```

- [ ] **Step 2: Commit** (verified together with the ficha in Task 6)

```bash
git add src/components/CourseCard.astro
git commit -m "feat(cursos): CourseCard component (#62)"
```

---

### Task 5: Ficha `/curso/[slug].astro`

**Files:**
- Create: `src/pages/curso/[slug].astro`

- [ ] **Step 1: Write the full ficha page**

Reuses `initToolDetail` (generic on `#save-btn`/`data-slug`) and `initMotion`. CTA routes by `tipo`.

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import { getCollection } from 'astro:content';
import { toCurso, getAlternativesCursos, fallbackFaqsCurso, PRECIO_COLOR, nivelLabel, type Curso } from '../../data/cursos';

export async function getStaticPaths() {
  const cursos = (await getCollection('cursos')).map(toCurso).sort((a, b) => a.orden - b.orden);
  return cursos.map((curso) => ({
    params: { slug: curso.slug },
    props: { curso, alts: getAlternativesCursos(cursos, curso) },
  }));
}

interface Props { curso: Curso; alts: Curso[] }
const { curso, alts } = Astro.props;
const initial = curso.titulo.charAt(0);
const precioColor = PRECIO_COLOR[curso.precio];
const site = 'https://agentesva.com';
const faqs = curso.faq?.length ? curso.faq : fallbackFaqsCurso(curso);

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      name: curso.titulo,
      description: curso.long,
      provider: { '@type': 'Organization', name: curso.proveedor },
      inLanguage: 'es',
      educationalLevel: curso.nivel,
      url: `${site}/curso/${curso.slug}`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Cursos', item: `${site}/cursos` },
        { '@type': 'ListItem', position: 3, name: curso.titulo, item: `${site}/curso/${curso.slug}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const ctaLabel = curso.tipo === 'propio'
  ? 'Comprar curso →'
  : curso.precio === 'Gratis'
    ? 'Ir al curso (gratis) →'
    : 'Ir al curso →';
---

<BaseLayout
  title={`${curso.titulo} — ${curso.tagline} | AgentesVA`}
  description={`${curso.titulo}: ${curso.long.slice(0, 150)}`}
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <SiteHeader />

  <main style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;">
    <a href="/cursos" class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver a cursos</a>

    <div style="display: flex; align-items: flex-start; gap: 22px; margin-top: 26px; border-bottom: 1px solid var(--line); padding-bottom: 32px; flex-wrap: wrap;">
      <div transition:name={`mono-curso-${curso.slug}`} style={`width: 74px; height: 74px; border-radius: 16px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 33px; color: #fff; background: ${curso.color};`}>{initial}</div>
      <div style="flex: 1; min-width: 220px;">
        <div style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);">{curso.categoria}</div>
        <h1 style="font-family: var(--sans); font-weight: 700; font-size: clamp(30px, 6vw, 40px); letter-spacing: -0.03em; margin: 6px 0 0; color: #fff;">{curso.titulo}</h1>
        <p style="font-size: 16.5px; line-height: 1.5; color: var(--fg-3); margin: 8px 0 0; max-width: 34em;">{curso.tagline}</p>
        <div style="display: flex; gap: 14px; align-items: center; margin-top: 16px; flex-wrap: wrap;">
          <span style="font-family: var(--mono); font-size: 12px; color: var(--fg-2);">{nivelLabel(curso.nivel)}</span>
          <span style={`font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${precioColor}; border: 1px solid var(--line-2); padding: 4px 10px; border-radius: 20px;`}>{curso.precio}{curso.precioDesde ? ` · ${curso.precioDesde}` : ''}</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; flex: none;">
        {curso.tipo === 'propio' ? (
          <a href={curso.gumroadUrl} target="_blank" rel="noopener" class="lift shimmer" style="background: var(--accent); color: var(--bg); border: none; padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; text-decoration: none; text-align: center; white-space: nowrap;">{ctaLabel}</a>
        ) : (
          <a href={`/ir/${curso.slug}`} target="_blank" rel="sponsored nofollow noopener" class="lift shimmer" style="background: var(--accent); color: var(--bg); border: none; padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; text-decoration: none; text-align: center; white-space: nowrap;">{ctaLabel}</a>
        )}
        <button type="button" id="save-btn" data-slug={curso.slug} aria-pressed="false" style="background: var(--panel-2); color: var(--fg-2); border: 1px solid var(--line-2); padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap;"><span id="save-label">Guardar</span></button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 44px; margin-top: 38px;">
      <div>
        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Sobre el curso</h2>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 14px 0 0;">{curso.long}</p>

        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 36px 0 0;">Para quién es</h2>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 14px 0 0;">{curso.ideal}.</p>

        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 36px 0 0;">Preguntas frecuentes</h2>
        <div style="display: flex; flex-direction: column; gap: 18px; margin-top: 18px;">
          {faqs.map((f) => (
            <div>
              <h3 style="font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; margin: 0;">{f.q}</h3>
              <p style="font-size: 14.5px; line-height: 1.6; color: var(--fg-2); margin: 8px 0 0;">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <aside style="display: flex; flex-direction: column; gap: 18px;">
        <div style="border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 22px;">
          <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-5);">Resumen</span>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line); margin-top: 8px;">
            <span style="font-size: 13px; color: var(--fg-4);">Proveedor</span><span style="font-size: 13.5px; color: #fff;">{curso.proveedor}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line);">
            <span style="font-size: 13px; color: var(--fg-4);">Nivel</span><span style="font-size: 13.5px; color: #fff;">{nivelLabel(curso.nivel)}</span>
          </div>
          {curso.duracion && (
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line);">
              <span style="font-size: 13px; color: var(--fg-4);">Duración</span><span style="font-size: 13.5px; color: #fff;">{curso.duracion}</span>
            </div>
          )}
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line);">
            <span style="font-size: 13px; color: var(--fg-4);">Precio</span><span style="font-size: 13.5px; color: #fff;">{curso.precio}{curso.precioDesde ? ` · ${curso.precioDesde}` : ''}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line);">
            <span style="font-size: 13px; color: var(--fg-4);">Idioma</span><span style="font-size: 13.5px; color: #fff;">{curso.idioma}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0;">
            <span style="font-size: 13px; color: var(--fg-4);">Certificado</span><span style="font-size: 13.5px; color: #fff;">{curso.certificado ? 'Sí' : '—'}</span>
          </div>
        </div>

        {alts.length > 0 && (
          <div style="border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 22px;">
            <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-5);">Otros cursos</span>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 14px;">
              {alts.map((a) => (
                <a href={`/curso/${a.slug}`} class="lift" style="display: flex; align-items: center; gap: 12px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px; text-decoration: none;">
                  <span style={`width: 34px; height: 34px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 15px; color: #fff; background: ${a.color};`}>{a.titulo.charAt(0)}</span>
                  <span style="flex: 1;">
                    <span style="display: block; font-family: var(--sans); font-weight: 600; font-size: 14px; color: #fff;">{a.titulo}</span>
                    <span style="display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5); margin-top: 2px;">{nivelLabel(a.nivel)} · {a.precio}</span>
                  </span>
                  <span aria-hidden="true" style="color: var(--fg-5); font-family: var(--mono); font-size: 13px;">→</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  </main>

  <SiteFooter />
</BaseLayout>

<script>
  import { initToolDetail } from '../../scripts/tool-detail';
  import { initMotion } from '../../scripts/motion';
  document.addEventListener('astro:page-load', () => {
    initToolDetail();
    initMotion();
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/curso/[slug].astro
git commit -m "feat(cursos): /curso/[slug] ficha with Course JSON-LD + tipo-based CTA (#62)"
```

---

### Task 6: Verify the tracer bullet (build + render the ficha)

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: PASS. Build output lists `/curso/elementos-de-ia/index.html` among generated pages.

- [ ] **Step 2: Render-check the ficha**

Run:
```bash
npm run dev &
sleep 4
curl -s http://localhost:4321/curso/elementos-de-ia | grep -o '"@type":"Course"'
curl -s http://localhost:4321/curso/elementos-de-ia | grep -o 'Ir al curso (gratis)'
kill %1
```
Expected: prints `"@type":"Course"` and `Ir al curso (gratis)`. (Port is 4321 by default; adjust if your `astro.config.mjs` overrides it.)

- [ ] **Step 3: Commit (no-op if nothing changed)** — tracer bullet complete. Issue #62 done.

---

## Issue #63 — Listing + category pages + nav

### Task 7: Course filter script (`src/scripts/cursos.ts`)

**Files:**
- Create: `src/scripts/cursos.ts`

- [ ] **Step 1: Write the script (multi-filter: categoría + nivel + precio + search, + bookmarks)**

```ts
// Interactividad del directorio de cursos (CSP-safe: sin onclick inline).
// Filtra por categoría + nivel + precio + búsqueda y gestiona los bookmarks
// (mismo localStorage que el directorio de herramientas).
const SAVED_KEY = 'agentesva:saved';

const CHIP_ACTIVE = { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' };
const CHIP_IDLE = { background: 'transparent', color: 'var(--fg-3)', borderColor: 'var(--line-2)' };

function applyChip(el: HTMLElement, active: boolean) {
  const s = active ? CHIP_ACTIVE : CHIP_IDLE;
  el.style.background = s.background;
  el.style.color = s.color;
  el.style.borderColor = s.borderColor;
  el.setAttribute('aria-pressed', String(active));
}

function setupChipGroup(selector: string, onChange: (val: string) => void) {
  const chips = Array.from(document.querySelectorAll<HTMLElement>(selector));
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.chip || '';
      chips.forEach((c) => applyChip(c, c === chip));
      onChange(val);
    });
  });
}

function setupFilter() {
  const search = document.getElementById('curso-search') as HTMLInputElement | null;
  const grid = document.getElementById('curso-grid');
  const empty = document.getElementById('curso-empty');
  const countEl = document.getElementById('curso-count');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.curso-card'));
  if (!grid) return;

  let activeCat = 'Todas';
  let activeNivel = 'Todos';
  let activePrecio = 'Todos';

  const filter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match =
        (activeCat === 'Todas' || (card.dataset.cat || '') === activeCat) &&
        (activeNivel === 'Todos' || (card.dataset.nivel || '') === activeNivel) &&
        (activePrecio === 'Todos' || (card.dataset.precio || '') === activePrecio) &&
        (!q || (card.dataset.search || '').includes(q));
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
    grid.style.display = visible === 0 ? 'none' : 'grid';
  };

  search?.addEventListener('input', filter);
  document.getElementById('curso-search-form')?.addEventListener('submit', (e) => e.preventDefault());

  setupChipGroup('.cat-chip', (v) => { activeCat = v || 'Todas'; filter(); });
  setupChipGroup('.nivel-chip', (v) => { activeNivel = v || 'Todos'; filter(); });
  setupChipGroup('.precio-chip', (v) => { activePrecio = v || 'Todos'; filter(); });
}

function setupBookmarks() {
  let saved: Set<string>;
  try { saved = new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); }
  catch { saved = new Set(); }
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-bookmark]'));
  const paint = (btn: HTMLButtonElement, on: boolean) => {
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', on ? 'var(--accent)' : 'none');
      svg.setAttribute('stroke', on ? 'var(--accent)' : 'var(--fg-5)');
    }
    btn.setAttribute('aria-pressed', String(on));
  };
  buttons.forEach((btn) => {
    const slug = btn.dataset.bookmark || '';
    paint(btn, saved.has(slug));
    btn.addEventListener('click', () => {
      if (saved.has(slug)) saved.delete(slug); else saved.add(slug);
      paint(btn, saved.has(slug));
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch { /* ignore */ }
    });
  });
}

export function initCursos() {
  setupFilter();
  setupBookmarks();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/scripts/cursos.ts
git commit -m "feat(cursos): client filter script (categoría+nivel+precio+search) + bookmarks (#63)"
```

---

### Task 8: Listing page `/cursos/index.astro` (+ build-time slug guard)

**Files:**
- Create: `src/pages/cursos/index.astro`

- [ ] **Step 1: Write the listing page**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import CourseCard from '../../components/CourseCard.astro';
import { getCollection } from 'astro:content';
import { toCurso, assertNoSlugCollision } from '../../data/cursos';

const cursos = (await getCollection('cursos'))
  .map(toCurso)
  .sort((a, b) => Number(b.destacado) - Number(a.destacado) || a.orden - b.orden);
const cats = (await getCollection('cursosCategorias')).sort((a, b) => a.data.orden - b.data.orden);

// Guard de build: ningún slug de curso puede chocar con uno de herramienta (comparten /ir/[slug]).
const toolSlugs = (await getCollection('tools')).map((t) => t.id);
assertNoSlugCollision(toolSlugs, cursos.map((c) => c.slug));

const CATEGORIES = ['Todas', ...cats.map((c) => c.data.nombre)];
const NIVELES = [
  { v: 'Todos', label: 'Todos' },
  { v: 'principiante', label: 'Principiante' },
  { v: 'intermedio', label: 'Intermedio' },
  { v: 'avanzado', label: 'Avanzado' },
];
const PRECIOS = ['Todos', 'Gratis', 'Pago'];
const site = 'https://agentesva.com';

const chipBase = 'font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; border-radius: 30px;';
const chipOn = 'background: var(--accent); color: var(--bg); border: 1px solid var(--accent);';
const chipOff = 'background: transparent; color: var(--fg-3); border: 1px solid var(--line-2);';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Cursos de IA',
      description: 'Directorio de cursos de IA en español, gratis y de pago.',
      url: `${site}/cursos`,
      inLanguage: 'es',
    },
    {
      '@type': 'ItemList',
      itemListElement: cursos.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${site}/curso/${c.slug}`,
        name: c.titulo,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Cursos', item: `${site}/cursos` },
      ],
    },
  ],
};
---

<BaseLayout
  title="Cursos de IA — gratis y de pago | AgentesVA"
  description="Directorio de cursos de IA en español. Filtra por nivel y precio; lidera con los gratuitos. Aprende a usar la IA en tu negocio sin gastar de más."
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <SiteHeader />

  <main style="max-width: 1200px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
      <a href="/" class="navlink" style="color: var(--fg-4); text-decoration: none;">Inicio</a> <span aria-hidden="true">/</span> Cursos
    </nav>

    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 18px;">
      <h1 style="font-family: var(--serif); font-weight: 400; font-size: clamp(30px, 5vw, 44px); letter-spacing: -0.03em; margin: 0; color: #fff;">Cursos de IA</h1>
      <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5);"><span id="curso-count" style="color: var(--accent);">{cursos.length}</span> resultados</span>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: var(--fg-3); margin: 12px 0 0; max-width: 42em;">Cursos de IA en español, gratis y de pago, para empezar hoy. Sin relleno: solo lo que de verdad te enseña a usarla.</p>

    <!-- search -->
    <form id="curso-search-form" role="search" class="searchwrap" style="display: flex; align-items: center; gap: 12px; max-width: 560px; margin: 24px 0 0; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 4px; padding: 4px 4px 4px 18px; transition: border-color .25s, box-shadow .25s;">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--fg-5)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
      <label for="curso-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Buscar cursos</label>
      <input id="curso-search" type="search" autocomplete="off" placeholder="Busca: prompts, ChatGPT, automatizar…" style="flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--sans); font-size: 15px; padding: 12px 0;">
    </form>

    <!-- filtro: categoría -->
    <div role="group" aria-label="Filtrar por categoría" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px;">
      {CATEGORIES.map((c, i) => (
        <button type="button" class="chip cat-chip" data-chip={c} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{c}</button>
      ))}
    </div>

    <!-- filtros: nivel + precio -->
    <div style="display: flex; flex-wrap: wrap; gap: 18px 28px; margin-top: 12px;">
      <div role="group" aria-label="Filtrar por nivel" style="display: flex; flex-wrap: wrap; gap: 8px;">
        {NIVELES.map((n, i) => (
          <button type="button" class="chip nivel-chip" data-chip={n.v} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{n.label}</button>
        ))}
      </div>
      <div role="group" aria-label="Filtrar por precio" style="display: flex; flex-wrap: wrap; gap: 8px;">
        {PRECIOS.map((p, i) => (
          <button type="button" class="chip precio-chip" data-chip={p} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{p}</button>
        ))}
      </div>
    </div>

    <div id="curso-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 28px;">
      {cursos.map((curso) => <CourseCard curso={curso} />)}
    </div>

    <div id="curso-empty" hidden style="border: 1px dashed var(--line-2); border-radius: 8px; padding: 56px 24px; text-align: center; margin-top: 28px;">
      <p style="font-family: var(--sans); font-weight: 600; font-size: 18px; color: #fff; margin: 0;">Sin resultados</p>
      <p style="font-size: 14px; color: var(--fg-5); margin: 8px 0 0;">Prueba otra palabra o cambia los filtros.</p>
    </div>

    <!-- categorías (SEO: enlaces a las páginas de categoría) -->
    <section style="margin-top: 56px; border-top: 1px solid var(--line); padding-top: 28px;">
      <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Explora por categoría</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">
        {cats.map((c) => (
          <a href={`/cursos/${c.id}`} class="lift" style="font-family: var(--mono); font-size: 12px; color: var(--fg-2); background: var(--panel); border: 1px solid var(--line); border-radius: 30px; padding: 9px 16px; text-decoration: none;">{c.data.nombre}</a>
        ))}
      </div>
    </section>
  </main>

  <SiteFooter />
</BaseLayout>

<script>
  import { initCursos } from '../../scripts/cursos';
  import { initMotion } from '../../scripts/motion';
  document.addEventListener('astro:page-load', () => {
    initCursos();
    initMotion();
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/cursos/index.astro
git commit -m "feat(cursos): /cursos listing with nivel+precio filters + slug guard (#63)"
```

---

### Task 9: Category page `/cursos/[categoria].astro`

**Files:**
- Create: `src/pages/cursos/[categoria].astro`

- [ ] **Step 1: Write the category page**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import CourseCard from '../../components/CourseCard.astro';
import { getCollection } from 'astro:content';
import { toCurso, type Curso } from '../../data/cursos';

export async function getStaticPaths() {
  const cursos = (await getCollection('cursos')).map(toCurso).sort((a, b) => a.orden - b.orden);
  const cats = await getCollection('cursosCategorias');
  return cats.map((cat) => ({
    params: { categoria: cat.id },
    props: {
      nombre: cat.data.nombre,
      descripcion: cat.data.descripcion,
      cursos: cursos.filter((c) => c.categoria === cat.data.nombre),
    },
  }));
}

interface Props { nombre: string; descripcion: string; cursos: Curso[] }
const { nombre, descripcion, cursos } = Astro.props;
const site = 'https://agentesva.com';
const slug = Astro.params.categoria;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: `Cursos de IA · ${nombre}`,
      description: descripcion,
      url: `${site}/cursos/${slug}`,
      inLanguage: 'es',
    },
    {
      '@type': 'ItemList',
      itemListElement: cursos.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${site}/curso/${c.slug}`,
        name: c.titulo,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Cursos', item: `${site}/cursos` },
        { '@type': 'ListItem', position: 3, name: nombre, item: `${site}/cursos/${slug}` },
      ],
    },
  ],
};
---

<BaseLayout
  title={`Cursos de IA de ${nombre} | AgentesVA`}
  description={`${descripcion} ${cursos.length} cursos de IA de ${nombre}, en español.`}
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <SiteHeader />

  <main style="max-width: 1200px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
      <a href="/" class="navlink" style="color: var(--fg-4); text-decoration: none;">Inicio</a> <span aria-hidden="true">/</span>
      <a href="/cursos" class="navlink" style="color: var(--fg-4); text-decoration: none;">Cursos</a> <span aria-hidden="true">/</span> {nombre}
    </nav>

    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 18px;">
      <h1 style="font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 5vw, 40px); letter-spacing: -0.03em; margin: 0; color: #fff;">Cursos de IA · {nombre}</h1>
      <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5);"><span style="color: var(--accent);">{cursos.length}</span> cursos</span>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: var(--fg-3); margin: 12px 0 0; max-width: 42em;">{descripcion}</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 28px;">
      {cursos.map((curso) => <CourseCard curso={curso} />)}
    </div>

    <a href="/cursos" class="navlink" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 36px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none;">← Todos los cursos</a>
  </main>

  <SiteFooter />
</BaseLayout>

<script>
  import { initCursos } from '../../scripts/cursos';
  import { initMotion } from '../../scripts/motion';
  document.addEventListener('astro:page-load', () => {
    initCursos();
    initMotion();
  });
</script>
```

> Note: `initCursos()` runs here too. `setupFilter()` returns early (no `#curso-grid` chips on this page is fine — the grid id is absent so it skips), and `setupBookmarks()` still wires the card bookmark buttons. No category-page filter UI is needed.

- [ ] **Step 2: Commit**

```bash
git add src/pages/cursos/[categoria].astro
git commit -m "feat(cursos): /cursos/[categoria] static category pages (#63)"
```

---

### Task 10: Add `/cursos` to the site nav

**Files:**
- Modify: `src/components/SiteHeader.astro`

- [ ] **Step 1: Insert the Cursos link after the Herramientas link**

Replace:
```astro
      <a class="navlink" href="/herramientas" style="color: #fff; text-decoration: none;">Herramientas</a>
      <a class="navlink" href="/estudios" style="color: var(--fg-4); text-decoration: none;">Estudios</a>
```
with:
```astro
      <a class="navlink" href="/herramientas" style="color: #fff; text-decoration: none;">Herramientas</a>
      <a class="navlink" href="/cursos" style="color: var(--fg-4); text-decoration: none;">Cursos</a>
      <a class="navlink" href="/estudios" style="color: var(--fg-4); text-decoration: none;">Estudios</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SiteHeader.astro
git commit -m "feat(cursos): add Cursos to site nav (#63)"
```

---

### Task 11: Verify listing + category + nav

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: PASS. Output includes `/cursos/index.html`, `/cursos/fundamentos/index.html` (and the other 4 categories), `/curso/elementos-de-ia/index.html`.

- [ ] **Step 2: Render-check listing filters + nav**

Run:
```bash
npm run dev &
sleep 4
curl -s http://localhost:4321/cursos | grep -o 'class="chip nivel-chip"' | head -1
curl -s http://localhost:4321/cursos | grep -o 'class="chip precio-chip"' | head -1
curl -s http://localhost:4321/cursos | grep -o 'href="/cursos"'   # nav link present site-wide
curl -s http://localhost:4321/cursos/fundamentos | grep -o '"@type":"CollectionPage"'
kill %1
```
Expected: each prints its match (nivel chip, precio chip, nav `href="/cursos"`, and the category page's CollectionPage JSON-LD). Issue #63 done.

---

## Issue #64 — `/ir` extension + slug-collision guard

### Task 12: Extend `/ir/[slug].ts` to resolve courses

**Files:**
- Modify: `src/pages/ir/[slug].ts`

- [ ] **Step 1: Replace the file with the tools-then-cursos lookup**

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Resuelve primero herramientas (#50), luego cursos (#54). Los slugs son únicos
// entre ambas colecciones (guard de build en /cursos).
export const prerender = false;

function redirect(dest: string, kind: string, slug: string): Response {
  console.log(`[ir] click ${kind} ${slug} → ${dest}`);
  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('No encontrado', { status: 404 });

  const tool = (await getCollection('tools')).find((t) => t.id === slug);
  if (tool) return redirect(tool.data.affiliateUrl || tool.data.url, 'tool', slug);

  const curso = (await getCollection('cursos')).find((c) => c.id === slug);
  if (curso) return redirect(curso.data.affiliateUrl || curso.data.officialUrl, 'curso', slug);

  return new Response('No encontrado', { status: 404 });
};
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Verify the redirect for an externo course**

Run:
```bash
npm run dev &
sleep 4
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:4321/ir/elementos-de-ia
kill %1
```
Expected: `302 https://www.elementsofai.com/es` (the course's `officialUrl`, since it has no `affiliateUrl` yet).

- [ ] **Step 4: Commit**

```bash
git add src/pages/ir/[slug].ts
git commit -m "feat(cursos): resolve courses in /ir/[slug] (tools→cursos lookup) (#64)"
```

---

### Task 13: Prove the build-time slug-collision guard works

The guard (`assertNoSlugCollision`, called in `/cursos/index.astro`) already runs every build. Verify it actually fails on a collision.

- [ ] **Step 1: Create a colliding course slug**

Pick any existing tool slug:
```bash
ls src/content/tools | head -1   # e.g. adobe-firefly.json
```
Create `src/content/cursos/adobe-firefly.json` (copy `elementos-de-ia.json`, keep `officialUrl`).

- [ ] **Step 2: Build and confirm it fails with the guard message**

Run: `npm run build`
Expected: FAIL with `[cursos] Colisión de slug con herramientas en /ir: adobe-firefly. ...`

- [ ] **Step 3: Remove the colliding file and confirm green**

```bash
rm src/content/cursos/adobe-firefly.json
npm run build
```
Expected: PASS. (Nothing to commit — this was a temporary probe.) Issue #64 done.

---

## Issue #65 — Starter content (≥15 courses, majority free) + propio placeholder

### Task 14: Author the course catalog

**Files:**
- Create: `src/content/cursos/<slug>.json` × at least 15 (one already exists from Task 3)
- Create: `src/content/cursos/curso-express-ia-negocio.json` (the `propio` placeholder)

**Fact-checking (REQUIRED):** every course is a content claim. Before committing each JSON, open the provider's official page and verify **Tier A**: the course exists, the `officialUrl` is live, the free/paid status is correct, the level/language/duration are accurate. Write **original Spanish** descriptions (`desc`, `long`, `tagline`) — do not copy provider marketing text. If a course below turns out inaccurate or discontinued, replace it with an equivalent from the same provider/category. See `docs/blog-fact-checking-protocol.md`.

- [ ] **Step 1: Author the catalog using this template**

Per-course JSON template (fill every required field; omit optional fields you can't verify):
```json
{
  "titulo": "",
  "proveedor": "",
  "categoria": "Fundamentos de IA | IA para tu negocio | Prompts e ingeniería de prompts | Imagen y generativa | Automatización y agentes",
  "nivel": "principiante | intermedio | avanzado",
  "desc": "1 frase para la tarjeta (original, en español)",
  "long": "2-4 frases honestas: qué es y qué aprenderás (original, en español)",
  "tagline": "1 frase gancho",
  "ideal": "para quién es (sin signos de cierre; la ficha añade el punto)",
  "precio": "Gratis | Pago",
  "precioDesde": "49 € (solo si es de pago y el precio es verificable)",
  "idioma": "Español | Inglés (subtítulos ES) | …",
  "duracion": "p.ej. 6 horas / 4 semanas (si se conoce)",
  "certificado": true,
  "tipo": "externo",
  "officialUrl": "https://… (página oficial del proveedor)",
  "color": "#0040FF",
  "orden": 20,
  "actualizado": "2026-06-25"
}
```

- [ ] **Step 2: Target catalog (≥15, MAJORITY GRATIS, spread across the 5 categories)**

Suggested starting set — **verify each before committing** and adjust as needed. Aim for ≥9 `Gratis`. (`elementos-de-ia` already done in Task 3.)

| slug | título (aprox.) | proveedor | categoría | nivel | precio |
|---|---|---|---|---|---|
| `ai-for-everyone` | AI for Everyone | DeepLearning.AI (Coursera) | Fundamentos de IA | principiante | Gratis (audit) |
| `google-ai-essentials` | Google AI Essentials | Google (Coursera) | IA para tu negocio | principiante | Gratis (audit) |
| `intro-ia-generativa-google` | Introduction to Generative AI | Google Cloud | Fundamentos de IA | principiante | Gratis |
| `generative-ai-for-beginners-ms` | Generative AI for Beginners | Microsoft | IA para tu negocio | principiante | Gratis |
| `prompt-engineering-chatgpt-dlai` | ChatGPT Prompt Engineering for Developers | DeepLearning.AI | Prompts e ingeniería de prompts | intermedio | Gratis |
| `anthropic-prompt-tutorial` | Prompt Engineering Interactive Tutorial | Anthropic | Prompts e ingeniería de prompts | intermedio | Gratis |
| `ml-crash-course-google` | Machine Learning Crash Course | Google | Fundamentos de IA | intermedio | Gratis |
| `huggingface-nlp-course` | Hugging Face NLP Course | Hugging Face | Automatización y agentes | avanzado | Gratis |
| `fastai-practical-dl` | Practical Deep Learning for Coders | fast.ai | Automatización y agentes | avanzado | Gratis |
| `platzi-curso-ia` | Curso de Inteligencia Artificial | Platzi | IA para tu negocio | principiante | Pago |
| `domestika-ia-imagen` | IA generativa para crear imágenes | Domestika | Imagen y generativa | principiante | Pago |
| `udemy-midjourney` | Midjourney de cero a experto | Udemy | Imagen y generativa | principiante | Pago |
| `coursera-prompt-engineering-vu` | Prompt Engineering Specialization | Vanderbilt (Coursera) | Prompts e ingeniería de prompts | intermedio | Pago |
| `linkedin-ia-productividad` | IA para la productividad | LinkedIn Learning | IA para tu negocio | principiante | Pago |
| `make-automatizacion-ia` | Automatización con IA (Make) | Make Academy | Automatización y agentes | intermedio | Gratis |

- [ ] **Step 3: Author the `propio` placeholder**

`src/content/cursos/curso-express-ia-negocio.json` — own product, featured, placeholder Gumroad URL (replace with the live link when ready). The `superRefine` requires `gumroadUrl` for `tipo: "propio"`, so a placeholder URL must be present:
```json
{
  "titulo": "Curso Express: IA para tu negocio en un fin de semana",
  "proveedor": "AgentesVA",
  "categoria": "IA para tu negocio",
  "nivel": "principiante",
  "desc": "Nuestro curso práctico para implementar IA en tu negocio sin tecnicismos.",
  "long": "Un curso express y muy práctico de AgentesVA: en un fin de semana montas tus primeros flujos de IA para vender más, atender mejor y ahorrar horas. Sin teoría de relleno, con plantillas y prompts listos para copiar.",
  "tagline": "De cero a tu primera automatización con IA, en un fin de semana.",
  "ideal": "Dueños de PyME y autónomos que quieren resultados rápidos sin programar",
  "precio": "Pago",
  "precioDesde": "49 €",
  "idioma": "Español",
  "duracion": "Aprox. 6 horas",
  "certificado": false,
  "tipo": "propio",
  "officialUrl": "https://agentesva.com/curso/curso-express-ia-negocio",
  "gumroadUrl": "https://agentesva.gumroad.com/l/PLACEHOLDER",
  "color": "#0040FF",
  "orden": 1,
  "destacado": true,
  "actualizado": "2026-06-25"
}
```
> ⚠️ `gumroadUrl` is a **placeholder**. Wire the real Gumroad product link here before launch. `log()`/note this clearly in the PR description so it isn't forgotten.

- [ ] **Step 4: Verify count, majority-free, and build**

Run:
```bash
ls src/content/cursos/*.json | wc -l                                   # expect ≥ 16
grep -l '"precio": "Gratis"' src/content/cursos/*.json | wc -l         # expect ≥ 9 (majority)
npm run build
```
Expected: ≥16 files, ≥9 free, build PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/cursos
git commit -m "content(cursos): starter catalog (≥15, mayoría gratis) + curso propio placeholder (#65)"
```

---

## Issue #66 — SEO gate

### Task 15: Validate structured data + canonical + sitemap

- [ ] **Step 1: Build and confirm sitemap + canonical**

Run:
```bash
npm run build
grep -o '/cursos' dist/sitemap-0.xml | head -1
grep -o '/curso/elementos-de-ia' dist/sitemap-0.xml | head -1
grep -c 'rel="canonical"' dist/cursos/index.html      # expect 1
grep -c '"@type":"Course"' dist/curso/elementos-de-ia/index.html   # expect 1
grep -c '/ir/' dist/sitemap-0.xml                     # expect 0 (affiliate excluded)
```
Expected: `/cursos` and `/curso/elementos-de-ia` present in sitemap; one canonical on the listing; one `Course` on the ficha; zero `/ir/` in the sitemap.

- [ ] **Step 2: Rich Results Test (manual, external)**

For one ficha and the listing, paste the rendered HTML (or the deployed preview URL) into https://search.google.com/test/rich-results and confirm **no errors** for `Course`, `BreadcrumbList`, and `FAQPage`. Record the result in the PR description.

- [ ] **Step 3: Lighthouse SEO ≥ 95**

With `npm run dev` running, audit `/cursos` and one ficha. Use the chrome-devtools MCP `lighthouse_audit` tool (categories: `seo`) if available, else Chrome DevTools → Lighthouse manually. Expected: SEO ≥ 95 on both. Fix any flagged issue (missing meta, non-crawlable link, etc.) and re-run.

- [ ] **Step 4: Commit any SEO fixes**

```bash
git add -A
git commit -m "fix(cursos): SEO gate — structured data + canonical + Lighthouse ≥95 (#66)"
```

Issue #66 done.

---

## Final: open the PR

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin feat/cursos-directory
gh pr create --title "feat(cursos): directorio de cursos de IA (pilar SEO, épico #54)" --body "$(cat <<'EOF'
Implementa `/cursos` clonando la arquitectura del directorio #50.

Cierra #62 #63 #64 #65 #66 (épico #54).

## Incluye
- Colección `cursos` + `cursosCategorias` (Zod), helpers `data/cursos.ts`.
- Rutas `/cursos`, `/cursos/[categoria]`, `/curso/[slug]` (singular).
- Filtros nivel + precio + búsqueda; JSON-LD `Course`/`ItemList`/`Breadcrumb`/`FAQ`.
- `/ir/[slug]` resuelve cursos (tools→cursos) + guard de unicidad de slug en build.
- Catálogo de arranque (≥15, mayoría gratis) + 1 curso propio (Gumroad).
- Enlace `/cursos` en la navegación.

## ⚠️ Antes de lanzar
- [ ] Sustituir `gumroadUrl` placeholder en `curso-express-ia-negocio.json` por el enlace real de Gumroad.
- [ ] Añadir `affiliateUrl` por ficha a medida que se aprueben programas de afiliados.

## Verificación
- `npm run build` verde · Rich Results (Course/Breadcrumb/FAQ) sin errores · Lighthouse SEO ≥95 · `/ir/[slug]` 302 para curso externo.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Update roadmap #55** — tick #62–#66 and mark #54 complete once merged.

---

## Self-review (completed by plan author)

- **Spec coverage:** Data model (A)→Task 1–2; categories (A)→Task 3; routes (B)→Tasks 5/8/9; CTA routing (C)→Task 5; `/ir` + guard (D)→Tasks 8/12/13; components/helpers (E)→Tasks 2/4/7; SEO/schema + nav (F)→Tasks 5/8/9/10/15; starter content (G)→Task 14; issue mapping (H)→phase headers. All acceptance criteria map to a verify step. ✅
- **Placeholder scan:** No "TBD/TODO" in steps. The Gumroad `gumroadUrl` placeholder and the course-catalog "verify each" are intentional, flagged design decisions (Gumroad link is wired post-launch; content must be Tier-A fact-checked), not plan gaps. ✅
- **Type consistency:** `Curso`, `toCurso`, `getAlternativesCursos`, `fallbackFaqsCurso`, `assertNoSlugCollision`, `PRECIO_COLOR`, `nivelLabel` are defined in Task 2 and used with identical signatures in Tasks 4/5/8/9. Collection keys `cursos`/`cursosCategorias` and dirs `src/content/cursos`/`src/content/cursos-categorias` match across config, pages, and content tasks. Card data-attrs (`data-cat/data-nivel/data-precio/data-search`) match the filter script selectors and the chip `data-chip` values (`Todas`/`Todos`/`Gratis`/`Pago`/`principiante`…). ✅
