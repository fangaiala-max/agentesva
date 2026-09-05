# Guía para convertirse en especialista GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar una guía profesional en español que convierta el análisis de 262 puestos provisionales de Citable Agency en un itinerario verificable de competencias, portfolio y aprendizaje GEO durante 90 días.

**Architecture:** Añadir una única entrada Markdown a la colección Astro `guias`, sin modificar plantillas ni esquemas. Proteger con una prueba editorial específica el frontmatter, la atribución cuantitativa, las limitaciones, el enlazado interno y el CTA `gr22`; validar después toda la colección mediante Vitest y Astro build.

**Tech Stack:** Astro 7 Content Collections, Markdown/YAML, TypeScript, Vitest 4.

---

## Mapa de archivos

- Crear `tests/especialista-geo-guide.test.ts`: contrato editorial y de integración de la nueva guía.
- Crear `src/content/guias/como-convertirse-en-especialista-geo.md`: artículo completo y su frontmatter.
- No modificar `src/pages/guias/[slug].astro` ni `src/content-schemas/guias.ts`: la plantilla y el esquema actuales ya soportan Article/FAQ/Breadcrumb, relacionados, fuentes y el CTA de recurso.

### Task 1: Fijar el contrato editorial con una prueba fallida

**Files:**
- Create: `tests/especialista-geo-guide.test.ts`
- Reference: `docs/superpowers/specs/2026-08-13-especialista-geo-design.md`
- Reference: `src/content-schemas/guias.ts`

- [ ] **Step 1: Crear la prueba del contrato**

Crear `tests/especialista-geo-guide.test.ts` con este contenido:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from 'astro/markdown';
import { describe, expect, it } from 'vitest';
import { guideSchema } from '../src/content-schemas/guias';

const file = path.join(process.cwd(), 'src/content/guias/como-convertirse-en-especialista-geo.md');
const read = () => fs.readFileSync(file, 'utf8');

describe('guía para convertirse en especialista GEO', () => {
  it('existe y cumple el schema de guías', () => {
    expect(fs.existsSync(file)).toBe(true);
    const { frontmatter } = parseFrontmatter(read());
    expect(() => guideSchema.parse(frontmatter)).not.toThrow();
    expect(frontmatter.recurso).toEqual({ id: 'gr22' });
    expect(frontmatter.servicio).toBeUndefined();
  });

  it('atribuye los hallazgos al corpus provisional de Citable', () => {
    const source = read();
    for (const value of ['247', '94,3 %', '80', '30,5 %', '79', '30,2 %', '1', '0,4 %']) {
      expect(source).toContain(value);
    }
    expect(source).toContain('262 puestos canónicos provisionales');
    expect(source).toContain('https://citable.agency/journal/what-companies-expect-from-geo-specialist/');
    expect(source).toMatch(/no representa (?:todo el|la totalidad del) mercado laboral/i);
    expect(source).toMatch(/no (?:demuestra|permite concluir).{0,100}(?:prima salarial|salarios)/is);
  });

  it('convierte las seis competencias en prácticas y evidencias de portfolio', () => {
    const source = read();
    for (const heading of [
      'Medición de visibilidad',
      'Fundamentos técnicos',
      'Contenido recuperable',
      'Entidades y narrativa',
      'Autoridad y fuentes externas',
      'Operaciones y experimentación',
    ]) {
      expect(source).toContain(`### ${heading}`);
    }
    expect(source.match(/\*\*Práctica:\*\*/g)).toHaveLength(6);
    expect(source.match(/\*\*Evidencia de portfolio:\*\*/g)).toHaveLength(6);
  });

  it('incluye plan de 90 días, evaluación de ofertas y enlaces del clúster', () => {
    const source = read();
    expect(source).toContain('## Plan de aprendizaje de 90 días');
    expect(source).toContain('Días 1–30');
    expect(source).toContain('Días 31–60');
    expect(source).toContain('Días 61–90');
    expect(source).toContain('## Cómo evaluar una oferta de empleo GEO');
    for (const href of [
      '/guias/seo-para-ia/',
      '/guias/como-aparecer-en-chatgpt/',
      '/guias/medir-visibilidad-en-chatgpt/',
    ]) {
      expect(source).toContain(href);
    }
    expect(source).toMatch(/no (?:garantiza|promete).{0,80}(?:empleo|contratación)/is);
  });
});
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npx vitest run tests/especialista-geo-guide.test.ts`

Expected: FAIL porque `src/content/guias/como-convertirse-en-especialista-geo.md` todavía no existe.

- [ ] **Step 3: Commit del test rojo**

```bash
git add tests/especialista-geo-guide.test.ts
git commit -m "test: define especialista GEO guide contract"
```

### Task 2: Redactar la guía completa

**Files:**
- Create: `src/content/guias/como-convertirse-en-especialista-geo.md`
- Test: `tests/especialista-geo-guide.test.ts`
- Reference: `docs/superpowers/specs/2026-08-13-especialista-geo-design.md`
- Reference: `src/content/guias/seo-para-ia.md`
- Reference: `src/content/guias/medir-visibilidad-en-chatgpt.md`

- [ ] **Step 1: Crear el frontmatter compatible con `guideSchema`**

Usar exactamente estas claves y valores estructurales; las respuestas FAQ deben mantenerse prudentes y autocontenidas:

```yaml
---
titulo: "Cómo convertirse en especialista GEO: habilidades y plan de 90 días"
descripcion: "Qué necesitas aprender para trabajar en GEO: competencias, portfolio, proyectos prácticos y un plan de 90 días basado en 262 ofertas revisadas."
fecha: 2026-08-13
actualizado: 2026-08-13
tema: Carrera en GEO
respuesta: "Para convertirte en especialista GEO necesitas una base sólida de SEO y aprender a medir respuestas generativas, diseñar contenido verificable, trabajar entidades y fuentes externas, y convertir hallazgos en experimentos implementables. Un proyecto documentado con línea base, cambios y re-medición aporta más evidencia profesional que limitarse a acumular certificados."
puntosClave:
  - "El GEO amplía el SEO: no lo sustituye ni se reduce a escribir prompts."
  - "Tu portfolio debe mostrar método, evidencia, implementación y límites, no solo capturas de respuestas."
  - "Un plan de 90 días permite construir fundamentos y un caso demostrable, pero no garantiza conseguir empleo."
