import { getCollection } from 'astro:content';
import editorial from './editorial.json';
import courseCopy from './courses.json';
export const catalogSections = ['courses','resources','guides','research','news'] as const;
export type Section = typeof catalogSections[number];
export interface CatalogItem { id:string; title:string; description:string; category:string; original:string; body?:string; points?:string[]; href?:string; action?:string; language?:string; date?:string; sources?:{label:string;href:string}[]; overview?:boolean; }
export const sectionCopy:Record<Section,{title:string;headline:string;description:string}> = {
 courses:{title:'AI courses',headline:'Learn something you can put to work.',description:'Explore practical courses for decision-makers, creators, and developers. Check the teaching language and provider before enrolling.'},
 resources:{title:'Resources',headline:'A useful place to start.',description:'Practical templates, prompts, and learning materials. Resource languages and access conditions are shown before you continue.'},
 guides:{title:'Practical guides',headline:'Understand the next step.',description:'English overviews of our practical guides, with the complete Spanish editions available alongside them.'},
 research:{title:'Research & comparisons',headline:'Compare with a purpose.',description:'English overviews of our tool comparisons and practical research. Follow the original editions for detailed tables and sources.'},
 news:{title:'AI news',headline:'What it means for your work.',description:'English overviews of our reporting archive. Each overview links to its original edition and reporting sources.'},
};
export const categoryLabels:Record<string,string> = {'Fundamentos de IA':'AI foundations','IA para tu negocio':'AI for business','Prompts y chatbots':'Prompts','Prompt engineering':'Prompt engineering','Imagen generativa':'Image generation','Imagen y generativa':'Image generation','Prompts e ingeniería de prompts':'Prompt engineering','Desarrollo con IA':'AI development','Automatización y agentes':'Automation and agents','Productividad':'Productivity','Atención al cliente':'Customer support','Desarrollo IA':'AI development','Contenido':'Content','Ventas y marketing':'Sales and marketing'};
export async function getCatalog(section:Section):Promise<CatalogItem[]> {
 if(section==='courses') return (await getCollection('cursos')).sort((a,b)=>a.data.orden-b.data.orden).map(c=>{
  const copy=courseCopy[c.id as keyof typeof courseCopy];return {id:c.id,...copy,category:categoryLabels[c.data.categoria]??'AI learning',original:`/curso/${c.id}/`,href:c.data.officialUrl,action:'Visit the course provider'};
 });
 if(section==='resources') {
 const copy:Record<string,{title:string;description:string;body:string;href?:string;action:string}>={
  'biblioteca-ia':{title:'The AI library',description:'A Spanish-language library of 100 free prompts and 200 workflow blueprints.',body:'Browse practical prompts for marketing, sales, people operations, finance, and other business tasks. The Spanish library also includes paid blueprints grouped by team. Check each listing for scope and access conditions.',href:'/recurso/biblioteca-ia/',action:'Open the Spanish library'},
  'curso-seguridad-llm':{title:'LLM security mini-course',description:'A practical Spanish-language course on prompt injection and layered defenses.',body:'Work through a RAG application lab and explore design boundaries, guardrails, and regression evaluations. Includes Python examples, with local execution or a compatible API.',href:'/courses/seguridad-llm/',action:'Explore the course'},
  'pack-30-prompts':{title:'30 business prompts',description:'A Spanish-language PDF of prompts for everyday business tasks.',body:'Adapt prompts for emails, meeting summaries, social posts, and customer replies. The pack is delivered with the Spanish newsletter subscription. Review the subscription form and confirm by email.',href:'/recurso/pack-30-prompts/',action:'Get the Spanish prompt pack'},
  'skill-atencion-cliente':{title:'Customer support skill for Claude',description:'A Spanish-language skill for drafting replies in your business’s voice.',body:'Provide a customer message and a short tone guide to prepare concise and detailed replies. Includes channel templates and worked examples, with missing facts left as placeholders for a person to complete. It is delivered through the Spanish newsletter subscription.',href:'/recurso/skill-atencion-cliente/',action:'Get the Spanish support skill'},
 };
 return (await getCollection('recursos')).sort((a,b)=>a.data.orden-b.data.orden).map(r=>({id:r.id,...copy[r.id],category:categoryLabels[r.data.categoria]??'Resources',original:`/recurso/${r.id}/`,language:'Spanish'}));
 }
 const collection={guides:'guias',research:'estudios',news:'noticias'}[section] as 'guias'|'estudios'|'noticias';
 const entries=await getCollection(collection);
 return entries.map(entry=>{
  const key=`${section}/${entry.id}` as keyof typeof editorial;
  const copy=editorial[key];
  const data=entry.data as {fecha:Date;fuentes?:{titulo:string;url:string}[];fuente?:{nombre:string;url:string}};
  return {id:entry.id,...copy,category:sectionCopy[section].title,original:`/${collection}/${entry.id}/`,date:data.fecha.toISOString().slice(0,10),overview:true,sources:data.fuentes?.map(s=>({label:s.titulo,href:s.url}))??(data.fuente?[{label:data.fuente.nombre,href:data.fuente.url}]:[])};
 });
}
export async function getCategories(section:Section){
 const collection=section==='courses'?'cursosCategorias':section==='resources'?'recursosCategorias':undefined;
 if(!collection)return [];
 return (await getCollection(collection)).map(c=>({id:c.id,name:categoryLabels[c.data.nombre]??'AI resources',original:c.data.nombre}));
}
