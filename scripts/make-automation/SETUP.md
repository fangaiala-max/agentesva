# Make.com Automation Setup — Diagnóstico AgentesVA

End-to-end setup guide for the diagnostic email automation.

## Flow overview

```
HubSpot form submitted
  → Make.com polls every 15 min (free plan) OR webhook (paid)
  → Claude API generates HTML diagnostic
  → [If Claude fails] Gemini API generates fallback
  → HubSpot send_email action with merged template
  → HubSpot update contact: lead_score_agentesva + notes
```

**Total execution time per lead:** ~10-15 seconds.
**Cost per lead:** ~€0.02-0.05 (Claude Sonnet) or €0 (Gemini Flash free tier).
**Make.com ops per lead:** ~6 operations.
**Make.com free plan:** 1000 ops/month = up to ~160 leads/month free.

---

## Prerequisites (you do this first, ~15 min)

### 1. Make.com account
- Sign up at https://make.com (free plan: 1000 ops/month)
- Region: select Europe

### 2. Claude API key
- Go to https://console.anthropic.com
- Sign up → Settings → API Keys → Create key
- **Add billing** ($5 minimum credit, usage ~€3-10/month for diagnostics)
- Copy key (starts with `sk-ant-...`)

### 3. Gemini API key (fallback)
- Go to https://aistudio.google.com/apikey
- Click **Create API key**
- Free tier: 15 requests/min, 1500 requests/day — more than enough
- Copy key

### 4. HubSpot OAuth for Make.com
- Make.com will prompt you to authorize HubSpot
- Use the same HubSpot account where you created the form

---

## Scenario setup in Make.com (step by step)

### Module 1 — Watch HubSpot form submissions (trigger)

1. In Make.com dashboard → **Create a new scenario**
2. Name it: `AgentesVA — Diagnóstico Auto-Email`
3. First module: search **HubSpot CRM** → select **Watch form submissions**
4. Connect HubSpot: use OAuth (authorize your HubSpot account)
5. Configuration:
   - **Form:** `Diagnóstico AgentesVA`
   - **Limit:** 10 per run
6. Right-click → **Run once** to initialize. Submit a test on `/diagnostico/` using your email to generate sample data.

**Output mapping:** Module 1 returns the contact object with fields like `properties.firstname`, `properties.email`, `properties.industria_agentesva`, etc.

---

### Module 2 — HTTP request to Claude API

1. After Module 1 → add **HTTP** > **Make a request**
2. Config:
   - **URL:** `https://api.anthropic.com/v1/messages`
   - **Method:** POST
   - **Headers:**
     - `x-api-key`: `YOUR_CLAUDE_API_KEY`
     - `anthropic-version`: `2023-06-01`
     - `content-type`: `application/json`
   - **Body type:** Raw (JSON)
   - **Content:**

Copy the full body from `claude-prompt.md` (section "Ejemplo de llamada HTTP Claude API"). Replace variables with Make.com mappings from Module 1:
   - `{{1.properties.firstname}}`
   - `{{1.properties.industria_agentesva}}`
   - `{{1.properties.tamano_equipo}}`
   - `{{1.properties.herramientas_actuales}}`
   - `{{1.properties.dolor_principal}}`
   - `{{1.properties.presupuesto_rango}}`
   - `{{1.properties.email}}`

3. **Parse response:** Yes

**Output:** `{{2.data.content[0].text}}` → contains the generated HTML.

---

### Module 3 — Error handler → Gemini fallback

