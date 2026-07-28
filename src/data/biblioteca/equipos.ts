import type { Equipo } from './index';

// "Equipos de IA": bundles de pago. Uno por cada grupo de los catálogos B (software) y C (growth).
// compraUrl = Stripe Payment Link real (modo live), creado vía API (Fase 4).
export const EQUIPOS: Equipo[] = [
  { id: 'eq-sw-auditoria', nombre: 'Equipo de Auditoría de Software', desc: 'Entiende y radiografía tu software.', catalogo: 'software', grupo: 'Auditoría de tu software', precio: 3.99, compraUrl: 'https://buy.stripe.com/cNi00jgtc4jdfIWeKufnO1F' },
  { id: 'eq-sw-mantenimiento', nombre: 'Equipo de Mantenimiento de Código', desc: 'Limpia y moderniza tu código.', catalogo: 'software', grupo: 'Mantenimiento del código', precio: 3.99, compraUrl: 'https://buy.stripe.com/eVqfZh4Ku1717cq9qafnO1G' },
  { id: 'eq-sw-qa', nombre: 'Equipo de Calidad (QA)', desc: 'Encuentra y previene errores.', catalogo: 'software', grupo: 'Calidad y pruebas', precio: 3.99, compraUrl: 'https://buy.stripe.com/8x28wP7WGg1V8gudGqfnO1H' },
  { id: 'eq-sw-devops', nombre: 'Equipo de DevOps y Seguridad', desc: 'Entregas seguras y automatizadas.', catalogo: 'software', grupo: 'Operaciones y seguridad', precio: 3.99, compraUrl: 'https://buy.stripe.com/5kQaEX0ue02X40eeKufnO1I' },
  { id: 'eq-gr-seo', nombre: 'Equipo de SEO', desc: 'Sal más arriba en Google.', catalogo: 'growth', grupo: 'SEO', precio: 3.99, compraUrl: 'https://buy.stripe.com/7sYdR9dh0g1V8gu9qafnO1J' },
  { id: 'eq-gr-geo', nombre: 'Equipo de Visibilidad en IA', desc: 'Aparece en ChatGPT y buscadores con IA.', catalogo: 'growth', grupo: 'Visibilidad en IA', precio: 3.99, compraUrl: 'https://buy.stripe.com/dRm9ATgtc3f90O26dYfnO1K' },
  { id: 'eq-gr-competencia', nombre: 'Equipo de Inteligencia Competitiva', desc: 'Vigila a tu competencia.', catalogo: 'growth', grupo: 'Inteligencia competitiva', precio: 3.99, compraUrl: 'https://buy.stripe.com/eVq4gza4O6rl54i8m6fnO1L' },
  { id: 'eq-gr-ads', nombre: 'Equipo de Publicidad y Conversión', desc: 'Saca más de tu publicidad.', catalogo: 'growth', grupo: 'Publicidad y conversión', precio: 3.99, compraUrl: 'https://buy.stripe.com/9B65kD2Cm6rlbsG1XIfnO1M' },
  { id: 'eq-gr-social', nombre: 'Equipo de Redes Sociales', desc: 'Contenido y distribución en redes.', catalogo: 'growth', grupo: 'Redes sociales', precio: 3.99, compraUrl: 'https://buy.stripe.com/cNi4gzgtc3f968m45QfnO1N' },
  { id: 'eq-gr-ux', nombre: 'Equipo de Diseño y Experiencia', desc: 'Mejora el diseño y la experiencia de usuario.', catalogo: 'growth', grupo: 'Diseño y experiencia', precio: 3.99, compraUrl: 'https://buy.stripe.com/00wbJ1gtc8ztgN08m6fnO1O' },
];
