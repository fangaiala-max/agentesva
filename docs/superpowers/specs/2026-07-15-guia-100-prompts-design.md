# Biblioteca de IA + Equipos de IA (freemium) — diseño

**Fecha:** 2026-07-15
**Estado:** Aprobado — pendiente de plan de implementación
**Autor:** Fernando + Claude

> Documento vivo. El alcance evolucionó en la sesión: de "100 prompts" a una
> **biblioteca freemium** con 3 catálogos (300 recursos) y monetización por
> **"equipos de IA"** (bundles). Esta es la versión final acordada.

## Objetivo

Publicar en AgentesVA una **biblioteca de IA freemium**, en una sola página navegable
(nuevo recurso de `/recursos`), para PyMEs hispanohablantes (España + LATAM):

- **Regala** 100 prompts listos para copiar (gancho + SEO).
- **Vende** 200 blueprints (recetas de IA ejecutables) mostrando su beneficio/alcance como
  teaser, empaquetados como **"equipos de IA"** (bundles) y también sueltos.

## Modelo de negocio (freemium)

| Capa | Contenido | En la web |
|---|---|---|
| Gratis | 100 prompts (catálogo A) | Prompt completo, botón *Copiar* |
| Gratis (teaser) | 200 blueprints (catálogos B + C) | Título + **beneficio** + **alcance** |
| **De pago** | Blueprint completo (qué hace · modo · pasos · reglas · prompt) | Suelto **1,99 €** o en **bundle "equipo" 3,99 €** |

- **Canal de cobro:** Stripe Payment Links (uno por SKU). El enlace lo crea el usuario.
- **Entrega:** Stripe NO aloja archivos → tras pagar se redirige a un **destino de entrega**
  (página no listada `noindex` / PDF / Notion) con los blueprints comprados. Destino TBD por el usuario.
- **Precios (config, ajustables):** blueprint suelto `1,99 €`; bundle equipo `3,99 €`.
- **Arranque recomendado:** lanzar con los **~10 equipos** (pocos Payment Links) y añadir el
  "suelto a 1,99" después. Botones placeholder hasta tener los enlaces reales.

## Los 3 catálogos

### A — Prompts de IA para tu negocio (100) · GRATIS
Prompts para copiar/pegar, reescritos con **Rol + Contexto + Tarea + Restricciones + Formato**.
Grupos (4): Por industria · Por resultados/KPIs · Mejores casos de uso · Por objetivos.

### B — IA en tu software (100 blueprints) · teaser gratis / completo de pago
Del catálogo "100 skills de ingeniería", en su **versión más útil**: cada ítem es un
**blueprint ejecutable**. En la web se ve beneficio+alcance.
Grupos/equipos (4): Auditoría de tu software · Mantenimiento y limpieza de código ·
Calidad y pruebas (QA) · Operaciones y seguridad (DevOps).

### C — Growth con IA (100 blueprints) · teaser gratis / completo de pago
Del catálogo "100 agentic skills de Growth Engineering", ya vienen en formato blueprint
(Skill ID · Mode · Routing · Workflow · Rules). Se reescriben claros y útiles.
Grupos/equipos (6): SEO · Visibilidad en IA (GEO) · Inteligencia competitiva ·
Publicidad y conversión · Redes sociales y contenido · Diseño y experiencia (UX).

## Equipos de IA (bundles de pago)

Un **equipo = un grupo** de los catálogos B/C, empaquetado con gancho de "contrata a tu
equipo". 10 equipos:

| Equipo | Grupo origen |
|---|---|
| 🔍 Equipo de Auditoría de Software | B · Auditoría |
| 🧹 Equipo de Mantenimiento de Código | B · Mantenimiento |
| ✅ Equipo de Calidad (QA) | B · Calidad/pruebas |
| ⚙️ Equipo de DevOps y Seguridad | B · Operaciones |
| 🧲 Equipo de SEO | C · SEO |
| 🤖 Equipo de Visibilidad en IA | C · GEO |
| 🕵️ Equipo de Inteligencia Competitiva | C · Competencia |
| 📈 Equipo de Publicidad y Conversión | C · Performance |
| 📱 Equipo de Redes Sociales | C · Social |
| 🎨 Equipo de Diseño y Experiencia | C · UI/UX |