1. Right-click on Module 2 (Claude) → **Add error handler** → **Resume**
2. After error handler, add **HTTP** > **Make a request**
3. Config:
   - **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_GEMINI_KEY`
   - **Method:** POST
   - **Headers:** `content-type`: `application/json`
   - **Body:** copy from `claude-prompt.md` (Gemini section), same variable mapping
4. **Parse response:** Yes

**Output:** `{{3.data.candidates[0].content.parts[0].text}}` → fallback HTML.

---

### Module 4 — Router: use Claude output if OK, else Gemini

1. After Modules 2/3 → add **Router** module
2. Path A (Claude success):
   - Filter: `Module 2 status code = 200`
   - Continues to Module 5 with `{{2.data.content[0].text}}` as diagnostic
3. Path B (Gemini fallback):
   - Filter: `Module 2 status code ≠ 200` OR `Module 2 errored`
   - Continues to Module 5 with `{{3.data.candidates[0].content.parts[0].text}}` as diagnostic

---

### Module 5 — Build email HTML with template merge

1. Add **Text parser** > **Replace**
2. Source: full content of `email-template.html` (paste as literal string)
3. Replace:
   - `{{DIAGNOSTICO_HTML}}` → output from Router (Claude or Gemini)
   - `{{firstname}}` → `{{1.properties.firstname}}`
   - `{{email}}` → `{{1.properties.email}}`
   - `{{MEETING_URL}}` → hardcoded Calendly/HubSpot meeting URL

**Output:** Final email HTML ready to send.

---

### Module 6 — HubSpot: Send marketing email / Gmail send

**Option A (preferred if you have HubSpot Starter):** HubSpot Marketing Email via API
- Currently HubSpot Free does NOT allow sending custom emails via API
- Solution: upgrade to Marketing Hub Starter (€15/mo) OR use Option B

**Option B (recommended for Free plan):** Gmail/Email module from Make.com
1. Add **Email** > **Send an email** (uses SMTP)
2. Connect: use Gmail SMTP with `hola@agentesva.com` (requires app password from Google)
   - Alternative: use Resend.com (free 3000/month) or SendGrid (free 100/day)
3. Config:
   - **To:** `{{1.properties.email}}`
   - **From:** `AgentesVA <hola@agentesva.com>`
   - **Subject:** `Tu diagnóstico de automatización — AgentesVA`
   - **Content type:** HTML
   - **Content:** output from Module 5 (merged template)

---

### Module 7 — Update HubSpot contact with diagnostic and score

1. Add **HubSpot CRM** > **Update a contact**
2. Contact ID: `{{1.contactId}}`
3. Fields to update:
   - `lead_score_agentesva`: computed based on budget + team size (use built-in Math formula, example below)
   - Create a custom **note** on the contact with the generated diagnostic HTML (for reference)

**Lead score formula (Make.com formula):**

```
if({{1.properties.presupuesto_rango}} = "gt_5000", 10,
  if({{1.properties.presupuesto_rango}} = "1500_5000", 8,
    if({{1.properties.presupuesto_rango}} = "500_1500", 5,
      if({{1.properties.presupuesto_rango}} = "lt_500", 2, 4)
    )
  )
)
```

Add +1 if `tamano_equipo` is `6_20` or `20_plus`. Cap at 10.

---

## Activate the scenario

1. Top-right: **Schedule** → set to every 15 min (free plan limitation)
2. Toggle **ON**
3. Submit a real test on `/diagnostico/` → wait 15 min → check email inbox

---

## Debugging

- **Claude 401:** bad API key or no billing credit
- **Claude 429:** rate limited — Gemini fallback should kick in
- **HubSpot "no new submissions":** the trigger only catches NEW submissions from the moment scenario was activated. Older submissions won't trigger.
- **Email not arriving:** check spam, verify SMTP credentials, check Make.com run history for errors

---

## Cost summary

| Service | Free tier | Cost/month (100 leads) |
|---|---|---|
| Make.com Free (1000 ops) | 1000 ops/month | €0 |
| Claude Sonnet 4.6 | - | ~€3-8 |
| Gemini 2.5 Flash | 1500 req/day | €0 |
| SMTP (Gmail 500/day) | free | €0 |
| **Total** | | **~€3-8/month for 100 diagnostics** |

When you exceed 100 leads/month, upgrade Make.com to Core plan (€9/month for 10k ops).
