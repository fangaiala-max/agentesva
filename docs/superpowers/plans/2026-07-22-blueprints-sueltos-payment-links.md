# Blueprints sueltos (piloto 25) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement Tasks 1-4 (pure code) task-by-task. **Tasks 5-8 involve real Stripe API calls and real money — execute those directly in the main session, never delegate to a subagent, and get explicit user confirmation before any live-mode action** (same pattern already used for the original 10 "equipos" Payment Links).

**Goal:** Wire real Stripe Payment Links for a pilot of 25 individual blueprints (the "Auditoría de tu software" group, `sw01`–`sw25`, 1,99 € each), completing the "Desbloquear" purchase flow that was a placeholder since launch.

**Architecture:** A new isolated data file (`compra-urls.ts`) holds the id→Payment-Link map, kept separate from the already-reviewed content files. `entrega.astro` is extended to resolve either an "equipo" purchase (existing) or a single-"item" purchase (new) from the same Stripe session, using a newly-extracted `BlueprintCard.astro` component to avoid duplicating the blueprint-rendering markup between the two cases.

**Tech Stack:** Astro 5, TypeScript, Vitest, Stripe REST API (plain `fetch`, no SDK — matches the existing pattern in this codebase).

---

## Task 1: Extract `BlueprintCard.astro`

**Files:**
- Create: `src/components/BlueprintCard.astro`
- Modify: `src/pages/entrega.astro:73-108`

Mechanical refactor: moves the existing inline blueprint-card markup (title,
"qué puede hacer", modo, pasos, reglas, copy button) into its own component,
with no behavior change. This lets a later task reuse it for single-item
deliveries without duplicating ~35 lines of markup.

- [ ] **Step 1: Create the component**

Create `src/components/BlueprintCard.astro`:

```astro
---
import type { Item } from '../data/biblioteca';

interface Props {
  item: Item;
  index?: number;
}
const { item, index } = Astro.props;
---

<article style="border: 1px solid var(--line); background: var(--panel); border-radius: 10px; padding: 22px;">
  {index !== undefined && <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; color: var(--accent);">{String(index + 1).padStart(2, '0')}</span>}
  <h3 style="font-family: var(--serif); font-weight: 400; font-size: 19.5px; line-height: 1.22; letter-spacing: -0.02em; color: #fff; margin: 6px 0 0;">{item.titulo}</h3>
  <p style="font-size: 14px; line-height: 1.55; color: var(--fg-3); margin: 10px 0 0;">{item.blueprint?.quePuedeHacer}</p>

  <div style="display: flex; gap: 14px; margin: 14px 0 0; flex-wrap: wrap;">
    <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--fg-5); border: 1px solid var(--line-2); border-radius: 20px; padding: 4px 10px;">{item.blueprint?.modo}</span>
  </div>

  <div style="margin-top: 16px;">
    <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5);">Pasos</span>
    <ol style="margin: 8px 0 0; padding-left: 20px; color: var(--fg-2); font-size: 14px; line-height: 1.65;">
      {item.blueprint?.pasos.map((p) => <li>{p}</li>)}
    </ol>
  </div>

  <div style="margin-top: 14px;">
    <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5);">Reglas</span>
    <ul style="margin: 8px 0 0; padding-left: 20px; color: var(--fg-2); font-size: 14px; line-height: 1.65;">
      {item.blueprint?.reglas.map((r) => <li>{r}</li>)}
    </ul>
  </div>

  <div style="margin-top: 16px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
    <button
      type="button"
      class="bib-copy shimmer"
      data-copy={item.blueprint?.prompt}
      style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--sans); font-weight: 700; font-size: 13px; color: var(--bg); background: var(--accent); border: none; border-radius: 2px; padding: 10px 16px; cursor: pointer;"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span class="bib-copy-label">Copiar prompt</span>
    </button>
  </div>
</article>
```

- [ ] **Step 2: Use it in `entrega.astro`, replacing the inline markup**