> Nota de precio a reconciliar en el cableado: el usuario mencionó "bundle de 3–4 a 3,99".
> Los grupos tienen más de 4 ítems. Default provisional: el **equipo = grupo completo a 3,99 €**
> (gancho generoso) + **suelto a 1,99 €**. El precio/tamaño es config y se ajusta sin refactor.

## Arquitectura

Motor genérico "biblioteca", instanciado con 3 catálogos + equipos. Piezas aisladas:

### `src/data/biblioteca/` (datos tipados, sin JSX)
```ts
// index.ts — tipos + agregados + helpers
export type CatalogoId = 'prompts' | 'software' | 'growth';
export interface Catalogo { id: CatalogoId; nombre: string; desc: string; grupos: string[]; gratis: boolean; }
export interface Blueprint { quePuedeHacer: string; modo: string; pasos: string[]; reglas: string[]; prompt: string; }
export interface Item {
  id: string;              // 'p01'.., 'sw01'.., 'gr01'..
  catalogo: CatalogoId;
  grupo: string;           // ∈ Catalogo.grupos
  titulo: string;
  cuerpo?: string;         // A (prompts): prompt completo copiable
  beneficio?: string;      // B/C: teaser — qué ganas
  alcance?: string;        // B/C: teaser — hasta dónde llega
  blueprint?: Blueprint;   // B/C: contenido de pago (NO se renderiza en la web gratis)
  precio?: number;         // B/C: € suelto (1.99)
}
export interface Equipo { id: string; nombre: string; desc: string; grupo: string; catalogo: CatalogoId; precio: number; compraUrl?: string; }
export const CATALOGOS: Catalogo[];
export const EQUIPOS: Equipo[];
export const ITEMS: Item[];                       // 300
export function itemsDeCatalogo(id: CatalogoId): Item[];
export function gruposDeCatalogo(id: CatalogoId): string[];
export function itemsDeGrupo(cat: CatalogoId, grupo: string): Item[];
export function equipoDeGrupo(cat: CatalogoId, grupo: string): Equipo | undefined;
// prompts.ts / software.ts / growth.ts → cada uno exporta su Item[] (100)
// equipos.ts → EQUIPOS (10)
```

### `src/components/BibliotecaIA.astro`
Render (sistema "Futurista"):
- **Selector de catálogo** (pills): Prompts · Software · Growth. Uno activo (default Prompts).
- **Filtro de texto** (input) — por el volumen (300 ítems); filtra por título/beneficio/cuerpo.
- **Chips de grupo** por catálogo.
- Ítems por grupo (encabezado mono mayúsculas). Para B/C, el grupo muestra su **banner de equipo**
  con CTA "Contratar equipo · 3,99 €".
- Tarjeta de ítem:
  - A: título + prompt (`<pre>`) + botón *Copiar*.
  - B/C: título + beneficio + alcance + botón "Desbloquear · 1,99 €" (placeholder Stripe).
- Estado vacío en filtros sin resultados. Accesible (aria en pills/chips/botones, foco visible).

### `src/scripts/biblioteca.ts` (cliente, idempotente, `astro:page-load`)
- `initBiblioteca()`: catálogo activo + grupo activo + texto → togglea `hidden` en tarjetas y
  encabezados; actualiza contador y estado vacío.
- `initBibliotecaCopy()`: `navigator.clipboard.writeText`; feedback "¡Copiado!"; fallback.

