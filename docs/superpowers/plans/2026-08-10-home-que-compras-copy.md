# Home «Qué compras» Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el mensaje defensivo del bloque «Qué compras» por una promesa concreta de una automatización operativa.

**Architecture:** El cambio permanece dentro de la portada Astro existente. Un test contractual de fuente fija el copy aprobado y evita que el bloque vuelva a una formulación negativa; no cambia la estructura HTML, la analítica ni los componentes.

**Tech Stack:** Astro 7, TypeScript, Vitest.

---

### Task 1: Fijar e implementar el mensaje aprobado

**Files:**
- Modify: `tests/commercial-navigation.test.ts`
- Modify: `src/pages/index.astro:91-102`

- [ ] **Step 1: Escribir el test contractual que debe fallar**

Añadir estas aserciones al test `convierte la home en una ruta de venta sin eliminar el directorio`:

```ts
expect(page).toContain('Una automatización lista para trabajar');
expect(page).toContain(
  'Conectamos un proceso concreto con las herramientas que ya utilizas y lo dejamos probado, documentado y con control humano. Tu equipo recibe un flujo operativo de principio a fin, no otra herramienta que aprender.',
);
expect(page).not.toContain('No te entregamos una demo');
```

- [ ] **Step 2: Ejecutar el test y confirmar que falla por el copy antiguo**

Run: `npm test -- --run tests/commercial-navigation.test.ts`

Expected: FAIL porque `src/pages/index.astro` todavía no contiene `Una automatización lista para trabajar`.

- [ ] **Step 3: Sustituir únicamente el titular y el párrafo**

En `src/pages/index.astro`, dejar el encabezado del bloque así:

```astro
<div>
  <span class="section-kicker">Qué compras</span>
  <h2>Una automatización lista para trabajar</h2>
  <p>Conectamos un proceso concreto con las herramientas que ya utilizas y lo dejamos probado, documentado y con control humano. Tu equipo recibe un flujo operativo de principio a fin, no otra herramienta que aprender.</p>
</div>
```

- [ ] **Step 4: Ejecutar la prueba enfocada**

Run: `npm test -- --run tests/commercial-navigation.test.ts`

Expected: PASS para el archivo completo.

- [ ] **Step 5: Ejecutar la verificación completa**

Run: `npm test -- --run`

Expected: 44 archivos y al menos 405 tests aprobados.

Run: `npm run build`

Expected: build de Astro y postbuild de Pagefind finalizados con código 0.

- [ ] **Step 6: Verificar el home renderizado**

Comprobar `/` a 1440 px y 390 px. El bloque debe conservar las tres tarjetas, no desbordarse y mostrar exactamente el copy aprobado; la consola debe quedar sin errores.

- [ ] **Step 7: Crear el commit de implementación**

```bash
git add src/pages/index.astro tests/commercial-navigation.test.ts
git commit -m "fix: align home purchase message"
```

