# Visual guides, growth audit and content refresh

**Goal:** Prepare three complete bilingual visual buying guides, a detailed homepage growth audit, and substantive updates to the most decision-useful existing posts. Publication is not authorized.

**Approved design:** User approved the visual buying-guide structure and requested Spanish and English. Canonical editorial brief and source drafts: docs/editorial/2026-10-18-guias-automatizacion/. Main experience follows DESIGN.md's September English-first update.

**Architecture:** Reuse the existing Spanish guide collection and its directory. Add full English guide translations to a separate content collection and render both through one visual editorial component. Keep existing English overviews for unrelated guides. Add precise diagram and infographic assets, plus generated conceptual covers. No analytics or backend changes.

**Stack:** Existing Astro, Markdown, scoped CSS, SVG, installed image tooling. No new rendering dependencies.

## Tasks

- [x] Inspect source and preserve dirty original checkout. Initial isolated checkout from main fa29ea0 was moved from `/tmp/agentesva-editorial-20261018` to the persistent independent checkout `/Users/fernandoangulo/Sitios web/05-agentesva/.worktrees/editorial-local`, with history and locally installed dependencies.
- [x] Research official sources and write complete Spanish drafts with costs, free limits, examples, decision criteria and sources.
- [x] Translate all three guides completely into English; preserve scope, sources, prices and limitations. Files: docs/editorial/2026-10-18-guias-automatizacion/0*-*.en.md.
- [x] Audit production home EN/ES including demo, assessment handoff and mobile. Write home-growth-audit.md, evidence and prioritized recommendations; do not modify the home merely because a report recommends changes.
- [x] Refresh highest-value existing guides selected by decision utility and material staleness; update corresponding English overviews and write existing-content-refresh.md. Preserve claims without evidence as unresolved rather than manufacturing proof.
- [x] Build VisualBuyingGuide.astro and its scoped stylesheet. Add a guide visual-kind field and full-English-translation collection; branch the two existing guide render paths only when a visual edition exists.
- [x] Create three conceptual covers, three explanatory diagrams per language and three final infographics per language. Use actual brand fonts, clear units, no fabricated statistics; keep source assets and manifest.
- [x] Convert the six drafts into validated collection entries; insert inline diagrams and final downloadable infographics. Keep all sources and substantive copy; remove workflow placeholders. Add the three English directory descriptions after the refresh editor finishes its existing-key changes.
- [x] Verify article/asset integrity, English/Spanish parity and factual limits; 519 tests in 62 files and production build pass. All six built HTML pages verified for complete copy, internal targets, figures, downloads, canonical/hreflang and intrinsic image dimensions. The real client script is exercised for fragment reveal and Astro navigation initialization.
- [x] Review all diagram/infographic exports in desktop and mobile compositions.
- [x] Revise the reading path with native Figma originals: 36 editable frames, 36 responsive PNG exports and six final SVG infographics; preserve complete copy in native expandable reviews and comparisons.
- [ ] Browser preview of six whole pages at desktop and mobile: blocked by unavailable Chrome connection; do not infer layout acceptance from static checks.
- [x] Obtain spec-compliance review before final quality review; resolve supported findings and rerun affected checks.
- [x] Deliver reviewable local preview, source files, graphics, growth report and refresh record. No push, PR, merge or public deployment without a later request.

The user subsequently requested a PR, authorizing the branch push and review request. Merge and public deployment remain outside that authorization.

## Acceptance details

Reader can choose by job, start free, understand when to pay and detect reasons to choose something else. Each guide has a complete English edition, not a concise overview. Figures have text alternatives and local downloads; every article ends in its own infographic. Mobile has no page-level overflow, local table scrolling remains usable, source links remain readable and figures preserve essential labels. Date reflects actual revision, not an automatic freshness bump.

Expert audit scores are editorial judgments. Low-sample GA4 data and a submitted sitemap are not proof of business impact or overall index coverage.

## Final review evidence

Spec compliance: pass after fixing the Spanish assessment CTA. Independent static code-quality review: pass. Original checkout remains untouched by implementation changes; feature branch and worktree retained.

Browser connection availability was checked again after static verification and still returned no available browsers/apps. Homepage production screenshots were collected before the interruption; new article runtime, keyboard and whole-page responsive checks remain unverified. This is a delivery limitation, not a passing browser review.
