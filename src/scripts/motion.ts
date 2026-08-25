// Sistema de motion global. El layout compartido lo inicia en cada page-load y
// lo desmonta antes de que ClientRouter sustituya el DOM.
type Cleanup = () => void;

const noop = () => {};
const AMBIENT_VIEWPORT_MARGIN_PX = 160;
const MAGNETIC_STRENGTH = 0.18;
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

let activeCleanup: Cleanup = noop;
let initQueued = false;
let shouldStart = false;

function animationTarget(animation: Animation): Element | null {
  const effect = animation.effect as (AnimationEffect & { target?: Element | null }) | null;
  return effect?.target instanceof Element ? effect.target : null;
}

function setupAmbientMotion(): Cleanup {
  if (typeof document.getAnimations !== 'function') return noop;
  const loops = document
    .getAnimations({ subtree: true })
    .filter((animation) => animation.effect?.getTiming().iterations === Infinity);
  if (!loops.length || typeof IntersectionObserver === 'undefined') return noop;

  const byTarget = new Map<Element, Animation[]>();
  loops.forEach((animation) => {
    const target = animationTarget(animation);
    if (!target) return;
    const targetAnimations = byTarget.get(target) ?? [];
    targetAnimations.push(animation);
    byTarget.set(target, targetAnimations);
  });

  const visibleTargets = new Set<Element>();
  const syncTarget = (target: Element, visible: boolean) => {
    if (visible) visibleTargets.add(target);
    else visibleTargets.delete(target);
    (byTarget.get(target) ?? []).forEach((animation) => {
      if (visible && !document.hidden) animation.play();
      else animation.pause();
    });
  };

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => syncTarget(entry.target, entry.isIntersecting)),
    { rootMargin: `${AMBIENT_VIEWPORT_MARGIN_PX}px 0px` },
  );

  byTarget.forEach((_animations, target) => {
    const rect = target.getBoundingClientRect();
    const nearViewport =
      rect.bottom >= -AMBIENT_VIEWPORT_MARGIN_PX &&
      rect.top <= window.innerHeight + AMBIENT_VIEWPORT_MARGIN_PX;
    syncTarget(target, nearViewport);
    observer.observe(target);
  });

  const onVisibilityChange = () => {
    byTarget.forEach((_animations, target) => syncTarget(target, visibleTargets.has(target)));
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    loops.forEach((animation) => animation.pause());
    visibleTargets.clear();
    byTarget.clear();
  };
}

function setupPointerMotion(): Cleanup {
  if (reduceQuery.matches || !finePointerQuery.matches) return noop;

  const controller = new AbortController();
  let spotlightFrame = 0;
  let spotlightTarget: HTMLElement | null = null;
  let spotlightX = 0;
  let spotlightY = 0;

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      const source = event.target as HTMLElement | null;
      const card = source?.closest?.<HTMLElement>('.spotlight') ?? null;
      if (!card) return;
      spotlightTarget = card;
      spotlightX = event.clientX;
      spotlightY = event.clientY;
      if (spotlightFrame) return;
      spotlightFrame = requestAnimationFrame(() => {
        spotlightFrame = 0;
        if (!spotlightTarget?.isConnected) return;
        const rect = spotlightTarget.getBoundingClientRect();
        spotlightTarget.style.setProperty('--mx', `${spotlightX - rect.left}px`);
        spotlightTarget.style.setProperty('--my', `${spotlightY - rect.top}px`);
      });
    },
    { passive: true, signal: controller.signal },
  );

  const magneticFrames = new Map<HTMLElement, number>();
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    let pointerX = 0;
    let pointerY = 0;
    element.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch') return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (magneticFrames.has(element)) return;
        const frame = requestAnimationFrame(() => {
          magneticFrames.delete(element);
          if (!element.isConnected) return;
          const rect = element.getBoundingClientRect();
          const x = (pointerX - (rect.left + rect.width / 2)) * MAGNETIC_STRENGTH;
          const y = (pointerY - (rect.top + rect.height / 2)) * MAGNETIC_STRENGTH;
          element.style.transform = `translate(${x}px, ${y}px)`;
        });
        magneticFrames.set(element, frame);
      },
      { passive: true, signal: controller.signal },
    );
    element.addEventListener(
      'pointerleave',
      () => {
        const frame = magneticFrames.get(element);
        if (frame) cancelAnimationFrame(frame);
        magneticFrames.delete(element);
        element.style.transform = '';
      },
      { signal: controller.signal },
    );
  });

  return () => {
    controller.abort();
    if (spotlightFrame) cancelAnimationFrame(spotlightFrame);
    magneticFrames.forEach((frame) => cancelAnimationFrame(frame));
    magneticFrames.clear();
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
      element.style.transform = '';
    });
  };
}

function startMotion(): Cleanup {
  const cleanups: Cleanup[] = [];
  const restart = () => initMotion();
  reduceQuery.addEventListener('change', restart);
  finePointerQuery.addEventListener('change', restart);
  cleanups.push(() => reduceQuery.removeEventListener('change', restart));
  cleanups.push(() => finePointerQuery.removeEventListener('change', restart));

  if (!reduceQuery.matches) {
    cleanups.push(setupAmbientMotion());
    cleanups.push(setupPointerMotion());
  }

  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}

export function initMotion() {
  shouldStart = true;
  if (initQueued) return;
  initQueued = true;
  queueMicrotask(() => {
    initQueued = false;
    if (!shouldStart) return;
    activeCleanup();
    activeCleanup = startMotion();
  });
}

export function teardownMotion() {
  shouldStart = false;
  activeCleanup();
  activeCleanup = noop;
}
