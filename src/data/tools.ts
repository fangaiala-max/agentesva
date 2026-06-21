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
}

export const PRICE_COLOR: Record<Price, string> = {
  Gratis: '#4ec98a',
  Freemium: '#5B7CFF',
  Pago: '#a5a5b2',
};

// Normaliza una entrada de la colección `tools` a Tool (id → slug).
export function toTool(entry: CollectionEntry<'tools'>): Tool {
  return { slug: entry.id, ...entry.data };
}

// Mismas categorías, ≠ slug; máx 3.
export function getAlternatives(all: Tool[], tool: Tool): Tool[] {
  return all.filter((t) => t.cat === tool.cat && t.slug !== tool.slug).slice(0, 3);
}
