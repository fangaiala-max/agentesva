# SEO + GEO técnico para la Biblioteca de IA — diseño

**Fecha:** 2026-07-22
**Estado:** Aprobado — pendiente de plan de implementación
**Autor:** Fernando + Claude

## Objetivo

Optimizar `/recurso/biblioteca-ia` (la Biblioteca de IA, shippeada en PR #126) para
buscadores tradicionales (SEO) y motores de respuesta de IA (GEO/AEO), con un
alcance **técnico y acotado**: arreglos concretos de bajo riesgo, sin nuevo
contenido de fondo ni cambios de arquitectura de la página.

Este trabajo es distinto del plan de entity-signals (`docs/superpowers/plans/
2026-07-16-entity-signals-geo.md`), que construye señales de marca a nivel de
sitio (LinkedIn, Wikidata, `sameAs`). Aquí el foco es on-page, solo para esta
página.

## Hallazgos (auditoría previa a este diseño)

1. **`<title>` de ~140 caracteres**: `[slug].astro` concatena
   `${recurso.titulo} — ${recurso.tagline} | AgentesVA` para todo recurso.
   Para la biblioteca, `titulo` y `tagline` repiten casi la misma idea
   ("100 prompts gratis... 200 blueprints" dos veces) → Google trunca el
   título en SERP y desperdicia texto útil.
2. **Meta description genérica**: `${recurso.desc} ${tipoLabel(recurso.tipo)}
   de AgentesVA.` — el `desc` actual no usa términos de búsqueda específicos
   (prompts, blueprints, PyME, el framework Rol+Contexto+Tarea).
3. **Desajuste de schema `FAQPage`**: `[slug].astro` siempre emite JSON-LD
   `FAQPage` (con `recurso.faq` o, si no hay, `fallbackFaqsRecurso(recurso)`),
   pero para `recurso.biblioteca === true` el bloque visible de "Preguntas
   frecuentes" está completamente omitido (`{!recurso.biblioteca && (...)}`).
   Google penaliza (desde 2023) structured data sin contenido visible
   correspondiente — riesgo de perder elegibilidad de rich results en todo
   el sitio, no solo en esta página.
4. **Jerarquía de encabezados rota**: H1 (título del recurso) → H3 (nombre
   del grupo, en `BibliotecaIA.astro`) → H4 (título de cada ítem). Salta H2
   porque el nombre del catálogo hoy es un `<strong>` dentro de un `<p>`, no
   un heading real.
5. **`llms.txt` no menciona la Biblioteca**: la sección "Recursos y feeds"
   solo referencia el "Pack de Recursos IA" (`/#pack`, sigue siendo válido —
   verificado, no se toca). No hay ninguna entrada para
   `/recurso/biblioteca-ia`.
6. **Sitemap no excluye `/entrega`**: el filtro de `@astrojs/sitemap` en
   `astro.config.mjs` excluye `/descarga` (página de entrega post-pago,
   `noindex`, SSR) pero no excluye `/entrega` (la página de entrega de la
   Biblioteca, mismo patrón: `noindex`, SSR). Inconsistencia a corregir por
   higiene, aunque el impacto práctico sea bajo (páginas SSR no suelen
   colarse en el sitemap estático de todos modos).

## Cambios

### 1. Título — fix quirúrgico en `src/pages/recurso/[slug].astro`

Para recursos con `biblioteca: true`, usar solo `titulo` en el `<title>`
(sin `tagline`, que ya cumple su función como subtítulo del héroe visible):

```ts
const pageTitle = recurso.biblioteca
  ? `${recurso.titulo} | AgentesVA`
  : `${recurso.titulo} — ${recurso.tagline} | AgentesVA`;
```

Resultado: `Biblioteca de IA: 100 prompts gratis + 200 blueprints | AgentesVA`
(66 caracteres, antes ~140).

### 2. Meta description — nuevo `desc` en `src/content/recursos/biblioteca-ia.json`

```
"100 prompts de IA gratis, listos para copiar, y 200 blueprints de IA por equipos para automatizar tu PyME."
```

(108 caracteres; con el sufijo existente `" Prompts de AgentesVA."` que añade
el código, ~130 caracteres totales — dentro del límite práctico de Google.)
El campo `desc` también alimenta el blurb de la tarjeta en `/recursos`, así
que este cambio mejora ambos sitios a la vez.

### 3. FAQ real y visible + fix del desajuste de schema

**Datos** — nuevo array `faq` en `biblioteca-ia.json` (usa el mismo shape
`{ q: string; a: string }[]` que ya soporta el schema de `recursos`):

```json
"faq": [
  { "q": "¿Los 100 prompts son gratis de verdad?", "a": "Sí. Se ven completos en esta página y se copian con un clic, sin registro ni límite de uso." },
  { "q": "¿Cuál es la diferencia entre un prompt y un blueprint?", "a": "Los prompts (catálogo A) son gratis y se copian directo. Los blueprints (B y C) son recetas más completas —qué hacen, cómo, pasos y reglas— y su contenido completo es de pago; en la web ves gratis el beneficio y el alcance de cada uno." },
  { "q": "¿Cómo se compra un equipo de IA?", "a": "Cada equipo agrupa los blueprints de un mismo grupo a un precio único. Al pulsar «Contratar equipo» pagas con Stripe y accedes de inmediato a los blueprints completos." },
  { "q": "¿Necesito saber programar para usar los blueprints de software?", "a": "No. Cada blueprint incluye un prompt ya redactado y listo para pegar en un asistente de IA que trabaje sobre tu código." },
  { "q": "¿Puedo comprar un blueprint suelto en vez del equipo completo?", "a": "Por ahora se venden agrupados por equipo. La compra individual está planeada para más adelante." }
]
```

**Render** — en `[slug].astro`, dentro del bloque `{recurso.biblioteca && (...)}`
(hoy solo tiene la intro breve + `<BibliotecaIA />`), añadir una sección
visible de preguntas frecuentes con el mismo patrón markup que ya usa el
bloque genérico (`h2` "Preguntas frecuentes" + lista de `h3`/`p` por par
Q&A), reutilizando la variable `faqs` que el frontmatter ya calcula
(`recurso.faq?.length ? recurso.faq : fallbackFaqsRecurso(recurso)` — con el
nuevo array en el JSON, esto ya devuelve las 5 preguntas curadas sin tocar
esa lógica).

Con esto, el JSON-LD `FAQPage` que ya se emite queda respaldado por
contenido visible idéntico — cierra el desajuste sin tocar el schema en sí.

### 4. H2 real para el nombre del catálogo — `src/components/BibliotecaIA.astro`

Sustituir el bloque actual:

```astro
<p class="bib-desc" data-cat={c.id} hidden={c.id !== activo} ...>
  <strong ...>{c.nombre}.</strong> {c.desc} ...
</p>
```

por un `h2` + `p` como hermanos, ambos con `class="bib-desc"` y
`data-cat={c.id}` (el script cliente ya togglea por `querySelectorAll('.bib-desc')`
sin importar el tag, así que no hace falta tocar `biblioteca.ts`):

```astro
<h2 class="bib-desc" data-cat={c.id} hidden={c.id !== activo} style="...">{c.nombre}</h2>
<p class="bib-desc" data-cat={c.id} hidden={c.id !== activo} style="...">{c.desc} ...</p>
```

Jerarquía resultante: H1 (recurso) → H2 (catálogo activo) → H3 (grupo) → H4
(ítem). Sin saltos.

### 5. `llms.txt` — nueva línea bajo "Recursos y feeds"

```
- [Biblioteca de IA (gratis)](https://agentesva.com/recurso/biblioteca-ia): 100 prompts de IA listos para copiar (marketing, ventas, RR.HH., finanzas...) + 200 blueprints de IA por equipos (software, SEO, growth) para automatizar tu negocio.
```

No se toca la línea existente del Pack de 30 prompts (`/#pack`) — se
verificó que el ancla sigue existiendo en `src/pages/index.astro:297`.

### 6. Sitemap — excluir `/entrega`

En `astro.config.mjs`, añadir `/entrega` al filtro existente:

```ts
filter: (page) => !page.includes('/ir/') && !page.includes('/buscar') && !page.includes('/descarga') && !page.includes('/entrega'),
```

## Fuera de alcance (decisión explícita del usuario)

- Anclas profundas por prompt/blueprint individual (deep-linking).
- Schema `ItemList` para los 300 recursos.
- Contenido nuevo de apoyo (artículos/estudios enlazando a la Biblioteca).
- Ampliar la densidad factual de las FAQ más allá de las 5 preguntas listadas.
- Auditar o corregir el enlace `/#pack` (ya verificado como válido).

## Testing

- Build (`npm run build`) debe generar el HTML de `/recurso/biblioteca-ia`
  con: `<title>` corto, meta description nueva, sección FAQ visible con las
  5 preguntas, JSON-LD `FAQPage` con las mismas 5 preguntas (verificar que
  coinciden campo a campo), y jerarquía de headings sin saltos (h1→h2→h3→h4).
- `npm run test` no debe romperse — no se toca ninguna lógica de
  `biblioteca.ts` ni los helpers de `data/biblioteca`.
- Verificación manual: `grep` del HTML generado en `dist/` para confirmar
  título, meta description y que las 5 preguntas aparecen tanto en el DOM
  visible como en el bloque `<script type="application/ld+json">`.
- `llms.txt` y `astro.config.mjs`: verificación visual del diff, sin test
  automatizado (son archivos de configuración/contenido estático).
