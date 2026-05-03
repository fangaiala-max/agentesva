# Architecture — agentesva.com

Static-first Astro site on Vercel + 2 serverless functions for form/webhook handling. No database. All persistence is in third-party SaaS (Brevo for email, HubSpot for CRM, Make.com for workflows, Mixpanel/GA4 for analytics).

## Topology

```
Browser
  │
  │ HTTPS (Cloudflare TLS 1.3 → Vercel)
  ▼
Vercel
  ├── Static prerender (Astro `output: 'static'` + @astrojs/vercel adapter)
  │     └── 73 pages: home, blog, catalogo, servicios, sobre, legal, etc.
  │
  └── Serverless Functions (Node 24 LTS, Fluid Compute)
        ├── /api/subscribe   → Brevo Contacts API (newsletter / voice waitlist)
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
| Framework | Astro | 5.14 |
| Adapter | @astrojs/vercel | static prerender |
| Styling | Tailwind 3 + custom CSS tokens | — |
| Functions runtime | Node.js | 24 LTS (Vercel default) |
| Hosting | Vercel | Production region: cdg1 (Paris) |
| Edge / DNS | Cloudflare | DNS only for Brevo records (DKIM CNAMEs un-proxied) |
| Repo | GitHub `fangaiala-max/agentesva` | main branch deploys |

## Content model

- **Blog posts**: Markdown in `astro/src/content/blog/` with Zod schema (`title ≤70`, `description 120–160`, `pillar` enum, optional `faqs` array)
- **Casos**: `astro/src/content/casos/` — métricas reales bajo NDA
- **Industrias**: `astro/src/content/industrias/`
- **Agentes/Prompts catalog**: `astro/src/data/agents.ts` (TypeScript module, not Content Collection)

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
| `Content-Security-Policy` | strict allowlist (script-src GA + Mixpanel + HubSpot only; frame-ancestors 'self'; upgrade-insecure-requests) |
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
3. Build: `cd astro && npm run build` → `astro/dist/` → root mirror copied (legacy convention)
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
