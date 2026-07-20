// Lógica pura de la salida afiliado (/ir/[slug]). Sin dependencias de astro:content,
// para poder testearla. La ruta la consume en src/pages/ir/[slug].ts.

/** Enlace de salida tracked: /ir/{slug}?src={placement}. */
export function affiliateHref(slug: string, src: string): string {
  return `/ir/${slug}?src=${encodeURIComponent(src)}`;
}

/** Sólo placements con forma conocida (evita basura/inyección en los logs). */
export function sanitizeSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return /^[a-z0-9-]{1,40}$/.test(raw) ? raw : null;
}

/** Destino de una herramienta: afiliado si existe, si no la url oficial. */
export function pickToolDest(tool: { url: string; affiliateUrl?: string }): {
  dest: string;
  hasAffiliate: boolean;
} {
  const hasAffiliate = Boolean(tool.affiliateUrl);
  return { dest: tool.affiliateUrl || tool.url, hasAffiliate };
}

export interface ClickLog {
  evt: 'ir_click';
  ts: string;
  type: string;
  slug: string;
  hasAffiliate: boolean;
  src: string | null;
  referer: string | null;
  dest: string;
}

/** Payload estructurado que se emite por console.log (fuente de verdad en Vercel logs). */
export function buildClickLog(p: {
  type: string;
  slug: string;
  dest: string;
  hasAffiliate: boolean;
  src: string | null;
  referer: string | null;
  ts: string;
}): ClickLog {
  return {
    evt: 'ir_click',
    ts: p.ts,
    type: p.type,
    slug: p.slug,
    hasAffiliate: p.hasAffiliate,
    src: p.src,
    referer: p.referer,
    dest: p.dest,
  };
}
