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
