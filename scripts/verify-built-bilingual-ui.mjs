import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const base='.vercel/output/static',origin='https://agentesva.com';
const read=(path)=>{const w=new Window({url:origin+path});w.document.write(readFileSync(join(base,path,'index.html'),'utf8'));return w.document;};
const pairs=[['/','/es/'],['/services/','/servicios/'],['/pricing/','/precios-automatizacion-ia/'],['/how-we-work/','/como-trabajamos/'],['/tools/','/herramientas/'],['/courses/','/cursos/'],['/resources/','/recursos/'],...['customer-support','sales','operations'].map((s,i)=>[`/services/${s}/`,`/servicios/${['automatizacion-atencion-cliente','automatizacion-ventas','automatizacion-procesos'][i]}/`])];
let checks=0;
for(const [en,es] of pairs){for(const [path,lang] of [[en,'en'],[es,'es']]){
 const doc=read(path);assert.equal(doc.documentElement.lang,lang,path);assert.equal(doc.querySelectorAll('main h1').length,1,path);assert.equal(doc.querySelectorAll('#site-nav .explore-menu a').length,6,path);assert(doc.querySelector('#site-nav a[href*="placement=mobile_menu"]'),path+' mobile CTA');assert(doc.querySelector('#search-modal'),path+' search');
 for(const a of doc.querySelectorAll('main a[href],#site-nav a[href]')){
  const url=new URL(a.getAttribute('href'),origin+path);if(url.origin!==origin||!url.pathname.endsWith('/'))continue;
  if(/^\/(api|ir)\//.test(url.pathname))continue;
  assert(existsSync(join(base,url.pathname,'index.html')),path+' broken '+url.pathname);
 }
 checks++;
}}
for(const path of ['/pricing/','/precios-automatizacion-ia/']){
 const doc=read(path);assert.equal(doc.querySelectorAll('[data-shared-pricing] thead th').length,4);
 const offers=[...doc.querySelectorAll('[data-shared-pricing] a')].map(a=>new URL(a.href).searchParams.get('offer'));assert.deepEqual(offers,['workshop','scoped','integrated','support']);
 assert(doc.querySelector('table caption'));assert.equal(doc.querySelectorAll('[data-shared-pricing] tbody th[scope="row"]').length,5);
}
for(const path of ['/how-we-work/','/como-trabajamos/'])assert.equal(read(path).querySelectorAll('.shared-timeline>li').length,6);
for(const path of ['/tools/','/herramientas/'])assert.equal(read(path).querySelectorAll('[data-compare]').length,54);
for(const filename of readdirSync('src/content/tools')){
 if(!filename.endsWith('.json'))continue;const slug=filename.replace('.json','');
 for(const prefix of ['/tools/','/herramienta/']){
  const path=prefix+slug+'/',doc=read(path);const graph=[...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const j=JSON.parse(s.textContent);return j['@graph']??[j]});
  for(const type of ['SoftwareApplication','FAQPage','BreadcrumbList'])assert(graph.some(x=>x['@type']===type),path+' schema '+type);
  assert.equal(doc.querySelectorAll('[role="tab"]').length,3,path);assert(doc.querySelector('#save-btn'),path);assert(doc.querySelector('a[data-track-placement="tool_contextual"]'),path);checks++;
 }
}
console.log(`Bilingual UI: ${checks} page checks passed; pricing context, menus, search, workflows, schemas and tool tabs verified.`);
