// scripts/ai/pr-body.mjs — genera el cuerpo del PR de CANDIDATOS del día.
// No hay redacción automática: lista los candidatos y, por cada uno, el comando
// que genera el prompt tom-4pass para escribir la noticia en una sesión de
// Claude Code. La redacción y la verificación (Pass 4) las hace un humano.
import { readFileSync } from 'node:fs';

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const DATE = arg('date', new Date().toISOString().slice(0, 10));
const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);

let selected = [];
try {
  selected = JSON.parse(readFileSync(new URL(`${DATE}.selected.json`, queueDir), 'utf8')).selected;
} catch { /* sin selección */ }

const lines = [
  `Candidatos de noticia del **${DATE}** (radar RSS + señales sociales). **Sin redacción automática.**`,
  ``,
  `## Cómo escribirlas (sesión de Claude Code, tom-4pass)`,
  `1. \`git fetch && git checkout noticias/candidatos-${DATE}\``,
  `2. Por cada candidato, en una sesión de Claude Code:`,
  `   \`\`\`bash`,
  `   node scripts/ai/build-prompt.mjs --date=${DATE} --index=<i>   # imprime el prompt tom-4pass`,
  `   \`\`\``,
  `   Ejecuta el skill **tom-4pass** con ese prompt → escribe \`src/content/noticias/<slug>.md\`.`,
  `3. \`npm run build\` (0 errores), marca el PR como *ready* y revisa (Pass 4) antes de mergear.`,
  ``,
  `> Nada se publica solo. En días flojos hay menos de 4 candidatos (o ninguno) — sin relleno.`,
  ``,
  `## Candidatos`,
  ``,
];

selected.forEach((s, i) => {
  lines.push(`### ${i}. ${s.titulo}`);
  lines.push(`- Fuente: [${s.fuente?.nombre ?? 'fuente'}](${s.url}) · Tema: ${s.tema} · Score: ${s.score}`);
  lines.push(`- Prompt: \`node scripts/ai/build-prompt.mjs --date=${DATE} --index=${i}\``);
  lines.push(`- [ ] Escrita con tom-4pass`);
  lines.push(`- [ ] Datos Tier-B verificados (fuente + fecha) · voz editorial OK`);
  lines.push('');
});

process.stdout.write(lines.join('\n'));
