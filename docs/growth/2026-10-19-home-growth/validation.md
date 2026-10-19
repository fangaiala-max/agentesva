# Validation record

## Completed

- `npm run test`: **553 tests pass across 63 files**. The release baseline was 519 tests across 62 files.
- `npm run build`: production build and postbuild checks, including `verify-built-home-growth.mjs`, cover both localized home/assessment paths, current service attribution, preserved service links, no preselected answers, and matching English visible/structured breadcrumbs.
- Existing guide, SEO, social and bilingual checks cover all six guides, 304 sitemap URLs, 311 social-metadata pages, 128 bilingual UI checks and 293 indexed Pagefind pages in two languages. Pagefind indexing is local site search, not Google indexing.
- Public HTTP/metadata/sitemap checks pass for six published guide URLs; see [machine-readable evidence](public-guide-readiness.json).
- `git diff --check`: pass.
- Independent spec review and subsequent code-quality/adversarial review: no outstanding source-level findings after supported fixes.

## Failing-first evidence

Before implementation, new runtime assertions failed for the absent demo/recommendation milestones and assessment context. The built journey guard also failed against the old released output because the demo assessment action was absent.

The retained-GA4-script denial test demonstrated that events were still being queued after consent denial; the tracker now suppresses them. Independent review then reproduced blocked storage throwing before playback; both demo implementations now complete normally with zero analytics events when reading consent throws. Separate compiled-output regression checks found the standalone breadcrumb schema missing its context; the fixed output includes schema.org context and exact matching labels/URLs.

Temporary local diagnostic logs: `agentesva-home-growth-red.log`, `agentesva-home-growth-storage-red.log`, `agentesva-breadcrumb-context-red.log`. These are debugging evidence, not live customer or GA4 events.

## Not passed or inferred

Computer-use inventory returns no browsers/apps and `Sky Computer Use native pipe startup failed`. A fresh Chrome-tab attempt after the user's reconnection response returned `Browser is not available: chrome`.

Consequently whole-page rendered mobile/desktop layout, real focus/keyboard behavior, browser console/performance, authenticated Search Console index inspection and GA4 Realtime/DebugView receipt remain pending. DOM behavior and public metadata tests do not substitute for those checks. No live contact submissions, indexing requests, new account integrations, merge or production deployment were performed for this change.
