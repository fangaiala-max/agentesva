import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { resetDiagnosticRateLimit } from '../api/diagnostic';

function body() {
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

function request(bodyOverrides: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    headers: { origin: 'https://agentesva.com', 'x-forwarded-for': '203.0.113.20' },
    body: { ...body(), ...bodyOverrides },
  };
}

function response() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.payload = payload; return this; },
    end() { return this; },
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetDiagnosticRateLimit();
  process.env.NOTION_TOKEN = 'secret_notion_test';
  process.env.NOTION_DATA_SOURCE_ID = '95685369-3fb6-4ae2-afa0-d3ee057d9ed3';
  process.env.DIAGNOSTIC_SIGNING_SECRET = 'test-signing-secret-with-32-characters';
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  delete process.env.NOTION_TOKEN;
  delete process.env.NOTION_DATA_SOURCE_ID;
  delete process.env.DIAGNOSTIC_SIGNING_SECRET;
  vi.unstubAllGlobals();
});

describe('diagnostic delivery to Notion', () => {
  it('creates a lead when the submission id does not exist', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const res = response();
    await handler(request(), res);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/data_sources/95685369-3fb6-4ae2-afa0-d3ee057d9ed3/query');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.notion.com/v1/pages');

    const query = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(query.filter).toMatchObject({
      property: 'Submission ID',
      rich_text: { equals: body().submissionId },
    });

    const create = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(create.parent).toEqual({ type: 'data_source_id', data_source_id: process.env.NOTION_DATA_SOURCE_ID });
    expect(create.properties).toMatchObject({
      Agencia: { select: { name: 'AgentesVA' } },
      Email: { email: 'ada@example.com' },
      Estado: { select: { name: 'Nuevo' } },
      Source: { select: { name: 'Diagnóstico quiz' } },
      Responsable: { select: { name: 'Fernando' } },
      'Submission ID': { rich_text: [{ text: { content: body().submissionId } }] },
      'Resultado diagnóstico': { select: { name: 'Llamada cualificada' } },
      'Servicio recomendado': { select: { name: 'Ventas' } },
      Clasificación: { select: { name: '🔥 Hot 70+' } },
      'Primera acción': { select: { name: 'Email personalizado' } },
    });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer secret_notion_test');
    expect(fetchMock.mock.calls[0][1].headers['Notion-Version']).toBe('2026-03-11');
  });

  it('updates the existing lead instead of creating a duplicate', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 'page-existing' }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const res = response();
    await handler(request(), res);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.notion.com/v1/pages/page-existing');
    expect(fetchMock.mock.calls[1][1].method).toBe('PATCH');
    const update = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(update.properties.Estado).toBeUndefined();
    expect(update.properties.Responsable).toBeUndefined();
    expect(update.properties['Fecha entrada']).toBeUndefined();
  });

  it('coalesces concurrent submissions with the same id in one instance', async () => {
    let releaseQuery!: () => void;
    const queryGate = new Promise<void>((resolve) => { releaseQuery = resolve; });
    fetchMock
      .mockImplementationOnce(async () => {
        await queryGate;
        return { ok: true, json: async () => ({ results: [] }) };
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const first = response();
    const second = response();
    const submissions = Promise.all([handler(request(), first), handler(request(), second)]);
    releaseQuery();
    await submissions;

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects concurrent payloads that reuse another submission id', async () => {
    let releaseQuery!: () => void;
    const queryGate = new Promise<void>((resolve) => { releaseQuery = resolve; });
    fetchMock
      .mockImplementationOnce(async () => {
        await queryGate;
        return { ok: true, json: async () => ({ results: [] }) };
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const first = response();
    const conflict = response();
    const firstSubmission = handler(request(), first);
    await Promise.resolve();
    await handler(request({ email: 'grace@example.com' }), conflict);
    releaseQuery();
    await firstSubmission;

    expect(first.statusCode).toBe(200);
    expect(conflict.statusCode).toBe(409);
    expect(conflict.payload).toEqual({ error: 'Submission id conflict' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('persists consent evidence in the diagnostic-owned notes', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const res = response();

    await handler(request(), res);

    const create = JSON.parse(fetchMock.mock.calls[1][1].body);
    const notes = create.properties.Notas.rich_text[0].text.content;
    expect(notes).toContain('Consentimiento: aceptado');
    expect(notes).toContain('Fuente del consentimiento: diagnostic_form');
  });

  it('retries a transient Notion rate limit before failing the lead', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: (name: string) => name === 'Retry-After' ? '0' : null },
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const res = response();

    await handler(request(), res);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reconciles an ambiguous create failure without replaying POST pages', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: false, status: 503, headers: { get: () => null } })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 'created-despite-503' }] }) });
    const res = response();

    await handler(request(), res);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toContain('/query');
    expect(fetchMock.mock.calls.filter(([url]) => url === 'https://api.notion.com/v1/pages')).toHaveLength(1);
  });

  it('does not retry when Retry-After exceeds the request deadline', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: () => '30' },
    });
    const res = response();

    await handler(request(), res);

    expect(res.statusCode).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails explicitly when the Notion configuration is missing', async () => {
    delete process.env.NOTION_TOKEN;
    const res = response();

    await handler(request(), res);

    expect(res.statusCode).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not report success when Notion rejects the write', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: false, status: 400, headers: { get: () => null } });
    const res = response();

    await handler(request(), res);

    expect(res.statusCode).toBe(502);
    expect(res.payload).toEqual({ error: 'Lead delivery failed' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