In `src/pages/entrega.astro`, add the import at the top of the frontmatter (after the existing imports):

```astro
import BlueprintCard from '../components/BlueprintCard.astro';
```

Replace lines 72-110 (the `<div style="display: flex; flex-direction: column; gap: 20px; ...">{items.map((it, i) => (<article>...</article>))}</div>` block) with:

```astro
            <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 24px;">
              {items.map((it, i) => <BlueprintCard item={it} index={i} />)}
            </div>
```

- [ ] **Step 3: Verify — build + visual smoke check**

Run: `npm run build`
Expected: no errors.

Run: `npm run test`
Expected: all tests pass (no test touches this markup directly, so this just guards against a typo breaking something else).

- [ ] **Step 4: Commit**

```bash
git add src/components/BlueprintCard.astro src/pages/entrega.astro
git commit -m "refactor(biblioteca): extraer BlueprintCard.astro de entrega.astro"
```

---

## Task 2: `compra-urls.ts` — mapa de Payment Links por ítem + tests

**Files:**
- Create: `src/data/biblioteca/compra-urls.ts`
- Modify: `src/data/biblioteca/index.ts`
- Test: `tests/biblioteca-compra.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/biblioteca-compra.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { compraUrlDeItem, COMPRA_URLS } from '../src/data/biblioteca/compra-urls';
import { ITEMS } from '../src/data/biblioteca';

describe('compraUrlDeItem', () => {
  it('devuelve undefined para un id sin Payment Link', () => {
    expect(compraUrlDeItem('id-que-no-existe')).toBeUndefined();
  });

  it('cada entrada de COMPRA_URLS corresponde a un Item real y a una URL de Stripe', () => {
    for (const [id, url] of Object.entries(COMPRA_URLS)) {
      expect(ITEMS.some((i) => i.id === id), `${id} no es un Item real`).toBe(true);
      expect(url.startsWith('https://buy.stripe.com/'), `${id}: ${url}`).toBe(true);
      expect(compraUrlDeItem(id)).toBe(url);
    }
  });
});
```

This test is designed to stay meaningful as `COMPRA_URLS` grows across future
sessions (piloto → resto de los 200) without ever needing to change: it
validates structural invariants (real id, real Stripe URL shape), not a fixed
count.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/biblioteca-compra.test.ts`
Expected: FAIL — `Cannot find module '../src/data/biblioteca/compra-urls'`.

- [ ] **Step 3: Create the data file**

Create `src/data/biblioteca/compra-urls.ts`:

```ts
// Mapa id de Item -> Stripe Payment Link, para blueprints comprados sueltos (1,99 €).
// Se rellena incrementalmente a medida que se cablean más ítems. Piloto:
// grupo "Auditoría de tu software" (sw01-sw25). El resto queda pendiente.
export const COMPRA_URLS: Record<string, string> = {};

export function compraUrlDeItem(id: string): string | undefined {
  return COMPRA_URLS[id];
}
```

- [ ] **Step 4: Re-export from `index.ts`**

In `src/data/biblioteca/index.ts`, add near the other helper exports (after
`equipoDeGrupo`):

```ts
export { compraUrlDeItem, COMPRA_URLS } from './compra-urls';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/biblioteca-compra.test.ts`
Expected: PASS (2 tests — the second test loop runs 0 iterations since
`COMPRA_URLS` starts empty, which is a legitimate pass, not a skip).

- [ ] **Step 6: Commit**

```bash
git add src/data/biblioteca/compra-urls.ts src/data/biblioteca/index.ts tests/biblioteca-compra.test.ts
git commit -m "feat(biblioteca): compra-urls.ts — mapa de Payment Links por ítem suelto"
```

---

## Task 3: Cablear el botón "Desbloquear" en `BibliotecaIA.astro`

**Files:**
- Modify: `src/components/BibliotecaIA.astro`

- [ ] **Step 1: Import the helper**

Add `compraUrlDeItem` to the existing import from `'../data/biblioteca'` at
the top of `BibliotecaIA.astro` (alongside `CATALOGOS`, `gruposDeCatalogo`,
etc.):

```ts
import { CATALOGOS, gruposDeCatalogo, itemsDeGrupo, temasDeGrupo, itemsDeTema, equipoDeGrupo, compraUrlDeItem, type CatalogoId, type Item } from '../data/biblioteca';
```

- [ ] **Step 2: Wire the button**

Find the `bib-unlock` anchor (the "Desbloquear" button rendered for paid
items without `cuerpo`):

```astro
                        <a
                          class="bib-unlock lift"
                          href="#"
                          data-stripe={it.id}
                          style="align-self: flex-start; margin-top: auto; padding-top: 4px; font-family: var(--sans); font-weight: 700; font-size: 13px; text-decoration: none; color: var(--accent); background: transparent; border: 1px solid var(--accent); border-radius: 2px; padding: 9px 16px;"
                        >Desbloquear · {eur(it.precio ?? 1.99)}</a>
