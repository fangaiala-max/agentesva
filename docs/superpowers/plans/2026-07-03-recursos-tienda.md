# /recursos (tienda de packs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/recursos`, the value-ladder layer-3 store (Authority.md model): a single storefront mixing free + paid packs (prompts, skills, plantillas, cursos), delivered via Gumroad, cloning the proven `/cursos` architecture.

**Architecture:** New `recursos` + `recursosCategorias` content collections (Zod, JSON glob, filename = slug). Three SSG routes — `/recursos` (filterable listing), `/recursos/[categoria]`, `/recurso/[slug]` (ficha). A 3-way delivery CTA (Pago→Gumroad, Gratis+downloadUrl→download, Gratis+gated→/newsletter) enforced by a `superRefine`. `/ir/[slug]` extended to resolve recursos (after cursos) with a build-time slug-collision guard. `Product` JSON-LD with **real** `offers`. The global Pagefind search gains a "Recurso" type (chip + badge). Seeded with 2 real items.

**Tech Stack:** Astro 5/6 SSG + `@astrojs/vercel`, Zod 4, `@astrojs/sitemap`, Pagefind, vanilla TS. No unit-test framework — the gate is `npm run build` (Zod + types), dev-server/`curl`, Rich Results, Lighthouse.

**Branch:** `feat/recursos-tienda` (already created).

**Spec:** [`docs/superpowers/specs/2026-07-03-recursos-tienda-design.md`](../specs/2026-07-03-recursos-tienda-design.md)

### Testing approach (read first)

No Jest/Vitest. Gates: **`npm run build`** (Astro runs Zod over every JSON + type-checks; the `postbuild` regenerates the Pagefind index); **dev-server `curl`/grep** for rendered HTML/JSON-LD/redirects; **Rich Results + Lighthouse** for the SEO gate. With the Vercel adapter, built static HTML lives under **`dist/client/...`** (not `dist/...`) and the served output at `.vercel/output/static`. Commit after each task.

---

## Phase 1 — Collection + data + ficha (tracer bullet)

### Task 1: Add `recursos` + `recursosCategorias` collections

**Files:** Modify `src/content.config.ts`

- [ ] **Step 1: Insert both collections before the `export const collections` line** (after the `cursosCategorias` block)
```ts
const recursos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/recursos' }),
  schema: z
    .object({
      titulo: z.string(),
      tipo: z.enum(['prompts', 'skill', 'plantilla', 'curso']),
      categoria: z.string(),
      desc: z.string(),
      long: z.string(),
      tagline: z.string(),
      ideal: z.string(),
      formato: z.string(),
      precio: z.enum(['Gratis', 'Pago']),
      precioDesde: z.string().optional(),
      gumroadUrl: z.string().url().optional(),
      downloadUrl: z.string().optional(),
      gated: z.boolean().default(false),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      orden: z.number().int(),
      destacado: z.boolean().default(false),
      actualizado: z.string(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    })
    .superRefine((d, ctx) => {
      if (d.precio === 'Pago' && !d.gumroadUrl) {
        ctx.addIssue({ code: 'custom', message: 'Un recurso de pago requiere gumroadUrl.', path: ['gumroadUrl'] });
      }
      if (d.precio === 'Gratis' && !d.downloadUrl && !d.gated) {
        ctx.addIssue({ code: 'custom', message: 'Un recurso gratis requiere downloadUrl o gated:true.', path: ['downloadUrl'] });
      }
    }),
});

const recursosCategorias = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/recursos-categorias' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    orden: z.number().int(),
  }),
});
```

- [ ] **Step 2: Register in the export** — replace the `export const collections = { … }` line, appending `recursos, recursosCategorias`:
```ts
export const collections = { tools, categories, estudios, noticias, cursos, cursosCategorias, recursos, recursosCategorias };
```

- [ ] **Step 3: Build (empty collections are valid; dirs created in Task 3)** — `npm run build`. If it errors on a missing base dir, do Task 3 first then re-run.

- [ ] **Step 4: Commit**
```bash
git add src/content.config.ts
git commit -m "feat(recursos): add recursos + recursosCategorias content collections"
```

---

### Task 2: Data helpers `src/data/recursos.ts`

**Files:** Create `src/data/recursos.ts`

