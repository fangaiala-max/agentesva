import assert from 'node:assert/strict';
import fs from 'node:fs';

const readBuiltFile = (relativePath) => fs.readFileSync(new URL(`../dist/client/${relativePath}`, import.meta.url), 'utf8');

const html = readBuiltFile('guias/como-convertirse-en-especialista-geo/index.html');
assert.match(html, /<title>Cómo ser especialista GEO: plan de 90 días \| AgentesVA<\/title>/);
assert.match(html, /<meta property="og:type" content="article">/);
assert.match(html, /<meta property="og:image" content="https:\/\/agentesva\.com\/social\/og\/[a-f0-9]{20}\.png">/);
assert.match(html, /<meta name="twitter:image" content="https:\/\/agentesva\.com\/social\/og\/[a-f0-9]{20}\.png">/);

const sitemap = readBuiltFile('sitemap-0.xml');
for (const route of [
  'guias/',
  'guias/seo-para-ia/',
  'guias/como-aparecer-en-chatgpt/',
  'guias/medir-visibilidad-en-chatgpt/',
  'guias/como-convertirse-en-especialista-geo/',
]) {
  assert.match(sitemap, new RegExp(`${route}<\\/loc><lastmod>2026-08-13`));
}

console.log('Built GEO guide metadata and sitemap verified.');
