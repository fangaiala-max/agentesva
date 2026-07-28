// scripts/ai/build-prompt.mjs — construye el prompt que invoca el skill
// tom-4pass para UNA noticia. CLI: imprime el prompt para el ítem [index] de
// la selección del día, para canalizarlo a `claude -p`.
//
// Uso: node scripts/ai/build-prompt.mjs --date=YYYY-MM-DD --index=0
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function buildPrompt(item, fecha) {
  return [
    `Usa el skill tom-4pass para redactar UNA noticia (formato \`noticia\`) de AgentesVA en español.`,
    ``,
    `Tema candidato (fuente primaria a atribuir y resumir, NUNCA copiar):`,
    `- Titular original: ${item.titulo}`,
    `- URL fuente: ${item.url}`,
    `- Medio: ${item.fuente?.nombre}`,
    `- Tema sugerido: ${item.tema}`,
    `- Señales: HN=${item.signals?.hn ?? 0}, Reddit=${item.signals?.reddit ?? 0}`,
    ``,
    `Requisitos de salida (obligatorios):`,
    `1. Ejecuta los 4 pasos de tom-4pass. Research real de la fuente con WebSearch/WebFetch; verifica cada dato Tier-B con su URL oficial + fecha.`,
    `2. Escribe el fichero en \`src/content/noticias/${item.slugSugerido}.md\` con el frontmatter del schema noticia: titulo, descripcion, fecha: ${fecha}, tema, etiquetas, fuente {nombre, url}, herramientas.`,
    `3. \`herramientas[]\` SOLO con slugs que existan como fichero en \`src/content/tools/\`. Enlaza cada herramienta mencionada como [Nombre](/herramienta/<slug>).`,
    `4. Voz editorial AgentesVA (humano, directo, sin humo). Cierra con línea "Fuente: …".`,
    `5. Deja un worklog en \`docs/content/worklogs/${item.slugSugerido}.md\` con la tabla claim→fuente→tier y cualquier [SIN VERIFICAR].`,
    `6. NO hagas commit. Solo escribe los ficheros.`,
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
  const DATE = arg('date', new Date().toISOString().slice(0, 10));
  const INDEX = Number(arg('index', 0));
  const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);
  const sel = JSON.parse(readFileSync(new URL(`${DATE}.selected.json`, queueDir), 'utf8'));
  const item = sel.selected[INDEX];
  if (!item) process.exit(0); // índice fuera de rango → prompt vacío, el workflow lo salta
  process.stdout.write(buildPrompt(item, DATE));
}
