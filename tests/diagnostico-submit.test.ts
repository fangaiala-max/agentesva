import { beforeEach, describe, expect, it, vi } from 'vitest';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico';
import { initDiagnostic } from '../src/scripts/diagnostico';
import { trackGrowthEvent } from '../src/scripts/track';

vi.mock('../src/scripts/track', () => ({ trackGrowthEvent: vi.fn() }));

const answers: DiagnosticAnswers = {
  businessType: 'Agencia de servicios',
  teamSize: '2_5',
  goal: 'sales',
  process: 'Seguimiento manual de nuevos leads que llegan por la web',
  frequency: 'daily',
  currentTools: 'some',
  budget: '1500_3000',
  timeline: 'one_month',
  risk: 'standard',
};

function fixture(): void {
  document.body.innerHTML = `
    <main data-diagnostic-root>
      <div class="progress-wrap"></div>
      <span data-step-current></span>
      <div data-progress></div>
      <div data-progress-bar></div>
      <p data-diagnostic-error hidden></p>
      <form data-diagnostic-form>
        <fieldset data-step data-step-id="all">
          <input name="businessType" value="${answers.businessType}" />
          <input name="teamSize" value="${answers.teamSize}" checked />
          <input name="goal" value="${answers.goal}" checked />
          <textarea name="process">${answers.process}</textarea>
          <input name="frequency" value="${answers.frequency}" checked />
          <input name="currentTools" value="${answers.currentTools}" checked />
          <input name="budget" value="${answers.budget}" checked />
          <input name="timeline" value="${answers.timeline}" checked />
          <input name="risk" value="${answers.risk}" checked />
        </fieldset>
        <button type="button" data-back></button>
        <button type="button" data-next></button>
        <button type="submit" data-finish></button>
      </form>
      <section data-diagnostic-result hidden tabindex="-1">
        <button type="button" data-restart>Reiniciar</button>
        <div data-result="qualified_call"></div>
        <div data-result="paid_workshop"></div>
        <div data-result="self_serve_resources"></div>
        <div data-result="manual_review"></div>
        <strong data-result-priority></strong>
        <strong data-result-complexity></strong>
        <ul data-result-opportunities></ul>
        <ul data-result-reasons></ul>
        <a data-result-next-step></a>
        <form data-diagnostic-contact>
          <input name="name" value="Ada Lovelace" required />
          <input name="email" type="email" value="ada@example.com" required />
          <input name="company" value="" />
          <input name="consent" type="checkbox" checked required />
          <p data-contact-error hidden></p>
          <div data-contact-success hidden tabindex="-1"></div>
          <button data-contact-submit>Enviar diagnóstico →</button>
        </form>
      </section>
    </main>`;
}

function submitDiagnostic(): void {
  initDiagnostic();
  document.querySelector<HTMLFormElement>('[data-diagnostic-form]')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  document.querySelector<HTMLFormElement>('[data-diagnostic-contact]')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function contactState() {
  return {
    error: document.querySelector<HTMLElement>('[data-contact-error]')!,
    submit: document.querySelector<HTMLButtonElement>('[data-contact-submit]')!,
  };
}

describe('envío del diagnóstico', () => {
  beforeEach(() => {
    fixture();
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('redirige a la ruta cerrada devuelta por el servidor tras aceptar el lead', async () => {
    const result = classifyDiagnostic(answers);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result,
        redirectUrl: '/gracias-diagnostico/?resultado=qualified_call&cluster=sales&servicio=sales_automation&token=signed',
      }),
    } as Response);

    submitDiagnostic();

    await vi.waitFor(() => {
      expect(window.location.pathname).toBe('/gracias-diagnostico/');
    });
    expect(window.location.search).toBe('?resultado=qualified_call&cluster=sales&servicio=sales_automation&token=signed');
    expect(fetch).toHaveBeenCalledOnce();
    const request = vi.mocked(fetch).mock.calls[0]![1]!;
    expect(request.method).toBe('POST');
    expect(JSON.parse(String(request.body))).toMatchObject({
      ...answers,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: '',
      consent: true,
      submissionId: expect.any(String),
    });
    expect(trackGrowthEvent).toHaveBeenCalledWith('diagnostic_completed', expect.objectContaining({
      result_type: 'qualified_call',
      qualification_band: 'high',
      cluster: 'sales',
    }));
    expect(trackGrowthEvent).toHaveBeenCalledWith('lead_qualified', expect.objectContaining({
      result_type: 'qualified_call',
      qualification_band: 'high',
    }));
  });

  it.each([
    ['una respuesta HTTP no-ok', { ok: false, json: async () => ({ error: 'upstream' }) }],
    ['JSON inválido', { ok: true, json: async () => { throw new SyntaxError('invalid json'); } }],
    ['un payload incompleto', { ok: true, json: async () => ({ success: true }) }],
  ])('muestra un error recuperable ante %s', async (_case, response) => {
    vi.mocked(fetch).mockResolvedValue(response as Response);

    submitDiagnostic();
    const { error, submit } = contactState();

    await vi.waitFor(() => {
      expect(error.hidden).toBe(false);
    });
    expect(error.textContent).toBe('No se pudo enviar el diagnóstico. Inténtalo de nuevo.');
    expect(submit.disabled).toBe(false);
    expect(submit.textContent).toBe('Enviar diagnóstico →');
  });

  it('permite reintentar después de un rechazo de red', async () => {
    const result = classifyDiagnostic(answers);
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          result,
          redirectUrl: '/gracias-diagnostico/?resultado=qualified_call&cluster=sales&servicio=sales_automation&token=signed',
        }),
      } as Response);

    submitDiagnostic();
    const { error, submit } = contactState();
    await vi.waitFor(() => {
      expect(error.textContent).toBe('Sin conexión');
    });
    expect(error.hidden).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(submit.textContent).toBe('Enviar diagnóstico →');

    document.querySelector<HTMLFormElement>('[data-diagnostic-contact]')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(window.location.pathname).toBe('/gracias-diagnostico/');
    });
    const firstBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]![1]!.body));
    const retryBody = JSON.parse(String(vi.mocked(fetch).mock.calls[1]![1]!.body));
    expect(retryBody.submissionId).toBe(firstBody.submissionId);
  });

  it('ignora el reinicio mientras existe una entrega activa', async () => {
    let resolveFetch!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation(() => new Promise((resolve) => { resolveFetch = resolve; }));

    submitDiagnostic();
    document.querySelector<HTMLButtonElement>('[data-restart]')!.click();

    expect(document.querySelector<HTMLFormElement>('[data-diagnostic-form]')!.hidden).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('[data-contact-submit]')!.disabled).toBe(true);

    const result = classifyDiagnostic(answers);
    resolveFetch({
      ok: true,
      json: async () => ({
        success: true,
        result,
        redirectUrl: '/gracias-diagnostico/?resultado=qualified_call&cluster=sales&servicio=sales_automation&token=signed',
      }),
    } as Response);
    await vi.waitFor(() => expect(window.location.pathname).toBe('/gracias-diagnostico/'));
  });
});
