import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parseFrontmatter } from 'astro/markdown';
import { guideSchema } from '../src/content-schemas/guias';
import { Window } from 'happy-dom';

const slugs = [
  'mejores-herramientas-automatizar-procesos',
  'mejores-skills-claude-gratis-pago',
  'mejores-herramientas-automatizar-redes-sociales',
];
const externalUrls = (body: string) => [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)]
  .map(m => m[1]).filter(u => !u.startsWith('https://agentesva.com/')).sort();

describe('complete bilingual buying guides', () => {
  for (const slug of slugs) {
    it(`${slug}: preserves full English content, sources and final infographic`, () => {
      const editions = ['guias', 'guide-translations'].map(dir => {
        const source = fs.readFileSync(`src/content/${dir}/${slug}.md`, 'utf8');
        const parsed = parseFrontmatter(source);
        expect(guideSchema.safeParse(parsed.frontmatter).success).toBe(true);
        const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
        expect(body.split(/\s+/).length).toBeGreaterThan(2200);
        expect(body).not.toMatch(/awaiting layout|pendiente de maquetación|Proposed editorial diagram|Diagrama editorial propuesto/);
        expect(body).not.toContain('https://agentesva.com/diagnostico/');
        expect(body.trim()).toMatch(/<\/figure>$/);
        const window = new Window();
        window.document.write(body);
        const figures = [...window.document.querySelectorAll('figure')];
        expect(figures).toHaveLength(3);
        expect(figures[0].classList.contains('guide-atlas')).toBe(true);
        expect(figures[1].classList.contains('guide-case')).toBe(true);
        for (const figure of figures) {
          expect(figure.querySelector('img')?.getAttribute('src')).toContain('/images/guides/figma/');
        }
        const reviews = [...window.document.querySelectorAll('details.guide-feature')];
        expect(reviews).toHaveLength(slug.includes('skills') ? 10 : 7);
        for (const review of reviews) {
          expect(review.hasAttribute('open')).toBe(false);
          expect(review.querySelector('summary strong')?.textContent.trim().length).toBeGreaterThan(1);
        }
        const end = figures.at(-1)!;
        expect(end.classList.contains('guide-infographic')).toBe(true);
        expect(end.querySelectorAll('a[download]')).toHaveLength(2);
        for (const node of window.document.querySelectorAll('img, source, a[download]')) {
          const href = node.getAttribute('src') ?? node.getAttribute('srcset') ?? node.getAttribute('href')!;
          expect(fs.existsSync(`public${href}`), href).toBe(true);
          if (node.tagName !== 'A') {
            expect(Number(node.getAttribute('width'))).toBeGreaterThan(0);
            expect(Number(node.getAttribute('height'))).toBeGreaterThan(0);
          }
        }
        window.close();
        return { parsed, body };
      });
      expect(editions[0].parsed.frontmatter.visual).toBe(editions[1].parsed.frontmatter.visual);
      expect(externalUrls(editions[0].body)).toEqual(externalUrls(editions[1].body));
      expect(editions[1].body).not.toContain('https://agentesva.com/diagnostico/');
    });
  }
});
