// Tipos + constantes + helpers de la tienda. Los DATOS viven en content
// collections (`src/content/recursos`, `src/content/recursos-categorias`).
import type { CollectionEntry } from 'astro:content';

export type Precio = 'Gratis' | 'Pago';
export type TipoRecurso = 'prompts' | 'skill' | 'plantilla' | 'curso';

export interface Recurso {
  slug: string;
  titulo: string;
  tipo: TipoRecurso;
  categoria: string;
  desc: string;
  long: string;
  tagline: string;
  ideal: string;
  formato: string;
  precio: Precio;
  precioDesde?: string;
  gumroadUrl?: string;
  downloadUrl?: string;
  gated: boolean;
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

const TIPO_LABEL: Record<TipoRecurso, string> = {
  prompts: 'Prompts',
  skill: 'Skill',
  plantilla: 'Plantilla',
  curso: 'Curso',
};
export function tipoLabel(t: TipoRecurso): string {
  return TIPO_LABEL[t];
}

// Normaliza una entrada de la colección `recursos` a Recurso (id → slug).
export function toRecurso(entry: CollectionEntry<'recursos'>): Recurso {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternativesRecursos(all: Recurso[], recurso: Recurso): Recurso[] {
  return all.filter((r) => r.categoria === recurso.categoria && r.slug !== recurso.slug).slice(0, 3);
}

// FAQs de respaldo (cuando no hay faq curadas). Visibles + emitidas como FAQPage.
export function fallbackFaqsRecurso(recurso: Recurso): { q: string; a: string }[] {
  const precio =
    recurso.precio === 'Gratis'
      ? `Sí, ${recurso.titulo} es gratis.`
      : `${recurso.titulo} es de pago${recurso.precioDesde ? ` (desde ${recurso.precioDesde})` : ''}.`;
  return [
    { q: `¿Qué incluye ${recurso.titulo}?`, a: recurso.long },
    { q: `¿${recurso.titulo} es gratis?`, a: precio },
    { q: `¿Para quién es ${recurso.titulo}?`, a: `Ideal para ${recurso.ideal}.` },
    { q: `¿En qué formato está ${recurso.titulo}?`, a: recurso.formato + '.' },
  ];
}

// Guard de build: ningún slug de recurso puede chocar con uno ya usado en /ir
// (herramientas + cursos), porque comparten el endpoint /ir/[slug].
export function assertNoSlugCollision(existingSlugs: string[], recursoSlugs: string[]): void {
  const existing = new Set(existingSlugs);
  const dup = recursoSlugs.filter((s) => existing.has(s));
  if (dup.length) {
    throw new Error(
      `[recursos] Colisión de slug con herramientas/cursos en /ir: ${dup.join(', ')}. Renombra el JSON del recurso.`,
    );
  }
}
