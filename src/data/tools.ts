// Tipos + constantes + helpers del directorio. Los DATOS viven en content
// collections (`src/content/tools`, `src/content/categories`) — ver content.config.ts.
import type { CollectionEntry } from 'astro:content';

export type Price = 'Gratis' | 'Freemium' | 'Pago';

export interface Tool {
  slug: string;
  name: string;
  cat: string;
  desc: string;
  price: Price;
  rating: string;
  color: string;
  tagline: string;
  ideal: string;
  url: string;
  affiliateUrl?: string;
  long: string;
  features: string[];
  steps: string[];
  orden: number;
  destacado?: boolean;
  faq?: { q: string; a: string }[];
}

// FAQs de respaldo derivadas de los datos (cuando no hay faq generadas por IA).
// Visibles en la ficha + emitidas como FAQPage (Google exige que coincidan).
export function fallbackFaqs(tool: Tool): { q: string; a: string }[] {
  const precio =
    tool.price === 'Gratis'
      ? `Sí, ${tool.name} se puede usar gratis.`
      : tool.price === 'Freemium'
        ? `${tool.name} tiene un plan gratuito y planes de pago con más funciones.`
        : `${tool.name} es una herramienta de pago.`;
  return [
    { q: `¿Qué es ${tool.name} y para qué sirve?`, a: tool.long },
    { q: `¿${tool.name} es gratis?`, a: precio },
    { q: `¿Para qué tipo de negocio es ${tool.name}?`, a: `Ideal para ${tool.ideal}.` },
    { q: `¿Cómo empiezo a usar ${tool.name}?`, a: tool.steps.join(' ') },
  ];
}

// Tokens del sistema (global.css) — un solo sitio para retocar la paleta.
// Solo para contextos CSS (atributos style); no usar donde no resuelva var().
export const PRICE_COLOR: Record<Price, string> = {
  Gratis: 'var(--green)',
  Freemium: 'var(--accent)',
  Pago: 'var(--fg-3)',
};

// Orden "Gratis primero" compartido por la home (estantes y ordenación).
export const priceRank = (p: string) => (p === 'Gratis' ? 0 : p === 'Freemium' ? 1 : 2);

// Claim honesto "+N herramientas": redondeo a la baja a decenas (54 → "+50");
// por debajo de 10, el número exacto (nunca "+0" ni sobreclamar).
export const toolsClaim = (n: number) => (n >= 10 ? Math.floor(n / 10) * 10 : n);

// Normaliza una entrada de la colección `tools` a Tool (id → slug).
export function toTool(entry: CollectionEntry<'tools'>): Tool {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternatives(all: Tool[], tool: Tool): Tool[] {
  return all.filter((t) => t.cat === tool.cat && t.slug !== tool.slug).slice(0, 3);
}
