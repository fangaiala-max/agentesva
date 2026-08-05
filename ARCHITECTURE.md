# Architecture — agentesva.com

Static-first Astro site on Vercel + serverless functions for form/webhook handling. No database. All persistence is in third-party SaaS (Brevo for email, the configured diagnostic webhook/CRM, HubSpot, Make.com and GA4).

## Topology

```
Browser
  │
  │ HTTPS (Cloudflare TLS 1.3 → Vercel)
  ▼
Vercel
  ├── Static prerender (Astro `output: 'static'` + @astrojs/vercel adapter)
  │     └── 130+ pages: directorio, cursos, recursos, estudios, noticias,
  │         colecciones de prompts y generador local.
  │
  └── Serverless Functions (Node 24 LTS, Fluid Compute)
        ├── /api/subscribe   → Brevo Contacts API (newsletter / voice waitlist)
        ├── /api/diagnostic  → webhook server-side configurable (diagnóstico comercial)
        └── /api/wa          → Twilio WhatsApp webhook (signed verification)

Third-party (browser-side)
  ├── Brevo (transactional + lists, double opt-in)
  ├── HubSpot CRM + Forms (tracking + identify)
  ├── Make.com webhook (diagnostico quiz → AI diagnostic email)
  ├── Calendly (audit booking)
  ├── Google Analytics 4 + Mixpanel EU (analytics)
  └── Google Fonts (Fraunces, Inter Tight, JetBrains Mono, Material Symbols)
```

## Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Astro | 7.1 |
| Adapter | @astrojs/vercel | static prerender |
| Styling | Tailwind 4 (integración PostCSS) + custom CSS tokens | — |
| Functions runtime | Node.js | 24 LTS (Vercel default) |
| Hosting | Vercel | Production region: cdg1 (Paris) |
| Edge / DNS | Cloudflare | DNS only for Brevo records (DKIM CNAMEs un-proxied) |
| Repo | GitHub `fangaiala-max/agentesva` | main branch deploys |

## Content model

- **Herramientas, cursos y recursos**: JSON en `src/content/`, validado por los esquemas Zod de `src/content.config.ts`.
- **Estudios y noticias**: Markdown en `src/content/`, con páginas de listado y detalle prerenderizadas.
- **Biblioteca de prompts**: 100 plantillas en `src/data/biblioteca/prompts.ts`.
- **Colecciones SEO de prompts**: configuración en `src/data/prompt-landings.ts`; genera `/prompts/` y seis rutas temáticas.
- **Generador de prompts**: `/generador-de-prompts/`; estructura el texto en el navegador mediante `src/scripts/prompt-generator.ts`, sin enviar los campos a un servidor.

## Funnel paths (source of truth)

| Source | Form | Endpoint | Destination |
|---|---|---|---|
| `/blog/` newsletter | inline EmailSignup | `POST /api/subscribe { list:'newsletter' }` | Brevo list 9 |
| `/#voice-waitlist` | inline EmailSignup | `POST /api/subscribe { list:'voice-waitlist' }` | Brevo list 10 |
| `/catalogo/` 7-agentes | inline form | `POST /api/subscribe { list:'newsletter' }` + HubSpot `_hsq.identify` | Brevo list 9 + HubSpot |
| `/diagnostico/` quiz | 5-step form | `POST hook.eu1.make.com/...` + HubSpot Forms `submissions/v3` | Make scenario → Claude API → email + HubSpot CRM |
| All audit CTAs | n/a | redirect `https://calendly.com/fangaiala/auditoria-gratis-agentesva-30-min` | Calendly |

## Security headers (vercel.json)

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | strict allowlist (script-src 'self' + googletagmanager para GA4; connect-src dominios GA4; fuentes self-hosted, sin Google Fonts; frame-ancestors 'self'; upgrade-insecure-requests) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera/mic/geo/payment denied |
| `Cross-Origin-Opener-Policy` | `same-origin` |

