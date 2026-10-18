import {describe,it,expect} from 'vitest';
import {services} from '../src/i18n/services';
import {servicesES} from '../src/i18n/services-es';
import {alternatePath} from '../src/i18n/routes';
import {assessmentHref} from '../src/i18n/parity';
describe('bilingual services hub',()=>{
 it('presents the same three service lines and attribution',()=>{expect(services).toHaveLength(3);expect(servicesES.map(s=>[s.slug,s.service,s.cluster])).toEqual(services.map(s=>[s.slug,s.service,s.cluster]));});
 it('links every service to its existing Spanish counterpart',()=>{for(const s of services)expect(alternatePath(`/services/${s.slug}/`)).toBe(`/servicios/${s.es}/`);});
 it('keeps hero and closing assessment context in both languages',()=>{for(const locale of ['en','es'] as const)for(const placement of ['hero','final_cta']){const url=new URL(assessmentHref(locale,placement),'https://agentesva.com');expect(url.searchParams.get('placement')).toBe(placement);expect(url.pathname).toBe(locale==='en'?'/assessment/':'/diagnostico-automatizacion-ia/');}});
});
