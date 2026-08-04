import { describe, expect, it } from 'vitest';
import {
  HOME,
  PIE_SECUNDARIO,
  SECCIONES,
  SECCIONES_NAV,
  breadcrumbList,
  catSlug,
  crumbPath,
  crumbUrl,
  fichaTrail,
  trail,
  type CatEntry,
} from '../src/data/breadcrumbs';
import { SITE } from '../src/data/schema';

// Fixture con el caso que rompe la slugificación: "IA para tu negocio" vive en
// /cursos/negocio, no en /cursos/ia-para-tu-negocio.
const CATS: CatEntry[] = [
  { id: 'asistentes', data: { nombre: 'Asistentes' } },
  { id: 'video', data: { nombre: 'Vídeo' } },
  { id: 'negocio', data: { nombre: 'IA para tu negocio' } },
];

describe('crumbPath', () => {
  it('añade la barra final que falta', () => {
    expect(crumbPath('/herramientas')).toBe('/herramientas/');
  });

  it('no duplica la barra final si ya está', () => {
    expect(crumbPath('/herramientas/')).toBe('/herramientas/');
  });

  it('deja la raíz como una sola barra', () => {
    expect(crumbPath('/')).toBe('/');
  });

  it('antepone la barra inicial si falta', () => {
    expect(crumbPath('herramientas')).toBe('/herramientas/');
  });

  it('normaliza a la misma forma rutas equivalentes', () => {
    expect(crumbPath('/estudios')).toBe(crumbPath('/estudios/'));
  });
});

describe('crumbUrl', () => {
  it('devuelve una URL absoluta con barra final', () => {
    expect(crumbUrl('/herramientas')).toBe(`${SITE}/herramientas/`);
  });

  it('coincide con la forma del canonical de la home', () => {
    expect(crumbUrl('/')).toBe(`${SITE}/`);
  });
});

describe('trail', () => {
  it('siempre arranca en Inicio', () => {
    expect(trail(SECCIONES.estudios)[0]).toEqual(HOME);
  });

  it('conserva el orden de las migas que recibe', () => {
    const t = trail(SECCIONES.herramientas, { name: 'Asistentes', url: '/herramientas/asistentes' });
    expect(t.map((c) => c.name)).toEqual(['Inicio', 'Herramientas', 'Asistentes']);
  });
});

