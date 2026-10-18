import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupParticleDrift } from '../src/scripts/particle-drift';

let cleanup: (() => void) | undefined;
let visibility: IntersectionObserverCallback;
let resizeCallback: ResizeObserverCallback;
let hidden = false;
let frameId = 0;
const pending = new Map<number, FrameRequestCallback>();
const disconnect = vi.fn();
const draw = vi.fn();

beforeEach(() => {
  hidden = false;
  pending.clear();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pending.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { resizeCallback = callback; }
    observe() {}
    disconnect = disconnect;
  });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { visibility = callback; }
    observe() {}
    disconnect = disconnect;
  });
  document.body.innerHTML = '<div><canvas data-particle-drift></canvas></div>';
  vi.spyOn(document.querySelector('div')!, 'getBoundingClientRect').mockReturnValue({
    width: 1200, height: 760, top: 0, bottom: 760,
  } as DOMRect);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(), setTransform: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(),
    lineTo: vi.fn(), stroke: vi.fn(), fillText: draw,
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

function intersect(isIntersecting: boolean) {
  visibility([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
}

describe('particle drift lifecycle', () => {
  it('draws a still frame without scheduling animation for reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    cleanup = setupParticleDrift();
    expect(draw).toHaveBeenCalled();
    expect(pending.size).toBe(0);
    intersect(true);
    expect(pending.size).toBe(0);
  });

  it('runs a single loop and pauses off-screen and in hidden tabs', () => {
    cleanup = setupParticleDrift();
    expect(pending.size).toBe(1);
    intersect(false);
    expect(pending.size).toBe(0);
    intersect(true);
    expect(pending.size).toBe(1);
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pending.size).toBe(0);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    intersect(true);
    expect(pending.size).toBe(1);
  });

  it('releases observers, animation and canvas memory on page teardown', () => {
    cleanup = setupParticleDrift();
    cleanup();
    cleanup = undefined;
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(pending.size).toBe(0);
    expect(document.querySelector('canvas')!.width).toBe(0);
    intersect(true);
    resizeCallback([], {} as ResizeObserver);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pending.size).toBe(0);
  });

  it('leaves the page functional when canvas is unavailable', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    cleanup = setupParticleDrift();
    expect(pending.size).toBe(0);
    expect(draw).not.toHaveBeenCalled();
  });
});
