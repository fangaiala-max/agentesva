import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { setupInteractiveCards } from '../src/scripts/interactive-card';
let cleanup: (() => void) | undefined;
let card: HTMLElement;
let serial = 0;
const frames = new Map<number, FrameRequestCallback>();
beforeEach(() => {
  document.body.innerHTML = '<article data-interactive-card data-card-intensity="7"><a href="/precios/">Precios</a></article>';
  card = document.querySelector('article')!;
  vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 200 } as DOMRect);
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: !query.includes('reduced') }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => {
  cleanup?.(); cleanup = undefined;
  frames.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = '';
});
function move(x = 200, y = 0, pointerType = 'mouse') {
  const event = new Event('pointermove');
  Object.assign(event, { clientX: x, clientY: y, pointerType });
  card.dispatchEvent(event);
}
function flush() {
  const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(16));
}
it('coalesces pointer input and limits rotation without intercepting links', () => {
  cleanup = setupInteractiveCards();
  move(); move(400, -50);
  expect(frames.size).toBe(1);
  flush();
  expect(card.style.getPropertyValue('--card-ry')).toBe('7deg');
  expect(card.style.getPropertyValue('--card-rx')).toBe('7deg');
  const click = new MouseEvent('click', { cancelable: true, bubbles: true });
  card.querySelector('a')!.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(false);
});
it('clears tilt on pointer exit and cancels pending frames on teardown', () => {
  cleanup = setupInteractiveCards(); move(); flush();
  card.dispatchEvent(new Event('pointerleave'));
  expect(card.style.getPropertyValue('--card-ry')).toBe('');
  move(); cleanup(); cleanup = undefined; flush();
  expect(card.hasAttribute('data-card-ready')).toBe(false);
  expect(card.hasAttribute('data-card-active')).toBe(false);
  move(); expect(frames.size).toBe(0);
});
it.each([true, false])('does not enable tilt with reduced motion or a coarse pointer (%s)', (reduced) => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduced') ? reduced : false }));
  cleanup = setupInteractiveCards(); move();
  expect(card.hasAttribute('data-card-ready')).toBe(false);
  expect(frames.size).toBe(0);
});
it('ignores touch events and resets on scrolling', () => {
  cleanup = setupInteractiveCards(); move(100, 100, 'touch');
  expect(frames.size).toBe(0);
  move(); flush(); window.dispatchEvent(new Event('scroll'));
  expect(card.hasAttribute('data-card-active')).toBe(false);
});
