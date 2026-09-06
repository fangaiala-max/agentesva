import {setupDiagnosticBanner} from './diagnostic-banner';
export {setupDiagnosticBanner} from './diagnostic-banner';
import { DEMO_MODES, DEMO_MODE_KEYS, type DemoMode, type DemoExample } from '../data/automation-demo';

type Cleanup = () => void;
let activeCleanup: Cleanup = () => {};

// One pausable clock per sequence. No requests, credentials or external effects.
export function createSequence(host: HTMLElement, count: number, render: (step: number, finished: boolean) => void, delay = 750) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let step = 0;
  let playing = false;
  let visible = host.getBoundingClientRect().bottom > 0 && host.getBoundingClientRect().top < window.innerHeight;
  let disposed = false;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clear = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const schedule = () => {
    clear();
    if (!playing || !visible || document.hidden || disposed) return;
    timer = setTimeout(() => {
      timer = undefined;
      step++;
      playing = step < count;
      render(Math.min(step, count - 1), !playing);
      schedule();
    }, delay);
  };
  const finish = () => { clear(); playing = false; render(count - 1, true); };
  const onMedia = () => { if (media.matches && playing) finish(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
  observer.observe(host);
  document.addEventListener('visibilitychange', schedule);
  media.addEventListener('change', onMedia);
  return {
    start() { if (disposed) return; clear(); step = 0; playing = true; if (media.matches) finish(); else { render(0, false); schedule(); } },
    cancel() { clear(); playing = false; },
    dispose() { disposed = true; clear(); playing = false; observer.disconnect(); document.removeEventListener('visibilitychange', schedule); media.removeEventListener('change', onMedia); },
  };
}

export function setupAutomationDemo(root: HTMLElement): Cleanup {
  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-demo-mode]'));
  const select = $<HTMLSelectElement>('[data-demo-example]');
  const run = $<HTMLButtonElement>('[data-demo-run]');
  const reset = $<HTMLButtonElement>('[data-demo-reset]');
  const status = $('[data-demo-status]');
  const panel = $('#demo-panel');
  let mode: DemoMode = 'attention';
  let example: DemoExample = 'standard';
  const controller = new AbortController();
  const sample = () => DEMO_MODES[mode].examples[example];
  const text = (selector: string, content: string) => { $(selector).textContent = content; };
  const paintSteps = (current: number, finished: boolean) => {
    root.querySelectorAll<HTMLElement>('[data-demo-steps] li').forEach((item, i) => {
      item.dataset.stepState = finished ? (example === 'exception' && i === 3 ? 'review' : 'done') : i < current ? 'done' : i === current ? 'active' : 'waiting';
      const label = item.querySelector<HTMLElement>('[data-step-status]')!;
      label.textContent = finished && i === 3 ? sample().status : item.dataset.stepState === 'done' ? 'Completado' : item.dataset.stepState === 'active' ? 'En curso…' : 'En espera';
    });
  };
  const sequence = createSequence(root, 4, (step, finished) => {
    root.dataset.state = finished ? 'complete' : 'running';
    paintSteps(step, finished);
    run.disabled = !finished;
    run.textContent = finished ? 'Repetir demo ↻' : 'Ejecutando…';
    text('[data-demo-result-state]', finished ? sample().status : `Paso ${step + 1} de 4`);
    text('[data-demo-result]', finished ? sample().result : 'El ejemplo está recorriendo el flujo. El resultado aparecerá aquí.');
    status.textContent = finished ? `Demo finalizada. ${sample().status}. ${sample().handoff}` : `Paso ${step + 1} de 4: ${DEMO_MODES[mode].steps[step]}.`;
  });
  const render = () => {
    const content = DEMO_MODES[mode];
    const data = sample();
    root.dataset.mode = mode;
    root.dataset.state = 'idle';
    panel.setAttribute('aria-labelledby', `mode-${mode}`);
    tabs.forEach(tab => { const selected = tab.dataset.demoMode === mode; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    select.replaceChildren(...(['standard', 'exception'] as const).map(key => { const option = document.createElement('option'); option.value = key; option.textContent = content.examples[key].label; return option; }));
    select.value = example;
    text('[data-demo-title]', content.title); text('[data-demo-description]', content.description);
    text('[data-demo-input-label]', data.inputLabel); text('[data-demo-input]', data.input); text('[data-demo-reference]', data.reference);
    const list = $('[data-demo-steps]');
    list.replaceChildren(...content.steps.map((name, i) => {
      const li = document.createElement('li'); li.dataset.stepState = 'waiting';
      const node = document.createElement('span'); node.className = 'step-node'; node.textContent = String(i + 1).padStart(2, '0');
      const div = document.createElement('div'); const strong = document.createElement('strong'); strong.textContent = name;
      const small = document.createElement('small'); small.dataset.stepStatus = ''; small.textContent = 'En espera'; div.append(strong, small); li.append(node, div); return li;
    }));
    $('[data-demo-fields]').replaceChildren(...data.fields.map(([key, value]) => { const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = key; dd.textContent = value; row.append(dt, dd); return row; }));
    text('[data-demo-result-state]', 'Listo para ejecutar'); text('[data-demo-result]', 'Ejecuta el ejemplo para ver el resultado y el siguiente paso.'); text('[data-demo-handoff]', data.handoff);
    const link = $<HTMLAnchorElement>('[data-demo-service]'); link.href = content.href; link.dataset.trackService = content.service; link.dataset.trackCluster = content.cluster;
    run.disabled = false; run.textContent = 'Ejecutar demo ↗';
    status.textContent = `Ejemplo preparado: ${data.label}. Pulsa Ejecutar demo.`;
  };
  const setMode = (next: DemoMode) => { sequence.cancel(); mode = next; example = 'standard'; render(); };
  tabs.forEach((tab, index) => {
    tab.disabled = false;
    tab.addEventListener('click', () => setMode(tab.dataset.demoMode as DemoMode), { signal: controller.signal });
    tab.addEventListener('keydown', event => {
      let next: number;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); setMode(DEMO_MODE_KEYS[next]); tabs[next].focus();
    }, { signal: controller.signal });
  });
  select.disabled = false; reset.disabled = false;
  select.addEventListener('change', () => { sequence.cancel(); example = select.value === 'exception' ? 'exception' : 'standard'; render(); }, { signal: controller.signal });
  run.addEventListener('click', () => { if (!run.disabled) sequence.start(); }, { signal: controller.signal });
  reset.addEventListener('click', () => { sequence.cancel(); render(); }, { signal: controller.signal });
  render();
  return () => { controller.abort(); sequence.dispose(); };
}

function setupPreview(root: HTMLElement): Cleanup {
  const replay = root.querySelector<HTMLButtonElement>('[data-preview-replay]')!;
  const phases = ['Mensaje recibido.', 'Solicitud clasificada.', 'Ficha del CRM actualizada.', 'Revisión humana pendiente.'];
  const status = root.querySelector<HTMLElement>('[data-preview-status]')!;
  const sequence = createSequence(root, 4, (step, finished) => {
    root.dataset.phase = String(step);
    root.querySelector<HTMLElement>('[data-preview-classification]')!.textContent = step >= 1 ? 'Estado de pedido' : 'Por clasificar';
    root.querySelector<HTMLElement>('[data-preview-record]')!.textContent = step >= 2 ? 'Actualizado' : 'Esperando mensaje';
    status.textContent = finished ? 'Ejemplo final: mensaje clasificado, CRM actualizado y revisión humana pendiente.' : phases[step];
    replay.disabled = !finished;
  }, 650);
  let played = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !played) { played = true; sequence.start(); }
  });
  observer.observe(root);
  replay.disabled = false;
  const replayClick = () => sequence.start();
  replay.addEventListener('click', replayClick);
  return () => { sequence.dispose(); observer.disconnect(); replay.removeEventListener('click', replayClick); };
}

