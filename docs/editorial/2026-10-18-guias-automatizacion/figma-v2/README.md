# AgentesVA visual guide assets — Figma revision

[Open the editable Figma masters](https://www.figma.com/design/uuDKTEYcwWqKNGevy5l2Xt?node-id=5-2). Three named pages: Processes, Claude and Social. Each has ES/EN and desktop/mobile compositions for a visual shortlist, explanatory example and final infographic.

## Delivered

- 36 native editable Figma frames; no image-filled nodes or flattened UI screenshots.
- 36 PNG exports for responsive article images, plus 6 native SVG exports of the desktop final infographics.
- Exact DM Sans and JetBrains Mono font families verified on every frame. Brand paint styles link shared colours.
- [Asset manifest](asset-manifest.json): node IDs, source links, dimensions, checksums, provenance and review status. Temporary download URLs are not retained.
- [Figma structural review](structural-review.json): all frame inventories, exact fonts, zero text-overflow findings and zero image-filled nodes.
- [Reading-path comparison](reading-path-comparison.json): 62–66% fewer HTML words exposed initially. Counts retain the summary of closed details and exclude graphic labels, header, footer and TOC; this measures prose exposure, not user comprehension, reading time or outcomes.

## Review

All 36 actual PNG exports were inspected on six desktop/mobile contact sheets. Text, colour, grouping, source qualifiers and language variants were checked; the SVG final infographics were also parsed and raster-rendered. Source is the native Figma file. `build-assets.js` is the construction recipe, not a second visual master.

Internal benchmark: the earlier generic process chain in `public/images/guides/buying/processes-flow-es.png` has been replaced by a concrete request/validation split, with missing-data review and same-ID retry. The earlier social text summary is supplemented by a quantitative 10-slot queue versus 20-post monthly allowance illustration. These changes explain relationships; they are not evidence of product performance.

The local article layout now leads with a visual shortlist, uses native expandable tool reviews and comparison tables, retains free-plan/trial labels and full source-linked copy, and ends with the new infographic. Direct links open the relevant review.

Validation: 519 tests pass across 62 files, including execution of the real fragment-navigation script; production build and all existing SEO/bilingual checks pass; six built articles retain their full bodies, localized figures, downloads, canonical/hreflang and valid local links. Browser layout, focus/keyboard interaction and actual breakpoint behavior remain unverified because the browser connection is unavailable. Export inspection does not substitute for whole-page browser QA.

The user subsequently authorized pushing the branch and opening a PR for review. Merge and public deployment remain unauthorized.
