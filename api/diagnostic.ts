import { notifyDiagnostic } from '../src/lib/diagnostic-email.js';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico.js';
import { diagnosticThanksUrl } from '../src/data/diagnostico-gracias.js';
import { signDiagnosticResult } from '../src/data/diagnostico-token.js';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 12_000;
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2026-03-11';
const buckets = new Map<string, { count: number; resetAt: number }>();
const inFlightDeliveries = new Map<string, { fingerprint: string; promise: Promise<boolean> }>();

const ALLOWED_ORIGINS = () =>
  (process.env.DIAGNOSTIC_ALLOWED_ORIGINS || 'https://agentesva.com,https://www.agentesva.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM = new Set(['solo', '2_5', '6_20', '21_plus']);
const GOAL = new Set(['customer_service', 'sales', 'operations', 'marketing', 'exploring']);
const FREQUENCY = new Set(['sporadic', 'monthly', 'weekly', 'daily', 'high_volume']);
const TOOLS = new Set(['none', 'some']);
const BUDGET = new Set(['exploring', 'under_300', '300_1500', '1500_3000', '3000_5000', 'more_5000']);
const TIMELINE = new Set(['now', 'one_month', 'three_months', 'later']);
const RISK = new Set(['standard', 'sensitive_data', 'high_impact_decisions', 'unsafe_request']);
const SUBMISSION_ID = /^[a-zA-Z0-9_-]{16,80}$/;

type Req = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown; socket?: { remoteAddress?: string } };
type Res = {
  setHeader: (key: string, value: string) => void;
  status: (code: number) => Res;
  json: (body: unknown) => Res;
  end: () => Res;
};

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function firstHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function clientKey(req: Req): string {
  const forwarded = firstHeader(req.headers?.['x-forwarded-for']);
  return forwarded.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function limited(key: string, now = Date.now()): { blocked: boolean; retryAfter: number } {
  // Limpieza acotada: evita que una instancia caliente acumule claves sin límite.
  if (buckets.size > 1_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false, retryAfter: 0 };
  }
  existing.count += 1;
  return {
    blocked: existing.count > MAX_REQUESTS,
    retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function richText(content: string) {
  return { rich_text: [{ text: { content: content.slice(0, 2_000) } }] };
}

function diagnosticProperties(
  contact: { email: string; name: string; organizationName?: string; role?: string; source?: Record<string, unknown> },
  answers: DiagnosticAnswers,
  result: ReturnType<typeof classifyDiagnostic>,
  submissionId: string,
  submittedAt: string,
) {
  const resultNames = {
    qualified_call: 'Llamada cualificada',
    paid_workshop: 'Taller de alcance',
    self_serve_resources: 'Recursos',
    manual_review: 'Revisión manual',
  } as const;
  const serviceNames = {
    customer_service: 'Atención al cliente',
    sales: 'Ventas',
    operations: 'Operaciones',
    general: 'Consultoría general',
  } as const;
  const classificationNames = {
    high: '🔥 Hot 70+',
    medium: '🟡 Warm 40-69',
    low: '🔵 Cool 20-39',
  } as const;
  const notes = [
    `Negocio: ${answers.businessType}`,
    `Equipo: ${answers.teamSize}`,
    `Objetivo: ${answers.goal}`,
    `Frecuencia: ${answers.frequency}`,
    `Herramientas: ${answers.currentTools}`,
    `Presupuesto: ${answers.budget}`,
    `Plazo: ${answers.timeline}`,
    `Riesgo: ${answers.risk}`,
    `Razones: ${result.reasons.join(' ')}`,
    'Consentimiento: aceptado',
    'Fuente del consentimiento: diagnostic_form',
    `Fecha del consentimiento: ${submittedAt}`,
    `Empresa: ${contact.organizationName || ""}`,
    `Cargo: ${contact.role || ""}`,
    `Atribución: ${JSON.stringify(contact.source || {})}`,
  ].join('\n');

  return {
    Lead: { title: [{ text: { content: contact.name } }] },
    Contacto: richText(contact.name),
    Email: { email: contact.email },
    'Submission ID': richText(submissionId),
    'Pain principal': richText(answers.process),
    'Resultado diagnóstico': { select: { name: resultNames[result.resultType] } },
    'Servicio recomendado': { select: { name: serviceNames[result.cluster] } },
    Clasificación: { select: { name: classificationNames[result.qualificationBand] } },
    'Primera acción': {
      select: { name: result.resultType === 'self_serve_resources' ? 'Email nurturing' : 'Email personalizado' },
    },
    Notas: richText(notes),
  };
}

function createProperties(
  contact: { email: string; name: string; organizationName?: string; role?: string; source?: Record<string, unknown> },
  answers: DiagnosticAnswers,
  result: ReturnType<typeof classifyDiagnostic>,
  submissionId: string,
  submittedAt: string,
) {
  return {
    ...diagnosticProperties(contact, answers, result, submissionId, submittedAt),
    Agencia: { select: { name: 'AgentesVA' } },
    Estado: { select: { name: 'Nuevo' } },
    'Fecha entrada': { date: { start: submittedAt } },
    Source: { select: { name: 'Diagnóstico quiz' } },
    Responsable: { select: { name: 'Eli' } },
  };
}

function retryDelay(response: Response, attempt: number, deadline: number): number | undefined {
  const remaining = Math.max(0, deadline - Date.now() - 50);
  if (response.status === 429) {
    const seconds = Number(response.headers?.get('Retry-After'));
    const requested = Number.isFinite(seconds) ? Math.max(0, seconds * 1_000) : 250;
    return requested <= remaining ? requested : undefined;
  }
  if (response.status >= 500) {
    const requested = 250 * (attempt + 1);
    return requested <= remaining ? requested : undefined;
  }
  return undefined;
}

async function notionFetch(url: string, init: RequestInit, deadline: number): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(url, init);
    if (response.ok) return response;
    const delay = retryDelay(response, attempt, deadline);
    if (delay === undefined || attempt === 1) return response;
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Unreachable Notion retry state');
}

async function findNotionPage(
  headers: Record<string, string>,
  dataSourceId: string,
  submissionId: string,
  signal: AbortSignal,
  deadline: number,
): Promise<{ ok: boolean; id?: string }> {
  const query = await notionFetch(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filter: { property: 'Submission ID', rich_text: { equals: submissionId } },
      page_size: 1,
    }),
    signal,
  }, deadline);
  if (!query.ok) {
    console.error('[diagnostic] Notion query failed', query.status);
    return { ok: false };
  }
  const queryBody = await query.json() as { results?: Array<{ id?: unknown }> };
  const id = typeof queryBody.results?.[0]?.id === 'string' ? queryBody.results[0].id : undefined;
  return { ok: true, id };
}

