import fs from 'node:fs';
import path from 'node:path';
import {Window} from 'happy-dom';
const root=path.resolve('.vercel/output/static');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html')&&!full.includes('/pagefind/'))files.push(full);}}
walk(root);
const window=new Window({settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
const dynamic=['/descarga/','/entrega/','/gracias-diagnostico/','/assessment/thanks/'];
const errors=[];const rows=[];
for(const file of files){
 const route='/'+path.relative(root,file).replace(/index\.html$/,'');
 if(route==='/googleb15b297fd282b611.html')continue;
 const doc=new window.DOMParser().parseFromString(fs.readFileSync(file,'utf8'),'text/html');
 const exists=(pathname)=>dynamic.includes(pathname)||fs.existsSync(path.join(root,pathname))||fs.existsSync(path.join(root,pathname,'index.html'))||pathname.startsWith('/api/')||pathname.startsWith('/ir/');
 const unresolved=[];
 for(const a of doc.querySelectorAll('a[href]')){
  const href=a.getAttribute('href');if(!href||!href.startsWith('/')||href.startsWith('//'))continue;
  const url=new URL(href,'https://agentesva.com');if(!exists(decodeURIComponent(url.pathname)))unresolved.push(href);
 }
 const alternates=[...doc.querySelectorAll('link[hreflang]')].map(l=>({lang:l.getAttribute('hreflang'),href:l.getAttribute('href')}));
 for(const alt of alternates){const p=new URL(alt.href).pathname;if(!exists(p))errors.push({route,error:'missing alternate',target:p});}
 for(const image of doc.querySelectorAll('img')){if(!image.hasAttribute('alt'))errors.push({route,error:'image without alt'});const src=image.getAttribute('src');if(src?.startsWith('/')&&!exists(src))errors.push({route,error:'missing image',target:src});}
 const h1=doc.querySelectorAll('h1').length;
 if(h1!==1)errors.push({route,error:'heading count',count:h1});
 if(unresolved.length)errors.push({route,error:'broken internal links',targets:[...new Set(unresolved)]});
 const lang=doc.documentElement.lang;
 rows.push({route,lang,h1,canonical:doc.querySelector('link[rel=canonical]')?.getAttribute('href'),alternates,links:doc.querySelectorAll('a').length});
}
const result={pages:rows.length,english:rows.filter(r=>r.lang==='en').length,spanish:rows.filter(r=>r.lang==='es').length,errors,rows};
fs.mkdirSync('artifacts/english-first/after',{recursive:true});fs.writeFileSync('artifacts/english-first/after/static-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({pages:result.pages,english:result.english,spanish:result.spanish,errors},null,2));
await window.happyDOM.close();
if(errors.length)process.exitCode=1;
