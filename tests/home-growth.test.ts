import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAutomationDemo as setupEs } from '../src/scripts/agency-home';
import { setupAutomationDemo as setupEn } from '../src/scripts/agency-home-en';
import { DEMO_MODES, DEMO_MODE_KEYS } from '../src/data/automation-demo';
import { initTracking, trackGrowthEvent } from '../src/scripts/track';
import { denyConsent, grantConsent } from '../src/scripts/consent';

let cleanup: (() => void) | undefined;
let reduced = false;
const mediaListeners: Array<() => void> = [];
const events = () => ((window as any).dataLayer ?? []).map((entry: ArrayLike<unknown>) => Array.from(entry)).filter((entry: unknown[]) => entry[0] === 'event');
const root = () => document.querySelector<HTMLElement>('[data-demo-root]')!;
const click = (selector: string) => document.querySelector<HTMLButtonElement>(selector)!.click();
beforeEach(() => {
  vi.useFakeTimers(); reduced = false; mediaListeners.length = 0; localStorage.clear();
  document.head.querySelectorAll('[data-ga4]').forEach(node => node.remove());
  (window as any).dataLayer = [];
  grantConsent('G-TEST');
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener(_: string, listener: () => void) { mediaListeners.push(listener); }, removeEventListener() {} }));
  vi.stubGlobal('IntersectionObserver', class { constructor(public callback: any) {} observe() { this.callback([{ isIntersecting: true }]); } disconnect() {} });
});
afterEach(() => { cleanup?.(); cleanup = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); document.body.innerHTML = ''; localStorage.clear(); });
function fixture(locale: string) {
  document.documentElement.lang = locale;
  const path = locale === 'en' ? '/assessment/' : '/diagnostico-automatizacion-ia/';
  document.body.innerHTML = `<section data-demo-root data-state="complete"><div id="demo-panel"></div>${DEMO_MODE_KEYS.map(mode => `<button data-demo-mode="${mode}"></button>`).join('')}<select data-demo-example></select><button data-demo-run></button><button data-demo-reset></button><ol data-demo-steps></ol><dl data-demo-fields></dl><a data-demo-service></a><a data-demo-assessment data-track-event="service_cta_click" data-track-page-type="home" data-track-placement="demo_assessment" href="${path}?placement=demo_assessment&service=customer_service_automation&utm_source=example#start"></a>${['status','title','description','input-label','input','reference','result-state','result','handoff'].map(key => `<p data-demo-${key}></p>`).join('')}</section>`;
}
describe.each([['en', setupEn], ['es', setupEs]] as const)('%s demo growth', (locale, setup) => {
  it.each(DEMO_MODE_KEYS.flatMap(mode => (['standard', 'exception'] as const).map(example => [mode, example] as const)))('measures real %s/%s runs and replays', (mode, example) => {
    fixture(locale); cleanup = setup(root()); expect(events()).toHaveLength(0);
    click(`[data-demo-mode="${mode}"]`);
    const select = document.querySelector('select')!; select.value = example; select.dispatchEvent(new Event('change'));
    click('[data-demo-run]');
    const params = { page_type: 'home', placement: 'demo', cluster: DEMO_MODES[mode].cluster, service: DEMO_MODES[mode].service, demo_case: example };
    expect(events()).toEqual([['event', 'demo_started', params]]);
    vi.advanceTimersByTime(3000);
    expect(events()).toEqual([['event', 'demo_started', params], ['event', 'demo_completed', params]]);
    click('[data-demo-run]'); vi.advanceTimersByTime(3000);
    expect(events().map((event: unknown[]) => event[1])).toEqual(['demo_started','demo_completed','demo_started','demo_completed']);
  });
  it('preserves assessment path/query and updates mode attribution without answers', () => {
    fixture(locale); cleanup = setup(root()); click('[data-demo-mode="sales"]');
    const link = document.querySelector<HTMLAnchorElement>('[data-demo-assessment]')!;
    const url = new URL(link.href);
    expect(url.pathname).toBe(locale === 'en' ? '/assessment/' : '/diagnostico-automatizacion-ia/');
    expect(Object.fromEntries(url.searchParams)).toEqual({ placement: 'demo_assessment', service: 'sales_automation', utm_source: 'example' });
    expect(url.hash).toBe('#start');
    expect(link.dataset.trackService).toBe('sales_automation'); expect(link.dataset.trackCluster).toBe('sales');
    link.addEventListener('click', event => event.preventDefault()); initTracking();
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(events()).toEqual([['event', 'service_cta_click', { page_type: 'home', placement: 'demo_assessment', service: 'sales_automation', cluster: 'sales' }]]);
  });
  it.each(['reset', 'mode', 'example', 'teardown'])('never completes a run cancelled by %s', action => {
    fixture(locale); cleanup = setup(root()); click('[data-demo-run]'); vi.advanceTimersByTime(800);
    if (action === 'reset') click('[data-demo-reset]');
    if (action === 'mode') click('[data-demo-mode="sales"]');
    if (action === 'example') document.querySelector('select')!.dispatchEvent(new Event('change'));
    if (action === 'teardown') { cleanup(); cleanup = undefined; }
    vi.advanceTimersByTime(5000);
    expect(events().map((event: unknown[]) => event[1])).toEqual(['demo_started']);
  });
  it('completes exactly once when reduced motion is enabled initially or mid-run', () => {
    fixture(locale); reduced = true; cleanup = setup(root()); click('[data-demo-run]'); vi.advanceTimersByTime(5000);
    expect(events().map((event: unknown[]) => event[1])).toEqual(['demo_started','demo_completed']);
    reduced = false; click('[data-demo-run]'); reduced = true; mediaListeners.forEach(listener => listener()); mediaListeners.forEach(listener => listener()); vi.advanceTimersByTime(5000);
    expect(events().map((event: unknown[]) => event[1])).toEqual(['demo_started','demo_completed','demo_started','demo_completed']);
  });
});
it('allows only closed demo and recommendation categories, strips PII, and requires attribution', () => {
  const valid = { page_type: 'home', placement: 'demo', cluster: 'sales', service: 'sales_automation', demo_case: 'standard' };
  for (const event of ['demo_started','demo_completed'] as const) {
    expect(trackGrowthEvent(event, { ...valid, email: 'ada@example.com', process: 'free text', url: 'https://example.com/?email=ada' })).toBe(true);
    expect(events().at(-1)[2]).toEqual(valid);
    for (const key of Object.keys(valid)) expect(trackGrowthEvent(event, { ...valid, [key]: undefined })).toBe(false);
    expect(trackGrowthEvent(event, { ...valid, demo_case: 'arbitrary' })).toBe(false);
  }
  for (const result_type of ['qualified_call','paid_workshop','self_serve_resources','manual_review']) expect(trackGrowthEvent('diagnostic_recommendation_viewed', { result_type, name: 'Ada' })).toBe(true);
  expect(events().at(-1)[2]).toEqual({ result_type: 'manual_review' });
  expect(trackGrowthEvent('diagnostic_recommendation_viewed', { result_type: 'Ada' })).toBe(false);
});
it('does not queue growth events with absent, denied or revoked analytics consent', () => {
  const valid = { page_type: 'home', placement: 'demo', cluster: 'sales', service: 'sales_automation', demo_case: 'standard' };
  document.head.querySelector('[data-ga4]')!.remove();
  expect(trackGrowthEvent('service_cta_click', { page_type: 'home', placement: 'demo_assessment' })).toBe(false);
  grantConsent('G-TEST'); denyConsent();
  expect(document.head.querySelector('[data-ga4]')).not.toBeNull();
  expect(trackGrowthEvent('service_cta_click', { page_type: 'home', placement: 'demo_assessment' })).toBe(false);
  expect(trackGrowthEvent('demo_started', valid)).toBe(false);
  expect(trackGrowthEvent('demo_completed', valid)).toBe(false);
  expect(trackGrowthEvent('diagnostic_recommendation_viewed', { result_type: 'qualified_call' })).toBe(false);
  expect(events()).toHaveLength(0);
});
