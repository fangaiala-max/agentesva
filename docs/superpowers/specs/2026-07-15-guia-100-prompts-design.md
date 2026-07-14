# Guía de 100 prompts de IA — diseño

**Fecha:** 2026-07-15
**Estado:** Aprobado (dirección) — pendiente de plan de implementación
**Autor:** Fernando + Claude

## Objetivo

Publicar en AgentesVA una **biblioteca navegable y gratuita de 100 prompts de IA**
de alta calidad para PyMEs hispanohablantes (España + LATAM), como nuevo recurso de
la tienda (`/recursos`). Los prompts se ven, se filtran y se copian directamente en
la web — sin PDF ni muro de email.

Sirve a dos fines: aportar valor inmediato (herramienta útil de verdad) y SEO
(100 prompts = mucho contenido indexable y long-tail).

## Decisiones (confirmadas con el usuario)

1. **Formato:** página navegable con filtros por categoría y botón *Copiar* por prompt.
2. **Precio:** Gratis, sin gate de email.
3. **Recurso:** nuevo. Se mantiene el `pack-30-prompts` existente (dos escalones: 30 rápido / 100 completo).
4. **Contenido:** los prompts NO se copian de la lista de Gemini tal cual — se
   **reescriben y mejoran estructuralmente** a un estándar de alta calidad.

## Alcance

**Incluye:**
- 100 prompts reescritos, tipados, agrupados por categoría → subcategoría.
- Página de recurso que renderiza la biblioteca navegable.
- Filtrado por categoría (pestañas) y copiar-al-portapapeles (cliente).
- Ficha del recurso en la tienda (`/recursos`) que enlaza a la biblioteca.
- Tests de integridad del dataset.

**No incluye (YAGNI):**
- Buscador de texto dentro de los prompts (los filtros por categoría bastan; Pagefind
  ya indexa la página para el buscador global del sitio).
- PDF descargable ni captura de email (decisión explícita: navegable y gratis).
- Favoritos/guardado de prompts individuales.
- Paginación (100 tarjetas ligeras renderizan bien en una página estática).

## Estándar de calidad de los prompts

Cada prompt se reescribe con la estructura **Rol + Contexto + Tarea + Restricciones +
Formato**, explícita y limpia:

- **Español neutro** apto para España y LATAM (evitar modismos regionales).
- Placeholders claros entre corchetes: `[producto/servicio]`, `[audiencia]`, etc.
- Restricciones útiles (tono, longitud, marco de copy, "sin inventar datos").
- Formato de salida especificado (tabla, lista, nº de variantes…).
- Sin promesas exageradas ni afirmaciones no verificables (coherente con el tono
  editorial de AgentesVA, sin AI-hype).

**Ejemplo (antes → después):**

> **Antes (Gemini):** "Actúa como un Copywriter de respuesta directa experto en
> psicología del consumidor. Redacta un texto de ventas de 300 palabras para
> [producto/servicio]... Termina con una llamada a la acción clara."

> **Después:**
> **Rol:** Copywriter de respuesta directa con experiencia en psicología del consumidor.
> **Contexto:** Vendo `[producto/servicio]` a `[audiencia]`. Su dolor principal es
> `[dolor]` y su mayor deseo es `[resultado deseado]`.
> **Tarea:** Escribe un texto de ventas de ~300 palabras que agite ese dolor y presente
> mi producto como la solución evidente.
> **Restricciones:** Tono cercano, sin tecnicismos; usa la fórmula PAS; nada de promesas
> que no pueda cumplir.
> **Formato:** Titular + 3 párrafos + 2 variantes de llamada a la acción.

## Taxonomía (100 prompts = 4 × 5 × 5)

1. **Por industria** (25): Marketing · Ventas B2B/B2C · Tecnología/Software · RR.HH. · Finanzas/Legal
2. **Por resultados / KPIs** (25): Conversión (CRO) · SEO/Tráfico · Productividad · Retención (LTV) · Captación de leads
3. **Mejores casos de uso** (25): Análisis de datos · Creatividad · Simulación de roles · Copywriting · Negociación
4. **Por objetivos estratégicos** (25): Reducción de costes · Expansión/GTM · Aprendizaje · Estrategia · Marca personal

## Arquitectura

Piezas aisladas, cada una con un propósito claro:

### `src/data/prompts.ts`
Fuente de datos tipada. Tipos y helpers; sin JSX.

