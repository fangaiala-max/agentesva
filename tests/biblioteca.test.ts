import { describe, it, expect } from 'vitest';
import {
  CATALOGOS,
  EQUIPOS,
  ITEMS,
  itemsDeCatalogo,
  gruposDeCatalogo,
  itemsDeGrupo,
  equipoDeGrupo,
} from '../src/data/biblioteca';

describe('biblioteca — estructura', () => {
  it('tiene 3 catálogos con grupos 4/4/6', () => {
    expect(CATALOGOS.map((c) => c.id)).toEqual(['prompts', 'software', 'growth']);
    expect(gruposDeCatalogo('prompts')).toHaveLength(4);
    expect(gruposDeCatalogo('software')).toHaveLength(4);
    expect(gruposDeCatalogo('growth')).toHaveLength(6);
  });

  it('cada item tiene id único y grupo válido de su catálogo', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const it of ITEMS) {
      expect(gruposDeCatalogo(it.catalogo)).toContain(it.grupo);
      expect(it.titulo.trim().length).toBeGreaterThan(0);
    }
  });

  it('helpers filtran correctamente', () => {
    expect(itemsDeCatalogo('prompts').every((i) => i.catalogo === 'prompts')).toBe(true);
    const g = gruposDeCatalogo('prompts')[0];
    expect(itemsDeGrupo('prompts', g).every((i) => i.grupo === g)).toBe(true);
  });

  it('hay un equipo por cada grupo de software y growth', () => {
    for (const cat of ['software', 'growth'] as const) {
      for (const grupo of gruposDeCatalogo(cat)) {
        expect(equipoDeGrupo(cat, grupo)).toBeDefined();
      }
    }
    expect(EQUIPOS).toHaveLength(10);
  });
});
