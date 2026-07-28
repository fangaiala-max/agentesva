import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Regresión de v0.3.1.0: los buscadores de /buscar y de la Biblioteca usaban
// onsubmit="return false" en línea. La CSP del sitio (vercel.json) sirve
// script-src 'self' SIN 'unsafe-inline', y los hashes no cubren atributos de
// evento, así que el navegador bloqueaba el handler y el formulario acababa
// enviándose de verdad: /buscar recargaba y la Biblioteca perdía el filtro.
//
// El fallo es invisible en local (sin cabeceras de Vercel no hay CSP) y no lo
// detecta ningún test de comportamiento, porque el handler existe en el HTML.
// Por eso el guard es estático: cualquier handler en línea en src/ falla aquí.
//
// El patrón correcto es un listener en un módulo de src/scripts/ — ver
// src/scripts/buscar.ts y src/scripts/biblioteca.ts.

// process.cwd() = raíz del proyecto bajo vitest. Evita import.meta.url, cuyo
// pathname llega percent-encoded (la ruta del repo lleva espacios).
const SRC = join(process.cwd(), 'src');
const EXTENSIONES = ['.astro', '.html'];

// Atributos de evento del DOM. Lista explícita en vez de /\son[a-z]+=/ para no
// tragarse props legítimas que empiezan por "on" (onlyFoo=, once=…).
const EVENTOS = [
  'submit', 'click', 'dblclick', 'change', 'input', 'load', 'error', 'focus',
  'blur', 'keydown', 'keyup', 'keypress', 'mouseover', 'mouseout', 'mousedown',
  'mouseup', 'mouseenter', 'mouseleave', 'select', 'reset', 'toggle', 'scroll',
  'wheel', 'copy', 'paste', 'cut', 'drag', 'drop', 'contextmenu', 'invalid',
];
const HANDLER_RE = new RegExp(`\\son(${EVENTOS.join('|')})\\s*=`, 'i');

function ficheros(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return ficheros(ruta);
    return EXTENSIONES.some((e) => nombre.endsWith(e)) ? [ruta] : [];
  });
}

describe('CSP: sin handlers de evento en línea', () => {
  it('encuentra ficheros que auditar (el guard no puede pasar por vacío)', () => {
    expect(ficheros(SRC).length).toBeGreaterThan(20);
  });

  it('ningún fichero de src/ declara un handler en línea', () => {
    const infractores = ficheros(SRC).flatMap((ruta) =>
      readFileSync(ruta, 'utf8')
        .split('\n')
        .flatMap((linea, i) =>
          HANDLER_RE.test(linea) ? [`${relative(SRC, ruta)}:${i + 1} → ${linea.trim().slice(0, 90)}`] : [],
        ),
    );

    expect(
      infractores,
      `La CSP (script-src 'self', sin 'unsafe-inline') bloquea estos handlers en producción.\n` +
        `Mueve la lógica a un módulo de src/scripts/ y engánchala con addEventListener.\n\n` +
        infractores.join('\n'),
    ).toEqual([]);
  });
});
