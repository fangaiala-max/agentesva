# Sistema de diseño — AgentesVA

> **Fuente de verdad visual.** Sustituye por completo a la marca anterior ("fintech AI-visibility SaaS", verde/ámbar/rojo + Geist) — concepto abandonado en el pivote a **directorio/medio de IA en español** (ver `docs/superpowers/specs/2026-06-21-agentesva-directory-business-brief.md`).
>
> Dos artefactos lo definen, ambos de claude.ai/design (proyecto "AgentesVA Newsletter y captación"):
> - **Identidad de marca** → `AgentesVA - Brand & Social Kit` (logo, tipografía, color, assets sociales).
> - **Tema web** → `AgentesVA - Futurista` (home oscura del directorio + fichas), implementado en `src/`.
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
| Verde estado | `#4FD39A` | "en vivo / activo" (`--green`) |

---

## 2. Tema web "Futurista" (directorio, tema oscuro)

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

### Patrones de interacción (clases en `global.css`)
- `.lift` — hover: translateY(−5px) + borde claro + glow azul.
- `.navlink` / `.chip` — transiciones de color/borde.
- `.searchwrap:focus-within` — borde + glow azul al enfocar la búsqueda.
- `.reveal` — entrada scroll-driven (`view()`); **no usar en contenido primario** (queda opacity:0 hasta el scroll; el grid del directorio NO lo usa).

### Motion — "Confident, electric, restrained"

Tesis: el movimiento debe leerse como **intencional y vivo, nunca decorativo**. Reglas duras (validar todo contra ellas): solo `transform`/`opacity`/`filter` (GPU, sin animar layout); **sin runtime JS de animación** (mantiene `script-src 'self'` + Lighthouse 100); **todo respeta `prefers-reduced-motion`** (global en `global.css`). Inspiración de patrones modernos (21st.dev) implementada **nativa** (CSS + mínimo vanilla + Astro View Transitions).

**Ambiente (de fondo):** `auroraDrift`, `gridDrift`, `glowPulse` (logo/CTA), `marquee` (ticker), count-up de stats, cursor `blink`.

**Micro-interacciones:**
- `.lift` — hover de tarjetas (translateY + glow).
- **Spotlight** — glow radial que sigue al cursor en las fichas (`--mx/--my` desde un `pointermove` delegado; `motion.ts`).
- **Blur-in / text reveal** — entrada escalonada de eyebrow → H1 → subtítulo → búsqueda en el hero (`@keyframes blurIn`, `animation-delay`); titulares de sección vía scroll (`.reveal`).
- **Shimmer** — barrido diagonal en hover sobre los CTA primarios (`.shimmer::after`).
- **Borde animado** — borde conic-gradient giratorio (`@property --bd-angle`) en la tarjeta destacada del Pack (1 sitio).
- **Magnético** — el CTA del hero se desplaza ligero hacia el cursor (`data-magnetic`, `motion.ts`).

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

DM Serif Display + DM Sans + JetBrains Mono vía Google Fonts (`display=swap`). La CSP en `vercel.json` permite `fonts.googleapis.com` (style-src) y `fonts.gstatic.com` (font-src). Scripts de cliente externos (`script-src 'self'`; `vite.assetsInlineLimit=0`).
