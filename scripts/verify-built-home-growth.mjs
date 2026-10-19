import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Window } from 'happy-dom';

const root = process.argv[2] ?? '.vercel/output/static';
const origin = 'https://agentesva.com';
for (const [home, assessment, lang] of [['/', '/assessment/', 'en'], ['/es/', '/diagnostico-automatizacion-ia/', 'es']]) {
  const window = new Window({ url: origin + home, settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  try {
    const doc = window.document;
    doc.write(readFileSync(join(root, home, 'index.html'), 'utf8'));
    const demo = doc.querySelector('[data-demo-root]');
    assert(demo, `${home} demo exists`);
    assert.equal(demo.querySelectorAll('[role="tab"]').length, 3, `${home} three areas`);
    const cta = demo.querySelector('a[data-demo-assessment]');
    assert(cta, `${home} demo assessment action`);
    const target = new URL(cta.getAttribute('href'), origin);
    assert.equal(target.pathname, assessment, `${home} localized assessment`);
    assert.equal(target.searchParams.get('service'), 'customer_service_automation', `${home} initial demo context`);
    assert.equal(target.searchParams.get('placement'), 'demo_assessment', `${home} attribution`);
    assert.equal(cta.getAttribute('data-track-service'), target.searchParams.get('service'), `${home} tracking matches context`);
    assert(demo.querySelector('a[data-demo-service]'), `${home} service remains available`);
    assert(existsSync(join(root, target.pathname, 'index.html')), `${home} destination exists`);
    doc.open();
    doc.write(readFileSync(join(root, assessment, 'index.html'), 'utf8'));
    const main = doc.querySelector('main[data-diagnostic-root]');
    assert(main, `${assessment} assessment exists`);
    assert.equal(doc.documentElement.lang, lang, `${assessment} document language`);
    const breadcrumb = main.querySelector(`nav[aria-label="${lang === 'en' ? 'Breadcrumb' : 'Ruta de navegación'}"]`);
    assert(breadcrumb, `${assessment} localized breadcrumb label`);
    const first = breadcrumb.querySelector('a');
    assert.equal(first.textContent.trim(), lang === 'en' ? 'Home' : 'Inicio', `${assessment} home label`);
    if (lang === 'en') {
      assert.equal(new URL(first.getAttribute('href'), origin).pathname, '/', `${assessment} primary home`);
      const schema = [...main.querySelectorAll('script[type="application/ld+json"]')]
        .map(node => JSON.parse(node.textContent)).find(node => node['@type'] === 'BreadcrumbList');
      assert.equal(schema?.['@context'], 'https://schema.org', `${assessment} standalone breadcrumb context`);
      assert.deepEqual(schema.itemListElement.map(item => [item.name, item.item]), [
        ['Home', `${origin}/`], ['Automation assessment', `${origin}/assessment/`],
      ], `${assessment} visible and structured breadcrumbs agree`);
    }
    assert(main.querySelector('[data-assessment-context][hidden]'), `${assessment} progressively enhanced context notice`);
    assert.equal(main.querySelectorAll('input[type="radio"][checked]').length, 0, `${assessment} no prefilled answers`);
  } finally { window.close(); }
}
console.log('Built homepage growth journey verified: EN/ES demo assessment context, preserved service action, localized breadcrumbs and no prefilled answers. Browser layout remains a separate check.');
