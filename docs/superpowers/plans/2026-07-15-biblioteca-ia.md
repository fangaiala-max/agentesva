# Biblioteca de IA (freemium + equipos) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar una biblioteca de IA freemium en `/recurso/biblioteca-ia`: 100 prompts gratis para copiar + 200 blueprints (teaser gratis, completo de pago) empaquetados como "equipos de IA".

**Architecture:** Motor genérico "biblioteca" = datos tipados (`src/data/biblioteca/`) + un componente Astro (`BibliotecaIA.astro`) + un script cliente (`biblioteca.ts`), enganchado en la ficha de recurso existente vía un flag `biblioteca` en el schema. Contenido en 3 catálogos (A prompts gratis, B software, C growth). Pago vía Stripe Payment Links (cableado diferido, botones placeholder).

**Tech Stack:** Astro 5, TypeScript, Vitest + happy-dom, content collections (Zod). Sistema de diseño "Futurista" (tokens en `src/styles/global.css`).

**Referencias de patrón:** filtros/chips → `src/scripts/directory.ts`; botón con estado → `src/scripts/tool-detail.ts`; ficha de recurso → `src/pages/recurso/[slug].astro`; recurso ejemplo → `src/content/recursos/pack-30-prompts.json`.

---

## FASE 1 — Motor + 100 prompts gratis (shippable)

### Task 1: Flag `biblioteca` en schema + tipo Recurso

**Files:**
- Modify: `src/content.config.ts` (bloque `recursos`, ~líneas 161-195)
- Modify: `src/data/recursos.ts` (interfaz `Recurso`)

- [ ] **Step 1: Añadir el campo al schema.** En `src/content.config.ts`, dentro del `z.object({...})` de `recursos`, tras `faq: ...optional(),` añadir:

```ts
      biblioteca: z.boolean().default(false),
```

- [ ] **Step 2: Relajar el superRefine.** Reemplazar la regla de "Gratis":

```ts
      if (d.precio === 'Gratis' && !d.downloadUrl && !d.gated && !d.biblioteca) {
        ctx.addIssue({ code: 'custom', message: 'Un recurso gratis requiere downloadUrl, gated:true o biblioteca:true.', path: ['downloadUrl'] });
      }
```

- [ ] **Step 3: Añadir al tipo.** En `src/data/recursos.ts`, en la interfaz `Recurso`, tras `faq?: ...;` añadir:

```ts
  biblioteca?: boolean;
```

- [ ] **Step 4: Verificar que compila.** Run: `npx astro check` → Expected: sin errores nuevos de tipos en estos archivos (puede haber avisos previos no relacionados).

- [ ] **Step 5: Commit.**
```bash
git add src/content.config.ts src/data/recursos.ts
git commit -m "feat(recursos): flag biblioteca para recursos navegables gratis"
```

---

### Task 2: Módulo de datos — tipos, catálogos, equipos, helpers (TDD)

**Files:**
- Create: `src/data/biblioteca/index.ts`
- Create: `src/data/biblioteca/prompts.ts` (stub inicial: 1 grupo de ejemplo)
- Create: `src/data/biblioteca/software.ts` (stub: `export const SOFTWARE: Item[] = [];`)
- Create: `src/data/biblioteca/growth.ts` (stub: `export const GROWTH: Item[] = [];`)
- Create: `src/data/biblioteca/equipos.ts`
- Test: `tests/biblioteca.test.ts`

- [ ] **Step 1: Escribir el test de helpers e invariantes (falla).** Crear `tests/biblioteca.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  CATALOGOS, EQUIPOS, ITEMS,
  itemsDeCatalogo, gruposDeCatalogo, itemsDeGrupo, equipoDeGrupo,
} from '../src/data/biblioteca';

describe('biblioteca — estructura', () => {
  it('tiene 3 catálogos con grupos 4/4/6', () => {
    expect(CATALOGOS.map((c) => c.id)).toEqual(['prompts', 'software', 'growth']);
    expect(gruposDeCatalogo('prompts')).toHaveLength(4);
    expect(gruposDeCatalogo('software')).toHaveLength(4);
    expect(gruposDeCatalogo('growth')).toHaveLength(6);
  });

  it('cada item tiene id único y grupo válido de su catálogo', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const it of ITEMS) {
      expect(gruposDeCatalogo(it.catalogo)).toContain(it.grupo);
      expect(it.titulo.trim().length).toBeGreaterThan(0);
    }
  });

  it('helpers filtran correctamente', () => {
    expect(itemsDeCatalogo('prompts').every((i) => i.catalogo === 'prompts')).toBe(true);
    const g = gruposDeCatalogo('prompts')[0];
    expect(itemsDeGrupo('prompts', g).every((i) => i.grupo === g)).toBe(true);
  });

  it('hay un equipo por cada grupo de software y growth', () => {
    for (const cat of ['software', 'growth'] as const) {
      for (const grupo of gruposDeCatalogo(cat)) {
        expect(equipoDeGrupo(cat, grupo)).toBeDefined();
      }
    }
    expect(EQUIPOS).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Ejecutar → falla.** Run: `npx vitest run tests/biblioteca.test.ts` → Expected: FAIL (módulo no existe).

- [ ] **Step 3: Crear tipos y agregados.** Crear `src/data/biblioteca/index.ts`:

```ts
export type CatalogoId = 'prompts' | 'software' | 'growth';

