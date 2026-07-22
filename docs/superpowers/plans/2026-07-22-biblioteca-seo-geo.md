# SEO + GEO técnico para la Biblioteca de IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Arreglar 6 problemas técnicos concretos de SEO/GEO en `/recurso/biblioteca-ia`: título demasiado largo, meta description genérica, schema `FAQPage` sin contenido visible que lo respalde, jerarquía de headings con un salto (H1→H3), `llms.txt` sin mención de la Biblioteca, y sitemap sin excluir `/entrega`.

**Architecture:** Todo el trabajo es contenido (JSON) y plantillas (Astro) ya existentes — cero lógica nueva, cero cambios en `src/data/biblioteca/` ni en `src/scripts/biblioteca.ts`. El shape de datos (`faq: {q,a}[]`) ya existe en el schema de `recursos`; solo se rellena. El toggle de visibilidad por pestaña en `BibliotecaIA.astro` ya opera sobre `querySelectorAll('.bib-desc')` sin importar el tag HTML, así que separar el `<strong>` en un `<h2>` no requiere tocar el script cliente.

**Tech Stack:** Astro 5 (`.astro` templates), Zod (`content.config.ts`, sin cambios), JSON (content collection), sin JS nuevo.

---

### Task 1: Título más corto para recursos de biblioteca

**Files:**
- Modify: `src/pages/recurso/[slug].astro:60-72`

El `<title>` actual concatena `titulo` + `tagline`, que para la Biblioteca repiten
casi la misma idea (~140 caracteres). Para recursos `biblioteca: true`, usar solo
`titulo`.

- [ ] **Step 1: Añadir un `pageTitle` calculado en el frontmatter**

En `src/pages/recurso/[slug].astro`, justo después del bloque `const cta = ...`
(línea 67, antes del `---` de cierre en línea 68), añadir:

```ts
// Para recursos de biblioteca, el titulo ya es autoexplicativo — repetir el
// tagline en el <title> lo duplica y lo trunca en SERP (>140 caracteres).
const pageTitle = recurso.biblioteca ? `${recurso.titulo} | AgentesVA` : `${recurso.titulo} — ${recurso.tagline} | AgentesVA`;
```

- [ ] **Step 2: Usar `pageTitle` en `BaseLayout`**

Reemplazar la línea 71 (`title={`${recurso.titulo} — ${recurso.tagline} | AgentesVA`}`)
por:

```astro
  title={pageTitle}
```

- [ ] **Step 3: Verificar en build**

Run: `npm run build`
Expected: build sin errores. Luego:

```bash
grep -o '<title>[^<]*</title>' dist/recurso/biblioteca-ia/index.html
```

Expected: `<title>Biblioteca de IA: 100 prompts gratis + 200 blueprints | AgentesVA</title>`
(66 caracteres, sin repetir el tagline).

- [ ] **Step 4: Commit**

```bash
git add src/pages/recurso/\[slug\].astro
git commit -m "fix(seo): título más corto para recursos de biblioteca"
```

---

### Task 2: Meta description afilada para la Biblioteca

**Files:**
- Modify: `src/content/recursos/biblioteca-ia.json`

- [ ] **Step 1: Cambiar el campo `desc`**

En `src/content/recursos/biblioteca-ia.json`, reemplazar la línea:

```json
  "desc": "100 prompts de IA para copiar gratis y 200 blueprints por equipos para automatizar tu negocio.",
```

por:

```json
  "desc": "100 prompts de IA gratis, listos para copiar, y 200 blueprints de IA por equipos para automatizar tu PyME.",
```

- [ ] **Step 2: Verificar en build**

Run: `npm run build`
Expected: build sin errores (el schema Zod de `recursos` valida `desc: z.string()`,
sin restricción de longitud, así que no puede fallar por esto). Luego:

```bash
grep -o '<meta name="description" content="[^"]*"' dist/recurso/biblioteca-ia/index.html
```

