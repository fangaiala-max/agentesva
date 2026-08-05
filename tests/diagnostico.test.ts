import { describe, expect, it } from 'vitest';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico';

const base: DiagnosticAnswers = {
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

describe('classifyDiagnostic', () => {
  it('envía a llamada un proceso concreto, frecuente, cercano y con presupuesto', () => {
    expect(classifyDiagnostic(base)).toMatchObject({
      qualificationBand: 'high',
      resultType: 'qualified_call',
      cluster: 'sales',
      service: 'sales_automation',
    });
  });

  it('recomienda taller para un presupuesto de definición con dolor claro', () => {
    expect(classifyDiagnostic({ ...base, budget: '300_1500' })).toMatchObject({
      qualificationBand: 'medium',
      resultType: 'paid_workshop',
    });
  });

  it('recomienda taller si hay presupuesto pero el plazo aún es lejano', () => {
    expect(classifyDiagnostic({ ...base, timeline: 'later' })).toMatchObject({
      qualificationBand: 'medium',
      resultType: 'paid_workshop',
    });
  });

  it('entrega recursos a quien todavía explora sin presupuesto', () => {
    expect(
      classifyDiagnostic({
        ...base,
        goal: 'exploring',
        frequency: 'sporadic',
        budget: 'exploring',
        timeline: 'later',
      }),
    ).toMatchObject({
      qualificationBand: 'low',
      resultType: 'self_serve_resources',
      cluster: 'general',
    });
  });

  it('fuerza revisión manual cuando hay datos o decisiones sensibles', () => {
    expect(classifyDiagnostic({ ...base, risk: 'high_impact_decisions' })).toMatchObject({
      qualificationBand: 'medium',
      resultType: 'manual_review',
    });
  });

  it('no cualifica como alta una descripción demasiado vaga', () => {
    expect(classifyDiagnostic({ ...base, process: 'Ventas' })).toMatchObject({
      qualificationBand: 'medium',
      resultType: 'paid_workshop',
    });
  });
});
