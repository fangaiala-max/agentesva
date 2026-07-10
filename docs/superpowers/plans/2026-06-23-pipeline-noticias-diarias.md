# Pipeline diario de noticias AgentesVA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada día laborable, generar hasta 4 borradores de noticia (IA fresca, viral y relevante para PyMEs) con calidad tom-4pass y abrirlos en un PR para revisión humana.

**Architecture:** 5 etapas dentro del repo — News Radar (RSS + señales HN/Reddit → scoring) → Selección top-4 con diversidad → tom-4pass headless (`claude -p` ejecuta el skill real y escribe los `.md`) → `npm run build` (Zod gate) → PR diario. Orquestado por un cron de GitHub Actions. Lógica pura (scoring/selección) aislada en `scripts/ai/lib/` y testeada con `node:test`; el I/O (feeds, Claude, workflow) se verifica con dry-runs.

**Tech Stack:** Node 20 ESM, `rss-parser`, Vercel AI Gateway (ya presente), Claude Code CLI headless, GitHub Actions, Astro Content Collections (Zod).

**Spec:** `docs/superpowers/specs/2026-06-23-pipeline-noticias-diarias-design.md`

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `scripts/ai/news-sources.json` | Config: feeds RSS, subreddits, pesos de scoring, keywords del lente editorial |
| `scripts/ai/lib/scoring.mjs` | **Puro**: normalización, freshness, score combinado, dedup, selección diversa |
| `scripts/ai/lib/scoring.test.mjs` | Tests `node:test` de la lógica pura |
| `scripts/ai/lib/feeds.mjs` | **I/O**: fetch+parse RSS, señales Hacker News (Algolia) y Reddit |
| `scripts/ai/news-radar.mjs` | Etapa A: orquesta feeds+señales+score+dedup → escribe `news-queue/<fecha>.json` |
| `scripts/ai/select-noticias.mjs` | Etapa B: lee la cola, elige hasta 4 diversas → `news-queue/<fecha>.selected.json` |
| `scripts/ai/build-prompt.mjs` | Construye el prompt tom-4pass por ítem (CLI imprime el prompt; función testeable) |
| `.github/workflows/noticias-diarias.yml` | Cron lun–vie 05:00 UTC; orquesta A→E; abre el PR |
| `docs/content/news-queue/.gitkeep` | Carpeta de colas diarias (auditable) |
| `docs/content/worklogs/.gitkeep` | Carpeta de worklogs tom-4pass (no shipped) |
| `scripts/README-ai.md` | Modificar: documentar el pipeline de noticias |
| `package.json` | Modificar: añadir `rss-parser` (devDep) + scripts `ai:radar`, `ai:select` |

---

## Task 1: Config de fuentes + dependencia RSS

**Files:**
- Modify: `package.json`
- Create: `scripts/ai/news-sources.json`

- [ ] **Step 1: Añadir `rss-parser` como devDependency**

Run desde la raíz del repo:
```bash
npm install --save-dev rss-parser@3
```
Expected: `package.json` lista `"rss-parser": "^3.x"` en `devDependencies` y `package-lock.json` se actualiza.

- [ ] **Step 2: Crear `scripts/ai/news-sources.json`**

```json
{
  "windowHours": 36,
  "weights": { "social": 0.45, "relevance": 0.30, "freshness": 0.15, "authority": 0.10 },
  "minScore": 0.35,
  "feeds": [
    { "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "nombre": "TechCrunch", "authority": 0.9 },
    { "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "nombre": "The Verge", "authority": 0.9 },
    { "url": "https://venturebeat.com/category/ai/feed/", "nombre": "VentureBeat", "authority": 0.8 },
    { "url": "https://www.technologyreview.com/feed/", "nombre": "MIT Technology Review", "authority": 0.95 },
    { "url": "https://www.artificialintelligence-news.com/feed/", "nombre": "AI News", "authority": 0.6 }
  ],
  "subreddits": ["artificial", "ChatGPT", "OpenAI", "smallbusiness", "SaaS"],
  "relevanceKeywords": [
    "chatgpt", "gpt", "claude", "gemini", "copilot", "agent", "agente", "automation",
    "automatiz", "whatsapp", "assistant", "asistente", "no-code", "nocode", "saas",
    "marketing", "crm", "small business", "pyme", "startup", "productivity", "api",
    "free tier", "pricing", "launch", "feature", "tool", "app"
  ],
  "relevanceExclude": ["research paper", "arxiv", "gpu shortage", "datacenter", "chip", "fab", "quantum"]
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json scripts/ai/news-sources.json
git commit -m "feat(noticias): config de fuentes RSS + señales para el news radar"
```

