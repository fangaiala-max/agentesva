import { describe, it, expect } from 'vitest';
import {
  normalizeSocial, freshnessScore, relevanceScore, combinedScore,
  dedupeByTitle, pickDiverse, slugify,
} from '../scripts/ai/lib/scoring.mjs';

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