```

Replace with:

```astro
                        <a
                          class="bib-unlock lift"
                          href={compraUrlDeItem(it.id) || '#'}
                          target={compraUrlDeItem(it.id) ? '_blank' : undefined}
                          rel={compraUrlDeItem(it.id) ? 'noopener' : undefined}
                          data-stripe={it.id}
                          style="align-self: flex-start; margin-top: auto; padding-top: 4px; font-family: var(--sans); font-weight: 700; font-size: 13px; text-decoration: none; color: var(--accent); background: transparent; border: 1px solid var(--accent); border-radius: 2px; padding: 9px 16px;"
                        >Desbloquear · {eur(it.precio ?? 1.99)}</a>
```

(Mirrors the exact `target`/`rel` conditional pattern already used by the
"Contratar equipo" button a few lines above in the same file.)

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: no errors. Since `COMPRA_URLS` is still empty at this point, every
"Desbloquear" button still renders `href="#"` — no visible change yet, which
is correct (nothing is wired until Task 7 populates real URLs).

Run: `npm run test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/BibliotecaIA.astro
git commit -m "feat(biblioteca): cablear el botón Desbloquear a compraUrlDeItem"
```

---

## Task 4: `entrega.astro` — resolver también compras de ítems sueltos

**Files:**
- Modify: `src/pages/entrega.astro`

- [ ] **Step 1: Import `ITEMS`**

In the existing import line:

```astro
import { EQUIPOS, itemsDeGrupo, type Equipo, type Item } from '../data/biblioteca';
```

change to:

```astro
import { EQUIPOS, ITEMS, itemsDeGrupo, type Equipo, type Item } from '../data/biblioteca';
```

- [ ] **Step 2: Replace the `Entrega` type and matching loop**

Replace:

```ts
interface Entrega { equipo: Equipo; items: Item[] }
let estado: 'ok' | 'pendiente' | 'error' = 'error';
const entregas: Entrega[] = [];
```

with:

```ts
type Entrega =
  | { tipo: 'equipo'; equipo: Equipo; items: Item[] }
  | { tipo: 'item'; item: Item };
let estado: 'ok' | 'pendiente' | 'error' = 'error';
const entregas: Entrega[] = [];
```

Replace:

```ts
        for (const li of sesion.line_items?.data ?? []) {
          const slug = li.price?.product?.metadata?.slug;
          const equipo = EQUIPOS.find((e) => e.id === slug);
          if (equipo) entregas.push({ equipo, items: itemsDeGrupo(equipo.catalogo, equipo.grupo) });
        }
```

with:

```ts
        for (const li of sesion.line_items?.data ?? []) {
          const slug = li.price?.product?.metadata?.slug;
          const equipo = EQUIPOS.find((e) => e.id === slug);
          if (equipo) { entregas.push({ tipo: 'equipo', equipo, items: itemsDeGrupo(equipo.catalogo, equipo.grupo) }); continue; }
          const item = ITEMS.find((i) => i.id === slug && i.blueprint);
          if (item) entregas.push({ tipo: 'item', item });
        }
