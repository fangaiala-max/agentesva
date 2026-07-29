import { describe, it, expect } from 'vitest';
import {
  temasEnTendencia,
  badgesDeNoticia,
  badgesDeNoticias,
  DIAS_NUEVO,
  DIAS_TENDENCIA,
  MIN_DIAS_TENDENCIA,
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
    expect(temas.has('agentes')).toBe(true);
  });

  it('no marca un tema con una sola noticia', () => {
    const temas = temasEnTendencia([{ fecha: haceDias(3), tema: 'Código' }], AHORA);
    expect(temas.has('código')).toBe(false);
  });

  it('ignora noticias fuera de la ventana de tendencia', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(DIAS_TENDENCIA + 1), tema: 'Vídeo' },
        { fecha: haceDias(DIAS_TENDENCIA + 5), tema: 'Vídeo' },
      ],
      AHORA,
    );
    expect(temas.has('vídeo')).toBe(false);
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
    expect(temas.has('imagen')).toBe(false);
  });

  it('cuenta el límite exacto de la ventana como dentro', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(DIAS_TENDENCIA), tema: 'Voz' },
        { fecha: haceDias(1), tema: 'Voz' },
      ],
      AHORA,
    );
    expect(temas.has('voz')).toBe(true);
  });

  it('devuelve un conjunto vacío sin noticias', () => {
    expect(temasEnTendencia([], AHORA).size).toBe(0);
  });

  it('cuenta la noticia publicada justo ahora (0 días)', () => {
    const temas = temasEnTendencia(
      [
        { fecha: AHORA, tema: 'Agentes' },
        { fecha: haceDias(5), tema: 'Agentes' },
      ],
      AHORA,
    );
    expect(temas.has('agentes')).toBe(true);
  });

  it('no suma noticias de temas distintos', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(2), tema: 'Agentes' },
        { fecha: haceDias(3), tema: 'Vídeo' },
      ],
      AHORA,
    );
    expect([...temas]).toEqual([]);
  });

  it('marca varios temas con momentum a la vez', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(1), tema: 'Agentes' },
        { fecha: haceDias(2), tema: 'Agentes' },
        { fecha: haceDias(3), tema: 'Vídeo' },
        { fecha: haceDias(4), tema: 'Vídeo' },
      ],
      AHORA,
    );
    expect([...temas].sort()).toEqual(['agentes', 'vídeo']);
  });

  it('no marca un tema cuya segunda noticia se ha salido de la ventana', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(2), tema: 'Voz' },
        { fecha: haceDias(DIAS_TENDENCIA + 1), tema: 'Voz' },
      ],
      AHORA,
    );
    expect(temas.has('voz')).toBe(false);
  });

  it('sigue marcando el tema por encima del mínimo (3 noticias)', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(1), tema: 'Código' },
        { fecha: haceDias(2), tema: 'Código' },
        { fecha: haceDias(3), tema: 'Código' },
      ],
      AHORA,
    );
    expect(temas.has('código')).toBe(true);
  });

  // `tema` es texto libre en el frontmatter: un desliz de mayúsculas o un espacio
  // de más partía el recuento en dos y desactivaba la tendencia sin avisar.
  it('agrupa el mismo tema aunque varíen mayúsculas y espacios', () => {
    const temas = temasEnTendencia(
      [
        { fecha: haceDias(1), tema: 'Asistentes' },
        { fecha: haceDias(2), tema: ' asistentes ' },
      ],
      AHORA,
    );
    expect(temas.has('asistentes')).toBe(true);
  });

  it('cuenta el mínimo declarado en MIN_DIAS_TENDENCIA, no un número mágico', () => {
    const noticias = Array.from({ length: MIN_DIAS_TENDENCIA }, (_, i) => ({
      fecha: haceDias(i + 1),
      tema: 'Imagen',
    }));
    expect(temasEnTendencia(noticias, AHORA).has('imagen')).toBe(true);
    expect(temasEnTendencia(noticias.slice(0, -1), AHORA).has('imagen')).toBe(false);
  });

  // La pipeline publica en tandas: tres noticias del mismo día no son momentum.
  it('no marca tendencia una tanda publicada el mismo día', () => {
    const mismoDia = new Date('2026-07-28T09:00:00Z');
    const temas = temasEnTendencia(
      [
        { fecha: mismoDia, tema: 'Actualidad' },
        { fecha: new Date('2026-07-28T18:00:00Z'), tema: 'Actualidad' },
        { fecha: mismoDia, tema: 'Actualidad' },
      ],
      AHORA,
    );
    expect(temas.has('actualidad')).toBe(false);
  });

  it('sí marca tendencia cuando el tema vuelve otro día', () => {
    const temas = temasEnTendencia(
      [
        { fecha: new Date('2026-07-28T09:00:00Z'), tema: 'Agentes' },
        { fecha: new Date('2026-07-20T09:00:00Z'), tema: 'Agentes' },
      ],
      AHORA,
    );
    expect(temas.has('agentes')).toBe(true);
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

  // Una noticia nueva de un tema caliente ya destaca por nueva: la segunda
  // píldora no añadiría señal, solo ruido.
  it('no duplica "tendencia" sobre una noticia que ya es "nuevo"', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(1), tema: 'Agentes' }, new Set(['agentes']), AHORA),
    ).toEqual(['nuevo']);
  });

  it('devuelve solo "tendencia" para noticia antigua de un tema con momentum', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(25), tema: 'Agentes' }, new Set(['agentes']), AHORA),
    ).toEqual(['tendencia']);
  });

  it('no devuelve nada si no es reciente ni su tema es tendencia', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(90), tema: 'Código' }, new Set(['agentes']), AHORA),
    ).toEqual([]);
  });

  it('no marca como "nuevo" una noticia con fecha futura', () => {
    const futuro = new Date(AHORA.getTime() + 2 * 86_400_000);
    expect(badgesDeNoticia({ fecha: futuro, tema: 'Código' }, new Set(), AHORA)).toEqual([]);
  });

  it('marca como "nuevo" la noticia publicada justo ahora (0 días)', () => {
    expect(badgesDeNoticia({ fecha: AHORA, tema: 'Agentes' }, new Set(), AHORA)).toEqual(['nuevo']);
  });

  it('deja de marcar "nuevo" el día siguiente al límite', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(DIAS_NUEVO + 1), tema: 'Agentes' }, new Set(), AHORA),
    ).toEqual([]);
  });

  it('no confunde el tema: la tendencia de otro tema no contagia', () => {
    expect(
      badgesDeNoticia({ fecha: haceDias(40), tema: 'Vídeo' }, new Set(['agentes']), AHORA),
    ).toEqual([]);
  });
});