- [ ] **Step 1: Write the module**
```ts
// Tipos + constantes + helpers de la tienda. Los DATOS viven en content
// collections (`src/content/recursos`, `src/content/recursos-categorias`).
import type { CollectionEntry } from 'astro:content';

export type Precio = 'Gratis' | 'Pago';
export type TipoRecurso = 'prompts' | 'skill' | 'plantilla' | 'curso';

export interface Recurso {
  slug: string;
  titulo: string;
  tipo: TipoRecurso;
  categoria: string;
  desc: string;
  long: string;
  tagline: string;
  ideal: string;
  formato: string;
  precio: Precio;
  precioDesde?: string;
  gumroadUrl?: string;
  downloadUrl?: string;
  gated: boolean;
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

const TIPO_LABEL: Record<TipoRecurso, string> = {
  prompts: 'Prompts',
  skill: 'Skill',
  plantilla: 'Plantilla',
  curso: 'Curso',
};
export function tipoLabel(t: TipoRecurso): string {
  return TIPO_LABEL[t];
}

// Normaliza una entrada de la colección `recursos` a Recurso (id → slug).
export function toRecurso(entry: CollectionEntry<'recursos'>): Recurso {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternativesRecursos(all: Recurso[], recurso: Recurso): Recurso[] {
  return all.filter((r) => r.categoria === recurso.categoria && r.slug !== recurso.slug).slice(0, 3);
}

// FAQs de respaldo (cuando no hay faq curadas). Visibles + emitidas como FAQPage.
export function fallbackFaqsRecurso(recurso: Recurso): { q: string; a: string }[] {
  const precio =
    recurso.precio === 'Gratis'
      ? `Sí, ${recurso.titulo} es gratis.`
      : `${recurso.titulo} es de pago${recurso.precioDesde ? ` (desde ${recurso.precioDesde})` : ''}.`;
  return [
    { q: `¿Qué incluye ${recurso.titulo}?`, a: recurso.long },
    { q: `¿${recurso.titulo} es gratis?`, a: precio },
    { q: `¿Para quién es ${recurso.titulo}?`, a: `Ideal para ${recurso.ideal}.` },
    { q: `¿En qué formato está ${recurso.titulo}?`, a: recurso.formato + '.' },
  ];
}

// Guard de build: ningún slug de recurso puede chocar con uno ya usado en /ir
// (herramientas + cursos), porque comparten el endpoint /ir/[slug].
export function assertNoSlugCollision(existingSlugs: string[], recursoSlugs: string[]): void {
  const existing = new Set(existingSlugs);
  const dup = recursoSlugs.filter((s) => existing.has(s));
  if (dup.length) {
    throw new Error(
      `[recursos] Colisión de slug con herramientas/cursos en /ir: ${dup.join(', ')}. Renombra el JSON del recurso.`,
    );
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/data/recursos.ts
git commit -m "feat(recursos): Recurso type + helpers (toRecurso, alternatives, fallback FAQs, slug guard)"
```

---

### Task 3: Seed categories + the 2 real items

**Files:**
- Create `src/content/recursos-categorias/{ventas-marketing,atencion-cliente,productividad,contenido,desarrollo-ia}.json`
- Create `src/content/recursos/pack-30-prompts.json`
- Create `src/content/recursos/curso-seguridad-llm.json`

- [ ] **Step 1: Write the 5 category files** (each `{nombre, descripcion, orden}`)

`ventas-marketing.json`:
```json
{ "nombre": "Ventas y marketing", "descripcion": "Prompts y plantillas para vender, captar y convertir con IA.", "orden": 10 }
```
`atencion-cliente.json`:
```json
{ "nombre": "Atención al cliente", "descripcion": "Automatiza y mejora la atención con prompts y skills de IA.", "orden": 20 }
```
`productividad.json`:
```json
{ "nombre": "Productividad", "descripcion": "Recursos para ahorrar horas: escritura, resúmenes y tareas repetitivas.", "orden": 30 }
```
`contenido.json`:
```json
{ "nombre": "Contenido", "descripcion": "Crea contenido más rápido: redes, blog, email y guiones.", "orden": 40 }
```
`desarrollo-ia.json`:
```json
{ "nombre": "Desarrollo con IA", "descripcion": "Para quien construye con LLMs: skills, prompts técnicos y cursos.", "orden": 50 }
```

- [ ] **Step 2: Write the free seed** `src/content/recursos/pack-30-prompts.json` (gated → newsletter, reuses the existing PDF)
```json
{
  "titulo": "Pack de 30 prompts de IA para tu negocio",
  "tipo": "prompts",
  "categoria": "Productividad",
  "desc": "30 prompts listos para copiar y usar hoy en tu negocio, sin ser experto.",
  "long": "Una colección de 30 prompts probados para las tareas más comunes de una PyME: escribir emails, resumir reuniones, crear publicaciones, atender clientes y ahorrar horas cada semana. Cópialos, pégalos y adáptalos a tu caso. En PDF.",
  "tagline": "Empieza a usar la IA hoy con 30 prompts listos para copiar.",
  "ideal": "Dueños de PyME y autónomos que quieren resultados rápidos sin complicarse",
  "formato": "PDF · 30 prompts",
  "precio": "Gratis",
  "gated": true,
  "color": "#4ec98a",
  "orden": 10,
  "destacado": true,
  "actualizado": "2026-07-03"
}
```

- [ ] **Step 3: Write the paid flagship** `src/content/recursos/curso-seguridad-llm.json` (the course, cross-listed)
```json
{
  "titulo": "Curso: Seguridad de LLMs (defensa contra prompt injection)",
  "tipo": "curso",
  "categoria": "Desarrollo con IA",
  "desc": "El único curso en español dedicado a proteger tus apps de IA del prompt injection.",
  "long": "Mini-curso práctico para desarrolladores: ataca una app RAG en un laboratorio y apréndela a defender en tres capas, con código Python que puedes copiar. 8 lecciones + laboratorio, entrega en Gumroad. Ficha completa en /curso/seguridad-llm.",
  "tagline": "Protege tu app de IA antes de que un usuario la rompa.",
  "ideal": "Desarrolladores que ya construyen chatbots, RAG o agentes con LLMs",
  "formato": "Curso · 8 lecciones + laboratorio",
  "precio": "Pago",
  "precioDesde": "19 €",
  "gumroadUrl": "https://fangaiala.gumroad.com/l/seguridad-llm",
  "color": "#5B7CFF",
  "orden": 1,
  "destacado": true,
  "actualizado": "2026-07-03"
}
```