---

## Task 2: Lógica pura de scoring y selección (TDD)

**Files:**
- Create: `scripts/ai/lib/scoring.mjs`
- Test: `scripts/ai/lib/scoring.test.mjs`

- [ ] **Step 1: Escribir los tests que fallan**

```js
// scripts/ai/lib/scoring.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSocial, freshnessScore, relevanceScore, combinedScore,
  dedupeByTitle, pickDiverse, slugify,
} from './scoring.mjs';

test('normalizeSocial satura con log y cae en [0,1]', () => {
  assert.equal(normalizeSocial(0), 0);
  assert.ok(normalizeSocial(500) > normalizeSocial(50));
  assert.ok(normalizeSocial(100000) <= 1);
});

test('freshnessScore: más reciente puntúa más alto', () => {
  const now = new Date('2026-06-23T06:00:00Z');
  const fresh = freshnessScore(new Date('2026-06-23T01:00:00Z'), 36, now);
  const old = freshnessScore(new Date('2026-06-21T18:00:00Z'), 36, now);
  assert.ok(fresh > old);
  assert.equal(freshnessScore(new Date('2026-06-20T00:00:00Z'), 36, now), 0);
});

test('relevanceScore: keyword suma, exclude resta', () => {
  const kw = ['chatgpt', 'pyme'];
  const ex = ['arxiv'];
  assert.ok(relevanceScore('Nuevo ChatGPT para tu PyME', kw, ex) > 0.5);
  assert.equal(relevanceScore('Paper on arxiv about GPUs', kw, ex), 0);
});

test('combinedScore pondera las cuatro señales', () => {
  const w = { social: 0.5, relevance: 0.3, freshness: 0.15, authority: 0.05 };
  const s = combinedScore({ social: 1, relevance: 1, freshness: 1, authority: 1 }, w);
  assert.ok(Math.abs(s - 1) < 1e-9);
});

test('dedupeByTitle quita títulos casi idénticos', () => {
  const items = [
    { titulo: 'OpenAI lanza GPT-6' },
    { titulo: 'OpenAI Lanza GPT-6!!' },
    { titulo: 'Google presenta Gemini 3' },
  ];
  assert.equal(dedupeByTitle(items).length, 2);
});

test('pickDiverse no repite tema y respeta el máximo', () => {
  const items = [
    { titulo: 'a', tema: 'Asistentes', score: 0.9 },
    { titulo: 'b', tema: 'Asistentes', score: 0.85 },
    { titulo: 'c', tema: 'Código', score: 0.8 },
    { titulo: 'd', tema: 'Marketing', score: 0.7 },
  ];
  const picked = pickDiverse(items, 3);
  assert.equal(picked.length, 3);
  assert.deepEqual(picked.map((p) => p.tema), ['Asistentes', 'Código', 'Marketing']);
});

test('slugify produce slug ASCII apto para nombre de fichero', () => {
  assert.equal(slugify('OpenAI lanza GPT-6: ¿qué cambia?'), 'openai-lanza-gpt-6-que-cambia');
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `node --test scripts/ai/lib/scoring.test.mjs`
Expected: FAIL — `Cannot find module './scoring.mjs'`.

- [ ] **Step 3: Implementar `scripts/ai/lib/scoring.mjs`**

```js
// scripts/ai/lib/scoring.mjs — lógica pura, sin I/O. Testeable.

// Señal social (puntos HN + score Reddit) → [0,1] con saturación logarítmica.
export function normalizeSocial(points) {
  if (!points || points <= 0) return 0;
  return Math.min(1, Math.log10(points + 1) / Math.log10(2001)); // ~2000 pts ≈ 1
}

// Frescura lineal dentro de la ventana; 0 fuera de ella.
export function freshnessScore(date, windowHours, now = new Date()) {
  const ageH = (now.getTime() - new Date(date).getTime()) / 3.6e6;
  if (ageH < 0) return 1;
  if (ageH >= windowHours) return 0;
  return 1 - ageH / windowHours;
}

