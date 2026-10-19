# Homepage growth implementation plan

> Execute inline with executing-plans; user has approved implementation. Preserve the original checkout and prepare a PR; merge requires a later request.

**Goal:** Make the demo usable on narrow screens and preserve its context into a measurable assessment journey.

**Architecture:** Keep existing localized demos and shared consent-aware tracker. Add bounded event contracts and context rendering; preserve existing contact/backend semantics.

**Stack:** Astro, TypeScript, CSS, Vitest/happy-dom. No new dependencies.

- [x] Preserve dirty primary checkout and branch from released main e74f7da in `.worktrees/home-growth`.
- [x] Inspect audit evidence and code; record root causes and approved design.
- [ ] Add behavioral regressions for both demo implementations, context and recommendation milestones. Run `npm run test -- tests/home-growth.test.ts tests/track.test.ts` and confirm new assertions fail before code changes.
- [ ] Implement new events in `track.ts`, and consent-aware emitters in both `agency-home*.ts` and `diagnostico.ts`; preserve old event meanings.
- [ ] Add localized demo assessment links/context notices, an English breadcrumb trail and optional localized Breadcrumb label. Do not prefill answers.
- [ ] Apply shared narrow-width CSS for tabs, simulation tracks, output text and action links; verify structurally and record browser limitation.
- [ ] Update analytics contract and add built-page assertions. Run focused tests, then all tests and `npm run build`.
- [ ] Inspect six live guide URLs/sitemap; check Search Console only through authenticated access. Never call public fetches an indexing check.
- [ ] Review diff, record unresolved browser/account checks, commit and open PR with evidence. No merge/deploy.
