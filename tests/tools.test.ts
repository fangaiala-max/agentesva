import { describe, expect, it } from 'vitest';
import { badgesFor, fallbackFaqs, getAlternatives, PRICE_COLOR, priceRank, toolsClaim, type Tool } from '../src/data/tools';

const tool = (over: Partial<Tool>): Tool => ({
  slug: 'demo',
  name: 'Demo',
  cat: 'Asistentes',
  desc: 'desc',
  price: 'Gratis',
  rating: '4.5',
  color: '#000000',
  tagline: 'tag',
  ideal: 'pymes',
  url: 'https://example.com',
  long: 'descripción larga',
  features: ['f1'],
  steps: ['paso 1', 'paso 2'],
  orden: 1,
  ...over,
});

describe('fallbackFaqs', () => {
  it('genera 4 FAQs derivadas de los datos', () => {
    const faqs = fallbackFaqs(tool({ name: 'Demo' }));
    expect(faqs).toHaveLength(4);
    expect(faqs[0].q).toBe('¿Qué es Demo y para qué sirve?');
    expect(faqs[0].a).toBe('descripción larga');
    expect(faqs[3].a).toBe('paso 1 paso 2');
  });

  it('adapta la respuesta de precio a cada modelo', () => {
    expect(fallbackFaqs(tool({ price: 'Gratis' }))[1].a).toContain('se puede usar gratis');
    expect(fallbackFaqs(tool({ price: 'Freemium' }))[1].a).toContain('plan gratuito');
    expect(fallbackFaqs(tool({ price: 'Pago' }))[1].a).toContain('de pago');
  });
});

describe('getAlternatives', () => {
  const all = [
    tool({ slug: 'a', cat: 'Asistentes' }),
    tool({ slug: 'b', cat: 'Asistentes' }),
    tool({ slug: 'c', cat: 'Asistentes' }),
    tool({ slug: 'd', cat: 'Asistentes' }),
    tool({ slug: 'e', cat: 'Vídeo' }),
  ];

  it('devuelve misma categoría, excluye la propia y limita a 3', () => {
    const alts = getAlternatives(all, all[0]);
    expect(alts.map((t) => t.slug)).toEqual(['b', 'c', 'd']);
  });

  it('no cruza categorías', () => {
    expect(getAlternatives(all, all[4])).toEqual([]);
  });
});

describe('PRICE_COLOR', () => {
  it('cubre los tres precios con tokens del sistema (un solo sitio de verdad)', () => {
    expect(PRICE_COLOR.Gratis).toBe('var(--green)');
    expect(PRICE_COLOR.Freemium).toBe('var(--accent)');
    expect(PRICE_COLOR.Pago).toBe('var(--fg-3)');
  });
});

describe('priceRank', () => {
  it('ordena Gratis < Freemium < Pago', () => {
    expect([priceRank('Pago'), priceRank('Gratis'), priceRank('Freemium')]).toEqual([2, 0, 1]);
  });
});

describe('toolsClaim', () => {
  it('redondea a la baja a decenas y nunca dice "+0"', () => {
    expect(toolsClaim(54)).toBe(50);
    expect(toolsClaim(120)).toBe(120);
    expect(toolsClaim(10)).toBe(10);
    expect(toolsClaim(9)).toBe(9);
    expect(toolsClaim(0)).toBe(0);
  });
});

describe('badgesFor', () => {
  const NOW = new Date('2026-07-20T00:00:00.000Z');

  it('sin campos → sin badges', () => {
    expect(badgesFor(tool({}), NOW)).toEqual([]);
  });

  it('destacado → badge editor', () => {
    expect(badgesFor(tool({ destacado: true }), NOW)).toEqual([{ kind: 'editor', label: '★ Editor' }]);
  });

  it('popular → badge popular', () => {
    expect(badgesFor(tool({ popular: true }), NOW)).toEqual([{ kind: 'popular', label: 'Popular' }]);
  });

  it('price Freemium → badge "Plan gratis"; Gratis y Pago no lo emiten', () => {
    expect(badgesFor(tool({ price: 'Freemium' }), NOW)).toContainEqual({ kind: 'free', label: 'Plan gratis' });
    expect(badgesFor(tool({ price: 'Gratis' }), NOW).some((b) => b.kind === 'free')).toBe(false);
    expect(badgesFor(tool({ price: 'Pago' }), NOW).some((b) => b.kind === 'free')).toBe(false);
  });

  it('addedAt dentro de 30 días → badge Nuevo; más antiguo → no', () => {
    expect(badgesFor(tool({ addedAt: new Date('2026-07-05T00:00:00.000Z') }), NOW).some((b) => b.kind === 'nuevo')).toBe(true);
    expect(badgesFor(tool({ addedAt: new Date('2026-05-01T00:00:00.000Z') }), NOW).some((b) => b.kind === 'nuevo')).toBe(false);
  });

  it('orden estable: editor, popular, free, nuevo', () => {
    const b = badgesFor(tool({ destacado: true, popular: true, price: 'Freemium', addedAt: NOW }), NOW);
    expect(b.map((x) => x.kind)).toEqual(['editor', 'popular', 'free', 'nuevo']);
  });
});
