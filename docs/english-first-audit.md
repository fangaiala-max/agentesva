# AgentesVA English-first redesign

Implemented locally on 6 September 2026. Preview: http://127.0.0.1:4332/. No production deployment or real lead submission was performed. Existing uncommitted work was preserved; the original source snapshot is `/private/tmp/agentesva-before-english-20260906`.

## Coverage and findings

The baseline crawl covered 151 sitemap routes, their headings, sections and element counts. All responded successfully and had no desktop horizontal overflow. [Page-by-page block inventory](../artifacts/english-first/page-inventory.md) and [raw evidence](../artifacts/english-first/before/audit.json) record the scope. Repeated templates were assessed together; this is not a claim that every article received a fresh fact check or every possible state was tested.

The main issues were Spanish-only entry points, a dense uppercase visual hierarchy, competing navigation choices, inconsistent treatment of cards and prose, and no complete English commercial journey. The interactive demo was useful and deserved preservation. No evidence supports a promised conversion increase; the changes improve clarity and should later be measured against assessment starts/completions and service enquiries.

| Element | Decision and implementation | Component basis |
| --- | --- | --- |
| Homepage blocks | English outcome-led hero; demo retained; three service rows; clear pricing, process, resources and assessment sections | Custom Astro compositions |
| Logo | Connected AV mark, simplified sans-serif wordmark, small-format and monochrome variants, favicon and English social image | Custom SVG; no catalog component needed |
| Menu | Four primary destinations, assessment CTA, paired EN/ES switch; mobile toggle and Escape behavior | 21st Navigation menu, ID 808, reviewed as reference; native implementation |
| CTA | Clear task verbs, one primary action per decision point, consistent touch targets and focus | Shared native links/buttons |
| Transitions | Existing Astro navigation retained; localized scripts initialize and clean up on transitions; reduced motion respected | Existing motion system refined |
| Backgrounds | Navy brand sections and lighter reading surfaces; blue reserved for emphasis and actions | Shared CSS tokens and page styles |
| Tables | Native comparison table, row/column semantics, keyboard-scrollable region and mobile scroll hint | 21st Feature Comparison Table, ID 21218, structural reference |
| Cards | Consistent spacing, restrained corners, readable metadata; provider pricing is not invented | Custom Astro catalog cards |
| Lists | Short benefit/use-case lists, numbered process, meaningful labels rather than decoration | Native lists |
| Paragraphs | Sentence case, improved line height and reading width; English business copy and explicit limitations | Shared prose styles; no widget substitution |
| Images | Existing useful imagery retained; new vector brand assets and English OG image; generated image links and alt presence checked | Custom assets and existing content |
| Forms | Fully localized assessment questions, results, validation and submission states; server classification and receipt validation retained | 21st Wizard Steps, ID 23576, progress-pattern reference |
| Search and filters | English tool search combines query and category, with empty state and reset | Action Search Bar, ID 555, considered; simpler native filter implemented |
| FAQ | Native details/summary on service and pricing pages | FAQ 3, ID 684, considered; native details retained |
| Footer | Clear grouped resources, business links, language-aware policy links and honest Spanish newsletter label | Custom Astro |

## Paid 21st.dev MCP evidence

The available authenticated MCP returned paid-tier access. Search results were inspected and source was retrieved for these three components:

| Retrieved component | Source | Decision |
| --- | --- | --- |
| Navigation menu · 808 · shadcn | https://21st.dev/@shadcn/components/navigation-menu | Adapt navigation hierarchy and interaction expectations to the existing Astro header |
| Feature Comparison Table · 21218 · 7ovr | https://21st.dev/@7ovr/components/comparison-3 | Adapt comparison layout to semantic HTML and the actual service offers |
| Wizard Steps · 23576 · ddoemonn | https://21st.dev/@ddoemonn/components/wizard-steps | Apply progress clarity to the existing assessment without replacing its business rules |

Other search candidates included Navbar Menu (1024), Rich Navigation Menu (18191), Pricing Table (1541), Pricing Section with Comparison (1318), Search Tool (12365), FAQ 3 (684), FAQ tabs (4200), and Action Search Bar (555). Their metadata informed selection; their source was not retrieved or installed.

