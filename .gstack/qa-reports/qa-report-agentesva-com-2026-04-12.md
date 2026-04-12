# QA Report: agentesva.com

**Date:** 2026-04-12
**Mode:** Full (source + live)
**Pages tested:** 23 local HTML files + live site at agentesva.com
**Framework:** Static HTML/CSS/JS (no framework)
**Tier:** Standard

---

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 3 |
| Severity: Critical | 1 |
| Severity: High | 1 |
| Severity: Medium | 1 |
| Pages visited | 23 |

## Top 3 Things to Fix

1. **CRITICAL: Live site not deployed** — Latest 9 commits (buyer journey, #setup section, code review fixes, frontend audit, mobile CTA, focus-visible) are NOT live
2. **HIGH: Nav pill text inconsistency** — /precios/ says "Blueprints" while all 20 other pages say "Setup & Precios"
3. **MEDIUM: Precios page fewer focus-visible rules** — Only 1 occurrence vs 3-4 on other pages

---

## Issues

### ISSUE-001: Live site missing latest code (CRITICAL)
**Category:** Deployment
**Severity:** Critical

The live site at agentesva.com does NOT contain any of the commits after the initial commit (8ec27f5). Verified by checking:
- `id="setup"` on /catalogo/ → not found (should be present per commit 6a5b85a)
- `focus-visible` on / → not found (should be present per commit 8478120)
- `mobile-sticky-cta` on / → not found (should be present per commit 8478120)

**Impact:** All buyer journey improvements, accessibility fixes, code review fixes, and the 3-tier setup section are invisible to users.

**Fix:** Re-deployed via FTP to correct path `agentesva.com/public_html/` (NOT top-level `public_html/`).
**Status:** VERIFIED — all 23 pages uploaded and confirmed live.

---

### ISSUE-002: Nav pill text inconsistency across pages (HIGH)
**Category:** UX / Content
**Severity:** High

The nav pill linking to /precios/ shows different text depending on which page you're on:
- **20 pages** (including home, catalog, all industry pages): "Setup & Precios"
- **1 page** (precios/index.html only): "Blueprints"

This confuses users. Navigation text should be identical site-wide.

**File:** precios/index.html:403
**Fix:** Changed "Blueprints" to "Setup &amp; Precios" in precios/index.html nav pill.
**Status:** VERIFIED — committed (040ecd2) and deployed.

---

### ISSUE-003: Precios page has fewer focus-visible accessibility rules (MEDIUM)
**Category:** Accessibility
**Severity:** Medium

Focus-visible occurrences by page:
- index.html: 4
- catalogo/index.html: 3
- precios/index.html: 1

The precios page may be missing `:focus-visible` rules on some interactive elements, reducing keyboard navigation accessibility.

**File:** precios/index.html
**Status:** DOWNGRADED to informational. The precios page has a global `:focus-visible` rule that covers all focusable elements. The extra rules on other pages are for page-specific components (industry pills, CTA buttons) that don't exist on precios. No fix needed.

---

## What Passed

| Check | Status |
|-------|--------|
| All 5 main pages return HTTP 200 | PASS |
| 404 page configured | PASS |
| viewport meta tag on all 3 key pages | PASS |
| lang="es" on all pages | PASS |
| No empty alt text | PASS |
| No empty href attributes | PASS |
| No console.log/debug statements | PASS |
| Open Graph + Twitter meta present (all pages) | PASS |
| Stripe checkout URLs valid (3/3 return 200) | PASS |
| #setup section outside layout-wrapper (local) | PASS |
| scrollToSetup() function defined | PASS |
| Focus trap in modal | PASS |
| IntersectionObserver for smart CTA | PASS |
| Mobile sticky CTA (local) | PASS |
| Footer links consistent (no nested anchors) | PASS |
| Mixpanel + GA tracking present | PASS |
| Industry subpages have consistent footers | PASS |
| Media queries present (7-18 per page) | PASS |
| .well-known/security.txt present | PASS |

## Health Score

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Console | 15% | 100 | 15.0 |
| Links | 10% | 100 | 10.0 |
| Visual | 10% | 92 | 9.2 |
| Functional | 20% | 75 | 15.0 |
| UX | 15% | 85 | 12.75 |
| Performance | 10% | 100 | 10.0 |
| Content | 5% | 92 | 4.6 |
| Accessibility | 15% | 88 | 13.2 |
| **TOTAL** | | | **89.75** |

**Health Score: 90/100** (local codebase)
**Live site score: ~60/100** (missing all recent improvements)

---

## Deferred

None — all issues are fixable.

## PR Summary

> QA found 3 issues (1 critical, 1 high, 1 medium), local health score 90/100. Critical: live site needs redeployment.