export interface Catalogo {
  id: CatalogoId;
  nombre: string;
  desc: string;
  grupos: string[];
  gratis: boolean;
}

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
  titulo: string;
  cuerpo?: string;        // A: prompt copiable
  beneficio?: string;     // B/C teaser
  alcance?: string;       // B/C teaser
  blueprint?: Blueprint;  // B/C de pago
  precio?: number;        // B/C suelto (€)
}

export interface Equipo {
  id: string;
  nombre: string;
  desc: string;
  catalogo: CatalogoId;
  grupo: string;
  precio: number;
  compraUrl?: string;
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

const catalogo = (id: CatalogoId): Catalogo => {
  const c = CATALOGOS.find((x) => x.id === id);
  if (!c) throw new Error(`Catálogo desconocido: ${id}`);
  return c;
};

export function itemsDeCatalogo(id: CatalogoId): Item[] {
  return ITEMS.filter((i) => i.catalogo === id);
}
export function gruposDeCatalogo(id: CatalogoId): string[] {
  return catalogo(id).grupos;
}
export function itemsDeGrupo(cat: CatalogoId, grupo: string): Item[] {
  return ITEMS.filter((i) => i.catalogo === cat && i.grupo === grupo);
}
export function equipoDeGrupo(cat: CatalogoId, grupo: string): Equipo | undefined {
  return EQUIPOS.find((e) => e.catalogo === cat && e.grupo === grupo);
}
```

- [ ] **Step 4: Crear stubs de contenido.** `src/data/biblioteca/software.ts` y `growth.ts`:

```ts
import type { Item } from './index';
export const SOFTWARE: Item[] = []; // (growth.ts: export const GROWTH: Item[] = [];)
```

`src/data/biblioteca/prompts.ts` (semilla de 1 grupo para que los helpers tengan datos; se completa en Task 3):

```ts
import type { Item } from './index';
export const PROMPTS: Item[] = [
  {
    id: 'p01', catalogo: 'prompts', grupo: 'Por industria',
    titulo: 'Texto de ventas con la fórmula PAS',
    cuerpo: 'Rol: Copywriter de respuesta directa...\nTarea: ...',
  },
];
```

- [ ] **Step 5: Crear los 10 equipos.** `src/data/biblioteca/equipos.ts`:

```ts
import type { Equipo } from './index';
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
  { id: 'eq-gr-ux', nombre: 'Equipo de Diseño y Experiencia', desc: 'Mejora el diseño y la experiencia.', catalogo: 'growth', grupo: 'Diseño y experiencia', precio: 3.99 },
];
```

- [ ] **Step 6: Ejecutar → pasa.** Run: `npx vitest run tests/biblioteca.test.ts` → Expected: PASS.

- [ ] **Step 7: Commit.**
```bash
git add src/data/biblioteca tests/biblioteca.test.ts
git commit -m "feat(biblioteca): motor de datos (catalogos, equipos, helpers) + tests"
```

---

### Task 3: Contenido del catálogo A — 100 prompts (TDD por conteo)

**Files:**
- Modify: `src/data/biblioteca/prompts.ts`
- Modify: `tests/biblioteca.test.ts`

**Rubric de reescritura (aplicar a los 100):** framework **Rol + Contexto + Tarea + Restricciones + Formato**; español neutro (España + LATAM); placeholders `[entre corchetes]`; sin promesas exageradas. Fuente: la lista de 100 prompts del usuario (industria/resultados/casos/objetivos), reescrita — no copiar literal. 25 por grupo: `Por industria` (industrias), `Por resultados` (KPIs), `Mejores casos de uso`, `Por objetivos`.

- [ ] **Step 1: Añadir el test estricto de conteo (falla).** En `tests/biblioteca.test.ts` añadir:

```ts
import { itemsDeCatalogo as ic } from '../src/data/biblioteca';
describe('catálogo A — prompts', () => {
  const prompts = ic('prompts');
  it('son 100, 25 por grupo, ids p01..p100 con cuerpo con framework', () => {
    expect(prompts).toHaveLength(100);
    for (const g of ['Por industria', 'Por resultados', 'Mejores casos de uso', 'Por objetivos']) {
      expect(prompts.filter((p) => p.grupo === g)).toHaveLength(25);
    }
    prompts.forEach((p, n) => {
      expect(p.id).toBe(`p${String(n + 1).padStart(2, '0')}`);
      expect(p.cuerpo && /Rol:/.test(p.cuerpo)).toBeTruthy();
      expect(p.beneficio).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Ejecutar → falla.** Run: `npx vitest run tests/biblioteca.test.ts` → Expected: FAIL (length 1 ≠ 100).

- [ ] **Step 3: Autorar los 100 prompts.** Reemplazar `PROMPTS` en `src/data/biblioteca/prompts.ts` con los 100 ítems (ids `p01`..`p100`, 25 por grupo), reescritos según la rúbrica. **Ejemplo de un ítem (patrón para todos):**

```ts
{
  id: 'p01', catalogo: 'prompts', grupo: 'Por industria',
  titulo: 'Texto de ventas con la fórmula PAS',
  cuerpo:
`Rol: Copywriter de respuesta directa con experiencia en psicología del consumidor.
Contexto: Vendo [producto/servicio] a [audiencia]. Su dolor principal es [dolor] y su mayor deseo es [resultado deseado].
Tarea: Escribe un texto de ventas de ~300 palabras que agite ese dolor y presente mi producto como la solución evidente.
Restricciones: Tono cercano, sin tecnicismos; usa la fórmula PAS (Problema-Agitación-Solución); nada de promesas que no pueda cumplir.
Formato: Titular + 3 párrafos + 2 variantes de llamada a la acción.`,
},
```

> **Ejecución:** autorar en 4 lotes (uno por grupo) para mantener consistencia; ideal 1 subagente por grupo devolviendo los 25 ítems como JSON validado contra `Item`.

- [ ] **Step 4: Ejecutar → pasa.** Run: `npx vitest run tests/biblioteca.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit.**
```bash
git add src/data/biblioteca/prompts.ts tests/biblioteca.test.ts
git commit -m "feat(biblioteca): 100 prompts reescritos (catalogo A)"
```

---

### Task 4: Componente `BibliotecaIA.astro`

**Files:**
- Create: `src/components/BibliotecaIA.astro`

Renderiza selector de catálogo (pills `.bib-cat`), filtro de texto (`#bib-search`), chips de grupo (`.bib-grupo`), y tarjetas (`.bib-item` con `data-cat`, `data-grupo`, `data-search`). Para A: `<pre>` + botón `.bib-copy` con `data-copy` = texto del prompt. Para B/C: beneficio + alcance + botón "Desbloquear · 1,99 €" (placeholder `href="#"` con `data-stripe`), y banner de equipo por grupo con CTA "Contratar equipo · 3,99 €". Estado vacío `#bib-empty`. Usar tokens de `global.css` (`var(--accent)`, `var(--panel)`, `var(--line)`, `var(--mono)`, `var(--sans)`, `var(--fg-*)`). Sin `onclick` inline (CSP).

- [ ] **Step 1: Crear el componente** con la estructura anterior, iterando `CATALOGOS`, y por catálogo sus `gruposDeCatalogo` → `itemsDeGrupo`. (Marcado completo; seguir el estilo de `[slug].astro`.)

- [ ] **Step 2: Verificar build parcial.** Se validará al integrarlo (Task 6). De momento: `npx astro check` → sin errores nuevos.

- [ ] **Step 3: Commit.**
```bash
git add src/components/BibliotecaIA.astro
git commit -m "feat(biblioteca): componente BibliotecaIA (navegable)"
```

---

### Task 5: Script cliente `biblioteca.ts` (TDD, happy-dom)

**Files:**
- Create: `src/scripts/biblioteca.ts`
- Test: `tests/biblioteca-ui.test.ts`

- [ ] **Step 1: Test (falla).** Crear `tests/biblioteca-ui.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBiblioteca, initBibliotecaCopy } from '../src/scripts/biblioteca';

function dom() {
  document.body.innerHTML = `
    <button class="bib-cat" data-cat="prompts" aria-pressed="true">Prompts</button>
    <button class="bib-cat" data-cat="software" aria-pressed="false">Software</button>
    <input id="bib-search" />
    <div id="bib-empty" hidden></div>
    <article class="bib-item" data-cat="prompts" data-grupo="Por industria" data-search="ventas pas">
      <button class="bib-copy" data-copy="Rol: ...">Copiar</button>
    </article>
    <article class="bib-item" data-cat="software" data-grupo="Auditoría de tu software" data-search="arquitectura">x</article>`;
}

beforeEach(dom);

describe('initBiblioteca', () => {
  it('muestra solo el catálogo activo', () => {
    initBiblioteca();
    const items = () => Array.from(document.querySelectorAll<HTMLElement>('.bib-item'));
    expect(items()[0].hidden).toBe(false);
    expect(items()[1].hidden).toBe(true);
    (document.querySelector('[data-cat="software"]') as HTMLElement).click();
    expect(items()[0].hidden).toBe(true);
    expect(items()[1].hidden).toBe(false);
  });

  it('el filtro de texto oculta lo que no coincide y muestra vacío', () => {
    initBiblioteca();
    const s = document.getElementById('bib-search') as HTMLInputElement;
    s.value = 'zzz'; s.dispatchEvent(new Event('input'));
    expect(document.getElementById('bib-empty')!.hidden).toBe(false);
  });
});

describe('initBibliotecaCopy', () => {
  it('copia el texto y da feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    initBibliotecaCopy();
    (document.querySelector('.bib-copy') as HTMLElement).click();
    expect(writeText).toHaveBeenCalledWith('Rol: ...');
  });
});
```

- [ ] **Step 2: Ejecutar → falla.** Run: `npx vitest run tests/biblioteca-ui.test.ts` → Expected: FAIL.

- [ ] **Step 3: Implementar `src/scripts/biblioteca.ts`** (idempotente, sin estado global; espejo de `directory.ts`): estado `{ cat, texto }`; `applyFilter()` togglea `.bib-item.hidden` según `data-cat === cat` y `data-search` incluye `texto` (usar `fold` para tildes); actualiza `aria-pressed` de `.bib-cat` y `#bib-empty.hidden`. `initBibliotecaCopy()`: delega en `.bib-copy`, `navigator.clipboard.writeText(btn.dataset.copy)`, feedback temporal cambiando el texto a "¡Copiado!" y restaurándolo; try/catch con fallback silencioso.

- [ ] **Step 4: Ejecutar → pasa.** Run: `npx vitest run tests/biblioteca-ui.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit.**
```bash
git add src/scripts/biblioteca.ts tests/biblioteca-ui.test.ts
git commit -m "feat(biblioteca): filtros + copiar-al-portapapeles (cliente) + tests"
```

---

### Task 6: Recurso + hook en `[slug].astro` + verificación

**Files:**
- Create: `src/content/recursos/biblioteca-ia.json`
- Modify: `src/pages/recurso/[slug].astro`

- [ ] **Step 1: Crear el recurso** `src/content/recursos/biblioteca-ia.json` (ver spec; `precio:"Gratis"`, `biblioteca:true`, `gated:false`, con `long`/`tagline`/`ideal` redactados).

- [ ] **Step 2: Enganchar el render.** En `src/pages/recurso/[slug].astro`: importar `BibliotecaIA`; cuando `recurso.biblioteca`, renderizar `<BibliotecaIA />` en lugar del grid de 2 columnas "Qué es/Para quién/FAQ", conservando héroe + una intro breve. Ajustar el `cta` del héroe a `{ href: '#biblioteca', label: 'Explorar la biblioteca ↓', ... }` cuando `recurso.biblioteca`. En el `<script>` del final, importar y llamar `initBiblioteca`/`initBibliotecaCopy` dentro de `astro:page-load`.

- [ ] **Step 3: Build + tests completos.** Run: `npm run build` → Expected: OK, genera `/recurso/biblioteca-ia`. Run: `npm run test` → Expected: toda la suite en verde.

- [ ] **Step 4: Smoke manual.** Run: `npm run dev` y abrir `/recurso/biblioteca-ia`: cambiar de catálogo, filtrar, copiar un prompt. (Fase 1: solo el catálogo Prompts tendrá contenido; B/C aún vacíos.)

- [ ] **Step 5: Commit.**
```bash
git add src/content/recursos/biblioteca-ia.json src/pages/recurso/[slug].astro
git commit -m "feat(biblioteca): recurso navegable en /recurso/biblioteca-ia (fase 1)"
```

---

## FASE 2 — Catálogo B: 100 blueprints "IA en tu software"

### Task 7: Contenido B (teasers + blueprints) + integridad

**Files:** Modify `src/data/biblioteca/software.ts`, `tests/biblioteca.test.ts`.

**Rubric:** cada ítem `sw01..sw100` (25 por los 4 grupos): `titulo` (beneficio, lenguaje de negocio), `beneficio` (1–2 frases: qué ganas), `alcance` (hasta dónde llega / qué NO hace), `precio: 1.99`, y `blueprint` completo (`quePuedeHacer`, `modo`, `pasos[]`, `reglas[]`, `prompt` ejecutable). Sin `cuerpo`. Fuente: la lista "100 skills de ingeniería" del usuario, reescrita como frameworks (fact-checking: sin cifras inventadas).

- [ ] **Step 1: Test estricto (falla):** 100 ítems, 25/grupo, ids `sw01..sw100`, cada uno con `beneficio`/`alcance`/`blueprint`/`precio` y sin `cuerpo`. (Espejo del test de Task 3, adaptado.)
- [ ] **Step 2: Run → falla.**
- [ ] **Step 3: Autorar los 100** (1 subagente por grupo, 25 c/u, salida JSON validada contra `Item`).
- [ ] **Step 4: Run → pasa** (`npm run test`).
- [ ] **Step 5: Commit** `feat(biblioteca): 100 blueprints de software (catalogo B)`.

---

## FASE 3 — Catálogo C: 100 blueprints "Growth con IA"

### Task 8: Contenido C (teasers + blueprints) + integridad

**Files:** Modify `src/data/biblioteca/growth.ts`, `tests/biblioteca.test.ts`.

Igual que Task 7 pero ids `gr01..gr100`, 6 grupos (SEO 17, GEO 17, Competencia 17, Publicidad 17, Social 16, UX 16 → ajustar a repartir 100; el test valida sólo total=100 y grupos válidos, no 25/grupo). Fuente: "100 agentic skills de Growth Engineering" (ya en formato blueprint: Skill ID · Mode · Workflow · Rules) → reescribir claros/útiles.

- [ ] **Step 1: Test (falla):** `gr` 100 ítems, grupos ∈ growth, cada uno con teaser+blueprint+precio.
- [ ] **Step 2: Run → falla.**
- [ ] **Step 3: Autorar los 100** (1 subagente por pilar).
- [ ] **Step 4: Run → pasa.**
- [ ] **Step 5: Commit** `feat(biblioteca): 100 blueprints de growth (catalogo C)`.

---

## FASE 4 — Stripe + entrega (diferido, requiere datos del usuario)

### Task 9: Cablear compra y entrega

**Requiere del usuario:** Payment Links de Stripe (por equipo, y opcional por ítem) + destino de entrega (página no listada / PDF / Notion).

- [ ] **Step 1:** Rellenar `compraUrl` en `EQUIPOS` (y `compraUrl`/link por ítem si se venden sueltos).
- [ ] **Step 2:** En `BibliotecaIA.astro`, apuntar los botones "Contratar equipo"/"Desbloquear" a esos `compraUrl` (target `_blank`, `rel="noopener"`).
- [ ] **Step 3:** Crear el destino de entrega elegido (p. ej. `src/pages/entrega/[equipo].astro` con `noindex` que renderiza los `blueprint` completos del grupo).
- [ ] **Step 4:** Configurar en Stripe la redirección post-pago al destino. **Opción API test-mode:** con la key de Doppler y confirmación explícita del usuario, crear Payment Links vía API en `test` primero.
- [ ] **Step 5:** Build + test + smoke de una compra en test. Commit.

---

## Self-review (hecho)

- **Cobertura del spec:** motor (Task 2), A gratis (3), UI (4-5), integración/recurso (6), B (7), C (8), Stripe/entrega (9). ✔
- **Placeholders:** los "autorar 100" son tareas de contenido con rúbrica + ejemplo + test de integridad que fuerza completitud — no son TODOs vagos. ✔
- **Consistencia de tipos:** `Item`/`Catalogo`/`Equipo`/`Blueprint` y helpers (`itemsDeCatalogo`, `gruposDeCatalogo`, `itemsDeGrupo`, `equipoDeGrupo`) se usan igual en datos, tests y componente. ✔
