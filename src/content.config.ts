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
    // FAQs (opcional) — generadas por scripts/generate-faqs.mjs (AI Gateway);
    // si faltan, la ficha usa un fallback derivado de los datos.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
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

// Estudios — comparativas/análisis originales en español (formato respuesta, GEO).
const estudios = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/estudios' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.coerce.date(),
    actualizado: z.coerce.date().optional(),
    tema: z.string(),
    etiquetas: z.array(z.string()).default([]),
    // slugs de herramientas del directorio mencionadas (cruce + salida afiliado)
    herramientas: z.array(z.string()).default([]),
    destacado: z.boolean().default(false),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    resumen: z.array(z.string()).default([]),
    porQueImporta: z.string().optional(),
    comparativa: z
      .object({
        criterios: z.array(z.string()),
        filas: z.array(
          z.object({
            herramienta: z.string(),
            celdas: z.array(z.string()),
            score: z.number().min(0).max(100).optional(),
          }),
        ),
      })
      .optional(),
    workflow: z
      .object({
        titulo: z.string().optional(),
        pasos: z.array(z.object({ titulo: z.string(), detalle: z.string() })),
      })
      .optional(),
    fuentes: z
      .array(
        z.object({
          titulo: z.string(),
          url: z.string().url(),
          editor: z.string().optional(),
          fecha: z.string().optional(),
        }),
      )
      .default([]),
    iaPrompt: z.string().optional(),
    bonus: z
      .object({
        titulo: z.string().optional(),
        intro: z.string().optional(),
        herramientas: z.array(z.string()).default([]),
        nota: z.string().optional(),
      })
      .optional(),
  }),
});

// Noticias — actualidad de IA curada, resumida en español original con atribución.
const noticias = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.coerce.date(),
    tema: z.string(),
    etiquetas: z.array(z.string()).default([]),
    // fuente primaria (obligatoria): de dónde sale el dato, para atribución
    fuente: z.object({ nombre: z.string(), url: z.string().url() }),
    herramientas: z.array(z.string()).default([]),
  }),
});

// Directorio de cursos de IA (#54). Clona el patrón de `tools`: el `id` = nombre
// de archivo = slug. El build falla si un JSON no cumple el esquema.
const cursos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cursos' }),
  schema: z
    .object({
      titulo: z.string(),
      proveedor: z.string(),
      categoria: z.string(),
      nivel: z.enum(['principiante', 'intermedio', 'avanzado']),
      desc: z.string(),
      long: z.string(),
      tagline: z.string(),
      ideal: z.string(),
      precio: z.enum(['Gratis', 'Pago']),
      precioDesde: z.string().optional(),
      idioma: z.string(),
      duracion: z.string().optional(),
      certificado: z.boolean().optional(),
      tipo: z.enum(['externo', 'propio']).default('externo'),
      // officialUrl — obligatoria, validada como URL
      officialUrl: z.string().url(),
      affiliateUrl: z.string().url().optional(),
      gumroadUrl: z.string().url().optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      orden: z.number().int(),
      destacado: z.boolean().default(false),
      actualizado: z.string(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    })
    .superRefine((d, ctx) => {
      if (d.tipo === 'propio' && !d.gumroadUrl) {
        ctx.addIssue({
          code: 'custom',
          message: 'Un curso propio (tipo: "propio") requiere gumroadUrl.',
          path: ['gumroadUrl'],
        });
      }
    }),
});

const cursosCategorias = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cursos-categorias' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    orden: z.number().int(),
  }),
});

export const collections = { tools, categories, estudios, noticias, cursos, cursosCategorias };
