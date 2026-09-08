# AgentesVA — Citable checker assessment, 8 September 2026

Target: https://agentesva.com/
Checker: https://citable.agency/checker/
Public report: https://citable.agency/check/agentesva.com/

Submitted agentesva.com through the checker UI. The resulting report was dated
2026-09-08 and returned **48/100**, with 100% weighted evidence coverage and all
10 signals assessed: 4 passing, 1 warning, 5 failures, none unavailable.
This is a structural heuristic, not a measurement of AI mentions or citations.

| Signal | Score | Finding |
| --- | ---: | --- |
| Schema markup | 50 | Organization present with one sameAs profile |
| AI crawler access | 100 | All four checked search crawlers allowed at root |
| Author entity | 90 | Person with two sameAs pointers detected |
| Wikipedia presence | 0 | No matching article detected |
| Wikidata sameAs | 0 | No matching entity detected |
| Google Knowledge Graph | 0 | No brand match reported |
| Content freshness | 100 | Most recent detected dateModified two days old |
| Factual density | 10 | Few numeric patterns detected in sampled content |
| Trust-seed profiles | 10 | No profiles detected by domain-stem probes |
| Content renderability | 100 | Approximately 978 words retrieved |

## Local changes

Added four homepage questions and answers in English and Spanish covering
project costs, timing, the demo's scope and ongoing support. Answers link to
pricing, methodology and the existing demo handover. Prices reuse
src/data/service-offer.ts. The demo's three areas and two cases per area are
verifiable in the existing EN/ES demo data and documentation; they are explicitly
fictional examples, not client performance evidence.

FAQPage JSON-LD is generated from the same question and answer objects as the
visible content. This makes existing useful facts available in the initial
homepage HTML. It does not establish that the checker score will increase or
that search engines will show FAQ rich results.

## Verification

- npm run build: passed, including social-image, bilingual and SEO postbuild checks.
- 19 existing tests passed across bilingual-ui, seo-commercial-map and agency-home.
- Generated HTML for / and /es/: all four FAQ questions and answers exactly
  match the FAQPage structured data; links use the appropriate language routes.
- Browser: all English answers expanded successfully; Spanish demo and timing
  answers expanded successfully. Desktop and 390px mobile FAQ layouts inspected.
- No browser console errors observed during the checks.

## Remaining work and limits

- Changes are local and not deployed. The only observed live score is 48/100.
  Deploy and repeat the public checker before claiming a numerical improvement.
- Organization currently links only to https://www.instagram.com/agentesva/.
  A focused public search did not establish additional official company profiles.
  The user was asked for existing profile URLs. Verify identity and ownership
  before adding URLs to sameAs; contributor profiles are not company equivalents.
- Domain-stem probes can miss legitimate profiles with different slugs. Treat
  the trust-seed result as a probe finding, not proof that no profiles exist.
- Wikipedia, Wikidata and Google entity absence are not automatic defects for
  a small business. Do not create records simply to satisfy the score.
- The numeric-pattern heuristic does not measure factual accuracy. Do not pad
  the homepage with unrelated statistics, invented quotes or customer outcomes.
- Older scores such as the reported 65 are not directly comparable without
  confirming checker version, sample and scoring method.

This assessment supersedes score-driven recommendations in the older entity
plan: fixed quotas of numbers or quotations and creation of encyclopedia/entity
records purely for scoring should not guide implementation.
