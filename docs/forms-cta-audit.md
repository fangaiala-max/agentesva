# Forms and CTA audit — 2026-09-06

Scope: current local design, source handlers, focused automated tests, browser flows with intercepted submissions, and non-mutating production endpoint checks. No real leads, newsletter subscriptions, bookings or purchases were created.

## Connection map

| Entry point | Destination | Verification |
| --- | --- | --- |
| Home hero, closing and sticky assessment CTAs | `/assessment/` | Internal target exists; browser questionnaire exercised |
| English / Spanish assessment contact form | `/api/diagnostic` → Notion lead database → signed thank-you page | Production rejects incomplete payload; browser success/failure and retry mocked; backend unit tests pass |
| Newsletter `/updates/`, `/newsletter/` and shared subscription forms | `/api/subscribe` → Brevo contacts or double opt-in API | Production rejects invalid email; browser validation, failure/retry and success mocked |
| Qualified assessment booking | `https://calendly.com/fangaiala/auditoria-gratis-agentesva-30-min` | Read-only request returned 200; slot availability not verified |
| Thank-you booking CTA | `BOOKING_URL`, otherwise email fallback | Source reviewed; deployed value not verified |
| Contact email | `mailto:hola@agentesva.com` | Opens visitor's email application; mailbox delivery not tested |
| Paid resource purchase links | Stripe Payment Links (`buy.stripe.com`) | One sample returned 200; purchase and delivery not exercised |
| Paid download delivery | `/descarga`, `/entrega` → Stripe Checkout session verification | Source reviewed; requires verified payment |
| Tool / affiliate links | Provider URLs, including `/ir/{slug}` redirects | Source mapping reviewed; not every external destination tested |
| Try the demo / explore services | `#demo` / `#services` | Matching home sections exist; demo anchor checked in browser |
| Service, pricing, process and resource navigation | Internal localized pages | Prior generated-site validation found no broken internal links across 305 HTML files |
| Prompt builders, catalog filters and search | Local browser functionality / Pagefind | Source reviewed; prompt generator included in focused tests |

## Results

- 68 focused tests across 8 files passed: newsletter, assessment API, Notion integration mocks, submission UI, thank-you plans, signed tokens and prompt generation.
- Assessment browser checks passed in both languages: required answers, eight steps, local recommendation, required contact details, failure recovery, malformed-response rejection, stable submission ID on retries and localized thank-you navigation. Success responses and thank-you destinations were intercepted, so this does not prove actual Notion delivery or deployed signing configuration.
- Newsletter browser checks passed in both languages: email and consent validation, recoverable server failure, retry and mocked confirmation success.
- Live production API GET requests return 405; invalid POST requests return 422. These prove routing and validation are active, not that downstream credentials or delivery work.

## Findings and remaining verification

1. **Local Astro preview cannot submit to Vercel functions.** POST requests to both API routes return 404 locally. Use the Vercel runtime or deployed environment for full integration testing.
2. **Assessment follow-up is external to this handler.** The handler writes to Notion but does not send email. The promised next-business-day reply depends on team handling or a separate automation, whose existence was not verified here.
3. **Booking configuration has two sources.** The assessment hardcodes Calendly while the thank-you page uses `BOOKING_URL`. Centralizing this would prevent mismatched destinations.
4. **Spanish newsletter error localization is incomplete.** A failed upstream subscription can display “Subscription failed” in the Spanish UI.
5. **Newsletter success validation is permissive.** Source review shows any successful HTTP response is accepted, even if its JSON lacks `success: true`. The assessment already rejects malformed success payloads.
6. **Actual delivery remains unverified.** A clearly labeled real test submission and receiving-side confirmation are needed to verify the Notion record, Brevo list/double-opt-in email and deployed thank-you signing. No real submissions were sent during this audit.

No application code was changed by this audit. Existing design changes remain local and uncommitted.

## Authorized live submissions — 2026-09-06, 01:08 UTC

The user subsequently authorized actual form tests, expecting mail to `hola@agentesva.com` and forwarding to `fangaiala@gmail.com`.

- Assessment API: submitted a clearly labeled non-commercial QA lead using the user's Gmail as the contact address. Marker/submission ID: `AGENTESVA-QA-2026-09-06T01-08-33-790Z`. Production returned HTTP 200, `success: true`, a qualified-call result and a signed thank-you redirect. This confirms successful processing according to the production handler; the Notion record was not independently opened.
- Newsletter API: submitted `hola@agentesva.com` with explicit consent and QA attribution. Marker: `AGENTESVA-NEWSLETTER-QA-2026-09-06T01-08-47-898Z`. Production returned HTTP 401 and `Subscription failed`. The handler passes through Brevo's failure status; authentication/configuration needs investigation. This was not a successful newsletter delivery.
- Gmail connector profile confirmed `fangaiala@gmail.com`. An all-folder search including spam/trash immediately after the submissions found no matching recent AgentesVA/diagnostic test email. This is a point-in-time result, not proof that delayed delivery cannot occur.
- The assessment handler contains no direct email notification to `hola@agentesva.com`; any such notification requires an external automation or a new notification integration. Inbox placement and forwarding therefore remain unverified by these tests.
