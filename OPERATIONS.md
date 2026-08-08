# Operations — agentesva.com

How to monitor, alert, secure, and recover the production site. Static-first Astro on Vercel with 3 API handlers, 1 SSR confirmation route, and 4 SaaS providers (Brevo, HubSpot, Notion, configurable HTTPS booking).

## 🔐 Secrets management

### State (audited 2026-04-30)

- ✅ **No secrets in repo**: `grep` over JS/TS/Astro/JSON returned 0 hits for `BREVO_API_KEY` value, OpenAI/Anthropic keys, Twilio tokens
- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` ships placeholders only
- ✅ All production secrets live in **Vercel → Project Settings → Environment Variables** (encrypted at rest, OIDC-injected at runtime)

### Local dev workflow

```bash
cp .env.example .env
# Fill .env with real values from 1Password / Vercel pull
vercel env pull .env.local   # alternative: pulls all vars from Vercel
```

`.env.local` and `.env` are both gitignored.

### Recommended versioned vault (when team grows >2)

Two clean options:

**Option A — Doppler (recommended for AgentesVA)**
- Free tier (5 users, unlimited secrets)
- One-line install in CI/CD: `doppler run -- npm start`
- Sync to Vercel via `doppler integration setup vercel`
- Audit log + secret rotation built-in
- Setup: https://docs.doppler.com/docs/install-cli

**Option B — Vercel + 1Password Connect**
- Keep secrets in 1Password vault `AgentesVA Production`
- 1Password Connect server pulls into CI on demand
- More work to set up but zero new SaaS

For now (2 people) the **Vercel-native env vars are sufficient**. Migrate when there are 3+ collaborators.

### Rotation cadence

| Secret | Rotate every | How |
|---|---|---|
| `BREVO_API_KEY` | 6 meses | Brevo → SMTP & API → Generate new key → update Vercel → revoke old |
| `TWILIO_AUTH_TOKEN` | 6 meses | Twilio Console → Account → Auth Tokens → Rotate |
| `WA_VERIFY_TOKEN` | Si se filtra | Generate UUID v4, update Vercel + Twilio Sandbox config |
| `NOTION_TOKEN` | 6 meses | Rotar en Notion Connections, actualizar Vercel y revocar el anterior |
| `DIAGNOSTIC_SIGNING_SECRET` | 6 meses | Generar 32+ caracteres aleatorios y actualizar Vercel; los tokens anteriores caducan en 30 minutos |

---

## 📧 Email alerts

### What to monitor

| Source | Alert | Severity |
|---|---|---|
| Vercel | Deploy failure | High — auto-block bad deploys |
| Vercel | Function error rate >5% | High |
| Vercel | Spending limit | Medium — Hobby plan free; Pro adds limits |
| Brevo | Email bounce rate >5% | Medium — sender reputation |
| Brevo | DKIM/SPF break | High — deliverability |
| Notion | API 4xx/5xx o integración sin acceso | High — los leads no llegan al pipeline comercial |
| Diagnóstico | Respuestas 5xx o entregas fallidas a Notion | High — revisar función y permisos de la conexión |
| HubSpot | Daily form submission anomaly | Low |

### Setup steps (15 min total)

#### Vercel (Project Settings → Notifications)
1. Email notifications: ✅ enable for `Deployment Failed`, `Function Errors`
2. Add `fangaiala@gmail.com` + (when team) team Slack webhook
3. Spend limit: Pro plan only. Set to €20/mes alert threshold once on Pro

#### Brevo (Account → Notification settings)
1. Email alerts: enable `Bounce rate >5%`, `Domain authentication issue`
2. Daily digest: keep on for first 30 days

#### Diagnóstico comercial

1. Crear una integración interna de Notion con lectura, inserción y actualización de contenido.
2. Compartir `Pipeline de leads` con esa integración.
3. Configurar `NOTION_TOKEN` y `NOTION_DATA_SOURCE_ID` en Vercel Preview y Production.
4. Configurar `DIAGNOSTIC_SIGNING_SECRET` con 24+ caracteres; sin él, la página no muestra la reserva.
5. Configurar `BOOKING_URL` con HTTPS si se quiere mostrar reserva a los resultados cualificados.
6. Verificar que los reintentos actualizan por `Submission ID` en vez de duplicar el lead.
7. Mantener rate limiting distribuido en Vercel WAF; el límite en memoria de la función es una defensa adicional por instancia, no sustituye al WAF.
8. Probar un lead de cada ruta (`qualified_call`, `paid_workshop`, `self_serve_resources`, `manual_review`) en preview antes de producción.

### Optional: external uptime monitor

Consider adding [Better Stack Free Tier](https://betterstack.com) (3 monitors free) or UptimeRobot:
- Monitor #1: `https://agentesva.com/` (every 5 min, email + WhatsApp on down)
- Monitor #2: `https://agentesva.com/api/subscribe` (POST with test payload, every 30 min)

