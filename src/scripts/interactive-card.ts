export function setupInteractiveCards(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const controller = new AbortController();
  const cleanups: (() => void)[] = [];
  const resets: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-interactive-card]').forEach((card) => {
    let frame = 0;
    let bounds: DOMRect | undefined;
    let x = 0;
    let y = 0;
    const strength = Math.min(8, Math.max(0, Number(card.dataset.cardIntensity) || 4));
    card.dataset.cardReady = '';
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      bounds = undefined;
      delete card.dataset.cardActive;
      ['--card-x', '--card-y', '--card-rx', '--card-ry', '--card-layer-x', '--card-layer-y'].forEach((property) => card.style.removeProperty(property));
    };
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      bounds ||= card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!card.isConnected) return;
        card.dataset.cardActive = '';
        card.style.setProperty('--card-x', `${x * 100}%`);
        card.style.setProperty('--card-y', `${y * 100}%`);
        card.style.setProperty('--card-rx', `${(0.5 - y) * strength * 2}deg`);
        card.style.setProperty('--card-ry', `${(x - 0.5) * strength * 2}deg`);
        card.style.setProperty('--card-layer-x', `${(x - 0.5) * strength}px`);
        card.style.setProperty('--card-layer-y', `${(y - 0.5) * strength}px`);
      });
    }, { passive: true, signal: controller.signal });
    card.addEventListener('pointerleave', reset, { signal: controller.signal });
    card.addEventListener('pointercancel', reset, { signal: controller.signal });
    resets.push(reset);
    cleanups.push(() => { reset(); delete card.dataset.cardReady; });
  });
  const resetAll = () => resets.forEach((reset) => reset());
  window.addEventListener('scroll', resetAll, { passive: true, signal: controller.signal });
  window.addEventListener('resize', resetAll, { passive: true, signal: controller.signal });
  window.addEventListener('blur', resetAll, { signal: controller.signal });
  return () => { controller.abort(); cleanups.forEach((cleanup) => cleanup()); };
}