- [ ] **Step 4: Build + prove Zod enforces delivery** — `npm run build` (green). Then temporarily set `pack-30-prompts.json` `"gated": false` (and no downloadUrl) and re-run → expect FAIL "Un recurso gratis requiere downloadUrl o gated:true"; restore `"gated": true` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/content/recursos-categorias src/content/recursos
git commit -m "content(recursos): seed 5 categorías + 2 reales (pack 30 prompts + curso estrella)"
```

---

### Task 4: `RecursoCard.astro`

**Files:** Create `src/components/RecursoCard.astro`

- [ ] **Step 1: Write it** (clone of `CourseCard`; shows `tipo · formato`, price badge with tier, links to `/recurso/[slug]`)
```astro
---
import type { Recurso } from '../data/recursos';
import { PRECIO_COLOR, tipoLabel } from '../data/recursos';

interface Props { recurso: Recurso }
const { recurso } = Astro.props;
const initial = recurso.titulo.charAt(0);
const precioColor = PRECIO_COLOR[recurso.precio];
const priceLabel = recurso.precio === 'Pago' && recurso.precioDesde ? recurso.precioDesde : recurso.precio;
const meta = `${tipoLabel(recurso.tipo)} · ${recurso.formato}`;
const search = `${recurso.titulo} ${recurso.desc} ${recurso.formato} ${recurso.categoria}`.toLowerCase();
---

<article
  class="lift recurso-card spotlight"
  data-cat={recurso.categoria}
  data-tipo={recurso.tipo}
  data-precio={recurso.precio}
  data-search={search}
  style="position: relative; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 14px;"
>
  <a href={`/recurso/${recurso.slug}`} aria-label={`Ver ${recurso.titulo}`} style="position: absolute; inset: 0; z-index: 1; border-radius: 8px;"></a>
  <div style="display: flex; align-items: flex-start; gap: 13px;">
    <div transition:name={`mono-recurso-${recurso.slug}`} style={`width: 42px; height: 42px; border-radius: 9px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 19px; color: #fff; background: ${recurso.color};`}>{initial}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-family: var(--sans); font-weight: 600; font-size: 16px; color: #fff;">{recurso.titulo}</div>
      <div style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5); margin-top: 3px;">{tipoLabel(recurso.tipo)}</div>
    </div>
    <button type="button" class="bookmark-btn" data-bookmark={recurso.slug} aria-label={`Guardar ${recurso.titulo}`} aria-pressed="false" style="position: relative; z-index: 2; background: none; border: none; cursor: pointer; padding: 6px; margin: -6px; display: flex;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--fg-5)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
    </button>
  </div>
  <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--fg-3);">{recurso.desc}</p>
  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
    <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-4);">{recurso.formato}</span>
    <span style={`font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${precioColor}; border: 1px solid var(--line-2); padding: 4px 9px; border-radius: 20px;`}>{priceLabel}</span>
  </div>
</article>
```

- [ ] **Step 2: Commit**
```bash
git add src/components/RecursoCard.astro
git commit -m "feat(recursos): RecursoCard component"
```

---

### Task 5: Ficha `/recurso/[slug].astro`

**Files:** Create `src/pages/recurso/[slug].astro`

- [ ] **Step 1: Write the ficha** (Product JSON-LD with real offers + Pagefind markup `tipo:Recurso` + 3-way delivery CTA; reuses `initToolDetail`/`initMotion` like the curso ficha)
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import { getCollection } from 'astro:content';
import { toRecurso, getAlternativesRecursos, fallbackFaqsRecurso, PRECIO_COLOR, tipoLabel, type Recurso } from '../../data/recursos';
import { jsonLdSerialize } from '../../data/schema';

export async function getStaticPaths() {
  const recursos = (await getCollection('recursos')).map(toRecurso).sort((a, b) => a.orden - b.orden);
  return recursos.map((recurso) => ({
    params: { slug: recurso.slug },
    props: { recurso, alts: getAlternativesRecursos(recursos, recurso) },
  }));
}

interface Props { recurso: Recurso; alts: Recurso[] }
const { recurso, alts } = Astro.props;
const initial = recurso.titulo.charAt(0);
const precioColor = PRECIO_COLOR[recurso.precio];
const site = 'https://agentesva.com';
const faqs = recurso.faq?.length ? recurso.faq : fallbackFaqsRecurso(recurso);
// Precio numérico para offers (real; "0" para gratis).
const priceNum = recurso.precio === 'Gratis' ? '0' : (recurso.precioDesde || '').replace(/[^0-9,.]/g, '').replace(',', '.') || '0';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      name: recurso.titulo,
      description: recurso.long,
      brand: { '@type': 'Organization', name: 'AgentesVA' },
      category: recurso.categoria,
      offers: {
        '@type': 'Offer',
        price: priceNum,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${site}/recurso/${recurso.slug}`,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${site}/recursos` },
        { '@type': 'ListItem', position: 3, name: recurso.titulo, item: `${site}/recurso/${recurso.slug}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