async function deliverToNotion(
  contact: { email: string; name: string; organizationName?: string; role?: string; source?: Record<string, unknown> },
  answers: DiagnosticAnswers,
  result: ReturnType<typeof classifyDiagnostic>,
  submissionId: string,
  submittedAt: string,
  signal: AbortSignal,
  deadline: number,
): Promise<boolean> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!token || !dataSourceId) return false;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
  const existing = await findNotionPage(headers, dataSourceId, submissionId, signal, deadline);
  if (!existing.ok) return false;
  const properties = existing.id
    ? diagnosticProperties(contact, answers, result, submissionId, submittedAt)
    : createProperties(contact, answers, result, submissionId, submittedAt);
  const writeUrl = existing.id ? `${NOTION_API}/pages/${existing.id}` : `${NOTION_API}/pages`;
  const writeInit = {
    method: existing.id ? 'PATCH' : 'POST',
    headers,
    body: JSON.stringify(existing.id
      ? { properties }
      : { parent: { type: 'data_source_id', data_source_id: dataSourceId }, properties }),
    signal,
  };
  const write = existing.id
    ? await notionFetch(writeUrl, writeInit, deadline)
    : await fetch(writeUrl, writeInit);
  if (write.ok) return true;

  if (!existing.id && (write.status === 429 || write.status >= 500)) {
    const reconciled = await findNotionPage(headers, dataSourceId, submissionId, signal, deadline);
    if (reconciled.ok && reconciled.id) return true;
  }
  console.error('[diagnostic] Notion write failed', write.status);
  return write.ok;
}

function deliverToNotionOnce(
  contact: { email: string; name: string; organizationName?: string; role?: string; source?: Record<string, unknown> },
  answers: DiagnosticAnswers,
  result: ReturnType<typeof classifyDiagnostic>,
  submissionId: string,
  submittedAt: string,
  signal: AbortSignal,
  deadline: number,
): Promise<'delivered' | 'failed' | 'conflict'> {
  const fingerprint = JSON.stringify({ contact, answers });
  const existing = inFlightDeliveries.get(submissionId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) return Promise.resolve('conflict');
    return existing.promise.then((ok) => ok ? 'delivered' : 'failed');
  }
  const delivery = deliverToNotion(contact, answers, result, submissionId, submittedAt, signal, deadline)
    .finally(() => inFlightDeliveries.delete(submissionId));
  inFlightDeliveries.set(submissionId, { fingerprint, promise: delivery });
  return delivery.then((ok) => ok ? 'delivered' : 'failed');
}

