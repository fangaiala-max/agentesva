# Homepage journey and measurement follow-up

This change implements the first three recommendations in the [homepage growth audit](../../editorial/2026-10-18-guias-automatizacion/home-growth-audit.md). It is prepared for a PR, not an authorized production merge.

## Reader journey

The English and Spanish demos keep their service links and add an assessment action. Changing the simulated area updates its service attribution and destination context. The assessment explains the starting context while leaving every answer under the visitor's control. Language changes preserve the query context. The English assessment breadcrumb says Home / Automation assessment with the accessible label Breadcrumb.

At narrow widths, demo tabs use bounded columns and wrapping labels; simulation content and actions can shrink or wrap rather than relying on the console clipping their overflow. This addresses the source pattern behind the audit's 320px observation. Actual rendered layout acceptance at 320/390px remains pending browser access.

## Event meanings

| Milestone | Meaning | A lead? |
|---|---|---|
| `demo_started` | Visitor explicitly runs a fictional local example. | No |
| `demo_completed` | That run reaches its final displayed state; cancelled runs do not count. | No |
| `diagnostic_recommendation_viewed` | Local assessment recommendation is rendered and revealed before contact submission. | No |
| `diagnostic_completed` | Existing backend accepts a voluntary contact submission. | One accepted contact |
| `lead_qualified` | Existing deterministic rules classify that accepted submission as `qualified_call`. | A subset of contacts, not a second lead or a sales-accepted opportunity |

The new events use the existing consent-aware, allowlisted tracker. No contact details, individual answers or process descriptions are sent. Existing contact, qualification and booking meanings are retained. There is no new booking confirmation integration, CRM sales-acceptance rule or account-level GA4 configuration in this PR.

Use recommendation viewers as the denominator for voluntary contact rate, accepted contacts for automatic qualification rate, and people/deduplicated submissions for lead counts. Do not add contact and qualification event totals together. Demo starts/completions include deliberate replays; those totals are not unique visitors. Consent-limited observations are not the whole audience.

## Public guide readiness

[The checked results](public-guide-readiness.json) cover all six published ES/EN editions: successful HTTP responses, self-canonical URLs, paired language links, no `noindex` directive, no global robots exclusion and sitemap inclusion.

These are public technical checks. They do not prove Google discovered, crawled, selected the declared canonical or indexed a URL. No authenticated URL Inspection result was available in this session. The existing Search Console property setup is historical context, not a fresh indexing result.

For each of the six URLs in the JSON, authenticated URL Inspection still needs to record the inspection time, coverage/index state, last crawl, crawl/fetch result and Google-selected canonical. Inspect the root property `https://agentesva.com/`. Request indexing only where the UI result and ownership allow it; no indexing request was submitted in this change.

## Remaining acceptance checks

- Browser review of both demos at 320/390px and desktop: all three tabs readable, normal/exception cases usable, output/actions not clipped, focus visible, arrow/Home/End and Tab navigation usable.
- Browser review of all six guides: complete desktop/mobile compositions, disclosure/TOC/hash navigation, downloads and keyboard focus.
- Actual GA4 receipt in Realtime/DebugView for the three new events after an authorized deployment; verify no events with analytics denied, no personal data, and unchanged contact/qualification semantics. Local mocked submissions must not become live CRM records.
- Authenticated Search Console inspection of six URLs, as described above.

Browser control currently reports no available browsers/apps and a native pipe startup failure. Plugin discovery found no already-connected direct GA4/Search Console capability; a third-party alternative was not installed or connected. No new account-sharing permissions were granted.

References: [GA4 custom event implementation and Realtime/DebugView](https://developers.google.com/analytics/devguides/collection/ga4/events), [authenticated URL Inspection API and its indexed-version limitation](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect). See the [event contract](../../analytics-events.md) for required properties and trigger semantics.