## Environment variables

Local dev: `.env` (gitignored, use `.env.example` as template).
Production: Vercel Project → Settings → Environment Variables.

| Var | Used in | Purpose |
|---|---|---|
| `BREVO_API_KEY` | `/api/subscribe.js` | Brevo Contacts API auth |
| `BREVO_LIST_ID` | `/api/subscribe.js` | Default list (legacy fallback) |
| `BREVO_LIST_BLOG_NEWSLETTER` | `/api/subscribe.js` | Blog newsletter (id 9) |
| `BREVO_LIST_VOICE_WAITLIST` | `/api/subscribe.js` | Voice waitlist (id 10) |
| `TWILIO_AUTH_TOKEN` | `/api/wa.js` | WhatsApp webhook signature |
| `WA_VERIFY_TOKEN` | `/api/wa.js` | Twilio challenge-response |
| `PUBLIC_GA4_ID` | `ConsentBanner.astro` / `consent.ts` | GA4 Measurement ID (`G-…`); gatea el banner de consentimiento + analytics. Vacío = feature desactivada |
| `DIAGNOSTIC_WEBHOOK_URL` | `/api/diagnostic.ts` | Destino server-side para leads del diagnóstico; obligatoria antes de publicar la ruta |
| `DIAGNOSTIC_WEBHOOK_SECRET` | `/api/diagnostic.ts` | Bearer token opcional para autenticar la entrega al webhook |
| `DIAGNOSTIC_ALLOWED_ORIGINS` | `/api/diagnostic.ts` | Orígenes permitidos, separados por comas; sin wildcard |

Make.com webhook URL is **client-side fetched** (inline in `/diagnostico/`), so it lives in the codebase, not as a secret. Anyone with the URL can ping it; treat it as public.

## DNS records (Cloudflare, agentesva.com)

| Type | Name | Content | Proxy |
|---|---|---|---|
| TXT | `@` | `brevo-code:79eb4802910b1408d3cb77467fbf1fcb` | DNS only |
| CNAME | `brevo1._domainkey` | `b1.agentesva-com.dkim.brevo.com` | DNS only |
| CNAME | `brevo2._domainkey` | `b2.agentesva-com.dkim.brevo.com` | DNS only |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | DNS only |

## Deployment flow

1. PR opened → Vercel preview deploy (auth-walled)
2. PR merge to `main` → Vercel production deploy (auto-rolling)
3. Build: `npm run build` → Astro/Vercel en `.vercel/output/` → Pagefind indexa las páginas públicas
4. Schemas validated at build (Zod blocks invalid frontmatter)

## Performance budget (target / actual mobile)

| Metric | Target | Actual (2026-04-29 measurement) |
|---|---|---|
| TTFB | <600 ms | 208 ms ✅ |
| FCP | <1.8 s | 632 ms ✅ |
| CLS | <0.1 | 0.000 ✅ |
| Page weight | <1 MB | 218 KB ✅ |
| Resources | <50 | 15 ✅ |

## What this project is NOT

- **No database**: zero `DATABASE_URL`, zero ORM. State lives in Brevo/HubSpot/Make.
- **No auth**: site is fully public. Forms accept any email.
- **No SSR**: every page is prerendered HTML. The 2 functions are isolated POST handlers.
- **No background jobs**: webhooks are fire-and-forget. Long-running diagnostics live in Make.com, not Vercel.

## Related docs

- [`CLAUDE.md`](./CLAUDE.md) — instructions for Claude Code sessions
- [`DESIGN.md`](./DESIGN.md) — design tokens, components, brand
- [`docs/blog-fact-checking-protocol.md`](./docs/blog-fact-checking-protocol.md) — Tier A/B/C/D claim verification protocol
- [`docs/blog-keyword-research.md`](./docs/blog-keyword-research.md) — Semrush keyword strategy per pillar
- [`docs/fact-checks/*.md`](./docs/fact-checks/) — per-post fact-check audits
