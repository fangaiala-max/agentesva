import { describe, it, expect, beforeEach } from 'vitest';
import { track, initTracking, fireViewEvents } from '../src/scripts/track';

// Simula "GA4 cargado" = consentimiento analítico concedido (mismo marcador que consent.ts).
function loadGA4() {
  const s = document.createElement('script');
  s.setAttribute('data-ga4', '1');
  document.head.appendChild(s);
}
function events(): unknown[] {
  // @ts-expect-error dataLayer inyectado
  return (window.dataLayer as unknown[]) ?? [];
}
function eventNames(): string[] {
  return events()
    .filter((e) => Array.isArray(e) && e[0] === 'event')
    .map((e) => (e as unknown[])[1] as string);
}

beforeEach(() => {
  document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());
  document.body.innerHTML = '';
  // @ts-expect-error reset dataLayer entre tests
  window.dataLayer = undefined;
  // NOTA: no reseteamos __trackingWired — el listener delegado persiste (View
  // Transitions no recrean el documento); initTracking es idempotente a propósito.
});

describe('track', () => {
  it('no hace nada si GA4 no está cargado (sin consentimiento)', () => {
    track('affiliate_click', { slug: 'x' });
    expect(eventNames()).not.toContain('affiliate_click');
  });

  it('empuja ["event", nombre, params] cuando GA4 está cargado', () => {
    loadGA4();
    track('affiliate_click', { slug: 'notion-ai', src: 'ficha-hero' });
    const last = events().at(-1) as unknown[];
    expect(last[0]).toBe('event');
    expect(last[1]).toBe('affiliate_click');
    expect(last[2]).toEqual({ slug: 'notion-ai', src: 'ficha-hero' });
  });
});

describe('initTracking (click delegado)', () => {
  it('dispara affiliate_click leyendo los data-track-* del CTA', () => {
    loadGA4();
    document.body.innerHTML = `
      <a href="#" data-track-event="affiliate_click"
         data-track-slug="notion-ai" data-track-src="ficha-hero"
         data-track-has-affiliate="1">Visitar</a>`;
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('affiliate_click');
    expect(last[2]).toEqual({ slug: 'notion-ai', src: 'ficha-hero', has_affiliate: '1' });
  });

  it('ignora clicks en elementos sin data-track-event', () => {
    loadGA4();
    document.body.innerHTML = `<a href="#">sin tracking</a>`;
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventNames()).toHaveLength(0);
  });

  it('es idempotente: dos initTracking → un solo evento por click', () => {
    loadGA4();
    document.body.innerHTML = `<a href="#" data-track-event="affiliate_click" data-track-slug="a">x</a>`;
    initTracking();
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventNames().filter((n) => n === 'affiliate_click')).toHaveLength(1);
  });
});

describe('fireViewEvents', () => {
  it('dispara el evento de [data-track-view] con sus params', () => {
    loadGA4();
    document.body.innerHTML = `<main data-track-view="view_ficha" data-track-slug="notion-ai" data-track-category="Asistentes"></main>`;
    fireViewEvents();
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('view_ficha');
    expect(last[2]).toEqual({ slug: 'notion-ai', category: 'Asistentes' });
  });
});