recurso:
  id: gr22
relacionados:
  - titulo: "SEO para IA"
    href: "/guias/seo-para-ia/"
  - titulo: "Cómo aparecer en ChatGPT"
    href: "/guias/como-aparecer-en-chatgpt/"
  - titulo: "Cómo medir la visibilidad en ChatGPT"
    href: "/guias/medir-visibilidad-en-chatgpt/"
faq:
  - q: "¿Necesito saber SEO para trabajar en GEO?"
    a: "Sí, al menos sus fundamentos. El análisis de Citable encontró una base SEO explícita en 247 de 262 puestos canónicos provisionales. GEO añade nuevas superficies, medición y operaciones, pero sigue dependiendo de rastreo, indexación, arquitectura, contenido y autoridad."
  - q: "¿Hace falta programar para ser especialista GEO?"
    a: "No en todos los puestos, aunque entender HTML, renderizado, datos estructurados y automatización te permite diagnosticar mejor y colaborar con desarrollo. La profundidad técnica necesaria depende del alcance y la seniority del puesto."
  - q: "¿GEO es lo mismo que AEO o SEO para IA?"
    a: "Son términos solapados, no equivalencias universales. GEO suele enfocarse en motores generativos, AEO en respuestas directas y SEO para IA funciona como término paraguas. Evalúa las responsabilidades concretas del puesto antes que su etiqueta."
  - q: "¿Qué debe incluir un portfolio GEO sin experiencia laboral previa?"
    a: "Incluye un proyecto propio con protocolo de consultas, línea base, auditoría de exactitud y fuentes, backlog priorizado, al menos un cambio implementado y una re-medición que explique resultados y limitaciones."
  - q: "¿Se puede aprender GEO en 90 días?"
    a: "En 90 días puedes construir fundamentos y un primer caso de portfolio si ya tienes nociones de marketing o SEO. Ese plazo no garantiza dominio profesional ni contratación: la experiencia crece al repetir proyectos, implementar cambios y comunicar decisiones."
fuentes:
  - titulo: "What Companies Expect From a GEO Specialist"
    url: "https://citable.agency/journal/what-companies-expect-from-geo-specialist/"
    editor: "Citable Agency"
    fecha: "ago 2026"
