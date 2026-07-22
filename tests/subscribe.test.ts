import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../api/subscribe.js';
import { initSubscribe } from '../src/scripts/subscribe';

// Respuesta upstream de Brevo "todo OK" (alta directa y DOI devuelven 201/204).
const BREVO_OK = { status: 201, json: async () => ({}) };

function makeReq(overrides: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    headers: { origin: 'https://agentesva.com' },
    body: { email: 'user@example.com', list: 'default' },
    ...overrides,
  };
}

function makeRes() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    ended: false,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(p: unknown) {
      this.payload = p;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

let fetchMock: ReturnType<typeof vi.fn>;
const ENV_KEYS = ['BREVO_API_KEY', 'BREVO_DOI_TEMPLATE_ID', 'BREVO_LIST_ID', 'SUBSCRIBE_ALLOWED_ORIGINS'];
const ENV_SNAPSHOT: Record<string, string | undefined> = {};

// Simula "GA4 cargado" para el script cliente de suscripción (mismo marcador que consent.ts).
function loadGA4ForSubscribe() {
  const s = document.createElement('script');
  s.setAttribute('data-ga4', '1');
  document.head.appendChild(s);
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(BREVO_OK);
  vi.stubGlobal('fetch', fetchMock);
  ENV_KEYS.forEach((k) => (ENV_SNAPSHOT[k] = process.env[k]));
  process.env.BREVO_API_KEY = 'xkeysib-test';
  delete process.env.BREVO_DOI_TEMPLATE_ID;
  document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());
  // @ts-expect-error reset dataLayer entre tests
  window.dataLayer = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
  ENV_KEYS.forEach((k) => {
    if (ENV_SNAPSHOT[k] === undefined) delete process.env[k];
    else process.env[k] = ENV_SNAPSHOT[k];
  });
});

// Helpers para leer lo que se envió a Brevo.
function lastCall() {
  const [endpoint, options] = fetchMock.mock.calls.at(-1) as [string, { body: string }];
  return { endpoint, payload: JSON.parse(options.body) };
}

describe('subscribe — preflight y métodos', () => {
  it('OPTIONS responde 204 y no llama a Brevo', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'OPTIONS' }), res);
    expect(res.statusCode).toBe(204);
    expect(res.ended).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('métodos que no son POST responden 405', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('subscribe — gate por Origin (anti-bombing)', () => {
  it('Origin no permitido responde 403 y no llama a Brevo', async () => {
    const res = makeRes();
    await handler(makeReq({ headers: { origin: 'https://evil.example' } }), res);
    expect(res.statusCode).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sin cabecera Origin responde 403 (bots/curl sin Origin)', async () => {
    const res = makeRes();
    await handler(makeReq({ headers: {} }), res);
    expect(res.statusCode).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('acepta el subdominio www del dominio de producción', async () => {
    const res = makeRes();
    await handler(makeReq({ headers: { origin: 'https://www.agentesva.com' } }), res);
    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('respeta SUBSCRIBE_ALLOWED_ORIGINS cuando está definida', async () => {
    process.env.SUBSCRIBE_ALLOWED_ORIGINS = 'https://staging.agentesva.com';
    const res = makeRes();
    await handler(makeReq({ headers: { origin: 'https://staging.agentesva.com' } }), res);
    expect(res.statusCode).toBe(200);
  });
});

describe('subscribe — validación', () => {
  it('sin BREVO_API_KEY responde 500', async () => {
    delete process.env.BREVO_API_KEY;
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honeypot relleno → éxito falso sin alta', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { email: 'user@example.com', company: 'ACME bot' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual({ success: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('email inválido responde 422', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { email: 'no-es-un-email' } }), res);
    expect(res.statusCode).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('subscribe — alta en Brevo', () => {
  it('alta directa: llama a /v3/contacts con listIds y updateEnabled', async () => {
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(200);
    const { endpoint, payload } = lastCall();
    expect(endpoint).toBe('https://api.brevo.com/v3/contacts');
    expect(payload.email).toBe('user@example.com');
    expect(Array.isArray(payload.listIds)).toBe(true);
    expect(payload.updateEnabled).toBe(true);
  });

  it('parte el nombre en FIRSTNAME / LASTNAME', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { email: 'user@example.com', name: 'Ada Lovelace King' } }), res);
    const { payload } = lastCall();
    expect(payload.attributes.FIRSTNAME).toBe('Ada');
    expect(payload.attributes.LASTNAME).toBe('Lovelace King');
  });

  it('DOI: list=newsletter + template → doubleOptinConfirmation', async () => {
    process.env.BREVO_DOI_TEMPLATE_ID = '42';
    const res = makeRes();
    await handler(makeReq({ body: { email: 'user@example.com', list: 'newsletter' } }), res);
    const { endpoint, payload } = lastCall();
    expect(endpoint).toBe('https://api.brevo.com/v3/contacts/doubleOptinConfirmation');
    expect(payload.templateId).toBe(42);
    expect(Array.isArray(payload.includeListIds)).toBe(true);
    expect(typeof payload.redirectionUrl).toBe('string');
    expect((res.payload as { doi: boolean }).doi).toBe(true);
  });
});

describe('subscribe — registro de consentimiento (RGPD)', () => {
  it('consent=true guarda OPT_IN_AT (ISO) y OPT_IN_SOURCE', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { email: 'user@example.com', list: 'newsletter', consent: true } }), res);
    const { payload } = lastCall();
    expect(payload.attributes.OPT_IN_SOURCE).toBe('newsletter');
    expect(typeof payload.attributes.OPT_IN_AT).toBe('string');
    // ISO 8601 válido y parseable.
    expect(Number.isNaN(Date.parse(payload.attributes.OPT_IN_AT))).toBe(false);
  });

  it('sin consent no añade atributos de opt-in', async () => {
    const res = makeRes();
    await handler(makeReq(), res);
    const { payload } = lastCall();
    expect(payload.attributes.OPT_IN_AT).toBeUndefined();
    expect(payload.attributes.OPT_IN_SOURCE).toBeUndefined();
  });
});

describe('subscribe — errores upstream', () => {
  it('no filtra el mensaje de Brevo al cliente', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 400,
      json: async () => ({ message: 'detalle interno de Brevo con listId 8' }),
    });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'Subscription failed' });
    expect(JSON.stringify(res.payload)).not.toContain('listId');
  });

  it('respuesta upstream inesperada (<400 y no 201/204) → 500 genérico', async () => {
    fetchMock.mockResolvedValueOnce({ status: 200, json: async () => ({}) });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Subscription failed' });
  });
});

describe('subscribe → GA4 newsletter_submit', () => {
  it('emite newsletter_submit tras una suscripción correcta (con GA4 cargado)', async () => {
    loadGA4ForSubscribe();
    document.body.innerHTML = `
      <div data-subscribe-root>
        <form data-subscribe data-list="newsletter">
          <input data-subscribe-email value="hola@ejemplo.com" />
          <button data-subscribe-submit>Suscribirse</button>
        </form>
        <div data-subscribe-success hidden></div>
        <div data-subscribe-error hidden></div>
      </div>`;
    // @ts-expect-error mock fetch OK
    global.fetch = async () => ({ ok: true, json: async () => ({}) });
    initSubscribe();
    const form = document.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    // @ts-expect-error dataLayer inyectado
    const evs = (window.dataLayer as unknown[]) ?? [];
    const fired = evs.some((e) => Array.isArray(e) && e[0] === 'event' && e[1] === 'newsletter_submit');
    expect(fired).toBe(true);
  });
});
