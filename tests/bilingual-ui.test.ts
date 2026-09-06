import {afterEach,describe,it,expect} from 'vitest';
import {initAssessmentLinks} from '../src/scripts/assessment-links';
import {initCatalog} from '../src/scripts/catalog';
import {initToolDetail} from '../src/scripts/tool-detail';
afterEach(()=>{document.body.innerHTML='';document.documentElement.lang='es';localStorage.clear();window.history.replaceState({},'','/');});
describe('bilingual interactions',()=>{
 it('retains the chosen offer when changing assessment language',()=>{
  window.history.replaceState({},'','/assessment/?placement=pricing_option&service=sales_automation&offer=scoped');document.documentElement.lang='en';
  document.body.innerHTML='<a hreflang="es" href="/diagnostico-automatizacion-ia/">ES</a><a data-track-placement="header" href="/assessment/">Assess</a>';
  initAssessmentLinks();const a=document.querySelector('a')!;expect(a.pathname).toBe('/diagnostico-automatizacion-ia/');expect(a.search).toContain('offer=scoped');expect(a.search).toContain('service=sales_automation');expect(document.querySelectorAll('a')[1].search).toContain('placement=header');
 });
 it.each(['en','es'])('combines topic, category and level, then clears all filters (%s)',lang=>{
  document.documentElement.lang=lang;document.body.innerHTML='<section data-catalog><input data-catalog-search><select data-catalog-filter><option value="">All</option><option>AI</option></select><select data-catalog-extra="level"><option value="">All</option><option>Beginner</option></select><p data-catalog-count></p><article data-catalog-item data-category="AI" data-level="Beginner">Introduction</article><article data-catalog-item data-category="AI" data-level="Advanced">Lab</article><div data-catalog-empty hidden><button data-catalog-reset>Clear</button></div></section>';
  initCatalog();const level=document.querySelector<HTMLSelectElement>('[data-catalog-extra]')!;level.value='Beginner';level.dispatchEvent(new Event('change'));expect(document.querySelector('[data-catalog-count]')!.textContent).toBe(lang==='en'?'1 result':'1 resultado');
  const input=document.querySelector('input')!;input.value='Lab';input.dispatchEvent(new Event('input'));expect(document.querySelector<HTMLElement>('[data-catalog-empty]')!.hidden).toBe(false);document.querySelector('button')!.click();expect(level.value).toBe('');expect(document.querySelector('[data-catalog-count]')!.textContent).toBe(lang==='en'?'2 results':'2 resultados');
 });
 it('restores saved tools across languages without duplicate click listeners',()=>{
  localStorage.setItem('agentesva:saved','["claude"]');document.documentElement.lang='en';document.body.innerHTML='<button id="save-btn" data-slug="claude"><span id="save-label"></span></button>';initToolDetail();initToolDetail();expect(document.querySelector('#save-label')!.textContent).toBe('Saved ✓');document.querySelector('button')!.click();expect(JSON.parse(localStorage.getItem('agentesva:saved')!)).toEqual([]);
 });
});
