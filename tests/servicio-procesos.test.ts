import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
const PAGE=readFileSync(join(process.cwd(),'src/pages/servicios/automatizacion-procesos.astro'),'utf8');
describe('/servicios/automatizacion-procesos/',()=>{
  it('cubre documentos, reporting y tareas administrativas',()=>{expect(PAGE).toContain("title: 'Documentos y datos'");expect(PAGE).toContain("title: 'Reporting recurrente'");expect(PAGE).toContain("title: 'Tareas administrativas'");});
  it('publica flujo, entregables, rangos y límites',()=>{expect(PAGE).toContain('Ejemplo de flujo');expect(PAGE).toContain('Qué entregamos');expect(PAGE).toContain('Desde 1.500 €');expect(PAGE).toContain('Desde 3.000 €');expect(PAGE).toContain('No automatizamos un proceso que nadie controla');});
  it('atribuye los CTA a operaciones',()=>{expect(PAGE.match(/href="\/diagnostico-automatizacion-ia\/"/g)).toHaveLength(2);expect(PAGE).toContain('data-track-service="process_automation"');expect(PAGE).toContain('data-track-cluster="operations"');});
  it('incluye schema comercial',()=>{expect(PAGE).toContain("'@type': 'Service'");expect(PAGE).toContain("'@type': 'FAQPage'");expect(PAGE).toContain('breadcrumbList(trail)');});
});
