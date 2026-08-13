import { z } from 'astro/zod';

export const guideSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  fecha: z.coerce.date(),
  actualizado: z.coerce.date(),
  tema: z.string(),
  respuesta: z.string(),
  puntosClave: z.array(z.string()).min(3),
  servicio: z.object({
    nombre: z.string(),
    href: z.string().startsWith('/'),
    cluster: z.enum(['atencion', 'ventas', 'procesos']),
    analytics: z.object({
      cluster: z.enum(['customer_service', 'sales', 'operations', 'general']),
      service: z.enum([
        'customer_service_automation',
        'sales_automation',
        'process_automation',
        'general_consulting',
      ]),
    }),
    titulo: z.string(),
    descripcion: z.string(),
  }).optional(),
  recurso: z.object({
    id: z.string().regex(/^(?:sw|gr)\d{2,3}$/),
  }).optional(),
  relacionados: z.array(z.object({ titulo: z.string(), href: z.string().startsWith('/') })).min(3),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
  fuentes: z.array(z.object({
    titulo: z.string(),
    url: z.string().url(),
    editor: z.string().optional(),
    fecha: z.string().optional(),
  })).min(1),
}).superRefine((data, ctx) => {
  if (data.servicio && data.recurso) {
    ctx.addIssue({
      code: 'custom',
      message: 'Una guía no puede declarar servicio y recurso a la vez.',
      path: ['recurso'],
    });
  }
});
