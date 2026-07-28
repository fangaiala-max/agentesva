import { describe, it, expect } from 'vitest';
import { compraUrlDeItem, COMPRA_URLS } from '../src/data/biblioteca/compra-urls';
import { ITEMS } from '../src/data/biblioteca';

describe('compraUrlDeItem', () => {
  it('devuelve undefined para un id sin Payment Link', () => {
    expect(compraUrlDeItem('id-que-no-existe')).toBeUndefined();
  });

  it('cada entrada de COMPRA_URLS corresponde a un Item real y a una URL de Stripe', () => {
    for (const [id, url] of Object.entries(COMPRA_URLS)) {
      expect(ITEMS.some((i) => i.id === id), `${id} no es un Item real`).toBe(true);
      expect(url.startsWith('https://buy.stripe.com/'), `${id}: ${url}`).toBe(true);
      expect(compraUrlDeItem(id)).toBe(url);
    }
  });
});
