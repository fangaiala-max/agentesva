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

const expectDirectOpenings = (body: string, headings: string[]) => {
  for (const [index, heading] of headings.entries()) {
    const sectionStart = body.indexOf(`${heading}\n`) + heading.length;
    const sectionEnd = index === headings.length - 1
      ? body.length
      : body.indexOf(headings[index + 1], sectionStart);
    const opening = body.slice(sectionStart, sectionEnd).trimStart().split(/\n\s*\n/)[0].trim();
    const sentences = opening.match(/[.!?](?=\s|$)/g)?.length ?? 0;
    expect(opening, `${heading} debe abrir con un párrafo directo`).not.toMatch(/^(?:#|>|[-*+]\s|\d+\.\s)/);
    expect(sentences, `${heading} debe abrir con 1–3 frases`).toBeGreaterThanOrEqual(1);
    expect(sentences, `${heading} debe abrir con 1–3 frases`).toBeLessThanOrEqual(3);
  }
};

const expectRoutesOnce = (body: string, routes: string[]) => {
  for (const route of routes) {
    expect(body.split(route).length - 1, `${route} debe aparecer una vez en el cuerpo`).toBe(1);
  }
};

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

const chatGptH2 = [
  '## Qué significa realmente aparecer en ChatGPT',
  '## Comprueba que ChatGPT puede acceder a tu sitio',
  '## Crea un inventario de hechos verificables',
  '## Relaciona tu marca con una categoría concreta',
  '## Publica respuestas que resuelvan preguntas de decisión',
  '## Refuerza la información con fuentes externas',
  '## Diseña una batería neutral de consultas',
  '## Qué hacer si ChatGPT omite o describe mal tu marca',
];

const chatGptRoutes = [
  '/guias/seo-para-ia/',
  '/guias/medir-visibilidad-en-chatgpt/',
  '/herramienta/chatgpt/',
  '/herramienta/perplexity/',
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

    expectDirectOpenings(body, expectedH2);
    expectRoutesOnce(body, strategicRoutes);

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

  it('publica la guía práctica de aparición sin CTA comercial', () => {
    const source = guide('como-aparecer-en-chatgpt');
    const { frontmatter, body } = sections(source);

    expect(frontmatter).toContain('titulo: "Cómo aparecer en ChatGPT: guía para posicionar tu empresa"');
    expect(frontmatter).toContain('descripcion: "Proceso práctico para que ChatGPT pueda descubrir, entender y describir tu empresa con fuentes claras, consistentes y verificables."');
    expect(frontmatter).toContain('fecha: 2026-08-13');
    expect(frontmatter).toContain('actualizado: 2026-08-13');
    expect(frontmatter).toContain('tema: Visibilidad en ChatGPT');
    expect(frontmatter).toContain('respuesta: "Para aumentar las posibilidades de aparecer en ChatGPT, permite el acceso de OAI-SearchBot, publica información clara y verificable sobre tu empresa, relaciona la marca con su categoría y consigue fuentes externas consistentes. Después prueba consultas neutrales y registra los resultados. Cumplir estos pasos mejora la elegibilidad, pero no garantiza una cita ni una posición."');
    expect(frontmatter).toContain(`puntosClave:
  - "Comprueba primero rastreo, indexación y acceso de OAI-SearchBot."
  - "Publica hechos consistentes sobre marca, categoría, oferta y audiencia."
  - "Prueba prompts neutrales y guarda plataforma, fecha, pregunta y respuesta."`);
    for (const sourceUrl of [
      'https://help.openai.com/en/articles/12627856-publishers-and-developers-faq',
      'https://help.openai.com/en/articles/9237897-chatgpt-search',
      'https://developers.google.com/search/docs/appearance/ai-features',
      'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
    ]) {
      expect(frontmatter).toContain(`url: "${sourceUrl}"`);
    }
    expect(frontmatter).not.toMatch(/^servicio:/m);
    expect(frontmatter).not.toMatch(/^recurso:/m);

    expect(bodyWords(body)).toBeGreaterThanOrEqual(1300);
    expect(bodyWords(body)).toBeLessThanOrEqual(1800);
    expect(body.match(/^## .+$/gm)).toEqual(chatGptH2);
    expectDirectOpenings(body, chatGptH2);
    expectRoutesOnce(body, chatGptRoutes);

    expect(body).toContain('| Comprobación | Qué buscar | Acción |');
    expect(body).toContain('**OAI-SearchBot** se utiliza para enlazar sitios en los resultados de búsqueda de ChatGPT.');
    expect(body).toContain('**GPTBot** se relaciona con la posibilidad de usar contenido para mejorar los modelos generativos.');
    expect(body).toContain('[SEO para IA](/guias/seo-para-ia/)');
    expect(body).toContain('[medir la visibilidad en ChatGPT](/guias/medir-visibilidad-en-chatgpt/)');
    expect(body).toContain('[ficha de ChatGPT](/herramienta/chatgpt/)');
    expect(body).toContain('[Perplexity](/herramienta/perplexity/)');
  });
});
