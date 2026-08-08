import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIAGNOSTICO, NAVEGACION_COMERCIAL } from '../src/data/breadcrumbs';
import { entityGraph, FOUNDER_ID, organization } from '../src/data/schema';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('navegación comercial', () => {
  it('publica las cuatro rutas prioritarias', () => {
    expect(NAVEGACION_COMERCIAL.map((item) => item.url)).toEqual([
      '/servicios',
      '/precios-automatizacion-ia',
      '/como-trabajamos',
    ]);
    expect(DIAGNOSTICO.url).toBe('/diagnostico-automatizacion-ia');
  });

  it('convierte la home en una ruta de venta sin eliminar el directorio', () => {
    const page = read('src/pages/index.astro');
    expect(page).toContain('Elimina un proceso manual');
    expect(page).toContain('Descubrir qué automatizar');
    expect(page).toContain('data-track-placement="hero"');
    expect(page).toContain('data-track-placement="sticky"');
    expect(page).toContain('Implementaciones acotadas desde <strong>1.500 €</strong>');
    expect(page.indexOf('Qué compras')).toBeLessThan(page.indexOf('¿Aún estás explorando?'));
    expect(page).toContain('id="directorio"');
    expect(page).toContain('/servicios/automatizacion-atencion-cliente/');
  });

  it('publica a Elizabeth como fundadora y mantiene a Fernando como editor', () => {
    expect(organization.founder).toEqual({ '@id': FOUNDER_ID });
    expect(entityGraph['@graph']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Elizabeth Salguero', jobTitle: 'Fundadora de AgentesVA' }),
        expect.objectContaining({ name: 'Fernando Angulo', jobTitle: 'Director de estrategia y editor de AgentesVA' }),
      ]),
    );
  });
});
