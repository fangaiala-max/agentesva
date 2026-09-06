import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {alternatePath,englishPath,localeFor,routePairs} from '../src/i18n/routes';
import {diagnosticCopy} from '../src/i18n/diagnostic-copy';
import {classifyDiagnostic} from '../src/data/diagnostico';
import {initCatalog} from '../src/scripts/catalog';
import tools from '../src/i18n/tools.json';
import courses from '../src/i18n/courses.json';
import editorial from '../src/i18n/editorial.json';
afterEach(()=>{document.documentElement.lang='es';document.body.innerHTML='';vi.restoreAllMocks();});
describe('English-first routes and content',()=>{
 it('makes English primary and keeps Spanish home and indexed internal URLs',()=>{
  expect(localeFor('/')).toBe('en');expect(localeFor('/es/')).toBe('es');expect(alternatePath('/')).toBe('/es/');
  for(const [en,es] of Object.entries(routePairs)){expect(localeFor(en)).toBe('en');expect(localeFor(es)).toBe('es');expect(alternatePath(en)).toBe(es);expect(alternatePath(es)).toBe(en);}
 });
 it.each([['/tools/chatgpt/','/herramienta/chatgpt/'],['/tools/category/asistentes/','/herramientas/asistentes/'],['/courses/ai-for-everyone/','/curso/ai-for-everyone/'],['/courses/category/fundamentos/','/cursos/fundamentos/'],['/guides/seo-para-ia/','/guias/seo-para-ia/'],['/prompt-library/marketing/','/prompts/marketing/']])('round trips %s to its real Spanish equivalent', (en,es)=>{expect(alternatePath(en)).toBe(es);expect(alternatePath(es)).toBe(en);});
 it('preserves query strings, fragments, and external destinations when localizing links',()=>{
  expect(englishPath('/precios-automatizacion-ia/?source=assessment#compare')).toBe('/pricing/?source=assessment#compare');
  expect(englishPath('/guias/seo-para-ia/')).toBe('/guides/seo-para-ia/');expect(englishPath('mailto:hola@agentesva.com')).toBe('mailto:hola@agentesva.com');
 });
 it('has English content for every current tool, course and editorial item',()=>{
  const ids=(dir:string,ext:string)=>readdirSync(dir).filter(f=>f.endsWith(ext)).map(f=>f.replace(ext,''));
  expect(Object.keys(tools).sort()).toEqual(ids('src/content/tools','.json').sort());
  expect(Object.keys(courses).sort()).toEqual(ids('src/content/cursos','.json').sort());
  for(const [en,es] of [['guides','guias'],['research','estudios'],['news','noticias']])for(const id of ids(`src/content/${es}`,'.md'))expect(editorial).toHaveProperty(`${en}/${id}`);
 });
 it('keeps the English assessment output localized without changing classification',()=>{
  const answers={businessType:'Agency',teamSize:'2_5',goal:'sales',process:'Copy new form submissions to our CRM',frequency:'daily',currentTools:'some',budget:'1500_3000',timeline:'one_month',risk:'standard'} as const;
  const result=classifyDiagnostic(answers);document.documentElement.lang='en';
  expect(result.resultType).toBe('qualified_call');expect(diagnosticCopy(result.priority)).toBe('High');
  for(const line of [...result.reasons,...result.opportunities,result.nextStep.label])expect(diagnosticCopy(line)).not.toBe(line);
  document.documentElement.lang='es';expect(diagnosticCopy(result.priority)).toBe('Alta');
 });
 it('retains the Spanish homepage source and tracks all three English assessment CTAs',()=>{
  const en=readFileSync('src/pages/index.astro','utf8'),es=readFileSync('src/components/SpanishHome.astro','utf8');
  expect(es).toContain('Diseñamos la tecnología');
  const links=(en.match(/<a\b[^>]*>/g)??[]).filter(a=>a.includes('href="/assessment/"')&&a.includes('{...tracking}'));
  expect(links).toHaveLength(3);expect(links.map(a=>a.match(/data-track-placement="([^"]+)"/)?.[1])).toEqual(['hero','mid_page','sticky']);
 });
});
it('combines catalog text and category filters and recovers from no results',()=>{
 document.body.innerHTML='<section data-catalog><input data-catalog-search><select data-catalog-filter><option value="">All</option><option>Writing</option><option>Automation</option></select><p data-catalog-count></p><a data-catalog-item data-category="Writing">Claude documents</a><a data-catalog-item data-category="Automation">Make workflows</a><div data-catalog-empty hidden><button data-catalog-reset>Reset</button></div></section>';
 initCatalog();initCatalog();
 const input=document.querySelector('input')!;input.value='nothing';input.dispatchEvent(new Event('input'));
 expect(document.querySelector<HTMLElement>('[data-catalog-empty]')!.hidden).toBe(false);
 document.querySelector<HTMLButtonElement>('button')!.click();expect(document.querySelector('[data-catalog-count]')!.textContent).toBe('2 results');
 const select=document.querySelector('select')!;select.value='Writing';select.dispatchEvent(new Event('change'));expect(document.querySelector('[data-catalog-count]')!.textContent).toBe('1 result');
 input.value='Make';input.dispatchEvent(new Event('input'));expect(document.querySelector('[data-catalog-count]')!.textContent).toBe('0 results');
});