describe('breadcrumbList', () => {
  it('numera las posiciones de 1 a n', () => {
    const list = breadcrumbList(trail(SECCIONES.noticias, { name: 'Titular', url: '/noticias/titular' }));
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it('emite los @type que espera Google', () => {
    const list = breadcrumbList(trail(SECCIONES.cursos));
    expect(list['@type']).toBe('BreadcrumbList');
    expect(list.itemListElement.every((i) => i['@type'] === 'ListItem')).toBe(true);
  });

  it('emite todos los item con barra final, como el canonical', () => {
    const list = breadcrumbList(trail(SECCIONES.recursos, { name: 'Pack', url: '/recurso/pack-30-prompts' }));
    expect(list.itemListElement.map((i) => i.item)).toEqual([
      `${SITE}/`,
      `${SITE}/recursos/`,
      `${SITE}/recurso/pack-30-prompts/`,
    ]);
  });
});

describe('catSlug', () => {
  it('resuelve un nombre exacto a su slug de hub', () => {
    expect(catSlug(CATS, 'Asistentes')).toBe('asistentes');
  });

  it('resuelve nombres que no se pueden slugificar', () => {
    expect(catSlug(CATS, 'IA para tu negocio')).toBe('negocio');
  });

  it('devuelve undefined con un nombre desconocido', () => {
    expect(catSlug(CATS, 'Categoría inexistente')).toBeUndefined();
  });

  it('distingue mayúsculas y acentos', () => {
    expect(catSlug(CATS, 'video')).toBeUndefined();
    expect(catSlug(CATS, 'Vídeo')).toBe('video');
  });
});

describe('fichaTrail', () => {
  const base = {
    seccion: SECCIONES.herramientas,
    categoriaBase: '/herramientas',
    cats: CATS,
    titulo: 'ChatGPT',
    url: '/herramienta/chatgpt',
  };

  it('construye 4 niveles enlazando el hub de categoría', () => {
    const t = fichaTrail({ ...base, categoria: 'Asistentes' });
    expect(t).toEqual([
      HOME,
      SECCIONES.herramientas,
      { name: 'Asistentes', url: '/herramientas/asistentes' },
      { name: 'ChatGPT', url: '/herramienta/chatgpt' },
    ]);
  });

  it('degrada a 3 niveles si la categoría no resuelve', () => {
    const t = fichaTrail({ ...base, categoria: 'Categoría borrada' });
    expect(t.map((c) => c.name)).toEqual(['Inicio', 'Herramientas', 'ChatGPT']);
  });

  it('nunca emite un enlace a un hub inexistente al degradar', () => {
    const t = fichaTrail({ ...base, categoria: 'Categoría borrada' });
    expect(t.some((c) => c.url.startsWith('/herramientas/'))).toBe(false);
  });

  it('usa la base de categoría de su propia sección', () => {
    const t = fichaTrail({
      seccion: SECCIONES.cursos,
      categoriaBase: '/cursos',
      cats: CATS,
      categoria: 'IA para tu negocio',
      titulo: 'Curso X',
      url: '/curso/curso-x',
    });
    expect(t[2]).toEqual({ name: 'IA para tu negocio', url: '/cursos/negocio' });
  });
});

describe('paridad HTML / JSON-LD', () => {
  it('el JSON-LD tiene un item por miga visible', () => {
    const t = fichaTrail({
      seccion: SECCIONES.herramientas,
      categoriaBase: '/herramientas',
      cats: CATS,
      categoria: 'Vídeo',
      titulo: 'Runway',
      url: '/herramienta/runway',
    });
    expect(breadcrumbList(t).itemListElement).toHaveLength(t.length);
  });

  it('los nombres del JSON-LD son los mismos que verá la persona', () => {
    const t = trail(SECCIONES.estudios, { name: 'Mejores IA para vender', url: '/estudios/mejores-ia-vender' });
    expect(breadcrumbList(t).itemListElement.map((i) => i.name)).toEqual(t.map((c) => c.name));
  });

  it('el href visible y el item del JSON-LD apuntan a la misma URL', () => {
    const t = trail(SECCIONES.herramientas);
    const list = breadcrumbList(t);
    t.forEach((c, i) => {
      expect(list.itemListElement[i].item).toBe(`${SITE}${crumbPath(c.url)}`);
    });
  });
});

describe('columna vertebral de navegación', () => {
  it('expone las seis secciones que renderizan header y footer', () => {
    expect(SECCIONES_NAV.map((s) => s.name)).toEqual([
      'Herramientas',
      'Cursos',
      'Prompts',
      'Recursos',
      'Estudios',
      'Noticias',
    ]);
  });

  it('ningún enlace de navegación es un fragmento: no puede ser sitelink', () => {
    const todos = [...SECCIONES_NAV, ...PIE_SECUNDARIO];
    expect(todos.every((s) => s.url.startsWith('/') && !s.url.includes('#'))).toBe(true);
  });

  it('las secciones y los secundarios no se solapan', () => {
    const secciones = new Set(SECCIONES_NAV.map((s) => s.url));
    expect(PIE_SECUNDARIO.some((s) => secciones.has(s.url))).toBe(false);
  });

  // Regresión: al rebasar, /metodologia se quedó fuera de PIE_SECUNDARIO y el
  // pie dejó de enlazarla. Es una página indexable y una señal de confianza del
  // directorio; sin enlaces internos queda huérfana.
  it('el pie enlaza todas las páginas indexables que no son sección', () => {
    const urls = PIE_SECUNDARIO.map((s) => s.url);
    expect(urls).toContain('/metodologia');
    expect(urls).toContain('/generador-de-prompts');
    expect(urls).toContain('/newsletter');
    expect(urls).toContain('/privacidad');
    expect(urls).toContain('/aviso-legal');
    expect(urls).toContain('/cookies');
  });

  it('ninguna entrada del pie se repite', () => {
    const urls = PIE_SECUNDARIO.map((s) => s.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
