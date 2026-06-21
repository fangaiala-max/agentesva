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
| Negro | `#08080B` | fondo principal (superficie oscura) |
| Azul primario | `#0040FF` | marca sobre superficies claras (`--blue-deep`) |
| Azul acento | `#5B7CFF` | acento sobre superficies oscuras (`--accent`) |
| Claro | `#FAFAF7` | superficie clara |
| Gris | `#6B6B6B` | texto secundario sobre claro |
| Verde estado | `#4ec98a` | "en vivo / activo" (`--green`) |

---

## 2. Tema web "Futurista" (directorio, tema oscuro)

Implementado en `src/styles/global.css` (tokens) + componentes. **Lee `global.css` antes de tocar UI.**

### Superficies (oscuro)
`--bg #08080B` · `--bg-2 #0a0a0f` · `--panel #0b0b12` · `--panel-2 #0c0c14` · `--panel-3 #0d0d15`
Líneas: `--line #1c1c24` · `--line-2 #262632` · `--line-3 #3a3a52` (hover).

### Texto
`--fg #ededf0` · `--fg-strong #fff` · `--fg-2 #cfcfda` · `--fg-3 #a5a5b2` · `--fg-4 #8a8a99` · `--fg-5 #6a6a78`.

### Componentes (`src/components/`)
- `SiteHeader` — ticker marquee + cabecera sticky con blur. Logo serif + nav mono.
- `SiteFooter` — pie minimal.
- `ToolCard` — tarjeta de herramienta (stretched-link → ficha; botón marcador independiente).

### Patrones de interacción (clases en `global.css`)
- `.lift` — hover: translateY(−5px) + borde claro + glow azul.
- `.navlink` / `.chip` — transiciones de color/borde.
- `.searchwrap:focus-within` — borde + glow azul al enfocar la búsqueda.
- `.reveal` — entrada scroll-driven (`view()`); **no usar en contenido primario** (queda opacity:0 hasta el scroll; el grid del directorio NO lo usa).

### Motion
Aurora (`auroraDrift`), rejilla (`gridDrift`), glow (`glowPulse`), marquee, count-up de stats, cursor `blink`. Todo bajo `@media (prefers-reduced-motion: reduce)` → desactivado.

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
