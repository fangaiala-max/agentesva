import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createSequence, setupAutomationDemo, setupDiagnosticBanner } from '../src/scripts/agency-home';
import { DEMO_MODES, DEMO_MODE_KEYS } from '../src/data/automation-demo';
let clean: (() => void) | undefined;
let reduced = false;
const observers: any[] = [];
beforeEach(() => {
  vi.useFakeTimers(); reduced = false;
  vi.stubGlobal('matchMedia', () => ({ get matches() { return reduced; }, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('IntersectionObserver', class { constructor(public callback: any) { observers.push(this); } observe() { this.callback([{ isIntersecting: true }]); } disconnect() {} });
  document.body.innerHTML = `<section data-demo-root><div id="demo-panel"></div>${DEMO_MODE_KEYS.map(mode => `<button id="mode-${mode}" data-demo-mode="${mode}"></button>`).join('')}<select data-demo-example></select><button data-demo-run></button><button data-demo-reset></button><ol data-demo-steps></ol><dl data-demo-fields></dl><a data-demo-service></a>${['status','title','description','input-label','input','reference','result-state','result','handoff'].map(key => `<p data-demo-${key}></p>`).join('')}</section>`;
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => { clean?.(); clean = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); observers.length = 0; document.body.innerHTML = ''; });
const root = () => document.querySelector<HTMLElement>('[data-demo-root]')!;
const click = (selector: string) => document.querySelector<HTMLButtonElement>(selector)!.click();
it.each(DEMO_MODE_KEYS.flatMap(mode => (['standard', 'exception'] as const).map(example => [mode, example] as const)))('runs %s/%s deterministically without external requests', (mode, example) => {
  clean = setupAutomationDemo(root()); click(`[data-demo-mode="${mode}"]`);
  const select = document.querySelector<HTMLSelectElement>('select')!; select.value = example; select.dispatchEvent(new Event('change'));
  click('[data-demo-run]'); expect(root().dataset.state).toBe('running'); vi.advanceTimersByTime(3000);
  expect(root().dataset.state).toBe('complete'); expect(document.querySelector('[data-demo-result]')!.textContent).toBe(DEMO_MODES[mode].examples[example].result);
  expect(document.querySelector('[data-demo-handoff]')!.textContent).toBe(DEMO_MODES[mode].examples[example].handoff);
  expect(fetch).not.toHaveBeenCalled();
  click('[data-demo-run]'); vi.advanceTimersByTime(3000); expect(root().dataset.state).toBe('complete');
  click('[data-demo-reset]'); expect(root().dataset.state).toBe('idle'); expect(vi.getTimerCount()).toBe(0);
});
it('cancels previous playback when switching modes and supports roving keyboard focus', () => {
  clean = setupAutomationDemo(root()); click('[data-demo-run]'); vi.advanceTimersByTime(800);
  document.querySelector('[data-demo-mode="attention"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  expect(root().dataset.mode).toBe('sales'); expect(document.activeElement?.id).toBe('mode-sales');
  expect(document.activeElement?.getAttribute('aria-selected')).toBe('true');
  vi.advanceTimersByTime(5000); expect(root().dataset.state).toBe('idle'); expect(vi.getTimerCount()).toBe(0);
});
it('finishes immediately for reduced motion and releases its clock on teardown', () => {
  reduced = true; clean = setupAutomationDemo(root()); click('[data-demo-run]'); expect(root().dataset.state).toBe('complete'); expect(vi.getTimerCount()).toBe(0);
  reduced = false; click('[data-demo-run]'); clean(); clean = undefined; expect(vi.getTimerCount()).toBe(0);
});
it('pauses an offscreen sequence and resumes on intersection', () => {
  const render = vi.fn(); const sequence = createSequence(root(), 4, render); clean = () => sequence.dispose(); sequence.start();
  observers[0].callback([{ isIntersecting: false }]); vi.advanceTimersByTime(5000); expect(render).toHaveBeenCalledTimes(1);
  observers[0].callback([{ isIntersecting: true }]); vi.advanceTimersByTime(3000); expect(render).toHaveBeenLastCalledWith(3, true);
});

it('shows the diagnostic banner only beyond the hero, hides near content, and persists dismissal', () => {
  const callbacks: Array<(entries: any[]) => void> = [];
  vi.stubGlobal('IntersectionObserver', class { constructor(callback: any) { callbacks.push(callback); } observe() {} disconnect() {} });
  sessionStorage.clear();
  document.body.innerHTML = '<main><section id="hero"></section><section class="diagnostic-close"></section></main><aside id="cta-bar"><button id="cta-dismiss">Cerrar</button></aside>';
  const banner = document.querySelector<HTMLElement>('#cta-bar')!;
  clean = setupDiagnosticBanner(document.querySelector('#hero')!, banner);
  expect(banner.hidden).toBe(true);
  callbacks[0]([{ isIntersecting: false, boundingClientRect: { bottom: -1 } }]);
  expect(banner.hidden).toBe(false);
  callbacks[1]([{ isIntersecting: true }]); expect(banner.hidden).toBe(true);
  callbacks[1]([{ isIntersecting: false }]); expect(banner.hidden).toBe(false);
  click('#cta-dismiss'); expect(banner.hidden).toBe(true); expect(sessionStorage.getItem('agentesva:cta-dismissed')).toBe('1');
  clean(); callbacks.length = 0; clean = setupDiagnosticBanner(document.querySelector('#hero')!, banner);
  callbacks[0]([{ isIntersecting: false, boundingClientRect: { bottom: -1 } }]); expect(banner.hidden).toBe(true);
});
