import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

type MotionModule = typeof import('../src/scripts/motion');
type MediaControl = MediaQueryList & { setMatches: (matches: boolean) => void };

let activeMotion: MotionModule | undefined;
let animationsDescriptor: PropertyDescriptor | undefined;

function controlledMedia(initial: boolean): MediaControl {
  let matches = initial;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  return {
    media: '',
    get matches() { return matches; },
    onchange: null,
    addEventListener: (_type, listener) => listeners.add(listener as (event: MediaQueryListEvent) => void),
    removeEventListener: (_type, listener) => listeners.delete(listener as (event: MediaQueryListEvent) => void),
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
    dispatchEvent: () => true,
    setMatches(next) {
      matches = next;
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
    },
  };
}

function installMedia(reduced = false, finePointer = true) {
  const reduce = controlledMedia(reduced);
  const fine = controlledMedia(finePointer);
  vi.stubGlobal('matchMedia', vi.fn((query: string) => query.includes('prefers-reduced-motion') ? reduce : fine));
  return { reduce, fine };
}

function pointerMove(target: Element, x: number, y: number, pointerType = 'mouse') {
  const event = new Event('pointermove', { bubbles: true });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    clientX: { value: x },
    clientY: { value: y },
  });
  target.dispatchEvent(event);
}

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '';
  animationsDescriptor = Object.getOwnPropertyDescriptor(document, 'getAnimations');
});

afterEach(async () => {
  activeMotion?.teardownMotion();
  activeMotion = undefined;
  await Promise.resolve();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (animationsDescriptor) Object.defineProperty(document, 'getAnimations', animationsDescriptor);
  else delete (document as Document & { getAnimations?: unknown }).getAnimations;
});

