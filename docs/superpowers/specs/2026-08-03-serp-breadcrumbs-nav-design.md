# SERP features — migas de pan visibles y columna vertebral de navegación

**Fecha:** 2026-08-03
**Objetivo:** conseguir sitelinks de marca y resultados enriquecidos de miga de pan
haciendo que la navegación del sitio sea consistente, rastreable y coherente entre
el HTML y el JSON-LD.

## Problema

Auditoría del código antes de empezar:

1. **No hay migas de pan visibles en ninguna página.** Existe `BreadcrumbList` en
   JSON-LD en 13 tipos de página, pero sin ningún equivalente en HTML.
2. **`/#directorio` rompe la jerarquía de las fichas.** En
   `src/pages/herramienta/[slug].astro` el nivel 2 de la miga apunta a
   `${site}/#directorio` — un fragmento de la home, no `/herramientas`. El enlace
   visible «← Volver al directorio» hace lo mismo. Resultado: las 54 fichas de
   herramienta no envían ni un solo enlace interno a `/herramientas` ni a su
   página de categoría.
3. **Barras diagonales finales inconsistentes.** `${site}/estudios/` y
   `${site}/noticias/` la llevan; `${site}/herramientas`, `${site}/recursos` y
   `${site}/cursos` no. Verificado contra un build real: los `<link rel="canonical">`
   y el sitemap **sí** la llevan, así que tres secciones declaran en su miga una URL
   que no coincide con su propio canonical.
4. **El header y el footer no coinciden.** El header lista 6 enlaces
   (Herramientas, Cursos, Recursos, Estudios, Noticias, Pack gratis); el footer
   lista 7 (Herramientas, Estudios, Noticias, Newsletter, Privacidad, Aviso legal,
   Cookies) — omite Cursos y Recursos. La navegación inconsistente debilita la
   señal de la que Google deriva los sitelinks.
5. **`Pack gratis` apunta a `/#pack`**, un fragmento. Un fragmento nunca puede
   convertirse en sitelink, así que esa ranura de navegación no aporta nada.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Alcance | Sitelinks y migas juntos: una sola reforma de navegación |
| Profundidad en fichas | 4 niveles, manteniendo las URLs planas (sin redirecciones) |
| Ranura «Pack gratis» | Fuera del `<nav>`; sigue como CTA y sección de la home |
| Miga visible | Sustituye al enlace «← Volver a X» en su misma ranura |
| Amplitud | Ajustada: columna de navegación + migas. Sin extras especulativos |

**Enfoque elegido:** constructor puro en TS más componente presentacional. El
array `trail` compartido es lo que garantiza la paridad entre el HTML y el JSON-LD,
mantiene un solo `@graph` por página y encaja con el patrón de módulo puro con
tests unitarios que ya sigue `src/data/schema.ts`.

Descartado: un componente que emita también su propio `ld+json` (dejaría dos
scripts sueltos por página y quedaría fuera de la cobertura de Vitest, que sólo
prueba módulos TS puros). Descartado: derivar la miga de `Astro.url.pathname` (no
puede producir el nivel de categoría, que no está en `/herramienta/[slug]`, ni
recuperar nombres legibles).

## Diseño

### 1. `src/data/breadcrumbs.ts`

```ts
export interface Crumb { name: string; url: string }   // url = ruta relativa al sitio

export const HOME: Crumb;
export const trail = (...rest: Crumb[]): Crumb[]        // antepone HOME
export const crumbUrl = (path: string): string          // absoluta + barra final
export const breadcrumbList = (crumbs: Crumb[])         // nodo BreadcrumbList
export const catSlug = (cats, nombre): string | undefined
```

`catSlug` es imprescindible y **no** se puede sustituir por slugificación. Las
herramientas slugifican limpio (`Vídeo` → `video`), pero los cursos no:
`"IA para tu negocio"` → `negocio`, `"Fundamentos de IA"` → `fundamentos`,
`"Prompts e ingeniería de prompts"` → `prompts`. La resolución tiene que pasar por
la colección `*-categorias`, que es además como ya filtra
`src/pages/cursos/[categoria].astro`.

Verificado: los 10 valores de `cat` de las herramientas resuelven contra
`categories`.

### 2. `src/components/Breadcrumb.astro`

Sólo presentación. Recibe `trail: Crumb[]`, renderiza
`<nav aria-label="Ruta de navegación"><ol>`, con la última miga como
`<span aria-current="page">` en vez de enlace. Reutiliza el estilo mono/11px/
mayúsculas/`navlink` de los enlaces de vuelta actuales y conserva su
`data-pagefind-ignore` para que el cromo de navegación no entre en el índice de
búsqueda.

### 3. Inventario de rutas (15 tipos)

| Ruta | Miga |
|---|---|
| `/herramientas/` · `/cursos/` · `/recursos/` · `/estudios/` · `/noticias/` | Inicio › {Sección} |
| `/herramientas/[cat]/` · `/cursos/[cat]/` · `/recursos/[cat]/` | Inicio › {Sección} › {nombre} |
| `/herramienta/[slug]/` · `/curso/[slug]/` · `/recurso/[slug]/` | Inicio › {Sección} › {categoría} › {título} |
| `/estudios/[slug]/` · `/noticias/[slug]/` | Inicio › {Sección} › {título} |
| `/privacidad/` · `/aviso-legal/` · `/cookies/` · `/newsletter/` | Inicio › {Título} |

