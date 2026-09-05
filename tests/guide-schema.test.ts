import { describe, expect, it } from 'vitest';
import { guideSchema } from '../src/content-schemas/guias';

const baseGuide = {
  titulo: 'Guía de prueba',
  descripcion: 'Descripción de prueba',
  fecha: '2026-08-13',
  actualizado: '2026-08-13',
  tema: 'Prueba',
  respuesta: 'Respuesta directa',
  puntosClave: ['Uno', 'Dos', 'Tres'],
  relacionados: [
    { titulo: 'Uno', href: '/uno/' },
    { titulo: 'Dos', href: '/dos/' },
    { titulo: 'Tres', href: '/tres/' },
  ],
  faq: [
    { q: 'Pregunta uno', a: 'Respuesta uno' },
    { q: 'Pregunta dos', a: 'Respuesta dos' },
  ],
  fuentes: [{ titulo: 'Fuente', url: 'https://example.com' }],
};

const service = {
  nombre: 'automatización de atención al cliente',
  href: '/servicios/automatizacion-atencion-cliente/',
  cluster: 'atencion',
  analytics: {
    cluster: 'customer_service',
    service: 'customer_service_automation',
  },
  titulo: 'Título del CTA',
  descripcion: 'Descripción del CTA',
};

describe('schema real de guías', () => {
  it('acepta servicio, recurso o ninguno y rechaza ambos', () => {
    const withService = guideSchema.safeParse({ ...baseGuide, servicio: service });
    const withResource = guideSchema.safeParse({ ...baseGuide, recurso: { id: 'gr22' } });
    const withNeither = guideSchema.safeParse(baseGuide);
    const withBoth = guideSchema.safeParse({ ...baseGuide, servicio: service, recurso: { id: 'gr22' } });

    expect(withService.success).toBe(true);
    expect(withService.data?.servicio).toMatchObject({ analytics: service.analytics });
    expect(withResource.success).toBe(true);
    expect(withNeither.success).toBe(true);
    expect(withBoth.success).toBe(false);
  });

  it('exige IDs analíticos estables en los CTA de servicio', () => {
    const { analytics: _analytics, ...withoutAnalytics } = service;
    expect(guideSchema.safeParse({ ...baseGuide, servicio: withoutAnalytics }).success).toBe(false);
    expect(guideSchema.safeParse({
      ...baseGuide,
      servicio: {
        ...service,
        analytics: { cluster: 'atencion', service: 'automatización de atención al cliente' },
      },
    }).success).toBe(false);
  });
});
