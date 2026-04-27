import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(120).max(160),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    author: z.string().default('Equipo AgentesVA'),
    tags: z.array(z.string()),
    pillar: z.enum([
      'kit-digital',
      'whatsapp-api',
      'automatizacion-ia-pymes',
      'comparativas',
      'agentes-ia-concepto',
      'caso-estudio',
    ]),
    industria: z
      .enum([
        'restaurante',
        'escuela-idiomas',
        'renting',
        'consultorio',
        'inmobiliaria',
        'ecommerce',
        'agencia',
        'farmacia',
        'salon',
        'gimnasio',
        'consultoria',
        'academia',
        'general',
      ])
      .default('general'),
    youtubeId: z.string().optional(),
    casoRelacionado: z.string().optional(),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTimeMin: z.number().int().min(2).max(45).optional(),
    faqs: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
  }),
});

const casos = defineCollection({
  type: 'content',
  schema: z.object({
    cliente: z.string(),
    industria: z.string(),
    ciudad: z.string(),
    metrica: z.string(),
    metricaLabel: z.string(),
    descripcion: z.string(),
    stack: z.array(z.string()),
    plazo: z.string(),
    publicado: z.date(),
    confidencial: z.boolean().default(true),
  }),
});

const industrias = defineCollection({
  type: 'content',
  schema: z.object({
    nombre: z.string(),
    glyph: z.string(),
    casoDocumentado: z.string().optional(),
    metrica: z.string().optional(),
    estado: z.enum(['activo', 'pendiente', 'piloto']),
    descripcionCorta: z.string(),
  }),
});

export const collections = { blog, casos, industrias };
