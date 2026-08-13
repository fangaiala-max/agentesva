import { z } from 'astro/zod';
import { ITEMS, compraUrlDeItem } from '../data/biblioteca';

const internalPath = z.string().regex(/^\/(?!\/)[^\\]*$/, 'Debe ser una ruta interna absoluta');
const resourceIds = new Set(ITEMS.filter((item) => compraUrlDeItem(item.id)).map((item) => item.id));

export const guideSchema = z.object({
  titulo: z.string(),
  seoTitulo: z.string().optional(),
  descripcion: z.string(),
  fecha: z.coerce.date(),
  actualizado: z.coerce.date(),
  tema: z.string(),
  respuesta: z.string(),
  puntosClave: z.array(z.string()).min(3),
  portada: z.object({
    src: internalPath,
    srcMovil: internalPath.optional(),
    alt: z.string(),
    pie: z.string().optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
  servicio: z.object({
    nombre: z.string(),
    href: internalPath,
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
    id: z.string().regex(/^(?:sw|gr)\d{2,3}$/).refine((id) => resourceIds.has(id), 'El recurso debe existir y tener URL de compra'),
  }).optional(),
  relacionados: z.array(z.object({ titulo: z.string(), href: internalPath })).min(3),
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
