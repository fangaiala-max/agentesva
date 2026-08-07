import { beforeEach, describe, expect, it } from 'vitest';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico';
import { renderDiagnosticPlan } from '../src/scripts/diagnostico';

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

describe('renderDiagnosticPlan', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="result">
        <strong data-result-priority></strong>
        <strong data-result-complexity></strong>
        <ul data-result-opportunities></ul>
        <ul data-result-reasons></ul>
        <a data-result-next-step></a>
      </section>`;
  });

  it('muestra prioridad, complejidad, oportunidades y siguiente paso', () => {
    renderDiagnosticPlan(document.getElementById('result')!, classifyDiagnostic(answers));

    expect(document.querySelector('[data-result-priority]')!.textContent).toBe('Alta');
    expect(document.querySelector('[data-result-complexity]')!.textContent).toBe('Media');
    expect(document.querySelectorAll('[data-result-opportunities] li')).toHaveLength(3);
    expect(document.querySelectorAll('[data-result-reasons] li')).toHaveLength(2);
    expect(document.querySelector('[data-result-next-step]')!.textContent).toBe('Solicitar revisión de implementación');
    expect(document.querySelector('[data-result-next-step]')!.getAttribute('href')).toBe('#enviar-diagnostico');
  });

  it('renderiza el contenido como texto, sin interpretar HTML', () => {
    const result = classifyDiagnostic(answers);
    result.opportunities[0] = '<img src=x onerror=alert(1)>';
    renderDiagnosticPlan(document.getElementById('result')!, result);

    expect(document.querySelector('[data-result-opportunities] img')).toBeNull();
    expect(document.querySelector('[data-result-opportunities] li')!.textContent).toContain('<img');
  });
});
