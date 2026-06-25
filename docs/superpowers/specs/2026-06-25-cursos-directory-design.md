# Diseño — `/cursos`: directorio de cursos de IA (épico #54)

**Fecha:** 2026-06-25 · **Épico:** #54 (PRD) → issues #62–#66 · **Rama:** `feat/cursos-directory`
**Fuentes de verdad:** [business brief](./2026-06-21-agentesva-directory-business-brief.md) · `DESIGN.md` · `docs/brand-guidelines.md` · `docs/blog-fact-checking-protocol.md`

## Resumen

Construir `/cursos`, el directorio de cursos de IA (gratis + de pago por afiliado + **un curso propio vía Gumroad**), clonando la arquitectura del directorio de herramientas (#50): colección tipada con Zod, listado filtrable, fichas con descripción original en español, salida a afiliado por `/ir/[slug]` y `schema.org` `Course`. Es el pilar SEO más rentable del MVP ("cursos de ia" 1.300 ES / CPC 2,24 €; el ángulo "gratis" lidera).

**Enfoque macro:** colección `cursos` **separada** (no un discriminador `kind` sobre `tools`) — mantiene intacto el esquema probado de herramientas, evita contaminar sus queries y respeta el PRD ("clona la arquitectura"). Todo lo demás es un clon fiel de #50 con campos propios de cursos.

## Decisiones resueltas (cierran las Open Questions del PRD #54)

| Pregunta | Decisión | Razón |
|---|---|---|
| **URL** | `/cursos` · `/cursos/[categoria]` · `/curso/[slug]` (detalle **singular**) | Coherente con `/herramienta/[slug]` ya en producción |
| **Afiliados** | Lanzar con `officialUrl`; añadir `affiliateUrl` por ficha más tarde | `affiliateUrl` es opcional en el esquema → no bloquea el build; lidera el ángulo "gratis"; `/ir` ya prefiere `affiliateUrl` cuando existe |
| **Fuente de datos** | Curación manual asistida por Claude (igual que #50/#52) | No existe infra de feed/API; sobre-dimensionado para el MVP |
| **Gumroad (test de pago)** | **Dentro del MVP** como tipo `propio`, con **URL de Gumroad placeholder** (se cablea la real luego) y **enlace saliente directo** (sin overlay) | Gumroad aloja todo el flujo de pago → cero infra de pago propia; un "curso propio" encaja temáticamente en un directorio de cursos |
| **Taxonomía** | 4–6 categorías propias de cursos (distintas de herramientas) | Taxonomía de cursos ≠ taxonomía de herramientas |
| **Schema `offers`** | **Omitido** en el JSON-LD `Course` (sin precio en datos estructurados) | El PRD prohíbe `offers`/`rating` fabricados; evita deuda de mantenimiento/exactitud. Reconsiderable más tarde con precio real |

## Correcciones a supuestos del PRD (verificadas contra el código #50)

- El PRD menciona "reutiliza componentes `PricingBadge`, `Breadcrumbs`, `JsonLd`" — **no existen como componentes**; el directorio **inyecta** el JSON-LD y los badges inline por página. Seguimos el patrón real (inline + `CourseCard` modelado sobre `ToolCard`).
- `ToolCard` muestra un `rating` (string). Para cursos **no hay rating** (el PRD prohíbe ratings fabricados): `CourseCard` sustituye rating → **proveedor + nivel + duración**.

## A. Modelo de datos

### Colección `cursos` (`src/content.config.ts`)
`loader: glob({ pattern: '*.json', base: './src/content/cursos' })` (filename = slug). Esquema Zod:

```ts
const cursos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cursos' }),
  schema: z.object({
    titulo: z.string(),
    proveedor: z.string(),                                  // Coursera, Google, DeepLearning.AI…
    categoria: z.string(),                                  // FK → nombre de cursosCategorias
    nivel: z.enum(['principiante', 'intermedio', 'avanzado']),
    desc: z.string(),                                       // corta (card)
    long: z.string(),                                       // completa (ficha)
    tagline: z.string(),
    ideal: z.string(),                                      // "para quién"
    precio: z.enum(['Gratis', 'Pago']),
    precioDesde: z.string().optional(),                     // p.ej. "49 €" (solo display)
    idioma: z.string(),                                     // "Español", "Inglés (subt. ES)"…
    duracion: z.string().optional(),                        // "6 horas", "4 semanas"
    certificado: z.boolean().optional(),
    tipo: z.enum(['externo', 'propio']).default('externo'),
    officialUrl: z.string().url(),                          // requerido
    affiliateUrl: z.string().url().optional(),              // externo de pago (luego)
    gumroadUrl: z.string().url().optional(),                // solo propio (placeholder ahora)
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    orden: z.number().int(),
    destacado: z.boolean().default(false),
    actualizado: z.string(),                                // ISO date
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});
```

**Invariante:** ninguna ficha sin `officialUrl`; el build falla ante JSON inválido (Zod).
**Regla de integridad:** un `tipo: propio` debe traer `gumroadUrl` (placeholder válido aceptable); un `tipo: externo` nunca usa `gumroadUrl`. (Validación: refinamiento Zod o check en `data/cursos.ts`.)

### Colección `cursosCategorias`
Paralela a `categories` de #50: `{ nombre, descripcion, orden }`. 4–6 categorías propuestas:
*Fundamentos de IA · IA para tu negocio · Prompts e ingeniería de prompts · Imagen y generativa · Automatización y agentes* (ajustable a 6 si el contenido lo pide).

## B. Rutas (detalle singular, igual que `/herramienta`)

| Tipo | Ruta | Generación |
|---|---|---|
| Listado | `/cursos` (`src/pages/cursos/index.astro`) | query a `cursos` ordenada por `orden`; filtros cliente por **nivel** + **precio** + búsqueda; `destacado` propio fijado arriba |
| Categoría | `/cursos/[categoria]` (`src/pages/cursos/[categoria].astro`) | `getStaticPaths` sobre `cursosCategorias`; filtra cursos por `categoria` |
| Ficha | `/curso/[slug]` (`src/pages/curso/[slug].astro`) | `getStaticPaths` sobre `cursos`; props = curso + hasta 3 alternativas de la misma categoría |

## C. Enrutado del CTA (integración Gumroad)

- **`tipo: externo`** → CTA → **`/ir/[slug]`** → 302 a `affiliateUrl || officialUrl`, con `rel="sponsored nofollow noopener"`.
- **`tipo: propio`** → CTA → **`gumroadUrl` directo** en pestaña nueva, `rel="noopener"` (producto propio, no patrocinado). URL placeholder hasta cablear la real.

## D. Extensión de `/ir/[slug]`

Ampliar `src/pages/ir/[slug].ts` (issue #64, dep #58 ✅): buscar primero en `tools`, luego en `cursos`; redirigir con `affiliateUrl || officialUrl` (cursos) / `affiliateUrl || url` (tools). Mantener 302 + `Cache-Control: no-store`.

**Guard de unicidad (build-time):** si un mismo slug existe en `tools` **y** `cursos`, fallar el build con mensaje claro (evita colisiones silenciosas de redirección). Los cursos `propio` no pasan por `/ir`.

## E. Componentes y helpers

- **`src/components/CourseCard.astro`** — modelado sobre `ToolCard`: monograma (color), título, `proveedor · nivel`, desc, badge de precio (Gratis/Pago), duración. Atributos `data-nivel` / `data-precio` / `data-cat` / `data-search` para filtrado cliente. **Sin rating.**
- **`src/data/cursos.ts`** — interfaz `Curso`, `toCurso(entry)`, `getAlternativesCursos(all, curso)`, `fallbackFaqsCurso(curso)`; reutiliza `PRICE_COLOR` (`Gratis`/`Pago`).

## F. SEO / schema (inline por página, como #50)

- **Ficha `/curso/[slug]`** — JSON-LD `Course`: `name`, `description`, `provider` (`{@type: Organization, name: proveedor}`), `inLanguage`, `educationalLevel` (nivel). **Sin `offers`/`aggregateRating`.** Más `BreadcrumbList` (3 niveles) y `FAQPage` (si hay `faq`, con fallback `fallbackFaqsCurso`).
- **Listado / categoría** — `CollectionPage` + `ItemList` + `BreadcrumbList`.
- **`BaseLayout`** — canonical, OG, meta; sitemap automático (ya excluye `/ir/`).
- **Nav** — añadir enlace `/cursos` en `SiteHeader.astro`.

## G. Contenido de arranque (#65)

**≥15 cursos, mayoría gratis**, en las 4–6 categorías, con descripciones **originales en español** desde páginas oficiales de proveedores legales (Coursera / Google / DeepLearning.AI / Udemy / etc.), fact-checked **Tier A/B/C/D** (`docs/blog-fact-checking-protocol.md`). Más **1 curso `propio` placeholder** (`destacado: true`, `gumroadUrl` placeholder, `precio: Pago`).

## H. Mapa a issues ejecutables (#62–#66)

| Issue | Alcance |
|---|---|
| **#62** colección+ficha (base) | colección `cursos` + `cursosCategorias` en `content.config.ts`; `src/data/cursos.ts`; `CourseCard.astro`; ruta `/curso/[slug]` con JSON-LD `Course` + breadcrumb + FAQ |
| **#63** listado+categorías | `/cursos` (filtros nivel+precio+búsqueda) y `/cursos/[categoria]` con `ItemList`; enlace en nav |
| **#64** `/ir` afiliado | extender `ir/[slug].ts` a `cursos` + guard de unicidad de slug (dep #58 ✅) |
| **#65** ≥15 cursos | set de arranque (mayoría gratis) + 1 propio placeholder; descripciones ES fact-checked |
| **#66** SEO gate | Rich Results válidos (Course/Breadcrumb/FAQ); canonical; sitemap; Lighthouse SEO ≥ 95; build verde |

## Criterios de aceptación (del PRD, refinados)

- [ ] Colección `cursos` con Zod; build falla ante JSON inválido; ninguna ficha sin `officialUrl`.
- [ ] `/cursos` lista y filtra por **nivel** y **precio** (gratis/pago); badge de precio.
- [ ] `/curso/[slug]` renderiza la ficha (desc ES, proveedor, nivel, duración, precio, CTA).
- [ ] CTA `externo` pasa por `/ir/[slug]` con `rel="sponsored nofollow noopener"`; CTA `propio` enlaza a Gumroad directo.
- [ ] JSON-LD `Course` + `BreadcrumbList` válidos (Rich Results Test); sin `offers`/`rating` fabricados.
- [ ] Set de arranque ≥ 15 cursos (mayoría gratis) en 4–6 categorías + 1 propio placeholder.
- [ ] Guard de unicidad de slug `tools` ↔ `cursos` activo en build.
- [ ] Español neutro, responsive, canonical; `npm run build` verde; Lighthouse SEO ≥ 95.

## Verificación

- `npm run build` verde (Zod valida el contenido).
- Rich Results Test: `Course`, `BreadcrumbList`, `FAQPage`.
- Lighthouse SEO ≥ 95 en `/cursos` y una ficha.
- Revisión visual de `/cursos`, `/cursos/[categoria]`, `/curso/[slug]` (dev server).
- `/ir/[slug]` resuelve (302) para un curso `externo`; el CTA `propio` abre Gumroad.

## Fuera de alcance (épicos/issues aparte)

- Cursos propios adicionales / catálogo de pago propio (más allá del 1 placeholder de test).
- Búsqueda global Pagefind (#56) — el listado queda compatible.
- Reseñas/valoraciones de usuarios; matrículas en plataforma propia.
- Migración a DB; integración de feeds/APIs de proveedores.

---
_Generado con [Claude Code](https://claude.com/claude-code). Voz: `docs/brand-guidelines.md`._
