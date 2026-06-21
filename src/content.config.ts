import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Directorio de herramientas de IA (#50). El `id` de cada entrada = nombre de
// archivo = slug. El build falla si un JSON no cumple el esquema.
const tools = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    cat: z.string(),
    desc: z.string(),
    price: z.enum(['Gratis', 'Freemium', 'Pago']),
    rating: z.string(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    tagline: z.string(),
    ideal: z.string(),
    // officialUrl — obligatoria, validada como URL
    url: z.string().url(),
    affiliateUrl: z.string().url().optional(),
    long: z.string(),
    features: z.array(z.string()).min(1),
    steps: z.array(z.string()).min(1),
    orden: z.number().int(),
    destacado: z.boolean().default(false),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    orden: z.number().int(),
  }),
});

export const collections = { tools, categories };
