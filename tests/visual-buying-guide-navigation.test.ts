import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { transformWithEsbuild } from 'vite';

// Value: protects=fragment access to initially collapsed reviews and initialization after Astro swaps;
// fails_when=the shipped script loses a reveal handler, opens unrelated content, or stops initializing swapped markup;
// why_new=content/schema and built-HTML checks do not execute this client script;
// seam=the real Astro script is compiled and evaluated without changing its production exports.
describe('visual buying guide navigation', () => {
  let script: string;
  let browser: Window;

  const markup = (id = 'review') => `
    <main class="buying-guide">
      <details class="buying-guide__contents" open><summary>Contents</summary>
        <a id="toc-link" href="#${id}"><span>Read this review</span></a>
      </details>
      <article class="buying-guide__body">
        <details id="outer"><summary>Group</summary>
          <details id="inner"><summary>Review</summary><h2 id="${id}">Review heading</h2></details>
        </details>
        <details id="other"><summary>Another review</summary><h2 id="other-review">Other heading</h2></details>
        <table><tbody><tr><td>A comparison</td></tr></tbody></table>
      </article>
    </main>
    <details id="unrelated"><summary>Other page content</summary><h2 id="outside">Outside heading</h2></details>
    <a id="outside-link" href="#${id}"><span>Outside link</span></a>`;

  beforeAll(async () => {
    const source = readFileSync('src/components/VisualBuyingGuide.astro', 'utf8');
    const sourceScript = source.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
    if (!sourceScript) throw new Error('VisualBuyingGuide must supply its client script');
    script = (await transformWithEsbuild(sourceScript, 'VisualBuyingGuide.client.ts', { loader: 'ts' })).code;
  });

  beforeEach(() => {
    browser = new Window({ url: 'https://agentesva.com/guides/example/' });
    browser.happyDOM.setWindowSize({ width: 390, height: 844 });
    browser.document.documentElement.lang = 'en';
    browser.document.body.innerHTML = markup();
    browser.eval(script);
  });

  afterEach(async () => {
    await browser.happyDOM.close();
  });

  const details = (id: string) => browser.document.getElementById(id) as unknown as HTMLDetailsElement;
  const navigate = (fragment: string, event: 'astro:page-load' | 'hashchange') => {
    browser.history.replaceState(null, '', `/guides/example/${fragment}`);
    if (event === 'hashchange') browser.dispatchEvent(new browser.HashChangeEvent(event));
    else browser.document.dispatchEvent(new browser.Event(event));
  };

  it('opens the clicked review and its collapsed ancestors without opening siblings', () => {
    browser.document.querySelector('#toc-link span')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true }));
    expect(details('inner').open).toBe(true);
    expect(details('outer').open).toBe(true);
    expect(details('other').open).toBe(false);
    expect(details('unrelated').open).toBe(false);
  });

  it('reveals a review requested by the initial fragment on Astro page load', () => {
    navigate('#review', 'astro:page-load');
    expect(details('inner').open).toBe(true);
    expect(details('outer').open).toBe(true);
  });

  it('reveals a different review when the fragment changes', () => {
    navigate('#other-review', 'hashchange');
    expect(details('other').open).toBe(true);
    expect(details('inner').open).toBe(false);
    expect(details('outer').open).toBe(false);
  });

  it.each(['#missing-review', '#%E0%A4%A'])('ignores an unknown or malformed fragment %s', fragment => {
    const errors: string[] = [];
    browser.addEventListener('error', event => errors.push(event.message));
    navigate(fragment, 'astro:page-load');
    navigate(fragment, 'hashchange');
    expect(errors).toEqual([]);
    expect(details('inner').open).toBe(false);
    expect(details('outer').open).toBe(false);
    expect(details('other').open).toBe(false);
  });

  it('does not reveal fragment targets outside a buying guide', () => {
    navigate('#outside', 'astro:page-load');
    navigate('#outside', 'hashchange');
    expect(details('unrelated').open).toBe(false);
  });

  it('does not treat unrelated page links as guide TOC clicks', () => {
    browser.document.querySelector('#outside-link span')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true }));
    expect(details('inner').open).toBe(false);
    expect(details('outer').open).toBe(false);
  });

  it('initializes replacement guide markup after Astro navigation using the existing listeners', () => {
    navigate('#review', 'astro:page-load');
    browser.document.body.innerHTML = markup('replacement-review');
    browser.document.documentElement.lang = 'es';
    navigate('#replacement-review', 'astro:page-load');
    expect(details('inner').open).toBe(true);
    expect(details('outer').open).toBe(true);
    expect(browser.document.querySelector<HTMLDetailsElement>('.buying-guide__contents')!.open).toBe(false);
    const table = browser.document.querySelector('table')!;
    expect(table.tabIndex).toBe(0);
    expect(table.getAttribute('aria-label')).toBe('Tabla comparativa; desplaza horizontalmente para ver más columnas');
  });

  it('keeps a mobile reader’s chosen contents state on repeated page-load initialization', () => {
    browser.document.dispatchEvent(new browser.Event('astro:page-load'));
    const contents = browser.document.querySelector<HTMLDetailsElement>('.buying-guide__contents')!;
    expect(contents.open).toBe(false);
    contents.open = true;
    browser.document.dispatchEvent(new browser.Event('astro:page-load'));
    expect(contents.open).toBe(true);
  });
});
