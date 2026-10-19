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

const figmaAssets=JSON.parse(await fs.readFile(path.join(folder,'figma-v2/asset-manifest.json'),'utf8'));
const escapeHtml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function figure(kind,lang,type) {
 const en=lang==='en', base='/images/guides/figma';
 const captions={
   processes:{atlas:en?'Start with a built-in feature, connect applications, or take technical ownership. Choose by the work.':'Empieza por una función nativa, conecta aplicaciones o asume la operación técnica. Elige por el trabajo.',case:en?'Proposed example: a valid request updates one record; missing data goes to a person. Retry with the same ID.':'Ejemplo propuesto: una solicitud válida actualiza una ficha; un dato ausente pasa a una persona. Reintenta con el mismo ID.',infographic:en?'Hypothetical action count. Credits, tasks and executions follow different provider rules; this is not a bill.':'Cuenta hipotética de acciones. Créditos, tareas y ejecuciones siguen reglas distintas; no es una factura.'},
   claude:{atlas:en?'Choose work files, a reusable method, or connected services. The article explains availability, licences and costs.':'Elige archivos de trabajo, un método reutilizable o servicios conectados. La guía explica disponibilidad, licencias y costes.',case:en?'The pack, Claude environment, connected accounts and external usage are separate layers to check.':'El pack, el entorno Claude, las cuentas conectadas y el consumo externo son capas distintas que debes comprobar.',infographic:en?'Proposed checks: change a spreadsheet input, edit the document, inspect every slide, and verify PDF extraction.':'Pruebas propuestas: cambia una entrada de la hoja, edita el documento, revisa cada diapositiva y verifica la extracción del PDF.'},
   social:{atlas:en?'Choose by the bottleneck: a small queue, editorial planning, or coordination between people.':'Elige por el cuello de botella: una cola pequeña, planificación editorial o coordinación entre personas.',case:en?'Free plans checked 18 October 2026: Buffer allows 10 pending posts per channel across 3 channels for 1 user; Metricool allows 20 posts/month for 1 brand and excludes LinkedIn and X.':'Planes gratuitos revisados el 18 de octubre de 2026: Buffer permite 10 publicaciones pendientes por canal, 3 canales y 1 usuario; Metricool permite 20 publicaciones al mes para 1 marca, sin LinkedIn ni X.',infographic:en?'Proposed workflow: prepare, approve, schedule and confirm. When context changes, pause, correct and approve again.':'Flujo propuesto: prepara, aprueba, programa y confirma. Si cambia el contexto, pausa, corrige y vuelve a aprobar.'},
 };
 const caption=captions[kind][type];
 const alt=caption;
 const dimensions=suffix=>{const file=`public${base}/${kind}-${type}-${lang}${suffix}.png`;const asset=figmaAssets.find(a=>a.file===file);if(!asset)throw new Error(`Missing Figma export: ${file}`);return asset;};
 const desktop=dimensions(''),mobile=dimensions('-mobile');
 return `\n<figure class="guide-${type}">
  <picture>
    <source media="(max-width: 600px)" srcset="${base}/${kind}-${type}-${lang}-mobile.png" width="${mobile.width}" height="${mobile.height}">
    <img src="${base}/${kind}-${type}-${lang}.png" alt="${escapeHtml(alt)}" width="${desktop.width}" height="${desktop.height}" loading="lazy" decoding="async">
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
 const atlasAt=body.indexOf('\n## ');
 if(atlasAt<0)throw new Error(`Missing first section: ${d.slug}/${lang}`);
 body=body.slice(0,atlasAt)+'\n'+figure(d.kind,lang,'atlas')+body.slice(atlasAt);
 const access={
   processes:lang==='en'?['Free plan · paid options','Free plan · paid options','Self-hosted Community · Cloud trial','Free plan · paid options','Trial / check your licence','Free plan · paid options','No extra editor licence · usage limits']:['Plan gratuito · opciones de pago','Plan gratuito · opciones de pago','Community autoalojada · prueba Cloud','Plan gratuito · opciones de pago','Prueba / comprueba tu licencia','Plan gratuito · opciones de pago','Editor sin licencia adicional · cuotas'],
   claude:lang==='en'?['Included capability · plan limits','Included capability · plan limits','Included capability · plan limits','Included capability · plan limits','Free public example','Free public example','Free · MIT','Free · MIT','USD 39 one-off · external usage extra','USD 79 one-off · external usage extra']:['Capacidad incluida · límites del plan','Capacidad incluida · límites del plan','Capacidad incluida · límites del plan','Capacidad incluida · límites del plan','Ejemplo público gratuito','Ejemplo público gratuito','Gratis · MIT','Gratis · MIT','39 USD, pago único · consumo externo aparte','79 USD, pago único · consumo externo aparte'],
   social:lang==='en'?['Free native tool','Free plan · paid options','Free plan · paid options','Free plan · paid options','Trial · paid plans','Trial · paid plans','Trial · paid plans']:['Herramienta nativa gratuita','Plan gratuito · opciones de pago','Plan gratuito · opciones de pago','Plan gratuito · opciones de pago','Prueba temporal · planes de pago','Prueba temporal · planes de pago','Prueba temporal · planes de pago'],
 };
 const sectionLines=body.split('\n');
 let feature=false; const formatted=[];
 for(const line of sectionLines) {
   if(/^## /.test(line)) {
     if(feature){formatted.push('</details>','');feature=false;}
     const item=line.match(/^## (\d+)\. ([^:]+): (.+)$/);
     if(item){const [,number,name,fit]=item;formatted.push(`<details class="guide-feature">\n<summary><span class="guide-feature__number" aria-hidden="true">${number.padStart(2,'0')}</span><span class="guide-feature__label"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(fit)}</span><small>${escapeHtml(access[d.kind][Number(number)-1])}</small></span><span class="guide-feature__toggle" aria-hidden="true">+</span></summary>`,'');feature=true;}
   }
   formatted.push(line);
 }
 if(feature)formatted.push('','</details>');
 body=formatted.join('\n');
 // The diagram sits within the explanatory section, with the narrative text
 // retaining the complete equivalent.
 const diagramMarker=lang==='en'?'**The workflow:**':'**El flujo:**';
 const markerAt=body.indexOf(diagramMarker);
 const endLine=body.indexOf('\n',markerAt);
 if(markerAt<0)throw new Error(`Missing diagram insertion point: ${d.slug}/${lang}`);
 body=body.slice(0,endLine)+ '\n'+figure(d.kind,lang,'case')+body.slice(endLine);
 body=body.replace(/^\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|(?:\n|$))+/gm,table=>{
   const pricing=/Herramienta|Opción|Tool|Option/.test(table.split('\n')[0]);
   const label=lang==='en'?(pricing?'Compare options, free limits and costs':'Open the detailed decision table'):(pricing?'Comparar opciones, límites gratuitos y costes':'Abrir la tabla de decisión completa');
   return `<details class="guide-table-detail">\n<summary>${label}</summary>\n\n${table.trim()}\n\n</details>\n`;
 });
 body=body.replace(/(## (?:Preguntas frecuentes|Frequently asked questions)\n)([\s\S]*?)(?=\n## )/,(_,heading,answers)=>`${heading}\n<details class="guide-deep-dive">\n<summary>${lang==='en'?'Read the practical answers':'Leer las respuestas prácticas'}</summary>\n\n${answers.trim()}\n\n</details>\n`);
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
