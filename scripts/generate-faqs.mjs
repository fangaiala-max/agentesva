// Genera FAQs originales en español por herramienta vía Vercel AI Gateway y las
// escribe en la colección `tools` (campo `faq`). Las fichas las renderizan
// (visibles) + emiten FAQPage (GEO/AEO). Si una herramienta ya tiene `faq`,
// se salta salvo --force.
//
// Uso:  npm run ai:faqs                 (todas las que no tengan FAQ)
//       npm run ai:faqs -- --force      (regenera todas)
//       npm run ai:faqs -- --only=cursor,make
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { generateObject } from 'ai';
import { z } from 'zod';
import { MODEL, gatewayOptions, assertAuth } from './ai/gateway.mjs';

assertAuth();

const FORCE = process.argv.includes('--force');
const ONLY = (process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] || '')
  .split(',')
  .filter(Boolean);

const dir = new URL('../src/content/tools/', import.meta.url);

const faqSchema = z.object({
  faq: z
    .array(
      z.object({
        q: z.string().describe('Pregunta frecuente en español, natural, como la buscaría un dueño de PyME'),
        a: z.string().describe('Respuesta clara y breve (1-3 frases), original, sin tecnicismos, basada SOLO en los datos dados'),
      }),
    )
    .length(4),
});

const SYSTEM = `Eres editor de AgentesVA, un directorio de herramientas de IA en español para PyMEs y autónomos (España + LATAM).
Voz de marca: práctica, clara, directa, sin tecnicismos, sin humo; tuteo; español neutro.
Escribe FAQs ORIGINALES en español. NO inventes funciones, datos ni precios: usa SOLO la información proporcionada.
Pensadas para resolver dudas reales de compra/uso y para aparecer en respuestas de IA (ChatGPT/Perplexity).`;

const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
let done = 0,
  skipped = 0,
  failed = 0;

for (const file of files) {
  const slug = file.replace('.json', '');
  if (ONLY.length && !ONLY.includes(slug)) continue;

  const path = new URL(file, dir);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (data.faq?.length && !FORCE) {
    skipped++;
    continue;
  }

  const prompt = `Genera 4 preguntas frecuentes para esta herramienta de IA.
Nombre: ${data.name}
Categoría: ${data.cat}
Precio: ${data.price}
Qué es: ${data.long}
Para qué sirve: ${data.features.join('; ')}
Cómo se usa: ${data.steps.join('; ')}
Ideal para: ${data.ideal}
Sitio oficial: ${data.url}`;

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: faqSchema,
      system: SYSTEM,
      prompt,
      providerOptions: gatewayOptions(['feature:tool-faqs', `tool:${slug}`]),
    });
    data.faq = object.faq;
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    done++;
    console.log(`✓ ${slug}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${slug}: ${e.message}`);
  }
}

console.log(`\nHecho: ${done} generadas · ${skipped} ya tenían FAQ · ${failed} fallaron.`);
console.log('Revisa las FAQs (docs/blog-fact-checking-protocol.md) y commitea src/content/tools/*.json.');
