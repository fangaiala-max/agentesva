import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from 'astro/markdown';
import { describe, expect, it } from 'vitest';
import { guideSchema } from '../src/content-schemas/guias';

const file = path.join(process.cwd(), 'src/content/guias/como-convertirse-en-especialista-geo.md');
const read = () => fs.readFileSync(file, 'utf8');
const readProjectFile = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('guía para convertirse en especialista GEO', () => {
  it('existe y cumple el schema de guías', () => {
    expect(fs.existsSync(file)).toBe(true);
    const { frontmatter } = parseFrontmatter(read());
    expect(() => guideSchema.parse(frontmatter)).not.toThrow();
    expect(frontmatter.recurso).toEqual({ id: 'gr22' });
    expect(frontmatter.servicio).toBeUndefined();
    expect(frontmatter.seoTitulo).toBe('Cómo ser especialista GEO: plan de 90 días');
    expect(frontmatter.faq).toHaveLength(6);
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

  it('alterna texto con recursos visuales, tablas y listas escaneables', () => {
    const source = read();
    for (const asset of [
      '/images/guias/especialista-geo/especialista-geo-hero.jpg',
      '/images/guias/especialista-geo/geo-jobs-report.svg',
      '/images/guias/especialista-geo/roadmap-90-dias.svg',
    ]) {
      expect(source).toContain(asset);
    }
    expect(source.match(/<tr>/g)).toHaveLength(14);
    expect(source.match(/<caption>/g)).toHaveLength(2);
    expect(source).toContain('## El marco de las seis competencias GEO conecta diagnóstico y ejecución');
    expect(source).toContain('- [ ] **Objetivo:**');
  });

  it('recibe autoridad interna desde las tres guías del clúster', () => {
    for (const guide of [
      'src/content/guias/seo-para-ia.md',
      'src/content/guias/como-aparecer-en-chatgpt.md',
      'src/content/guias/medir-visibilidad-en-chatgpt.md',
    ]) {
      expect(readProjectFile(guide)).toContain('/guias/como-convertirse-en-especialista-geo/');
    }
  });

  it('publica metadatos sociales de artículo y autoridad visible del autor', () => {
    const page = readProjectFile('src/pages/guias/[slug].astro');
    expect(page).toContain('ogType="article"');
    expect(page).toContain('ogImage={d.portada ? `${SITE}${d.portada.src}` : undefined}');
    expect(page).toContain('class="author-bio"');
    expect(page).toContain('analista sénior de mercados y conferenciante internacional');
  });

  it('publica la fecha real de actualización de la nueva ruta en el sitemap', () => {
    const config = readProjectFile('astro.config.mjs');
    expect(config).toContain("'/guias/como-convertirse-en-especialista-geo/'");
    expect(config).toContain("new Date('2026-08-13T00:00:00.000Z')");
  });
});
