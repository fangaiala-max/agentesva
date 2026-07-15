import type { Equipo } from './index';

// "Equipos de IA": bundles de pago. Uno por cada grupo de los catálogos B (software) y C (growth).
// El precio y el compraUrl (Stripe Payment Link) se ajustan al cablear el pago (Fase 4).
export const EQUIPOS: Equipo[] = [
  { id: 'eq-sw-auditoria', nombre: 'Equipo de Auditoría de Software', desc: 'Entiende y radiografía tu software.', catalogo: 'software', grupo: 'Auditoría de tu software', precio: 3.99 },
  { id: 'eq-sw-mantenimiento', nombre: 'Equipo de Mantenimiento de Código', desc: 'Limpia y moderniza tu código.', catalogo: 'software', grupo: 'Mantenimiento del código', precio: 3.99 },
  { id: 'eq-sw-qa', nombre: 'Equipo de Calidad (QA)', desc: 'Encuentra y previene errores.', catalogo: 'software', grupo: 'Calidad y pruebas', precio: 3.99 },
  { id: 'eq-sw-devops', nombre: 'Equipo de DevOps y Seguridad', desc: 'Entregas seguras y automatizadas.', catalogo: 'software', grupo: 'Operaciones y seguridad', precio: 3.99 },
  { id: 'eq-gr-seo', nombre: 'Equipo de SEO', desc: 'Sal más arriba en Google.', catalogo: 'growth', grupo: 'SEO', precio: 3.99 },
  { id: 'eq-gr-geo', nombre: 'Equipo de Visibilidad en IA', desc: 'Aparece en ChatGPT y buscadores con IA.', catalogo: 'growth', grupo: 'Visibilidad en IA', precio: 3.99 },
  { id: 'eq-gr-competencia', nombre: 'Equipo de Inteligencia Competitiva', desc: 'Vigila a tu competencia.', catalogo: 'growth', grupo: 'Inteligencia competitiva', precio: 3.99 },
  { id: 'eq-gr-ads', nombre: 'Equipo de Publicidad y Conversión', desc: 'Saca más de tu publicidad.', catalogo: 'growth', grupo: 'Publicidad y conversión', precio: 3.99 },
  { id: 'eq-gr-social', nombre: 'Equipo de Redes Sociales', desc: 'Contenido y distribución en redes.', catalogo: 'growth', grupo: 'Redes sociales', precio: 3.99 },
  { id: 'eq-gr-ux', nombre: 'Equipo de Diseño y Experiencia', desc: 'Mejora el diseño y la experiencia de usuario.', catalogo: 'growth', grupo: 'Diseño y experiencia', precio: 3.99 },
];
