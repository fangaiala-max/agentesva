import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE = readFileSync(join(process.cwd(), 'src/pages/servicios/automatizacion-ventas.astro'), 'utf8');

describe('/servicios/automatizacion-ventas/', () => {
  it('cubre captación, cualificación, CRM y seguimiento', () => {
    expect(PAGE).toContain("title: 'Captación conectada'");
    expect(PAGE).toContain("title: 'Cualificación inicial'");
    expect(PAGE).toContain("title: 'CRM actualizado'");
    expect(PAGE).toContain("title: 'Seguimiento oportuno'");
  });

  it('incluye entregables, plazos, rangos y límites', () => {
    expect(PAGE).toContain('Qué entregamos');
    expect(PAGE).toContain('de 2 a 4 semanas');
    expect(PAGE).toContain('Desde 1.500 €');
    expect(PAGE).toContain('Desde 3.000 €');
    expect(PAGE).toContain('No fabricamos demanda ni enviamos spam');
  });

  it('atribuye los CTA al servicio de ventas', () => {
    expect(PAGE.match(/href="\/diagnostico-automatizacion-ia\/"/g)).toHaveLength(2);
    expect(PAGE).toContain('data-track-service="sales_automation"');
    expect(PAGE).toContain('data-track-cluster="sales"');
    expect(PAGE).toContain('data-track-placement="hero"');
    expect(PAGE).toContain('data-track-placement="final_cta"');
  });

  it('incluye metadatos y schema comerciales', () => {
    expect(PAGE).toContain('Automatización de ventas y CRM con IA | AgentesVA');
    expect(PAGE).toContain("'@type': 'Service'");
    expect(PAGE).toContain("'@type': 'FAQPage'");
    expect(PAGE).toContain('breadcrumbList(trail)');
  });
});
