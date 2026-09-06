/** Stable reminder: ordinary page content never changes its visibility. */
export function setupDiagnosticBanner(hero: HTMLElement, banner: HTMLElement): () => void {
  const key = 'agentesva:cta-dismissed';
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(key) === '1'; } catch { /* Storage is optional. */ }
  let pastHero = false;
  let reachedClosingCTA = false;
  const consent = document.querySelector<HTMLElement>('[data-consent-banner]');
  const sync = () => { banner.hidden = dismissed || !pastHero || reachedClosingCTA || Boolean(consent && !consent.hidden); };
  const heroObserver = new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    sync();
  });
  heroObserver.observe(hero);
  const endObserver = new IntersectionObserver(([entry]) => {
    // Once the full assessment section is reached, do not repeatedly advertise it.
    if (entry.isIntersecting) reachedClosingCTA = true;
    sync();
  });
  const end = document.querySelector('.diagnostic-close');
  if (end) endObserver.observe(end);
  const consentObserver = new MutationObserver(sync);
  if (consent) consentObserver.observe(consent, { attributes: true, attributeFilter: ['hidden'] });
  const dismiss = () => {
    dismissed = true;
    try { sessionStorage.setItem(key, '1'); } catch { /* Storage is optional. */ }
    sync();
  };
  const button = banner.querySelector<HTMLButtonElement>('#cta-dismiss');
  button?.addEventListener('click', dismiss);
  sync();
  return () => {
    heroObserver.disconnect(); endObserver.disconnect(); consentObserver.disconnect();
    button?.removeEventListener('click', dismiss); banner.hidden = true;
  };
}
