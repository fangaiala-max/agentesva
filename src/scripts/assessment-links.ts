/** Preserve commercial context while keeping explicit language switches intact. */
export function initAssessmentLinks(){
 const locale=document.documentElement.lang==='es'?'es':'en';
 document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a=>{
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin||!['/assessment/','/diagnostico-automatizacion-ia/'].includes(url.pathname))return;
  if(a.hasAttribute('hreflang')||a.hasAttribute('lang')){
   if(['/assessment/','/diagnostico-automatizacion-ia/'].includes(location.pathname))a.href=url.pathname+location.search+url.hash;
   return;
  }
  if(!url.searchParams.has('placement'))url.searchParams.set('placement',a.dataset.trackPlacement||'contextual');
  if(!url.searchParams.has('service'))url.searchParams.set('service',a.dataset.trackService||'general_consulting');
  a.href=(locale==='en'?'/assessment/':'/diagnostico-automatizacion-ia/')+url.search+url.hash;
 });
}
