# Sistema de diseño — AgentesVA

> **Fuente de verdad visual.** Sustituye por completo a la marca anterior ("fintech AI-visibility SaaS", verde/ámbar/rojo + Geist). El sistema nacido para el **directorio/medio de IA en español** también sostiene la ruta comercial de automatización que hoy abre la portada.
>
> Dos artefactos lo definen, ambos de claude.ai/design (proyecto "AgentesVA Newsletter y captación"):
> - **Identidad de marca** → `AgentesVA - Brand & Social Kit` (logo, tipografía, color, assets sociales).
> - **Tema web** → `AgentesVA - Futurista` (portada comercial, directorio y fichas), implementado en `src/`.
>
> Voz y copy: [`docs/brand-guidelines.md`](./docs/brand-guidelines.md).

---

## 1. Identidad de marca

### Logotipo
- **Wordmark:** `AgentesVA` en **DM Serif Display** (peso 400), tracking **−0.025em**.
- **Glifo:** `[IA]` en **JetBrains Mono** (600), superíndice, **siempre azul** — nunca otro color (`#5B7CFF` sobre oscuro, `#0040FF` sobre claro).
- **Monograma:** "A" serif + `[IA]`. Para avatares/app icon.
- **Margen de respeto** = altura de la "A" por los cuatro lados. **Ancho mínimo** del wordmark: 96px.

### Tipografía
| Rol | Fuente | Uso |
|---|---|---|
| Display / titulares / wordmark | **DM Serif Display** | H1 de marca, héroes, OG, banners (`--serif`) |
| Cuerpo / UI | **DM Sans** | párrafos, botones, tarjetas (`--sans`) |
| Etiquetas / datos / mono | **JetBrains Mono** | eyebrows, badges, números (`--mono`) |

### Color
| Token | Hex | Uso |
|---|---|---|
| Navy "Confianza" | `#0A1A33` | fondo principal (superficie oscura) |
| Azul primario | `#0040FF` | marca sobre superficies claras (`--blue-deep`) |
| Azul acento | `#5B7CFF` | acento sobre superficies oscuras (`--accent`) |
| Claro | `#FAFAF7` | superficie clara |
| Gris | `#6B6B6B` | texto secundario sobre claro |
| Verde estado | `#4FD39A` | positivo / disponible (`--green`) — ver §2 "Píldoras" |
| Ámbar destacado | `#F5C451` | distinción editorial (`--gold`) — ver §2 "Píldoras" |

---

## 2. Tema web "Futurista" (comercial + editorial, tema oscuro)

Implementado en `src/styles/global.css` (tokens) + componentes. **Lee `global.css` antes de tocar UI.**

### Superficies (navy "Confianza")
`--bg #0A1A33` · `--bg-2 #0C1E3C` · `--panel #0E2444` · `--panel-2 #122B52` · `--panel-3 #0E2342` · `--grid #16315C`
Líneas: `--line #1E365F` · `--line-2 #2A4877` · `--line-3 #3E5E90` (hover).

### Texto
`--fg #EAEEF6` · `--fg-strong #fff` · `--fg-2 #C7D3E9` · `--fg-3 #94A4C2` · `--fg-4 #7F92B4` · `--fg-5 #8094B7`.

### Componentes (`src/components/`)
- `SiteHeader` — ticker marquee + cabecera sticky con blur. Logo serif + nav mono.
- `SiteFooter` — pie minimal.
- `ToolCard` — tarjeta de herramienta (stretched-link → ficha; botón marcador independiente).
- `ArticleCard` — tarjeta de artículo, compartida por `/noticias` y `/estudios`. Props opcionales `destacada` (portada a todo el ancho, escala tipográfica mayor) y `badges: Badge[]` (distintivos calculados en build por `src/data/noticias-badges.ts`). Lleva la afordancia "Leer →" y fechas con cifras tabulares en `<time>` semántico.