// CTA por vía de entrega.
const cta =
  recurso.precio === 'Pago'
    ? { href: recurso.gumroadUrl, label: `Comprar${recurso.precioDesde ? ` · ${recurso.precioDesde}` : ''} →`, rel: 'noopener', download: false, newtab: true }
    : recurso.downloadUrl
      ? { href: recurso.downloadUrl, label: 'Descargar gratis →', rel: 'noopener', download: true, newtab: false }
      : { href: '/newsletter', label: 'Descárgalo gratis · Suscríbete →', rel: '', download: false, newtab: false };
---

<BaseLayout
  title={`${recurso.titulo} — ${recurso.tagline} | AgentesVA`}
  description={`${recurso.desc} ${tipoLabel(recurso.tipo)} de AgentesVA.`}
>
  <script type="application/ld+json" set:html={jsonLdSerialize(jsonLd)} />
  <SiteHeader />

  <main
    data-pagefind-body
    data-pagefind-filter="tipo:Recurso"
    data-pagefind-meta="tipo:Recurso"
    style="max-width: 1080px; margin: 0 auto; padding: 32px 32px 64px;"
  >
    <a href="/recursos" data-pagefind-ignore class="navlink" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">← Volver a recursos</a>

    <div style="display: flex; align-items: flex-start; gap: 22px; margin-top: 26px; border-bottom: 1px solid var(--line); padding-bottom: 32px; flex-wrap: wrap;">
      <div transition:name={`mono-recurso-${recurso.slug}`} style={`width: 74px; height: 74px; border-radius: 16px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 33px; color: #fff; background: ${recurso.color};`}>{initial}</div>
      <div style="flex: 1; min-width: 220px;">
        <div style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);">{recurso.categoria}</div>
        <h1 style="font-family: var(--sans); font-weight: 700; font-size: clamp(30px, 6vw, 40px); letter-spacing: -0.03em; margin: 6px 0 0; color: #fff;">{recurso.titulo}</h1>
        <p style="font-size: 16.5px; line-height: 1.5; color: var(--fg-3); margin: 8px 0 0; max-width: 34em;">{recurso.tagline}</p>
        <div style="display: flex; gap: 14px; align-items: center; margin-top: 16px; flex-wrap: wrap;">
          <span style="font-family: var(--mono); font-size: 12px; color: var(--fg-2);">{tipoLabel(recurso.tipo)} · {recurso.formato}</span>
          <span style={`font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${precioColor}; border: 1px solid var(--line-2); padding: 4px 10px; border-radius: 20px;`}>{recurso.precio}{recurso.precioDesde ? ` · ${recurso.precioDesde}` : ''}</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; flex: none;">
        <a href={cta.href} target={cta.newtab ? '_blank' : undefined} rel={cta.rel || undefined} download={cta.download || undefined} class="lift shimmer" style="background: var(--accent); color: var(--bg); border: none; padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; text-decoration: none; text-align: center; white-space: nowrap;">{cta.label}</a>
        <button type="button" id="save-btn" data-slug={recurso.slug} aria-pressed="false" style="background: var(--panel-2); color: var(--fg-2); border: 1px solid var(--line-2); padding: 13px 24px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap;"><span id="save-label">Guardar</span></button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 44px; margin-top: 38px;">
      <div>
        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Qué es</h2>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 14px 0 0;">{recurso.long}</p>

        <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 36px 0 0;">Para quién es</h2>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 14px 0 0;">{recurso.ideal}.</p>

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
            <span style="font-size: 13px; color: var(--fg-4);">Tipo</span><span style="font-size: 13.5px; color: #fff;">{tipoLabel(recurso.tipo)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line);">
            <span style="font-size: 13px; color: var(--fg-4);">Formato</span><span style="font-size: 13.5px; color: #fff;">{recurso.formato}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 13px 0;">
            <span style="font-size: 13px; color: var(--fg-4);">Precio</span><span style="font-size: 13.5px; color: #fff;">{recurso.precio}{recurso.precioDesde ? ` · ${recurso.precioDesde}` : ''}</span>
          </div>
        </div>

        {alts.length > 0 && (
          <div data-pagefind-ignore style="border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 22px;">
            <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-5);">Otros recursos</span>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 14px;">
              {alts.map((a) => (
                <a href={`/recurso/${a.slug}`} class="lift" style="display: flex; align-items: center; gap: 12px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px; text-decoration: none;">
                  <span style={`width: 34px; height: 34px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 15px; color: #fff; background: ${a.color};`}>{a.titulo.charAt(0)}</span>
                  <span style="flex: 1;">
                    <span style="display: block; font-family: var(--sans); font-weight: 600; font-size: 14px; color: #fff;">{a.titulo}</span>
                    <span style="display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5); margin-top: 2px;">{tipoLabel(a.tipo)} · {a.precio}</span>
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

- [ ] **Step 2: Build + render-check** — `npm run build`. Serve and grep:
```bash
grep -c '"@type":"Product"' dist/client/recurso/pack-30-prompts/index.html   # expect 1
grep -o 'Descárgalo gratis · Suscríbete' dist/client/recurso/pack-30-prompts/index.html | head -1
grep -o 'Comprar · 19 €' dist/client/recurso/curso-seguridad-llm/index.html | head -1
```
Expected: Product JSON-LD present; free-item CTA → suscríbete; paid-item CTA → Comprar · 19 €.

- [ ] **Step 3: Commit**
```bash
git add "src/pages/recurso/[slug].astro"
git commit -m "feat(recursos): /recurso/[slug] ficha (Product JSON-LD + 3-way delivery CTA + pagefind)"
```

---

## Phase 2 — Listing + category + nav

### Task 6: Listing `/recursos/index.astro`

**Files:** Create `src/pages/recursos/index.astro`

- [ ] **Step 1: Clone the cursos listing and transform it.** Copy `src/pages/cursos/index.astro` to `src/pages/recursos/index.astro`, then apply ALL of these exact substitutions (they mirror the cursos listing — same client filter script `initCursos`? NO: it uses `curso`-scoped ids. Use the SAME generic filter by giving recursos its own ids and reusing the cursos filter mechanism). Concretely, write the file as:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import RecursoCard from '../../components/RecursoCard.astro';
import { getCollection } from 'astro:content';
import { toRecurso, assertNoSlugCollision } from '../../data/recursos';
import { jsonLdSerialize } from '../../data/schema';

const recursos = (await getCollection('recursos'))
  .map(toRecurso)
  .sort((a, b) => Number(b.destacado) - Number(a.destacado) || a.orden - b.orden);
const cats = (await getCollection('recursosCategorias')).sort((a, b) => a.data.orden - b.data.orden);

// Guard de build: slugs de recursos únicos frente a herramientas + cursos (comparten /ir).
const toolSlugs = (await getCollection('tools')).map((t) => t.id);
const cursoSlugs = (await getCollection('cursos')).map((c) => c.id);
assertNoSlugCollision([...toolSlugs, ...cursoSlugs], recursos.map((r) => r.slug));

const CATEGORIES = ['Todas', ...cats.map((c) => c.data.nombre)];
const TIPOS = [
  { v: 'Todos', label: 'Todos' },
  { v: 'prompts', label: 'Prompts' },
  { v: 'skill', label: 'Skills' },
  { v: 'plantilla', label: 'Plantillas' },
  { v: 'curso', label: 'Cursos' },
];
const PRECIOS = ['Todos', 'Gratis', 'Pago'];
const site = 'https://agentesva.com';

const chipBase = 'font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; border-radius: 30px;';
const chipOn = 'background: var(--accent); color: var(--bg); border: 1px solid var(--accent);';
const chipOff = 'background: transparent; color: var(--fg-3); border: 1px solid var(--line-2);';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'CollectionPage', name: 'Recursos de IA', description: 'Packs de prompts, skills y plantillas de IA en español, gratis y de pago.', url: `${site}/recursos`, inLanguage: 'es' },
    { '@type': 'ItemList', itemListElement: recursos.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site}/recurso/${r.slug}`, name: r.titulo })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${site}/recursos` },
    ] },
  ],
};
---

