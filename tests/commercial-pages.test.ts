import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {OFFER_AMOUNTS,offerPrice} from '../src/data/service-offer';
import {assessmentHref} from '../src/i18n/parity';
const read=(p:string)=>readFileSync(p,'utf8');
describe('shared pricing and process',()=>{
 it('offers five consistent entry points without losing pricing intent',()=>{expect(Object.keys(OFFER_AMOUNTS)).toEqual(['diagnostic','workshop','scoped','integrated','support']);for(const locale of ['en','es'] as const)for(const offer of Object.keys(OFFER_AMOUNTS)){const url=new URL(assessmentHref(locale,'pricing_option','general_consulting',offer),'https://agentesva.com');expect(url.searchParams.get('offer')).toBe(offer);expect(offerPrice(offer as keyof typeof OFFER_AMOUNTS,locale)).toBeTruthy();}});
 it('defines the same six phases, owners and outputs in both languages',()=>{const timeline=read('src/components/shared/ProcessTimeline.astro');for(const word of ['Understand','Entender','Design','Diseñar','Build','Construir','Test','Probar','Hand over','Entregar','Improve','Mejorar','Owner & deliverable','Responsable y entregable'])expect(timeline).toContain(word);});
 it('preserves commercial schema and shared CTA contracts',()=>{const schema=read('src/components/shared/PageSchema.astro');expect(schema).toContain("'@type':'FAQPage'");expect(schema).toContain("'@type':'BreadcrumbList'");expect(read('src/components/english/ServicePage.astro')).toContain('<PageSchema');expect(read('src/components/shared/AssessmentCTA.astro')).toContain('data-track-service={service}');});
});
