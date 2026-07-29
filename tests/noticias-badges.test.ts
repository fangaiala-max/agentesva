import { describe, it, expect } from 'vitest';
import {
  temasEnTendencia,
  badgesDeNoticia,
  badgesDeNoticias,
  DIAS_NUEVO,
  DIAS_TENDENCIA,
} from '../src/data/noticias-badges';

const AHORA = new Date('2026-07-29T12:00:00Z');
const haceDias = (d: number) => new Date(AHORA.getTime() - d * 86_400_000);

describe('temasEnTendencia', () => {
  it('marca un tema con 2+ noticias dentro de la ventana', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(3), tema: 'Agentes' },
        { fecha: haceDias(20), tema: 'Agentes' },
      ],
      AHORA,
    );
    expect(temas.has('Agentes')).toBe(true);
  });

  it('no marca un tema con una sola noticia', () => {
    const temas = temasEnTendencia([{ fecha: haceDias(3), tema: 'Código' }], AHORA);
    expect(temas.has('Código')).toBe(false);
  });

  it('ignora noticias fuera de la ventana de tendencia', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(DIAS_TENDENCIA + 1), tema: 'Vídeo' },
        { fecha: haceDias(DIAS_TENDENCIA + 5), tema: 'Vídeo' },
      ],
      AHORA,
    );
    expect(temas.has('Vídeo')).toBe(false);
  });

  it('ignora fechas futuras', () => {
    const futuro = new Date(AHORA.getTime() + 86_400_000);
    const temas = temasEnTendencia(
      [
        { fecha: futuro, tema: 'Imagen' },
        { fecha: futuro, tema: 'Imagen' },
      ],
      AHORA,
    );
    expect(temas.has('Imagen')).toBe(false);
  });

  it('cuenta el límite exacto de la ventana como dentro', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(DIAS_TENDENCIA), tema: 'Voz' },
        { fecha: haceDias(1), tema: 'Voz' },
      ],
      AHORA,
    );
    expect(temas.has('Voz')).toBe(true);
  });
});

describe('badgesDeNoticia', () => {
  it('devuelve "nuevo" dentro de la ventana de novedad', () => {
    expect(badgesDeNoticia({ fecha: haceDias(2), tema: 'Agentes' }, new Set(), AHORA)).toEqual(['nuevo']);
  });

  it('incluye el día límite de la ventana de novedad', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(DIAS_NUEVO), tema: 'Agentes' }, new Set(), AHORA),
    ).toEqual(['nuevo']);
  });

  it('acumula ambos distintivos, con "nuevo" primero', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(1), tema: 'Agentes' }, new Set(['Agentes']), AHORA),
    ).toEqual(['nuevo', 'tendencia']);
  });

  it('devuelve solo "tendencia" para noticia antigua de un tema con momentum', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(25), tema: 'Agentes' }, new Set(['Agentes']), AHORA),
    ).toEqual(['tendencia']);
  });

  it('no devuelve nada si no es reciente ni su tema es tendencia', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(90), tema: 'Código' }, new Set(['Agentes']), AHORA),
    ).toEqual([]);
  });

  it('no marca como "nuevo" una noticia con fecha futura', () => {
    const futuro = new Date(AHORA.getTime() + 2 * 86_400_000);
    expect(badgesDeNoticia({ fecha: futuro, tema: 'Código' }, new Set(), AHORA)).toEqual([]);
  });
});

describe('badgesDeNoticias', () => {
  it('calcula los distintivos de toda la lista en orden', () => {
    const noticias = [
      { fecha: haceDias(1), tema: 'Agentes' }, // nuevo + tendencia (tema con 2 en 30d)
      { fecha: haceDias(20), tema: 'Agentes' }, // tendencia
      { fecha: haceDias(60), tema: 'Código' }, // sin distintivo
    ];
    expect(badgesDeNoticias(noticias, AHORA)).toEqual([['nuevo', 'tendencia'], ['tendencia'], []]);
  });

  it('devuelve lista vacía sin noticias', () => {
    expect(badgesDeNoticias([], AHORA)).toEqual([]);
  });
});
