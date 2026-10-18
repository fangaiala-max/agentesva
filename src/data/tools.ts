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
  popular?: boolean;
  verdict?: string;
  pros?: string[];
  cons?: string[];
  addedAt?: Date;
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
    {
      q: `¿Para qué tipo de negocio es ${tool.name}?`,
      a: `${tool.name} encaja sobre todo en ${lowerFirst(tool.ideal)}.`,
    },
    { q: `¿Cómo empiezo a usar ${tool.name}?`, a: joinSteps(tool.steps) },
  ];
}

// Une los pasos como frases de verdad. `steps.join(' ')` los pegaba sin
// puntuación —"Entra en claude.ai y regístrate Sube tu documento…"— y ese texto
// no solo se ve en la ficha: viaja dentro del JSON-LD de FAQPage, así que
// Google y los asistentes de IA ingerían español roto de las 54 fichas.
export function joinSteps(steps: string[]): string {
  return steps
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i) => {
      const numbered = `${i + 1}) ${s}`;
      return /[.!?…]$/.test(numbered) ? numbered : `${numbered}.`;
    })
    .join(' ');
}

// "Servicios profesionales" → "servicios profesionales", para que no quede una
// mayúscula suelta a media frase. Si la primera palabra lleva alguna mayúscula
// más allá de la inicial es sigla o nombre propio ("IA", "PyMEs") y se respeta.
export function lowerFirst(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const firstWord = t.split(/\s/)[0] ?? '';
  if (/\p{Lu}/u.test(firstWord.slice(1))) return t;
  return t[0]!.toLowerCase() + t.slice(1);
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

// Badges honestos del directorio: cada uno mapea a un campo real (nunca inventados).
export type BadgeKind = 'editor' | 'popular' | 'free' | 'nuevo';
export interface Badge {
  kind: BadgeKind;
  label: string;
}

const NUEVO_DIAS = 30;

export function badgesFor(t: Tool, now: Date = new Date()): Badge[] {
  const badges: Badge[] = [];
  if (t.destacado) badges.push({ kind: 'editor', label: '★ Editor' });
  if (t.popular) badges.push({ kind: 'popular', label: 'Popular' });
  if (t.price === 'Freemium') badges.push({ kind: 'free', label: 'Plan gratis' });
  if (t.addedAt) {
    const dias = (now.getTime() - new Date(t.addedAt).getTime()) / 86_400_000;
    if (dias >= 0 && dias <= NUEVO_DIAS) badges.push({ kind: 'nuevo', label: 'Nuevo' });
  }
  return badges;
}
