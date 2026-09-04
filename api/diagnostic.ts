import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico.js';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 12_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

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

function parseBody(raw: unknown):
  | { ok: true; contact: { email: string; name: string; organizationName: string; role: string }; answers: DiagnosticAnswers; source: Record<string, unknown> }
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

  if (body.website) return { ok: false, error: 'Honeypot' };
  if (body.consent !== true) return { ok: false, error: 'Consent required' };
  if (!EMAIL.test(email) || email.length > 254) return { ok: false, error: 'Invalid email address' };
  if (name.length < 2) return { ok: false, error: 'Invalid name' };
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
  if (body && typeof body.website === 'string' && body.website.trim()) {
    return res.status(200).json({ success: true });
  }

  const rate = limited(clientKey(req));
  if (rate.blocked) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const webhook = process.env.DIAGNOSTIC_WEBHOOK_URL;
  if (!webhook) return res.status(500).json({ error: 'Server misconfiguration' });

  const parsed = parseBody(req.body);
  if ('error' in parsed) return res.status(422).json({ error: parsed.error });

  const result = classifyDiagnostic(parsed.answers);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(process.env.DIAGNOSTIC_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.DIAGNOSTIC_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({
        event: 'diagnostic_lead',
        submittedAt: new Date().toISOString(),
        source: parsed.source,
        contact: parsed.contact,
        answers: parsed.answers,
        result,
        routing: {
          queue: result.resultType === 'manual_review' ? 'human_review' : result.qualificationBand === 'high' ? 'priority_bdr' : 'standard_review',
          priority: result.resultType === 'manual_review' ? 'manual-risk' : result.qualificationBand === 'high' ? 'P1' : result.qualificationBand === 'medium' ? 'P2' : 'P3',
          recommendedNextStep: result.resultType,
          slaHours: 8,
        },
        consent: { accepted: true, source: 'diagnostic_form' },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      console.error('[diagnostic] delivery failed', upstream.status);
      return res.status(502).json({ error: 'Lead delivery failed' });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('[diagnostic] delivery error', error instanceof Error ? error.name : 'unknown');
    return res.status(504).json({ error: 'Lead delivery timeout' });
  } finally {
    clearTimeout(timeout);
  }
}