<BaseLayout
  title="Recursos de IA — packs de prompts, skills y plantillas | AgentesVA"
  description="Packs de prompts, skills y plantillas de IA en español, gratis y de pago. Copia, pega y aplica hoy en tu negocio."
>
  <script type="application/ld+json" set:html={jsonLdSerialize(jsonLd)} />
  <SiteHeader />

  <main style="max-width: 1200px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
      <a href="/" class="navlink" style="color: var(--fg-4); text-decoration: none;">Inicio</a> <span aria-hidden="true">/</span> Recursos
    </nav>

    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 18px;">
      <h1 style="font-family: var(--serif); font-weight: 400; font-size: clamp(30px, 5vw, 44px); letter-spacing: -0.03em; margin: 0; color: #fff;">Recursos de IA</h1>
      <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5);"><span id="recurso-count" style="color: var(--accent);">{recursos.length}</span> resultados</span>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: var(--fg-3); margin: 12px 0 0; max-width: 42em;">Packs de prompts, skills y plantillas para usar la IA hoy. Empieza con los gratis; sube de nivel con los de pago.</p>

    <form id="recurso-search-form" role="search" class="searchwrap" style="display: flex; align-items: center; gap: 12px; max-width: 560px; margin: 24px 0 0; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 4px; padding: 4px 4px 4px 18px; transition: border-color .25s, box-shadow .25s;">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--fg-5)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
      <label for="recurso-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Buscar recursos</label>
      <input id="recurso-search" type="search" autocomplete="off" placeholder="Busca: prompts de ventas, skill de atención…" style="flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--sans); font-size: 15px; padding: 12px 0;">
    </form>

    <div role="group" aria-label="Filtrar por categoría" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px;">
      {CATEGORIES.map((c, i) => (
        <button type="button" class="chip cat-chip" data-chip={c} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{c}</button>
      ))}
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 18px 28px; margin-top: 12px;">
      <div role="group" aria-label="Filtrar por tipo" style="display: flex; flex-wrap: wrap; gap: 8px;">
        {TIPOS.map((t, i) => (
          <button type="button" class="chip tipo-chip" data-chip={t.v} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{t.label}</button>
        ))}
      </div>
      <div role="group" aria-label="Filtrar por precio" style="display: flex; flex-wrap: wrap; gap: 8px;">
        {PRECIOS.map((p, i) => (
          <button type="button" class="chip precio-chip" data-chip={p} aria-pressed={i === 0 ? 'true' : 'false'} style={`${chipBase} ${i === 0 ? chipOn : chipOff}`}>{p}</button>
        ))}
      </div>
    </div>

    <div id="recurso-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 28px;">
      {recursos.map((recurso) => <RecursoCard recurso={recurso} />)}
    </div>
    <div id="recurso-empty" hidden style="border: 1px dashed var(--line-2); border-radius: 8px; padding: 56px 24px; text-align: center; margin-top: 28px;">
      <p style="font-family: var(--sans); font-weight: 600; font-size: 18px; color: #fff; margin: 0;">Sin resultados</p>
      <p style="font-size: 14px; color: var(--fg-5); margin: 8px 0 0;">Prueba otra palabra o cambia los filtros.</p>
    </div>

    <section style="margin-top: 56px; border-top: 1px solid var(--line); padding-top: 28px;">
      <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Explora por categoría</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">
        {cats.map((c) => (
          <a href={`/recursos/${c.id}`} class="lift" style="font-family: var(--mono); font-size: 12px; color: var(--fg-2); background: var(--panel); border: 1px solid var(--line); border-radius: 30px; padding: 9px 16px; text-decoration: none;">{c.data.nombre}</a>
        ))}
      </div>
    </section>
  </main>

  <SiteFooter />