function parseBody(raw: unknown):
  | { ok: true; contact: { email: string; name: string; organizationName: string; role: string }; answers: DiagnosticAnswers; source: Record<string, unknown>; submissionId: string }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid payload' };
  if (JSON.stringify(raw).length > MAX_BODY_BYTES) return { ok: false, error: 'Payload too large' };

  const body = raw as Record<string, unknown>;
  const email = text(body.email, 254).toLowerCase();
  const name = text(body.name, 100);
  const businessType = text(body.businessType, 80);
  const process = text(body.process, 500);
  const organizationName = text(body.organizationName, 120);
  const role = text(body.role, 100);
  const submissionId = text(body.submissionId, 80);

  if (body.website || body.company) return { ok: false, error: 'Honeypot' };
  if (body.consent !== true) return { ok: false, error: 'Consent required' };
  if (!EMAIL.test(email) || email.length > 200) return { ok: false, error: 'Invalid email address' };
  if (name.length < 2) return { ok: false, error: 'Invalid name' };
  if (!SUBMISSION_ID.test(submissionId)) return { ok: false, error: 'Invalid submission id' };
  if (businessType.length < 3 || process.length < 12) return { ok: false, error: 'Incomplete answers' };
  if (!TEAM.has(String(body.teamSize)) || !GOAL.has(String(body.goal)) || !FREQUENCY.has(String(body.frequency))) {
    return { ok: false, error: 'Invalid answers' };
  }
  if (!TOOLS.has(String(body.currentTools)) || !BUDGET.has(String(body.budget)) || !TIMELINE.has(String(body.timeline)) || !RISK.has(String(body.risk))) {
    return { ok: false, error: 'Invalid answers' };
  }

  return {
    ok: true,
    contact: { email, name, organizationName, role },
    source: sanitizeSource(body.source),
    submissionId,
    answers: {
      businessType,
      process,
      teamSize: body.teamSize as DiagnosticAnswers['teamSize'],
      goal: body.goal as DiagnosticAnswers['goal'],
      frequency: body.frequency as DiagnosticAnswers['frequency'],
      currentTools: body.currentTools as DiagnosticAnswers['currentTools'],
      budget: body.budget as DiagnosticAnswers['budget'],
      timeline: body.timeline as DiagnosticAnswers['timeline'],
      risk: body.risk as DiagnosticAnswers['risk'],
    },
  };
}

function sanitizeSource(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const source = raw as Record<string, unknown>;
  const utmRaw = source.utm && typeof source.utm === 'object' && !Array.isArray(source.utm)
    ? source.utm as Record<string, unknown>
    : {};
  const utm = Object.fromEntries(
    Object.entries(utmRaw)
      .filter(([key]) => ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key))
      .map(([key, value]) => [key, text(value, 120)]),
  );
  return {
    form: 'diagnostic',
    landingPage: text(source.landingPage, 180),
    referrer: text(source.referrer, 300),
    ctaPlacement: text(source.ctaPlacement, 80),
    serviceIntent: text(source.serviceIntent, 100),
    utm,
  };
}

export function resetDiagnosticRateLimit(): void {
  buckets.clear();
  inFlightDeliveries.clear();
}

export default async function handler(req: Req, res: Res) {
  const origin = firstHeader(req.headers?.origin);
  const allowed = ALLOWED_ORIGINS();
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!allowed.includes(origin)) return res.status(403).json({ error: 'Forbidden' });

  const body = req.body as Record<string, unknown> | undefined;
  // Bots reciben éxito falso antes de consumir rate limit o tocar el CRM.
  if (body && [body.website, body.company].some((value) => typeof value === 'string' && value.trim())) {
    return res.status(200).json({ success: true });
  }

  const rate = limited(clientKey(req));
  if (rate.blocked) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATA_SOURCE_ID) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const parsed = parseBody(req.body);
  if ('error' in parsed) return res.status(422).json({ error: parsed.error });

  const result = classifyDiagnostic(parsed.answers);
  const submittedAt = new Date().toISOString();
  const deadline = Date.now() + 8_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const delivery = await deliverToNotionOnce(
      { ...parsed.contact, source: parsed.source },
      parsed.answers,
      result,
      parsed.submissionId,
      submittedAt,
      controller.signal,
      deadline,
    );

    if (delivery === 'conflict') {
      return res.status(409).json({ error: 'Submission id conflict' });
    }
    if (delivery === 'failed') {
      console.error('[diagnostic] Notion delivery failed');
      return res.status(502).json({ error: 'Lead delivery failed' });
    }

    const notification = await notifyDiagnostic({ contact: parsed.contact, answers: parsed.answers, result, submissionId: parsed.submissionId });
    if (notification === 'failed') {
      return res.status(502).json({ error: 'Notification delivery failed' });
    }

    const signingSecret = process.env.DIAGNOSTIC_SIGNING_SECRET || '';
    const token = signDiagnosticResult(result, signingSecret);
    return res.status(200).json({ success: true, result, redirectUrl: diagnosticThanksUrl(result, token) });
  } catch (error) {
    console.error('[diagnostic] delivery error', error instanceof Error ? error.name : 'unknown');
    return res.status(504).json({ error: 'Lead delivery timeout' });
  } finally {
    clearTimeout(timeout);
  }
}
