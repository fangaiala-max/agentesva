# Interactive editorial tool showcase

Implemented for the English tools directory, category directories and all 54 English tool profiles. Existing Gemini brand tokens and DM Sans typography are retained.

## 21st.dev provenance

Paid MCP component source retrieved and reviewed:

- Expanding Cards, vaib215, demo 5526: https://21st.dev/@vaib215/components/expanding-cards
- Animated Tabs, ibelick, demo 1115: https://21st.dev/@ibelick/components/animated-tabs
- Comparison Table, ruixen.ui, demo 7469: https://21st.dev/@ruixen.ui/components/comparison-table

These are native Astro/CSS/TypeScript adaptations of the interaction patterns, not unmodified React installations. No React or animation runtime dependency was added. Expansion uses explicit buttons; profile tabs support arrows/Home/End; comparison uses a native modal dialog and safe text rendering. Reduced-motion preferences disable transitions.

## Editorial decisions

- Feature Perplexity, Claude and Canva as three ways to research, draft and visualize an idea. These are editorial examples, not paid placements or ranked recommendations.
- Local SVG logos for Perplexity, Claude, Canva and Notion were retrieved from SVGL through 21st.dev logo search. Other tools use a neutral tool symbol alongside the full product name; no invented brand marks.
- Workflow illustrations are explicitly labeled as illustrations, not product screenshots.
- Comparison uses existing English descriptions, categories, capabilities and first steps. No unverified prices, ratings, audience metrics or partner claims were added.
- Selection is limited to two tools. Selections survive catalog filtering; the fixed selection bar keeps them accessible. Closing the native dialog restores focus.
- English profile provider CTAs now use `/ir/{slug}?src=en-profile-hero` and the existing affiliate-click analytics attributes. Affiliate disclosure and sponsored link relation are conditional on an actual affiliate URL.
- Tool submissions and partnership enquiries open the visitor's email client addressed to `hola@agentesva.com`. They do not rely on the currently failing Brevo newsletter endpoint; mailbox forwarding remains unverified as recorded in the forms audit.

## Verification

- Existing suite: 492 tests passed before the final presentation adjustment.
- Added focused tests for exclusive featured expansion, keyboard tab navigation, two-tool selection limits, removal and clear behavior.
- Browser checks: 54 cards, featured activation, comparison content, Escape dismissal, search empty state/reset, profile tabs and tracking href.
- At 390 px: catalog and sample profile have no horizontal page overflow; the comparison table scrolls inside its dialog.
- Production build and generated-site link validation run separately. No deployment, commit or push is included in this change.
