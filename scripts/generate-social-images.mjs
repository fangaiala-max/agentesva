import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {Window} from 'happy-dom';
const root='.vercel/output/static';
const walk=async dir=>(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(f=>f.isDirectory()?walk(path.join(dir,f.name)):[path.join(dir,f.name)]))).flat();
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const mark=(await fs.readFile('public/brand/social-mark.png')).toString('base64');
function category(route,en){
 const key=route.split('/')[1];
 const groups=[[/^(estudios|research)$/,['RESEARCH & COMPARISONS','ESTUDIOS Y COMPARATIVAS']], [/^(herramientas?|tools)$/,['AI TOOL DIRECTORY','DIRECTORIO DE HERRAMIENTAS']], [/^(guias|guides)$/,['PRACTICAL GUIDES','GUÍAS PRÁCTICAS']], [/^(noticias|news)$/,['AI NEWS & INSIGHTS','NOTICIAS Y ANÁLISIS']], [/^(cursos?|courses)$/,['LEARN & APPLY','APRENDE Y APLICA']], [/^(recursos?|resources|prompts|prompt-library)$/,['RESOURCES FOR YOUR TEAM','RECURSOS PARA TU EQUIPO']], [/^(pricing|precios-automatizacion-ia)$/,['SCOPE & INVESTMENT','ALCANCE E INVERSIÓN']]];
 return groups.find(([re])=>re.test(key))?.[1][en?0:1] ?? (en?'AI AUTOMATION, WITH PURPOSE':'AUTOMATIZACIÓN CON PROPÓSITO');
}
function wrap(text,max){const lines=[];let line='';for(const word of text.split(/\s+/)){if(line&&line.length+word.length+1>max){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;}
function card(title,route,en){
 const editorial=/^\/(estudios|research|guias|guides|noticias|news)\//.test(route);
 const headline=title.replace(/\s*\|\s*AgentesVA\s*$/,'').trim();
 let size=68,lines;do{lines=wrap(headline,Math.floor(790/(size*.55)));if(lines.length*size*1.15<=288)break;size-=2;}while(size>26);
 const y=210+Math.max(0,(265-lines.length*size*1.15)/2);
 const fg=editorial?'#f7f7fc':'#171b34',muted=editorial?'#b8bed7':'#60647c';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="spectrum" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#4e79ff"/><stop offset=".52" stop-color="#9967e8"/><stop offset="1" stop-color="#ee9cd8"/></linearGradient><radialGradient id="wash"><stop stop-color="${editorial?'#453475':'#e5ddff'}"/><stop offset="1" stop-color="${editorial?'#12172d':'#f5f4fb'}"/></radialGradient><clipPath id="round"><rect x="64" y="54" width="56" height="56" rx="15"/></clipPath></defs><rect width="1200" height="630" fill="${editorial?'#12172d':'#f5f4fb'}"/><ellipse cx="1160" cy="280" rx="440" ry="490" fill="url(#wash)"/><path d="M940 650 C850 485 1190 430 1005 280 S1110 45 1300 30" fill="none" stroke="url(#spectrum)" stroke-width="60" opacity=".65"/><path d="M975 655 C885 490 1225 435 1040 285 S1145 50 1335 35" fill="none" stroke="${fg}" stroke-width="1.5" opacity=".24"/><circle cx="1008" cy="281" r="12" fill="#e7b6ed"/><image x="64" y="54" width="56" height="56" clip-path="url(#round)" href="data:image/png;base64,${mark}"/><text x="137" y="94" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" fill="${fg}">AgentesVA</text><text x="1136" y="90" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="18" letter-spacing="3" fill="${muted}">${en?'EN':'ES'}</text><text x="66" y="169" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" letter-spacing="2.4" fill="${editorial?'#b7a4ff':'#6845bc'}">${escape(category(route,en))}</text>${lines.map((line,i)=>`<text x="61" y="${y+i*size*1.15}" dominant-baseline="hanging" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="700" letter-spacing="-1.8" fill="${fg}">${escape(line)}</text>`).join('')}<path d="M64 540 H1136" stroke="${fg}" opacity=".14"/><text x="64" y="583" font-family="Arial,Helvetica,sans-serif" font-size="21" fill="${muted}">agentesva.com</text><text x="1136" y="583" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="18" fill="${muted}">${en?'Practical ideas. Useful systems.':'Ideas prácticas. Sistemas útiles.'}</text></svg>`;
}
const manifest=[];
for(const file of (await walk(root)).filter(f=>f.endsWith('.html'))){
 const html=await fs.readFile(file,'utf8');if(!html.includes('property="og:image"'))continue;
 const w=new Window({settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});w.document.write(html);
 const d=w.document,route=new URL(d.querySelector('link[rel="canonical"]').href).pathname,en=d.documentElement.lang==='en';
 const target=new URL(d.querySelector('meta[property="og:image"]').content).pathname;
 const title=d.title;await w.happyDOM.abort();w.close();
 if(!target.startsWith('/social/og/'))continue;
 const png=await sharp(Buffer.from(card(title,route,en))).png().toBuffer();
 const metadata=await sharp(png).metadata();if(metadata.width!==1200||metadata.height!==630)throw new Error('Invalid OG size');
 for(const base of [root,'dist/client','public']){const out=path.join(base,target);await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,png);}
 if(route==='/'||route==='/es/'){
  const alias=route==='/'?'brand/og-en.png':'og.png';
  for(const base of [root,'dist/client','public'])await fs.writeFile(path.join(base,alias),png);
 }
 manifest.push({route,title,image:target,bytes:png.length});
}
await fs.writeFile(path.join(root,'social/og/manifest.json'),JSON.stringify(manifest,null,2));
console.log(`Social images: ${manifest.length} page-specific PNG cards generated and verified (1200×630).`);
