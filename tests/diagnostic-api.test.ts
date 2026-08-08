import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { resetDiagnosticRateLimit } from '../api/diagnostic';

function validBody() {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    consent: true,
    company: '',
    businessType: 'Agencia de servicios',
    teamSize: '2_5',
    goal: 'sales',
    process: 'Seguimiento manual de todos los leads que llegan por la web',
    frequency: 'daily',
    currentTools: 'some',
    budget: '1500_3000',
    timeline: 'one_month',
    risk: 'standard',
    submissionId: 'submission_test_1234567890',
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
  process.env.NOTION_TOKEN = 'secret_notion_test';
  process.env.NOTION_DATA_SOURCE_ID = '95685369-3fb6-4ae2-afa0-d3ee057d9ed3';
  process.env.DIAGNOSTIC_SIGNING_SECRET = 'test-signing-secret-with-32-characters';
  fetchMock = vi.fn().mockImplementation(async (url: string) => (
    url.includes('/query')
      ? { ok: true, status: 200, json: async () => ({ results: [] }) }
      : { ok: true, status: 200 }
  ));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  delete process.env.NOTION_TOKEN;
  delete process.env.NOTION_DATA_SOURCE_ID;
  delete process.env.DIAGNOSTIC_SIGNING_SECRET;
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
    await handler(makeReq({ body: { ...validBody(), company: 'Bot Corp' } }), res);
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

    resetDiagnosticRateLimit();
    const longEmailRes = makeRes();
    const longEmail = `${'a'.repeat(190)}@example.com`;
    await handler(makeReq({ body: { ...validBody(), email: longEmail } }), longEmailRes);
    expect(longEmailRes.statusCode).toBe(422);
  });

  it('recalcula la cualificación en servidor y entrega un payload saneado', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { ...validBody(), qualificationBand: 'low' } }), res);
    expect(res.statusCode).toBe(200);
    const [, options] = fetchMock.mock.calls[1] as [string, { body: string; headers: Record<string, string> }];
    const payload = JSON.parse(options.body);
    expect(payload.properties['Resultado diagnóstico']).toEqual({ select: { name: 'Llamada cualificada' } });
    expect(payload.properties.Responsable).toEqual({ select: { name: 'Eli' } });
    expect(payload.properties['Submission ID'].rich_text[0].text.content).toBe(validBody().submissionId);
    expect(payload.properties.qualificationBand).toBeUndefined();
    expect(options.headers.Authorization).toBe('Bearer secret_notion_test');
    expect(res.payload).toMatchObject({
      success: true,
      result: { qualificationBand: 'high' },
      redirectUrl: expect.stringMatching(/^\/gracias-diagnostico\/\?.*&token=[^.]+\.[^.]+$/),
    });
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

  it('falla de forma explícita si no está configurado Notion', async () => {
    delete process.env.NOTION_TOKEN;
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
