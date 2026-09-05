import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUTOMATION_AREAS } from '../src/data/automation-areas';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const readTree = (path: string): string[] =>
  readdirSync(join(process.cwd(), path), { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return readTree(child);
    return /[.](?:astro|md|ts)$/.test(entry.name) ? [read(child)] : [];
  });

describe('programa CRO — fase 1', () => {
  it('no publica la prueba social provisional como si fuera un dato real', () => {
    const publicCopy = [...readTree('src'), ...readTree('docs')].join('\n');

    expect(publicCopy).not.toMatch(/(?:1[.]200|data-count="1200"|usan la IA mejor)/i);
  });

  it('presenta AgentesVA como servicio antes que como directorio', () => {
    const header = read('src/components/SiteHeader.astro');
    const footer = read('src/components/SiteFooter.astro');

    expect(header).toContain('Automatización con IA para PyMEs');
    expect(footer).toContain('Automatización con IA para negocios hispanos');
    expect(footer).not.toContain('Directorio de IA para negocios hispanos');
  });

  it('promete tres minutos de forma consistente en la ruta al diagnóstico', () => {
    const home = read('src/pages/index.astro');
    const diagnostic = read('src/pages/diagnostico-automatizacion-ia.astro');
    const publicAstro = readTree('src').join('\n');

    expect(home).not.toContain('2 minutos');
    expect(home).toContain('3 minutos');
    expect(diagnostic).toContain('Diagnóstico gratuito · 3 minutos');
    expect(publicAstro).not.toMatch(
      /(?:diagnóstico|diagnostico)[^<\n.]{0,80}\b2 minutos\b|\b2 minutos\b[^<\n.]{0,80}(?:diagnóstico|diagnostico)/i,
    );
  });

  it('protege los mensajes verificables que sustituyen la cifra provisional', () => {
    const home = read('src/pages/index.astro');
    const newsletter = read('src/pages/newsletter.astro');

    expect(AUTOMATION_AREAS).toHaveLength(3);
    expect(home).toContain('data-count={AUTOMATION_AREAS.length}');
    expect(home).toContain('Áreas de automatización');
    expect(newsletter).toContain('Contenido práctico para PyMEs de España y Latinoamérica.');
  });

  it('mantiene el H1 del hero visible desde el primer render', () => {
    const home = read('src/pages/index.astro');
    const heroHeading = home.match(/<h1\b[^>]*>.*?<\/h1>/s)?.[0] ?? '';

    expect(heroHeading).toContain('AUTOMATIZA<br />LO QUE <span>SÍ</span><br />IMPORTA.');
    expect(heroHeading).not.toContain('blur-in');
  });
});
