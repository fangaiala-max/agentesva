# Clúster SEO para IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar tres guías evergreen interconectadas sobre SEO para IA, aparición en ChatGPT y medición de visibilidad, con un CTA comercial específico al blueprint `gr22` en la tercera guía.

**Architecture:** Mantener la colección Astro `guias` y su plantilla `Article`/`FAQPage`, haciendo opcional el CTA de servicio y añadiendo un CTA de recurso resuelto desde la Biblioteca. Las dos primeras guías son editoriales y conducen a la siguiente lectura; la tercera convierte al blueprint `gr22`. El tracking añade un evento seguro y documentado para recursos sin mezclarlo con el funnel de servicios.

**Tech Stack:** Astro 7 Content Collections, TypeScript, Markdown, Zod, Vitest, GA4 declarativo mediante `data-track-*`, Stripe Payment Links centralizados.

---

## Mapa de archivos

**Crear**

- `src/components/GuideResourceCTA.astro` — resuelve y presenta un blueprint de la Biblioteca con tracking propio.
- `src/content/guias/seo-para-ia.md` — página pilar del clúster.
- `src/content/guias/como-aparecer-en-chatgpt.md` — guía de aplicación.
- `src/content/guias/medir-visibilidad-en-chatgpt.md` — guía de medición y conversión.
- `tests/seo-ai-guides.test.ts` — contrato editorial, enlaces, fuentes y CTA del clúster.
- `tests/guide-resource-cta.test.ts` — integración del CTA de recurso con schema, renderer y fuente de datos.
- `docs/fact-checks/seo-para-ia.md` — auditoría de claims de la guía pilar.
- `docs/fact-checks/como-aparecer-en-chatgpt.md` — auditoría de claims de la guía práctica.
- `docs/fact-checks/medir-visibilidad-en-chatgpt.md` — auditoría de claims de medición.

**Modificar**

- `src/content.config.ts` — `servicio` opcional, `recurso` opcional y exclusión mutua.
- `src/pages/guias/[slug].astro` — render condicional de CTA de servicio y recurso.
- `src/pages/guias/index.astro` — posicionamiento ampliado de la colección.
- `src/scripts/track.ts` — contrato de `resource_cta_click`.
- `tests/track.test.ts` — cobertura del nuevo evento.
- `tests/guides-commercial.test.ts` — garantizar que las seis guías comerciales conservan sus CTA.
- `docs/analytics-events.md` — documentar el evento y sus propiedades.

## Fuentes oficiales fijadas

Estas son las fuentes primarias que deben aparecer en los frontmatter y sustentar los claims correspondientes:

- Google, AI features and your website: `https://developers.google.com/search/docs/appearance/ai-features`
- Google, Creating helpful, reliable, people-first content: `https://developers.google.com/search/docs/fundamentals/creating-helpful-content`
- Google, Intro to structured data: `https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data`
- OpenAI, ChatGPT Search: `https://help.openai.com/en/articles/9237897-chatgpt-search`
- OpenAI, Publishers and Developers FAQ: `https://help.openai.com/en/articles/12627856-publishers-and-developers-faq`
- Perplexity, Crawlers: `https://docs.perplexity.ai/docs/resources/perplexity-crawlers`
- Schema.org, Organization: `https://schema.org/Organization`
- Google Analytics, Traffic acquisition: `https://support.google.com/analytics/answer/12923437`
- Google Analytics, Realtime report: `https://support.google.com/analytics/answer/9271392`
- Search Console, performance metrics: `https://support.google.com/webmasters/answer/10268906`

---

### Task 1: Añadir el evento seguro `resource_cta_click`

**Files:**

- Modify: `src/scripts/track.ts`
- Modify: `tests/track.test.ts`
- Modify: `docs/analytics-events.md`

- [ ] **Step 1: Escribir el test fallido del nuevo evento**

Añadir en `tests/track.test.ts`, dentro de `describe('trackGrowthEvent')`:

```ts
it('emite resource_cta_click con un recurso estable y sin propiedades extra', () => {
  loadGA4();
  expect(isGrowthEvent('resource_cta_click')).toBe(true);
  const sent = trackGrowthEvent('resource_cta_click', {
    page_type: 'guide',
    content_slug: 'medir-visibilidad-en-chatgpt',
    placement: 'guide_bottom',
    resource_id: 'gr22',
    destination: 'stripe',
    email: 'no-debe-salir@example.com',
  });
  expect(sent).toBe(true);
  const last = lastCommand();
  expect(last[1]).toBe('resource_cta_click');
  expect(last[2]).toEqual({
    page_type: 'guide',
    content_slug: 'medir-visibilidad-en-chatgpt',
    placement: 'guide_bottom',
    resource_id: 'gr22',
    destination: 'stripe',
  });
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test -- --run tests/track.test.ts`

Expected: FAIL porque `resource_cta_click` todavía no pertenece a `GrowthEvent` ni tiene contrato.

