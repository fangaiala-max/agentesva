import { beforeEach, describe, expect, it } from 'vitest';
import { setupBookmarks } from '../src/scripts/directory';

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
});
