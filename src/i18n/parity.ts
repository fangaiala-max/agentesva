import copy from './parity-ui.json';
import {alternatePath, localeFor, type Locale} from './routes';
export function ui(locale:Locale, text:string):string {return locale==='es'?(copy as Record<string,string>)[text]??text:text;}
export function localizedPath(locale:Locale, url:string):string {
 if(!url.startsWith('/')||url.startsWith('//'))return url;
 const split=url.search(/[?#]/);const path=split<0?url:url.slice(0,split);const suffix=split<0?'':url.slice(split);
 return (localeFor(path)===locale?path:alternatePath(path)??path)+suffix;
}
export function assessmentHref(locale:Locale, placement:string, service='general_consulting',offer?:string){
 const query=new URLSearchParams({placement,service});if(offer)query.set('offer',offer);
 return `${locale==='en'?'/assessment/':'/diagnostico-automatizacion-ia/'}?${query}`;
}
