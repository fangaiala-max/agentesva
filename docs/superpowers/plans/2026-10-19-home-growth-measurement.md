# Homepage growth implementation plan

> Execute inline with executing-plans; user has approved implementation. Preserve the original checkout and prepare a PR; merge requires a later request.

**Goal:** Make the demo usable on narrow screens and preserve its context into a measurable assessment journey.

**Architecture:** Keep existing localized demos and shared consent-aware tracker. Add bounded event contracts and context rendering; preserve existing contact/backend semantics.

**Stack:** Astro, TypeScript, CSS, Vitest/happy-dom. No new dependencies.

- [x] Preserve dirty primary checkout and branch from released main e74f7da in `.worktrees/home-growth`.
- [x] Inspect audit evidence and code; record root causes and approved design.
- [x] Add behavioral regressions for both demo implementations, context and recommendation milestones. Confirm missing-feature assertions fail before code changes.
- [x] Implement new events in `track.ts`, and consent-aware emitters in both `agency-home*.ts` and `diagnostico.ts`; preserve old event meanings.
- [x] Add localized demo assessment links/context notices, an English breadcrumb trail and optional localized Breadcrumb label. Do not prefill answers.
- [x] Apply shared narrow-width CSS for tabs, simulation tracks, output text and action links; verify structurally and record browser limitation.
- [x] Update analytics contract and add built-page assertions. Focused regressions and 553 tests across 63 files pass; final production build includes the homepage journey guard.
- [x] Inspect six live guide URLs/sitemap and record public technical readiness separately from Google index state.
- [x] Spec review then independent quality review; fix schema-context and unreadable-consent-storage findings with regression evidence. Prepare PR changes and documentation. No merge/deploy.
- [ ] Whole-page EN/ES demo and six-guide browser layout/focus/keyboard acceptance; Chrome remains unavailable after reconnection attempt.
- [ ] Authenticated Search Console URL Inspection for all six guide URLs.
- [ ] Actual GA4 Realtime/DebugView receipt after authorized deployment; no new key-event configuration has been applied.
