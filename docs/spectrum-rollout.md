# Shared spectrum palette — English and Spanish

The approved Gemini-inspired blue/violet/rose palette now applies through BaseLayout to all website templates. The central palette and compatibility rules live in `src/styles/spectrum.css`.

Coverage includes headers/footers, primary actions, cards, tables, catalog controls, search surfaces, assessment progress/options, newsletter forms, consent controls, both homepages and the AV icon/favicon assets. English reading surfaces stay light; Spanish legacy dark layouts use the same spectrum accents with their appropriate dark surfaces. Third-party logos, provider identity colors, error/success colors and monochrome logo variants are preserved.

The hero animation remains specific to the English homepage; this rollout applies its approved color system, not the hero composition, to the other pages.

Validation: 492 tests passed; production build passed; 305 generated HTML pages passed the internal-link/alternate/heading/image check. A browser crawl of 304 regular routes at 390px found all HTTP 200, the shared brand token present, no horizontal overflow and no duplicate element IDs. Representative English and Spanish templates were reviewed at desktop width. These checks are not a full accessibility certification or a conversion measurement.

Changes remain local and are not yet committed or pushed.
