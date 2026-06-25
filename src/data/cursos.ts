// Tipos + constantes + helpers del directorio de cursos. Los DATOS viven en
// content collections (`src/content/cursos`, `src/content/cursos-categorias`).
import type { CollectionEntry } from 'astro:content';

export type Precio = 'Gratis' | 'Pago';
export type Nivel = 'principiante' | 'intermedio' | 'avanzado';
export type TipoCurso = 'externo' | 'propio';

export interface Curso {
  slug: string;
  titulo: string;
  proveedor: string;
  categoria: string;
  nivel: Nivel;
  desc: string;
  long: string;
  tagline: string;
  ideal: string;
  precio: Precio;
  precioDesde?: string;
  idioma: string;
  duracion?: string;
  certificado?: boolean;
  tipo: TipoCurso;
  officialUrl: string;
  affiliateUrl?: string;
  gumroadUrl?: string;
  color: string;
  orden: number;
  destacado: boolean;
  actualizado: string;
  faq?: { q: string; a: string }[];
}

export const PRECIO_COLOR: Record<Precio, string> = {
  Gratis: '#4ec98a',
  Pago: '#5B7CFF',
};

const NIVEL_LABEL: Record<Nivel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
export function nivelLabel(n: Nivel): string {
  return NIVEL_LABEL[n];
}

// Normaliza una entrada de la colección `cursos` a Curso (id → slug).
export function toCurso(entry: CollectionEntry<'cursos'>): Curso {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternativesCursos(all: Curso[], curso: Curso): Curso[] {
  return all.filter((c) => c.categoria === curso.categoria && c.slug !== curso.slug).slice(0, 3);
}

// FAQs de respaldo derivadas de los datos (cuando no hay faq curadas).
// Visibles en la ficha + emitidas como FAQPage (Google exige que coincidan).
export function fallbackFaqsCurso(curso: Curso): { q: string; a: string }[] {
  const precio =
    curso.precio === 'Gratis'
      ? `Sí, ${curso.titulo} es un curso gratuito.`
      : `${curso.titulo} es un curso de pago${curso.precioDesde ? ` (desde ${curso.precioDesde})` : ''}.`;
  return [
    { q: `¿Qué aprenderás en ${curso.titulo}?`, a: curso.long },
    { q: `¿${curso.titulo} es gratis?`, a: precio },
    { q: `¿Para quién es ${curso.titulo}?`, a: `Ideal para ${curso.ideal}.` },
    { q: `¿Qué nivel necesito para ${curso.titulo}?`, a: `Nivel ${NIVEL_LABEL[curso.nivel].toLowerCase()}.` },
  ];
}

// Guard de build: ningún slug de curso puede chocar con uno de herramienta,
// porque ambas colecciones comparten el endpoint /ir/[slug].
export function assertNoSlugCollision(toolSlugs: string[], cursoSlugs: string[]): void {
  const tools = new Set(toolSlugs);
  const dup = cursoSlugs.filter((s) => tools.has(s));
  if (dup.length) {
    throw new Error(
      `[cursos] Colisión de slug con herramientas en /ir: ${dup.join(', ')}. Renombra el JSON del curso.`,
    );
  }
}