// Relevancia editorial: keywords suman, excludes anulan.
export function relevanceScore(text, keywords, excludes) {
  const t = (text || '').toLowerCase();
  if (excludes.some((e) => t.includes(e.toLowerCase()))) return 0;
  const hits = keywords.filter((k) => t.includes(k.toLowerCase())).length;
  return Math.min(1, hits / 3); // 3+ keywords ⇒ 1
}

export function combinedScore(parts, weights) {
  return (
    parts.social * weights.social +
    parts.relevance * weights.relevance +
    parts.freshness * weights.freshness +
    parts.authority * weights.authority
  );
}

function canonTitle(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function dedupeByTitle(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = canonTitle(it.titulo).split(' ').slice(0, 6).join(' ');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

// Selección diversa: ordena por score desc y evita repetir `tema` hasta agotar temas.
export function pickDiverse(items, max) {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const picked = [];
  const usedThemes = new Set();
  for (const it of sorted) {
    if (picked.length >= max) break;
    if (usedThemes.has(it.tema)) continue;
    picked.push(it);
    usedThemes.add(it.tema);
  }
  // Si no se llenó (pocos temas), completa con los mejores restantes.
  if (picked.length < max) {
    for (const it of sorted) {
      if (picked.length >= max) break;
      if (!picked.includes(it)) picked.push(it);
    }
  }
  return picked;
}

export function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `node --test scripts/ai/lib/scoring.test.mjs`
Expected: PASS — 7 tests ok.

- [ ] **Step 5: Commit**

```bash
git add scripts/ai/lib/scoring.mjs scripts/ai/lib/scoring.test.mjs
git commit -m "feat(noticias): lógica pura de scoring/selección con tests"
```

---

## Task 3: Feeds y señales sociales (I/O)

**Files:**
- Create: `scripts/ai/lib/feeds.mjs`

- [ ] **Step 1: Implementar `scripts/ai/lib/feeds.mjs`**

```js
// scripts/ai/lib/feeds.mjs — I/O de feeds y señales. Tolerante a fallos:
// una fuente caída no rompe el radar.
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 15000 });
const UA = 'AgentesVA-NewsRadar/1.0 (+https://agentesva.com)';

export async function fetchFeed(feed) {
  try {
    const out = await parser.parseURL(feed.url);
    return (out.items || []).map((it) => ({
      titulo: (it.title || '').trim(),
      url: it.link,
      fecha: it.isoDate || it.pubDate || null,
      resumen: (it.contentSnippet || it.summary || '').slice(0, 400),
      fuente: { nombre: feed.nombre, url: feed.url },
      authority: feed.authority ?? 0.5,
    }));
  } catch (err) {
    console.warn(`[feeds] fallo en ${feed.nombre}: ${err.message}`);
    return [];
  }
}

// Hacker News (Algolia): busca el título; devuelve puntos+comentarios del mejor match.
export async function hnSignal(titulo) {
  try {
    const q = encodeURIComponent(titulo.slice(0, 80));
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${q}&tags=story&hitsPerPage=3`, {
      headers: { 'User-Agent': UA },
    });
    if (!r.ok) return 0;
    const data = await r.json();
    const hit = (data.hits || [])[0];
    if (!hit) return 0;
    return (hit.points || 0) + (hit.num_comments || 0);
  } catch {
    return 0;
  }
}