The retrieved examples target React ecosystems, with associated UI/icon and in some cases motion dependencies. This site uses Astro and native client scripts. No React island or new dependency was added solely to display these patterns. These are original Astro implementations informed by catalog references, not claims that three paid packages were installed. The MCP response did not provide a separate license grant; no third-party source package was vendored.

## Design and brand

The selected direction is applied intelligence: readable navy/blue UI, generous light surfaces, restrained motion and a connected AV symbol. A serif editorial identity would retain more of the old media feel; a generic circuit/robot identity would emphasize technology but weaken distinctiveness. The selected mark works better at favicon size and alongside both languages.

Assets: `public/brand/mark.svg`, `mark-light.svg`, `mark-mono.svg`, three wordmark SVG variants, and `og-en.png`. Existing self-hosted DM Sans Variable, DM Serif Display and JetBrains Mono packages use OFL licenses. Main headings and interface now favor DM Sans; decorative uppercase and tightly packed headings were reduced. No new remote font dependency was introduced.

## English priority and language coverage

- `/` is English; `/es/` preserves the original Spanish homepage and its existing work.
- English service overview, three service details, pricing, process, assessment, protected receipt display, privacy/cookies/legal and editorial methodology are available.
- All 54 tool profiles and 16 course profiles have English catalog copy, plus directory/category views. Provider links and course language are preserved; current availability and prices are not asserted without verification.
- English resource descriptions identify Spanish downloadable products explicitly. Thirty English business prompts and a local prompt builder are available.
- Thirty editorial pages have concise English adaptations linking to the complete Spanish originals. They are **not full translations**. Spanish paid-library delivery, downloads, RSS/search and newsletter content remain Spanish. The English signup page explains the newsletter language.
- Paired routes use self-canonicals, English/Spanish alternatives and English x-default. Noindex pages omit language alternatives. Existing Spanish slugs are preserved; editorial and catalog English paths retain stable item slugs.

The original source contains time-sensitive provider descriptions and news claims, including an apparent future-date inconsistency in the cybersecurity story. The English edition avoids presenting those unverified specifics as current facts. A source-verification and full editorial translation pass remains separate work; the redesign does not certify the original archive's accuracy.

## Verification

- `npm run test`: 56 files, **488 tests passed**, including new language mapping, catalog completeness and localization tests. Existing source assertions were updated to the preserved SpanishHome component where appropriate.
- `npm run build`: passed, including sitemap/GEO checks and Pagefind indexing of two languages.
- `node scripts/verify-english-first.mjs`: **305 generated HTML pages**, 152 English / 153 Spanish, with zero errors for internal links, alternate targets, H1 count, missing image assets or absent alt attributes. This is attribute coverage, not a judgment of every alt description.
- Browser crawl: **304 regular routes** at 390px, all HTTP 200, one H1 each, no horizontal document overflow. The static 404 was checked by the generated-page verifier.
- Representative homepage, pricing, tools, service and article templates were captured at 768px and 1440px, without document overflow. Before/after screenshots are in `artifacts/english-first/`.
- Browser interactions checked: mobile menu/Escape, language switching on matching tool pages, combined directory search/reset/empty state, prompt builder/copy, all assessment questions through results, and English/Spanish demo behavior across client navigation with reduced motion.
- Assessment business classification and successful-response validation remain covered by existing tests. No real contact submission, purchase or email was sent. Production backend integrations were not exercised.

These checks do not establish a Lighthouse score, full WCAG conformance, device-lab compatibility or measured conversion uplift. Full editorial translations and English downloadable/emailed products remain outstanding language work.

## Maintenance

Route pairing lives in `src/i18n/routes.ts`; English catalog and interface data lives in `src/i18n/`. Shared English page styles are in `src/styles/english.css`; homepage composition is in `english-home.css`; cross-language accessibility and readability refinements are in `refinement.css`.

The English demo mirrors the existing Spanish demo engine to preserve the user's in-progress behavior. Changes to demo mechanics should be applied to both scripts until they are consolidated. English price copy currently mirrors the original canonical offers and should be updated together when offers change.
