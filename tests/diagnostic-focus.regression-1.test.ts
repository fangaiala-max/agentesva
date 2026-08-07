import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initDiagnostic } from '../src/scripts/diagnostico';

// Regression: ISSUE-001 — el autoenfoque ocultaba el H1 y recortaba el resultado
// Found by /qa on 2026-08-08
// Report: .gstack/qa-reports/qa-report-localhost-2026-08-08.md
describe('foco del diagnóstico', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main data-diagnostic-root>
        <div class="progress-wrap"></div>
        <span data-step-current></span>
        <div data-progress></div>
        <div data-progress-bar></div>
        <p data-diagnostic-error hidden></p>
        <form data-diagnostic-form>
          <fieldset data-step data-step-id="all">
            <input name="businessType" value="Agencia de servicios" />
            <input name="teamSize" value="2_5" checked />
            <input name="goal" value="sales" checked />
            <textarea name="process">Seguimiento manual de nuevos leads que llegan por la web</textarea>
            <input name="frequency" value="daily" checked />
            <input name="currentTools" value="some" checked />
            <input name="budget" value="1500_3000" checked />
            <input name="timeline" value="one_month" checked />
            <input name="risk" value="standard" checked />
          </fieldset>
          <button type="button" data-back></button>
          <button type="button" data-next></button>
          <button type="submit" data-finish></button>
        </form>
        <section data-diagnostic-result hidden tabindex="-1">
          <div data-result="qualified_call"></div>
          <div data-result="paid_workshop"></div>
          <div data-result="self_serve_resources"></div>
          <div data-result="manual_review"></div>
          <strong data-result-priority></strong>
          <strong data-result-complexity></strong>
          <ul data-result-opportunities></ul>
          <ul data-result-reasons></ul>
          <a data-result-next-step></a>
        </section>
        <form data-diagnostic-contact>
          <p data-contact-error hidden></p>
          <div data-contact-success hidden tabindex="-1"></div>
          <button data-contact-submit></button>
        </form>
      </main>`;
  });

  it('conserva el inicio de la página al montar el primer paso', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    initDiagnostic();
    expect(focus).not.toHaveBeenCalled();
  });

  it('enfoca el resultado sin scroll implícito y lo coloca bajo la cabecera', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    initDiagnostic();
    focus.mockClear();

    document.querySelector<HTMLFormElement>('[data-diagnostic-form]')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const result = document.querySelector<HTMLElement>('[data-diagnostic-result]')!;
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(result.hidden).toBe(false);
  });
});
