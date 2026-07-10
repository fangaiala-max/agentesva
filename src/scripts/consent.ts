// Google Consent Mode v2 + carga diferida de GA4 (cliente). CSP-safe: módulo externo
// (script-src 'self'); gtag.js se inyecta dinámicamente sólo tras aceptar. GDPR: default
// denegado, no se carga analytics ni cookies hasta consentimiento explícito.

export const CONSENT_KEY = 'agv-consent';

type ConsentValue = 'granted' | 'denied';

function dataLayer(): unknown[] {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

// gtag empuja `arguments` (array-like) al dataLayer; replicamos el patrón oficial.
function gtag(...args: unknown[]): void {
  dataLayer().push(args);
}

export function getConsent(): ConsentValue | null {
  const v = localStorage.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function setConsent(value: ConsentValue): void {
  localStorage.setItem(CONSENT_KEY, value);
}

export function isGA4Loaded(): boolean {
  return document.head.querySelector('script[data-ga4]') !== null;
}

// Estado por defecto: todo denegado. Se llama en cada carga (incluidas las
// navegaciones View Transitions), pero el `default` de Consent Mode debe fijarse
// una sola vez: si ya hay un `consent default` en el dataLayer, no lo re-empujamos.
export function initConsentMode(): void {
  const already = dataLayer().some(
    (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'default',
  );
  if (already) return;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

function loadGA4(id: string): void {
  if (isGA4Loaded()) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.setAttribute('data-ga4', '1');
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', id);
}

// Sólo concedemos analítica: el banner divulga únicamente GA4 y el sitio no carga
// ningún píxel publicitario, así que las señales de ads se mantienen denegadas (GDPR:
// el consentimiento debe ser específico a lo divulgado).
export function grantConsent(id: string): void {
  setConsent('granted');
  gtag('consent', 'update', { analytics_storage: 'granted' });
  loadGA4(id);
}

export function denyConsent(): void {
  setConsent('denied');
  gtag('consent', 'update', { analytics_storage: 'denied' });
}

function wireBanner(banner: HTMLElement, id: string): void {
  const accept = banner.querySelector<HTMLButtonElement>('[data-consent-accept]');
  const reject = banner.querySelector<HTMLButtonElement>('[data-consent-reject]');
  accept?.addEventListener('click', () => {
    grantConsent(id);
    banner.hidden = true;
  });
  reject?.addEventListener('click', () => {
    denyConsent();
    banner.hidden = true;
  });
}

// Punto de entrada de página: fija el default denegado, respeta la elección previa
// (carga GA4 si ya se aceptó) y, si no hay elección, muestra y cablea el banner.
export function initConsent(id: string): void {
  initConsentMode();
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  const prior = getConsent();
  if (prior === 'granted') {
    grantConsent(id);
    if (banner) banner.hidden = true;
    return;
  }
  if (prior === 'denied') {
    if (banner) banner.hidden = true;
    return;
  }
  if (banner) {
    banner.hidden = false;
    wireBanner(banner, id);
  }
}
