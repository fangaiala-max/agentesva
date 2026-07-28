// scripts/ai/news-radar.mjs — Etapa A. Agrega feeds, enriquece con señales
// sociales, puntúa, deduplica contra noticias existentes y escribe la cola.
//
// Uso: node scripts/ai/news-radar.mjs [--date=YYYY-MM-DD] [--top=10]
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fetchFeed, hnSignal, redditSignal } from './lib/feeds.mjs';
import {
  normalizeSocial, freshnessScore, relevanceScore, combinedScore, dedupeByTitle, slugify,
} from './lib/scoring.mjs';

const cfg = JSON.parse(readFileSync(new URL('./news-sources.json', import.meta.url), 'utf8'));
const arg = (name, def) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const DATE = arg('date', new Date().toISOString().slice(0, 10));
const TOP = Number(arg('top', 10));
const now = new Date();

const noticiasDir = new URL('../../src/content/noticias/', import.meta.url);
const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);

// Títulos ya publicados → anti-canibalización.
function existingTitles() {
  const out = [];
  for (const f of readdirSync(noticiasDir)) {
    if (!f.endsWith('.md')) continue;
    const m = readFileSync(new URL(f, noticiasDir), 'utf8').match(/^titulo:\s*["']?(.+?)["']?\s*$/m);
    if (m) out.push(m[1].toLowerCase());
  }
  return out;
}

const published = existingTitles();

// 1) Recolectar feeds (en paralelo, tolerante a fallos).
const raw = (await Promise.all(cfg.feeds.map(fetchFeed))).flat();

// 2) Filtrar por ventana de frescura y relevancia editorial mínima.
const fresh = raw.filter((it) => {
  if (!it.fecha || !it.titulo || !it.url) return false;
  if (freshnessScore(it.fecha, cfg.windowHours, now) <= 0) return false;
  if (relevanceScore(`${it.titulo} ${it.resumen}`, cfg.relevanceKeywords, cfg.relevanceExclude) <= 0) return false;
  if (published.some((p) => p.includes(it.titulo.toLowerCase().slice(0, 25)))) return false;
  return true;
});

const deduped = dedupeByTitle(fresh);

// 3) Enriquecer con señales sociales (secuencial para no abusar de las APIs).
const scored = [];
for (const it of deduped) {
  const hn = await hnSignal(it.titulo);
  const rd = await redditSignal(it.titulo, cfg.subreddits);
  const parts = {
    social: normalizeSocial(hn + rd),
    relevance: relevanceScore(`${it.titulo} ${it.resumen}`, cfg.relevanceKeywords, cfg.relevanceExclude),
    freshness: freshnessScore(it.fecha, cfg.windowHours, now),
    authority: it.authority,
  };
  scored.push({
    titulo: it.titulo,
    url: it.url,
    fecha: it.fecha,
    resumen: it.resumen,
    fuente: it.fuente,
    slugSugerido: slugify(it.titulo),
    signals: { hn, reddit: rd, ...parts },
    score: Number(combinedScore(parts, cfg.weights).toFixed(4)),
  });
}

const ranked = scored
  .filter((it) => it.score >= cfg.minScore)
  .sort((a, b) => b.score - a.score)
  .slice(0, TOP);

if (!existsSync(queueDir)) mkdirSync(queueDir, { recursive: true });
const outPath = new URL(`${DATE}.json`, queueDir);
writeFileSync(outPath, JSON.stringify({ date: DATE, generatedAt: now.toISOString(), candidates: ranked }, null, 2));
console.log(`[radar] ${ranked.length} candidatos → docs/content/news-queue/${DATE}.json`);
