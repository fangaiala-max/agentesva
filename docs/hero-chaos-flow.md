# Hero: from scattered tasks to a connected workflow

Approved direction 1, implemented on the English homepage. The existing interactive demo below the hero remains available for detailed exploration. The Spanish homepage retains its existing hero.

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

This iteration is local and has not been committed or pushed.
