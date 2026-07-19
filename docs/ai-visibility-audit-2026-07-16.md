# AI Discoverability Audit — AgentesVA

**Baseline date:** 2026-07-16
**Domain:** agentesva.com
**Mode:** Standard
**Methodology:** Web-retrieval search as the AI-search proxy (Perplexity / ChatGPT
Search / Google AI Overviews all retrieve from this index) + Semrush ES/MX
indexation data + entity/misattribution check. The live ChatGPT/Perplexity/Claude
apps were **not** queried directly (no logged-in access from the audit
environment) — see "Verify in the real chatbots" below.

---

## One-line answer

**AgentesVA is effectively invisible to AI search today — not because of how the
site is built, but because it is new, unindexed, uncited, and its off-page entity
signals do not exist yet.** This is a *time + authority + content-volume* problem,
not a *technical setup* problem. The foundation is ahead of most competitors; the
footprint is behind all of them.

A low score here is **expected**, not a failure: the SEO technical foundation only
shipped on 2026-07-10 and the estudios are recent. The value of this document is
the **trend line** against the 30/60/90-day re-audits, not the absolute number.

---

## Pre-audit hypothesis

New 2026 domain, technically excellent but young → expected weak-to-invisible
recognition, with gaps concentrated in *authority* and *category presence* and
competitors dominating. **Confirmed** (and slightly worse than the technical
polish would suggest, due to a brand-name collision).

---

## Phase 1 — Direct brand queries

| Query (retrieval proxy) | AgentesVA appears? | What surfaced instead |
|---|---|---|
| "AgentesVA directorio herramientas de IA en español" | No | agentes.ai, directorioia.com, queia.es, academiadeia.com |
| "agentesva.com AgentesVA" | No | Unrelated @AgenteSva on X (not ours), a Scribd *oposiciones* doc, Valorant "agentes", IBM virtual agents |

**Misattribution risk: YES.** "AgentesVA" parses as "Agentes VA" and collides with
generic *agentes* (AI agents / Valorant / IBM virtual agents) and unrelated
Spanish entities. With zero corroborating signals, an LLM has nothing to
disambiguate the brand against.

## Phase 2 — Category queries (exact existing estudio topics)

| Query | AgentesVA appears? | Who owns the query |
|---|---|---|
| "mejores herramientas de IA para automatizar WhatsApp en español" | No | SendPulse, Leadsales, Twilio, Tecca |
| "alternativas a ChatGPT en español gratis para negocios" | No | PCReviews, HubSpot ES, Textopilot, Decodifica |

A dedicated estudio exists for **both** of these exact queries, yet neither is
retrieved. They compete against established content sites with years of authority.

## Phase 3 — Hard indexation data (Semrush, geographically correct)

| Market | Organic keywords | Organic traffic | Verdict |
|---|---|---|---|
| España (`es`) | 1 | 0 | Essentially unindexed |
| México (`mx`) | 0 (NOTHING FOUND) | 0 | No presence at all |

Global Semrush rank ~9.3M. Retrieval-based AI cannot cite what search has not yet
indexed and ranked.

**Indexation status (2026-07-16):** `site:agentesva.com` returns **0 indexed pages**
in Google. The sitemap (`/sitemap-index.xml` → `/sitemap-0.xml`, **120 URLs** — all
content surfaces present) and `robots.txt` (plain-text, AI crawlers allowed, Sitemap
directive present — no Cloudflare regression) are both **live and healthy**. So the
site is fully **crawlable but not yet indexed** — a young-domain / zero-authority
state, not a technical defect. Fix: GSC sitemap submit + request-indexing on key
URLs, plus the authority work in `docs/superpowers/plans/2026-07-16-entity-signals-geo.md`.
(Confirm the exact count in GSC → Pages; `site:` via a US search proxy is indicative,
Semrush `es`=1kw corroborates.)

---

## Scores