### `src/content/recursos/biblioteca-ia.json`
Recurso de la tienda (Gratis para entrar; el pago vive dentro):
```json
{
  "titulo": "Biblioteca de IA: 100 prompts gratis + 200 blueprints",
  "tipo": "prompts", "categoria": "Productividad",
  "desc": "100 prompts para copiar gratis y 200 blueprints de IA por equipos para tu negocio.",
  "long": "...", "tagline": "...", "ideal": "...",
  "formato": "Web · 300 recursos", "precio": "Gratis",
  "biblioteca": true, "gated": false,
  "color": "#5B7CFF", "orden": 4, "destacado": true, "actualizado": "2026-07-15"
}
```

### `src/content.config.ts` — añadir `biblioteca: z.boolean().default(false)`; relajar `superRefine`
(Gratis + `biblioteca:true` no requiere `downloadUrl`/`gated`).

### `src/data/recursos.ts` — añadir `biblioteca?: boolean` a `Recurso`.

### `src/pages/recurso/[slug].astro` — si `recurso.biblioteca`, renderizar `<BibliotecaIA />`
como cuerpo (se conserva héroe + intro breve; se omite el bloque genérico de 2 columnas);
CTA del héroe → "Explorar la biblioteca ↓". Arrancar `initBiblioteca`/`initBibliotecaCopy`.

## Entrega del contenido de pago (v1)

Los blueprints completos (B/C) se generan como **producto**. Entrega tras compra (elige el usuario):
- **Opción simple:** páginas de entrega no listadas (`/entrega/[equipo]`, `noindex`, slug secreto)
  a las que Stripe redirige tras el pago. No es un muro real pero basta para 1,99–3,99 €.
- **Opción PDF/Notion:** un PDF por equipo enlazado en el email/confirmación de Stripe.
Decisión diferida; no bloquea la capa gratis.

## Testing (objetivo 100% cobertura)

`tests/biblioteca.test.ts` (datos):
- `ITEMS.length === 300`; 100 por catálogo; ids únicos con prefijo correcto (`p`/`sw`/`gr`).
- `item.grupo ∈ gruposDeCatalogo(item.catalogo)`; `titulo` no vacío.
- A: `cuerpo` presente y con marcadores del framework (p. ej. "Rol"/"Tarea"). B/C: `beneficio`,
  `alcance`, `blueprint` y `precio` presentes; `cuerpo` ausente.
- `CATALOGOS` (3) con grupos correctos (4/4/6); `EQUIPOS` (10), uno por grupo de B/C.
- Helpers: sumas y filtros correctos (`itemsDeCatalogo`, `gruposDeCatalogo`, `itemsDeGrupo`, `equipoDeGrupo`).

`tests/biblioteca-ui.test.ts` (happy-dom, `src/scripts/biblioteca.ts`):
- Cambiar de catálogo muestra solo sus ítems.
- Filtro de texto oculta lo que no coincide; aparece estado vacío.
- Copiar invoca `clipboard.writeText` con el `cuerpo` y muestra feedback.

## Entrega incremental

1. **Fase 1** — motor + schema/recurso + página + **catálogo A (100 prompts)** + tests → shippable.
2. **Fase 2** — **catálogo B (100 blueprints software)**: teasers en web + blueprints producto + 4 equipos.
3. **Fase 3** — **catálogo C (100 blueprints growth)**: teasers + blueprints + 6 equipos.
4. **Cableado Stripe** — Payment Links reales + entrega, por equipo (y sueltos).
Cada fase deja tests+build en verde.

## Estándar de calidad / honestidad

- Español neutro (España + LATAM), sin modismos.
- Prompts: framework explícito, placeholders `[entre corchetes]`.
- Blueprints: beneficio primero; pasos y reglas claros; un prompt ejecutable por blueprint.
- **Fact-checking:** B/C son de origen IA; se reescriben como frameworks prácticos; se quitan/suavizan
  cifras y afirmaciones no verificables. Sin AI-hype ni promesas exageradas (tono editorial AgentesVA).

## Fuera de alcance / futuro

- Muro de pago "real" con auth (el sitio es estático; v1 usa entrega por enlace no listado).
- Guardado de favoritos; búsqueda avanzada por herramienta.
