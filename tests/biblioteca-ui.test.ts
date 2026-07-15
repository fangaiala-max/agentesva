import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBiblioteca, initBibliotecaCopy } from '../src/scripts/biblioteca';

function dom() {
  document.body.innerHTML = `
    <button class="bib-cat" data-cat="prompts" aria-pressed="true">Prompts</button>
    <button class="bib-cat" data-cat="software" aria-pressed="false">Software</button>
    <input id="bib-search" />
    <span id="bib-count"></span>
    <div id="bib-empty" hidden></div>
    <div class="bib-tema" data-tema="Marketing">
      <article class="bib-item" data-cat="prompts" data-grupo="Por industria" data-search="ventas pas fola">
        <button class="bib-copy" data-copy="Rol: hola">Copiar</button>
      </article>
    </div>
    <article class="bib-item" data-cat="software" data-grupo="Auditoria de tu software" data-search="arquitectura">x</article>`;
}

beforeEach(dom);

describe('initBiblioteca', () => {
  const items = () => Array.from(document.querySelectorAll<HTMLElement>('.bib-item'));

  it('muestra solo el catálogo activo', () => {
    initBiblioteca();
    expect(items()[0].hidden).toBe(false);
    expect(items()[1].hidden).toBe(true);
    (document.querySelector('[data-cat="software"]') as HTMLElement).click();
    expect(items()[0].hidden).toBe(true);
    expect(items()[1].hidden).toBe(false);
  });

  it('el filtro de texto oculta lo que no coincide y muestra el estado vacío', () => {
    initBiblioteca();
    const s = document.getElementById('bib-search') as HTMLInputElement;
    s.value = 'zzz';
    s.dispatchEvent(new Event('input'));
    expect(items()[0].hidden).toBe(true);
    expect(document.getElementById('bib-empty')!.hidden).toBe(false);
  });

  it('el filtro es insensible a mayúsculas y tildes', () => {
    initBiblioteca();
    const s = document.getElementById('bib-search') as HTMLInputElement;
    s.value = 'VÉNTAS';
    s.dispatchEvent(new Event('input'));
    expect(items()[0].hidden).toBe(false);
  });

  it('oculta el bloque de tema cuando ninguno de sus items queda visible', () => {
    initBiblioteca();
    const tema = document.querySelector('.bib-tema') as HTMLElement;
    expect(tema.hidden).toBe(false);
    const s = document.getElementById('bib-search') as HTMLInputElement;
    s.value = 'zzz';
    s.dispatchEvent(new Event('input'));
    expect(tema.hidden).toBe(true);
  });
});

describe('initBibliotecaCopy', () => {
  it('copia el texto del prompt al portapapeles', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    initBibliotecaCopy();
    (document.querySelector('.bib-copy') as HTMLElement).click();
    expect(writeText).toHaveBeenCalledWith('Rol: hola');
  });
});
