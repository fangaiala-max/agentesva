// Eventos GA4 respetando el consentimiento. CSP-safe (módulo 'self'; no scripts inline,
// no dependencias nuevas). Reutiliza el patrón dataLayer de consent.ts: sólo emite si
// GA4 está cargado (= consentimiento analítico concedido); si no, no-op silencioso.
import { isGA4Loaded } from './consent';

export const GROWTH_EVENTS = [
  'service_cta_click',
  'diagnostic_started',
  'diagnostic_step_completed',
  'diagnostic_completed',
  'lead_qualified',
  'booking_started',
  'booking_completed',
] as const;

export type GrowthEvent = (typeof GROWTH_EVENTS)[number];
export type GrowthParams = Record<string, string | number | boolean | undefined>;

const GROWTH_EVENT_SET = new Set<string>(GROWTH_EVENTS);

// Contrato runtime gemelo de docs/analytics-events.md. La allowlist impide que
// un data-track-email/phone o una respuesta libre termine por accidente en GA4.
const COMMON_GROWTH_PARAMS = ['page_type', 'content_slug', 'cluster', 'service', 'placement'] as const;
const EVENT_PARAMS: Record<GrowthEvent, { required: readonly string[]; allowed: readonly string[] }> = {
  service_cta_click: {
    required: ['page_type', 'placement'],
    allowed: COMMON_GROWTH_PARAMS,
  },
  diagnostic_started: {
    required: ['page_type', 'placement'],
    allowed: COMMON_GROWTH_PARAMS,
  },
  diagnostic_step_completed: {
    required: ['step', 'step_id'],
    allowed: ['step', 'step_id', 'cluster', 'service'],
  },
  diagnostic_completed: {
    required: ['result_type'],
    allowed: ['result_type', 'qualification_band', 'cluster', 'service'],
  },
  lead_qualified: {
    required: ['qualification_band', 'result_type'],
    allowed: ['qualification_band', 'result_type', 'cluster', 'service'],
  },
  booking_started: {
    required: ['booking_provider', 'placement'],
    allowed: ['booking_provider', 'placement', 'cluster', 'service', 'qualification_band'],
  },
  booking_completed: {
    required: ['booking_provider'],
    allowed: ['booking_provider', 'cluster', 'service'],
  },
};

const ENUMS: Partial<Record<string, ReadonlySet<string>>> = {
  cluster: new Set(['customer_service', 'sales', 'operations', 'general']),
  service: new Set([
    'customer_service_automation',
    'sales_automation',
    'process_automation',
    'general_consulting',
  ]),
  qualification_band: new Set(['low', 'medium', 'high']),
  booking_provider: new Set(['calendly', 'cal', 'external']),
};

const SAFE_VALUE = /^[\p{L}\p{N}_./-]{1,100}$/u;

function dataLayer(): unknown[] {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

export function track(event: string, params: Record<string, unknown> = {}): boolean {
  if (!isGA4Loaded()) return false;
  dataLayer().push(['event', event, params]);
  return true;
}

export function isGrowthEvent(event: string): event is GrowthEvent {
  return GROWTH_EVENT_SET.has(event);
}

/**
 * Valida y emite un evento del funnel. Devuelve false si falta una propiedad,
 * hay un valor fuera del vocabulario o GA4 no está cargado por consentimiento.
 */
export function trackGrowthEvent(event: GrowthEvent, params: GrowthParams): boolean {
  const contract = EVENT_PARAMS[event];
  const clean: Record<string, string | number | boolean> = {};

  for (const key of contract.allowed) {
    const value = params[key];
    if (value === undefined || value === '') continue;

    if (key === 'step') {
      const step = typeof value === 'number' ? value : Number(value);
      if (!Number.isInteger(step) || step < 1 || step > 20) return false;
      clean[key] = step;
      continue;
    }

    if (typeof value === 'boolean' || typeof value === 'number') {
      clean[key] = value;
      continue;
    }

    const enumValues = ENUMS[key];
    if (enumValues && !enumValues.has(value)) return false;
    if (!SAFE_VALUE.test(value)) return false;
    clean[key] = value;
  }

  if (contract.required.some((key) => clean[key] === undefined)) return false;
  return track(event, clean);
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
      if (!event) return;
      const params = paramsFrom(el);
      if (isGrowthEvent(event)) trackGrowthEvent(event, params as GrowthParams);
      else track(event, params);
    },
    { capture: true },
  );
}

// Dispara eventos de vista ([data-track-view]) una vez por carga de página.
export function fireViewEvents(): void {
  document.querySelectorAll('[data-track-view]').forEach((el) => {
    const event = el.getAttribute('data-track-view');
    if (!event) return;
    const params = paramsFrom(el);
    if (isGrowthEvent(event)) trackGrowthEvent(event, params as GrowthParams);
    else track(event, params);
  });
}
