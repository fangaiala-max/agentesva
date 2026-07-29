/**
 * Distintivos editoriales del listado de noticias (CRO).
 *
 * No hay analítica en build (sitio estático, sin BD), así que ambos distintivos
 * se derivan de forma determinista del propio contenido:
 *
 * - `nuevo`      → publicada en los últimos {@link DIAS_NUEVO} días.
 * - `tendencia`  → su `tema` aparece en ≥ {@link MIN_DIAS_TENDENCIA} **días
 *                  distintos** dentro de la ventana de {@link DIAS_TENDENCIA}.
 *
 * Se cuentan días y no noticias porque la pipeline publica en tandas: tres
 * noticias del mismo día no son momentum, son una tanda. Un tema que vuelve
 * otro día sí lo es.
 *
 * Además, `tendencia` no se pinta sobre una noticia que ya es `nuevo`: dos
 * píldoras a la vez dirían lo mismo. El valor está en marcar la noticia
 * antigua de un tema caliente, que es la que necesita el empujón al clic. Por
 * eso cada noticia lleva **como máximo un distintivo**.
 */

export const DIAS_NUEVO = 7;
export const DIAS_TENDENCIA = 30;
/** Días distintos con publicación que hacen "tendencia" a un tema. */
export const MIN_DIAS_TENDENCIA = 2;

const DIA_MS = 86_400_000;

export type Badge = 'nuevo' | 'tendencia';

/** Entrada mínima que necesitan los cálculos (subconjunto de `noticias[].data`). */
export interface NoticiaBadgeInput {
  fecha: Date;
  tema: string;
}

const diasDesde = (fecha: Date, ahora: Date): number => (ahora.getTime() - fecha.getTime()) / DIA_MS;

/**
 * Clave de tema. `tema` es texto libre en el frontmatter (`z.string()`), así que
 * un "Asistentes " con espacio o un "asistentes" en minúscula romperían el
 * recuento en silencio. La etiqueta visible sigue siendo la original.
 */
export const claveDeTema = (tema: string): string => tema.trim().toLocaleLowerCase('es');

/** Día natural en UTC (`2026-07-28`), para que la tanda de un día cuente una vez. */
const diaUTC = (fecha: Date): string => fecha.toISOString().slice(0, 10);

/**
 * Temas con momentum: publicados en ≥ MIN_DIAS_TENDENCIA días distintos dentro
 * de la ventana de DIAS_TENDENCIA. Devuelve claves normalizadas.
 */
export function temasEnTendencia(noticias: NoticiaBadgeInput[], ahora: Date): Set<string> {
  const diasPorTema = new Map<string, Set<string>>();
  for (const n of noticias) {
    const dias = diasDesde(n.fecha, ahora);
    if (dias < 0 || dias > DIAS_TENDENCIA) continue;
    const clave = claveDeTema(n.tema);
    const vistos = diasPorTema.get(clave) ?? new Set<string>();
    vistos.add(diaUTC(n.fecha));
    diasPorTema.set(clave, vistos);
  }
  const tendencia = new Set<string>();
  for (const [clave, dias] of diasPorTema) {
    if (dias.size >= MIN_DIAS_TENDENCIA) tendencia.add(clave);
  }
  return tendencia;
}

/**
 * Distintivos de una noticia (0 o 1), en orden de prioridad `nuevo` → `tendencia`.
 * `tendencias` debe venir de {@link temasEnTendencia}: contiene claves normalizadas.
 */
export function badgesDeNoticia(
  noticia: NoticiaBadgeInput,
  tendencias: Set<string>,
  ahora: Date,
): Badge[] {
  const dias = diasDesde(noticia.fecha, ahora);
  if (dias >= 0 && dias <= DIAS_NUEVO) return ['nuevo'];
  if (dias >= 0 && tendencias.has(claveDeTema(noticia.tema))) return ['tendencia'];
  return [];
}

/** Calcula los distintivos de cada noticia en una sola pasada, en el mismo orden. */
export function badgesDeNoticias(noticias: NoticiaBadgeInput[], ahora: Date): Badge[][] {
  const tendencias = temasEnTendencia(noticias, ahora);
  return noticias.map((n) => badgesDeNoticia(n, tendencias, ahora));
}
