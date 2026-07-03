# Diseño — `/recursos`: tienda de packs de prompts y skills (épico, capa 3)

**Fecha:** 2026-07-03 · **Rama:** `feat/recursos-tienda`
**Fuentes de verdad:** [business brief](./2026-06-21-agentesva-directory-business-brief.md) (§ escalera de valor, /recursos + /packs, ladder 4,99/14,99/29,99 €) · `DESIGN.md` (Futurista) · `docs/brand-guidelines.md` (voz)

## Resumen

Construir **`/recursos`**, la **capa 3 del value ladder** (tienda modelo Authority.md): un escaparate único que mezcla **recursos gratis** (gancho SEO + captación de email) y **packs de pago** (prompts, skills `.md`/`.zip`, plantillas), con entrega vía **Gumroad** (como el curso). Clona la arquitectura de `/cursos` (colección tipada Zod, listado filtrable, fichas singulares, JSON-LD inline, diseño Futurista). Se **siembra con lo que ya existe** — el Pack de 30 prompts (gratis) y el curso de seguridad (producto estrella de pago) — y crece añadiendo packs (cada uno = tarea de contenido aparte, fuera de este build).

**Enfoque macro:** colección `recursos` **separada** que reutiliza el patrón probado de `cursos`/`tools`. Todo lo demás es clon fiel con campos propios de producto.

## Referencia (Authority.md, verificado 2026-07-03)

Micro-tienda de **archivos descargables de skills/prompts** (Claude Skills `.zip` con metadata YAML + `.md` portable a ChatGPT/Gemini), organizada por categoría, a precios de impulso: single **$4.99**, 4-pack **$14.99**, 10-pack **$29.99**, más "tools" $39–199; mezcla gratis + pago; entrega bajo demanda por email, sin cuentas. El brief copió esta escalera (4,99/14,99/29,99 €). Nuestra adaptación: entrega vía Gumroad (checkout alojado, cero infra de pago propia).

## Decisiones (resueltas)

| Decisión | Elección | Razón |
|---|---|---|
| Sección | **Una sola `/recursos`**, lidera con "gratis", mezcla gratis+pago | como Authority.md; concentra tráfico; el ángulo "gratis" gana en SEO (brief); el brief prioriza `/recursos` ("medio") sobre `/packs` ("fase posterior") |
| URL ficha | `/recurso/[slug]` (singular) | coherente con `/herramienta`, `/curso` |
| Modelo de datos | colección `recursos` **separada** (Zod, glob JSON) + `recursosCategorias` | clona `cursos`; no contamina otras colecciones |
| Entrega | **Pago → Gumroad** directo · **Gratis → descarga directa o con puerta a newsletter** | reutiliza el modelo propio/Gumroad del curso; la puerta preserva la captación |
| Filtros | **tipo** (prompts/skill/plantilla/curso) + **precio** (gratis/pago) + búsqueda | facetas útiles para una tienda pequeña |
| Precios | tiers `4,99 / 14,99 / 29,99 €` (packs) + el curso a `19 €` | ladder del brief; `precioDesde` los muestra |
| Schema `offers` | **incluido** en el JSON-LD `Product` (precios reales) | a diferencia de los cursos (donde se omitió por precio no fabricado), aquí los precios son verídicos |
| Siembra | Pack 30 prompts (gratis, con puerta) + curso Seguridad LLM (estrella de pago) | "sembrar con lo que existe"; el brief incluye "cursos" en la tienda; 2 productos reales, ampliable |

## A. Modelo de datos

### Colección `recursos` (`src/content.config.ts`)
`loader: glob({ pattern: '*.json', base: './src/content/recursos' })` (filename = slug). Esquema Zod:
```ts
z.object({
  titulo: z.string(),
  tipo: z.enum(['prompts', 'skill', 'plantilla', 'curso']),
  categoria: z.string(),                                   // FK → nombre de recursosCategorias
  desc: z.string(),                                        // corta (card)
  long: z.string(),                                        // completa (ficha)
  tagline: z.string(),
  ideal: z.string(),                                       // "para quién"
  formato: z.string(),                                     // "PDF · 30 prompts" | "Claude Skill .zip + .md" | "Plantilla Notion"
  precio: z.enum(['Gratis', 'Pago']),
  precioDesde: z.string().optional(),                      // "4,99 €" (solo display, pago)
  // Entrega (exactamente una vía según precio; ver superRefine):
  gumroadUrl: z.string().url().optional(),                 // pago
  downloadUrl: z.string().optional(),                      // gratis directo (p.ej. "/pack-30-prompts-ia.pdf")
  gated: z.boolean().default(false),                       // gratis con puerta → /newsletter
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  orden: z.number().int(),
  destacado: z.boolean().default(false),
  actualizado: z.string(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
})
```
**superRefine (invariante de entrega):**
- `precio: 'Pago'` ⇒ requiere `gumroadUrl` (y `precioDesde` recomendado).
- `precio: 'Gratis'` ⇒ requiere `downloadUrl` **o** `gated: true` (exactamente uno; si `gated`, no hace falta `downloadUrl`).

El build falla ante JSON inválido; ninguna ficha sin vía de entrega.

### Colección `recursosCategorias`
Paralela a `cursosCategorias`: `{ nombre, descripcion, orden }`. 4–6 categorías **por uso** (no por tipo): *Ventas y marketing · Atención al cliente · Productividad · Contenido · Desarrollo con IA*.

## B. Rutas (detalle singular)

