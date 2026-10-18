/** English leads at /; Spanish URLs stay stable. Only published pairs get hreflang. */
export type Locale = 'en' | 'es';
export const routePairs: Record<string, string> = {
  '/': '/es/',
  '/services/': '/servicios/',
  '/services/customer-support/': '/servicios/automatizacion-atencion-cliente/',
  '/services/sales/': '/servicios/automatizacion-ventas/',
  '/services/operations/': '/servicios/automatizacion-procesos/',
  '/pricing/': '/precios-automatizacion-ia/',
  '/how-we-work/': '/como-trabajamos/',
  '/editorial-methodology/': '/metodologia/',
  '/updates/': '/newsletter/',
  '/prompt-builder/': '/generador-de-prompts/',
  '/assessment/thanks/': '/gracias-diagnostico/',
  '/assessment/': '/diagnostico-automatizacion-ia/',
  '/tools/': '/herramientas/',
  '/courses/': '/cursos/',
  '/resources/': '/recursos/',
  '/guides/': '/guias/',
  '/research/': '/estudios/',
  '/news/': '/noticias/',
  '/prompts/': '/prompts/',
  '/privacy/': '/privacidad/',
  '/cookie-policy/': '/cookies/',
  '/legal/': '/aviso-legal/',
};
export const normalizePath = (path: string) => path === '/' ? '/' : `${path.replace(/\/$/, '')}/`;
// /prompts/ is an established Spanish route; English lives at /prompt-library/.
delete routePairs['/prompts/'];
routePairs['/prompt-library/'] = '/prompts/';
export function localeFor(path: string): Locale {
  path = normalizePath(path);
  return path.startsWith('/404') || Object.hasOwn(routePairs, path) || /^\/(tools|courses|guides|research|news|resources|prompt-library)\//.test(path) ? 'en' : 'es';
}
export function alternatePath(path: string): string | undefined {
  path = normalizePath(path);
  const exact = routePairs[path] ?? Object.entries(routePairs).find(([,es]) => es === path)?.[0];
  if (exact) return exact;
  const prefixes: [string,string][] = [['/tools/category/','/herramientas/'],['/tools/','/herramienta/'],['/courses/category/','/cursos/'],['/courses/','/curso/'],['/guides/','/guias/'],['/research/','/estudios/'],['/news/','/noticias/'],['/resources/category/','/recursos/'],['/resources/','/recurso/'],['/prompt-library/','/prompts/']];
  for (const [en,es] of prefixes) {
    if(path.startsWith(en) && path!==en) return path.replace(en,es);
    if(path.startsWith(es) && path!==es) return path.replace(es,en);
  }
  return undefined;
}
export function englishPath(path: string): string {
  if (!path.startsWith('/')) return path;
  const position = path.search(/[?#]/);
  const pathname = position < 0 ? path : path.slice(0, position);
  const suffix = position < 0 ? '' : path.slice(position);
  return (localeFor(pathname) === 'es' ? alternatePath(pathname) ?? pathname : pathname) + suffix;
}
