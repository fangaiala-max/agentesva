import fs from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter } from 'astro/markdown';

const root = process.cwd();
const folder = 'docs/editorial/2026-10-18-guias-automatizacion';
const defs = [
  { kind:'processes', slug:'mejores-herramientas-automatizar-procesos', es:'01-herramientas-automatizar-procesos.md', en:'01-process-automation-tools.en.md',
    alt:{es:'Papeles dispersos se organizan en un flujo con una ruta separada para las excepciones.',en:'Scattered papers become an organised workflow with a separate path for exceptions.'},
    points:{es:['Empieza por una función nativa si resuelve la tarea.','Compara el coste de un trabajo terminado, no unidades de facturación distintas.','Asigna quién revisa los fallos y mantiene el proceso.'],en:['Start with a built-in feature if it solves the job.','Compare the cost of a completed job, not unlike billing units.','Assign an owner for failures and maintenance.']}},
  { kind:'claude', slug:'mejores-skills-claude-gratis-pago', es:'02-mejores-skills-claude.md',en:'02-best-claude-skills.en.md',
    alt:{es:'Un taller modular conecta instrucciones, documentos y herramientas opcionales.',en:'A modular workshop connects instructions, work files and optional tools.'},
    points:{es:['Distingue skills, plugins, conectores y entorno de ejecución.','El precio de un pack no incluye necesariamente APIs o servicios externos.','Valora una skill por la entrega y las correcciones que necesita.'],en:['Distinguish skills, plugins, connectors and the execution environment.','A pack price does not necessarily include APIs or external services.','Judge a skill by its output and the corrections it needs.']}},
  { kind:'social', slug:'mejores-herramientas-automatizar-redes-sociales', es:'03-herramientas-automatizar-redes-sociales.md',en:'03-social-media-automation-tools.en.md',
    alt:{es:'Las piezas de contenido pasan por una revisión antes de llegar a distintos calendarios.',en:'Content passes through a review gate before reaching different publishing calendars.'},
    points:{es:['Una cola gratuita no equivale a un cupo mensual.','Calcula el coste con tus perfiles, marcas y personas reales.','Comprueba la publicación y conserva una ruta para corregir o retirar.'],en:['A free queue is not a monthly allowance.','Calculate cost using your actual profiles, brands and people.','Confirm publication and keep a way to correct or remove content.']}},
];

function figure(kind,lang,type) {
 const en=lang==='en', base='/images/guides/buying';
 const caption=type==='flow'?(en?'A proposed workflow, not a tested customer result.':'Flujo propuesto; no representa un resultado probado de cliente.'):(en?'Save this decision guide. Full details and source links are in the article.':'Guarda esta guía de decisión. El detalle y las fuentes están en el artículo.');
 const alt=type==='flow'?(en?'Diagram of the steps described in the surrounding text.':'Diagrama de los pasos descritos en el texto que lo acompaña.'):(en?'Visual summary of the recommendations and conditions explained above.':'Resumen visual de las recomendaciones y condiciones explicadas arriba.');
 return `\n<figure class="guide-${type}">
  <picture>
    <source media="(max-width: 600px)" srcset="${base}/${kind}-${type}-${lang}-mobile.png" width="600" height="${type==='flow'?1180:370+({processes:3,claude:4,social:5}[kind])*370+520}">
    <img src="${base}/${kind}-${type}-${lang}.png" alt="${alt}" width="1200" height="${type==='flow'?660:310+({processes:3,claude:4,social:5}[kind])*280+400}" loading="lazy" decoding="async">
  </picture>
  <figcaption>${caption}</figcaption>
  ${type==='infographic'?`<a class="guide-download" href="${base}/${kind}-infographic-${lang}.png" download>${en?'Download the infographic (PNG)':'Descargar infografía (PNG)'} <span aria-hidden="true">↓</span></a>
  <a class="guide-download" href="${base}/${kind}-infographic-${lang}.svg" download>${en?'Download editable vector (SVG)':'Descargar vector editable (SVG)'} <span aria-hidden="true">↓</span></a>`:''}
</figure>\n`;
}

