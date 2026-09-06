import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { linksForStudy, linksForTool, serviceClusterLinks } from '../src/data/commercial-links';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const guidesDir = path.join(root, 'src/content/guias');

describe('GROW-020 commercial internal linking', () => {
  it('gives every service cluster three contextual resources', () => {
    expect(serviceClusterLinks.atencion).toHaveLength(3);
    expect(serviceClusterLinks.ventas).toHaveLength(3);
    expect(serviceClusterLinks.procesos).toHaveLength(3);
    for (const file of ['automatizacion-atencion-cliente', 'automatizacion-ventas', 'automatizacion-procesos']) {
      expect(read('src/components/english/ServicePage.astro')).toContain('<CommercialNextSteps');
    }
  });

  it('connects priority studies and tools back to decision guides', () => {
    for (const slug of ['ia-para-atencion-al-cliente', 'mejores-herramientas-ia-whatsapp', 'herramientas-ia-para-automatizar-tareas']) expect(linksForStudy(slug).length).toBeGreaterThanOrEqual(2);
    for (const slug of ['make', 'n8n', 'zapier', 'wati', 'manychat', 'chatfuel', 'landbot', 'tidio', 'hubspot-ia', 'mailchimp', 'brevo']) expect(linksForTool(slug).length).toBeGreaterThanOrEqual(2);
    expect(read('src/pages/estudios/[slug].astro')).toContain('linksForStudy');
    expect(read('src/components/english/ToolProfile.astro')).toContain('linksForTool');
  });

  it('gives every guide at least three descriptive internal links', () => {
    for (const file of fs.readdirSync(guidesDir).filter((name) => name.endsWith('.md'))) {
      const source = fs.readFileSync(path.join(guidesDir, file), 'utf8');
      const related = source.split('relacionados:')[1]?.split('faq:')[0] ?? '';
      expect((related.match(/href: "\//g) ?? []).length, file).toBeGreaterThanOrEqual(3);
      expect(related, file).not.toContain('titulo: "Leer más"');
    }
  });

  it('tracks cluster navigation separately from service CTA clicks', () => {
    const component = read('src/components/CommercialNextSteps.astro');
    expect(component).toContain('data-track-event="internal_cluster_click"');
    expect(component).toContain('data-track-page-type={pageType}');
    expect(component).toContain('data-track-content-slug={slug}');
  });
});