function setupGrid(root: HTMLElement): Cleanup {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0; let x = 50; let y = 50;
  const clear = () => { cancelAnimationFrame(frame); frame = 0; root.style.removeProperty('--grid-x'); root.style.removeProperty('--grid-y'); };
  const move = (event: PointerEvent) => {
    if (media.matches || !fine.matches || event.pointerType === 'touch') return;
    const rect = root.getBoundingClientRect(); x = (event.clientX - rect.left) / rect.width * 100; y = (event.clientY - rect.top) / rect.height * 100;
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; root.style.setProperty('--grid-x', `${x}%`); root.style.setProperty('--grid-y', `${y}%`); });
  };
  root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', clear);
  media.addEventListener('change', clear); fine.addEventListener('change', clear);
  return () => { clear(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', clear); media.removeEventListener('change', clear); fine.removeEventListener('change', clear); };
}

function setupIntegrations(root: HTMLElement): Cleanup {
  const button = root.querySelector<HTMLButtonElement>('[data-integrations-pause]')!;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false; let visible = false;
  const sync = () => {
    const staticMode = media.matches || !fine.matches;
    root.dataset.paused = String(paused || !visible || document.hidden || staticMode);
    button.disabled = staticMode; button.setAttribute('aria-pressed', String(paused));
    button.textContent = staticMode ? 'Vista estática' : paused ? 'Reanudar movimiento' : 'Pausar movimiento';
  };
  const click = () => { paused = !paused; sync(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(root); button.addEventListener('click', click); document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync); fine.addEventListener('change', sync); sync();
  return () => { observer.disconnect(); button.removeEventListener('click', click); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); fine.removeEventListener('change', sync); root.dataset.paused = 'true'; };
}


export function teardownAgencyHome() { activeCleanup(); activeCleanup = () => {}; }
export function initAgencyHome() {
  teardownAgencyHome();
  const home = document.querySelector('.agency-home'); if (!home) return;
  const cleanups: Cleanup[] = [];
  const demo = home.querySelector<HTMLElement>('[data-demo-root]'); if (demo) cleanups.push(setupAutomationDemo(demo));
  const preview = home.querySelector<HTMLElement>('[data-system-preview]'); if (preview) { cleanups.push(setupPreview(preview)); cleanups.push(setupGrid(preview)); }
  const integrations = home.querySelector<HTMLElement>('[data-integrations]'); if (integrations) cleanups.push(setupIntegrations(integrations));
  const hero = home.querySelector<HTMLElement>('#hero'); const banner = document.getElementById('cta-bar');
  if (hero && banner) cleanups.push(setupDiagnosticBanner(hero, banner));
  activeCleanup = () => cleanups.reverse().forEach(cleanup => cleanup());
}