- [ ] **Step 3: Implementar el contrato mínimo**

En `src/scripts/track.ts`:

```ts
export const GROWTH_EVENTS = [
  'service_cta_click',
  'resource_cta_click',
  'diagnostic_started',
  'diagnostic_step_completed',
  'diagnostic_completed',
  'lead_qualified',
  'booking_started',
  'booking_completed',
] as const;
```

Añadir el contrato sin ampliar los parámetros permitidos de los eventos de servicio:

```ts
resource_cta_click: {
  required: ['page_type', 'placement', 'resource_id', 'destination'],
  allowed: ['page_type', 'content_slug', 'placement', 'resource_id', 'destination'],
},
```

Añadir el vocabulario cerrado:

```ts
destination: new Set(['stripe']),
```

`resource_id` seguirá validándose mediante `SAFE_VALUE`; no se permite el título visible ni texto libre.

- [ ] **Step 4: Documentar el evento**

En `docs/analytics-events.md`:

- añadir `resource_id` y `destination` a la tabla de propiedades;
- añadir `resource_cta_click` a la tabla de eventos;
- definirlo como click al Payment Link de un recurso editorial;
- requerir `page_type`, `placement`, `resource_id` y `destination`;
- clasificarlo como microconversión, no como evento clave;
- añadir `resource_cta_click` a la lista de microconversiones.

- [ ] **Step 5: Ejecutar los tests de tracking**

Run: `npm test -- --run tests/track.test.ts`

