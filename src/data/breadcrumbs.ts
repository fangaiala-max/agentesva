// Migas de pan (SERP): única fuente de verdad para el HTML visible y el JSON-LD.
// La página construye un `trail` y lo pasa TANTO a <Breadcrumb> como a
// breadcrumbList() — ese array compartido es lo que impide que ambos se separen.
// Google exige que la miga marcada coincida con la que ve el usuario.
import { SITE } from './schema';

export interface Crumb {
  name: string;
  /** Ruta relativa al sitio, p. ej. '/herramientas/asistentes'. */
  url: string;
}

/** Entrada mínima de una colección `*-categorias` (o `categories`). */
export interface CatEntry {
  id: string;
  data: { nombre: string };
}

export const HOME: Crumb = { name: 'Inicio', url: '/' };

/** Antepone Inicio: toda miga del sitio arranca en la raíz. */
export const trail = (...rest: Crumb[]): Crumb[] => [HOME, ...rest];

// El build usa format: 'directory', así que los canonical y el sitemap emiten
// URLs con barra final. Las migas tienen que declarar exactamente esa forma o
// Google ve dos URLs distintas para la misma página. El href visible usa la misma
// forma para no gastar un salto de redirección.
export const crumbPath = (path: string): string => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean.endsWith('/') ? clean : `${clean}/`;
};

export const crumbUrl = (path: string): string => `${SITE}${crumbPath(path)}`;

export const breadcrumbList = (crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: crumbUrl(c.url),
  })),
});

// El contenido guarda la categoría por su nombre visible ("IA para tu negocio"),
// no por su slug. Slugificar no sirve: esa categoría vive en /cursos/negocio.
// La única resolución fiable es contra la propia colección de categorías, que es
// además como filtran las páginas de categoría.
export const catSlug = (cats: CatEntry[], nombre: string): string | undefined =>
  cats.find((c) => c.data.nombre === nombre)?.id;

/**
 * Miga de una ficha: Inicio › Sección › Categoría › Título.
 * Si la categoría no resuelve contra la colección, degrada a 3 niveles en vez de
 * emitir un enlace roto — las categorías son datos editables.
 */
export const fichaTrail = (opts: {
  seccion: Crumb;
  /** Base de las páginas de categoría, p. ej. '/herramientas'. */
  categoriaBase: string;
  cats: CatEntry[];
  categoria: string;
  titulo: string;
  url: string;
}): Crumb[] => {
  const slug = catSlug(opts.cats, opts.categoria);
  const medio: Crumb[] = slug
    ? [{ name: opts.categoria, url: `${opts.categoriaBase}/${slug}` }]
    : [];
  return trail(opts.seccion, ...medio, { name: opts.titulo, url: opts.url });
};

// Secciones del sitio. Mismo texto de ancla que el <nav> del header y del footer:
// la consistencia entre navegación, migas y anclas es de lo que Google deriva los
// sitelinks de marca.
export const SECCIONES = {
  herramientas: { name: 'Herramientas', url: '/herramientas' },
  cursos: { name: 'Cursos', url: '/cursos' },
  prompts: { name: 'Prompts', url: '/prompts' },
  recursos: { name: 'Recursos', url: '/recursos' },
  estudios: { name: 'Estudios', url: '/estudios' },
  guias: { name: 'Guías', url: '/guias' },
  noticias: { name: 'Noticias', url: '/noticias' },
} as const satisfies Record<string, Crumb>;

// Orden canónico del <nav>. El header y el footer renderizan ESTE array, así que
// no pueden discrepar entre sí ni con las migas: es la señal de la que Google
// deriva los sitelinks. Nada de fragmentos (#pack) aquí — un fragmento nunca
// puede convertirse en sitelink.
export const SECCIONES_NAV: readonly Crumb[] = [
  SECCIONES.herramientas,
  SECCIONES.cursos,
  SECCIONES.prompts,
  SECCIONES.recursos,
  SECCIONES.estudios,
  SECCIONES.guias,
  SECCIONES.noticias,
];

export const NAVEGACION_COMERCIAL: readonly Crumb[] = [
  { name: 'Servicios', url: '/servicios' },
  { name: 'Precios', url: '/precios-automatizacion-ia' },
  { name: 'Cómo trabajamos', url: '/como-trabajamos' },
] as const;

export const DIAGNOSTICO: Crumb = { name: 'Diagnóstico', url: '/diagnostico-automatizacion-ia' };

// Enlaces secundarios del pie: útiles para la persona, irrelevantes como sitelink.
// Van en una fila aparte para no diluir las secciones principales de arriba.
export const PIE_SECUNDARIO: readonly Crumb[] = [
  { name: 'Generador de prompts', url: '/generador-de-prompts' },
  { name: 'Newsletter', url: '/newsletter' },
  { name: 'Metodología', url: '/metodologia' },
  { name: 'Privacidad', url: '/privacidad' },
  { name: 'Aviso legal', url: '/aviso-legal' },
  { name: 'Cookies', url: '/cookies' },
];
