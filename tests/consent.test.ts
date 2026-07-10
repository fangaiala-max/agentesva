import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CONSENT_KEY,
  getConsent,
  setConsent,
  isGA4Loaded,
  grantConsent,
  denyConsent,
  initConsentMode,
} from '../src/scripts/consent';

const GA_ID = 'G-TEST123';

beforeEach(() => {
  localStorage.clear();
  document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());
  // @ts-expect-error reset dataLayer entre tests
  window.dataLayer = undefined;
});

describe('consent state', () => {
  it('getConsent devuelve null sin elección previa', () => {
    expect(getConsent()).toBeNull();
  });

  it('setConsent persiste en localStorage', () => {
    setConsent('granted');
    expect(localStorage.getItem(CONSENT_KEY)).toBe('granted');
    expect(getConsent()).toBe('granted');
  });
});

describe('initConsentMode', () => {
  it('inicializa dataLayer con consent default denegado', () => {
    initConsentMode();
    // @ts-expect-error dataLayer inyectado
    const events = window.dataLayer as unknown[];
    expect(Array.isArray(events)).toBe(true);
    const hasDefaultDenied = events.some(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'default' &&
        (e[2] as Record<string, string>).analytics_storage === 'denied',
    );
    expect(hasDefaultDenied).toBe(true);
  });
});

describe('grant / deny', () => {
  it('denyConsent no carga GA4 y persiste denied', () => {
    initConsentMode();
    denyConsent();
    expect(getConsent()).toBe('denied');
    expect(isGA4Loaded()).toBe(false);
  });

  it('grantConsent carga gtag.js y persiste granted', () => {
    initConsentMode();
    grantConsent(GA_ID);
    expect(getConsent()).toBe('granted');
    expect(isGA4Loaded()).toBe(true);
    const tag = document.head.querySelector('script[data-ga4]') as HTMLScriptElement;
    expect(tag).not.toBeNull();
    expect(tag.src).toContain('googletagmanager.com/gtag/js');
    expect(tag.src).toContain(GA_ID);
  });

  it('grantConsent es idempotente (no duplica el script)', () => {
    initConsentMode();
    grantConsent(GA_ID);
    grantConsent(GA_ID);
    expect(document.head.querySelectorAll('script[data-ga4]').length).toBe(1);
  });

  it('grantConsent empuja un consent update a granted', () => {
    initConsentMode();
    grantConsent(GA_ID);
    // @ts-expect-error dataLayer inyectado
    const events = window.dataLayer as unknown[];
    const hasUpdateGranted = events.some(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update' &&
        (e[2] as Record<string, string>).analytics_storage === 'granted',
    );
    expect(hasUpdateGranted).toBe(true);
  });
});
