import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('commercial visual system', () => {
  it('uses the Gemini tokens in the shared commercial templates', () => {
    const theme=read('src/styles/spectrum.css');
    expect(theme).toContain('#315bda');expect(theme).toContain('#6944bf');
    for(const file of ['src/pages/precios-automatizacion-ia.astro','src/pages/como-trabajamos.astro'])expect(read(file)).toContain('<ServicePage');
  });
  it('shares one visual template across all service detail pages', () => {
    for(const slug of ['automatizacion-atencion-cliente','automatizacion-ventas','automatizacion-procesos'])expect(read(`src/pages/servicios/${slug}.astro`)).toContain('<ServicePage');
    expect(read('src/components/english/ServicePage.astro')).toContain('<WorkflowExplanation');
  });

  it('keeps decorative motion optional and adds guide reading progress', () => {
    expect(read('src/components/AmbientHero.astro')).toContain('prefers-reduced-motion');
    expect(read('src/components/ReadingProgress.astro')).toContain('requestAnimationFrame');
    expect(read('src/pages/guias/[slug].astro')).toContain('<ReadingProgress />');
  });

  it('gives diagnostic controls motion-safe hover and keyboard focus states', () => {
    const source = read('src/pages/diagnostico-automatizacion-ia.astro');
    expect(source).toContain('.options label:has(input:focus-visible)');
    expect(source).toContain('@keyframes diagnostic-enter');
    expect(source).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
