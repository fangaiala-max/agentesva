import { describe, it, expect } from 'vitest';
import {
  normalizeSocial, freshnessScore, relevanceScore, combinedScore,
  dedupeByTitle, pickDiverse, slugify, normalizeUrl, dedupeBySourceUrl,
} from '../scripts/ai/lib/scoring.mjs';
import { buildPrompt } from '../scripts/ai/build-prompt.mjs';

describe('scoring', () => {
  it('normalizeSocial satura con log y cae en [0,1]', () => {
    expect(normalizeSocial(0)).toBe(0);
    expect(normalizeSocial(500)).toBeGreaterThan(normalizeSocial(50));
    expect(normalizeSocial(100000)).toBeLessThanOrEqual(1);
  });

  it('freshnessScore: más reciente puntúa más alto', () => {
    const now = new Date('2026-06-23T06:00:00Z');
    const fresh = freshnessScore(new Date('2026-06-23T01:00:00Z'), 36, now);
    const old = freshnessScore(new Date('2026-06-21T18:00:00Z'), 36, now);
    expect(fresh).toBeGreaterThan(old);
    expect(freshnessScore(new Date('2026-06-20T00:00:00Z'), 36, now)).toBe(0);
  });

  it('relevanceScore: keyword suma, exclude resta', () => {
    const kw = ['chatgpt', 'pyme'];
    const ex = ['arxiv'];
    expect(relevanceScore('Nuevo ChatGPT para tu PyME', kw, ex)).toBeGreaterThan(0.5);
    expect(relevanceScore('Paper on arxiv about GPUs', kw, ex)).toBe(0);
  });

  it('combinedScore pondera las cuatro señales', () => {
    const w = { social: 0.5, relevance: 0.3, freshness: 0.15, authority: 0.05 };
    const s = combinedScore({ social: 1, relevance: 1, freshness: 1, authority: 1 }, w);
    expect(Math.abs(s - 1)).toBeLessThan(1e-9);
  });

  it('dedupeByTitle quita títulos casi idénticos', () => {
    const items = [
      { titulo: 'OpenAI lanza GPT-6' },
      { titulo: 'OpenAI Lanza GPT-6!!' },
      { titulo: 'Google presenta Gemini 3' },
    ];
    expect(dedupeByTitle(items).length).toBe(2);
  });

  it('pickDiverse no repite tema y respeta el máximo', () => {
    const items = [
      { titulo: 'a', tema: 'Asistentes', score: 0.9 },
      { titulo: 'b', tema: 'Asistentes', score: 0.85 },
      { titulo: 'c', tema: 'Código', score: 0.8 },
      { titulo: 'd', tema: 'Marketing', score: 0.7 },
    ];
    const picked = pickDiverse(items, 3);
    expect(picked.length).toBe(3);
    expect(picked.map((p) => p.tema)).toEqual(['Asistentes', 'Código', 'Marketing']);
  });

  it('slugify produce slug ASCII apto para nombre de fichero', () => {
    expect(slugify('OpenAI lanza GPT-6: ¿qué cambia?')).toBe('openai-lanza-gpt-6-que-cambia');
  });
});

describe('normalizeUrl', () => {
  it('ignora protocolo, www, barra final y fragmento', () => {
    const base = normalizeUrl('https://techcrunch.com/2026/07/27/psa-claude/');
    expect(normalizeUrl('http://www.techcrunch.com/2026/07/27/psa-claude')).toBe(base);
    expect(normalizeUrl('https://techcrunch.com/2026/07/27/psa-claude/#comments')).toBe(base);
  });

  it('ignora los parámetros de campaña pero conserva los de contenido', () => {
    const base = normalizeUrl('https://ejemplo.com/post');
    expect(normalizeUrl('https://ejemplo.com/post?utm_source=rss&utm_medium=feed')).toBe(base);
    expect(normalizeUrl('https://ejemplo.com/post?id=7')).not.toBe(base);
  });

  it('distingue artículos distintos del mismo medio', () => {
    expect(normalizeUrl('https://tc.com/a')).not.toBe(normalizeUrl('https://tc.com/b'));
  });

  it('no revienta con basura', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl(undefined)).toBe('');
    expect(normalizeUrl('no-es-una-url')).toBe('no-es-una-url');
  });
});

describe('dedupeBySourceUrl', () => {
  const publicadas = ['https://techcrunch.com/2026/07/27/psa-claude/'];

  it('descarta el candidato cuya fuente ya está publicada', () => {
    // Caso real: el radar reofreció la historia de los chats de Claude en Google
    // un día después de publicarla. El titular inglés no se parece en nada al
    // título español, así que solo la URL puede detectarlo.
    const items = [
      { titulo: 'PSA: Your Claude shared chats may have ended up on Google', url: 'https://techcrunch.com/2026/07/27/psa-claude' },
      { titulo: 'Otra noticia distinta', url: 'https://tc.com/otra' },
    ];
    const out = dedupeBySourceUrl(items, publicadas);
    expect(out.map((i) => i.url)).toEqual(['https://tc.com/otra']);
  });

  it('conserva todo cuando no hay nada publicado', () => {
    const items = [{ titulo: 'A', url: 'https://a.com/1' }];
    expect(dedupeBySourceUrl(items, [])).toHaveLength(1);
  });

  it('tolera candidatos sin url y publicadas vacías', () => {
    const items = [{ titulo: 'sin url' }, { titulo: 'B', url: 'https://b.com/1' }];
    expect(dedupeBySourceUrl(items, ['', undefined])).toHaveLength(2);
  });
});

describe('buildPrompt', () => {
  const item = {
    titulo: 'PSA: Your Claude shared chats may have ended up on Google',
    url: 'https://techcrunch.com/2026/07/27/psa-claude/',
    fuente: { nombre: 'TechCrunch' },
    tema: 'Asistentes',
    slugSugerido: 'psa-your-claude-shared-chats-may-have-ended-up-on-google',
    signals: { hn: 34, reddit: 0 },
  };

  it('no impone el slug derivado del titular inglés como ruta de salida', () => {
    const p = buildPrompt(item, '2026-07-28');
    expect(p).not.toContain(`src/content/noticias/${item.slugSugerido}.md`);
    expect(p).not.toContain(`docs/content/worklogs/${item.slugSugerido}.md`);
  });

  it('pide derivar el slug del título en español', () => {
    const p = buildPrompt(item, '2026-07-28');
    expect(p).toContain('src/content/noticias/<slug>.md');
    expect(p).toMatch(/slug.*título en español|título en español.*slug/is);
  });

  it('conserva la fuente a atribuir y la fecha', () => {
    const p = buildPrompt(item, '2026-07-28');
    expect(p).toContain(item.url);
    expect(p).toContain('TechCrunch');
    expect(p).toContain('2026-07-28');
  });

  it('numera los requisitos sin saltos ni repeticiones', () => {
    const nums = [...buildPrompt(item, '2026-07-28').matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