| Tipo | Ruta | Generación |
|---|---|---|
| Listado | `/recursos` (`src/pages/recursos/index.astro`) | query a `recursos` ordenada por (destacado, orden); filtros cliente tipo+precio+búsqueda; lidera con "gratis" |
| Categoría | `/recursos/[categoria]` | `getStaticPaths` sobre `recursosCategorias`; filtra por `categoria` |
| Ficha | `/recurso/[slug]` | `getStaticPaths` sobre `recursos`; props = recurso + hasta 3 alternativas de la misma categoría |

## C. CTA por vía de entrega

- **Pago** → `<a href={gumroadUrl} target="_blank" rel="noopener">Comprar · {precioDesde}</a>`. (Además `/ir/[slug]` se amplía a `recursos` con guard de unicidad de slug, por si en el futuro hay recursos de afiliado; los propios no lo usan.)
- **Gratis + `downloadUrl`** → `<a href={downloadUrl} download>Descargar gratis</a>`.
- **Gratis + `gated`** → `<a href="/newsletter">Descárgalo gratis · Suscríbete</a>` (mantiene el gancho de email; el flujo DOI existente entrega el PDF en `/gracias`).

## D. Componentes / helpers / SEO

- **`src/components/RecursoCard.astro`** — clon de `CourseCard`: monograma (color), `tipo · formato`, desc, badge de precio (Gratis verde / tier), sin rating. `data-tipo` / `data-precio` / `data-cat` / `data-search` para filtrado cliente.
- **`src/data/recursos.ts`** — `Recurso` interfaz, `toRecurso`, `getAlternativesRecursos`, `fallbackFaqsRecurso`, `PRECIO_COLOR`, `tipoLabel`, `assertNoSlugCollision` (tools+cursos+recursos comparten `/ir`).
- **SEO (inline, como #50/#54):**
  - Ficha: JSON-LD **`Product`** con `name`, `description`, `brand`(Organization AgentesVA), `category`, y **`offers`** con `price`/`priceCurrency: EUR`/`availability` (para gratis, `price: "0"`) — precios reales. + `BreadcrumbList` + `FAQPage` (si `faq`).
  - Listado/categoría: `CollectionPage` + `ItemList` + `BreadcrumbList`.
  - Canonical vía `BaseLayout`; sitemap automático; Pagefind indexa las fichas (`data-pagefind-body` + `data-pagefind-filter="tipo:Recurso"` en la plantilla de ficha, para que aparezcan en la búsqueda global con badge propio).
- **Nav:** añadir `/recursos` en `SiteHeader` (entre Cursos y Estudios).

## E. Siembra (contenido real que ya existe)

1. **`pack-30-prompts.json`** — `tipo: prompts`, `categoria: "Productividad"` (o la que encaje), `formato: "PDF · 30 prompts"`, `precio: Gratis`, `gated: true`, `destacado: true`. Reusa `public/pack-30-prompts-ia.pdf` (entregado tras DOI). Copy original ES.
2. **`curso-seguridad-llm.json`** — el curso como **producto estrella de pago** en la tienda: `tipo: curso`, `categoria: "Desarrollo con IA"`, `formato: "Curso · 8 lecciones + laboratorio"`, `precio: Pago`, `precioDesde: "19 €"`, `gumroadUrl: https://fangaiala.gumroad.com/l/seguridad-llm`, `destacado: true`. Aparece en `/cursos` y `/recursos` a propósito (buque insignia; el brief incluye "cursos" en la tienda).

> Nota: cruzar el curso NO duplica su contenido — es una ficha `recurso` con su propio copy corto cuyo CTA va al mismo Gumroad. La ficha completa del curso sigue en `/curso/seguridad-llm`.

## F. Búsqueda global (Pagefind)

La plantilla `/recurso/[slug]` lleva `data-pagefind-body` + `data-pagefind-filter="tipo:Recurso"` + `data-pagefind-meta="tipo:Recurso"`, y el chip de tipo del buscador (`src/scripts/search.ts` + los dos DOM de filtro) suma "Recursos" con su color de badge. Así los packs son buscables en el modal global y en `/buscar`.

## Criterios de aceptación

- [ ] Colección `recursos` + `recursosCategorias` con Zod; build falla ante JSON inválido; superRefine de entrega activo (pago⇒gumroad, gratis⇒download|gated).
- [ ] `/recursos` lista y filtra por **tipo** y **precio**; lidera con "gratis"; badge de precio con tier.
- [ ] `/recurso/[slug]` renderiza la ficha con la CTA correcta según la vía de entrega.
- [ ] JSON-LD `Product` + `offers` (precio real, EUR) + `BreadcrumbList` válidos (Rich Results).
- [ ] Guard de unicidad de slug tools↔cursos↔recursos en build; `/ir/[slug]` resuelve recursos (tras cursos).
- [ ] Nav `/recursos`; Pagefind indexa las fichas con el chip "Recursos".
- [ ] Siembra: Pack 30 prompts (gratis+puerta) + curso (estrella de pago), ambos reales; `npm run build` verde; Lighthouse SEO ≥ 95.

## Fuera de alcance (tareas/épicos aparte)

- **Redactar packs de pago nuevos** (prompts/skills a 4,99/14,99/29,99) — contenido, cada uno su tarea.
- Recursos de afiliado de terceros (el schema deja `/ir` listo, pero la siembra es solo propia).
- Membership, pagos on-site (Gumroad aloja el checkout), reseñas de usuarios, migración a DB.

---
_Generado con [Claude Code](https://claude.com/claude-code). Voz: `docs/brand-guidelines.md`._
