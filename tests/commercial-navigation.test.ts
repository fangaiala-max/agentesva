import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIAGNOSTICO, NAVEGACION_COMERCIAL } from '../src/data/breadcrumbs';
import { entityGraph, FOUNDER_ID, founder, organization, person } from '../src/data/schema';
import { SERVICE_OFFER } from '../src/data/service-offer';
import { AUTOMATION_AREAS } from '../src/data/automation-areas';

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
    const page = read('src/components/SpanishHome.astro');
    expect(page).toContain('Diseñamos la tecnología');
    expect(page).toContain('<AutomationDemo />');
    expect(page).toContain('href="#demo"');
    expect(page).toContain('data-track-placement="hero"');
    expect(page).toContain('data-track-placement="sticky"');
    expect(SERVICE_OFFER.scoped.price).toBe('Desde 1.500 €');
    expect(page.match(/SERVICE_OFFER\.scoped\.price/g)).toHaveLength(1);
    expect(page).toContain('id="directorio"');
    expect(AUTOMATION_AREAS.map((area) => area.href)).toContain('/servicios/automatizacion-atencion-cliente/');
  });

  it('conecta la oferta principal con servicios, precios, proceso y diagnóstico', () => {
    const page = read('src/components/SpanishHome.astro');
    for (const href of ['/precios-automatizacion-ia/', '/como-trabajamos/']) {
      expect(page).toContain(`href="${href}"`);
    }
    expect(AUTOMATION_AREAS.map((area) => area.href)).toEqual([
      '/servicios/automatizacion-atencion-cliente/',
      '/servicios/automatizacion-ventas/',
      '/servicios/automatizacion-procesos/',
    ]);

    for (const deliverable of ['Flujo operativo', 'Casos probados', 'Control y relevo']) {
      expect(page).toContain(deliverable);
    }
    expect(page.indexOf('Flujo operativo')).toBeLessThan(page.indexOf('Casos probados'));
    expect(page.indexOf('Casos probados')).toBeLessThan(page.indexOf('Control y relevo'));
  });

  it('mide todos los accesos al diagnóstico con el mismo contrato comercial', () => {
    const page = read('src/components/SpanishHome.astro');
    const trackedCtas = (page.match(/<a\b[^>]*>/g) ?? []).filter(
      (anchor) =>
        anchor.includes('href="/diagnostico-automatizacion-ia/"') &&
        anchor.includes('{...tracking}'),
    );

    expect(trackedCtas).toHaveLength(3);
    expect(trackedCtas.map((cta) => cta.match(/data-track-placement="([^"]+)"/)?.[1])).toEqual([
      'hero',
      'mid_page',
      'sticky',
    ]);
    for (const [key, value] of Object.entries({ 'data-track-event': 'service_cta_click', 'data-track-page-type': 'home', 'data-track-content-slug': 'home', 'data-track-service': 'general_consulting', 'data-track-cluster': 'general' })) {
      expect(page).toContain(`'${key}': '${value}'`);
    }
  });

  it('atribuye precios, servicios y metodología dentro del recorrido comercial', () => {
    const page = read('src/components/SpanishHome.astro');
    for (const placement of ['pricing', 'methodology']) {
      expect(page).toContain(`data-track-placement="${placement}"`);
    }
    const services = read('src/components/ServiceSpotlightGrid.astro');
    expect(page).toContain('data-track-service={area.service}');
    expect(services).toContain('data-track-placement="service_card"');
    expect(services).toContain('data-track-service={AUTOMATION_AREAS[index].service}');
    expect(AUTOMATION_AREAS.map((area) => area.service)).toEqual([
      'customer_service_automation',
      'sales_automation',
      'process_automation',
    ]);
  });

  it('enlaza al directorio completo desde un teaser compacto', () => {
    const page = read('src/components/SpanishHome.astro');
    expect(page).toContain('href="/herramientas/"');
    expect(page).not.toContain('id="tool-search"');
    expect(read('src/pages/herramientas/index.astro')).toContain('search');
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
