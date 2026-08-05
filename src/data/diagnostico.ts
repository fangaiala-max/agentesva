// Contrato y reglas puras del diagnóstico comercial.
// Fuente de negocio: docs/service-offer.md. No contiene PII ni depende del DOM,
// para que la clasificación sea determinista y se pueda probar por separado.

export const TEAM_SIZES = ['solo', '2_5', '6_20', '21_plus'] as const;
export const GOALS = ['customer_service', 'sales', 'operations', 'marketing', 'exploring'] as const;
export const FREQUENCIES = ['sporadic', 'monthly', 'weekly', 'daily', 'high_volume'] as const;
export const BUDGETS = ['exploring', 'under_300', '300_1500', '1500_3000', '3000_5000', 'more_5000'] as const;
export const TIMELINES = ['now', 'one_month', 'three_months', 'later'] as const;
export const RISK_LEVELS = ['standard', 'sensitive_data', 'high_impact_decisions', 'unsafe_request'] as const;

export type TeamSize = (typeof TEAM_SIZES)[number];
export type Goal = (typeof GOALS)[number];
export type Frequency = (typeof FREQUENCIES)[number];
export type Budget = (typeof BUDGETS)[number];
export type Timeline = (typeof TIMELINES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type QualificationBand = 'low' | 'medium' | 'high';
export type ResultType = 'qualified_call' | 'paid_workshop' | 'self_serve_resources' | 'manual_review';

export interface DiagnosticAnswers {
  businessType: string;
  teamSize: TeamSize;
  goal: Goal;
  process: string;
  frequency: Frequency;
  currentTools: 'none' | 'some';
  budget: Budget;
  timeline: Timeline;
  risk: RiskLevel;
}
export interface DiagnosticResult {
  qualificationBand: QualificationBand;
  resultType: ResultType;
  cluster: 'customer_service' | 'sales' | 'operations' | 'general';
  service:
    | 'customer_service_automation'
    | 'sales_automation'
    | 'process_automation'
    | 'general_consulting';
  reasons: string[];
}

const IMPLEMENTATION_BUDGETS = new Set<Budget>(['1500_3000', '3000_5000', 'more_5000']);
const WORKSHOP_BUDGETS = new Set<Budget>(['300_1500']);
const NEAR_TIMELINES = new Set<Timeline>(['now', 'one_month', 'three_months']);
const REPEATED_FREQUENCIES = new Set<Frequency>(['weekly', 'daily', 'high_volume']);

export function clusterFor(goal: Goal): DiagnosticResult['cluster'] {
  if (goal === 'customer_service') return 'customer_service';
  if (goal === 'sales') return 'sales';
  if (goal === 'operations') return 'operations';
  return 'general';
}

export function serviceFor(goal: Goal): DiagnosticResult['service'] {
  if (goal === 'customer_service') return 'customer_service_automation';
  if (goal === 'sales') return 'sales_automation';
  if (goal === 'operations') return 'process_automation';
  return 'general_consulting';
}

export function classifyDiagnostic(a: DiagnosticAnswers): DiagnosticResult {
  const cluster = clusterFor(a.goal);
  const service = serviceFor(a.goal);

  if (a.risk !== 'standard') {
    return {
      qualificationBand: 'medium',
      resultType: 'manual_review',
      cluster,
      service,
      reasons: ['El caso necesita revisar alcance, datos y supervisión humana antes de recomendar una automatización.'],
    };
  }

  const concreteProcess = a.process.trim().length >= 12;
  const repeated = REPEATED_FREQUENCIES.has(a.frequency);
  const implementationBudget = IMPLEMENTATION_BUDGETS.has(a.budget);
  const nearTimeline = NEAR_TIMELINES.has(a.timeline);

  if (implementationBudget && nearTimeline && repeated && concreteProcess) {
    return {
      qualificationBand: 'high',
      resultType: 'qualified_call',
      cluster,
      service,
      reasons: [
        'El proceso es concreto y se repite con suficiente frecuencia.',
        'El rango de inversión y el plazo encajan con una implementación acotada.',
      ],
    };
  }

  if (
    (WORKSHOP_BUDGETS.has(a.budget) && repeated && concreteProcess) ||
    (implementationBudget && (!nearTimeline || !concreteProcess))
  ) {
    return {
      qualificationBand: 'medium',
      resultType: 'paid_workshop',
      cluster,
      service,
      reasons: ['Hay una oportunidad plausible, pero conviene definir alcance, viabilidad y prioridades antes de implementar.'],
    };
  }

  return {
    qualificationBand: 'low',
    resultType: 'self_serve_resources',
    cluster,
    service,
    reasons: ['Ahora mismo encaja mejor una recomendación práctica y recursos para concretar la oportunidad.'],
  };
}