// Reddit: suma de scores de los hilos top de la semana que mencionan el título.
export async function redditSignal(titulo, subreddits) {
  try {
    const q = encodeURIComponent(titulo.slice(0, 80));
    const subs = subreddits.join('+');
    const r = await fetch(
      `https://www.reddit.com/r/${subs}/search.json?q=${q}&restrict_sr=1&sort=top&t=week&limit=5`,
      { headers: { 'User-Agent': UA } },
    );
    if (!r.ok) return 0;
    const data = await r.json();
    const children = data?.data?.children || [];
    return children.reduce((acc, c) => acc + (c.data?.score || 0), 0);
  } catch {
    return 0;
  }
}
```

- [ ] **Step 2: Smoke test manual de feeds**

Run:
```bash
node --input-type=module -e "import('./scripts/ai/lib/feeds.mjs').then(async (m)=>{const it=await m.fetchFeed({url:'https://techcrunch.com/category/artificial-intelligence/feed/',nombre:'TechCrunch',authority:0.9});console.log('items:',it.length);console.log(it[0]?.titulo);console.log('hn:',await m.hnSignal(it[0]?.titulo||'OpenAI'));})"
```
Expected: imprime `items: N` (N>0), un titular, y un número de señal HN (puede ser 0). Si la red falla, repetir; los `catch` devuelven vacío sin tirar el proceso.

- [ ] **Step 3: Commit**

```bash
git add scripts/ai/lib/feeds.mjs
git commit -m "feat(noticias): fetch de RSS + señales HN/Reddit (tolerante a fallos)"
```

---

## Task 4: News Radar (etapa A)

**Files:**
- Create: `scripts/ai/news-radar.mjs`
- Modify: `package.json` (script `ai:radar`)
- Create: `docs/content/news-queue/.gitkeep`

- [ ] **Step 1: Crear carpeta de cola**

```bash
mkdir -p docs/content/news-queue && touch docs/content/news-queue/.gitkeep
```

- [ ] **Step 2: Implementar `scripts/ai/news-radar.mjs`**

```js
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
```

- [ ] **Step 3: Añadir script a `package.json`**

En `"scripts"` añade:
```json
"ai:radar": "node scripts/ai/news-radar.mjs",
"ai:select": "node scripts/ai/select-noticias.mjs"
```

- [ ] **Step 4: Dry-run del radar**

Run: `npm run ai:radar`
Expected: imprime `[radar] N candidatos → docs/content/news-queue/<hoy>.json` y el JSON existe con un array `candidates` ordenado por `score` desc. Inspecciónalo: cada ítem tiene `titulo`, `url`, `fuente`, `signals`, `score`.

- [ ] **Step 5: Commit**

```bash
git add scripts/ai/news-radar.mjs package.json docs/content/news-queue/.gitkeep
git commit -m "feat(noticias): news radar (etapa A) — agrega, puntúa y escribe la cola"
```

---

## Task 5: Selección con diversidad (etapa B)

**Files:**
- Create: `scripts/ai/select-noticias.mjs`

- [ ] **Step 1: Implementar `scripts/ai/select-noticias.mjs`**

```js
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
```

- [ ] **Step 2: Dry-run de selección**

Run: `npm run ai:select`
Expected: imprime hasta 4 líneas `· [tema] titular (score)`, con temas distintos cuando hay variedad, y escribe `<hoy>.selected.json`.

- [ ] **Step 3: Commit**

```bash
git add scripts/ai/select-noticias.mjs
git commit -m "feat(noticias): selección top-N con diversidad de tema (etapa B)"
```

---

## Task 6: Constructor del prompt tom-4pass

**Files:**
- Create: `scripts/ai/build-prompt.mjs`

- [ ] **Step 1: Implementar `scripts/ai/build-prompt.mjs`**

```js
// scripts/ai/build-prompt.mjs — construye el prompt que invoca el skill
// tom-4pass para UNA noticia. CLI: imprime el prompt para el ítem [index] de
// la selección del día, para canalizarlo a `claude -p`.
//
// Uso: node scripts/ai/build-prompt.mjs --date=YYYY-MM-DD --index=0
import { readFileSync } from 'node:fs';

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
  const DATE = arg('date', new Date().toISOString().slice(0, 10));
  const INDEX = Number(arg('index', 0));
  const queueDir = new URL('../../docs/content/news-queue/', import.meta.url);
  const sel = JSON.parse(readFileSync(new URL(`${DATE}.selected.json`, queueDir), 'utf8'));
  const item = sel.selected[INDEX];
  if (!item) process.exit(0); // índice fuera de rango → prompt vacío, el workflow lo salta
  process.stdout.write(buildPrompt(item, DATE));
}
```

- [ ] **Step 2: Verificar el prompt generado**

Run: `node scripts/ai/build-prompt.mjs --index=0`
Expected: imprime el prompt con el titular real, la URL fuente y la ruta `src/content/noticias/<slug>.md`. Con `--index=99` no imprime nada (exit 0).

- [ ] **Step 3: Commit**

```bash
git add scripts/ai/build-prompt.mjs
git commit -m "feat(noticias): constructor del prompt tom-4pass por ítem"
```

---

## Task 7: Workflow de GitHub Actions (etapas C–E)

**Files:**
- Create: `.github/workflows/noticias-diarias.yml`
- Create: `docs/content/worklogs/.gitkeep`

- [ ] **Step 1: Crear carpeta de worklogs**

```bash
mkdir -p docs/content/worklogs && touch docs/content/worklogs/.gitkeep
```

- [ ] **Step 2: Crear `.github/workflows/noticias-diarias.yml`**

```yaml
name: Noticias diarias
on:
  schedule:
    - cron: '0 5 * * 1-5'   # 05:00 UTC = 06:00 Europe/Madrid, lun–vie
  workflow_dispatch: {}      # permite lanzarlo a mano para probar

