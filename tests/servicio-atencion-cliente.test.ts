import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE = readFileSync(join(process.cwd(), 'src/pages/servicios/automatizacion-atencion-cliente.astro'), 'utf8');

describe('/servicios/automatizacion-atencion-cliente/', () => {
  it('cubre problema, casos, flujo, entregables, plazo, precio y límites', () => {
    expect(PAGE).toContain('El problema habitual');
    expect(PAGE).toContain('Casos de uso');
    expect(PAGE).toContain('Ejemplo de flujo');
    expect(PAGE).toContain('Qué entregamos');
    expect(PAGE).toContain('de 2 a 4 semanas');
    expect(PAGE).toContain('Desde 1.500 €');
    expect(PAGE).toContain('Límites');
  });

  it('incluye CTA contextuales y medibles', () => {
    expect(PAGE.match(/href="\/diagnostico-automatizacion-ia\/"/g)).toHaveLength(2);
    expect(PAGE).toContain('data-track-service="customer_service_automation"');
    expect(PAGE).toContain('data-track-placement="hero"');
    expect(PAGE).toContain('data-track-placement="final_cta"');
  });

  it('incluye metadatos y datos estructurados comerciales', () => {
    expect(PAGE).toContain('Automatización de atención al cliente con IA | AgentesVA');
    expect(PAGE).toContain("'@type': 'Service'");
    expect(PAGE).toContain("'@type': 'FAQPage'");
    expect(PAGE).toContain('breadcrumbList(trail)');
    expect(PAGE).toContain("lowPrice: '1500'");
  });
});
