# Design System — AgentesVA

> Replaces the previous "Editorial cálido" consulting brand. AgentesVA is now a **product brand** for a fintech AI-visibility + accuracy SaaS. Reference mockups: `mockup-agentesva-sw.html` (chosen direction), `mockup-agentesva-dashboard.html` (app).

## Product Context
- **What this is:** AgentesVA — a self-serve SaaS that monitors how AI agents (ChatGPT, Gemini, Perplexity, Claude) **recommend** (visibility / Share of Answer) and **describe** (accuracy / risk on regulated claims) a fintech's products vs competitors, in Spanish + English (LATAM + Spain), and helps fix it.
- **Name:** AgentesVA = "Agentes Virtuales" (the AI agents the product monitors). Two pillars: **Visibilidad** + **Precisión**.
- **Who it's for:** Heads of Growth/Brand/Marketing + Compliance/Comms at LATAM & Spain neobanks, payments, lending, B2B fintech.
- **Space:** AI search visibility / GEO-AEO, data-intelligence SaaS (peer reference for *language only*: SimilarWeb). Differentiator vs horizontal tools: vertical fintech + bilingual LATAM depth + the **accuracy** pillar.
- **Brand posture:** product brand, **no public founder face** (founder restricted). Sister brand: **citable** (the done-for-you agency, light editorial/citation-blue). AgentesVA must read as *related in rigor, distinct in face* — bolder, data-SaaS, green.

## Aesthetic Direction
- **Direction:** confident data-intelligence SaaS. Dark hero → domain-search as the hero action → product dashboard as proof → clean light body. Evidence-led, modern, trustworthy. (SimilarWeb design *language*, not a clone.)
- **Decoration:** minimal-to-intentional. Rounded cards, soft shadows, one subtle radial glow on the dark hero. No gradients as accents, no AI-brain imagery, no stock photos, no purple.
- **Mood:** "a credible instrument a fintech CMO and a compliance lead both trust."
- **Reference:** `mockup-agentesva-sw.html`.

## Typography
- **Display/Hero:** Geist (700/800), tight tracking (-0.02 to -0.025em). Fallback: "Helvetica Neue", system-ui.
- **Body/UI:** Geist (400/500/600).
- **Data/Mono:** Geist Mono — scores, prompts, domains, metrics. Always `font-variant-numeric: tabular-nums`.
- **Loading:** self-host or Google/Bunny Fonts for Geist + Geist Mono.
- **Scale (16px base):** Display 54/56 · H1 42/44 · H2 36 · H3 23 · Body-lg 19 · Body 16 · Caption 13 · Mono 12-14.

## Color
Light body, dark hero/CTA. Green is the brand (visibility); amber + red are the other two verdicts.
- **Navy (hero/CTA bg):** `#0B1020` · deep variant `#111935`
- **Body bg:** `#F6F7F9` · **Surface:** `#FFFFFF` · **Mist (tracks/fills bg):** `#EEF1F6`
- **Ink (text):** `#0E1116` · **Slate (secondary):** `#5B6472` · **Line:** `#E5E8EE`
- **Green (PRIMARY — visibility):** `#16A34A` · bright (on dark) `#34D87E` · soft `#DCF3E4`
- **Amber (the gap / attention):** `#E0A52E`
- **Red (accuracy / false claim):** `#E0483A` · soft `#F8DDD9`
- **Semantic = brand:** green/amber/red are not generic states, they ARE the product's three verdicts (recommended / gap / false). Use them consistently with that meaning.
- **Ratio:** ~70% neutral (bg/surface), green as the confident accent, amber/red only on data verdicts.
- **Contrast:** Ink on body ≥ 14:1; bright green `#34D87E` on navy for dark-surface accents/CTAs.

## Spacing
- **Base:** 4px. **Density:** comfortable (it's a data product but must breathe).
- **Scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.

## Layout
- **Pattern:** dark hero (centered headline + domain search) → product-proof panel overlapping up into the page (`margin-top: -110px`) → "Medimos en" logo strip → light card-based sections → dark CTA block.
- **Hero action = the grader:** a white rounded search bar with a domain input + green button is the signature hero element. Always present.
- **Max content width:** 1180px. **Grid:** 12-col responsive; app dashboards use a 228px sidebar + fluid main.
- **Border radius:** sm 8px · md 10-12px · lg 14-16px · pill 999px.

## Motion
- **Approach:** intentional. Count-ups on metrics, bar-fill transitions (1.1s cubic-bezier(.2,.7,.2,1)), live-scan pulse dot. No decorative/scroll-jacking motion.
- **Easing:** enter ease-out · move ease-in-out. **Duration:** micro 80ms · short 150-250ms · data 900-1100ms.

## Components
- **Domain search (hero):** white pill, mono input, green primary button "Ver mi visibilidad ▸".
- **Product-proof panel:** white card, browser-dot bar, ES-vs-EN bars (green/amber), big amber gap number, ranked-competitor list, red accuracy alert row.
- **Accuracy alert:** red-soft bg, red border, mono uppercase "Precisión" tag. The signature differentiator — surface it prominently.
- **Buttons:** primary = green; on navy = bright green `#34D87E` with dark text `#06250F`; secondary = ghost with 1px border.
- **Lens nav (app):** dark sidebar; Visibilidad (green dot, active) + Precisión (red dot) as the two pillars.

## Brand vs citable (keep distinct)
| | AgentesVA (product) | citable (agency) |
|---|---|---|
| Face | bold data-SaaS, dark hero, green | light editorial "research paper", citation-blue |
| Type | Geist / Geist Mono | Inter / IBM Plex Mono |
| Feel | live instrument | calm authority |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-05 | New AgentesVA product-brand design system (replaces consulting "Editorial cálido") | Repositioned to fintech AI-visibility+accuracy SaaS; product brand, no founder face |
| 2026-06-05 | SimilarWeb design *language* (dark hero + domain-search + dashboard proof) | Best-in-class data-intelligence SaaS pattern; domain-input = the grader. Adapted, not cloned (trade-dress/IP). |
| 2026-06-05 | Green primary (not SimilarWeb blue / not citable blue) | Green = "visible" (the product's promise) + finance; differentiates from sister brand citable |
| 2026-06-05 | Green/amber/red as semantic brand colors | They are the product's three verdicts: recommended / gap / false |
