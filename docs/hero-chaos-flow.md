# Hero: from scattered tasks to a connected workflow

Approved direction 1, shared by the English homepage and `/es/` with localized task labels and controls. The existing interactive demo below the hero remains available for detailed exploration.

## 21st.dev provenance

Source retrieved through the authenticated paid MCP: **Animated Beam**, dillionverma, demo **919**.
https://21st.dev/@dillionverma/components/animated-beam

The retrieved React/Framer Motion component calculates container-relative SVG connections and recalculates them with ResizeObserver. This implementation adapts that technique to native Astro, SVG and Web Animations. It does not install a React island or claim to use the unmodified React package. Original project work supplies task layout, choreography, timing, accessible controls and lifecycle handling. No additional dependency was added.

## Behavior

- Three fictional tasks start scattered, then align: a follow-up, an invoice and a message.
- SVG beams travel into the connected flow and out toward human review.
- The sequence runs once for 6.5 seconds; it does not loop indefinitely.
- Pause and Resume control the complete timeline. Replay is available after completion.
- Offscreen and hidden-tab states pause playback. A manual pause persists when the hero becomes visible again.
- Reduced motion displays the completed layout without creating animations. Without JavaScript, readable task and review content remains present.
- Mobile uses three tasks across the top and a vertical flow; desktop uses a left-to-right composition.
- The primary assessment CTA and English-first palette are preserved. The illustration explicitly states that it uses no live data and sends no messages.

## Verification

Browser checks cover pause/resume, completion, replay, reduced motion, navigation away/back and no horizontal overflow at 320, 390, 600, 768, 1024 and 1440px. Unit regressions cover manual pause during visibility changes, reduced-motion changes, completion/replay and cancellation on teardown.

Source: `src/components/english/ChaosFlow.astro` and `src/scripts/chaos-flow.ts`.
Screenshots: `artifacts/english-first/after/chaos-hero-moving.png`, `chaos-hero-final.png`, `chaos-mobile-detail.png`.

For the subsequent bilingual rollout and its validation, see [the bilingual UI implementation review](21st-bilingual-opportunity-review.md).

## Assessment reminder and readability

The EN and ES homes share `src/scripts/diagnostic-banner.ts`. The reminder appears after the hero, waits for cookie preferences to close, and stays dismissed for the session when closed. Reaching the full assessment section retires it for that page visit. Ordinary scrolling content no longer hides/reopens it, and observers are disconnected on navigation.

Small fixed text sizes across shared styles were increased by approximately 2px (minimum 12px), with an 18px default body size. Large display headings retain their existing scale. Mobile EN/ES banner scrolling and dismissal, mobile tool cards, and desktop pricing were checked after the update.
