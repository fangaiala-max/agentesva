import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE = readFileSync(join(process.cwd(), 'src/pages/servicios/index.astro'), 'utf8');

describe('/servicios/', () => {
  it('presenta las tres líneas comerciales prioritarias', () => {
    expect(PAGE).toContain("id: 'atencion-cliente'");
    expect(PAGE).toContain("id: 'ventas'");
    expect(PAGE).toContain("id: 'procesos'");
  });

  it('publica rangos de inversión sin convertirlos en presupuestos cerrados', () => {
    expect(PAGE).toContain("price: 'Desde 300 €'");
    expect(PAGE).toContain("price: 'Desde 1.500 €'");
    expect(PAGE).toContain("price: 'Desde 3.000 €'");
    expect(PAGE).toContain("price: 'Desde 300 €/mes'");
    expect(PAGE).toContain('Son precios de entrada, no presupuestos cerrados.');
  });

  it('envía los CTA a una ruta existente y los mide por placement', () => {
    expect(PAGE.match(/href="\/diagnostico-automatizacion-ia\/"/g)).toHaveLength(2);
    expect(PAGE).toContain("href={service.href ?? '/diagnostico-automatizacion-ia/'}");
    expect(PAGE).toContain('data-track-placement="hero"');
    expect(PAGE).toContain('data-track-placement="service_card"');
    expect(PAGE).toContain('data-track-placement="final_cta"');
  });

  it('incluye WebPage, Service, FAQPage y BreadcrumbList', () => {
    expect(PAGE).toContain("'@type': 'WebPage'");
    expect(PAGE).toContain("'@type': 'Service'");
    expect(PAGE).toContain("'@type': 'FAQPage'");
    expect(PAGE).toContain('breadcrumbList(trail)');
  });

  it('enlaza las tres verticales publicadas', () => {
    expect(PAGE).toContain("href: '/servicios/automatizacion-atencion-cliente/'");
    expect(PAGE).toContain("href: '/servicios/automatizacion-ventas/'");
    expect(PAGE).toContain("href: '/servicios/automatizacion-procesos/'");
  });
});