```

- [ ] **Step 3: Update the render to branch on `entrega.tipo`**

Replace:

```astro
        {entregas.map(({ equipo, items }) => (
          <section style="margin-top: 48px;">
            <header style="border-bottom: 1px solid var(--line); padding-bottom: 13px;">
              <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);">{equipo.grupo}</span>
              <h2 style="font-family: var(--serif); font-weight: 400; font-size: 26px; letter-spacing: -0.02em; color: #fff; margin: 8px 0 0;">{equipo.nombre}</h2>
            </header>

            <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 24px;">
              {items.map((it, i) => <BlueprintCard item={it} index={i} />)}
            </div>
          </section>
        ))}
```

with:

```astro
        {entregas.map((entrega) => (
          entrega.tipo === 'equipo' ? (
            <section style="margin-top: 48px;">
              <header style="border-bottom: 1px solid var(--line); padding-bottom: 13px;">
                <span style="font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);">{entrega.equipo.grupo}</span>
                <h2 style="font-family: var(--serif); font-weight: 400; font-size: 26px; letter-spacing: -0.02em; color: #fff; margin: 8px 0 0;">{entrega.equipo.nombre}</h2>
              </header>

              <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 24px;">
                {entrega.items.map((it, i) => <BlueprintCard item={it} index={i} />)}
              </div>
            </section>
          ) : (
            <section style="margin-top: 48px; max-width: 62ch;">
              <BlueprintCard item={entrega.item} />
            </section>
          )
        ))}
```

- [ ] **Step 4: Generalize the copy so it reads correctly for both cases**

Replace `title="Tu equipo de IA | AgentesVA"` with `title="Tu compra | AgentesVA"`.

Replace `description="Entrega de tu compra en AgentesVA: los blueprints completos de tu equipo de IA."` with `description="Entrega de tu compra en AgentesVA: tu blueprint completo, listo para usar."`.

Replace `<h1 ...>Tu equipo de IA está listo</h1>` with `<h1 ...>Tu compra está lista</h1>` (keep the same style attribute, only the text changes).

Replace `Tu pago está confirmado. Aquí tienes cada blueprint completo: qué puede hacer, cómo, y el prompt listo para usar.` with `Tu pago está confirmado. Aquí tienes tu blueprint completo: qué puede hacer, cómo, y el prompt listo para usar.`

Replace `Guarda esta página o tu recibo de Stripe: este enlace es tu acceso al equipo completo.` with `Guarda esta página o tu recibo de Stripe: este enlace es tu acceso a tu compra.`

Replace (in the `'pendiente'` state) `en cuanto Stripe lo confirme, verás aquí tu equipo completo.` with `en cuanto Stripe lo confirme, verás aquí tu compra.`

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: no errors.

Run: `npm run test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/entrega.astro
git commit -m "feat(biblioteca): entrega.astro resuelve también compras de ítems sueltos"
```

---

## Task 5: Crear los 25 Payment Links del piloto en modo TEST

**⚠️ Do not delegate this task to a subagent. Execute directly in the main session.**

**Files:** ninguno de código — solo llamadas a la API de Stripe y verificación manual.

- [ ] **Step 1: Confirmar que la clave de test sigue en Doppler**

```bash
doppler secrets --project agentes-va --config dev --only-names | grep STRIPE_SECRET_KEY_TEST
```

Expected: aparece `STRIPE_SECRET_KEY_TEST`.

- [ ] **Step 2: Crear un script que cree Producto + Precio + Payment Link para cada uno de los 25 ítems**

Los 25 ítems (`sw01`–`sw25`, grupo "Auditoría de tu software") con su
`titulo`/`beneficio` ya están en `src/data/biblioteca/software.ts` — leerlos
de ahí en el script en vez de copiarlos a mano, para evitar cualquier
transcripción incorrecta:

```js
// scratchpad/create-item-payment-links.mjs (no se commitea al repo del proyecto)
import { SOFTWARE } from '../src/data/biblioteca/software.ts'; // ajustar ruta relativa según dónde se ejecute

