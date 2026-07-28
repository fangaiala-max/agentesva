import { describe, expect, it } from 'vitest';
import { frescura, ultimaActualizacion } from '../src/data/frescura';

// Fecha fija de referencia: 20 jul 2026 (mediodía UTC, para que la normalización
// a día natural no dependa de la hora del reloj).
const AHORA = new Date('2026-07-20T12:00:00Z');
const hace = (dias: number) => new Date(Date.UTC(2026, 6, 20) - dias * 86_400_000);

describe('ultimaActualizacion', () => {
  it('devuelve la fecha más reciente de la lista', () => {
    const max = ultimaActualizacion([
      new Date('2026-06-22T00:00:00Z'),
      new Date('2026-06-25T00:00:00Z'),
      new Date('2026-06-18T00:00:00Z'),
    ]);
    expect(max?.toISOString()).toBe('2026-06-25T00:00:00.000Z');
  });

  it('acepta cadenas ISO además de Date', () => {
    expect(ultimaActualizacion(['2026-01-01', '2026-03-01'])?.getUTCMonth()).toBe(2);
  });

  it('ignora vacíos y fechas inválidas', () => {
    const max = ultimaActualizacion([undefined, null, 'no-es-una-fecha', new Date('2026-05-05T00:00:00Z')]);
    expect(max?.toISOString()).toBe('2026-05-05T00:00:00.000Z');
  });

  it('devuelve undefined cuando no hay ninguna fecha utilizable', () => {
    expect(ultimaActualizacion([])).toBeUndefined();
    expect(ultimaActualizacion([undefined, null])).toBeUndefined();
  });
});

describe('frescura', () => {
  it('sin fecha no afirma nada (null)', () => {
    expect(frescura(undefined, AHORA)).toBeNull();
    expect(frescura(new Date('invalida'), AHORA)).toBeNull();
  });

  it('dice "hoy" solo cuando de verdad es hoy', () => {
    expect(frescura(hace(0), AHORA)?.label).toBe('Actualizado hoy');
  });

  it('cuenta por día natural, no por horas transcurridas', () => {
    // Publicado ayer a las 23:00, ahora la 1:00 → "ayer", no "hoy".
    const anoche = new Date('2026-07-19T23:00:00Z');
    const madrugada = new Date('2026-07-20T01:00:00Z');
    expect(frescura(anoche, madrugada)?.label).toBe('Actualizado ayer');
  });

  it('usa "ayer" y luego el conteo de días', () => {
    expect(frescura(hace(1), AHORA)?.label).toBe('Actualizado ayer');
    expect(frescura(hace(2), AHORA)?.label).toBe('Actualizado hace 2 días');
    expect(frescura(hace(25), AHORA)?.label).toBe('Actualizado hace 25 días');
  });

  it('marca fresco hasta 7 días y apagado a partir de ahí', () => {
    expect(frescura(hace(7), AHORA)?.fresco).toBe(true);
    expect(frescura(hace(8), AHORA)?.fresco).toBe(false);
  });

  it('pasados 30 días da la fecha exacta en vez de un conteo enorme', () => {
    expect(frescura(hace(30), AHORA)?.label).toBe('Actualizado hace 30 días');
    expect(frescura(hace(31), AHORA)?.label).toBe('Actualizado el 19 jun 2026');
    expect(frescura(hace(31), AHORA)?.fresco).toBe(false);
  });

  it('no presume de frescura con fechas futuras', () => {
    const futuro = frescura(new Date('2026-08-01T00:00:00Z'), AHORA);
    expect(futuro?.label).toBe('Actualizado el 1 ago 2026');
    expect(futuro?.fresco).toBe(false);
  });

  it('expone el ISO del día para <time datetime>', () => {
    expect(frescura(new Date('2026-06-25T00:00:00Z'), AHORA)?.iso).toBe('2026-06-25');
  });

  // El caso real que motivó el cambio: el contenido más nuevo era del 25 jun y
  // la cabecera seguía diciendo "Actualizado hoy".
  it('describe el estado real del sitio en julio de 2026', () => {
    const f = frescura(new Date('2026-06-25T00:00:00Z'), AHORA);
    expect(f?.label).toBe('Actualizado hace 25 días');
    expect(f?.fresco).toBe(false);
  });
});