| Dimension | Score | Rationale |
|---|---|---|
| Recognition | 1/5 | No retrieval knows the brand; name collides with other entities |
| Accuracy | 2/5 | Own signals (llms.txt, schema) are accurate & machine-readable — nothing external corroborates |
| Sentiment | N/A | No reviews/mentions exist yet — absence, not negativity |
| Category Presence | 1/5 | Never appears; competitors own every query |
| Authority | 1/5 | 1 keyword, ~0 backlinks, zero external entity signals live |
| Competitive Position | 1/5 | Fully dominated |
| **TOTAL** | **~6/30** | **Rating: Invisible — foundational work required** |

---

## Gap analysis

### Critical (the actual blockers)

1. **Indexation.** 1 keyword in ES / 0 in MX implies pages are largely not indexed
   yet. Verify Google Search Console is connected, sitemap submitted, and check
   Coverage. Nothing downstream matters until pages are in the index.
2. **Zero external entity signals.** The `docs/geo-entity-building.md` checklist
   (LinkedIn company page → Wikidata → trust seeds → schema `sameAs`) is entirely
   unstarted. Highest-leverage lever; also the fix for the name-collision problem.
3. **Entity disambiguation.** Always pair "AgentesVA" with "directorio de IA en
   español" in titles/anchors; claim the @agentesva handles; create the Wikidata
   item so AI has an anchor to resolve the brand against.

### High priority (30 days)

4. **Content depth + volume.** Only 8 estudios, and the two tested are thin vs.
   SendPulse/HubSpot/Twilio. Retrofit factual density (tom-4pass protocol: 3+
   named sources, 15+ concrete data points per piece) into existing estudios, then
   expand toward the exact question-phrasings AI users type.
5. **Backlinks / authority.** Near-zero referring domains. Directory listings +
   trust seeds + one genuinely citable data asset.

### Opportunity (90 days)

6. **Founder E-E-A-T.** The Fernando Angulo `Person` schema exists — amplify with
   real external bylines.
7. **Wikipedia.** Wait for real press coverage. A premature autopromotional
   article gets deleted and burns the page history (per geo-entity-building.md).

---

## Competitive set (identified during the audit)

Directory competitors that DO surface: agentes.ai, directorioia.com, queia.es,
academiadeia.com, ai-tools.directory/es.
Content competitors that own the estudio queries: SendPulse (LATAM), Leadsales,
Twilio, HubSpot ES, PCReviews, Textopilot, Decodifica.

---

## Re-audit schedule

| Date | Measure |
|---|---|
| 2026-08-15 (30d) | Indexation recovery: Semrush ES keyword count, GSC coverage, brand-query recognition |
| 2026-09-14 (60d) | Category-query appearances after content-depth work |
| 2026-10-14 (90d) | Full comparative re-audit vs agentes.ai / directorioia.com / queia.es |

**Trend table (fill on each re-audit):**

| Dimension | 2026-07-16 (baseline) | 30-day | 60-day | 90-day | Δ |
|---|---|---|---|---|---|
| Recognition | 1/5 | | | | |
| Accuracy | 2/5 | | | | |
| Category Presence | 1/5 | | | | |
| Authority | 1/5 | | | | |
| Competitive Position | 1/5 | | | | |
| **Total** | **~6/30** | | | | |
| Semrush ES keywords | 1 | | | | |
| Semrush MX keywords | 0 | | | | |

---

## Verify in the real chatbots

Paste these into ChatGPT, Perplexity, and Claude and record the answers into the
trend table for a complete audit:

1. `¿Qué es AgentesVA?`
2. `mejores directorios de herramientas de IA en español`
3. `alternativas a ChatGPT en español para pymes`
4. `¿Qué herramientas de IA recomiendas para automatizar WhatsApp en un negocio?`

## Self-critique / limitations

- **Platforms:** used web-retrieval (the proxy AI-search draws from) + objective
  Semrush data, not the live chatbot UIs — hence the paste-to-verify list. Two
  independent methods agreed.
- **WebSearch is US-biased** for Spanish queries; the Semrush `es`/`mx` databases
  are geographically correct and confirm the same conclusion.
- **Competitive comparison** used the same query set. Competitor Semrush keyword
  profiles were not pulled (the picture was already unambiguous) — available on
  request for exact side-by-side numbers.