Expected: `<meta name="description" content="100 prompts de IA gratis, listos para copiar, y 200 blueprints de IA por equipos para automatizar tu PyME. Prompts de AgentesVA."`

- [ ] **Step 3: Commit**

```bash
git add src/content/recursos/biblioteca-ia.json
git commit -m "fix(seo): meta description más específica para la Biblioteca de IA"
```

---

### Task 3: FAQ real y visible (arregla el desajuste de schema FAQPage)

**Files:**
- Modify: `src/content/recursos/biblioteca-ia.json`
- Modify: `src/pages/recurso/[slug].astro:102-107`

`[slug].astro` ya calcula `const faqs = recurso.faq?.length ? recurso.faq :
fallbackFaqsRecurso(recurso);` (línea 23) y ya emite JSON-LD `FAQPage` con
`faqs` (líneas 53-56). Hoy, para `recurso.biblioteca === true`, ese contenido
nunca se renderiza visible — solo existe en el bloque `{!recurso.biblioteca &&
(...)}` (líneas 109-162). Este task añade el array `faq` a los datos y una
sección visible equivalente dentro del bloque de biblioteca, para que el
JSON-LD tenga siempre contenido visible correspondiente.

- [ ] **Step 1: Añadir el array `faq` a `biblioteca-ia.json`**

Añadir, justo antes del cierre `}` final del archivo (después de la línea
`"actualizado": "2026-07-15"`, añadiendo una coma a esa línea):

```json
  "actualizado": "2026-07-15",
  "faq": [
    { "q": "¿Los 100 prompts son gratis de verdad?", "a": "Sí. Se ven completos en esta página y se copian con un clic, sin registro ni límite de uso." },
    { "q": "¿Cuál es la diferencia entre un prompt y un blueprint?", "a": "Los prompts (catálogo A) son gratis y se copian directo. Los blueprints (B y C) son recetas más completas —qué hacen, cómo, pasos y reglas— y su contenido completo es de pago; en la web ves gratis el beneficio y el alcance de cada uno." },
    { "q": "¿Cómo se compra un equipo de IA?", "a": "Cada equipo agrupa los blueprints de un mismo grupo a un precio único. Al pulsar «Contratar equipo» pagas con Stripe y accedes de inmediato a los blueprints completos." },
    { "q": "¿Necesito saber programar para usar los blueprints de software?", "a": "No. Cada blueprint incluye un prompt ya redactado y listo para pegar en un asistente de IA que trabaje sobre tu código." },
    { "q": "¿Puedo comprar un blueprint suelto en vez del equipo completo?", "a": "Por ahora se venden agrupados por equipo. La compra individual está planeada para más adelante." }
  ]
```

- [ ] **Step 2: Renderizar la sección FAQ visible en `[slug].astro`**

Reemplazar el bloque (líneas 102-107):

```astro
    {recurso.biblioteca && (
      <>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 34px 0 0; max-width: 62ch;">{recurso.long}</p>
        <BibliotecaIA />
      </>
    )}
```

por:

```astro
    {recurso.biblioteca && (
      <>
        <p style="font-size: 16px; line-height: 1.7; color: var(--fg-2); margin: 34px 0 0; max-width: 62ch;">{recurso.long}</p>
        <BibliotecaIA />

        <div style="margin-top: 48px; max-width: 62ch;">
          <h2 style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Preguntas frecuentes</h2>
          <div style="display: flex; flex-direction: column; gap: 18px; margin-top: 18px;">
            {faqs.map((f) => (
              <div>
                <h3 style="font-family: var(--sans); font-weight: 600; font-size: 15px; color: #fff; margin: 0;">{f.q}</h3>
                <p style="font-size: 14.5px; line-height: 1.6; color: var(--fg-2); margin: 8px 0 0;">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
```

- [ ] **Step 3: Verificar en build que el HTML visible y el JSON-LD coinciden**

