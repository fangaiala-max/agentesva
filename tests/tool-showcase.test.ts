// @vitest-environment happy-dom
import {beforeEach,expect,it} from 'vitest';
import {initToolShowcase} from '../src/scripts/tool-showcase';
beforeEach(()=>{document.body.innerHTML='';});
it('keeps one featured panel open and does not duplicate initialization',()=>{
 document.body.innerHTML='<div data-featured-deck>'+['a','b'].map(id=>`<article class="featured-tool"><button data-feature-toggle aria-controls="${id}">Open</button><div class="feature-content" id="${id}">Content</div></article>`).join('')+'</div>';
 initToolShowcase();initToolShowcase();
 (document.querySelectorAll('button')[1] as HTMLButtonElement).click();
 expect(document.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
 expect((document.querySelector('#a') as HTMLElement).hidden).toBe(true);
 expect((document.querySelector('#b') as HTMLElement).hidden).toBe(false);
});
it('supports arrow-key navigation and a single active profile tab',()=>{
 document.body.innerHTML='<div data-profile-tabs>'+['a','b','c'].map(id=>`<button role="tab" aria-controls="${id}">${id}</button><div id="${id}">Panel</div>`).join('')+'</div>';
 initToolShowcase();const buttons=document.querySelectorAll('button');
 buttons[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
 expect(buttons[2].getAttribute('aria-selected')).toBe('true');
 expect(buttons[0].tabIndex).toBe(-1);
 expect((document.querySelector('#c') as HTMLElement).hidden).toBe(false);
});
it('requires two selections, preserves selections and allows removing at capacity',()=>{
 document.body.innerHTML=`<section data-tool-showcase>${['a','b','c'].map(id=>`<button data-compare="${id}">Compare</button>`).join('')}<div data-compare-tray hidden><p data-compare-status></p><button data-open-compare disabled>Open</button><button data-clear-compare>Clear</button></div><dialog data-compare-dialog><button data-close-compare>Close</button><table data-comparison-table></table></dialog><script type="application/json" data-comparison-data>${JSON.stringify(['a','b','c'].map(id=>({id,name:id,category:'Test',description:'Task',features:['Feature'],steps:['Start']})))}</script></section>`;
 initToolShowcase();const buttons=document.querySelectorAll<HTMLButtonElement>('[data-compare]');const open=document.querySelector<HTMLButtonElement>('[data-open-compare]')!;
 buttons[0].click();expect(open.disabled).toBe(true);buttons[1].click();expect(open.disabled).toBe(false);expect(buttons[2].disabled).toBe(true);expect(buttons[0].disabled).toBe(false);
 buttons[0].click();expect(buttons[2].disabled).toBe(false);expect(open.disabled).toBe(true);
 document.querySelector<HTMLButtonElement>('[data-clear-compare]')!.click();expect(document.querySelector<HTMLElement>('[data-compare-tray]')!.hidden).toBe(true);
});
