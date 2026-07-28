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
      signal: AbortSignal.timeout(7000),
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
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(7000) },
    );
    if (!r.ok) return 0;
    const data = await r.json();
    const children = data?.data?.children || [];
    return children.reduce((acc, c) => acc + (c.data?.score || 0), 0);
  } catch {
    return 0;
  }
}
