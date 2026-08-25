# Astro motion production review — 2026-08-25

## Readiness outcome

Ready for preview deployment. The local production build, automated suite, repeated client navigation, reduced-motion mode, responsive behavior, and browser accessibility checks pass. This review does not include a production deployment.

## Experience contract

Motion should direct attention, acknowledge interaction, and preserve continuity without delaying essential content. The system uses the least complex browser layer that satisfies that goal: CSS animations for entrances and ambient effects, the Web Animations API for lifecycle control, and small pointer handlers for spotlights and magnetic CTAs. There is no canvas, WebGL, or animation-library runtime.

| Pattern | Intent | Production behavior |
| --- | --- | --- |
| Hero entrance | Orient and express | Only the eyebrow and commercial card animate; the headline, explanation, actions, and trust evidence render immediately. |
| Ambient loops | Express | Run near the viewport, pause offscreen or in a hidden tab, and disappear under reduced motion. |
| Spotlight | Acknowledge | Fine-pointer devices only; one delegated, animation-frame-batched listener. |
| Magnetic CTA | Acknowledge | Fine-pointer devices only; subtle displacement, animation-frame batching, and deterministic cleanup. |
| Route transition | Connect and orient | Astro `ClientRouter`; motion initializes on `astro:page-load` and tears down on `astro:before-swap`. |
| Counters | Inform | Server-rendered final values remain truthful until intersection; animation is progressive enhancement and is cancellable. |

## Findings resolved

- Globalized motion initialization so direct entry to any route receives the same behavior.
- Added explicit teardown for pointer listeners, animation frames, observers, media-query listeners, and directory counters.
- Paused infinite ambient animations outside a 160 px viewport margin and while the document is hidden.
- Re-evaluated reduced-motion and pointer capability when preferences change.
- Removed delayed animation from essential hero explanation, actions, and trust evidence.
- Preserved final counter values before intersection and for no-JavaScript/reduced-motion users.
- Raised six small-label foregrounds from 4.26:1 to an AA-compliant contrast.

## Verification evidence

- `npm test`: 51 files, 444 tests passed.
- `npm run build`: Astro/Vercel build, GEO verification, and Pagefind indexing passed.
- `git diff --check`: passed.
- Lighthouse desktop: Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100; 56 passed, 0 failed.
- Local desktop trace: LCP 161 ms and CLS 0.02. These are lab values from the local development server, not field data.
- Repeated Astro navigation `/` → `/servicios/` → back: correct route state, magnetic interaction active, 10 ambient loops without duplication, 0 offscreen loops running, and no console errors.
- Reduced-motion emulation: 0 infinite animations, 0 running animations, final counter values preserved.
- Mobile 390 × 844: no horizontal overflow; touch disables pointer motion; menu opens and closes with Escape.
- Built `_astro` assets: 620 KiB total; motion chunk 2,680 bytes.

## Architecture and rollback

The shared layout owns the global motion lifecycle. Page modules retain ownership of page-specific interactions. If motion must be degraded quickly, reduced-motion already removes non-essential animation. For an emergency code rollback, remove the shared layout calls to `initMotion` and `teardownMotion`; content and navigation remain functional because final content is server-rendered.

Astro lifecycle choices follow the official guidance for scripts used with `ClientRouter`: initialize page-specific behavior from `astro:page-load`, and use transition lifecycle events for cleanup. See [Astro view transitions](https://docs.astro.build/en/guides/view-transitions/) and the [transitions API reference](https://docs.astro.build/en/reference/modules/astro-transitions/).

## Release gate

Before production promotion, deploy this branch to a preview URL and repeat the smoke path on the built artifact: home load, services navigation, back navigation, mobile menu, reduced motion, and console/network inspection. No code-level blocker remains from this review.
