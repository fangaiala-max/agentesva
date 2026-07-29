import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// La lógica del listado ya vive fuera del .astro y se testea como función pura:
// los distintivos en noticias-badges.test.ts, el agrupado por mes en
// noticias-meses.test.ts. Lo que no se puede ejercitar sin arrancar Astro es el
// CABLEADO entre página y componente: si se pierde, los distintivos desaparecen
// del listado sin romper el build y sin que falle ningún test de comportamiento.
// Estos guards leen el fuente para cubrir ese hueco.

// process.cwd() = raíz del proyecto bajo vitest. Evita import.meta.url, cuyo
// pathname llega percent-encoded (la ruta del repo lleva espacios).
const LISTADO = readFileSync(join(process.cwd(), 'src/pages/noticias/index.astro'), 'utf8');
const ESTUDIOS = readFileSync(join(process.cwd(), 'src/pages/estudios/index.astro'), 'utf8');
const FICHA = readFileSync(join(process.cwd(), 'src/components/ArticleCard.astro'), 'utf8');

/** Cada uso de <ArticleCard …> del fichero, con sus props (multilínea incluida). */
const usosDeArticleCard = (src: string): string[] =>
  [...src.matchAll(/<ArticleCard\b[\s\S]*?\/>/g)].map((m) => m[0]);

describe('cableado del listado de noticias', () => {
  it('todas las fichas del listado reciben sus distintivos', () => {
    const usos = usosDeArticleCard(LISTADO);
    expect(usos.length).toBeGreaterThanOrEqual(2); // portada + fichas del mes
    const sinBadges = usos.filter((u) => !/\bbadges=/.test(u));
    expect(sinBadges, `Fichas sin badges=:\n${sinBadges.join('\n---\n')}`).toEqual([]);
  });

  it('solo la portada se renderiza como destacada', () => {
    const destacadas = usosDeArticleCard(LISTADO).filter((u) => /\bdestacada\b/.test(u));
    expect(destacadas).toHaveLength(1);
    expect(destacadas[0]).toContain('portada');
  });

  it('/estudios sigue usando la ficha sin las props nuevas', () => {
    // Contrato de reutilización: si destacada/badges dejasen de tener valor por
    // defecto, /estudios reventaría en build o renderizaría un badge fantasma.
    const usos = usosDeArticleCard(ESTUDIOS);
    expect(usos.length).toBeGreaterThan(0);
    expect(usos.every((u) => !/\bbadges=|\bdestacada\b/.test(u))).toBe(true);
    expect(FICHA).toMatch(/destacada\?:/);
    expect(FICHA).toMatch(/badges\?:/);
    expect(FICHA).toMatch(/destacada\s*=\s*false/);
    expect(FICHA).toMatch(/badges\s*=\s*\[\]/);
  });
});
