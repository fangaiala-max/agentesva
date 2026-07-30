import { describe, it, expect } from 'vitest';
import { agruparPorMes, etiquetaDeMes } from '../src/data/noticias-meses';

const d = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('etiquetaDeMes', () => {
  it('devuelve mes y año en español', () => {
    expect(etiquetaDeMes(d('2026-07-28'))).toBe('julio de 2026');
  });

  it('incluye siempre el año, para que dos diciembres no colisionen', () => {
    expect(etiquetaDeMes(d('2025-12-01'))).not.toBe(etiquetaDeMes(d('2026-12-01')));
  });
});

describe('etiquetaDeMes — regresión de zona horaria', () => {
  // Las fechas del frontmatter (`fecha: 2026-07-01`) llegan a medianoche UTC.
  // Sin fijar la zona, una máquina de build con desfase negativo las empujaba
  // al mes anterior y partía julio en dos secciones.
  it('no desplaza el mes de una noticia del día 1', () => {
    expect(etiquetaDeMes(new Date('2026-07-01'))).toBe('julio de 2026');
  });

  it('no parte un mismo mes en dos grupos por el desfase de medianoche', () => {
    const grupos = agruparPorMes(['2026-07-15', '2026-07-01'].map((iso) => ({ fecha: new Date(iso) })));
    expect(grupos).toHaveLength(1);
    expect(grupos[0].etiqueta).toBe('julio de 2026');
  });

  it('no adelanta al mes siguiente el último día del mes', () => {
    expect(etiquetaDeMes(new Date('2026-07-31'))).toBe('julio de 2026');
  });
});

describe('agruparPorMes', () => {
  it('agrupa noticias consecutivas del mismo mes', () => {
    const grupos = agruparPorMes([d('2026-07-28'), d('2026-07-20'), d('2026-07-02')].map((fecha) => ({ fecha })));
    expect(grupos).toHaveLength(1);
    expect(grupos[0].etiqueta).toBe('julio de 2026');
    expect(grupos[0].items).toHaveLength(3);
  });

  it('abre un grupo nuevo al cambiar de mes', () => {
    const grupos = agruparPorMes([d('2026-07-28'), d('2026-06-25'), d('2026-06-18')].map((fecha) => ({ fecha })));
    expect(grupos.map((g) => g.etiqueta)).toEqual(['julio de 2026', 'junio de 2026']);
    expect(grupos.map((g) => g.items.length)).toEqual([1, 2]);
  });

  it('separa el mismo mes de años distintos (frontera de año)', () => {
    const grupos = agruparPorMes([d('2026-12-10'), d('2025-12-10')].map((fecha) => ({ fecha })));
    expect(grupos.map((g) => g.etiqueta)).toEqual(['diciembre de 2026', 'diciembre de 2025']);
    expect(grupos).toHaveLength(2);
  });

  it('conserva enero y diciembre contiguos como grupos distintos', () => {
    const grupos = agruparPorMes([d('2026-01-05'), d('2025-12-30')].map((fecha) => ({ fecha })));
    expect(grupos).toHaveLength(2);
  });

  it('preserva el orden y el resto de campos de cada item', () => {
    const grupos = agruparPorMes([
      { fecha: d('2026-07-28'), id: 'a' },
      { fecha: d('2026-07-20'), id: 'b' },
      { fecha: d('2026-06-01'), id: 'c' },
    ]);
    expect(grupos[0].items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(grupos[1].items.map((i) => i.id)).toEqual(['c']);
  });

  it('devuelve un grupo con una sola noticia', () => {
    const grupos = agruparPorMes([{ fecha: d('2026-07-28') }]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].items).toHaveLength(1);
  });

  it('devuelve lista vacía sin noticias', () => {
    expect(agruparPorMes([])).toEqual([]);
  });

  it('no reordena: una lista desordenada reabre el mes', () => {
    const grupos = agruparPorMes([d('2026-07-28'), d('2026-06-01'), d('2026-07-02')].map((fecha) => ({ fecha })));
    expect(grupos.map((g) => g.etiqueta)).toEqual([
      'julio de 2026',
      'junio de 2026',
      'julio de 2026',
    ]);
  });
});
