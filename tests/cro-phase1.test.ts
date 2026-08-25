import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('programa CRO — fase 1', () => {
  it('no publica la prueba social provisional como si fuera un dato real', () => {
    const publicCopy = [
      read('src/pages/index.astro'),
      read('src/pages/newsletter.astro'),
      read('docs/brand-guidelines.md'),
    ].join('\n');

    expect(publicCopy).not.toMatch(/(?:\+?1[.]200|data-count="1200"|usan la IA mejor)/i);
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

    expect(home).not.toContain('2 minutos');
    expect(home).toContain('3 minutos');
    expect(diagnostic).toContain('Diagnóstico gratuito · 3 minutos');
  });

  it('mantiene el H1 del hero visible desde el primer render', () => {
    const home = read('src/pages/index.astro');
    const heroHeading = home.match(/<h1\b[^>]*>.*?<\/h1>/s)?.[0] ?? '';

    expect(heroHeading).toContain('Reduce el trabajo manual de tu PyME');
    expect(heroHeading).not.toContain('blur-in');
  });
});
