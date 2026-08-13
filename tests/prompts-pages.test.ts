import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROMPT_LANDINGS } from '../src/data/prompt-landings';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('rutas SEO de prompts', () => {
  it('el hub enlaza todas las colecciones y el generador', () => {
    const hub = source('src/pages/prompts/index.astro');
    expect(hub).toContain('PROMPT_LANDINGS.map');
    expect(hub).toContain('href={`/prompts/${landing.slug}`}');
    expect(hub).toContain('href="/generador-de-prompts"');
    expect(hub).toContain("'@type': 'ItemList'");
  });

  it('cada landing se genera desde la fuente única y conserva prompts, FAQ y copia', () => {
    const detail = source('src/pages/prompts/[slug].astro');
    expect(detail).toContain('PROMPT_LANDINGS.map((landing) => ({ params: { slug: landing.slug }, props: { landing } }))');
    expect(detail).toContain('landing.promptIds.map');
    expect(detail).toContain('landing.faqs.map');
    expect(detail).toContain("'@type': 'FAQPage'");
    expect(detail).toContain('class="bib-copy shimmer"');
    expect(detail).toContain('initBibliotecaCopy()');
  });

  it('el generador mantiene sus cinco entradas conectadas al script local', () => {
    const page = source('src/pages/generador-de-prompts.astro');
    for (const name of ['role', 'context', 'task', 'restrictions', 'format']) {
      expect(page).toContain(`name="${name}"`);
    }
    expect(page).toContain('id="prompt-generator-output"');
    expect(page).toContain('initPromptGenerator()');
    expect(page).toContain("'@type': 'WebApplication'");
    expect(page).toContain("'@type': 'FAQPage'");
  });

  it('las seis URLs objetivo tienen canonical y metadatos únicos derivados de datos', () => {
    expect(PROMPT_LANDINGS).toHaveLength(6);
    expect(new Set(PROMPT_LANDINGS.map((landing) => landing.seoTitle)).size).toBe(6);
    expect(new Set(PROMPT_LANDINGS.map((landing) => landing.description)).size).toBe(6);
    const detail = source('src/pages/prompts/[slug].astro');
    expect(detail).toContain('`${SITE}/prompts/${landing.slug}/`');
    expect(detail).toContain('title={landing.seoTitle}');
    expect(detail).toContain('description={landing.description}');
  });
});

describe('descubrimiento e indexación', () => {
  it('excluye todas las rutas noindex del sitemap y fija el lastmod editorial', () => {
    const config = source('astro.config.mjs');
    for (const route of ['/ir/', '/buscar', '/descarga', '/entrega', '/gracias']) {
      expect(config).toContain(`!page.includes('${route}')`);
    }
    expect(config).toContain("new Date('2026-08-04T00:00:00.000Z')");
    expect(config).toContain('ROUTE_LASTMOD.get(pathname) ?? SITE_RELAUNCH_LASTMOD');
  });

  it('enlaza el clúster desde home, biblioteca, footer y llms.txt', () => {
    expect(source('src/pages/index.astro')).toContain('href="/prompts"');
    expect(source('src/pages/recurso/[slug].astro')).toContain('href="/prompts"');
    expect(source('src/data/breadcrumbs.ts')).toContain("prompts: { name: 'Prompts', url: '/prompts' }");
    expect(source('src/data/breadcrumbs.ts')).toContain("{ name: 'Generador de prompts', url: '/generador-de-prompts' }");
    const llms = source('public/llms.txt');
    expect(llms).toContain('https://agentesva.com/prompts');
    expect(llms).toContain('https://agentesva.com/generador-de-prompts');
  });
});