describe('motion production lifecycle', () => {
  it('belongs only to the shared Astro layout', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toContain("import { initMotion, teardownMotion } from '../scripts/motion'");
    expect(layout).toMatch(/astro:page-load[^]*initMotion/);
    expect(layout).toMatch(/astro:before-swap[^]*teardownMotion/);

    const pageFiles = readdirSync(resolve(root, 'src/pages'), { recursive: true, encoding: 'utf8' })
      .filter((path) => path.endsWith('.astro'));
    expect(pageFiles.filter((path) => read(`src/pages/${path}`).includes('initMotion'))).toEqual([]);
  });

  it('coalesces initialization, suspends ambient loops, and tears them down', async () => {
    installMedia();
    let hidden = false;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    const near = document.createElement('div');
    const far = document.createElement('div');
    document.body.append(near, far);
    vi.spyOn(near, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 40 } as DOMRect);
    vi.spyOn(far, 'getBoundingClientRect').mockReturnValue({ top: 5000, bottom: 5040 } as DOMRect);

    const nearAnimation = {
      effect: { target: near, getTiming: () => ({ iterations: Infinity }) },
      play: vi.fn(), pause: vi.fn(),
    } as unknown as Animation;
    const farAnimation = {
      effect: { target: far, getTiming: () => ({ iterations: Infinity }) },
      play: vi.fn(), pause: vi.fn(),
    } as unknown as Animation;
    const secondNearAnimation = {
      effect: { target: near, getTiming: () => ({ iterations: Infinity }) },
      play: vi.fn(), pause: vi.fn(),
    } as unknown as Animation;
    const invalidAnimation = {
      effect: { target: null, getTiming: () => ({ iterations: Infinity }) },
      play: vi.fn(), pause: vi.fn(),
    } as unknown as Animation;
    const getAnimations = vi.fn(() => [nearAnimation, secondNearAnimation, farAnimation, invalidAnimation]);
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: getAnimations });

    let notify: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    class TestIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords() { return []; }
      root = null;
      rootMargin = '160px 0px';
      thresholds = [0];
    }
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);

    activeMotion = await import('../src/scripts/motion');
    activeMotion.initMotion();
    activeMotion.initMotion();
    await Promise.resolve();

    expect(getAnimations).toHaveBeenCalledOnce();
    expect(nearAnimation.play).toHaveBeenCalled();
    expect(secondNearAnimation.play).toHaveBeenCalled();
    expect(farAnimation.pause).toHaveBeenCalled();

    notify([{ target: far, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(farAnimation.play).toHaveBeenCalled();
    notify([{ target: near, isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(nearAnimation.pause).toHaveBeenCalled();

    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(farAnimation.pause).toHaveBeenCalled();
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(farAnimation.play).toHaveBeenCalledTimes(2);
    expect(nearAnimation.play).toHaveBeenCalledTimes(1);

    activeMotion.teardownMotion();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(nearAnimation.pause).toHaveBeenCalled();
    expect(farAnimation.pause).toHaveBeenCalled();
  });

  it('batches pointer effects and removes them during teardown', async () => {
    installMedia();
    document.body.innerHTML = '<article class="spotlight"><a data-magnetic>CTA</a></article>';
    const card = document.querySelector<HTMLElement>('.spotlight')!;
    const magnetic = document.querySelector<HTMLElement>('[data-magnetic]')!;
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20 } as DOMRect);
    vi.spyOn(magnetic, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 40 } as DOMRect);
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: vi.fn(() => []) });

    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');

    activeMotion = await import('../src/scripts/motion');
    activeMotion.initMotion();
    await Promise.resolve();

    pointerMove(document.body, 20, 20);
    pointerMove(magnetic, 20, 20, 'touch');
    expect(requestFrame).not.toHaveBeenCalled();

    pointerMove(magnetic, 90, 35);
    pointerMove(magnetic, 95, 38);
    expect(frames).toHaveLength(2);
    frames.forEach((callback) => callback(0));
    expect(card.style.getPropertyValue('--mx')).toBe('85px');
    expect(card.style.getPropertyValue('--my')).toBe('18px');
    expect(magnetic.style.transform).toContain('translate(8.1px');

    magnetic.dispatchEvent(new Event('pointerleave'));
    expect(magnetic.style.transform).toBe('');

    pointerMove(magnetic, 70, 25);
    activeMotion.teardownMotion();
    expect(cancelFrame).toHaveBeenCalled();
    expect(magnetic.style.transform).toBe('');

    const before = requestFrame.mock.calls.length;
    pointerMove(magnetic, 80, 30);
    expect(requestFrame).toHaveBeenCalledTimes(before);
  });

  it('does not start after teardown wins the initialization microtask', async () => {
    installMedia();
    const getAnimations = vi.fn(() => []);
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: getAnimations });
    activeMotion = await import('../src/scripts/motion');

    activeMotion.initMotion();
    activeMotion.teardownMotion();
    await Promise.resolve();

    expect(getAnimations).not.toHaveBeenCalled();
  });

  it('keeps runtime motion disabled until reduced motion is switched off', async () => {
    const { reduce } = installMedia(true, true);
    const getAnimations = vi.fn(() => []);
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: getAnimations });
    document.body.innerHTML = '<a data-magnetic>CTA</a>';
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame');

    activeMotion = await import('../src/scripts/motion');
    activeMotion.initMotion();
    await Promise.resolve();
    expect(getAnimations).not.toHaveBeenCalled();

    pointerMove(document.querySelector('[data-magnetic]')!, 20, 20);
    expect(requestFrame).not.toHaveBeenCalled();

    reduce.setMatches(false);
    await Promise.resolve();
    expect(getAnimations).toHaveBeenCalledOnce();
  });

  it('enables pointer motion only after a fine pointer becomes available', async () => {
    const { fine } = installMedia(false, false);
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: vi.fn(() => []) });
    document.body.innerHTML = '<a data-magnetic>CTA</a>';
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(3);

    activeMotion = await import('../src/scripts/motion');
    activeMotion.initMotion();
    await Promise.resolve();
    pointerMove(document.querySelector('[data-magnetic]')!, 20, 20);
    expect(requestFrame).not.toHaveBeenCalled();

    fine.setMatches(true);
    await Promise.resolve();
    pointerMove(document.querySelector('[data-magnetic]')!, 20, 20);
    expect(requestFrame).toHaveBeenCalled();
  });

  it('degrades safely without the Web Animations or observer APIs', async () => {
    installMedia();
    delete (document as Document & { getAnimations?: unknown }).getAnimations;
    activeMotion = await import('../src/scripts/motion');
    expect(() => activeMotion?.initMotion()).not.toThrow();
    await Promise.resolve();

    activeMotion.teardownMotion();
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: vi.fn(() => [{
      effect: { target: document.body, getTiming: () => ({ iterations: Infinity }) },
      play: vi.fn(), pause: vi.fn(),
    }]) });
    vi.stubGlobal('IntersectionObserver', undefined);
    activeMotion.initMotion();
    await Promise.resolve();
    expect(() => activeMotion?.teardownMotion()).not.toThrow();
  });

  it('does not delay the hero explanation, actions, or trust evidence', () => {
    const home = read('src/pages/index.astro');
    for (const section of ['explanation', 'actions', 'trust']) {
      const openingTag = home.match(new RegExp(`<[^>]+data-motion-static="${section}"[^>]*>`))?.[0];
      expect(openingTag).toBeTruthy();
      expect(openingTag).not.toContain('blur-in');
    }
  });
});
