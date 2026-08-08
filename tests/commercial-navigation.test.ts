import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIAGNOSTICO, NAVEGACION_COMERCIAL } from '../src/data/breadcrumbs';
import { entityGraph, FOUNDER_ID, founder, organization, person } from '../src/data/schema';
import { SERVICE_OFFER } from '../src/data/service-offer';

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
    expect(page).toContain('Automatiza un proceso acotado');
    expect(page).toContain('Descubrir qué automatizar');
    expect(page).toContain('data-track-placement="hero"');
    expect(page).toContain('data-track-placement="sticky"');
    expect(SERVICE_OFFER.scoped.price).toBe('Desde 1.500 €');
    expect(page.match(/SERVICE_OFFER\.scoped\.price/g)).toHaveLength(2);
    expect(page.indexOf('Qué compras')).toBeLessThan(page.indexOf('¿Aún estás explorando?'));
    expect(page).toContain('id="directorio"');
    expect(page).toContain('/servicios/automatizacion-atencion-cliente/');
  });

  it('conecta la oferta principal con servicios, precios, proceso y diagnóstico', () => {
    const page = read('src/pages/index.astro');
    for (const href of [
      '/servicios/automatizacion-atencion-cliente/',
      '/servicios/automatizacion-ventas/',
      '/servicios/automatizacion-procesos/',
      '/precios-automatizacion-ia/',
      '/como-trabajamos/',
    ]) {
      expect(page).toContain(`href="${href}"`);
    }

    for (const deliverable of ['Flujo operativo', 'Casos probados', 'Control y relevo']) {
      expect(page).toContain(deliverable);
    }
    expect(page.indexOf('Flujo operativo')).toBeLessThan(page.indexOf('Casos probados'));
    expect(page.indexOf('Casos probados')).toBeLessThan(page.indexOf('Control y relevo'));
  });

  it('mide todos los accesos al diagnóstico con el mismo contrato comercial', () => {
    const page = read('src/pages/index.astro');
    const trackedCtas = (page.match(/<a\b[^>]*>/g) ?? []).filter(
      (anchor) =>
        anchor.includes('href="/diagnostico-automatizacion-ia/"') &&
        anchor.includes('data-track-event="service_cta_click"'),
    );

    expect(trackedCtas).toHaveLength(3);
    expect(trackedCtas.map((cta) => cta.match(/data-track-placement="([^"]+)"/)?.[1])).toEqual([
      'hero',
      'mid_page',
      'sticky',
    ]);
    for (const cta of trackedCtas) {
      expect(cta).toContain('data-track-page-type="home"');
      expect(cta).toContain('data-track-content-slug="home"');
      expect(cta).toContain('data-track-service="general_consulting"');
      expect(cta).toContain('data-track-cluster="general"');
    }
  });

  it('atribuye precios, servicios y metodología dentro del recorrido comercial', () => {
    const page = read('src/pages/index.astro');
    for (const placement of ['hero_pricing', 'service_card', 'methodology']) {
      expect(page).toContain(`data-track-placement="${placement}"`);
    }
    for (const service of ['customer_service_automation', 'sales_automation', 'process_automation']) {
      expect(page).toContain(`data-track-service="${service}"`);
    }
  });

  it('mantiene una única búsqueda operativa después del contenido comercial', () => {
    const page = read('src/pages/index.astro');
    expect(page.match(/id="search-form"/g)).toHaveLength(1);
    expect(page.match(/id="tool-search"/g)).toHaveLength(1);
    expect(page.indexOf('class="commercial-close"')).toBeLessThan(page.indexOf('id="search-form"'));
  });

  it('publica a Elizabeth como fundadora y mantiene a Fernando como editor', () => {
    expect(organization.founder).toEqual({ '@id': FOUNDER_ID });
    expect(organization.description).toBe(
      'Automatización con inteligencia artificial y recursos prácticos en español para negocios.',
    );
    expect(founder).toMatchObject({
      '@id': FOUNDER_ID,
      name: 'Elizabeth Salguero',
      jobTitle: 'Fundadora de AgentesVA',
      worksFor: { '@id': organization['@id'] },
      sameAs: ['https://www.linkedin.com/in/elizabethsalguero/'],
    });
    expect(person).toMatchObject({
      name: 'Fernando Angulo',
      jobTitle: 'Director de estrategia y editor de AgentesVA',
      worksFor: { '@id': organization['@id'] },
    });
    expect(entityGraph['@graph']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Elizabeth Salguero', jobTitle: 'Fundadora de AgentesVA' }),
        expect.objectContaining({ name: 'Fernando Angulo', jobTitle: 'Director de estrategia y editor de AgentesVA' }),
      ]),
    );
    expect(new Set(entityGraph['@graph'].map((entity) => entity['@id'])).size).toBe(entityGraph['@graph'].length);
  });
});
