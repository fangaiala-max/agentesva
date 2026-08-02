import { describe, expect, it } from 'vitest';
import { tokenize, matchesQuery } from '../src/scripts/directory';
import { buildSearchIndex, intentsFor } from '../src/data/search-intents';
import { joinSteps, lowerFirst, fallbackFaqs } from '../src/data/tools';

// Índice tal y como lo genera ToolCard.astro en build.
const idx = (name: string, desc: string, cat: string) => buildSearchIndex(name, desc, cat);

const MANYCHAT = idx('ManyChat', 'Bots de WhatsApp e IA para vender por chat.', 'WhatsApp');
const CLAUDE = idx('Claude', 'Ideal para textos largos y trabajo que exige criterio.', 'Asistentes');
const MIDJOURNEY = idx('Midjourney', 'Imágenes de alta calidad por texto.', 'Diseño');
const HEYGEN = idx('HeyGen', 'Avatares de IA para tus vídeos.', 'Vídeo');
const MAKE = idx('Make', 'Conecta tus apps sin escribir código.', 'Automatización');

const hits = (q: string, docs: string[]) => {
  const terms = tokenize(q);
  return docs.filter((d) => matchesQuery(d, terms)).length;
};

describe('tokenize', () => {
  it('parte por espacios y normaliza tildes y mayúsculas', () => {
    expect(tokenize('  Automatizar   WhatsApp ')).toEqual(['automatizar', 'whatsapp']);
    expect(tokenize('crear vídeos')).toEqual(['crear', 'videos']);
  });

  it('devuelve lista vacía para consulta vacía o solo espacios', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('    ')).toEqual([]);
  });
});

describe('matchesQuery', () => {
  it('sin términos, todo coincide (estado inicial del directorio)', () => {
    expect(matchesQuery(CLAUDE, [])).toBe(true);
  });

  it('exige TODOS los términos, no la frase literal', () => {
    // Regresión: antes era hay.includes(q) y esto daba false.
    expect(matchesQuery(MANYCHAT, tokenize('bots whatsapp'))).toBe(true);
    expect(matchesQuery(MANYCHAT, tokenize('whatsapp bots'))).toBe(true);
    expect(matchesQuery(MANYCHAT, tokenize('bots telegram'))).toBe(false);
  });

  it('es insensible a tildes en ambos sentidos', () => {
    expect(matchesQuery(MIDJOURNEY, tokenize('imagenes'))).toBe(true);
    expect(matchesQuery(MIDJOURNEY, tokenize('imágenes'))).toBe(true);
    expect(matchesQuery(HEYGEN, tokenize('video'))).toBe(true);
    expect(matchesQuery(HEYGEN, tokenize('vídeo'))).toBe(true);
  });
});

describe('regresión: los ejemplos del placeholder del buscador', () => {
  // placeholder = "Busca: chatbot, automatizar WhatsApp, crear vídeos…"
  // Dos de los tres devolvían 0 resultados en producción (QA 2026-08-03).
  const DOCS = [MANYCHAT, CLAUDE, MIDJOURNEY, HEYGEN, MAKE];

  it('"chatbot" encuentra herramientas de WhatsApp', () => {
    expect(hits('chatbot', DOCS)).toBeGreaterThan(0);
  });

  it('"automatizar WhatsApp" ya no devuelve 0', () => {
    expect(hits('automatizar WhatsApp', DOCS)).toBeGreaterThan(0);
  });

  it('"crear vídeos" y "crear videos" devuelven lo mismo', () => {
    expect(hits('crear vídeos', DOCS)).toBeGreaterThan(0);
    expect(hits('crear videos', DOCS)).toBe(hits('crear vídeos', DOCS));
  });
});

describe('regresión: búsquedas por tarea del público pyme', () => {
  const DOCS = [MANYCHAT, CLAUDE, MIDJOURNEY, HEYGEN, MAKE];

  it.each([
    ['facturas', 1],
    ['atender clientes', 1],
    ['atencion al cliente', 1],
    ['crear imagenes', 1],
    ['vender por chat', 1],
  ])('"%s" devuelve al menos %i resultado', (q, min) => {
    expect(hits(q as string, DOCS)).toBeGreaterThanOrEqual(min as number);
  });
});

describe('intentsFor', () => {
  it('cruza categorías con tilde y con ñ', () => {
    expect(intentsFor('Automatización')).toContain('facturas');
    expect(intentsFor('Diseño')).toContain('crear imagenes');
    expect(intentsFor('Vídeo')).toContain('crear videos');
    expect(intentsFor('Código')).toContain('programar');
  });

  it('categoría desconocida devuelve lista vacía, no lanza', () => {
    expect(intentsFor('Inexistente')).toEqual([]);
  });
});

describe('joinSteps', () => {
  it('numera y cierra cada paso con punto', () => {
    expect(joinSteps(['Entra en claude.ai y regístrate', 'Sube tu documento'])).toBe(
      '1) Entra en claude.ai y regístrate. 2) Sube tu documento.',
    );
  });

  it('no duplica la puntuación existente', () => {
    expect(joinSteps(['Escribe /imagine y tu descripción.'])).toBe(
      '1) Escribe /imagine y tu descripción.',
    );
  });

  it('ignora pasos vacíos', () => {
    expect(joinSteps(['Uno', '  ', ''])).toBe('1) Uno.');
  });

  it('lista vacía devuelve cadena vacía', () => {
    expect(joinSteps([])).toBe('');
  });
});

describe('lowerFirst', () => {
  it('baja la inicial de un texto normal', () => {
    expect(lowerFirst('Servicios profesionales')).toBe('servicios profesionales');
  });

  it('respeta siglas y nombres propios en mayúscula', () => {
    expect(lowerFirst('PyMEs con tienda')).toBe('PyMEs con tienda');
    expect(lowerFirst('IA generativa')).toBe('IA generativa');
  });

  it('tolera cadena vacía', () => {
    expect(lowerFirst('')).toBe('');
  });
});

describe('fallbackFaqs', () => {
  const tool = {
    slug: 'claude',
    name: 'Claude',
    desc: 'Textos largos.',
    long: 'Claude destaca redactando documentos extensos.',
    cat: 'Asistentes',
    price: 'Freemium',
    ideal: 'Servicios profesionales',
    steps: ['Entra en claude.ai y regístrate', 'Sube tu documento', 'Pídele un resumen'],
  } as Parameters<typeof fallbackFaqs>[0];

  it('la respuesta de "cómo empiezo" es gramatical, no un pegote', () => {
    const a = fallbackFaqs(tool).find((f) => f.q.startsWith('¿Cómo empiezo'))!.a;
    // Regresión: antes salía "…y regístrate Sube tu documento Pídele un resumen"
    expect(a).not.toMatch(/regístrate Sube/);
    expect(a).toContain('1) Entra en claude.ai y regístrate.');
    expect(a).toContain('3) Pídele un resumen.');
  });

  it('la respuesta de tipo de negocio no deja una mayúscula suelta', () => {
    const a = fallbackFaqs(tool).find((f) => f.q.startsWith('¿Para qué tipo'))!.a;
    expect(a).not.toBe('Ideal para Servicios profesionales.');
    expect(a).toBe('Claude encaja sobre todo en servicios profesionales.');
  });

  it('emite exactamente 4 preguntas', () => {
    expect(fallbackFaqs(tool)).toHaveLength(4);
  });
});
