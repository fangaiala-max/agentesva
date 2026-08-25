import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDirectory, setupBookmarks, setupCounters } from '../src/scripts/directory';

function mount() {
  document.body.innerHTML = `
    <button data-bookmark="claude"><svg fill="none" stroke="x"></svg></button>
    <button data-bookmark="claude"><svg fill="none" stroke="x"></svg></button>
    <button data-bookmark="zapier"><svg fill="none" stroke="x"></svg></button>`;
  setupBookmarks();
}

const buttons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-bookmark]'));

beforeEach(() => {
  localStorage.clear();
  mount();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('setupBookmarks', () => {
  it('marca y persiste en localStorage', () => {
    buttons()[0].click();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');
    expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual(['claude']);
  });

  it('sincroniza todas las instancias del mismo slug', () => {
    buttons()[0].click();
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons()[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('restaura el estado guardado al re-inicializar', () => {
    buttons()[0].click();
    mount();
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('des-marcar elimina el slug persistido', () => {
    buttons()[0].click();
    buttons()[1].click();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
    expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual([]);
  });

  it('localStorage corrupto no rompe la inicialización (loadSaved catch)', () => {
    localStorage.setItem('agentesva:saved', '{not-json');
    expect(() => mount()).not.toThrow();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
    buttons()[0].click();
    expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual(['claude']);
  });

  it('JSON válido pero no-array no contamina el estado guardado', () => {
    localStorage.setItem('agentesva:saved', '"claude"');
    mount();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
    buttons()[0].click();
    expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual(['claude']);
  });
});

describe('initDirectory — colisiones entre páginas (View Transitions)', () => {
  it('cede en la home (#dir-body presente): no engancha sus listeners', () => {
    document.body.innerHTML = `
      <div id="dir-body"></div><div id="tool-grid"></div>
      <button data-bookmark="claude"><svg></svg></button>`;
    initDirectory();
    (document.querySelector('[data-bookmark]') as HTMLElement).click();
    expect(localStorage.getItem('agentesva:saved')).toBeNull();
  });

  it('es idempotente ante doble registro de módulos (mismo DOM)', () => {
    document.body.innerHTML = `
      <div id="tool-grid"></div>
      <button data-bookmark="claude"><svg></svg></button>`;
    initDirectory();
    initDirectory();
    (document.querySelector('[data-bookmark]') as HTMLElement).click();
    expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual(['claude']);
  });

  it('sin #tool-grid (página ajena: fichas, /recursos…) no engancha nada', () => {
    document.body.innerHTML = '<button data-bookmark="claude"><svg></svg></button>';
    initDirectory();
    (document.querySelector('[data-bookmark]') as HTMLElement).click();
    expect(localStorage.getItem('agentesva:saved')).toBeNull();
  });

  it('libera los contadores al abandonar el directorio', () => {
    document.body.innerHTML = '<div id="tool-grid"></div><span data-count="54">54</span>';
    const disconnect = vi.fn();

    class TestIntersectionObserver {
      constructor(_callback: IntersectionObserverCallback) {}
      observe() {}
      unobserve() {}
      disconnect = disconnect;
      takeRecords() { return []; }
      root = null;
      rootMargin = '0px';
      thresholds = [0.4];
    }

    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    initDirectory();
    document.body.innerHTML = '<main>Página ajena</main>';
    initDirectory();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});

describe('setupCounters — contenido y ciclo de vida', () => {
  it('conserva el valor final hasta entrar en pantalla y libera observer/RAF', () => {
    document.body.innerHTML = '<span data-count="54">54</span>';
    const el = document.querySelector<HTMLElement>('[data-count]')!;
    let notify: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();

    class TestIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
      takeRecords() { return []; }
      root = null;
      rootMargin = '0px';
      thresholds = [0.4];
    }

    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');

    const cleanup = setupCounters();
    expect(el.textContent).toBe('54');

    notify([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(el.textContent).toBe('0');
    expect(requestFrame).toHaveBeenCalled();

    cleanup();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(cancelFrame).toHaveBeenCalledWith(7);

  });
});
