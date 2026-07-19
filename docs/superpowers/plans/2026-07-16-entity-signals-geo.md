# Entity Signals (GEO) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AgentesVA resolvable as a single, trusted entity to AI search and knowledge graphs by creating the off-page trust-seed profiles and wiring their URLs into the site's JSON-LD `sameAs`.

**Architecture:** Most work is manual, off-repo profile creation (LinkedIn, Wikidata, X, GitHub, Trustpilot) executed by the operator, each producing one canonical URL. A single code task then appends those URLs to `organization.sameAs` in [`src/data/schema.ts`](../../../src/data/schema.ts) — the one shared entity definition every page already emits — guarded by a new regression test. This directly attacks two baseline-audit findings: *invisibility* (no external corroboration) and the *"AgentesVA → Agentes VA" name collision* (no anchor to disambiguate against).

**Tech Stack:** Astro 5 (static), TypeScript, Vitest (`npm run test`), JSON-LD schema.org. Off-repo: LinkedIn, Wikidata, X/Twitter, GitHub, Trustpilot.

**Source of truth for manual steps:** [`docs/geo-entity-building.md`](../../geo-entity-building.md) (the detailed NAP + Wikidata property table). This plan operationalizes and sequences it, and adds the code + test task it lacks.

## Global Constraints

- **NAP consistency (verbatim everywhere):** name = `AgentesVA`; one-line description = `Directorio y medio de inteligencia artificial en español para negocios.` (must match `organization.description` in `schema.ts` exactly). Web = `https://agentesva.com`.
- **Real profiles only.** Never fabricate a profile, review, or Wikidata reference. Only add a URL to `sameAs` after the profile actually exists and resolves (HTTP 200).
- **`sameAs` entries must each be an absolute `https://` URL, unique, no trailing spaces.** A typo'd/404 URL poisons the entity graph — the regression test enforces this.
- **Tests must pass** (`npm run test`) and **the build must not break** (`npm run build`) before any commit. Project targets 100% coverage: new code → new test.
- **`sameAs` is append-only.** Profiles come online at different times (Wikidata may lag LinkedIn by days). Re-run the code task to append new URLs as they go live; never remove the existing Instagram entry.

---

### Task 0: Verify indexation (gating pre-step — manual, ~15 min)

Off-page signals are wasted effort if the site isn't in Google's index. Confirm the foundation is crawlable/indexed before investing.

**Files:** none (external — Google Search Console).

- [ ] **Step 1: Confirm the property exists in GSC**

