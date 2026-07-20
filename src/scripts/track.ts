// Eventos GA4 respetando el consentimiento. CSP-safe (módulo 'self'; no scripts inline,
// no dependencias nuevas). Reutiliza el patrón dataLayer de consent.ts: sólo emite si
// GA4 está cargado (= consentimiento analítico concedido); si no, no-op silencioso.
import { isGA4Loaded } from './consent';

function dataLayer(): unknown[] {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (!isGA4Loaded()) return;
  dataLayer().push(['event', event, params]);
}

// Recoge data-track-* (excepto -event y -view) en params; guiones → guiones_bajos
// para que las claves sean válidas como parámetros GA4 (snake_case).
function paramsFrom(el: Element): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const attr of Array.from(el.attributes)) {
    const n = attr.name;
    if (n.startsWith('data-track-') && n !== 'data-track-event' && n !== 'data-track-view') {
      params[n.slice('data-track-'.length).replace(/-/g, '_')] = attr.value;
    }
  }
  return params;
}

// Un único listener delegado (idempotente pese a View Transitions) para clicks en
// [data-track-event]. Captura para disparar antes de que empiece la navegación.
export function initTracking(): void {
  const w = window as unknown as { __trackingWired?: boolean };
  if (w.__trackingWired) return;
  w.__trackingWired = true;
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest?.('[data-track-event]');
      if (!el) return;
      const event = el.getAttribute('data-track-event');
      if (event) track(event, paramsFrom(el));
    },
    { capture: true },
  );
}

// Dispara eventos de vista ([data-track-view]) una vez por carga de página.
export function fireViewEvents(): void {
  document.querySelectorAll('[data-track-view]').forEach((el) => {
    const event = el.getAttribute('data-track-view');
    if (event) track(event, paramsFrom(el));
  });
}
