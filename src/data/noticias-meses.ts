/**
 * Agrupación por mes del listado de noticias.
 *
 * Vive fuera del `.astro` para que sea testeable: la página solo le pasa la
 * lista ya ordenada y pinta el resultado.
 */

/** Entrada mínima: cualquier cosa con fecha. El resto de campos viaja intacto. */
export interface ConFecha {
  fecha: Date;
}

export interface GrupoMes<T extends ConFecha> {
  /** Etiqueta en español, con año: "julio de 2026". */
  etiqueta: string;
  items: T[];
}

/**
 * Etiqueta de mes en es-ES, siempre con año (evita colisiones entre diciembres).
 *
 * En UTC a propósito: las fechas del frontmatter (`fecha: 2026-07-01`) llegan a
 * medianoche UTC, así que resolverlas en la zona de la máquina de build metería
 * las noticias del día 1 en el mes anterior.
 */
export function etiquetaDeMes(fecha: Date): string {
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Agrupa en rachas consecutivas, preservando el orden de entrada. No reordena:
 * si la lista llega desordenada, un mismo mes puede aparecer en dos grupos, que
 * es exactamente lo que refleja el orden recibido.
 */
export function agruparPorMes<T extends ConFecha>(noticias: T[]): GrupoMes<T>[] {
  const meses: GrupoMes<T>[] = [];
  for (const n of noticias) {
    const etiqueta = etiquetaDeMes(n.fecha);
    const ultimo = meses[meses.length - 1];
    if (ultimo && ultimo.etiqueta === etiqueta) ultimo.items.push(n);
    else meses.push({ etiqueta, items: [n] });
  }
  return meses;
}
