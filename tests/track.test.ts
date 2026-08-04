import { describe, it, expect, beforeEach } from 'vitest';
import {
  track,
  trackGrowthEvent,
  isGrowthEvent,
  initTracking,
  fireViewEvents,
} from '../src/scripts/track';

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

describe('trackGrowthEvent', () => {
  it('reconoce únicamente los eventos comerciales del contrato', () => {
    expect(isGrowthEvent('service_cta_click')).toBe(true);
    expect(isGrowthEvent('newsletter_submit')).toBe(false);
  });

  it('respeta el consentimiento aunque el payload sea válido', () => {
    const sent = trackGrowthEvent('service_cta_click', {
      page_type: 'tool_detail',
      placement: 'tool_detail_midpage',
    });
    expect(sent).toBe(false);
    expect(eventNames()).not.toContain('service_cta_click');
  });

  it('emite solo propiedades permitidas y descarta PII', () => {
    loadGA4();
    const sent = trackGrowthEvent('service_cta_click', {
      page_type: 'tool_detail',
      content_slug: 'claude',
      cluster: 'operations',
      service: 'process_automation',
      placement: 'tool_detail_midpage',
      email: 'persona@example.com',
    });
    expect(sent).toBe(true);
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('service_cta_click');
    expect(last[2]).toEqual({
      page_type: 'tool_detail',
      content_slug: 'claude',
      cluster: 'operations',
      service: 'process_automation',
      placement: 'tool_detail_midpage',
    });
  });

  it('rechaza eventos incompletos o valores fuera del vocabulario', () => {
    loadGA4();
    expect(trackGrowthEvent('service_cta_click', { page_type: 'home' })).toBe(false);
    expect(
      trackGrowthEvent('diagnostic_completed', {
        result_type: 'qualified_call',
        qualification_band: 'vip',
      }),
    ).toBe(false);
    expect(eventNames()).toHaveLength(0);
  });

  it('normaliza el número de paso procedente de data attributes', () => {
    loadGA4();
    const sent = trackGrowthEvent('diagnostic_step_completed', {
      step: '3',
      step_id: 'business_goal',
      cluster: 'sales',
    });
    expect(sent).toBe(true);
    const last = events().at(-1) as unknown[];
    expect(last[2]).toEqual({ step: 3, step_id: 'business_goal', cluster: 'sales' });
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

  it('instrumenta un CTA comercial declarativo con el contrato seguro', () => {
    loadGA4();
    document.body.innerHTML = `
      <a href="/diagnostico-automatizacion-ia/"
         data-track-event="service_cta_click"
         data-track-page-type="tool_detail"
         data-track-content-slug="claude"
         data-track-cluster="operations"
         data-track-service="process_automation"
         data-track-placement="tool_detail_midpage"
         data-track-email="no-debe-salir@example.com">Analizamos tu caso</a>`;
    initTracking();
    (document.querySelector('a') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const last = events().at(-1) as unknown[];
    expect(last[1]).toBe('service_cta_click');
    expect(last[2]).not.toHaveProperty('email');
    expect(last[2]).toHaveProperty('placement', 'tool_detail_midpage');
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
