import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIT_BASELINE, PRICE_DISCLAIMER, SERVICE_OFFER } from '../src/data/service-offer';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const hub = read('src/pages/servicios/index.astro');
const diagnostic = read('src/pages/diagnostico-automatizacion-ia.astro');
const verticals = ['automatizacion-atencion-cliente', 'automatizacion-ventas', 'automatizacion-procesos'].map((slug) => read(`src/pages/servicios/${slug}.astro`));

describe('oferta de servicios consistente', () => {
  it('define una única escala comercial', () => {
    expect(SERVICE_OFFER.diagnostic.price).toBe('Gratis');
    expect(SERVICE_OFFER.workshop.price).toBe('Desde 300 €');
    expect(SERVICE_OFFER.scoped.price).toBe('Desde 1.500 €');
    expect(SERVICE_OFFER.integrated.price).toBe('Desde 3.000 €');
    expect(SERVICE_OFFER.support.price).toBe('Desde 300 €/mes');
  });

  it('mantiene los rangos principales en el hub y las verticales', () => {
    for (const price of Object.values(SERVICE_OFFER).map((item) => item.price)) expect(hub).toContain(price);
    for (const page of verticals) {
      expect(page).toContain(SERVICE_OFFER.scoped.price);
      expect(page).toContain(SERVICE_OFFER.integrated.price);
      expect(page).toContain(PRICE_DISCLAIMER);
      expect(page).toContain('Buen encaje');
      expect(page).toContain('Límites');
    }
  });

  it('evita solapamientos en las opciones presupuestarias del diagnóstico', () => {
    expect(diagnostic).toContain('300–1.499 €');
    expect(diagnostic).toContain('1.500–2.999 €');
    expect(diagnostic).toContain('3.000–5.000 €');
    expect(FIT_BASELINE.good).toHaveLength(4);
    expect(FIT_BASELINE.notYet).toHaveLength(4);
  });
});
