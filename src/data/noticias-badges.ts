/**
 * Distintivos editoriales del listado de noticias (CRO).
 *
 * No hay analítica en build (sitio estático, sin BD), así que ambos distintivos
 * se derivan de forma determinista del propio contenido:
 *
 * - `nuevo`      → publicada en los últimos {@link DIAS_NUEVO} días.
 * - `tendencia`  → su `tema` acumula ≥ {@link MIN_TEMA_TENDENCIA} noticias en la
 *                  ventana de {@link DIAS_TENDENCIA} días (momentum del tema).
 *
 * Son independientes: una noticia puede llevar los dos. Se devuelven siempre en
 * orden `nuevo` → `tendencia`.
 */

export const DIAS_NUEVO = 7;
export const DIAS_TENDENCIA = 30;
export const MIN_TEMA_TENDENCIA = 2;

const DIA_MS = 86_400_000;

export type Badge = 'nuevo' | 'tendencia';

/** Entrada mínima que necesitan los cálculos (subconjunto de `noticias[].data`). */
export interface NoticiaBadgeInput {
  fecha: Date;
  tema: string;
}

const diasDesde = (fecha: Date, ahora: Date): number => (ahora.getTime() - fecha.getTime()) / DIA_MS;

/** Temas con momentum: ≥ MIN_TEMA_TENDENCIA noticias en los últimos DIAS_TENDENCIA días. */
export function temasEnTendencia(noticias: NoticiaBadgeInput[], ahora: Date): Set<string> {
  const conteo = new Map<string, number>();
  for (const n of noticias) {
    const dias = diasDesde(n.fecha, ahora);
    if (dias < 0 || dias > DIAS_TENDENCIA) continue;
    conteo.set(n.tema, (conteo.get(n.tema) ?? 0) + 1);
  }
  const tendencia = new Set<string>();
  for (const [tema, n] of conteo) if (n >= MIN_TEMA_TENDENCIA) tendencia.add(tema);
  return tendencia;
}

/** Distintivos de una noticia (0, 1 o 2), en orden `nuevo` → `tendencia`. */
export function badgesDeNoticia(
  noticia: NoticiaBadgeInput,
  tendencias: Set<string>,
  ahora: Date,
): Badge[] {
  const badges: Badge[] = [];
  const dias = diasDesde(noticia.fecha, ahora);
  if (dias >= 0 && dias <= DIAS_NUEVO) badges.push('nuevo');
  if (tendencias.has(noticia.tema)) badges.push('tendencia');
  return badges;
}

/** Calcula los distintivos de cada noticia en una sola pasada, en el mismo orden. */
export function badgesDeNoticias(noticias: NoticiaBadgeInput[], ahora: Date): Badge[][] {
  const tendencias = temasEnTendencia(noticias, ahora);
  return noticias.map((n) => badgesDeNoticia(n, tendencias, ahora));
}
