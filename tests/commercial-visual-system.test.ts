import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('commercial visual system', () => {
  it('removes the legacy green foundation from pricing and methodology', () => {
    for (const file of ['src/pages/precios-automatizacion-ia.astro', 'src/pages/como-trabajamos.astro']) {
      const source = read(file);
      expect(source).not.toContain('#10231d');
      expect(source).not.toContain('#17352b');
      expect(source).not.toContain('#20a77a');
      expect(source).toContain('#0a1a33');
      expect(source).toContain('#5b7cff');
      expect(source).toContain('prefers-reduced-motion');
    }
  });

  it('uses the reusable ambient hero across service detail pages', () => {
    for (const slug of ['automatizacion-atencion-cliente', 'automatizacion-ventas', 'automatizacion-procesos']) {
      const source = read(`src/pages/servicios/${slug}.astro`);
      expect(source).toContain("import AmbientHero from '../../components/AmbientHero.astro'");
      expect(source).toContain('<AmbientHero />');
    }
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
