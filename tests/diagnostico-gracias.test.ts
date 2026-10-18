import { describe, expect, it } from 'vitest';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico';
import { bookingProviderFor, diagnosticThanksUrl, thanksPlanFor } from '../src/data/diagnostico-gracias';

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

describe('diagnosticThanksUrl', () => {
  it('solo incluye categorías cerradas, nunca respuestas ni contacto', () => {
    const url = diagnosticThanksUrl(classifyDiagnostic(answers));
    expect(url).toBe('/gracias-diagnostico/?resultado=qualified_call&cluster=sales&servicio=sales_automation');
    expect(url).not.toContain('lead');
    expect(url).not.toContain('Agencia');
  });
});

describe('thanksPlanFor', () => {
  it('clasifica el proveedor de reserva sin atribuir todos los enlaces a Calendly', () => {
    expect(bookingProviderFor('https://calendly.com/agentesva/revision')).toBe('calendly');
    expect(bookingProviderFor('https://cal.com/agentesva/revision')).toBe('cal');
    expect(bookingProviderFor('https://booking.example.com/revision')).toBe('external');
    expect(bookingProviderFor('http://cal.example.com/revision')).toBeUndefined();
  });

  it('ofrece reserva al lead cualificado cuando hay proveedor configurado', () => {
    expect(thanksPlanFor('qualified_call', 'sales', 'https://cal.example.com/agentesva')).toMatchObject({
      title: 'Tu caso tiene buen encaje para una revisión de implementación',
      action: {
        label: 'Reservar conversación',
        href: 'https://cal.example.com/agentesva',
        booking: true,
      },
    });
  });

  it('mantiene un siguiente paso útil sin proveedor de reservas', () => {
    const plan = thanksPlanFor('qualified_call', 'sales', '');
    expect(plan.action.label).toBe('Escribir a AgentesVA');
    expect(plan.action.href).toContain('mailto:hola@agentesva.com');
    expect(plan.action.booking).toBe(false);
  });

  it('rechaza URLs de reserva que no usan HTTPS', () => {
    const plan = thanksPlanFor('qualified_call', 'sales', 'http://cal.example.com/agentesva');
    expect(plan.action.href).toContain('mailto:hola@agentesva.com');
    expect(plan.action.booking).toBe(false);
  });

  it('envía los casos de alcance incierto al taller', () => {
    expect(thanksPlanFor('paid_workshop', 'operations', '')).toMatchObject({
      resultType: 'paid_workshop',
      cluster: 'operations',
      action: {
        label: 'Ver cómo trabajamos',
        href: '/como-trabajamos/',
        booking: false,
      },
    });
  });

  it('envía los perfiles exploratorios a una guía práctica', () => {
    expect(thanksPlanFor('self_serve_resources', 'general', '')).toMatchObject({
      action: {
        label: 'Ver qué automatizar primero',
        href: '/guias/procesos-que-conviene-automatizar-primero/',
        booking: false,
      },
    });
  });

  it('degrada valores manipulados a una confirmación segura', () => {
    expect(thanksPlanFor('invalid', 'invalid', '')).toMatchObject({
      resultType: 'manual_review',
      cluster: 'general',
    });
  });

  it('conserva una revisión manual válida y normaliza solo el cluster manipulado', () => {
    expect(thanksPlanFor('manual_review', 'sales', '')).toMatchObject({
      resultType: 'manual_review',
      cluster: 'sales',
      action: { href: '/como-trabajamos/', booking: false },
    });
    expect(thanksPlanFor('qualified_call', 'invalid', '')).toMatchObject({
      resultType: 'qualified_call',
      cluster: 'general',
    });
  });
});
