// scripts/ai/pr-body.mjs — genera el cuerpo del PR: por noticia, su fuente,
// score y un checklist Pass-4 para la revisión humana. Lee los worklogs y
// resalta cualquier [SIN VERIFICAR].
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const DATE = arg('date', new Date().toISOString().slice(0, 10));
const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);
const worklogDir = new URL('../../docs/content/worklogs/', import.meta.url);

let selected = [];
try {
  selected = JSON.parse(readFileSync(new URL(`${DATE}.selected.json`, queueDir), 'utf8')).selected;
} catch { /* sin selección */ }

const lines = [
  `Borradores automáticos del **${DATE}** generados con tom-4pass headless.`,
  ``,
  `## Revisión (Pass 4 — verificación humana)`,
  `Para cada noticia: verifica los datos **Tier-B** (números, precios, fechas) contra su fuente oficial, confirma cualquier **Tier-A** (legal/subvenciones), y revisa la voz editorial. Mergea cuando esté limpio.`,
  ``,
];

for (const s of selected) {
  const wl = new URL(`${s.slugSugerido}.md`, worklogDir);
  const unverified = existsSync(wl) && readFileSync(wl, 'utf8').includes('[SIN VERIFICAR]');
  lines.push(`### ${s.titulo}`);
  lines.push(`- Fuente: [${s.fuente?.nombre}](${s.url}) · Tema: ${s.tema} · Score: ${s.score}`);
  lines.push(`- Fichero: \`src/content/noticias/${s.slugSugerido}.md\``);
  lines.push(`- [ ] Datos Tier-B verificados con fuente + fecha`);
  lines.push(`- [ ] Sin superlativos sin fuente / voz editorial OK`);
  if (unverified) lines.push(`- ⚠️ **Contiene \`[SIN VERIFICAR]\` — revisar el worklog antes de mergear**`);
  lines.push('');
}

const built = readdirSync(new URL('../../src/content/noticias/', import.meta.url)).filter((f) => f.endsWith('.md'));
lines.push(`---`, `Total noticias en la colección tras este PR: ${built.length}.`);
process.stdout.write(lines.join('\n'));