---
```

- [ ] **Step 2: Redactar el cuerpo con la arquitectura aprobada**

Escribir entre 2.400 y 3.400 palabras originales en español. Incluir, en este orden:

1. apertura answer-first que contraste el 94,3 % de base SEO con el 0,4 % de preparación para agentes explícita;
2. `## Qué hace realmente un especialista GEO`;
3. `## Qué revela el GEO Jobs Report de Citable`, con tabla de los seis hallazgos de la especificación y atribución enlazada;
4. un bloque `### Cómo leer estos datos` que incluya 304 observaciones declaradas, 267 registros recuperados, cinco duplicados vinculados, 262 puestos provisionales, 37 sin bloques detallados, 242 con URL y 20 con texto capturado sin URL;
5. `## Las seis competencias de un especialista GEO`, con estos seis H3 exactos: `Medición de visibilidad`, `Fundamentos técnicos`, `Contenido recuperable`, `Entidades y narrativa`, `Autoridad y fuentes externas`, `Operaciones y experimentación`; cada H3 debe incluir una línea `**Práctica:**` y una `**Evidencia de portfolio:**`;
6. `## Qué conocimientos SEO siguen siendo imprescindibles`, enlazando `/guias/seo-para-ia/`;
7. `## Cómo aprender GEO mediante proyectos reales`, enlazando `/guias/como-aparecer-en-chatgpt/`;
8. `## El portfolio GEO mínimo viable`, enlazando `/guias/medir-visibilidad-en-chatgpt/`;
9. `## Plan de aprendizaje de 90 días`, con los H3 `Días 1–30`, `Días 31–60` y `Días 61–90`, tareas semanales y entregables observables;
10. `## Cómo evaluar una oferta de empleo GEO`, con checklist de objetivo, superficies, datos, capacidad de implementar, colaboración, métricas, gobernanza y expectativas;
11. `## Tu siguiente paso`, conectando el recurso `gr22` con la primera auditoría del portfolio y aclarando que el plan no garantiza empleo ni contratación.

Mantener estas reglas durante la redacción:

- atribuir los porcentajes a Citable y llamarlos resultados del corpus provisional, no del mercado global;
- distinguir hechos, interpretación editorial y recomendación práctica;
- no afirmar salarios, crecimiento de demanda, causalidad, adopción real de herramientas ni experiencia propia;
- no copiar frases completas del informe salvo nombres de métricas o términos inevitables;
- usar párrafos autocontenidos, ejemplos de trabajo y lenguaje profesional sin clichés;
- reservar `gr22` como único CTA comercial y no añadir un bloque `servicio`.

- [ ] **Step 3: Ejecutar la prueba específica**

Run: `npx vitest run tests/especialista-geo-guide.test.ts`

Expected: PASS, 1 archivo y 4 tests.

- [ ] **Step 4: Revisar mecánicamente atribución, estructura y enlaces**

Run:

```bash
rg -n "94,3 %|30,5 %|30,2 %|35,9 %|0,4 %|15,6 %|Citable|262 puestos canónicos provisionales|Práctica:|Evidencia de portfolio:|/guias/" src/content/guias/como-convertirse-en-especialista-geo.md
```

Expected: aparecen los seis porcentajes atribuidos, las 12 etiquetas de práctica/evidencia y los tres enlaces internos.

- [ ] **Step 5: Commit de la guía**

```bash
git add src/content/guias/como-convertirse-en-especialista-geo.md
git commit -m "feat: add especialista GEO career guide"
```

### Task 3: Validar integración y publicación

**Files:**
- Verify: `src/content/guias/como-convertirse-en-especialista-geo.md`
- Verify: `tests/especialista-geo-guide.test.ts`

- [ ] **Step 1: Ejecutar toda la suite**

Run: `npm test`

Expected: 49 archivos y 426 tests pasan sin fallos.

- [ ] **Step 2: Ejecutar el build de producción**

Run: `npm run build`

Expected: Astro y Pagefind terminan con código 0; la salida incluye `/guias/como-convertirse-en-especialista-geo/index.html`.

- [ ] **Step 3: Verificar la salida generada**

Run:

```bash
rg -n "Cómo convertirse en especialista GEO|What Companies Expect From a GEO Specialist|FAQPage|gr22" .vercel/output/static/guias/como-convertirse-en-especialista-geo/index.html
```

Expected: el HTML contiene título, atribución, FAQ estructurada y el CTA asociado a `gr22`.

- [ ] **Step 4: Inspeccionar el diff final**

Run: `git diff 451a211...HEAD --check && git status --short`

Expected: `git diff --check` no informa errores y el árbol queda limpio tras los dos commits de implementación.

- [ ] **Step 5: Entregar para revisión independiente**

Informar los commits creados, tests y build. No hacer merge, push ni deploy: la persona revisora validará fidelidad de cifras, originalidad, tono, enlaces y render antes de integrar.
