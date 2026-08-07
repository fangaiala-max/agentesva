import type { DiagnosticResult, ResultType } from './diagnostico';

type Cluster = DiagnosticResult['cluster'];

const RESULT_TYPES = new Set<ResultType>([
  'qualified_call',
  'paid_workshop',
  'self_serve_resources',
  'manual_review',
]);
const CLUSTERS = new Set<Cluster>(['customer_service', 'sales', 'operations', 'general']);

export interface DiagnosticThanksPlan {
  resultType: ResultType;
  cluster: Cluster;
  eyebrow: string;
  title: string;
  description: string;
  expectation: string;
  action: {
    label: string;
    href: string;
    booking: boolean;
  };
  secondary: {
    label: string;
    href: string;
  };
}

export function diagnosticThanksUrl(result: DiagnosticResult): string {
  const query = new URLSearchParams({
    resultado: result.resultType,
    cluster: result.cluster,
    servicio: result.service,
  });
  return `/gracias-diagnostico/?${query.toString()}`;
}

export function thanksPlanFor(rawResultType: string, rawCluster: string, bookingUrl: string): DiagnosticThanksPlan {
  const resultType = RESULT_TYPES.has(rawResultType as ResultType)
    ? rawResultType as ResultType
    : 'manual_review';
  const cluster = CLUSTERS.has(rawCluster as Cluster) ? rawCluster as Cluster : 'general';
  const contactHref = `mailto:hola@agentesva.com?subject=${encodeURIComponent('Revisión de mi diagnóstico de automatización')}`;

  if (resultType === 'qualified_call') {
    const canBook = /^https:\/\//.test(bookingUrl);
    return {
      resultType,
      cluster,
      eyebrow: 'Diagnóstico recibido',
      title: 'Tu caso tiene buen encaje para una revisión de implementación',
      description: 'Ya tenemos tus respuestas. Revisaremos el proceso, sus dependencias y el alcance antes de recomendar una solución concreta.',
      expectation: 'Te responderemos el siguiente día laborable. Si reservas ahora, usaremos la conversación para validar el flujo y los accesos necesarios.',
      action: canBook
        ? { label: 'Reservar conversación', href: bookingUrl, booking: true }
        : { label: 'Escribir a AgentesVA', href: contactHref, booking: false },
      secondary: { label: 'Ver precios orientativos', href: '/precios-automatizacion-ia/' },
    };
  }

  if (resultType === 'paid_workshop') {
    return {
      resultType,
      cluster,
      eyebrow: 'Diagnóstico recibido',
      title: 'El siguiente paso es definir bien el alcance',
      description: 'Hay una oportunidad real, pero primero conviene dibujar el proceso, validar datos y decidir qué parte merece automatizarse.',
      expectation: 'Te responderemos el siguiente día laborable con el encaje del taller y la información que necesitamos para prepararlo.',
      action: { label: 'Ver cómo trabajamos', href: '/como-trabajamos/', booking: false },
      secondary: { label: 'Consultar precios', href: '/precios-automatizacion-ia/' },
    };
  }

  if (resultType === 'self_serve_resources') {
    return {
      resultType,
      cluster,
      eyebrow: 'Diagnóstico completado',
      title: 'Empieza por concretar una oportunidad pequeña y medible',
      description: 'No necesitas contratar una implementación todavía. Te conviene medir el trabajo repetitivo y elegir un primer caso con impacto visible.',
      expectation: 'Puedes usar la guía ahora y responder a nuestro correo si después quieres contrastar la prioridad elegida.',
      action: {
        label: 'Ver qué automatizar primero',
        href: '/guias/procesos-que-conviene-automatizar-primero/',
        booking: false,
      },
      secondary: { label: 'Explorar guías prácticas', href: '/guias/' },
    };
  }

  return {
    resultType: 'manual_review',
    cluster,
    eyebrow: 'Diagnóstico recibido',
    title: 'Revisaremos el caso antes de recomendar una automatización',
    description: 'Los datos, decisiones o controles implicados necesitan supervisión humana. No automatizaremos una decisión sensible sin límites claros.',
    expectation: 'Te responderemos el siguiente día laborable indicando qué puede explorarse de forma segura y qué debe permanecer bajo revisión humana.',
    action: { label: 'Conocer nuestro proceso', href: '/como-trabajamos/', booking: false },
    secondary: { label: 'Escribir a AgentesVA', href: contactHref, },
  };
}
