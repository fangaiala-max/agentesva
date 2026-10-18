import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from 'astro/markdown';

const root = path.resolve(process.cwd());
const slugs = [
  'chatbot-para-pymes',
  'automatizar-whatsapp-empresa',
  'automatizar-seguimiento-de-leads',
  'make-vs-n8n-vs-zapier',
  'cuanto-cuesta-automatizar-un-negocio',
  'procesos-que-conviene-automatizar-primero',
];

describe('GROW-019 commercial guides', () => {
  it('ships the six canonical guides', () => {
    for (const slug of slugs) {
      expect(fs.existsSync(path.join(root, 'src/content/guias', `${slug}.md`)), slug).toBe(true);
    }
  });

  it('requires answer-first content, sources, cluster links, FAQs and a contextual service', () => {
    for (const slug of slugs) {
      const source = fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
      expect(source, slug).toMatch(/respuesta: "/);
      expect(source, slug).toMatch(/puntosClave:\n(?:  - .+\n){3}/);
      expect(source, slug).toMatch(/servicio:\n/);
      expect(source, slug).toMatch(/relacionados:\n/);
      expect(source, slug).toMatch(/faq:\n/);
      expect(source, slug).toMatch(/fuentes:\n/);
      expect(source, slug).toMatch(/## /);
    }
  });

  it('mantiene dos CTA de servicio para las seis guías comerciales existentes', () => {
    const clusters = new Set(['customer_service', 'sales', 'operations', 'general']);
    const services = new Set([
      'customer_service_automation',
      'sales_automation',
      'process_automation',
      'general_consulting',
    ]);
    for (const slug of slugs) {
      const source = fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
      expect(source, slug).toMatch(/servicio:\n/);
      const service = parseFrontmatter(source).frontmatter.servicio as {
        analytics: { cluster: string; service: string };
      };
      expect(clusters.has(service.analytics?.cluster), `${slug}: cluster analítico`).toBe(true);
      expect(services.has(service.analytics?.service), `${slug}: servicio analítico`).toBe(true);
    }
    const page = fs.readFileSync(path.join(root, 'src/pages/guias/[slug].astro'), 'utf8');
    const cta = fs.readFileSync(path.join(root, 'src/components/GuideServiceCTA.astro'), 'utf8');
    expect(page).toContain('placement="after_answer"');
    expect(page).toContain('placement="final"');
    expect(cta).toContain('data-track-cluster={service.analytics.cluster}');
    expect(cta).toContain('data-track-service={service.analytics.service}');
  });

  it('tracks both CTA positions and emits Article, FAQ and breadcrumb schema', () => {
    const page = fs.readFileSync(path.join(root, 'src/pages/guias/[slug].astro'), 'utf8');
    const cta = fs.readFileSync(path.join(root, 'src/components/GuideServiceCTA.astro'), 'utf8');
    expect(page).toContain("'@type':'Article'");
    expect(page).toContain("'@type':'FAQPage'");
    expect(page).toContain('breadcrumbList(trail)');
    expect(page).toContain('placement="after_answer"');
    expect(page).toContain('placement="final"');
    expect(cta).toContain('data-track-page-type="guide"');
    expect(cta).toContain('data-track-placement={placement}');
  });

  it('presenta /guias como colección de automatización, IA y visibilidad', () => {
    const index = fs.readFileSync(path.join(root, 'src/pages/guias/index.astro'), 'utf8');
    expect(index).toContain('Guías de IA, automatización y visibilidad');
    expect(index).toContain('buscadores de IA');
    expect(index).toContain("'@type':'CollectionPage'");
  });
});
