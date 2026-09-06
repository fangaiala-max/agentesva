import {ui,localizedPath} from '../i18n/parity';
/** Astro adaptation of 21st.dev Expanding Cards (5526), Animated Tabs (1115), Comparison Table (7469). */
export function initToolShowcase() {
  const locale=document.documentElement.lang==='es'?'es':'en';
  const tr=(s:string)=>ui(locale,s);
  document.querySelectorAll<HTMLElement>('[data-featured-deck]').forEach(deck=>{
    if(deck.dataset.wired)return;deck.dataset.wired='1';
    const cards=[...deck.querySelectorAll<HTMLElement>('.featured-tool')];
    const activate=(card:HTMLElement)=>cards.forEach(c=>{const active=c===card;c.dataset.active=String(active);c.querySelector('button')?.setAttribute('aria-expanded',String(active));const content=c.querySelector<HTMLElement>('.feature-content');if(content)content.hidden=!active;});
    cards.forEach(card=>card.querySelector('button')?.addEventListener('click',()=>activate(card)));
    if(cards[0])activate(cards[0]);
  });
  document.querySelectorAll<HTMLElement>('[data-profile-tabs]').forEach(root=>{
    if(root.dataset.wired)return;root.dataset.wired='1';
    const tabs=[...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    const activate=(tab:HTMLButtonElement)=>{tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls')||'');if(panel)panel.hidden=!active;});};
    tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();activate(tabs[n]);tabs[n].focus();});});
    if(tabs[0])activate(tabs[0]);
  });
  document.querySelectorAll<HTMLElement>('[data-tool-showcase]').forEach(root=>{
    if(root.dataset.compareWired)return;root.dataset.compareWired='1';
    type Tool={id:string;name:string;category:string;description:string;features:string[];steps:string[]};
    const data:Tool[]=JSON.parse(root.querySelector('[data-comparison-data]')?.textContent||'[]');
    const selected=new Set<string>();const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-compare]')];
    const tray=root.querySelector<HTMLElement>('[data-compare-tray]')!;
    const status=root.querySelector<HTMLElement>('[data-compare-status]')!;
    const open=root.querySelector<HTMLButtonElement>('[data-open-compare]')!;
    const dialog=root.querySelector<HTMLDialogElement>('[data-compare-dialog]')!;
    const update=()=>{tray.hidden=selected.size===0;open.disabled=selected.size!==2;status.textContent=[...selected].map(id=>data.find(t=>t.id===id)?.name).join(' + ')+(selected.size===1?(locale==='en'?' — choose one more':' — elige otra herramienta'):(locale==='en'?' — ready to compare':' — listas para comparar'));buttons.forEach(b=>{const active=selected.has(b.dataset.compare!);b.setAttribute('aria-pressed',String(active));b.textContent=active?tr('Remove −'):tr('Compare +');b.disabled=!active&&selected.size===2;});};
    buttons.forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.compare!;if(selected.has(id))selected.delete(id);else if(selected.size<2)selected.add(id);update();}));
    root.querySelector('[data-clear-compare]')?.addEventListener('click',()=>{selected.clear();update();buttons[0]?.focus();});
    open.addEventListener('click',()=>{const tools=data.filter(t=>selected.has(t.id));if(tools.length!==2)return;
      const table=root.querySelector<HTMLTableElement>('[data-comparison-table]')!;table.replaceChildren();
      const head=table.createTHead().insertRow();[tr('What matters'),...tools.map(t=>t.name)].forEach(name=>{const th=document.createElement('th');th.scope='col';th.textContent=name;head.append(th);});
      const body=table.createTBody();const rows:[string,(t:Tool)=>string][]=[[tr('Category'),t=>t.category],[tr('Useful for'),t=>t.description],[tr('Capabilities'),t=>t.features.join(' • ')],[tr('First step'),t=>t.steps[0]]];
      rows.forEach(([label,get])=>{const row=body.insertRow();const th=document.createElement('th');th.scope='row';th.textContent=label;row.append(th);tools.forEach(t=>row.insertCell().textContent=get(t));});
      const row=body.insertRow();const th=document.createElement('th');th.scope='row';th.textContent=tr('Explore');row.append(th);tools.forEach(t=>{const a=document.createElement('a');a.href=localizedPath(locale,`/tools/${t.id}/`);a.textContent=`${locale==='en'?'View':'Ver'} ${t.name}`;row.insertCell().append(a);});dialog.showModal();
    });
    root.querySelector('[data-close-compare]')?.addEventListener('click',()=>dialog.close());
  });
}
