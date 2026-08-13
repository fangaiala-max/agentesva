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
    expect(frontmatter.portada.srcMovil).toContain('especialista-geo-hero-720.jpg');
  });

  it('rechaza rutas externas encubiertas y recursos inexistentes', () => {
    const { frontmatter } = parseFrontmatter(read());
    expect(() => guideSchema.parse({ ...frontmatter, portada: { ...frontmatter.portada, src: '//evil.example/cover.jpg' } })).toThrow();
    expect(() => guideSchema.parse({ ...frontmatter, relacionados: [{ titulo: 'Fuera', href: '//evil.example' }, ...frontmatter.relacionados.slice(1)] })).toThrow();
    expect(() => guideSchema.parse({ ...frontmatter, recurso: { id: 'gr999' } })).toThrow();
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
      '/images/guias/especialista-geo/especialista-geo-hero-720.jpg',
      '/images/guias/especialista-geo/geo-jobs-report.svg',
      '/images/guias/especialista-geo/geo-jobs-report-mobile.svg',
      '/images/guias/especialista-geo/roadmap-90-dias.svg',
      '/images/guias/especialista-geo/roadmap-90-dias-mobile.svg',
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
    expect(page).toContain('srcset={d.portada.srcMovil');
  });

  it('publica la fecha real de actualización de la nueva ruta en el sitemap', () => {
    const config = readProjectFile('astro.config.mjs');
    expect(config).toContain("'/guias/como-convertirse-en-especialista-geo/'");
    expect(config).toContain("new Date('2026-08-13T00:00:00.000Z')");
  });

  it('genera metadatos sociales y lastmod correctos en la salida de producción', () => {
    const html = readProjectFile('dist/client/guias/como-convertirse-en-especialista-geo/index.html');
    expect(html).toContain('<title>Cómo ser especialista GEO: plan de 90 días | AgentesVA</title>');
    expect(html).toContain('<meta property="og:type" content="article">');
    expect(html).toContain('<meta property="og:image" content="https://agentesva.com/images/guias/especialista-geo/especialista-geo-hero.jpg">');
    expect(html).toContain('<meta name="twitter:image" content="https://agentesva.com/images/guias/especialista-geo/especialista-geo-hero.jpg">');
    const sitemap = readProjectFile('dist/client/sitemap-0.xml');
    expect(sitemap).toMatch(/como-convertirse-en-especialista-geo\/<\/loc><lastmod>2026-08-13/);
    expect(sitemap).toMatch(/seo-para-ia\/<\/loc><lastmod>2026-08-04/);
  });

  it('protege la legibilidad móvil del índice y de las infografías', () => {
    const index = readProjectFile('src/pages/guias/index.astro');
    expect(index).toContain('minmax(min(100%,300px),1fr)');
    expect(read()).toContain('<source media="(max-width: 600px)"');
  });
});
