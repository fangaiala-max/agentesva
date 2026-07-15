import { describe, it, expect } from 'vitest';
import {
  CATALOGOS,
  EQUIPOS,
  ITEMS,
  itemsDeCatalogo,
  gruposDeCatalogo,
  itemsDeGrupo,
  temasDeGrupo,
  itemsDeTema,
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

describe('catálogo A — prompts', () => {
  const prompts = itemsDeCatalogo('prompts');

  it('son 100, con ids p01..p100 correlativos', () => {
    expect(prompts).toHaveLength(100);
    prompts.forEach((p, n) => {
      expect(p.id).toBe(`p${String(n + 1).padStart(2, '0')}`);
    });
  });

  it('25 por cada grupo', () => {
    for (const g of ['Por industria', 'Por resultados', 'Mejores casos de uso', 'Por objetivos']) {
      expect(prompts.filter((p) => p.grupo === g)).toHaveLength(25);
    }
  });

  it('cada prompt tiene cuerpo con el framework y sin campos de pago', () => {
    for (const p of prompts) {
      expect(p.cuerpo, `${p.id} sin cuerpo`).toBeTruthy();
      expect(/Rol:/.test(p.cuerpo || ''), `${p.id} sin "Rol:"`).toBe(true);
      expect(/Tarea:/.test(p.cuerpo || ''), `${p.id} sin "Tarea:"`).toBe(true);
      expect(p.beneficio).toBeUndefined();
      expect(p.blueprint).toBeUndefined();
      expect(p.precio).toBeUndefined();
    }
  });

  it('cada grupo tiene 5 subtemas de 5 prompts cada uno (evita la wall of cards)', () => {
    for (const g of ['Por industria', 'Por resultados', 'Mejores casos de uso', 'Por objetivos']) {
      const temas = temasDeGrupo('prompts', g);
      expect(temas, `${g} debería tener 5 subtemas`).toHaveLength(5);
      expect(new Set(temas).size).toBe(5); // sin duplicados
      for (const tema of temas) {
        expect(itemsDeTema('prompts', g, tema), `${g} · ${tema}`).toHaveLength(5);
      }
    }
  });

  it('temasDeGrupo devuelve [] para un grupo sin datos de tema', () => {
    expect(temasDeGrupo('software', 'Auditoría de tu software')).toEqual([]);
  });
});
