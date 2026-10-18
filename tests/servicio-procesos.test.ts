import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {services} from '../src/i18n/services';
import {servicesES} from '../src/i18n/services-es';
import {localizedPath,assessmentHref} from '../src/i18n/parity';
import {offerPrice} from '../src/data/service-offer';
const en=services.find(s=>s.slug==='operations')!,es=servicesES.find(s=>s.slug==='operations')!;
describe('automatizacion-procesos: bilingual commercial contract',()=>{
 it('keeps useful cases, deliverables and limits in both languages',()=>{for(const copy of [en,es]){expect(copy.examples).toHaveLength(4);expect(copy.deliverables).toHaveLength(6);expect(copy.limit.length).toBeGreaterThan(50);expect(copy.measure.length).toBeGreaterThan(30);}for(const term of ['documentos', 'datos', 'alertas'])expect(JSON.stringify(es).toLowerCase()).toContain(term.toLowerCase());});
 it('routes both languages to their stable service URL',()=>{expect(localizedPath('es','/services/operations/')).toBe('/servicios/automatizacion-procesos/');expect(readFileSync('src/pages/servicios/automatizacion-procesos.astro','utf8')).toContain('<ServicePage kind="operations"');});
 it('retains service attribution through the assessment URL',()=>{for(const locale of ['en','es'] as const){const url=new URL(assessmentHref(locale,'hero',en.service),'https://agentesva.com');expect(url.searchParams.get('service')).toBe('process_automation');expect(url.searchParams.get('placement')).toBe('hero');}expect(es.cluster).toBe('operations');expect(es.service).toBe(en.service);});
 it('uses consistent investment ranges in both locales',()=>{expect(offerPrice('scoped','en')).toBe('From €1,500');expect(offerPrice('scoped','es')).toBe('Desde 1.500 €');expect(offerPrice('integrated','es')).toBe('Desde 3.000 €');});
});