Run: `npm run build`
Expected: build sin errores. Luego:

```bash
grep -o '¿Los 100 prompts son gratis de verdad?' dist/recurso/biblioteca-ia/index.html
```

Expected: dos coincidencias — una dentro del `<h3>` visible, otra dentro del
`<script type="application/ld+json">` (mismo texto, JSON-escapado sin cambios
porque no tiene comillas ni backslashes).

```bash
grep -c '"@type":"Question"' dist/recurso/biblioteca-ia/index.html
```

Expected: `5` (una por cada pregunta del array `faq`).

- [ ] **Step 4: Commit**

```bash
git add src/content/recursos/biblioteca-ia.json src/pages/recurso/\[slug\].astro
git commit -m "fix(seo): FAQ real y visible en la Biblioteca de IA (arregla desajuste de schema FAQPage)"
```

---

### Task 4: H2 real para el nombre del catálogo (arregla el salto de headings)

**Files:**
- Modify: `src/components/BibliotecaIA.astro:61-67`

- [ ] **Step 1: Separar el `<strong>` en un `<h2>` propio**

Reemplazar el bloque (líneas 61-67):

```astro
  <!-- Descripción por catálogo -->
  {CATALOGOS.map((c) => (
    <p class="bib-desc" data-cat={c.id} hidden={c.id !== activo} style="font-size: 15px; line-height: 1.6; color: var(--fg-3); margin: 22px 0 0; max-width: 56ch;">
      <strong style="color: var(--fg-2); font-weight: 600;">{c.nombre}.</strong> {c.desc}
      {!c.gratis && <span style="color: var(--fg-5);"> Cada blueprint suelto a 1,99 € o contrata el equipo completo.</span>}
    </p>
  ))}
```

por:

```astro
  <!-- Descripción por catálogo -->
  {CATALOGOS.map((c) => (
    <>
      <h2 class="bib-desc" data-cat={c.id} hidden={c.id !== activo} style="font-family: var(--sans); font-weight: 700; font-size: 19px; letter-spacing: -0.01em; color: #fff; margin: 22px 0 0;">{c.nombre}</h2>
      <p class="bib-desc" data-cat={c.id} hidden={c.id !== activo} style="font-size: 15px; line-height: 1.6; color: var(--fg-3); margin: 8px 0 0; max-width: 56ch;">
        {c.desc}
        {!c.gratis && <span style="color: var(--fg-5);"> Cada blueprint suelto a 1,99 € o contrata el equipo completo.</span>}
      </p>
    </>
  ))}
```

`src/scripts/biblioteca.ts` togglea la visibilidad con
`document.querySelectorAll<HTMLElement>('.bib-desc')` (sin filtrar por tag), así
que el `<h2>` y el `<p>` se ocultan/muestran igual que antes sin tocar el script.

- [ ] **Step 2: Verificar la jerarquía de headings en build**

Run: `npm run build`
Expected: build sin errores. Luego:

```bash
grep -oE '<h[1-4][^>]*>' dist/recurso/biblioteca-ia/index.html | sort | uniq -c
```

Expected: aparecen `<h1`, `<h2` (al menos 3, una por catálogo — solo una visible
sin `hidden` a la vez pero las 3 están en el HTML), `<h3` (grupos) y `<h4`
(ítems) — sin saltos de nivel.

- [ ] **Step 3: Correr tests + build completos**

Run: `npm run test`
Expected: PASS (ningún test toca este markup — `tests/biblioteca-ui.test.ts`
opera sobre fixtures propias, no sobre el HTML real de esta página).

Run: `npm run build`
Expected: OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/BibliotecaIA.astro
git commit -m "fix(seo): H2 real para el nombre del catálogo (arregla salto H1→H3)"
```

---

### Task 5: `llms.txt` — mencionar la Biblioteca de IA

**Files:**
- Modify: `public/llms.txt`

- [ ] **Step 1: Añadir la línea bajo "Recursos y feeds"**

En `public/llms.txt`, dentro de la sección `## Recursos y feeds`, reemplazar:

