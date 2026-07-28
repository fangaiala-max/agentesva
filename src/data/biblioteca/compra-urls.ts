// Mapa id de Item -> Stripe Payment Link, para blueprints comprados sueltos (1,99 €).
// Se rellena incrementalmente a medida que se cablean más ítems. Piloto:
// grupo "Auditoría de tu software" (sw01-sw25). El resto queda pendiente.
export const COMPRA_URLS: Record<string, string> = {};

export function compraUrlDeItem(id: string): string | undefined {
  return COMPRA_URLS[id];
}
