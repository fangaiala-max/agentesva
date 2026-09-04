import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { resetDiagnosticRateLimit } from '../api/diagnostic';

function validBody() {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    consent: true,
    website: '',
    organizationName: 'Analytical Engines SL',
    role: 'Fundadora',
    source: { landingPage: '/servicios/automatizacion-ventas/', ctaPlacement: 'hero', utm: { utm_source: 'linkedin', unsafe: 'drop' } },
    businessType: 'Agencia de servicios',
    teamSize: '2_5',
    goal: 'sales',
    process: 'Seguimiento manual de todos los leads que llegan por la web',
    frequency: 'daily',
    currentTools: 'some',
    budget: '1500_3000',
    timeline: 'one_month',
    risk: 'standard',
  };
}

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    headers: { origin: 'https://agentesva.com', 'x-forwarded-for': '203.0.113.10' },
    body: validBody(),
    ...overrides,
  };
}

function makeRes() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    ended: false,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.payload = payload; return this; },
    end() { this.ended = true; return this; },
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetDiagnosticRateLimit();
  process.env.DIAGNOSTIC_WEBHOOK_URL = 'https://hooks.example.test/diagnostic';
  delete process.env.DIAGNOSTIC_WEBHOOK_SECRET;
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  delete process.env.DIAGNOSTIC_WEBHOOK_URL;
  delete process.env.DIAGNOSTIC_WEBHOOK_SECRET;
  delete process.env.DIAGNOSTIC_ALLOWED_ORIGINS;
  vi.unstubAllGlobals();
});

describe('diagnostic API', () => {
  it('rechaza métodos y orígenes no permitidos', async () => {
    const methodRes = makeRes();
    await handler(makeReq({ method: 'GET' }), methodRes);
    expect(methodRes.statusCode).toBe(405);

    const originRes = makeRes();
    await handler(makeReq({ headers: { origin: 'https://evil.example' } }), originRes);
    expect(originRes.statusCode).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('devuelve éxito falso al honeypot sin entregar el lead', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { ...validBody(), website: 'https://bot.example' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual({ success: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('exige consentimiento y un email válido', async () => {
    const consentRes = makeRes();
    await handler(makeReq({ body: { ...validBody(), consent: false } }), consentRes);
    expect(consentRes.statusCode).toBe(422);

    resetDiagnosticRateLimit();
    const emailRes = makeRes();
    await handler(makeReq({ body: { ...validBody(), email: 'no-email' } }), emailRes);
    expect(emailRes.statusCode).toBe(422);
  });

  it('recalcula la cualificación en servidor y entrega un payload saneado', async () => {
    process.env.DIAGNOSTIC_WEBHOOK_SECRET = 'secret-test';
    const res = makeRes();
    await handler(makeReq({ body: { ...validBody(), qualificationBand: 'low' } }), res);
    expect(res.statusCode).toBe(200);
    const [, options] = fetchMock.mock.calls[0] as [string, { body: string; headers: Record<string, string> }];
    const payload = JSON.parse(options.body);
    expect(payload.result.qualificationBand).toBe('high');
    expect(payload.result.resultType).toBe('qualified_call');
    expect(payload.contact.organizationName).toBe('Analytical Engines SL');
    expect(payload.contact.role).toBe('Fundadora');
    expect(payload.source).toMatchObject({ landingPage: '/servicios/automatizacion-ventas/', ctaPlacement: 'hero', utm: { utm_source: 'linkedin' } });
    expect(payload.source.utm.unsafe).toBeUndefined();
    expect(payload.routing).toMatchObject({ queue: 'priority_bdr', priority: 'P1', recommendedNextStep: 'qualified_call' });
    expect(payload.qualificationBand).toBeUndefined();
    expect(options.headers.Authorization).toBe('Bearer secret-test');
    expect(res.payload).toMatchObject({ success: true, result: { qualificationBand: 'high' } });
  });

  it('limita a cinco solicitudes por IP y envía Retry-After', async () => {
    for (let i = 0; i < 5; i += 1) {
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res.statusCode).toBe(200);
    }
    const blocked = makeRes();
    await handler(makeReq(), blocked);
    expect(blocked.statusCode).toBe(429);
    expect(Number(blocked.headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('no filtra el error del proveedor y responde 502', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(502);
    expect(res.payload).toEqual({ error: 'Lead delivery failed' });
  });

  it('falla de forma explícita si no está configurado el webhook', async () => {
    delete process.env.DIAGNOSTIC_WEBHOOK_URL;
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
