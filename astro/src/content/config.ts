import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    author: z.string().default('Equipo AgentesVA'),
    tags: z.array(z.string()),
    pillar: z.enum(['automatizacion-ia-pymes', 'make-tutorial', 'caso-estudio', 'noticias']),
    industria: z.string().optional(),
    youtubeId: z.string().optional(),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
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
