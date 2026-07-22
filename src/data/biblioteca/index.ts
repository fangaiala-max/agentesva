// Motor de datos de la "Biblioteca de IA" (freemium).
// - Catálogo A (prompts): gratis, copiable.
// - Catálogos B (software) y C (growth): teaser gratis (beneficio+alcance) + blueprint de pago.
// Los DATOS de cada catálogo viven en prompts.ts / software.ts / growth.ts; los equipos (bundles) en equipos.ts.

export type CatalogoId = 'prompts' | 'software' | 'growth';

export interface Catalogo {
  id: CatalogoId;
  nombre: string;
  desc: string;
  grupos: string[];
  gratis: boolean;
}

// Contenido de pago de un blueprint (no se renderiza en la web gratis).
export interface Blueprint {
  quePuedeHacer: string;
  modo: string;
  pasos: string[];
  reglas: string[];
  prompt: string;
}

export interface Item {
  id: string;
  catalogo: CatalogoId;
  grupo: string;
  tema?: string; // subtema dentro del grupo (p. ej. "Marketing" dentro de "Por industria"); evita la "wall of cards"
  titulo: string;
  cuerpo?: string; // A: prompt completo copiable
  beneficio?: string; // B/C: teaser — qué ganas
  alcance?: string; // B/C: teaser — hasta dónde llega
  blueprint?: Blueprint; // B/C: contenido de pago
  precio?: number; // B/C: € suelto
}

// Bundle de pago: un "equipo de IA" = un grupo de B/C empaquetado.
export interface Equipo {
  id: string;
  nombre: string;
  desc: string;
  catalogo: CatalogoId;
  grupo: string;
  precio: number;
  compraUrl?: string; // Stripe Payment Link (se cablea después)
}

import { PROMPTS } from './prompts';
import { SOFTWARE } from './software';
import { GROWTH } from './growth';
import { EQUIPOS as EQ } from './equipos';

export const CATALOGOS: Catalogo[] = [
  {
    id: 'prompts',
    nombre: 'Prompts de IA para tu negocio',
    desc: '100 prompts listos para copiar y pegar.',
    grupos: ['Por industria', 'Por resultados', 'Mejores casos de uso', 'Por objetivos'],
    gratis: true,
  },
  {
    id: 'software',
    nombre: 'IA en tu software',
    desc: 'Lo que la IA puede hacer con tu producto y tu código.',
    grupos: ['Auditoría de tu software', 'Mantenimiento del código', 'Calidad y pruebas', 'Operaciones y seguridad'],
    gratis: false,
  },
  {
    id: 'growth',
    nombre: 'Growth con IA',
    desc: 'Automatizaciones de marketing y crecimiento.',
    grupos: ['SEO', 'Visibilidad en IA', 'Inteligencia competitiva', 'Publicidad y conversión', 'Redes sociales', 'Diseño y experiencia'],
    gratis: false,
  },
];

export const EQUIPOS: Equipo[] = EQ;
export const ITEMS: Item[] = [...PROMPTS, ...SOFTWARE, ...GROWTH];

function catalogo(id: CatalogoId): Catalogo {
  const c = CATALOGOS.find((x) => x.id === id);
  if (!c) throw new Error(`Catálogo desconocido: ${id}`);
  return c;
}

export function itemsDeCatalogo(id: CatalogoId): Item[] {
  return ITEMS.filter((i) => i.catalogo === id);
}

export function gruposDeCatalogo(id: CatalogoId): string[] {
  return catalogo(id).grupos;
}

export function itemsDeGrupo(cat: CatalogoId, grupo: string): Item[] {
  return ITEMS.filter((i) => i.catalogo === cat && i.grupo === grupo);
}

// Subtemas de un grupo, en orden de primera aparición (p. ej. Marketing, Ventas... dentro de "Por industria").
// Devuelve [] si los items de ese grupo no usan `tema` (aún no autorado, p. ej. catálogos B/C).
export function temasDeGrupo(cat: CatalogoId, grupo: string): string[] {
  const temas: string[] = [];
  for (const it of itemsDeGrupo(cat, grupo)) {
    if (it.tema && !temas.includes(it.tema)) temas.push(it.tema);
  }
  return temas;
}

export function itemsDeTema(cat: CatalogoId, grupo: string, tema: string): Item[] {
  return itemsDeGrupo(cat, grupo).filter((i) => i.tema === tema);
}

export function equipoDeGrupo(cat: CatalogoId, grupo: string): Equipo | undefined {
  return EQUIPOS.find((e) => e.catalogo === cat && e.grupo === grupo);
}