Excluidas: `/` (raíz), `/404`, `/buscar`, `/gracias`, `/descarga` (noindex o error).

**Degradación:** si la categoría de una ficha no resuelve, la miga baja a 3 niveles
en lugar de emitir un enlace roto. Hoy no lo dispara ningún contenido, pero las
categorías son datos editables.

### 4. Correcciones que arrastra

- `/#directorio` → `/herramientas/` en el JSON-LD y en el enlace visible de las
  fichas de herramienta.
- Normalización de la barra final vía `crumbUrl`.
- Los 13 bloques `BreadcrumbList` escritos a mano se reducen a
  `breadcrumbList(trail)` añadido al `@graph` que ya tiene cada página. Se mantiene
  un solo grafo por página.

### 5. Navegación

- **Header:** se quita `Pack gratis` del `<nav>`; quedan 5 enlaces. La sección
  `#pack` de la home, su banner y el CTA `Suscríbete` no se tocan: el embudo no
  cambia.
- **Footer:** el `<nav>` principal pasa a ser esas mismas 5 secciones, en el mismo
  orden y con el mismo texto de ancla que el header. Newsletter y las tres páginas
  legales se mueven a una fila secundaria separada visualmente.

**No se añade `SiteNavigationElement`:** Google indica que no lo usa para
sitelinks.

## Tests

`tests/breadcrumbs.test.ts`, siguiendo el patrón de módulo puro de `tests/`:

- `breadcrumbList` emite `position` de 1 a n y los `@type` correctos
- `crumbUrl` normaliza `/`, `/herramientas` y `/herramientas/` a una sola forma
- `catSlug` resuelve un `nombre` exacto y devuelve `undefined` con uno desconocido
- miga de 4 niveles construida desde una herramienta y un fixture de categorías
- degradación a 3 niveles cuando la categoría no resuelve
- paridad: el mismo array alimenta al componente y al JSON-LD

Antes de fusionar, comprobación manual con la prueba de resultados enriquecidos de
Google sobre una ficha, una página de categoría y un índice.

## Fuera de alcance

- Enlazado cruzado entre categorías hermanas
- Reestructuración de URLs a `/herramientas/[cat]/[slug]`
- Auditoría completa del grafo de enlaces internos
- Resto de resultados enriquecidos (FAQ, valoraciones, carruseles)

## Lo que cambió durante la implementación

Correcciones al diagnóstico inicial y desviaciones respecto a lo diseñado:

1. **Sí había migas visibles.** 13 páginas ya tenían una miga escrita a mano
   (`aria-label="Migas"`); la búsqueda inicial no distinguía mayúsculas y no las
   encontró. Sólo las 3 fichas carecían de ella. No cambia el diseño — el
   componente las sustituye — pero además estaban desalineadas entre sí
   (`letter-spacing` 0.06em frente a 0.08em, sin `aria-current`).

2. **Las migas de estudios y noticias contradecían su propio JSON-LD.** La miga
   visible terminaba en `{d.tema}` (el tema) y el marcado en `d.titulo`. Google
   exige que coincidan. El array compartido lo resuelve en `titulo`, que es la
   última miga correcta.

3. **La normalización de la barra final se amplió.** El diseño la limitaba a las
   migas, pero la misma incoherencia aparecía en `CollectionPage.url`, en los
   `ItemList`, en los `href` de las tarjetas y en 72 enlaces internos dentro del
   markdown de estudios y noticias. Arreglar sólo las migas habría dejado el HTML
   y el JSON-LD discrepando en sentido contrario. Todo pasa ahora por `crumbUrl`
   y `crumbPath`. Verificado: 0 enlaces internos sin barra final en el build.

4. **`/newsletter` se quedó sin miga.** Su `<main>` empieza con una sección hero a
   sangre y centrada; meter una miga alineada a la izquierda exigía añadir un
   contenedor y alterar visualmente una página de conversión. El beneficio de una
   miga de 2 niveles no lo justifica. Queda pendiente de decisión.

5. **`/buscar` sí la lleva.** Ya tenía miga a mano; se convirtió al componente por
   coherencia. Es `noindex`, así que no emite `BreadcrumbList`: es la única página
   con miga visible sin marcado, y es intencionado.

6. **Las tres páginas legales ganaron `BreadcrumbList`.** Tenían miga visible sin
   marcado. `privacidad` no tenía ningún JSON-LD; ahora emite `WebPage` +
   `BreadcrumbList` como sus hermanas.

### Verificado en el build

- 116 páginas con miga visible **y** `BreadcrumbList`; sólo `/buscar` visible sin
  marcado (`noindex`, intencionado)
- 0 referencias a `/#directorio`, 0 `aria-label="Migas"`, 0 fragmentos en el `<nav>`
- Enlaces internos entrantes: `/herramientas/` 306 · hubs de categoría de
  herramientas 70 (antes 10) · cursos 21 · recursos 8
- `<nav>` del header y del footer: idénticos en orden y texto de ancla
- 108 tests en verde; build limpio