await fs.mkdir(path.join(root,'src/content/guide-translations'),{recursive:true});
const editorial=JSON.parse(await fs.readFile('src/i18n/editorial.json','utf8'));
for(const d of defs) for(const lang of ['es','en']) {
 const source=await fs.readFile(path.join(folder,d[lang]),'utf8');
 const {frontmatter:f}=parseFrontmatter(source);
 let body=source.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/^\s*# [^\n]+\n/,'').trim();
 // Production prose describes completed assets; workflow notes remain in the
 // review packet only.
 body=body.replace(/^\*Final visual awaiting[^\n]+\*\s*$/m,'').replace(/^\*Cierre visual pendiente[^\n]+\*\s*$/m,'');
 body=body.replace(/\*\*(?:Diagrama editorial propuesto|Proposed editorial diagram):\*\*/g,lang==='en'?'**The workflow:**':'**El flujo:**');
 body=body.replace(/\*\*(?:Contenido de la infografía, con equivalente textual|Infographic content, with a text equivalent):\*\*/g,lang==='en'?'**Keep these decisions in mind:**':'**Quédate con estas decisiones:**');
 if(lang==='en') body=body.replaceAll('https://agentesva.com/diagnostico/','https://agentesva.com/assessment/');
 const sectionLines=body.split('\n');
 let feature=false; const formatted=[];
 for(const line of sectionLines) {
   if(/^## /.test(line)) {
     if(feature){formatted.push('</section>','');feature=false;}
     if(/^## \d+\./.test(line)){formatted.push('<section class="guide-feature">','');feature=true;}
   }
   formatted.push(line);
 }
 if(feature)formatted.push('','</section>');
 body=formatted.join('\n');
 // The diagram sits within the explanatory section, with the narrative text
 // retaining the complete equivalent.
 const diagramMarker=lang==='en'?'**The workflow:**':'**El flujo:**';
 const markerAt=body.indexOf(diagramMarker);
 const endLine=body.indexOf('\n',markerAt);
 if(markerAt<0)throw new Error(`Missing diagram insertion point: ${d.slug}/${lang}`);
 body=body.slice(0,endLine)+ '\n'+figure(d.kind,lang,'flow')+body.slice(endLine);
 body=body.trim()+'\n'+figure(d.kind,lang,'infographic');
 const faqs=[...body.matchAll(/^### ([^\n]+)\n+([\s\S]*?)(?=\n### |\n## |$)/gm)].map(m=>({q:m[1],a:m[2].replace(/<[^>]+>/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\*\*/g,'').replace(/\s+/g,' ').trim()}));
 const sources=[...body.matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g)].filter(m=>!m[2].startsWith('https://agentesva.com/')).map(m=>({titulo:m[1],url:m[2],editor:new URL(m[2]).hostname,fecha:'Consulta: 2026-10-18'})).filter((s,i,a)=>a.findIndex(v=>v.url===s.url)===i);
 const related=defs.filter(x=>x!==d).map(x=>({titulo:lang==='en'?({processes:'Choose a process automation tool',claude:'Choose useful Claude skills',social:'Choose a social media tool'}[x.kind]):({processes:'Elige una herramienta para procesos',claude:'Elige skills útiles para Claude',social:'Elige una herramienta para redes'}[x.kind]),href:`/${lang==='en'?'guides':'guias'}/${x.slug}/`}));
 related.push({titulo:lang==='en'?'What should you automate first?':'Qué conviene automatizar primero',href:`/${lang==='en'?'guides':'guias'}/procesos-que-conviene-automatizar-primero/`});
 const meta={titulo:f.titulo,seoTitulo:lang==='en'?({processes:'Best process automation tools: free and paid',claude:'Best Claude skills: free and paid options',social:'Best social media automation tools: free and paid'}[d.kind]):({processes:'Mejores herramientas para automatizar procesos',claude:'Mejores skills de Claude: gratis y de pago',social:'Mejores herramientas para automatizar redes sociales'}[d.kind]),descripcion:d.kind==='processes'&&lang==='es'?f.descripcion.replace('pruebas prácticas','criterios de prueba'):f.descripcion,fecha:'2026-10-18',actualizado:'2026-10-18',tema:lang==='en'?'Tools, costs and useful decisions':'Herramientas, costes y decisiones útiles',visual:d.kind,respuesta:body.split('\n')[0].replaceAll('**',''),puntosClave:d.points[lang],portada:{src:`/images/guides/buying/${d.kind}-cover.jpg`,alt:d.alt[lang],width:1440,height:960},relacionados:related,faq:faqs,fuentes:sources};
 const yaml=Object.entries(meta).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n');
 const dir=lang==='es'?'guias':'guide-translations';
 await fs.writeFile(`src/content/${dir}/${d.slug}.md`, `---\n${yaml}\n---\n\n${body}`.replace(/[ \t]+$/gm, '').trimEnd()+'\n');
 if(lang==='en')editorial[`guides/${d.slug}`]={title:f.titulo,description:f.descripcion,body:meta.respuesta,points:d.points.en};
}
await fs.writeFile('src/i18n/editorial.json',JSON.stringify(editorial,null,2)+'\n');
console.log('Six full guide editions prepared; new English directory entries added.');
