import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Window } from 'happy-dom';
import sharp from 'sharp';

const root = '.vercel/output/static';
const definitions = [
  ['mejores-herramientas-automatizar-procesos', 'processes', 7],
  ['mejores-skills-claude-gratis-pago', 'claude', 10],
  ['mejores-herramientas-automatizar-redes-sociales', 'social', 7],
];
const results = [];
for (const [slug, kind, entries] of definitions) for (const lang of ['es', 'en']) {
  const section = lang === 'es' ? 'guias' : 'guides';
  const route = `/${section}/${slug}/`;
  const window = new Window({ settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  const doc = window.document;
  doc.write(readFileSync(join(root, route, 'index.html'), 'utf8'));
  assert.equal(doc.documentElement.lang, lang, `${route} language`);
  assert.equal(doc.querySelector('link[rel="canonical"]').href, `https://agentesva.com${route}`, `${route} canonical`);
  for (const [language, prefix] of [['es', 'guias'], ['en', 'guides']]) {
    assert.equal(doc.querySelector(`link[hreflang="${language}"]`).href, `https://agentesva.com/${prefix}/${slug}/`, `${route} paired edition`);
  }
  const article = doc.querySelector('article#guide-content');
  assert(article, `${route} full article`);
  assert(article.textContent.split(/\s+/).length > 2200, `${route} substantive full edition`);
  assert.equal(article.querySelectorAll('.guide-feature').length, entries, `${route} recommendation count`);
  assert([...article.querySelectorAll('table')].some(table => table.querySelectorAll('tbody tr').length === entries), `${route} complete comparison table`);
  assert(!doc.querySelector('.en-source-note'), `${route} no overview fallback`);
  assert(article.lastElementChild.matches('figure.guide-infographic'), `${route} final infographic`);
  assert.equal(article.querySelectorAll('.guide-infographic a[download]').length, 2, `${route} downloads`);
  for (const a of doc.querySelectorAll('main a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) assert(doc.getElementById(decodeURIComponent(href.slice(1))), `${route} anchor ${href}`);
    const url = new URL(href, `https://agentesva.com${route}`);
    if (url.origin !== 'https://agentesva.com') continue;
    const file = join(root, url.pathname, url.pathname.endsWith('/') ? 'index.html' : '');
    assert(existsSync(file), `${route} local target ${url.pathname}`);
  }
  for (const img of article.querySelectorAll('img,source')) {
    const file = img.getAttribute('src') ?? img.getAttribute('srcset');
    const metadata = await sharp(join(root, file)).metadata();
    assert.equal(metadata.width, Number(img.getAttribute('width')), `${route} image width ${file}`);
    assert.equal(metadata.height, Number(img.getAttribute('height')), `${route} image height ${file}`);
    assert(file.includes(`${kind}-`), `${route} matching visual family`);
  }
  results.push({ route, language: lang, entries, words: article.textContent.trim().split(/\s+/).length });
  window.close();
}
console.log('Built buying guides verified: full bilingual articles, localized figures, downloads, anchors, internal targets, canonical/hreflang and intrinsic image dimensions.');
console.log(JSON.stringify(results));
