import type { Item } from './index';

// Catálogo A — "Prompts de IA para tu negocio" (100 prompts, gratis, copiables).
// Semilla de 1 ítem; los 100 se autoran en la Fase 1 (Task 3).
export const PROMPTS: Item[] = [
  {
    id: 'p01',
    catalogo: 'prompts',
    grupo: 'Por industria',
    titulo: 'Texto de ventas con la fórmula PAS',
    cuerpo: `Rol: Copywriter de respuesta directa con experiencia en psicología del consumidor.
Contexto: Vendo [producto/servicio] a [audiencia]. Su dolor principal es [dolor] y su mayor deseo es [resultado deseado].
Tarea: Escribe un texto de ventas de ~300 palabras que agite ese dolor y presente mi producto como la solución evidente.
Restricciones: Tono cercano, sin tecnicismos; usa la fórmula PAS (Problema-Agitación-Solución); nada de promesas que no pueda cumplir.
Formato: Titular + 3 párrafos + 2 variantes de llamada a la acción.`,
  },
];
