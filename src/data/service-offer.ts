export const SERVICE_OFFER = {
  diagnostic: { name: 'Diagnóstico inicial', price: 'Gratis' },
  workshop: { name: 'Taller de automatización', price: 'Desde 300 €' },
  scoped: { name: 'Implementación acotada', price: 'Desde 1.500 €', timeline: 'De 2 a 4 semanas' },
  integrated: { name: 'Varias integraciones', price: 'Desde 3.000 €', timeline: 'De 4 a 8 semanas' },
  support: { name: 'Soporte y optimización', price: 'Desde 300 €/mes' },
} as const;

export const FIT_BASELINE = {
  good: ['Proceso recurrente', 'Persona responsable', 'Acceso a herramientas y casos reales', 'Resultado medible'],
  notYet: ['Proceso todavía inestable', 'Sin responsable interno', 'Sin acceso legítimo a los datos', 'Expectativa de automatizarlo todo de una vez'],
} as const;

export const PRICE_DISCLAIMER = 'Son rangos orientativos, no presupuestos cerrados.';
