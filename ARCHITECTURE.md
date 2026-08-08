# Architecture — agentesva.com

Static-first Astro site on Vercel + serverless functions for form/API handling. No database propia. All persistence is in third-party SaaS (Brevo for email, Notion for the diagnostic CRM, HubSpot and GA4).

## Topology

```
Browser
  │
  │ HTTPS (Cloudflare TLS 1.3 → Vercel)
  ▼
Vercel
  ├── Static prerender (Astro `output: 'static'` + @astrojs/vercel adapter)
  │     └── 130+ pages: directorio, cursos, recursos, estudios, noticias,
  │         colecciones de prompts, guías, servicios y diagnóstico.
  │
  └── Serverless Functions (Node 24 LTS, Fluid Compute)
        ├── /api/subscribe   → Brevo Contacts API (newsletter / voice waitlist)
        ├── /api/diagnostic  → Notion API (diagnóstico comercial con deduplicación)
        ├── /gracias-diagnostico → cierre SSR noindex según resultado del diagnóstico
        └── /api/wa          → Twilio WhatsApp webhook (signed verification)

Third-party services
  ├── Brevo (transactional + lists, double opt-in)
  ├── HubSpot CRM + Forms (tracking + identify)
  ├── Notion (Pipeline de leads del diagnóstico)
  ├── Proveedor de reserva configurable mediante URL HTTPS
  └── Google Analytics 4 tras consentimiento
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
| `/diagnostico-automatizacion-ia/` | formulario de 8 pasos | `POST /api/diagnostic` | Pipeline de leads en Notion → `/gracias-diagnostico/` |
| Resultado cualificado | CTA posterior al envío | `BOOKING_URL` HTTPS opcional | Proveedor de reserva; fallback a email si falta |
| Resultado no cualificado | CTA posterior al envío | rutas internas según perfil | taller, guía o revisión manual |

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
| `NOTION_TOKEN` | `/api/diagnostic.ts` | Token de integración interna con acceso a `Pipeline de leads` |
| `NOTION_DATA_SOURCE_ID` | `/api/diagnostic.ts` | Fuente de datos donde la API crea o actualiza leads por `Submission ID` |
| `DIAGNOSTIC_SIGNING_SECRET` | `/api/diagnostic.ts` y `/gracias-diagnostico.astro` | Secreto de 24+ caracteres para firmar resultados; sin él, la página nunca expone la reserva |
| `DIAGNOSTIC_ALLOWED_ORIGINS` | `/api/diagnostic.ts` | Orígenes permitidos, separados por comas; sin wildcard |
| `BOOKING_URL` | `/gracias-diagnostico.astro` | URL HTTPS opcional para reservar; sin valor usa un contacto por email seguro |

El token de Notion y el secreto de firma se usan solo en servidor. No deben exponerse al cliente ni incorporarse a una variable `PUBLIC_*`. La API firma el resultado con HMAC-SHA256 y una caducidad de 30 minutos; la página de cierre degrada accesos directos, caducados o manipulados a revisión manual.

La API agrupa envíos concurrentes con el mismo `Submission ID` dentro de cada instancia y consulta Notion antes de crear. Como Notion no ofrece una restricción única para esta propiedad, la deduplicación entre dos instancias simultáneas es de mejor esfuerzo; cualquier duplicado excepcional se reconcilia por `Submission ID` en el pipeline.

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

- **No database propia**: zero `DATABASE_URL`, zero ORM. State lives in Brevo, HubSpot and Notion.
- **No auth**: site is fully public. Forms accept any email.
- **SSR mínimo**: el contenido público se prerenderiza; `/gracias-diagnostico/` es dinámico para leer el resultado y `BOOKING_URL` sin cachear ni indexar la respuesta.
- **No background jobs**: el diagnóstico clasifica y persiste el lead en Notion dentro de la misma petición acotada por timeout.

## Related docs

- [`CLAUDE.md`](./CLAUDE.md) — instructions for Claude Code sessions
- [`DESIGN.md`](./DESIGN.md) — design tokens, components, brand
- [`docs/blog-fact-checking-protocol.md`](./docs/blog-fact-checking-protocol.md) — Tier A/B/C/D claim verification protocol
- [`docs/blog-keyword-research.md`](./docs/blog-keyword-research.md) — Semrush keyword strategy per pillar
- [`docs/fact-checks/*.md`](./docs/fact-checks/) — per-post fact-check audits
