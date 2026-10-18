import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {Window} from 'happy-dom';
const root='.vercel/output/static';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(dir,f.name)):[path.join(dir,f.name)]);
let count=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');if(!html.includes('property="og:image"'))continue;
 const w=new Window({settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});w.document.write(html);const d=w.document;
 const og=d.querySelector('meta[property="og:image"]').content;assert.equal(d.querySelector('meta[name="twitter:image"]').content,og,file);
 const image=path.join(root,new URL(og).pathname);assert(fs.existsSync(image),file+' OG image missing');
 const meta=await sharp(image).metadata();assert.equal(meta.width,1200,file);assert.equal(meta.height,630,file);assert(d.querySelector('meta[property="og:image:alt"]')?.content,file+' missing alt');
 for(const script of d.querySelectorAll('script[type="application/ld+json"]')){const json=JSON.parse(script.textContent);for(const item of json['@graph']??[json]){if(['Article','NewsArticle','CreativeWork'].includes(item['@type'])&&item.image)assert.equal(item.image,og,file+' article image mismatch');}}
 await w.happyDOM.abort();w.close();count++;
}
for(const [name,size] of [['favicon.png',32],['apple-touch-icon.png',180]]){const meta=await sharp(path.join(root,name)).metadata();assert.equal(meta.width,size);assert.equal(meta.height,size);}
console.log(`Social metadata verified: ${count} pages, matching OG/Twitter/article images, valid PNG dimensions and favicon sizes.`);
process.exit(0);