permissions:
  contents: write
  pull-requests: write

jobs:
  noticias:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      AI_GATEWAY_API_KEY: ${{ secrets.AI_GATEWAY_API_KEY }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - run: npm ci

      - name: Instalar Claude Code CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Variables de fecha y rama
        id: vars
        run: |
          echo "date=$(date -u +%F)" >> "$GITHUB_OUTPUT"
          echo "branch=noticias/auto-$(date -u +%F)" >> "$GITHUB_OUTPUT"

      - name: Etapa A — News radar
        run: node scripts/ai/news-radar.mjs --date=${{ steps.vars.outputs.date }}

      - name: Etapa B — Selección
        run: node scripts/ai/select-noticias.mjs --date=${{ steps.vars.outputs.date }} --n=4

      - name: Etapa C — Redacción tom-4pass (headless)
        run: |
          DATE=${{ steps.vars.outputs.date }}
          COUNT=$(node -e "console.log(require('./docs/content/news-queue/'+process.env.DATE+'.selected.json').count)" 2>/dev/null || echo 0)
          echo "Seleccionadas: $COUNT"
          for i in $(seq 0 $((COUNT-1))); do
            PROMPT=$(node scripts/ai/build-prompt.mjs --date="$DATE" --index="$i")
            [ -z "$PROMPT" ] && continue
            echo "::group::Noticia $i"
            claude -p "$PROMPT" \
              --allowedTools "WebSearch,WebFetch,Read,Write,Edit,Glob,Grep" \
              --permission-mode acceptEdits || echo "Fallo en noticia $i (continúa)"
            echo "::endgroup::"
          done
        env:
          DATE: ${{ steps.vars.outputs.date }}

      - name: Etapa D — Validación (Zod build)
        id: build
        run: npm run build
        continue-on-error: true

      - name: Etapa E — Abrir PR
        if: ${{ hashFiles('src/content/noticias/**') != '' }}
        env:
          GH_TOKEN: ${{ github.token }}
          DRAFT: ${{ steps.build.outcome == 'failure' && '--draft' || '' }}
        run: |
          DATE=${{ steps.vars.outputs.date }}
          BRANCH=${{ steps.vars.outputs.branch }}
          git config user.name "agentesva-bot"
          git config user.email "bot@agentesva.com"
          git checkout -b "$BRANCH"
          git add src/content/noticias/ docs/content/
          if git diff --cached --quiet; then echo "Sin cambios; no se abre PR."; exit 0; fi
          git commit -m "feat(noticias): borradores automáticos $DATE"
          git push -u origin "$BRANCH"
          BODY=$(node scripts/ai/pr-body.mjs --date="$DATE")
          gh pr create --title "📰 Noticias diarias — $DATE" --body "$BODY" \
            --label noticias --label automated $DRAFT
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/noticias-diarias.yml docs/content/worklogs/.gitkeep
git commit -m "feat(noticias): workflow cron lun-vie con tom-4pass headless + PR"
```

---

## Task 8: Cuerpo del PR con checklist Pass-4

**Files:**
- Create: `scripts/ai/pr-body.mjs`

- [ ] **Step 1: Implementar `scripts/ai/pr-body.mjs`**

```js
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
```

- [ ] **Step 2: Verificar el cuerpo del PR**

Run (necesita una selección del día existente): `node scripts/ai/pr-body.mjs`
Expected: imprime Markdown con una sección por noticia seleccionada y los checkboxes Pass-4.

- [ ] **Step 3: Commit**

```bash
git add scripts/ai/pr-body.mjs
git commit -m "feat(noticias): cuerpo de PR con checklist Pass-4 y aviso SIN VERIFICAR"
```

---

## Task 9: Documentación y configuración del secret

**Files:**
- Modify: `scripts/README-ai.md`

- [ ] **Step 1: Añadir sección al `scripts/README-ai.md`**

Añade al final:
```markdown
## Noticias diarias (automatización)

`ai:radar` + `ai:select` alimentan el workflow `.github/workflows/noticias-diarias.yml`
(cron lun–vie 06:00 Madrid). El workflow ejecuta el skill **tom-4pass** vía
`claude -p` por cada noticia seleccionada, valida con `npm run build` y abre un PR
para revisión humana (Pass 4). Nunca publica directo; nunca rellena en días flojos.

- Probar localmente: `npm run ai:radar && npm run ai:select`
- Lanzar el workflow a mano: pestaña **Actions → Noticias diarias → Run workflow**.
- Secret requerido: `ANTHROPIC_API_KEY` (Settings → Secrets → Actions).
- Ajustar fuentes/pesos/umbral: `scripts/ai/news-sources.json`.
```

- [ ] **Step 2: Configurar el secret en GitHub (manual, una vez)**

En GitHub → repo `agentesva` → Settings → Secrets and variables → Actions → New repository secret:
- Name: `ANTHROPIC_API_KEY`, Value: tu API key de Claude.

Expected: el secret aparece listado. (No se puede verificar por código; confirmación manual.)

- [ ] **Step 3: Commit**

```bash
git add scripts/README-ai.md
git commit -m "docs(noticias): documentar el pipeline diario de noticias"
```

---

## Task 10: Verificación end-to-end (dry run del workflow)

- [ ] **Step 1: Ejecutar el pipeline local completo (sin Claude)**

```bash
npm run ai:radar && npm run ai:select && node scripts/ai/pr-body.mjs
```
Expected: cola escrita, hasta 4 seleccionadas con temas diversos, y un cuerpo de PR coherente.

- [ ] **Step 2: Probar la etapa C con UN ítem (coste real de Claude)**

```bash
PROMPT=$(node scripts/ai/build-prompt.mjs --index=0)
claude -p "$PROMPT" --allowedTools "WebSearch,WebFetch,Read,Write,Edit,Glob,Grep" --permission-mode acceptEdits
```
Expected: se crea `src/content/noticias/<slug>.md` (frontmatter válido + cuerpo en español con voz editorial) y `docs/content/worklogs/<slug>.md`. Revisa que `herramientas[]` use slugs reales de `src/content/tools/`.

- [ ] **Step 3: Validar el build**

Run: `npm run build`
Expected: PASS, 0 errores de schema. Si falla, corrige el frontmatter generado y re-ejecuta.

- [ ] **Step 4: Lanzar el workflow a mano y revisar el PR**

En GitHub → Actions → "Noticias diarias" → Run workflow. Espera el PR `📰 Noticias diarias — <fecha>`. Verifica: hasta 4 ficheros, build verde (PR ready) o draft con error, y el checklist Pass-4 en el cuerpo.

- [ ] **Step 5: Commit de cierre (limpieza de artefactos de prueba si procede)**

```bash
git add -A
git commit -m "chore(noticias): verificación end-to-end del pipeline" || echo "nada que commitear"
```

---

## Self-Review (cobertura del spec)

- §5 Arquitectura 5 etapas → Tasks 4 (A), 5 (B), 7 (C/D/E), 8 (PR body). ✔
- §6A radar (RSS+señales+score+dedup+anti-canibalización) → Tasks 1–4. ✔
- §6B selección con diversidad, sin relleno → Task 5 (`pickDiverse`, count real). ✔
- §6C tom-4pass headless con slugs reales → Tasks 6–7 (prompt + `claude -p`). ✔
- §6D validación `npm run build` → Task 7 step build + Task 10 step 3. ✔
- §6E PR con checklist Pass-4 + draft si falla build → Tasks 7–8. ✔
- §7 cron lun–vie 05:00 UTC, secret `ANTHROPIC_API_KEY`, días flojos → Task 7 cron, Task 9 secret, Task 5 sin relleno. ✔
- §8 archivos nuevos → cubiertos; `pr-body.mjs` añadido (no estaba en la lista del spec, mejora la etapa E). ✔
- §9 criterios de éxito → Task 10 los verifica. ✔
