# Homepage journey and measurement

The user approved the next-step proposal: fix the mobile demo, English assessment breadcrumb and demo-to-assessment continuity; distinguish recommendation received, contact accepted and automatic qualification; verify guides and Search Console where access permits. This implements the approved design without another approval round.

## Approach

Keep the two existing localized demos and their lifecycle. Add a primary assessment link beside the service link, rendered with the current service and updated on mode changes. Show a localized service-context notice in the assessment; visitors still answer every question themselves. Retain locale/query context on language switches.

At narrow widths use three equal, shrinkable tab columns with wrapping labels, a shrinkable simulation grid, wrapping output fields and controls. The existing roving keyboard interaction remains. Root-cause evidence: the production audit measured 320px of tabs inside 262px; source uses max-content width and a non-wrapping flex row. Visual reproduction after changes requires browser access and must not be inferred from DOM tests.

Give Breadcrumb an optional locale, defaulting to the route locale. Build the English assessment trail with Home instead of Inicio, sharing that trail with JSON-LD.

Add `demo_started`, `demo_completed` and `diagnostic_recommendation_viewed`. Demo completion means an explicitly run simulation reached its final state; initial illustrative markup, cancelled runs, mode switches and teardown are not completions. Recommendation viewed means the local result was rendered and revealed. Do not rename `diagnostic_completed` (backend contact accepted), or reinterpret `lead_qualified` as sales acceptance. Never sum these two as separate leads.

Only closed categories enter GA4. Preserve consent/no-PII guards; no individual answers, contact data, query strings or synthetic contact submissions. No new GA4 key events or third-party integrations are configured by code.

## Validation

Behavior tests cover both demo languages and all modes/cases, cancellation, replay, reduced motion, teardown, assessment context/no-prefill, result deduplication/reset, contact success/failure and consent. Built HTML checks cover localized breadcrumbs and actual assessment destinations. Run all tests and production build; inspect six public guide URLs and sitemap. Browser layout/keyboard and Search Console index decisions remain pending unless authenticated access is restored.

## Alternatives considered

Only patching the CSS leaves the approved measurement and context problems open. Rebuilding the demo or assessment adds unnecessary scope. Reusing the existing components with bounded additions is the selected approach.
