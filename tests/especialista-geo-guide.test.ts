import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from 'astro/markdown';
import { describe, expect, it } from 'vitest';
import { guideSchema } from '../src/content-schemas/guias';

const file = path.join(process.cwd(), 'src/content/guias/como-convertirse-en-especialista-geo.md');
const read = () => fs.readFileSync(file, 'utf8');

describe('guía para convertirse en especialista GEO', () => {
  it('existe y cumple el schema de guías', () => {
    expect(fs.existsSync(file)).toBe(true);
    const { frontmatter } = parseFrontmatter(read());
    expect(() => guideSchema.parse(frontmatter)).not.toThrow();
    expect(frontmatter.recurso).toEqual({ id: 'gr22' });
    expect(frontmatter.servicio).toBeUndefined();
  });

  it('atribuye los hallazgos al corpus provisional de Citable', () => {
    const source = read();
    for (const value of ['247', '94,3 %', '80', '30,5 %', '79', '30,2 %', '1', '0,4 %']) {
      expect(source).toContain(value);
    }
    expect(source).toContain('262 puestos canónicos provisionales');
    expect(source).toContain('https://citable.agency/journal/what-companies-expect-from-geo-specialist/');
    expect(source).toMatch(/no representa (?:todo el|la totalidad del) mercado laboral/i);
    expect(source).toMatch(/no (?:demuestra|permite concluir).{0,100}(?:prima salarial|salarios)/is);
  });

  it('convierte las seis competencias en prácticas y evidencias de portfolio', () => {
    const source = read();
    for (const heading of [
      'Medición de visibilidad',
      'Fundamentos técnicos',
      'Contenido recuperable',
      'Entidades y narrativa',
      'Autoridad y fuentes externas',
      'Operaciones y experimentación',
    ]) {
      expect(source).toContain(`### ${heading}`);
    }
    expect(source.match(/\*\*Práctica:\*\*/g)).toHaveLength(6);
    expect(source.match(/\*\*Evidencia de portfolio:\*\*/g)).toHaveLength(6);
  });

  it('incluye plan de 90 días, evaluación de ofertas y enlaces del clúster', () => {
    const source = read();
    expect(source).toContain('## Plan de aprendizaje de 90 días');
    expect(source).toContain('Días 1–30');
    expect(source).toContain('Días 31–60');
    expect(source).toContain('Días 61–90');
    expect(source).toContain('## Cómo evaluar una oferta de empleo GEO');
    for (const href of [
      '/guias/seo-para-ia/',
      '/guias/como-aparecer-en-chatgpt/',
      '/guias/medir-visibilidad-en-chatgpt/',
    ]) {
      expect(source).toContain(href);
    }
    expect(source).toMatch(/no (?:garantiza|promete).{0,80}(?:empleo|contratación)/is);
  });
});
