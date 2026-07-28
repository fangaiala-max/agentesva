// scripts/ai/select-noticias.mjs — Etapa B. Lee la cola del día, asigna un
// `tema` provisional por keywords, elige hasta N con diversidad y escribe la
// selección. NO rellena: si hay menos candidatos válidos que N, devuelve menos.
//
// Uso: node scripts/ai/select-noticias.mjs [--date=YYYY-MM-DD] [--n=4]
import { readFileSync, writeFileSync } from 'node:fs';
import { pickDiverse } from './lib/scoring.mjs';

const arg = (name, def) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const DATE = arg('date', new Date().toISOString().slice(0, 10));
const N = Number(arg('n', 4));
const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);

// Mapa keyword → tema (alineado con los `tema` que ya usa el sitio).
const TEMAS = [
  { tema: 'Código', kw: ['code', 'coding', 'developer', 'cursor', 'ide', 'programa'] },
  { tema: 'Asistentes', kw: ['chatgpt', 'assistant', 'asistente', 'copilot', 'claude', 'gemini', 'chatbot'] },
  { tema: 'Automatización', kw: ['agent', 'agente', 'automation', 'automatiz', 'workflow', 'zapier', 'make', 'n8n'] },
  { tema: 'Marketing', kw: ['marketing', 'ads', 'seo', 'content', 'social', 'email'] },
  { tema: 'Vídeo', kw: ['video', 'vídeo', 'avatar', 'clip'] },
  { tema: 'WhatsApp', kw: ['whatsapp', 'mensaj'] },
];

function temaDe(it) {
  const t = `${it.titulo} ${it.resumen}`.toLowerCase();
  for (const { tema, kw } of TEMAS) if (kw.some((k) => t.includes(k))) return tema;
  return 'Actualidad';
}

const queue = JSON.parse(readFileSync(new URL(`${DATE}.json`, queueDir), 'utf8'));
const withTema = (queue.candidates || []).map((it) => ({ ...it, tema: temaDe(it) }));
const selected = pickDiverse(withTema, N);

const outPath = new URL(`${DATE}.selected.json`, queueDir);
writeFileSync(outPath, JSON.stringify({ date: DATE, count: selected.length, selected }, null, 2));
console.log(`[select] ${selected.length}/${N} seleccionadas → docs/content/news-queue/${DATE}.selected.json`);
for (const s of selected) console.log(`  · [${s.tema}] ${s.titulo} (${s.score})`);