Open [Google Search Console](https://search.google.com/search-console) for `agentesva.com`. If no property exists, add a Domain property and verify via DNS TXT. This is the single biggest blind spot from the audit (I couldn't see GSC).

- [ ] **Step 2: Submit the sitemap**

In GSC → Sitemaps, confirm `https://agentesva.com/sitemap-index.xml` is submitted and shows "Success". (It's already emitted by `@astrojs/sitemap` — see [`astro.config.mjs`](../../../astro.config.mjs).)

- [ ] **Step 3: Check Pages / Coverage**

GSC → Pages. Record: how many pages are **Indexed** vs **Not indexed**, and the top "Not indexed" reasons. Expected for a young domain: many "Discovered – currently not indexed" / "Crawled – currently not indexed".

- [ ] **Step 4: Live-test 3 URLs**

Use GSC "URL Inspection" on: `/`, `/estudios/mejores-herramientas-ia-whatsapp`, `/herramientas`. Record whether each is "URL is on Google". Use "Request Indexing" for any that aren't.

- [ ] **Step 5: Record the result in the audit doc**

Add a one-line "Indexation status (2026-07-16): X/Y pages indexed" note to [`docs/ai-visibility-audit-2026-07-16.md`](../../ai-visibility-audit-2026-07-16.md) under Phase 3, then commit:

```bash
git add docs/ai-visibility-audit-2026-07-16.md
git commit -m "docs(seo): record GSC indexation status in baseline audit"
```

**Deliverable:** a known indexation number, sitemap confirmed submitted, and any un-indexed key pages requested. Gate: if 0 pages are indexed *and* the sitemap errors, stop and debug crawlability before continuing — the rest of this plan won't move AI visibility until pages are in the index.

---

### Task 1: LinkedIn company page (manual, ~30 min — highest priority per geo doc)

**Files:** none (external — LinkedIn). Produces URL: `https://www.linkedin.com/company/agentesva`.

- [ ] **Step 1: Create the page**

LinkedIn → Work ▸ Create a Company Page ▸ Small business. Fill:
- **Name:** `AgentesVA`
- **linkedin.com/company/** slug: `agentesva` (confirm it's free; `linkedin.com/company/agentesva` currently 404s per geo doc)
- **Website:** `https://agentesva.com`
- **Industry:** `Technology, Information and Internet`
- **Tagline / description:** `Directorio y medio de inteligencia artificial en español para negocios.` (verbatim — matches schema)
- **Logo:** upload [`public/brand/avatar.png`](../../../public/brand/avatar.png)
- **Banner:** [`public/brand/linkedin-banner.png`](../../../public/brand/linkedin-banner.png)

- [ ] **Step 2: Verify it resolves**

Open `https://www.linkedin.com/company/agentesva` in a logged-out browser (or curl) and confirm HTTP 200 + the correct name/logo render. Record the exact final URL (LinkedIn may append a numeric suffix if the slug was taken — use whatever URL actually resolves).

**Deliverable:** a live LinkedIn company page URL, NAP-consistent. This URL feeds Task 6 (`sameAs`) and is a required external reference for Task 5 (Wikidata).

---

### Task 2: X/Twitter handle (manual, ~15 min — trust seed)

**Files:** none (external — X). Produces URL: `https://x.com/<handle>`.

- [ ] **Step 1: Determine ownership of @agentesva**

The baseline audit surfaced [@AgenteSva](https://twitter.com/agentesva) as an existing account. Confirm whether it is ours (log in / check). Per geo-entity-building.md this is explicitly unresolved.

- [ ] **Step 2: Secure a handle**

- If `@agentesva` is ours → verify access; canonical URL = `https://x.com/agentesva`.
- If it is **not** ours → register a clean variant (`@agentesva_es` recommended for the España/LATAM framing). Set profile name `AgentesVA`, bio = the verbatim description, website = `https://agentesva.com`, avatar = `public/brand/avatar.png`.

- [ ] **Step 3: Verify it resolves**

Confirm the chosen profile URL returns 200 and shows AgentesVA branding. Record the exact URL.

**Deliverable:** one canonical X profile URL we control. Feeds Task 6.

---

### Task 3: GitHub org (manual, ~20 min — trust seed, optional-but-recommended)

The audit noted AI entity checks probe GitHub against the domain stem. A public org with 1–2 useful repos is a cheap authority signal.

**Files:** none (external — GitHub). Produces URL: `https://github.com/agentesva`.

- [ ] **Step 1: Create the org**

GitHub → New organization (Free). Login/slug: `agentesva`. Display name `AgentesVA`, email, URL `https://agentesva.com`, avatar `public/brand/avatar.png`.

- [ ] **Step 2: Seed one real repo**

Create a public repo with genuine utility so the org isn't empty — e.g. `prompts-ia-pymes` seeded from the existing pack ([`docs/pack-30-prompts-ia.md`](../../pack-30-prompts-ia.md)). A README that links back to `https://agentesva.com`. (Do **not** publish anything private or the site source unless intended.)

- [ ] **Step 3: Verify it resolves**

Confirm `https://github.com/agentesva` returns 200. Record the URL.

**Deliverable:** a public GitHub org URL. Feeds Task 6. *Skip only if you decide GitHub isn't worth maintaining — note the skip.*

---

### Task 4: Trustpilot profile (manual, ~10 min — trust seed)

**Files:** none (external — Trustpilot). Produces URL: `https://www.trustpilot.com/review/agentesva.com`.

- [ ] **Step 1: Claim the domain profile**

Trustpilot → free Business account → claim `agentesva.com`. No need to solicit reviews yet; claiming reserves the profile and creates a citable business entity.

- [ ] **Step 2: Verify it resolves**

Confirm `https://www.trustpilot.com/review/agentesva.com` returns a real (claimed) profile page, not a generic "not found" stub. Record the URL.

**Deliverable:** a Trustpilot profile URL. Feeds Task 6.

---

### Task 5: Wikidata item (manual, ~30 min — depends on Task 1)

Wikidata needs external references; do this **after** the LinkedIn page (Task 1) exists so the item has a reference beyond the site itself.

**Files:** none (external — wikidata.org). Produces URL: `https://www.wikidata.org/wiki/Q…`.

- [ ] **Step 1: Create a free account and a new item**

wikidata.org → create account → "Create a new Item". Fill from the geo-doc table:

| Property | Value |
|---|---|
| Label (es) | `AgentesVA` |
| Description (es) | `directorio y medio digital sobre inteligencia artificial en español` |
| Description (en) | `Spanish-language AI tools directory and media site` |
| instance of (P31) | website (Q35127) |
| official website (P856) | `https://agentesva.com` |
| language of work (P407) | Spanish (Q1321) |
| country of origin (P495) | Spain (Q29) |
| inception (P571) | 2026 |

- [ ] **Step 2: Add references**

On `official website` add the site as reference; cite the LinkedIn page (Task 1) as a second reference. Do **not** inflate the item — reference-less promotional items get deleted.

- [ ] **Step 3: Verify + record the QID**

Confirm the item saved and note the `Q…` id and full URL `https://www.wikidata.org/wiki/Q…`.

**Deliverable:** a Wikidata QID/URL. Feeds Task 6 (may arrive later than the other seeds — that's fine; `sameAs` is append-only).

---

### Task 6: Wire collected URLs into `sameAs` + regression test (CODE — TDD)

The one in-repo task. Appends every profile URL created in Tasks 1–5 to `organization.sameAs` and locks the array's invariants with a test. Run this once after the fast seeds (Tasks 1–4) are live; re-run to append Wikidata (Task 5) when its item exists.

**Files:**
- Modify: `src/data/schema.ts` (the `organization.sameAs` array, currently line ~24)
- Create: `tests/schema.test.ts`

**Interfaces:**
- Consumes: canonical profile URLs from Tasks 1–5 (each an `https://` string that resolves 200).
- Produces: nothing new for other code — `organization`, `entityGraph`, `jsonLdSerialize` keep their existing exports/signatures from `src/data/schema.ts`. This task only extends data + adds a test.

- [ ] **Step 1: Write the failing test**

Create `tests/schema.test.ts` (mirrors the existing import style, e.g. `tests/tools.test.ts` importing from `../src/data/...`):

```ts
import { describe, expect, it } from 'vitest';
import { organization, entityGraph, jsonLdSerialize } from '../src/data/schema';

describe('organization.sameAs', () => {
  const sameAs = organization.sameAs;

  it('keeps the canonical Instagram profile', () => {
    expect(sameAs).toContain('https://www.instagram.com/agentesva/');
  });

  it('every entry is an absolute https URL with no whitespace', () => {
    for (const url of sameAs) {
      expect(url).toMatch(/^https:\/\/\S+$/);
      expect(url).toBe(url.trim());
    }
  });

  it('has no duplicate entries', () => {
    expect(new Set(sameAs).size).toBe(sameAs.length);
  });

  // One assertion per profile actually created in Tasks 1–5.
  // Add a line for each; delete lines for profiles you chose to skip.
  it('includes the trust-seed profiles that exist', () => {
    expect(sameAs).toContain('https://www.linkedin.com/company/agentesva');
    // expect(sameAs).toContain('https://x.com/agentesva');            // add once Task 2 URL is known
    // expect(sameAs).toContain('https://github.com/agentesva');        // add once Task 3 done
    // expect(sameAs).toContain('https://www.trustpilot.com/review/agentesva.com'); // add once Task 4 done
    // expect(sameAs).toContain('https://www.wikidata.org/wiki/Q…');    // add once Task 5 QID exists
  });
});

describe('jsonLdSerialize', () => {
  it('escapes < so a string can never break out of the <script> tag', () => {
    expect(jsonLdSerialize({ a: '</script>' })).not.toContain('</script>');
    expect(jsonLdSerialize({ a: '</script>' })).toContain('\\u003c/script>');
  });

  it('serializes the full entity graph without a raw < character', () => {
    expect(jsonLdSerialize(entityGraph)).not.toMatch(/</);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- schema`
Expected: FAIL — `includes the trust-seed profiles that exist` fails because `sameAs` does not yet contain the LinkedIn URL.

- [ ] **Step 3: Append the real URLs to `organization.sameAs`**

In `src/data/schema.ts`, replace the current single-line array:

```ts
  sameAs: ['https://www.instagram.com/agentesva/'],
```

with a multi-line array containing the Instagram entry plus **only the URLs whose profiles you actually created and verified** (use the exact URLs recorded in Tasks 1–5; the block below shows the expected canonical forms):

```ts
  sameAs: [
    'https://www.instagram.com/agentesva/',
    'https://www.linkedin.com/company/agentesva',
    'https://x.com/agentesva',
    'https://github.com/agentesva',
    'https://www.trustpilot.com/review/agentesva.com',
    // 'https://www.wikidata.org/wiki/Q…', // uncomment + fill when Task 5 item is live
  ],
```

Keep the test's uncommented `expect(...).toContain(...)` lines in exact 1:1 correspondence with the URLs present here.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- schema`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Run the full suite + build to prove nothing broke**

Run: `npm run test`
Expected: PASS (existing consent/directory/home/tools suites still green).
Run: `npm run build`
Expected: build succeeds (JSON-LD emitted; Zod content schemas validate).

- [ ] **Step 6: Commit**

```bash
git add src/data/schema.ts tests/schema.test.ts
git commit -m "feat(geo): add trust-seed profiles to organization sameAs + regression test"
```

**Deliverable:** the sitewide entity graph now points to every live profile, and a test guarantees each `sameAs` URL is a unique, well-formed https link and the JSON-LD stays injection-safe.

---

### Task 7: Validate the live entity graph (verification — manual, ~10 min)

**Files:** none (external validators).

- [ ] **Step 1: Validate structured data**

After deploy, run the deployed `https://agentesva.com/` through the [Schema Markup Validator](https://validator.schema.org/) and Google's [Rich Results Test](https://search.google.com/test/rich-results). Confirm `Organization` parses with the new `sameAs` array and zero errors.

- [ ] **Step 2: Cross-link the profiles back**

Ensure each new profile links to `https://agentesva.com` in its bio/website field (LinkedIn, X, GitHub README, Trustpilot). Bidirectional links strengthen the entity association.

- [ ] **Step 3: Log completion in the geo doc**

Append a dated line to the `## Registro` section of [`docs/geo-entity-building.md`](../../geo-entity-building.md) listing which sameAs profiles went live, then commit:

```bash
git add docs/geo-entity-building.md
git commit -m "docs(geo): log trust-seed profiles wired into sameAs"
```

**Deliverable:** validated, bidirectionally-linked entity graph, and the geo doc's registry updated. This sets up the 2026-08-15 re-audit (Recognition + Authority dimensions).

---

## Notes on scope (deliberately excluded)

Per the audit, two other workstreams are **not** in this plan and should be run separately:
- **Content depth** (retrofit + new estudios) → run per piece through the `tom-4pass` skill.
- **Backlinks/outreach** → ongoing manual ops.

Wikipedia is intentionally omitted (no notability yet — a premature article gets deleted; see geo-entity-building.md §5).
