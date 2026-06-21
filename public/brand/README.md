# AgentesVA — Brand & Social Kit

Assets de marca generados desde el diseño **AgentesVA - Brand & Social Kit** (claude.ai/design).
Hospedados en `agentesva.com/brand/…` y versionados aquí.

## Identidad

- **Logotipo:** wordmark **AgentesVA** en `DM Serif Display` (tracking −0.025em) + glifo **[IA]** en `JetBrains Mono`, superíndice azul — nunca otro color. Margen de respeto = altura de la "A". Mínimo 96px de ancho.
- **Tipografía:** `DM Serif Display` (display/titulares + wordmark) · `DM Sans` (cuerpo/UI) · `JetBrains Mono` (etiquetas).
- **Color:** negro `#08080B` · azul primario `#0040FF` (superficies claras) · azul acento `#5B7CFF` (superficies oscuras) · claro `#FAFAF7` · gris `#6B6B6B` · verde estado `#4ec98a`.

## Assets (tamaño nativo)

| Archivo | Uso | Tamaño |
|---|---|---|
| `/og.png` | og:image · Twitter/X card · preview WhatsApp/LinkedIn | 1200 × 630 |
| `brand/avatar.png` | Foto de perfil (oscuro) · app icon | 512 × 512 |
| `brand/avatar-blue.png` | Foto de perfil (azul sólido) | 512 × 512 |
| `brand/twitter-header.png` | Cabecera X (Twitter) | 1500 × 500 |
| `brand/linkedin-banner.png` | Banner LinkedIn | 1584 × 396 |
| `brand/facebook-cover.png` | Portada Facebook | 1200 × 630 |
| `brand/substack-header.png` | Cabecera de publicación Substack | 1200 × 400 |
| `brand/instagram-post.png` | Post de Instagram | 1080 × 1080 |
| `brand/instagram-story.png` | Story de Instagram | 1080 × 1920 |

## Regenerar

Las fuentes HTML viven en `brand-build/` (gitignored). `node brand-build/gen.mjs` regenera las páginas y se renderizan a PNG con el navegador a viewport nativo (dpr 1).
