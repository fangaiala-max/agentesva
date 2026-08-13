import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const guide = (slug: string) => fs.readFileSync(path.join(root, 'src/content/guias', `${slug}.md`), 'utf8');
const sections = (source: string) => {
  const [, frontmatter, ...bodyParts] = source.split('---');
  return { frontmatter: frontmatter.trim(), body: bodyParts.join('---').trim() };
};
const bodyWords = (body: string) => body.split(/\s+/).length;

const expectedH2 = [
  '## Qué es el SEO para IA',
  '## En qué se diferencia del SEO tradicional',
  '## Cómo descubre y selecciona fuentes un buscador de IA',
  '## Cuatro condiciones para que una marca sea utilizable como fuente',
  '## Cómo construir contenido que pueda entenderse y citarse',
  '## Entidades, datos estructurados y consistencia de marca',
  '## Por qué las señales externas importan',
  '## Un plan de SEO para IA en cuatro fases',
  '## Qué debes medir',
  '## Errores frecuentes',
];

const strategicRoutes = [
  '/guias/como-aparecer-en-chatgpt/',
  '/guias/medir-visibilidad-en-chatgpt/',
  '/herramienta/chatgpt/',
  '/herramienta/perplexity/',
  '/herramienta/surfer-seo/',
];

describe('clúster SEO para IA', () => {
  it('publica una guía pilar profunda, editorial y conectada', () => {
    const source = guide('seo-para-ia');
    const { frontmatter, body } = sections(source);

    expect(frontmatter).toContain('titulo: "SEO para IA: cómo aparecer en buscadores de inteligencia artificial"');
    expect(frontmatter).toContain('descripcion: "Guía práctica para crear contenido, entidades y señales que ayuden a ChatGPT, Google y Perplexity a entender y recomendar tu marca."');
    expect(frontmatter).toContain('fecha: 2026-08-13');
    expect(frontmatter).toContain('actualizado: 2026-08-13');
    expect(frontmatter).toContain('tema: SEO para IA');
    expect(frontmatter).toContain('respuesta: "El SEO para IA consiste en hacer que una marca y su información sean rastreables, comprensibles, verificables y útiles para los sistemas que generan respuestas. No sustituye al SEO tradicional: parte de una base indexable y añade claridad de entidad, contenido que responde preguntas, datos consistentes y corroboración externa. Ninguna técnica garantiza una cita o recomendación."');
    expect(frontmatter).not.toMatch(/^servicio:/m);
    expect(frontmatter).not.toMatch(/^recurso:/m);

    expect(bodyWords(body)).toBeGreaterThanOrEqual(2000);
    expect(bodyWords(body)).toBeLessThanOrEqual(2800);
    expect(body.match(/^## .+$/gm)).toEqual(expectedH2);

    for (const [index, heading] of expectedH2.entries()) {
      const sectionStart = body.indexOf(`${heading}\n`) + heading.length;
      const sectionEnd = index === expectedH2.length - 1
        ? body.length
        : body.indexOf(expectedH2[index + 1], sectionStart);
      const opening = body.slice(sectionStart, sectionEnd).trimStart().split(/\n\s*\n/)[0].trim();
      const sentences = opening.match(/[.!?](?=\s|$)/g)?.length ?? 0;
      expect(opening, `${heading} debe abrir con un párrafo directo`).not.toMatch(/^(?:#|>|[-*+]\s|\d+\.\s)/);
      expect(sentences, `${heading} debe abrir con 1–3 frases`).toBeGreaterThanOrEqual(1);
      expect(sentences, `${heading} debe abrir con 1–3 frases`).toBeLessThanOrEqual(3);
    }

    for (const route of strategicRoutes) {
      expect(body.split(route).length - 1, `${route} debe aparecer una vez en el cuerpo`).toBe(1);
    }

    expect(body).toMatch(/experiencia conversacional de \[ChatGPT\]\(\/herramienta\/chatgpt\/\)/);
    expect(body).toMatch(/\[Perplexity\]\(\/herramienta\/perplexity\/\).{0,180}citas visibles/s);
    expect(body).toMatch(/\[Surfer SEO\]\(\/herramienta\/surfer-seo\/\).{0,260}ejemplo de optimización editorial.{0,260}no como afirmación respaldada por las fuentes oficiales/s);
    expect(body).toMatch(/representación de una marca.{0,180}\[cómo aparecer en ChatGPT\]\(\/guias\/como-aparecer-en-chatgpt\/\)/s);
    expect(body).toMatch(/\[cómo medir la visibilidad en ChatGPT\]\(\/guias\/medir-visibilidad-en-chatgpt\/\).{0,180}método reproducible/s);

    expect(body).toContain('En las funciones de IA de Google Search, una página debe estar indexada');
    expect(body).toContain('OpenAI documenta el rastreo mediante OAI-SearchBot');
    expect(body).toContain('Perplexity diferencia PerplexityBot');
    expect(body).toContain('Como recomendación editorial, conviene aportar señales de confianza y corroboración');
    expect(body).not.toContain('La selección también exige evaluar señales de confianza y corroboración');
  });
});
