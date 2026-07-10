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

// Estado por defecto: todo denegado. Se llama en cada carga, antes de nada.
export function initConsentMode(): void {
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

export function grantConsent(id: string): void {
  setConsent('granted');
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
  loadGA4(id);
}

export function denyConsent(): void {
  setConsent('denied');
  gtag('consent', 'update', { analytics_storage: 'denied' });
}