</BaseLayout>

<script>
  import { initRecursos } from '../../scripts/recursos';
  import { initMotion } from '../../scripts/motion';
  document.addEventListener('astro:page-load', () => { initRecursos(); initMotion(); });
</script>
```

- [ ] **Step 2: Create the client filter script** `src/scripts/recursos.ts` — copy `src/scripts/cursos.ts` verbatim, then change ONLY the DOM ids/classes: `#curso-search`→`#curso-search` **stays generic?** No — replace `curso-search`→`recurso-search`, `curso-search-form`→`recurso-search-form`, `curso-grid`→`recurso-grid`, `curso-empty`→`recurso-empty`, `curso-count`→`recurso-count`, `.curso-card`→`.recurso-card`, and the chip classes stay `.cat-chip`/`.nivel-chip`/`.precio-chip` — BUT the middle group is `tipo`, not `nivel`: change `.nivel-chip`→`.tipo-chip` and the card dataset read `data-nivel`→`data-tipo`, and rename the export `initCursos`→`initRecursos`. Everything else (bookmarks, chip logic, debounce) identical. (Open `src/scripts/cursos.ts` and do exactly these renames.)

- [ ] **Step 3: Build + verify** — `npm run build`. Serve and:
```bash
grep -o 'class="chip tipo-chip"' dist/client/recursos/index.html | head -1
grep -o 'id="recurso-grid"' dist/client/recursos/index.html | head -1
```
Expected both match; build green.

- [ ] **Step 4: Commit**
```bash
git add src/pages/recursos/index.astro src/scripts/recursos.ts
git commit -m "feat(recursos): /recursos listing + client filter (tipo+precio+search) + slug guard"
```

---

### Task 7: Category page `/recursos/[categoria].astro`

**Files:** Create `src/pages/recursos/[categoria].astro`

- [ ] **Step 1: Write it** (clone of `cursos/[categoria].astro`)
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/SiteHeader.astro';
import SiteFooter from '../../components/SiteFooter.astro';
import RecursoCard from '../../components/RecursoCard.astro';
import { getCollection } from 'astro:content';
import { toRecurso, type Recurso } from '../../data/recursos';
import { jsonLdSerialize } from '../../data/schema';

export async function getStaticPaths() {
  const recursos = (await getCollection('recursos')).map(toRecurso).sort((a, b) => a.orden - b.orden);
  const cats = await getCollection('recursosCategorias');
  return cats.map((cat) => ({
    params: { categoria: cat.id },
    props: {
      nombre: cat.data.nombre,
      descripcion: cat.data.descripcion,
      recursos: recursos.filter((r) => r.categoria === cat.data.nombre),
    },
  }));
}

interface Props { nombre: string; descripcion: string; recursos: Recurso[] }
const { nombre, descripcion, recursos } = Astro.props;
const site = 'https://agentesva.com';
const slug = Astro.params.categoria;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'CollectionPage', name: `Recursos de IA · ${nombre}`, description: descripcion, url: `${site}/recursos/${slug}`, inLanguage: 'es' },
    { '@type': 'ItemList', itemListElement: recursos.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site}/recurso/${r.slug}`, name: r.titulo })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${site}/recursos` },
      { '@type': 'ListItem', position: 3, name: nombre, item: `${site}/recursos/${slug}` },
    ] },
  ],
};
---