La lógica del listado vive fuera del `.astro`, como funciones puras testeables:
- `src/data/noticias-badges.ts` — `badgesDeNoticias` / `temasEnTendencia`, con las ventanas `DIAS_NUEVO` (7), `DIAS_TENDENCIA` (30) y `MIN_DIAS_TENDENCIA` (2 días distintos).
- `src/data/noticias-meses.ts` — `agruparPorMes` / `etiquetaDeMes`, rótulos de mes en es-ES **resueltos en UTC** (las fechas del frontmatter llegan a medianoche UTC; resolverlas en la zona de la máquina de build metería el día 1 en el mes anterior).
- `Badge` — píldora del directorio (`src/data/tools.ts` → `badgesFor`). Es la **receta canónica** de píldora del sitio: mono 9px, `letter-spacing 0.08em`, mayúsculas, `padding 2px 8px`, `border-radius 20px`, color al 100% / borde al 40% / fondo al 12%. Cualquier píldora nueva copia esta receta y solo cambia el token de color.

La portada (`src/pages/index.astro`) coloca antes del directorio una ruta comercial con diagnóstico, tres servicios, entregables, proceso, precio inicial y CTA de cierre. La búsqueda y el catálogo siguen en la misma página como exploración secundaria.

### Píldoras (badges) — semántica por dominio

`--green` y `--gold` **no tienen un significado global único**: se reinterpretan según el dominio de la tarjeta. Decisión consciente (aprobada), no un descuido. Lo que se mantiene constante es el *tono* — verde = hecho positivo y verificable, ámbar = distinción escasa que merece la vista — mientras que la etiqueta concreta la fija el contexto.

| Token | En fichas/tarjetas de herramienta (`Badge.astro`) | En tarjetas de noticia (`ArticleCard.astro`) |
|---|---|---|
| `--green` | **"Plan gratis"** (`kind: free`) | **"Nuevo"** (publicada en los últimos 7 días) |
| `--gold` | **"★ Editor"** — Elección del editor (`kind: editor`) | **"Tendencia"** (el tema vuelve en 2+ días distintos dentro de 30) |
| `--accent` | **"Popular"** (`kind: popular`) | — |
| `--fg-3` / `--panel-2` | **"Nuevo"** neutro (`kind: nuevo`) | — |

Reglas al añadir una píldora nueva:
- No mezcles dominios en una misma tarjeta: dentro de un contexto, un color significa una sola cosa.
- Máximo un distintivo por noticia. El prop `badges` es un array (contrato genérico del componente), pero el cálculo de `noticias-badges.ts` emite 0 o 1: "Tendencia" nunca se pinta sobre algo que ya es "Nuevo" (dirían lo mismo; el valor está en marcar el archivo caliente).
- Los distintivos de noticias se derivan del contenido en build, sin analítica ni BD (`src/data/noticias-badges.ts`).

### Patrones de interacción (clases en `global.css`)
- `.lift` — hover: translateY(−5px) + borde claro + glow azul.
- `.navlink` / `.chip` — transiciones de color/borde.
- `.searchwrap:focus-within` — borde + glow azul al enfocar la búsqueda.
- `.reveal` — entrada scroll-driven (`view()`); **no usar en contenido primario** (queda opacity:0 hasta el scroll; el grid del directorio NO lo usa).

### Motion — "Confident, electric, restrained"

Tesis: el movimiento debe leerse como **intencional y vivo, nunca decorativo**. Reglas duras (validar todo contra ellas): solo `transform`/`opacity`/`filter` (GPU, sin animar layout); CSS para la coreografía continua y **vanilla JS mínimo, agrupado por frame**, solo para puntero, contadores y ciclo de vida; **todo respeta `prefers-reduced-motion`** en tiempo real. Inspiración de patrones modernos (21st.dev) implementada **nativa** (CSS + vanilla JS + Astro View Transitions), compatible con `script-src 'self'` y Lighthouse 100.

