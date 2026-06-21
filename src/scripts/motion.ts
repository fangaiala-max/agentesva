// Motion: spotlight glow-follow + CTA magnético. CSP-safe (sin eval), respeta
// prefers-reduced-motion, e idempotente entre navegaciones de View Transitions.
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let spotlightWired = false;

function wireSpotlight() {
  if (spotlightWired || REDUCE) return;
  spotlightWired = true;
  // Un solo listener delegado a nivel de documento (persiste entre navegaciones).
  document.addEventListener(
    'pointermove',
    (e) => {
      const t = e.target as HTMLElement | null;
      const card = t && t.closest ? (t.closest('.spotlight') as HTMLElement | null) : null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

function wireMagnetic() {
  if (REDUCE) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    if (el.dataset.magWired) return;
    el.dataset.magWired = '1';
    const strength = 0.3;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

export function initMotion() {
  wireSpotlight();
  wireMagnetic();
}