<BaseLayout title={`Recursos de IA de ${nombre} | AgentesVA`} description={`${descripcion} ${recursos.length} recursos de IA de ${nombre}, en español.`}>
  <script type="application/ld+json" set:html={jsonLdSerialize(jsonLd)} />
  <SiteHeader />
  <main style="max-width: 1200px; margin: 0 auto; padding: 40px 32px 64px;">
    <nav aria-label="Migas" style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5);">
      <a href="/" class="navlink" style="color: var(--fg-4); text-decoration: none;">Inicio</a> <span aria-hidden="true">/</span>
      <a href="/recursos" class="navlink" style="color: var(--fg-4); text-decoration: none;">Recursos</a> <span aria-hidden="true">/</span> {nombre}
    </nav>
    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 18px;">
      <h1 style="font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 5vw, 40px); letter-spacing: -0.03em; margin: 0; color: #fff;">Recursos de IA · {nombre}</h1>
      <span style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-5);"><span style="color: var(--accent);">{recursos.length}</span> recursos</span>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: var(--fg-3); margin: 12px 0 0; max-width: 42em;">{descripcion}</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-top: 28px;">
      {recursos.map((recurso) => <RecursoCard recurso={recurso} />)}
    </div>
    <a href="/recursos" class="navlink" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 36px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-4); text-decoration: none;">← Todos los recursos</a>
  </main>
  <SiteFooter />
</BaseLayout>

<script>
  import { initRecursos } from '../../scripts/recursos';
  import { initMotion } from '../../scripts/motion';
  document.addEventListener('astro:page-load', () => { initRecursos(); initMotion(); });
</script>
```

- [ ] **Step 2: Build + verify** — `npm run build`; expect `/recursos/productividad/`, `/recursos/desarrollo-ia/`, etc. generated (5 category pages, only non-empty ones have cards). Commit:
```bash
git add "src/pages/recursos/[categoria].astro"
git commit -m "feat(recursos): /recursos/[categoria] static category pages"
```

---

### Task 8: Add `/recursos` to the nav

**Files:** Modify `src/components/SiteHeader.astro`

- [ ] **Step 1: Insert the Recursos link after Cursos.** Replace:
```astro
      <a class="navlink" href="/cursos" style="color: var(--fg-4); text-decoration: none;">Cursos</a>
      <a class="navlink" href="/estudios" style="color: var(--fg-4); text-decoration: none;">Estudios</a>
```
with:
```astro
      <a class="navlink" href="/cursos" style="color: var(--fg-4); text-decoration: none;">Cursos</a>
      <a class="navlink" href="/recursos" style="color: var(--fg-4); text-decoration: none;">Recursos</a>
      <a class="navlink" href="/estudios" style="color: var(--fg-4); text-decoration: none;">Estudios</a>
```

- [ ] **Step 2: Build + verify site-wide** — `npm run build`; `grep -o 'href="/recursos"' dist/client/index.html | head -1` → match. Commit:
```bash
git add src/components/SiteHeader.astro
git commit -m "feat(recursos): add Recursos to site nav"
```

---

## Phase 3 — `/ir` extension + Pagefind "Recurso" type

### Task 9: Extend `/ir/[slug].ts` to resolve recursos

**Files:** Modify `src/pages/ir/[slug].ts`

- [ ] **Step 1: Add a recursos branch after the cursos branch** (before the final 404). Insert:
```ts
  const recurso = (await getCollection('recursos')).find((r) => r.id === slug);
  if (recurso) {
    // pago → Gumroad; gratis → descarga directa o /newsletter (con puerta).
    const dest =
      recurso.data.precio === 'Pago'
        ? (recurso.data.gumroadUrl as string)
        : (recurso.data.downloadUrl || '/newsletter');
    return redirect(dest, 'recurso', slug);
  }
```
(Update the top comment to mention recursos too.)

- [ ] **Step 2: Build + verify** — `npm run build`; serve:
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:4321/ir/curso-seguridad-llm
```
Expected `302 https://fangaiala.gumroad.com/l/seguridad-llm`. Commit:
```bash
git add "src/pages/ir/[slug].ts"
git commit -m "feat(recursos): resolve recursos in /ir/[slug]"
```

### Task 10: Prove the slug-collision guard fires

- [ ] **Step 1: Create a colliding recurso** — copy `pack-30-prompts.json` to `src/content/recursos/seguridad-llm.json` (collides with the cursos slug `seguridad-llm`).
- [ ] **Step 2: Build → expect FAIL** `[recursos] Colisión de slug con herramientas/cursos en /ir: seguridad-llm.`
- [ ] **Step 3: Remove the probe** `rm src/content/recursos/seguridad-llm.json`; `npm run build` → green. (Nothing to commit.)

### Task 11: Add "Recurso" to the global Pagefind search

**Files:** Modify `src/scripts/search.ts`, `src/pages/buscar.astro`, `src/components/SearchModal.astro`

- [ ] **Step 1: `src/scripts/search.ts`** — add a `Recurso` entry to `TYPE_META`:
```ts
  Noticia: { label: 'Noticia', color: '#ffb86b', border: '#5a4326' },
  Recurso: { label: 'Recurso', color: '#4ec98a', border: '#235' },
```

- [ ] **Step 2: `src/pages/buscar.astro`** — add the chip to the `FILTERS` array (after Noticia):
```astro
  { v: 'Noticia', label: 'Noticias' },
  { v: 'Recurso', label: 'Recursos' },
```

- [ ] **Step 3: `src/components/SearchModal.astro`** — add the same entry to its `FILTERS` array (after Noticia):
```astro
  { v: 'Noticia', label: 'Noticias' },
  { v: 'Recurso', label: 'Recursos' },
```

