export function initCatalog() {
  document.querySelectorAll<HTMLElement>('[data-catalog]').forEach(root=>{
    if(root.dataset.wired) return; root.dataset.wired='true';
    const search=root.querySelector<HTMLInputElement>('[data-catalog-search]');
    const filter=root.querySelector<HTMLSelectElement>('[data-catalog-filter]');
    const extras=[...root.querySelectorAll<HTMLSelectElement>('[data-catalog-extra]')];
    const items=[...root.querySelectorAll<HTMLElement>('[data-catalog-item]')];
    const count=root.querySelector<HTMLElement>('[data-catalog-count]');
    const empty=root.querySelector<HTMLElement>('[data-catalog-empty]');
    const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const update=()=>{
      const query=normalize(search?.value.trim()??'');let matches=0;
      items.forEach(item=>{item.hidden=!(normalize(item.textContent??'').includes(query)&&(!filter?.value||item.dataset.category===filter.value)&&extras.every(f=>!f.value||item.dataset[f.dataset.catalogExtra!]===f.value));if(!item.hidden)matches++;});
      if(count)count.textContent=`${matches} ${document.documentElement.lang==='es'?(matches===1?'resultado':'resultados'):(matches===1?'result':'results')}`;
      if(empty)empty.hidden=matches!==0;
    };
    search?.addEventListener('input',update);filter?.addEventListener('change',update);extras.forEach(f=>f.addEventListener('change',update));
    root.querySelector('[data-catalog-reset]')?.addEventListener('click',()=>{if(search)search.value='';if(filter)filter.value='';extras.forEach(f=>f.value='');update();search?.focus();});
  });
}
