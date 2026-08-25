import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('motion production lifecycle', () => {
  it('belongs to the shared Astro layout on every route', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toContain("import { initMotion, teardownMotion } from '../scripts/motion'");
    expect(layout).toMatch(/astro:page-load[^]*initMotion/);
    expect(layout).toMatch(/astro:before-swap[^]*teardownMotion/);
  });

  it('coalesces repeated initialization and pauses ambient loops offscreen', () => {
    const motion = read('src/scripts/motion.ts');
    expect(motion).toContain('queueMicrotask');
    expect(motion).toContain('IntersectionObserver');
    expect(motion).toContain("document.addEventListener('visibilitychange'");
    expect(motion).toContain("addEventListener('change'");
  });

  it('does not delay the hero explanation, actions, or trust evidence', () => {
    const home = read('src/pages/index.astro');
    expect(home.match(/class="[^"]*blur-in/g) ?? []).toHaveLength(2);
  });
});
