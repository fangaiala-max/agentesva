// Genera estudios/comparativas ORIGINALES en español vía Vercel AI Gateway y
// los escribe como Markdown en la colección `estudios`. Cada brief
// (scripts/ai/estudios-briefs.json) describe el tema, la pregunta a responder
// y las herramientas reales del directorio a mencionar. El contenido sale en
// forma de respuesta (GEO/AEO) y enlaza a las fichas de /herramienta/<slug>.
//
// Uso:  npm run ai:estudios                       (los que aún no existen)
//       npm run ai:estudios -- --force            (regenera todos los del brief)
//       npm run ai:estudios -- --only=ia-para-atencion-al-cliente
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { generateObject } from 'ai';
import { z } from 'zod';
import { MODEL, gatewayOptions, assertAuth } from './ai/gateway.mjs';

assertAuth();

const FORCE = process.argv.includes('--force');
const ONLY = (process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] || '')
  .split(',')
  .filter(Boolean);

const briefsUrl = new URL('./ai/estudios-briefs.json', import.meta.url);
const toolsDir = new URL('../src/content/tools/', import.meta.url);
const outDir = new URL('../src/content/estudios/', import.meta.url);

const briefs = JSON.parse(readFileSync(briefsUrl, 'utf8'));

// Datos reales de las herramientas referenciadas, para anclar el contenido y
// evitar que el modelo invente precios o funciones.
function toolFacts(slug) {
  const path = new URL(`${slug}.json`, toolsDir);
  if (!existsSync(path)) return null;
  const t = JSON.parse(readFileSync(path, 'utf8'));
  return { slug, name: t.name, cat: t.cat, price: t.price, long: t.long, ideal: t.ideal, url: t.url };
}

const schema = z.object({
  descripcion: z.string().describe('Meta-descripción de 120-160 caracteres, en español, que resuma la respuesta'),
  etiquetas: z.array(z.string()).min(2).max(5).describe('Etiquetas cortas en minúscula (p. ej. "marketing", "gratis")'),
  cuerpo: z
    .string()
    .describe(
      'Cuerpo del artículo en Markdown (sin H1). Empieza con un párrafo que responda la pregunta directamente. ' +
        'Usa encabezados ## y ###, listas y, si encaja, una tabla comparativa. Menciona cada herramienta con su ' +
        'enlace [Nombre](/herramienta/<slug>). 500-800 palabras. Nada de frontmatter ni ```.',
    ),
  faq: z
    .array(z.object({ q: z.string(), a: z.string().describe('1-3 frases, original, sin tecnicismos') }))
    .min(3)
    .max(4),
});

const SYSTEM = `Eres editor de AgentesVA, un directorio y medio de herramientas de IA en español para PyMEs y autónomos (España + LATAM).
Voz de marca: práctica, clara, directa, sin tecnicismos, sin humo; tuteo; español neutro.
Escribes contenido ORIGINAL en español, en forma de respuesta para que aparezca en ChatGPT/Perplexity/Google (GEO/AEO).
REGLA CRÍTICA: no inventes precios, funciones ni datos. Usa SOLO los hechos de las herramientas que se te dan.
Enlaza cada herramienta a su ficha con [Nombre](/herramienta/<slug>) usando exactamente el slug indicado.`;

// Serializa un valor como escalar YAML seguro (JSON es subconjunto de YAML).
const y = (v) => JSON.stringify(v);

function frontmatter(d, fechaISO) {
  const lines = [
    '---',
    `titulo: ${y(d.titulo)}`,
    `descripcion: ${y(d.descripcion)}`,
    `fecha: ${fechaISO}`,
    `tema: ${y(d.tema)}`,
    `etiquetas: ${y(d.etiquetas)}`,
    `herramientas: ${y(d.herramientas)}`,
    'destacado: false',
    'faq:',
    ...d.faq.flatMap((f) => [`  - q: ${y(f.q)}`, `    a: ${y(f.a)}`]),
    '---',
    '',
  ];
  return lines.join('\n');
}

const fechaISO = new Date().toISOString().slice(0, 10);
let done = 0,
  skipped = 0,
  failed = 0;

for (const brief of briefs) {
  if (ONLY.length && !ONLY.includes(brief.slug)) continue;

  const outPath = new URL(`${brief.slug}.md`, outDir);
  if (existsSync(outPath) && !FORCE) {
    skipped++;
    continue;
  }

  const facts = brief.herramientas.map(toolFacts).filter(Boolean);
  if (facts.length === 0) {
    console.error(`✗ ${brief.slug}: ninguna herramienta del brief existe en el directorio`);
    failed++;
    continue;
  }

  const prompt = `Escribe un estudio/comparativa para AgentesVA.
Título: ${brief.tituloSugerido}
Tema: ${brief.tema}
Pregunta que debe responder: ${brief.pregunta}
Puntos a cubrir: ${brief.puntos.join('; ')}

Herramientas del directorio a mencionar (usa estos slugs en los enlaces y NO inventes datos):
${facts
  .map((t) => `- ${t.name} (slug: ${t.slug}) · ${t.cat} · ${t.price} · ${t.long} · Ideal para: ${t.ideal}`)
  .join('\n')}`;

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema,
      system: SYSTEM,
      prompt,
      providerOptions: gatewayOptions(['feature:estudios', `estudio:${brief.slug}`]),
    });

    const data = {
      titulo: brief.tituloSugerido,
      descripcion: object.descripcion,
      tema: brief.tema,
      etiquetas: object.etiquetas,
      herramientas: facts.map((t) => t.slug),
      faq: object.faq,
    };
    const md = frontmatter(data, fechaISO) + object.cuerpo.trim() + '\n';
    writeFileSync(outPath, md);
    done++;
    console.log(`✓ ${brief.slug}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${brief.slug}: ${e.message}`);
  }
}

console.log(`\nHecho: ${done} generados · ${skipped} ya existían · ${failed} fallaron.`);
console.log('Revisa los estudios (docs/blog-fact-checking-protocol.md) y commitea src/content/estudios/*.md.');
