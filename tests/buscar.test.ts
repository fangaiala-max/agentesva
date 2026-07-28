import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// createSearch toca Pagefind (WASM, solo existe en el sitio construido); lo
// sustituimos por un doble para probar el cableado de la página /buscar.
const run = vi.fn();
const focus = vi.fn();
vi.mock('../src/scripts/search', () => ({
  createSearch: vi.fn(() => ({ run, focus })),
}));

import { initBuscar } from '../src/scripts/buscar';
import { createSearch } from '../src/scripts/search';

function dom() {
  document.body.innerHTML = `
    <div id="buscar-root">
      <form id="buscar-form">
        <input id="buscar-input" data-search-input type="search" />
      </form>
    </div>`;
}

const input = () => document.getElementById('buscar-input') as HTMLInputElement;

beforeEach(() => {
  vi.clearAllMocks();
  history.replaceState(null, '', '/buscar');
  dom();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('initBuscar', () => {
  it('no hace nada si falta #buscar-root', () => {
    document.body.innerHTML = '<p>otra página</p>';
    initBuscar();
    expect(createSearch).not.toHaveBeenCalled();
  });

  it('el submit del formulario no navega (preventDefault)', () => {
    initBuscar();
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('buscar-form')!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('precarga el input y lanza la búsqueda cuando la URL trae ?q=', () => {
    history.replaceState(null, '', '/buscar?q=chatbot');
    initBuscar();
    expect(input().value).toBe('chatbot');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('sin ?q= no lanza búsqueda y deja el input vacío', () => {
    initBuscar();
    expect(input().value).toBe('');
    expect(run).not.toHaveBeenCalled();
  });

  it('escribir sincroniza el término en la URL tras el debounce', () => {
    vi.useFakeTimers();
    initBuscar();
    input().value = 'automatizar';
    input().dispatchEvent(new Event('input'));
    expect(location.search).toBe(''); // aún no: el debounce no ha vencido
    vi.advanceTimersByTime(300);
    expect(new URLSearchParams(location.search).get('q')).toBe('automatizar');
  });

  it('vaciar el input borra ?q= de la URL', () => {
    vi.useFakeTimers();
    history.replaceState(null, '', '/buscar?q=chatbot');
    initBuscar();
    input().value = '   ';
    input().dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(new URLSearchParams(location.search).get('q')).toBeNull();
  });
});
