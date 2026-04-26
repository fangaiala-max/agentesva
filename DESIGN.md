# AgentesVA Design System v2 — Editorial cálido

**Aplicado:** 2026-04-26 (origen: AgentesVA Redesign Standalone.html, Version A)
**Tono:** humano, profesional, editorial. Antítesis de "AI hype slop".

## 1. Paleta de color

### Neutros (paper / ink)
| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#F7F3EC` | Fondo principal cálido (cream) |
| `--paper-2` | `#EFE8DC` | Fondo de secciones secundarias |
| `--paper-3` | `#E5DCC8` | Acentos sutiles |
| `--card` | `#FFFEFB` | Tarjetas elevadas |
| `--ink` | `#1A1814` | Texto principal, fondos oscuros |
| `--ink-2` | `#3D362C` | Texto secundario |
| `--ink-3` | `#6B6253` | Texto terciario, eyebrows |
| `--ink-4` | `#9A8F7C` | Texto deshabilitado |
| `--line` | `#D9CFB8` | Bordes |
| `--line-soft` | `#E8DFCC` | Bordes suaves |

### Acento primario — Clay (terracota cálido)
| Token | Hex | Uso |
|---|---|---|
| `--clay` | `#C2543A` | Acentos primarios, italic emphasis |
| `--clay-deep` | `#9C3F2A` | Hover |
| `--clay-soft` | `#E8B5A4` | Underline tones |
| `--clay-wash` | `#F4DDD2` | Backgrounds suaves |

### Secundarios
| Token | Hex | Uso |
|---|---|---|
| `--forest` | `#2F4A3A` | Estados positivos / "after" |
| `--forest-soft` | `#5C7868` | Borders forest |
| `--forest-wash` | `#DFE7E0` | Backgrounds positivos |
| `--sand` | `#E8C77E` | Highlights amarillos |
| `--sand-wash` | `#F5E9CC` | Backgrounds sand |

## 2. Tipografía

| Familia | Uso | Token |
|---|---|---|
| **Fraunces** (serif) | Headings, italic emphasis. **DISPLAY signature.** | `--serif` |
| **Inter Tight** (sans) | Body, UI | `--sans` |
| **JetBrains Mono** | Eyebrows, labels, métricas, codes | `--mono` |

### Escalas
- `h1` — clamp(48px, 6vw, 84px), letter-spacing -0.02em, line 1.05
- `h2` — clamp(36px, 4.2vw, 56px)
- `h3` — clamp(22px, 2vw, 28px)
- Body — 15px, line 1.5
- Eyebrow — 11px, letter-spacing 0.16em, uppercase, mono

### Patrón signature
```html
<h1 class="serif">
  Texto normal con
  <em>énfasis italic clay</em>
  o
  <span class="underline">underline soft</span>
</h1>
```

## 3. Espaciado y layout

- `--max: 1240px` container
- Padding lateral: 32px desktop, 20px mobile
- Padding vertical sección: **120px desktop**
- Gap interno: 48-64px

## 4. Forma

- `--r-sm: 6px` chips, tags
- `--r-md: 10px` cards small
- `--r-lg: 16px` cards principales
- `--r-xl: 24px` CTA cards grandes
- Botones: 999px (pill)

## 5. Sombras

- `--sh-sm` sutil
- `--sh-md` cards interactivas
- `--sh-lg` portrait, hero illus

## 6. Componentes signature

### Hero block
- Grid 1.1fr / 0.9fr
- H1 `clamp(52px, 6.5vw, 96px)` con `<em>` italic-clay
- Lead 19px ink-2
- CTA pill ink → paper
- 3 métricas border-top/bottom con número serif italic
- Industries row con tags al pie

### Stats band (dark)
- Background `--ink`, color `--paper`
- 4 columnas con números serif 80px
- Borders translúcidos blancos
- `<em>` numerals en `--clay-soft`

### Pain grid (problem)
- 3 cols
- Cards `--card` con borde `--line-soft`
- "PAIN 0X / 06" mono uppercase clay
- Hover lift translateY(-2px)

### Before/After
- Grid 1fr auto 1fr con flecha "→" italic clay 48px
- Card "before" gradient → clay-wash
- Card "after" gradient → forest-wash
- Listas con icon circle: − clay / ✓ forest

### Process steps
- 4 circles, primero clay, segundo clay-wash, tercero ink, cuarto sand
- Línea horizontal connector

### Testimonials
- Featured card dark (ink), regulares card cream
- Quote serif 22-28px con "" decorativa serif italic
- Result tag mono pequeño verde forest

### CTA card
- Dark ink rounded xl
- Radial gradient clay top-right
- 1.3fr / 1fr grid
- Botón paper sobre ink

## 7. Reglas de uso

### Voz visual
- **Italic = clay siempre.** No usar italic sin clay.
- **Eyebrows = mono uppercase.** No mezclar con sans en su rol.
- **Números grandes = serif italic.** Especialmente em dentro: `+<em>60</em>%`
- **No drop shadows random.** Solo los 3 tokens definidos.

### Anti-patrones
- ❌ Gradientes blue/purple (visto en mil sitios SaaS)
- ❌ Iconografía geométrica fría
- ❌ Sans-serif everything
- ❌ Color primario "vibrante" tipo brand-blue
- ✅ Editorial calidez, contraste sobrio, italic emphasis
- ✅ Mono labels para detalles técnicos
- ✅ Números grandes serif para autoridad

## 8. Aplicación

CSS en `/assets/redesign-v2.css`. Reemplaza Tailwind+M3 anterior por este sistema.

Uso típico:
```html
<link rel="stylesheet" href="/assets/redesign-v2.css">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<div class="dirA">
  <nav class="dirA-nav">...</nav>
  <section class="dirA-hero">...</section>
  <section class="dirA-stats">...</section>
  ...
</div>
```

## 9. Migración del sitio

Aplica primero a:
1. **/index.html** (homepage) — full redesign
2. **/sobre/** — adapt to editorial system
3. **/precios/** — same
4. **/como-empezar/** — same
5. **/diagnostico/** — same

Mantener mientras coexiste:
- HubSpot Forms API integration
- Mixpanel / GA4 tracking
- Schema.org JSON-LD
- Calendly URL: https://calendly.com/fangaiala/auditoria-gratis-agentesva-30-min

## 10. Adaptaciones AgentesVA-specific

El mockup original incluye placeholders que NO aplican a AgentesVA:
- ❌ "Diego Vargas" + foto del founder → **Anónimo + ilustración o block decorativo**
- ❌ "Casa Grumo Bogotá" → **Restaurante (anonimizado, +60% facturación)**
- ❌ "Medellín, Buenos Aires, CDMX" → **Madrid, Barcelona + LATAM**
- ❌ Logos cells "Casa Grumo, Lumina..." → **Industria + ciudad anonimizada o quitar**
- ❌ Founder section con foto → **Replace por sección "Sobre" con anonimato defendible** (ver /sobre/)
- ❌ "+40% facturación promedio" → **+60% (caso restaurante real)**
- ❌ Stack incluye Salesforce, Stripe → **Mantener solo herramientas reales: Make, Claude, HubSpot, WhatsApp Business, OpenAI, Resend**

Casos reales que SÍ aplican:
- Restaurante +60% facturación (€25k→€40k/mes)
- Escuela de idiomas +60% alumnos (500→800)
- Renting de camiones +70% utilización (40%→68%)

Posicionamiento Spain-primary se aplica en:
- Hero copy
- Industries badges
- Footer ("desde España, operación remota a LATAM")
- Geo meta tags (ya migrado)