const KEY = process.env.STRIPE_KEY; // inyectada por el llamador (test o live, ver Step 3 / Task 7)
if (!KEY) { console.error('Falta STRIPE_KEY'); process.exit(1); }

const REDIRECT_BASE = process.argv[2] || 'http://localhost:4321/entrega';
const GRUPO = 'Auditoría de tu software';

async function stripe(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body ? new URLSearchParams(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${json.error?.message}`);
  return json;
}

const items = SOFTWARE.filter((i) => i.grupo === GRUPO);
if (items.length !== 25) throw new Error(`Esperaba 25 ítems, encontré ${items.length}`);

const resultados = [];
for (const it of items) {
  const product = await stripe('POST', '/products', { name: it.titulo, description: it.beneficio, 'metadata[slug]': it.id });
  const price = await stripe('POST', '/prices', { product: product.id, unit_amount: '199', currency: 'eur' });
  const successUrl = `${REDIRECT_BASE}?session_id={CHECKOUT_SESSION_ID}`;
  const link = await stripe('POST', '/payment_links', {
    'line_items[0][price]': price.id,
    'line_items[0][quantity]': '1',
    'after_completion[type]': 'redirect',
    'after_completion[redirect][url]': successUrl,
  });
  resultados.push({ id: it.id, url: link.url });
  console.log(`OK ${it.id} -> ${link.url}`);
}
console.log(JSON.stringify(resultados, null, 2));
```

(Este script vive fuera del repo, en el directorio scratchpad de la sesión —
mismo patrón ya usado para los 10 equipos.)

- [ ] **Step 3: Ejecutar en modo test**

```bash
doppler run --project agentes-va --config dev -- bash -c 'STRIPE_KEY="$STRIPE_SECRET_KEY_TEST" node --experimental-strip-types scratchpad/create-item-payment-links.mjs "http://localhost:4321/entrega"'
```

Expected: 25 líneas `OK swNN -> https://buy.stripe.com/test_...` y un JSON
final con los 25 pares `{id, url}`. Guardar ese JSON en el scratchpad de la
sesión (no en el repo) para el Step siguiente y para el Task 7.

- [ ] **Step 4: Smoke test — UNA compra real en modo test**

Levantar el dev server con la clave de test inyectada:

```bash
doppler run --project agentes-va --config dev -- bash -c 'STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY_TEST" npm run dev'
```

Abrir en el navegador **uno** de los 25 Payment Links de test (por ejemplo el
de `sw01`), completar el checkout con la tarjeta de prueba `4242 4242 4242
4242` (fecha futura, CVC cualquiera, sin marcar la casilla de "AI agent" ya
que la tarjeta la pone un humano), y confirmar que redirige a
`http://localhost:4321/entrega?session_id=...` mostrando:
- El blueprint completo de `sw01` (título, qué puede hacer, pasos, reglas)
- El botón "Copiar prompt" funcionando
- **Sin** cabecera de "equipo" (confirma que la rama `tipo === 'item'` del
  Task 4 se está usando, no la de `'equipo'`)

Si algo falla aquí, es un problema de código (Tasks 1-4) — arreglarlo antes
de seguir a modo live.

---

## Task 6: Confirmar con el usuario antes de crear objetos en modo LIVE

**⚠️ Do not delegate this task to a subagent.**

- [ ] **Step 1:** Mostrar al usuario la lista exacta de los 25 productos que se
      van a crear en modo live (id, título, precio 1,99 €) y pedir
      confirmación explícita antes de ejecutar nada — mismo patrón ya usado
      para los 10 equipos. No proceder sin un "sí, procede" explícito.

---

## Task 7: Crear los 25 Payment Links del piloto en modo LIVE

**⚠️ Do not delegate this task to a subagent. Only proceed after Task 6's explicit confirmation.**

**Files:**
- Modify: `src/data/biblioteca/compra-urls.ts`

- [ ] **Step 1: Confirmar que la clave live-setup sigue en Doppler**

```bash
doppler secrets --project agentes-va --config prd --only-names | grep STRIPE_SECRET_KEY_LIVE_SETUP
```

- [ ] **Step 2: Ejecutar el mismo script en modo live**

```bash
doppler run --project agentes-va --config prd -- bash -c 'STRIPE_KEY="$STRIPE_SECRET_KEY_LIVE_SETUP" node --experimental-strip-types scratchpad/create-item-payment-links.mjs "https://agentesva.com/entrega"'
```

Expected: 25 líneas `OK swNN -> https://buy.stripe.com/...` (sin `test_` en
la URL) y el JSON final con los 25 pares `{id, url}`.

- [ ] **Step 3: Rellenar `compra-urls.ts` con las 25 URLs reales**

Reemplazar en `src/data/biblioteca/compra-urls.ts`:

```ts
export const COMPRA_URLS: Record<string, string> = {};
```

con (usando los 25 pares `{id, url}` reales devueltos en el Step 2 — los
valores de ejemplo abajo NO son reales, hay que sustituirlos por los que
devuelva Stripe):

```ts
export const COMPRA_URLS: Record<string, string> = {
  sw01: '<url real de sw01>',
  sw02: '<url real de sw02>',
  // ... sw03 a sw24 ...
  sw25: '<url real de sw25>',
};
```

- [ ] **Step 4: Verificar**

Run: `npx vitest run tests/biblioteca-compra.test.ts`
Expected: PASS — ahora con 25 iteraciones reales en el segundo test (antes
corría 0).

Run: `npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/biblioteca/compra-urls.ts
git commit -m "feat(biblioteca): cablear los 25 Payment Links del piloto (Auditoría de software)"
```

---

## Task 8: Verificación final

**Files:** ninguno

- [ ] **Step 1:** `npm run test` → todos en verde.
- [ ] **Step 2:** `npm run build` → sin errores.
- [ ] **Step 3:** Smoke visual: abrir `/recurso/biblioteca-ia`, ir a la pestaña
      "Software" → grupo "Auditoría de tu software", confirmar que los 25
      botones "Desbloquear · 1,99 €" ahora abren un Payment Link real de
      Stripe en pestaña nueva (no `#`) — no hace falta completar 25 compras,
      solo confirmar que el `href` ya no es `#` inspeccionando el DOM o
      pasando el ratón por encima.
- [ ] **Step 4:** Recordar al usuario que, tras esto, **todo** el trabajo de
      Stripe pendiente (piloto + housekeeping anterior) está cerrado — es el
      momento de revocar `STRIPE_SECRET_KEY_LIVE_SETUP` desde el dashboard de
      Stripe (a menos que se planee cablear los 175 ítems restantes en la
      misma sesión, en cuyo caso se revoca al terminar eso también).

---

## Self-review (hecho)

- **Cobertura de la spec:** arquitectura de `compra-urls.ts` (Task 2),
  `BlueprintCard.astro` (Task 1), botón `Desbloquear` (Task 3), `entrega.astro`
  con dos tipos de entrega (Task 4), creación test→live de los 25 Payment
  Links con confirmación explícita (Tasks 5-7), verificación final (Task 8). ✔
- **Placeholders:** los pares `{id, url}` reales de Stripe no existen hasta
  ejecutar el script (Tasks 5 y 7) — están marcados explícitamente como "hay
  que sustituir por los reales", no como código final; esto es información
  que solo existe en tiempo de ejecución (igual que el plan original de los
  10 equipos), no un placeholder de pereza. ✔
- **Consistencia de tipos:** `Entrega` (unión `'equipo' | 'item'`),
  `compraUrlDeItem(id: string): string | undefined`, `BlueprintCard` props
  `{ item: Item; index?: number }` se usan igual en todas las tareas que los
  tocan. ✔