---

## 🛡️ Security audit (state 2026-04-30)

### TLS in transit

- ✅ **HTTPS only** (HSTS preload `max-age=63072000` enforced sitewide)
- ✅ Cloudflare TLS 1.3 (auto-negotiated; no TLS 1.0/1.1 fallback)
- ✅ Vercel internal hop also TLS-secured

### TLS at rest

- ✅ Vercel encrypts env vars at rest (AES-256 server-side)
- ✅ No persistent storage on Vercel (no Blob, no Postgres, no KV in this project)
- ✅ Los datos del diagnóstico se guardan en Notion mediante una conexión con acceso limitado a la base comercial
- N/A: no own database to encrypt

### Secrets in repo

```bash
# Re-run periodically:
git log -p | grep -iE "api[_-]key|secret|password|sk-[a-z0-9]{30,}" | head
grep -rE "BREVO_API_KEY|sk-(ant|proj|live)|password.*=.*['\"][^'\"]{8,}" \
  --include="*.js" --include="*.ts" --include="*.astro" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.git
```

Last scan (2026-04-30): **0 hits**. ✅

### CVE / dependency control

```bash
cd astro && npm audit --omit=dev
```

Run **monthly minimum**. If `high` or `critical` CVEs appear:
1. `npm audit fix` (safe patches)
2. For breaking-change fixes, open a PR; test in preview before merge
3. Document in `docs/_archive/security-log.md`

GitHub Dependabot is enabled (default for public repos) → opens PRs automatically when CVEs detected. Review + merge weekly.

### CSP coverage

Strict CSP with explicit allowlist (see `vercel.json`). Last update (2026-04-30) added `*.hs-banner.com` + `*.hscollectedforms.net` for HubSpot.

### Defense layers

| Layer | Protection |
|---|---|
| Cloudflare | DDoS mitigation (free tier), WAF rules |
| Vercel BotID | Available, not enabled — consider if abuse appears |
| HSTS preload | List submission pending; chrome-preloaded after 1 year of stable max-age |
| HTTP/2 + 3 | Default on Vercel, encrypted multiplexing |
| LSSI compliance | `/legal/` block + footer fiscal + double opt-in (RGPD) |

### What's NOT covered

- No OWASP ZAP / Burp scan run on production. Schedule quarterly.
- No penetration test. Worth €500-1.500 once per year if revenue >€50k/mo.
- No bug bounty. N/A for current size.

---

## 🚨 Incident response

### Site down

1. Check Vercel Status: https://www.vercel-status.com/
2. Check Cloudflare Status: https://www.cloudflarestatus.com/
3. Check DNS: `dig agentesva.com +short`
4. Vercel Dashboard → Deployments → Rollback to last `Ready` if recent deploy broke prod

### Deploy broken in prod

```bash
# In Vercel dashboard:
Deployments → previous successful deploy → kebab menu → Promote to Production

# Or git revert:
git revert <bad-sha>
git push origin main
```

### Email delivery failing

1. Brevo → Logs → Email Activity → look for `bounce`/`spam`/`blocked`
2. Verify DKIM/SPF still aligned: https://www.mail-tester.com (send test email, score must be ≥9/10)
3. If sender reputation tanked: Brevo support + reduce volume for 1-2 weeks

### Form submission failing

1. DevTools Network → POST `/api/subscribe` → response JSON shows `{error: "..."}`
2. Vercel → Logs → search `subscribe` → see actual error
3. Common causes:
   - Missing env var → 500 "Server misconfiguration" → check Vercel env
   - Brevo API rate limit → 429 → wait or upgrade plan
   - Invalid list ID → 422 → verify list still exists in Brevo

---

## 📚 Reference

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system topology
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code session instructions
- Vercel project: https://vercel.com/fernando-s-projects-5582fa07/05-agentesva
- GitHub repo: https://github.com/fangaiala-max/agentesva
