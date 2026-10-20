import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';

const root='.vercel/output/static',site='https://agentesva.com',failures=[];
let checks=0;
function check(label,test){try{test();checks++;}catch(error){failures.push(`${label}: ${error.message}`);}}
function page(route){
 const w=new Window({url:site+route,settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
 w.document.write(readFileSync(join(root,route,'index.html'),'utf8'));
 const d=w.document,graph=[...d.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const j=JSON.parse(s.textContent);return j['@graph']??[j]});
 return {d,graph,close:()=>w.close()};
}

for(const slug of ['curso-seguridad-llm','pack-30-prompts','skill-atencion-cliente']){
 const route=`/recurso/${slug}/`,p=page(route),product=p.graph.find(n=>n['@type']==='Product');
 check(route+' product image',()=>{
  assert(product?.image,'Missing Product.image');
  const url=new URL(typeof product.image==='string'?product.image:product.image.url);
  assert.equal(url.origin,site);assert(existsSync(join(root,url.pathname)),'image file missing');
  assert([...p.d.querySelectorAll('main img')].some(img=>new URL(img.getAttribute('src'),site).href===url.href),'product image not visible');
 });
 check(route+' brand',()=>assert.equal(product?.brand?.['@type'],'Brand'));
 check(route+' accurate offer',()=>{
  const content=JSON.parse(readFileSync(`src/content/recursos/${slug}.json`));
  const expected=content.precio==='Gratis'?0:Number(content.precioDesde.replace(/\s|€/g,'').replace(',','.'));
  assert(Number.isFinite(expected),'unreadable source price');
  assert.equal(Number(product.offers.price),expected);
  assert.equal(product.offers.priceCurrency,'EUR');
  assert(!product.aggregateRating&&!product.review,'unsubstantiated rating');
 });
 p.close();
}
{
 const p=page('/recurso/biblioteca-ia/');
 check('mixed library collection',()=>{assert(!p.graph.some(n=>n['@type']==='Product'),'mixed library emitted as one free Product');assert(p.graph.some(n=>n['@type']==='CollectionPage'));});p.close();
}
const descriptions=new Set();
for(const slug of ['', 'chatgpt','marketing','ventas','redes-sociales','atencion-cliente','empresas-pymes']){
 const route='/prompt-library/'+(slug?slug+'/':''),p=page(route),description=p.d.querySelector('meta[name="description"]').content;
 check(route+' distinct description',()=>{assert(!descriptions.has(description),'reused prompt-category description');descriptions.add(description);});
 check(route+' breadcrumb parity',()=>{const trail=p.graph.find(n=>n['@type']==='BreadcrumbList');assert(trail);assert.equal(trail.itemListElement.at(-1).item,site+route);});p.close();
}
for(const filename of readdirSync('src/content/cursos').filter(f=>f.endsWith('.json'))){
 const data=JSON.parse(readFileSync(join('src/content/cursos',filename))),route=`/courses/${filename.replace('.json','')}/`,p=page(route);
 check(route+' actual provider',()=>{const course=p.graph.find(n=>n['@type']==='Course');const provider=course?.provider?.['@id']?p.graph.find(n=>n['@id']===course.provider['@id']):course?.provider;assert.equal(provider?.name,data.proveedor);assert(p.d.querySelector('main').textContent.includes(data.proveedor),'provider not visible');});p.close();
}
for(const route of ['/services/','/servicios/','/pricing/','/precios-automatizacion-ia/','/how-we-work/','/como-trabajamos/',...['customer-support','sales','operations'].map(s=>`/services/${s}/`),...['atencion-cliente','ventas','procesos'].map(s=>`/servicios/automatizacion-${s}/`)]){
 const p=page(route);
 check(route+' one connected page',()=>{const pages=p.graph.filter(n=>n['@type']==='WebPage');assert.equal(pages.length,1);assert.equal(pages[0]['@id'],site+route+'#webpage');assert.equal(pages[0].isPartOf?.['@id'],site+'/#website');});
 check(route+' expected service relationship',()=>{
  const services=p.graph.filter(n=>n['@type']==='Service');
  const process=['/how-we-work/','/como-trabajamos/'].includes(route);
  assert.equal(services.length,process?0:1);
  if(!process){const webpage=p.graph.find(n=>n['@type']==='WebPage');assert.equal(webpage.mainEntity?.['@id'],services[0]['@id']);assert.equal(services[0].mainEntityOfPage?.['@id'],webpage['@id']);}
 });
 for(const n of p.graph.filter(n=>n['@type']==='Service'))check(route+' service identity',()=>{assert.equal(n['@id'],site+route+'#service');assert.equal(n.provider?.['@id'],site+'/#organization');});
 p.close();
}
for(const route of ['/prompt-builder/','/generador-de-prompts/']){
 const p=page(route);check(route+' functional app metadata',()=>{const app=p.graph.find(n=>n['@type']==='WebApplication');assert(app);assert.equal(Number(app.offers.price),0);assert.equal(app.inLanguage,p.d.documentElement.lang);});p.close();
}
for(const section of ['guias','guides'])for(const slug of ['mejores-herramientas-automatizar-procesos','mejores-skills-claude-gratis-pago','mejores-herramientas-automatizar-redes-sociales']){
 const route=`/${section}/${slug}/`,p=page(route);
 check(route+' editorial images and publisher',()=>{
  const article=p.graph.find(n=>n['@type']==='Article');assert(article);
  const org=p.graph.find(n=>n['@type']==='Organization');assert.equal(article.publisher.logo.url,org.logo.url);
  const images=Array.isArray(article.image)?article.image:[article.image];
  assert(images.includes(site+p.d.querySelector('.buying-guide__cover img').getAttribute('src')),'representative visible guide artwork missing from Article.image');
  assert(p.d.querySelector('meta[name="robots"]').content.includes('max-image-preview:large'));
 });p.close();
}
if(failures.length){console.error(failures.join('\n'));console.error(`${failures.length} search-appearance failures; ${checks} passing checks.`);process.exit(1);}
console.log(`Search appearance verified: ${checks} checks; 3 Product offers, mixed library, 7 prompt pages, 16 course providers, shared graphs and bilingual builders/guides.`);
process.exit(0);
