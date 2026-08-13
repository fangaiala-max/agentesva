import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const guide = (slug: string) => fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
const bodyWords = (source: string) => source.split('---').slice(2).join('---').trim().split(/\s+/).length;

describe('clúster SEO para IA', () => {
  it('publica una guía pilar profunda, editorial y conectada', () => {
    const source = guide('seo-para-ia');
    expect(source).toContain('titulo: "SEO para IA:');
    expect(source).not.toMatch(/\nservicio:/);
    expect(source).not.toMatch(/\nrecurso:/);
    expect(source).toContain('/guias/como-aparecer-en-chatgpt/');
    expect(source).toContain('/guias/medir-visibilidad-en-chatgpt/');
    expect(source).toContain('/herramienta/chatgpt/');
    expect(source).toContain('/herramienta/perplexity/');
    expect(source).toContain('/herramienta/surfer-seo/');
    expect(bodyWords(source)).toBeGreaterThanOrEqual(2000);
  });
});
