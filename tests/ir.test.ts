import { describe, expect, it } from 'vitest';
import { affiliateHref, sanitizeSrc, pickToolDest, buildClickLog } from '../src/data/ir';

describe('affiliateHref', () => {
  it('construye /ir/{slug}?src={src}', () => {
    expect(affiliateHref('notion-ai', 'ficha-hero')).toBe('/ir/notion-ai?src=ficha-hero');
  });
  it('codifica el src', () => {
    expect(affiliateHref('x', 'a b')).toBe('/ir/x?src=a%20b');
  });
});

describe('sanitizeSrc', () => {
  it('acepta placements conocidos (minúsculas, dígitos, guiones)', () => {
    expect(sanitizeSrc('ficha-sticky')).toBe('ficha-sticky');
    expect(sanitizeSrc('card-home')).toBe('card-home');
  });
  it('rechaza null, vacío y basura', () => {
    expect(sanitizeSrc(null)).toBeNull();
    expect(sanitizeSrc('')).toBeNull();
    expect(sanitizeSrc('DROP TABLE')).toBeNull();
    expect(sanitizeSrc('a'.repeat(41))).toBeNull();
  });
});

describe('pickToolDest', () => {
  it('usa affiliateUrl cuando existe (hasAffiliate true)', () => {
    expect(pickToolDest({ url: 'https://o.com', affiliateUrl: 'https://a.com?ref=x' }))
      .toEqual({ dest: 'https://a.com?ref=x', hasAffiliate: true });
  });
  it('cae a url oficial cuando no hay afiliado (hasAffiliate false)', () => {
    expect(pickToolDest({ url: 'https://o.com' }))
      .toEqual({ dest: 'https://o.com', hasAffiliate: false });
  });
});

describe('buildClickLog', () => {
  it('produce el payload estructurado del click', () => {
    expect(buildClickLog({
      type: 'tool', slug: 'notion-ai', dest: 'https://a.com',
      hasAffiliate: true, src: 'ficha-hero', referer: 'https://agentesva.com/',
      ts: '2026-07-20T00:00:00.000Z',
    })).toEqual({
      evt: 'ir_click', ts: '2026-07-20T00:00:00.000Z', type: 'tool',
      slug: 'notion-ai', hasAffiliate: true, src: 'ficha-hero',
      referer: 'https://agentesva.com/', dest: 'https://a.com',
    });
  });
});