- [ ] **Step 4: Build + verify the recurso is indexed with tipo:Recurso** — `npm run build`; the Pagefind log "Indexed N filters" now includes `tipo` values covering Recurso. Confirm the ficha carries it:
```bash
grep -o 'data-pagefind-filter="tipo:Recurso"' dist/client/recurso/pack-30-prompts/index.html | head -1
grep -o 'data-value="Recurso"' dist/client/buscar/index.html | head -1
```
Expected both match. Commit:
```bash
git add src/scripts/search.ts src/pages/buscar.astro src/components/SearchModal.astro
git commit -m "feat(search): add Recurso type to global search (chip + badge + facet)"
```

---

## Phase 4 — SEO gate + live verification

### Task 12: SEO + structured data + Lighthouse

- [ ] **Step 1: Build + confirm sitemap/canonical/JSON-LD** — `npm run build`:
```bash
grep -o '/recursos' dist/client/sitemap-0.xml | head -1
grep -o '/recurso/pack-30-prompts' dist/client/sitemap-0.xml | head -1
python3 -c "import re,sys; h=open('dist/client/recurso/curso-seguridad-llm/index.html').read(); import json; m=re.search(r'application/ld\\+json\">(.*?)</script>',h,re.S); json.loads(m.group(1)); print('JSON-LD valid')"
grep -c 'rel="canonical"' dist/client/recursos/index.html   # expect 1
```
Expected: `/recursos` + the ficha in sitemap; JSON-LD parses; one canonical.

- [ ] **Step 2: Rich Results** — paste one ficha into https://search.google.com/test/rich-results; confirm no errors for `Product` + `BreadcrumbList` + `FAQPage`.

- [ ] **Step 3: Lighthouse SEO ≥ 95** on `/recursos` and one ficha (chrome-devtools `lighthouse_audit` or manual). Fix any flag, re-run.

- [ ] **Step 4: Live search + filter check** — serve `.vercel/output/static`; drive a browser to `/recursos`, verify the tipo/precio chips narrow the grid; open the global search, confirm the free pack appears with a green "Recurso" badge; the free ficha CTA routes to `/newsletter`, the course ficha CTA to Gumroad. Screenshot. Commit any fixes:
```bash
git add -A && git commit -m "fix(recursos): SEO gate + a11y polish" || echo "no fixes needed"
```

---

## Final: open the PR

- [ ] **Step 1: Push + PR**
```bash
git push -u origin feat/recursos-tienda
gh pr create --title "feat(recursos): tienda de packs de prompts/skills (capa 3, modelo Authority.md)" --body "$(cat <<'EOF'
Construye `/recursos`, la capa 3 del value ladder (tienda modelo Authority.md), clonando `/cursos`.

## Incluye
- Colecciones `recursos` + `recursosCategorias` (Zod, superRefine de entrega).
- Rutas `/recursos`, `/recursos/[categoria]`, `/recurso/[slug]` (singular).
- Entrega 3 vías: Pago→Gumroad, Gratis→descarga directa o puerta a /newsletter.
- JSON-LD `Product` con `offers` reales; `/ir` resuelve recursos + guard de slug.
- Búsqueda global: nuevo tipo "Recurso" (chip + badge).
- Siembra: Pack 30 prompts (gratis, con puerta) + curso Seguridad LLM (estrella de pago).

## Verificación
`npm run build` verde · Product/Breadcrumb/FAQ válidos · filtros tipo+precio · `/ir/[slug]` 302 · Lighthouse SEO ≥95.

## Fuera de alcance
Redactar packs de pago nuevos (cada uno su tarea de contenido).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
- [ ] **Step 2: After merge** — verify `/recursos` on production; the section grows by adding recurso JSONs (each pack = a content task).

---

## Self-review (plan author)

- **Spec coverage:** collections+superRefine (A)→T1/T3; data helpers (D)→T2; categories+seed (E)→T3; RecursoCard (D)→T4; ficha + 3-way CTA + Product offers + pagefind (B/C/D/F)→T5; listing+filters+guard (B)→T6; category pages (B)→T7; nav (D)→T8; /ir extension (C)→T9; slug guard proof→T10; Pagefind Recurso type (F)→T11; SEO gate + live (acceptance)→T12. ✅
- **Placeholder scan:** no TBD/TODO; clone-and-transform tasks (T6 script, cloned pages) name the exact source file + exact renames — concrete, not vague.
- **Type/contract consistency:** `Recurso`, `toRecurso`, `getAlternativesRecursos`, `fallbackFaqsRecurso`, `PRECIO_COLOR`, `tipoLabel`, `assertNoSlugCollision` defined in T2, used identically in T4/T5/T6/T7. Collection keys `recursos`/`recursosCategorias` + dirs `src/content/recursos`/`src/content/recursos-categorias` consistent across config, pages, seed. Card data-attrs (`data-tipo`/`data-precio`/`data-cat`/`data-search`) match the T6 filter script's selectors + chip `data-chip` values (`Todos`/`Gratis`/`Pago`/`prompts`/…). `tipo:Recurso` consistent across the ficha, search.ts TYPE_META, and the two FILTERS arrays. The seed course recurso slug `curso-seguridad-llm` ≠ the cursos slug `seguridad-llm` (no collision). ✅