describe('badgesDeNoticias', () => {
  it('calcula los distintivos de toda la lista en orden', () => {
    const noticias = [
      { fecha: haceDias(1), tema: 'Agentes' }, // nuevo (gana a tendencia)
      { fecha: haceDias(20), tema: 'Agentes' }, // tendencia: el tema vuelve otro día
      { fecha: haceDias(60), tema: 'Código' }, // fuera de las dos ventanas
    ];
    expect(badgesDeNoticias(noticias, AHORA)).toEqual([['nuevo'], ['tendencia'], []]);
  });

  it('devuelve lista vacía sin noticias', () => {
    expect(badgesDeNoticias([], AHORA)).toEqual([]);
  });

  it('una sola noticia (portada sin secciones de mes) nunca es tendencia', () => {
    expect(badgesDeNoticias([{ fecha: haceDias(1), tema: 'Agentes' }], AHORA)).toEqual([['nuevo']]);
  });

  it('devuelve un array por noticia, en el mismo orden que la entrada', () => {
    const noticias = [
      { fecha: haceDias(2), tema: 'Vídeo' },
      { fecha: haceDias(50), tema: 'Código' },
      { fecha: haceDias(4), tema: 'Vídeo' },
    ];
    const out = badgesDeNoticias(noticias, AHORA);
    expect(out).toHaveLength(noticias.length);
    // El índice 1 es la antigua: el grid del listado empareja por posición.
    expect(out).toEqual([['nuevo'], [], ['nuevo']]);
  });

  it('no marca nada cuando toda la lista está fuera de las dos ventanas', () => {
    const noticias = [
      { fecha: haceDias(DIAS_TENDENCIA + 10), tema: 'Voz' },
      { fecha: haceDias(DIAS_TENDENCIA + 20), tema: 'Voz' },
    ];
    expect(badgesDeNoticias(noticias, AHORA)).toEqual([[], []]);
  });
});
