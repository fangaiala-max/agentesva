# AgentesVA — Brand & Social Kit

## Current social identity

The current OG cards use the Gemini palette (blue, violet and pink), with localized titles and a separate card for every indexable page and study. Commercial pages use a light background; editorial content uses midnight navy. The social monogram is a simplified AV for small sizes. The website header logo is unchanged.

- `social-mark.png`: source artwork for social cards and favicon exports.
- `/favicon.svg`, `/favicon.png`, `/apple-touch-icon.png`: matching icon exports.
- `/brand/og-en.png` and `/og.png`: English and Spanish generic fallback cards.
- `/social/og/*.png`: page-specific cards generated during each build, 1200×630.

See [generation and validation](../../docs/social-images.md). Earlier social platform banners below are legacy exports and are not used as website OG defaults.

## Legacy social exports

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

## Legacy generator

Las fuentes HTML viven en `brand-build/` (gitignored). `node brand-build/gen.mjs` regenera las páginas y se renderizan a PNG con el navegador a viewport nativo (dpr 1).