```
## Recursos y feeds
- [Pack de Recursos IA (gratis)](https://agentesva.com/#pack): ~30 prompts y plantillas listas para PyMEs.
- RSS: https://agentesva.com/rss.xml
```

por:

```
## Recursos y feeds
- [Pack de Recursos IA (gratis)](https://agentesva.com/#pack): ~30 prompts y plantillas listas para PyMEs.
- [Biblioteca de IA (gratis)](https://agentesva.com/recurso/biblioteca-ia): 100 prompts de IA listos para copiar (marketing, ventas, RR.HH., finanzas...) + 200 blueprints de IA por equipos (software, SEO, growth) para automatizar tu negocio.
- RSS: https://agentesva.com/rss.xml
```

No se toca la línea del Pack (`/#pack` sigue siendo un ancla válida en
`src/pages/index.astro:297`).

- [ ] **Step 2: Verificar**

```bash
grep -c "biblioteca-ia" public/llms.txt
```

Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "docs(geo): mencionar la Biblioteca de IA en llms.txt"
```

---

### Task 6: Excluir `/entrega` del sitemap

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Añadir `/entrega` al filtro**

En `astro.config.mjs`, reemplazar la línea (dentro de la config de `sitemap()`):

```js
      filter: (page) => !page.includes('/ir/') && !page.includes('/buscar') && !page.includes('/descarga'),
```

por:

```js
      filter: (page) => !page.includes('/ir/') && !page.includes('/buscar') && !page.includes('/descarga') && !page.includes('/entrega'),
```

- [ ] **Step 2: Verificar en build**

Run: `npm run build`
Expected: build sin errores. Luego:

```bash
grep -c "entrega" dist/sitemap-0.xml
```

Expected: `0` (no aparece `/entrega` en el sitemap generado).

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "fix(seo): excluir /entrega del sitemap (mismo patrón que /descarga)"
```

---

### Task 7: Verificación final completa

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Suite completa**

Run: `npm run test`
Expected: todos los tests en verde (sin cambios respecto a antes de este plan —
ningún test toca los archivos modificados).

- [ ] **Step 2: Build completo**

Run: `npm run build`
Expected: OK, sin warnings nuevos.

- [ ] **Step 3: Smoke visual**

Run: `npm run dev` y abrir `/recurso/biblioteca-ia`:
- Confirmar que el `<title>` de la pestaña del navegador es corto (sin
  repetir "100 prompts... 200 blueprints" dos veces).
- Hacer scroll hasta el final de la página y confirmar que la sección
  "Preguntas frecuentes" se ve, con las 5 preguntas.
- Confirmar que el nombre del catálogo activo ("Prompts de IA para tu
  negocio", etc.) se ve igual que antes (visualmente no debería cambiar nada,
  solo el tag HTML por debajo).

---

## Self-review (hecho)

- **Cobertura de la spec:** Task 1 = hallazgo 1 (título) ✔. Task 2 =
  hallazgo 2 (meta description) ✔. Task 3 = hallazgo 3 (schema FAQPage sin
  contenido visible) ✔. Task 4 = hallazgo 4 (jerarquía de headings) ✔.
  Task 5 = hallazgo 5 (llms.txt) ✔. Task 6 = hallazgo 6 (sitemap) ✔.
- **Placeholders:** ninguno — cada step tiene el código exacto a escribir y
  el comando exacto de verificación con el resultado esperado.
- **Consistencia de tipos:** `faq` usa el shape `{ q: string; a: string }[]`
  ya definido en el schema de `recursos` (`content.config.ts`, sin cambios) y
  ya consumido por `fallbackFaqsRecurso`/`faqs` en `[slug].astro` — ningún
  tipo nuevo, ninguna función nueva.