```ts
export interface Prompt {
  id: number;               // 1..100, único y estable
  titulo: string;           // título corto del caso de uso
  categoria: CategoriaId;   // 'industria' | 'resultados' | 'casos' | 'objetivos'
  subcategoria: string;     // p. ej. 'Marketing'
  texto: string;            // prompt reescrito (multilínea, con Rol/Contexto/...)
}
export type CategoriaId = 'industria' | 'resultados' | 'casos' | 'objetivos';
export interface Categoria { id: CategoriaId; nombre: string; desc: string; }

export const CATEGORIAS: Categoria[];   // orden de las pestañas
export const PROMPTS: Prompt[];         // los 100
export function promptsPorCategoria(id: CategoriaId): Prompt[];
export function subcategorias(id: CategoriaId): string[];
```

### `src/components/PromptLibrary.astro`
Render de la biblioteca dentro del sistema "Futurista":
- Barra de pestañas de categoría (incl. "Todas") — `data-categoria` para el filtro.
- Prompts agrupados por subcategoría (encabezado mono en mayúsculas, estilo del sitio).
- Cada prompt = tarjeta con: nº + título, cuerpo en `<pre>`/monoespaciada legible, y
  botón *Copiar* (`data-prompt-copy`, texto en `data-prompt-text` o leído del DOM).
- Accesible: pestañas con `aria`, botón con estado (`Copiar` → `¡Copiado!`).

### `src/scripts/prompts.ts`
Cliente (idempotente, se ata en `astro:page-load` como el resto del sitio):
- `initPromptFilter()`: filtra tarjetas/grupos según la pestaña activa.
- `initPromptCopy()`: `navigator.clipboard.writeText`; feedback temporal en el botón;
  fallback si clipboard no está disponible.

### `src/content/recursos/guia-100-prompts.json`
Ficha del recurso:
```json
{
  "titulo": "Guía de 100 prompts de IA para tu negocio",
  "tipo": "prompts",
  "categoria": "Productividad",
  "desc": "100 prompts de IA listos para copiar, organizados por industria, resultados y objetivos.",
  "long": "...",
  "tagline": "...",
  "ideal": "...",
  "formato": "Web · 100 prompts",
  "precio": "Gratis",
  "biblioteca": "prompts",
  "gated": false,
  "color": "#5B7CFF",
  "orden": 5,
  "destacado": true,
  "actualizado": "2026-07-15"
}
```

### `src/content.config.ts` (cambio de schema)
- Añadir campo opcional `biblioteca: z.enum(['prompts']).optional()`.
- Relajar el `superRefine`: un recurso **Gratis con `biblioteca`** NO requiere
  `downloadUrl` ni `gated` (se consume en la propia página). Regla nueva:
  `if (precio === 'Gratis' && !downloadUrl && !gated && !biblioteca) → error`.

### `src/data/recursos.ts` (tipo)
- Añadir `biblioteca?: 'prompts'` a la interfaz `Recurso`.

### `src/pages/recurso/[slug].astro` (hook de render)
- Cuando `recurso.biblioteca === 'prompts'`:
  - Renderizar `<PromptLibrary />` en el cuerpo principal (sustituye/complementa el
    bloque genérico "Qué es / Para quién / FAQ" — se mantiene una intro breve arriba).
  - CTA primario del héroe pasa a "Explorar los 100 prompts ↓" (ancla a la biblioteca)
    en vez del CTA de descarga/newsletter.
  - Importar y arrancar `initPromptFilter` / `initPromptCopy` junto a los scripts existentes.

## Datos / SEO

- `Product` + `offers.price = "0"` ya funciona para Gratis (lógica existente en el template).
- La página queda indexable (`data-pagefind-body`), aportando 100 bloques de texto long-tail.

## Testing (objetivo 100% cobertura)

`tests/prompts.test.ts`:
- `PROMPTS.length === 100`.
- Ids únicos y correlativos (1..100).
- Toda `categoria` ∈ `CATEGORIAS`; toda `subcategoria` no vacía.
- Cada prompt: `titulo` y `texto` no vacíos; `texto` contiene la estructura mínima
  (p. ej. incluye "Rol" o los marcadores del framework).
- 25 prompts por categoría (4 × 25).
- Helpers: `promptsPorCategoria` devuelve solo la categoría pedida y suma 100 en total;
  `subcategorias` devuelve 5 por categoría, sin duplicados.

## Riesgos / consideraciones

- **Volumen de contenido:** reescribir 100 prompts con calidad es la mayor parte del
  trabajo. Se hará por lotes/categorías para mantener consistencia de tono.
- **Peso de página:** 100 tarjetas estáticas; sin JS pesado. El filtro solo togglea
  `hidden`. Aceptable.
- **Coherencia de diseño:** reutilizar tokens/variables de `global.css`; no introducir
  estilos nuevos fuera del sistema.

## Fuera de alcance / futuro

- Versión PDF descargable como lead magnet aparte (si más adelante se quiere captar email).
- Búsqueda/etiquetas por herramienta (ChatGPT/Claude/Gemini) dentro de la biblioteca.
