import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const root='.vercel/output/static';
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)]);
const sitemap=readFileSync(join(root,'sitemap-0.xml'),'utf8');
const serviceQuestions=new Map();
const descriptions=new Map();let count=0,profiles=0;
for(const file of files(root).filter(f=>f.endsWith('/index.html'))){
 const route='/'+file.slice(root.length+1).replace(/index.html$/,'');
 const w=new Window({settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
 const d=w.document;d.write(readFileSync(file,'utf8'));
 const skip=d.querySelector('.skip-link');if(skip)assert(d.querySelector(skip.getAttribute('href')),route+' skip target');
 const graphs=[...d.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const j=JSON.parse(s.textContent);return j['@graph']??[j]});
 if(/^\/(services\/(customer-support|sales|operations)|servicios\/automatizacion-(atencion-cliente|ventas|procesos))\/$/.test(route)){
  const faq=graphs.find(g=>g['@type']==='FAQPage');
  assert(faq?.mainEntity.length>=9,route+' service-specific FAQ');
  const question=faq.mainEntity[0].name;assert(!serviceQuestions.has(question),route+' generic service FAQ');serviceQuestions.set(question,route);
  assert(/automation|automatización/i.test(d.title),route+' service search title');
 }
 if(/^\/(herramienta|tools)\/[^/]+\/$/.test(route)){
  assert(d.title.includes(': '),route+' descriptive title');
  const faq=graphs.find(g=>g['@type']==='FAQPage');assert(faq?.mainEntity.length>=5,route+' specific FAQ');
  for(const q of faq.mainEntity){assert(d.querySelector('main').textContent.includes(q.name),route+' visible question');assert(d.querySelector('main').textContent.includes(q.acceptedAnswer.text),route+' visible answer');}
  assert.equal(graphs.find(g=>g['@type']==='BreadcrumbList').itemListElement.length,4,route+' category breadcrumb');profiles++;
 }
 if(/^\/(courses|resources)(\/category\/[^/]+)?\/$/.test(route)||/^\/(cursos|recursos)(\/[^/]+)?\/$/.test(route)||/^\/(tools\/category|herramientas)\/[^/]+\/$/.test(route)){
  const noindex=d.querySelector('meta[name=robots]')?.content.includes('noindex');
  if(noindex)assert(!sitemap.includes(`<loc>https://agentesva.com${route}</loc>`),route+' excluded from sitemap');
  else {const key=d.documentElement.lang+':'+d.querySelector('meta[name=description]').content;assert(!descriptions.has(key),route+' duplicate category description with '+descriptions.get(key));descriptions.set(key,route);}
 }
 for(const q of d.querySelectorAll('link[hreflang]'))assert(!d.querySelector('meta[name=robots]')?.content.includes('noindex'),route+' noindex alternate');
 w.close();count++;
}
assert.equal(profiles,108);
assert.equal((sitemap.match(/<loc>/g)||[]).length,298);
console.log(`SEO verification passed: ${count} HTML pages, ${profiles} tool profiles, 298 sitemap URLs.`);
process.exit(0);
