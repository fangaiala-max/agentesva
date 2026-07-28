// Frescura editorial del sitio. El ticker del header decía "Actualizado hoy"
// como texto fijo: una afirmación falsa en cuanto pasaba un día sin publicar.
// Aquí la derivamos de las fechas reales de las colecciones — si el contenido
// lleva un mes parado, el header lo dice. La transparencia es parte del producto
// (ver el aviso legal: declaramos los enlaces de afiliado, no vamos a mentir
// justo en la etiqueta de al lado).

const DIA_MS = 86_400_000;

// Hasta cuántos días el directorio se considera "fresco" (punto verde vivo).
const FRESCO_DIAS = 7;

// A partir de aquí dejamos de contar días y damos la fecha exacta.
const DIAS_MAX = 30;

const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export interface Frescura {
  /** Texto de la píldora: "Actualizado hoy", "Actualizado hace 12 días"… */
  label: string;
  /** ≤ FRESCO_DIAS: el punto late en verde. Si no, señal apagada. */
  fresco: boolean;
  /** YYYY-MM-DD para <time datetime>. */
  iso: string;
}

/**
 * Fecha más reciente de una lista, ignorando vacíos e inválidas.
 * `undefined` si no queda ninguna utilizable.
 */
export function ultimaActualizacion(
  fechas: (Date | string | undefined | null)[],
): Date | undefined {
  let max: Date | undefined;
  for (const f of fechas) {
    if (!f) continue;
    const d = f instanceof Date ? f : new Date(f);
    if (Number.isNaN(d.getTime())) continue;
    if (!max || d > max) max = d;
  }
  return max;
}

// Día natural en UTC: el frontmatter son fechas planas (YYYY-MM-DD → medianoche
// UTC) y el build corre en UTC, así que comparamos días, no milisegundos —
// publicar a las 23:00 no debe contar como "hace 2 días" a la 1:00.
const diaUTC = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/**
 * Etiqueta honesta de frescura. `null` cuando no hay fecha: sin dato preferimos
 * no enseñar la píldora antes que afirmar algo que no podemos respaldar.
 */
export function frescura(fecha: Date | undefined, now: Date = new Date()): Frescura | null {
  if (!fecha || Number.isNaN(fecha.getTime())) return null;

  const dias = Math.round((diaUTC(now) - diaUTC(fecha)) / DIA_MS);
  const iso = new Date(diaUTC(fecha)).toISOString().slice(0, 10);
  const fresco = dias >= 0 && dias <= FRESCO_DIAS;

  // Fecha futura (contenido programado) o demasiado antigua: fecha exacta, que
  // nunca caduca ni exagera.
  if (dias < 0 || dias > DIAS_MAX) {
    const label = `Actualizado el ${fecha.getUTCDate()} ${MESES_CORTOS[fecha.getUTCMonth()]} ${fecha.getUTCFullYear()}`;
    return { label, fresco, iso };
  }

  const label =
    dias === 0 ? 'Actualizado hoy' : dias === 1 ? 'Actualizado ayer' : `Actualizado hace ${dias} días`;
  return { label, fresco, iso };
}