Expected: el archivo `track.test.ts` completo termina en verde.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/track.ts tests/track.test.ts docs/analytics-events.md
git commit -m "feat(analytics): track guide resource CTA clicks"
```

---

### Task 2: Hacer compatible el CTA editorial con las guías comerciales

**Files:**

- Create: `src/components/GuideResourceCTA.astro`
- Create: `tests/guide-resource-cta.test.ts`
- Modify: `src/content.config.ts`
- Modify: `src/pages/guias/[slug].astro`
- Modify: `tests/guides-commercial.test.ts`

- [ ] **Step 1: Escribir los tests fallidos de integración**

Crear `tests/guide-resource-cta.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compraUrlDeItem } from '../src/data/biblioteca/compra-urls';
import { ITEMS } from '../src/data/biblioteca';

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('CTA editorial de recursos en guías', () => {
  it('resuelve gr22 desde la fuente central', () => {
    expect(ITEMS.find((item) => item.id === 'gr22')?.titulo).toContain('ChatGPT y Perplexity');
    expect(compraUrlDeItem('gr22')).toMatch(/^https:\/\/buy\.stripe\.com\//);
  });

  it('el renderer separa CTA de servicio y CTA de recurso', () => {
    const page = read('src/pages/guias/[slug].astro');
    expect(page).toContain('d.servicio &&');
    expect(page).toContain('d.recurso &&');
    expect(page).toContain('GuideResourceCTA');
  });

  it('el CTA de recurso usa el evento y los atributos seguros', () => {
    const cta = read('src/components/GuideResourceCTA.astro');
    expect(cta).toContain("compraUrlDeItem(resourceId)");
    expect(cta).toContain('data-track-event="resource_cta_click"');
    expect(cta).toContain('data-track-resource-id={resourceId}');
    expect(cta).toContain('data-track-destination="stripe"');
    expect(cta).not.toContain('buy.stripe.com');
  });
});
```

Modificar el test de `tests/guides-commercial.test.ts` para que mantenga la lista `slugs` de las seis guías actuales y añada:

```ts
it('mantiene dos CTA de servicio para las seis guías comerciales existentes', () => {
  for (const slug of slugs) {
    const source = fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
    expect(source, slug).toMatch(/servicio:\n/);
  }
  const page = fs.readFileSync(path.join(root, 'src/pages/guias/[slug].astro'), 'utf8');
  expect(page).toContain('placement="after_answer"');
  expect(page).toContain('placement="final"');
});
```

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm test -- --run tests/guide-resource-cta.test.ts tests/guides-commercial.test.ts`

Expected: FAIL porque no existen el componente ni los branches condicionales.

- [ ] **Step 3: Ampliar el schema de `guias`**

En `src/content.config.ts`, hacer opcional el objeto `servicio` actual y añadir:

```ts
recurso: z.object({
  id: z.string().regex(/^(?:sw|gr)\d{2,3}$/),
}).optional(),
```

Encadenar `.superRefine((data, ctx) => { ... })` al objeto de la colección `guias`:

```ts
if (data.servicio && data.recurso) {
  ctx.addIssue({
    code: 'custom',
    message: 'Una guía no puede declarar servicio y recurso a la vez.',
    path: ['recurso'],
  });
}
```

No exigir ninguno de los dos: las dos primeras guías del clúster son puramente editoriales.

- [ ] **Step 4: Crear `GuideResourceCTA.astro`**

Implementar el componente con este contrato y resolución central:

```astro
---
import { ITEMS, compraUrlDeItem } from '../data/biblioteca';

interface Props {
  slug: string;
  placement: 'final';
  resourceId: string;
}

const { slug, placement, resourceId } = Astro.props;
const item = ITEMS.find((candidate) => candidate.id === resourceId);
const href = compraUrlDeItem(resourceId);
if (!item || !href) throw new Error(`Recurso de guía sin producto o compra URL: ${resourceId}`);
const price = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.precio ?? 1.99);
---
<aside class="guide-resource-cta">
  <span>Blueprint práctico</span>
  <h2>{item.titulo}</h2>
  {item.beneficio && <p>{item.beneficio}</p>}
  <a
    href={href}
    target="_blank"
    rel="noopener"
    data-track-event="resource_cta_click"
    data-track-page-type="guide"
    data-track-content-slug={slug}
    data-track-resource-id={resourceId}
    data-track-destination="stripe"
    data-track-placement="guide_bottom"
  >Desbloquear blueprint · {price} →</a>
</aside>
```

Añadir este bloque de estilos, que conserva la jerarquía visual, los estados de foco y la reducción de movimiento de los CTA existentes:

```astro
<style>
  .guide-resource-cta{position:relative;overflow:hidden;margin-top:28px;padding:26px;border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:12px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 12%,var(--panel)),var(--panel));box-shadow:0 18px 50px rgba(0,0,0,.12)}.guide-resource-cta::after{position:absolute;inset:-80% -20% auto auto;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(91,124,255,.2),transparent 68%);content:'';pointer-events:none;animation:cta-drift 8s ease-in-out infinite}.guide-resource-cta span,.guide-resource-cta h2,.guide-resource-cta p,.guide-resource-cta a{position:relative;z-index:1}.guide-resource-cta span{color:var(--accent);font:600 10px var(--mono);letter-spacing:.14em;text-transform:uppercase}.guide-resource-cta h2{margin:9px 0 0;color:#fff;font:600 21px var(--sans)}.guide-resource-cta p{margin:9px 0 0;color:var(--fg-2);line-height:1.6}.guide-resource-cta a{display:inline-block;margin-top:17px;padding:11px 16px;border-radius:4px;background:var(--accent);color:var(--bg);font-weight:700;text-decoration:none;transition:transform .25s,box-shadow .25s}.guide-resource-cta a:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(91,124,255,.3)}.guide-resource-cta a:focus-visible{outline:3px solid #fff;outline-offset:3px}@keyframes cta-drift{50%{transform:translate(-18px,18px) scale(1.08)}}@media(prefers-reduced-motion:reduce){.guide-resource-cta::after{animation:none}.guide-resource-cta a{transition:none}.guide-resource-cta a:hover{transform:none}}
</style>
```

No introducir una dependencia o sistema visual nuevo.

- [ ] **Step 5: Renderizar cada CTA solo cuando corresponda**

En `src/pages/guias/[slug].astro`:

```astro
import GuideResourceCTA from '../../components/GuideResourceCTA.astro';
```

Reemplazar los CTA incondicionales por:

```astro
{d.servicio && <GuideServiceCTA slug={entry.id} placement="after_answer" service={d.servicio} />}
<article class="prose"><Content /></article>
<EstudioFaq items={d.faq} />
<EstudioFuentes items={d.fuentes} />
<section class="related"><h2>Siguiente lectura</h2><div>{d.relacionados.map((r)=><a href={crumbPath(r.href)}>{r.titulo} →</a>)}</div></section>
{d.recurso && <GuideResourceCTA slug={entry.id} placement="final" resourceId={d.recurso.id} />}
{d.servicio && <GuideServiceCTA slug={entry.id} placement="final" service={d.servicio} />}
```

- [ ] **Step 6: Ejecutar tests y build de schema**

Run: `npm test -- --run tests/guide-resource-cta.test.ts tests/guides-commercial.test.ts tests/biblioteca-compra.test.ts`

Expected: tres archivos de test en verde.

Run: `npm run build`

Expected: build Astro y Pagefind completados sin errores de Zod o TypeScript.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/components/GuideResourceCTA.astro src/pages/guias/'[slug].astro' tests/guide-resource-cta.test.ts tests/guides-commercial.test.ts
git commit -m "feat(guias): support editorial resource CTAs"
```

---

### Task 3: Ampliar el posicionamiento del índice `/guias/`

**Files:**

- Modify: `src/pages/guias/index.astro`
- Modify: `tests/guides-commercial.test.ts`

- [ ] **Step 1: Escribir el test fallido del nuevo posicionamiento**

Añadir a `tests/guides-commercial.test.ts`:

```ts
it('presenta /guias como colección de automatización, IA y visibilidad', () => {
  const index = fs.readFileSync(path.join(root, 'src/pages/guias/index.astro'), 'utf8');
  expect(index).toContain('Guías de IA, automatización y visibilidad');
  expect(index).toContain('buscadores de IA');
  expect(index).toContain("'@type':'CollectionPage'");
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test -- --run tests/guides-commercial.test.ts`

Expected: FAIL porque el índice solo habla de automatización.

- [ ] **Step 3: Cambiar el copy y el schema del índice**

Usar exactamente:

```ts
const collectionName = 'Guías de IA, automatización y visibilidad';
const collectionDescription = 'Guías prácticas para automatizar procesos, adoptar inteligencia artificial y mejorar la visibilidad de una marca en buscadores de IA.';
```

Reutilizar ambas constantes en `CollectionPage`, `<BaseLayout>`, H1 e introducción. El H1 visible será `Guías de IA, automatización y visibilidad`.

- [ ] **Step 4: Ejecutar el test**

Run: `npm test -- --run tests/guides-commercial.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/guias/index.astro tests/guides-commercial.test.ts
git commit -m "feat(guias): broaden guide hub positioning"
```

---

### Task 4: Publicar la guía pilar `SEO para IA`

**Files:**

- Create: `src/content/guias/seo-para-ia.md`
- Create: `tests/seo-ai-guides.test.ts`

- [ ] **Step 1: Crear el test editorial fallido para la guía pilar**

Crear `tests/seo-ai-guides.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const guide = (slug: string) => fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
const bodyWords = (source: string) => source.split('---').slice(2).join('---').trim().split(/\s+/).length;

describe('clúster SEO para IA', () => {
  it('publica una guía pilar profunda, editorial y conectada', () => {
    const source = guide('seo-para-ia');
    expect(source).toContain('titulo: "SEO para IA:');
    expect(source).not.toMatch(/\nservicio:/);
    expect(source).not.toMatch(/\nrecurso:/);
    expect(source).toContain('/guias/como-aparecer-en-chatgpt/');
    expect(source).toContain('/guias/medir-visibilidad-en-chatgpt/');
    expect(source).toContain('/herramienta/chatgpt/');
    expect(source).toContain('/herramienta/perplexity/');
    expect(source).toContain('/herramienta/surfer-seo/');
    expect(bodyWords(source)).toBeGreaterThanOrEqual(2000);
  });
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: FAIL con `ENOENT` para `seo-para-ia.md`.

- [ ] **Step 3: Escribir el frontmatter completo**

Crear `src/content/guias/seo-para-ia.md` con:

```yaml
---
titulo: "SEO para IA: cómo aparecer en buscadores de inteligencia artificial"
descripcion: "Guía práctica para crear contenido, entidades y señales que ayuden a ChatGPT, Google y Perplexity a entender y recomendar tu marca."
fecha: 2026-08-13
actualizado: 2026-08-13
tema: SEO para IA
respuesta: "El SEO para IA consiste en hacer que una marca y su información sean rastreables, comprensibles, verificables y útiles para los sistemas que generan respuestas. No sustituye al SEO tradicional: parte de una base indexable y añade claridad de entidad, contenido que responde preguntas, datos consistentes y corroboración externa. Ninguna técnica garantiza una cita o recomendación."
puntosClave:
  - "Mantén la base SEO: rastreo, indexación, enlaces internos y contenido útil."
  - "Explica con claridad quién es la marca, qué ofrece, para quién y con qué pruebas."
  - "Mide menciones y exactitud además de clics, sin tratar una consulta aislada como tendencia."
relacionados:
  - titulo: "Cómo aparecer en ChatGPT"
    href: "/guias/como-aparecer-en-chatgpt/"
  - titulo: "Cómo medir la visibilidad en ChatGPT"
    href: "/guias/medir-visibilidad-en-chatgpt/"
  - titulo: "Ficha de ChatGPT"
    href: "/herramienta/chatgpt/"
  - titulo: "Ficha de Perplexity"
    href: "/herramienta/perplexity/"
faq:
  - q: "¿El SEO para IA sustituye al SEO tradicional?"
    a: "No. Los buscadores de IA siguen necesitando descubrir y procesar fuentes. Una base técnica rastreable, contenido útil y enlaces internos continúan siendo necesarios, aunque la medición y el formato de la respuesta cambien."
  - q: "¿GEO, AEO y SEO para IA son lo mismo?"
    a: "Son etiquetas parcialmente solapadas. GEO suele centrarse en motores generativos, AEO en respuestas directas y SEO para IA funciona como término paraguas. Conviene priorizar los problemas del usuario y las señales verificables antes que el acrónimo."
  - q: "¿Los datos estructurados garantizan aparecer en una respuesta de IA?"
    a: "No. Ayudan a describir entidades y contenido de forma explícita, pero deben coincidir con la información visible y no garantizan indexación, cita ni posición."
fuentes:
  - titulo: "AI features and your website"
    url: "https://developers.google.com/search/docs/appearance/ai-features"
    editor: "Google Search Central"
  - titulo: "Creating helpful, reliable, people-first content"
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
    editor: "Google Search Central"
  - titulo: "ChatGPT Search"
    url: "https://help.openai.com/en/articles/9237897-chatgpt-search"
    editor: "OpenAI"
  - titulo: "Perplexity Crawlers"
    url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"
    editor: "Perplexity"
  - titulo: "Organization"
    url: "https://schema.org/Organization"
    editor: "Schema.org"
---
```

- [ ] **Step 4: Redactar el cuerpo completo**

Escribir entre 2.000 y 2.800 palabras con estos H2, en este orden:

1. `## Qué es el SEO para IA`
2. `## En qué se diferencia del SEO tradicional`
3. `## Cómo descubre y selecciona fuentes un buscador de IA`
4. `## Cuatro condiciones para que una marca sea utilizable como fuente`
5. `## Cómo construir contenido que pueda entenderse y citarse`
6. `## Entidades, datos estructurados y consistencia de marca`
7. `## Por qué las señales externas importan`
8. `## Un plan de SEO para IA en cuatro fases`
9. `## Qué debes medir`
10. `## Errores frecuentes`

Cada H2 debe comenzar con una respuesta directa de 1–3 frases. Incluir:

- un ejemplo continuo de un marketer que busca un CRM para una agencia de 20 personas;
- una tabla que compare SEO tradicional, SEO para IA y Agentic Search;
- una lista de señales controlables y otra de señales externas;
- el enlace a ChatGPT al explicar respuestas conversacionales;
- el enlace a Perplexity al explicar citas visibles;
- el enlace a Surfer SEO al contrastar optimización editorial con visibilidad en respuestas;
- enlaces contextuales a las otras dos guías;
- lenguaje explícito de no garantía.

No afirmar que un archivo especial, schema o táctica garantiza aparecer. Google indica que sus funciones de IA mantienen las prácticas SEO básicas y no requieren markup especial.

- [ ] **Step 5: Ejecutar test y build**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: PASS para la guía pilar.

Run: `npm run build`

Expected: la ruta `/guias/seo-para-ia/` se genera sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/content/guias/seo-para-ia.md tests/seo-ai-guides.test.ts
git commit -m "feat(content): publish SEO para IA pillar guide"
```

---

### Task 5: Publicar `Cómo aparecer en ChatGPT`

**Files:**

- Create: `src/content/guias/como-aparecer-en-chatgpt.md`
- Modify: `tests/seo-ai-guides.test.ts`

- [ ] **Step 1: Añadir el test fallido de la segunda guía**

Añadir dentro del mismo `describe`:

```ts
it('publica la guía práctica de aparición sin CTA comercial', () => {
  const source = guide('como-aparecer-en-chatgpt');
  expect(source).toContain('titulo: "Cómo aparecer en ChatGPT:');
  expect(source).not.toMatch(/\nservicio:/);
  expect(source).not.toMatch(/\nrecurso:/);
  expect(source).toContain('/guias/seo-para-ia/');
  expect(source).toContain('/guias/medir-visibilidad-en-chatgpt/');
  expect(source).toContain('/herramienta/chatgpt/');
  expect(source).toContain('/herramienta/perplexity/');
  expect(bodyWords(source)).toBeGreaterThanOrEqual(1300);
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: FAIL con `ENOENT` para `como-aparecer-en-chatgpt.md`.

- [ ] **Step 3: Crear frontmatter y cuerpo**

Usar este frontmatter:

```yaml
---
titulo: "Cómo aparecer en ChatGPT: guía para posicionar tu empresa"
descripcion: "Proceso práctico para que ChatGPT pueda descubrir, entender y describir tu empresa con fuentes claras, consistentes y verificables."
fecha: 2026-08-13
actualizado: 2026-08-13
tema: Visibilidad en ChatGPT
respuesta: "Para aumentar las posibilidades de aparecer en ChatGPT, permite el acceso de OAI-SearchBot, publica información clara y verificable sobre tu empresa, relaciona la marca con su categoría y consigue fuentes externas consistentes. Después prueba consultas neutrales y registra los resultados. Cumplir estos pasos mejora la elegibilidad, pero no garantiza una cita ni una posición."
puntosClave:
  - "Comprueba primero rastreo, indexación y acceso de OAI-SearchBot."
  - "Publica hechos consistentes sobre marca, categoría, oferta y audiencia."
  - "Prueba prompts neutrales y guarda plataforma, fecha, pregunta y respuesta."
relacionados:
  - titulo: "SEO para IA"
    href: "/guias/seo-para-ia/"
  - titulo: "Cómo medir la visibilidad en ChatGPT"
    href: "/guias/medir-visibilidad-en-chatgpt/"
  - titulo: "Ficha de ChatGPT"
    href: "/herramienta/chatgpt/"
  - titulo: "Ficha de Perplexity"
    href: "/herramienta/perplexity/"
faq:
  - q: "¿Puedo pagar para aparecer en las respuestas de ChatGPT?"
    a: "Esta guía trata la inclusión editorial y orgánica. La disponibilidad de formatos publicitarios o comerciales puede variar, pero pagar por otra superficie no garantiza una mención orgánica dentro de una respuesta."
  - q: "¿Cuánto tarda una empresa en aparecer en ChatGPT?"
    a: "No existe un plazo garantizado. El rastreo, la indexación, la actualización de fuentes y la selección de resultados dependen de sistemas externos. Conviene medir tendencias periódicas, no prometer una fecha."
  - q: "¿Debo permitir GPTBot y OAI-SearchBot?"
    a: "Cumplen funciones distintas. OpenAI identifica OAI-SearchBot como el crawler relacionado con búsqueda, mientras que GPTBot se relaciona con posible entrenamiento. La política debe decidirse por user-agent y por objetivo."
fuentes:
  - titulo: "Publishers and Developers FAQ"
    url: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"
    editor: "OpenAI"
  - titulo: "ChatGPT Search"
    url: "https://help.openai.com/en/articles/9237897-chatgpt-search"
    editor: "OpenAI"
  - titulo: "AI features and your website"
    url: "https://developers.google.com/search/docs/appearance/ai-features"
    editor: "Google Search Central"
  - titulo: "Intro to structured data"
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
    editor: "Google Search Central"
---
```

Redactar 1.300–1.800 palabras con:

1. `## Qué significa realmente aparecer en ChatGPT`
2. `## Comprueba que ChatGPT puede acceder a tu sitio`
3. `## Crea un inventario de hechos verificables`
4. `## Relaciona tu marca con una categoría concreta`
5. `## Publica respuestas que resuelvan preguntas de decisión`
6. `## Refuerza la información con fuentes externas`
7. `## Diseña una batería neutral de consultas`
8. `## Qué hacer si ChatGPT omite o describe mal tu marca`

Incluir una tabla de auditoría con columnas `Comprobación`, `Qué buscar`, `Acción`; separar explícitamente OAI-SearchBot de GPTBot; enlazar las dos fichas de herramientas y las otras dos guías.

- [ ] **Step 4: Ejecutar test y build**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: dos tests en verde.

Run: `npm run build`

Expected: nueva ruta generada y colección válida.

- [ ] **Step 5: Commit**

```bash
git add src/content/guias/como-aparecer-en-chatgpt.md tests/seo-ai-guides.test.ts
git commit -m "feat(content): publish ChatGPT visibility guide"
```

---

### Task 6: Publicar la guía de medición y conectar `gr22`

**Files:**

- Create: `src/content/guias/medir-visibilidad-en-chatgpt.md`
- Modify: `tests/seo-ai-guides.test.ts`

- [ ] **Step 1: Añadir el test fallido de medición y conversión**

Añadir al `describe`:

```ts
it('publica la guía de medición con el blueprint gr22', () => {
  const source = guide('medir-visibilidad-en-chatgpt');
  expect(source).toContain('titulo: "Cómo medir la visibilidad');
  expect(source).toMatch(/recurso:\n  id: gr22/);
  expect(source).not.toMatch(/\nservicio:/);
  expect(source).not.toContain('buy.stripe.com');
  expect(source).toContain('/guias/seo-para-ia/');
  expect(source).toContain('/guias/como-aparecer-en-chatgpt/');
  expect(source).toContain('/herramienta/perplexity/');
  expect(bodyWords(source)).toBeGreaterThanOrEqual(1300);
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: FAIL con `ENOENT` para `medir-visibilidad-en-chatgpt.md`.

- [ ] **Step 3: Crear frontmatter y cuerpo**

Usar:

```yaml
---
titulo: "Cómo medir la visibilidad de tu marca en ChatGPT"
descripcion: "Framework para medir menciones, exactitud, sentimiento, fuentes y conversiones de una marca en ChatGPT y otros buscadores de IA."
fecha: 2026-08-13
actualizado: 2026-08-13
tema: Medición de visibilidad en IA
respuesta: "Mide la visibilidad en ChatGPT con un conjunto estable de preguntas y registra por plataforma, fecha y respuesta si la marca aparece, cómo se describe, qué competidores se citan y qué fuentes sustentan la respuesta. Combina esa observación con referencias en Analytics y tendencias de marca. Una consulta aislada no es una métrica."
puntosClave:
  - "Mantén fijos los prompts, el mercado y la frecuencia para poder comparar."
  - "Separa presencia, exactitud, sentimiento, competencia y resultado comercial."
  - "Registra la respuesta completa y su fecha antes de interpretar cambios."
recurso:
  id: gr22
relacionados:
  - titulo: "SEO para IA"
    href: "/guias/seo-para-ia/"
  - titulo: "Cómo aparecer en ChatGPT"
    href: "/guias/como-aparecer-en-chatgpt/"
  - titulo: "Ficha de Perplexity"
    href: "/herramienta/perplexity/"
  - titulo: "Metodología editorial"
    href: "/metodologia/"
faq:
  - q: "¿Qué métrica sustituye al ranking tradicional?"
    a: "No hay una métrica única equivalente. Conviene combinar tasa de mención, share of voice, exactitud, fuentes, sentimiento y resultados observables como referencias o conversiones asistidas."
  - q: "¿Cuántas consultas necesito para medir visibilidad?"
    a: "El número depende del mercado y del recorrido de compra. Empieza con un conjunto pequeño pero representativo y estable; amplíalo solo cuando cada nueva consulta cubra una intención distinta."
  - q: "¿Google Analytics muestra todas las visitas desde ChatGPT?"
    a: "Analytics puede registrar referencias cuando existe un clic y la medición tiene consentimiento, pero no observa respuestas sin clic ni todas las decisiones asistidas. Por eso debe combinarse con una auditoría de respuestas."
fuentes:
  - titulo: "Publishers and Developers FAQ"
    url: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"
    editor: "OpenAI"
  - titulo: "AI features and your website"
    url: "https://developers.google.com/search/docs/appearance/ai-features"
    editor: "Google Search Central"
  - titulo: "Traffic acquisition report"
    url: "https://support.google.com/analytics/answer/12923437"
    editor: "Google Analytics"
  - titulo: "Realtime report"
    url: "https://support.google.com/analytics/answer/9271392"
    editor: "Google Analytics"
  - titulo: "Search Console performance reports"
    url: "https://support.google.com/webmasters/answer/10268906"
    editor: "Google Search Console"
---
```

Redactar 1.300–1.800 palabras con:

1. `## Por qué el tráfico no cuenta toda la historia`
2. `## Define las preguntas que vas a repetir`
3. `## Las seis dimensiones de visibilidad en IA`
4. `## Cómo calcular una línea base útil`
5. `## Plantilla mensual de seguimiento`
6. `## Cómo interpretar cambios sin engañarte`
7. `## Qué acción corresponde a cada problema`
8. `## Cómo conectar visibilidad con resultados de negocio`

Incluir:

- definición operativa y fórmula simple para tasa de mención y share of voice;
- tabla con `Prompt`, `Plataforma`, `Fecha`, `Mención`, `Posición narrativa`, `Fuentes`, `Exactitud`, `Sentimiento`;
- advertencia de variabilidad entre ejecuciones, usuarios y mercados;
- referencia calibrada a `utm_source=chatgpt.com` basada en la fuente oficial de OpenAI;
- enlace a Perplexity y a las otras dos guías;
- CTA final automático a `gr22`, sin URL de Stripe en Markdown.

- [ ] **Step 4: Ejecutar tests y build**

Run: `npm test -- --run tests/seo-ai-guides.test.ts tests/guide-resource-cta.test.ts tests/track.test.ts`

Expected: todos los tests en verde.

Run: `npm run build`

Expected: `/guias/medir-visibilidad-en-chatgpt/` incluye el CTA de `gr22` y build completo en verde.

- [ ] **Step 5: Commit**

```bash
git add src/content/guias/medir-visibilidad-en-chatgpt.md tests/seo-ai-guides.test.ts
git commit -m "feat(content): publish AI visibility measurement guide"
```

---

### Task 7: Auditar claims y validar el clúster completo

**Files:**

- Create: `docs/fact-checks/seo-para-ia.md`
- Create: `docs/fact-checks/como-aparecer-en-chatgpt.md`
- Create: `docs/fact-checks/medir-visibilidad-en-chatgpt.md`
- Modify: `tests/seo-ai-guides.test.ts`

- [ ] **Step 1: Añadir validaciones cruzadas al test**

Añadir:

```ts
it('mantiene nueve guías y un clúster sin URLs de compra duplicadas', () => {
  const files = fs.readdirSync(path.join(root, 'src/content/guias')).filter((file) => file.endsWith('.md'));
  expect(files).toHaveLength(9);
  for (const slug of ['seo-para-ia', 'como-aparecer-en-chatgpt', 'medir-visibilidad-en-chatgpt']) {
    const source = guide(slug);
    expect(source).not.toContain(['T', 'BD'].join(''));
    expect(source).not.toContain(['TO', 'DO'].join(''));
    expect(source).not.toContain('buy.stripe.com');
    expect((source.match(/\n  - q: /g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((source.match(/\n  - titulo: /g) ?? []).length).toBeGreaterThanOrEqual(7);
  }
});
```

La cuenta `>=7` combina al menos cuatro relacionados y tres fuentes; no intenta distinguir ambos bloques mediante parsing YAML.

- [ ] **Step 2: Ejecutar el test**

Run: `npm test -- --run tests/seo-ai-guides.test.ts`

Expected: PASS.

- [ ] **Step 3: Crear los tres fact-checks**

Crear los documentos con estos H1 exactos, respectivamente:

- `# Fact-check: SEO para IA: cómo aparecer en buscadores de inteligencia artificial`
- `# Fact-check: Cómo aparecer en ChatGPT: guía para posicionar tu empresa`
- `# Fact-check: Cómo medir la visibilidad de tu marca en ChatGPT`

Debajo del H1, cada archivo usará esta estructura y la rellenará con los claims reales de su guía:

```markdown
**Revisado:** 2026-08-13
**Estado:** verified

## Tier A

Ningún claim legal, regulatorio, contractual o de certificación.

## Tier B

Lista de cada cifra, fecha o comportamiento dependiente de plataforma, con frase exacta, URL oficial y fecha de consulta.

## Tier C

Lista de definiciones y prácticas técnicas, indicando la fuente oficial que las respalda.

## Tier D

Recomendaciones editoriales identificadas como recomendaciones, no como garantías.

## Resultado

- Tier A pendientes: 0
- Tier B pendientes: 0
- Próxima revisión: 2027-02-13
```

No dejar encabezados vacíos. Si una guía no contiene Tier B, escribir `No hay claims numéricos o temporales de Tier B.`

- [ ] **Step 4: Revisar manualmente las promesas**

Buscar en las tres guías:

```bash
rg -n -i 'garantiza|siempre|nunca|el mejor|más probable|aumenta|porcentaje|%|días|meses' src/content/guias/{seo-para-ia,como-aparecer-en-chatgpt,medir-visibilidad-en-chatgpt}.md
```

Expected: cada coincidencia es una negación de garantía, una instrucción metodológica o está respaldada por una fuente oficial en su fact-check.

- [ ] **Step 5: Validar enlaces internos contra el build**

Run: `npm run build`

Expected: las nueve guías aparecen en el log/salida generada y Pagefind termina sin enlaces de ruta inexistente detectados por el proyecto.

Comprobar el sitemap generado:

```bash
rg -o 'https://agentesva\.com/guias/(seo-para-ia|como-aparecer-en-chatgpt|medir-visibilidad-en-chatgpt)/' .vercel/output/static/sitemap-0.xml | wc -l
```

Expected: tres coincidencias, una por URL del clúster.

- [ ] **Step 6: Commit**

```bash
git add docs/fact-checks/seo-para-ia.md docs/fact-checks/como-aparecer-en-chatgpt.md docs/fact-checks/medir-visibilidad-en-chatgpt.md tests/seo-ai-guides.test.ts
git commit -m "test(content): verify SEO para IA cluster claims"
```

---

### Task 8: Verificación final y preparación de entrega

**Files:**

- Verify only unless a failing check requires a scoped correction.

- [ ] **Step 1: Ejecutar la suite completa**

Run: `npm test`

Expected: todos los archivos y tests pasan; no aceptar snapshots o tests omitidos nuevos.

- [ ] **Step 2: Ejecutar el build de producción**

Run: `npm run build`

Expected: Astro, Vercel output y Pagefind terminan con exit code 0.

- [ ] **Step 3: Inspeccionar las tres páginas en viewport desktop y móvil**

Arrancar el sitio:

```bash
npm run dev -- --host 127.0.0.1
```

Comprobar en navegador:

- H1 único y respuesta breve visible;
- tablas legibles sin overflow roto;
- jerarquía H2/H3 continua;
- FAQ y fuentes visibles;
- relacionados correctos;
- ausencia de CTA comercial en las dos primeras guías;
- CTA `gr22` visible una sola vez al final de la tercera;
- foco visible y `target=_blank` con `rel=noopener` en compra.

- [ ] **Step 4: Validar el evento en un navegador sin bloqueo**

Precondiciones:

- `googletagmanager.com` y `google-analytics.com` permitidos;
- consentimiento analítico concedido;
- GA4 Realtime o DebugView abierto.

Hacer click en el CTA `gr22` y comprobar un único `resource_cta_click` con:

```text
page_type=guide
content_slug=medir-visibilidad-en-chatgpt
placement=guide_bottom
resource_id=gr22
destination=stripe
```

Si el navegador devuelve `ERR_BLOCKED_BY_CLIENT`, registrar la verificación como bloqueada por cliente y no modificar el código para eludir el bloqueo.

- [ ] **Step 5: Revisar el diff final**

Run: `git diff --check`

Expected: sin whitespace errors.

Run: `git status --short`

Expected: limpio tras los commits de tareas.

- [ ] **Step 6: Preparar el handoff**

Reportar:

- las tres URLs creadas;
- resultado exacto de tests y build;
- estado del evento `resource_cta_click`;
- si GA4 se validó o quedó bloqueado por la protección del navegador;
- commits creados;
- que el deploy/PR se realizará mediante el flujo `/ship` o `/land-and-deploy`, no desde esta tarea sin revisión.