**Ambiente (de fondo):** `auroraDrift`, `gridDrift`, `glowPulse` (logo/CTA), `marquee` (ticker), count-up de stats, cursor `blink`.

`BaseLayout.astro` es el único propietario del ciclo de movimiento: inicializa `motion.ts` en `astro:page-load` y lo desmonta en `astro:before-swap`. Los bucles ambientales se pausan fuera de pantalla o con la pestaña oculta; los cambios de movimiento reducido o capacidad del puntero reinician el sistema sin recargar la página.

**Micro-interacciones:**
- `.lift` — hover de tarjetas (translateY + glow).
- **Spotlight** — glow radial que sigue al cursor en las fichas (`--mx/--my` desde un `pointermove` delegado; `motion.ts`).
- **Blur-in / text reveal** — entrada escalonada limitada al eyebrow y a la tarjeta lateral del hero (`@keyframes blurIn`, `animation-delay`); titulares de sección vía scroll (`.reveal`). **Nunca sobre contenido esencial ni sobre el elemento LCP**: H1, explicación, acciones y señales de confianza de la portada se renderizan visibles desde el primer frame.
- **"Leer →"** — hover/focus de `ArticleCard`: el texto pasa a `--accent` y la flecha se desplaza 3px (`translateX`), con rama de `prefers-reduced-motion`.
- **Shimmer** — barrido diagonal en hover sobre los CTA primarios (`.shimmer::after`).
- **Borde animado** — borde conic-gradient giratorio (`@property --bd-angle`) en la tarjeta destacada del Pack (1 sitio).
- **Magnético** — el CTA de diagnóstico de la cabecera se desplaza ligero hacia el cursor (`data-magnetic`, `motion.ts`).

**Transiciones de página:** **Astro View Transitions** (`<ClientRouter/>`): morph con elemento compartido (el monograma de la herramienta, `transition:name="mono-<slug>"`) entre listado/home y ficha. Los scripts de página se re-inicializan en `astro:page-load`.

**Evitar (mismatch de marca / perf / a11y):** cursor trails, partículas, blobs, parallax, scroll-jacking, overshoot de muelle en todo, animar las 52 tarjetas a la vez, cualquier animación sin ruta de `reduced-motion`.

### Accesibilidad
- Foco visible (`:focus-visible` outline azul) en todo interactivo.
- `aria-label` / `aria-pressed` en botones de icono (marcador, chips).
- `prefers-reduced-motion` respetado; labels ocultas (sr-only) en inputs.
- Botones de icono ≥ 44px de área táctil (hit area con padding negativo).

---

## 3. Assets de marca

Generados y versionados en `public/brand/` (índice + tamaños en `public/brand/README.md`). `public/og.png` (1200×630) es el og:image por defecto (en `BaseLayout`). Fuentes regenerables con `node brand-build/gen.mjs` (gitignored).

| Asset | Tamaño |
|---|---|
| `og.png` | 1200 × 630 |
| `brand/avatar.png` · `avatar-blue.png` | 512 × 512 |
| `brand/twitter-header.png` | 1500 × 500 |
| `brand/linkedin-banner.png` | 1584 × 396 |
| `brand/facebook-cover.png` | 1200 × 630 |
| `brand/substack-header.png` | 1200 × 400 |
| `brand/instagram-post.png` | 1080 × 1080 |
| `brand/instagram-story.png` | 1080 × 1920 |

---

## 4. CSP / fuentes

DM Serif Display + DM Sans Variable + JetBrains Mono Variable **self-hosted** vía `@fontsource` / `@fontsource-variable` (woff2 desde el propio bundle, `font-display: swap`), importadas en `BaseLayout.astro`. La CSP en `vercel.json` **no** permite dominios de fuentes externos (`style-src 'self' 'unsafe-inline'`; `font-src 'self' data:`). Scripts de cliente externos (`script-src 'self'`; `vite.assetsInlineLimit=0`).
