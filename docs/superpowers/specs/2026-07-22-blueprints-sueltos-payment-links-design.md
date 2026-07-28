# Blueprints sueltos (1,99 €) — Payment Links individuales — diseño

**Fecha:** 2026-07-22
**Estado:** Aprobado — pendiente de plan de implementación
**Autor:** Fernando + Claude

## Objetivo

Cablear la compra individual de blueprints (1,99 € cada uno) de la Biblioteca
de IA, que quedó deliberadamente diferida en el lanzamiento original (PR #126):
solo los 10 "equipos" (bundles, 3,99 €) son comprables hoy; los botones
"Desbloquear · 1,99 €" de cada ítem suelto siguen apuntando a `href="#"`.

**Alcance de esta spec: un PILOTO de 25 ítems** (el grupo "Auditoría de tu
software", `sw01`–`sw25`) para validar el diseño end-to-end (datos → Stripe →
entrega) antes de comprometerse a los 200. Si el piloto funciona, extender a
los 175 ítems restantes es repetir el mismo script sin cambios de diseño —
explícitamente fuera de esta spec (ver "Fuera de alcance").

## Arquitectura

### 1. Los datos de contenido NO se tocan

`src/data/biblioteca/software.ts` y `growth.ts` (200 ítems ya revisados y con
tests que pasan) se quedan exactamente igual. En vez de añadir `compraUrl` a
cada uno de los 200 objetos `Item`, el enlace de compra vive en un mapa
aislado y nuevo:

**`src/data/biblioteca/compra-urls.ts`**
```ts
// Mapa id de Item -> Stripe Payment Link, para blueprints comprados sueltos (1,99 €).
// Se rellena incrementalmente a medida que se cablean más ítems (piloto:
// grupo "Auditoría de tu software", sw01-sw25; el resto queda pendiente).
export const COMPRA_URLS: Record<string, string> = {
  sw01: 'https://buy.stripe.com/...',
  // ...
};

export function compraUrlDeItem(id: string): string | undefined {
  return COMPRA_URLS[id];
}
```

Re-exportado desde `src/data/biblioteca/index.ts` junto a los demás helpers,
para que se importe igual que `itemsDeGrupo`/`equipoDeGrupo`
(`import { compraUrlDeItem } from '../data/biblioteca'`).

**Por qué así y no un campo en `Item`:** aísla una preocupación operativa
("¿qué está cableado en Stripe hoy?") de una de contenido ("¿qué dice el
blueprint?"), que cambian a ritmos distintos — el contenido ya está fijado y
testeado; los enlaces de compra se añadirán en varias tandas. Evita también
editar a mano 200 objetos JSON-like ya extensos.

### 2. Botón "Desbloquear" en `BibliotecaIA.astro`

Cambia de `href="#"` a `href={compraUrlDeItem(it.id) || '#'}`, con el mismo
patrón `target`/`rel` condicional que ya usa el botón "Contratar equipo"
(abre en pestaña nueva solo si hay URL real).

### 3. `BlueprintCard.astro` — extracción para no duplicar markup

Hoy `src/pages/entrega.astro` solo entrega equipos (un grupo completo de
ítems). Para poder entregar también un ítem suelto sin duplicar el markup de
la ficha de blueprint (título, qué puede hacer, modo, pasos, reglas, botón
copiar — ~35 líneas), se extrae a un componente nuevo:

**`src/components/BlueprintCard.astro`** — props `{ item: Item; index?: number }`.
Render idéntico al que ya existe inline en `entrega.astro` hoy; `index` es
opcional (se omite el número "01" cuando se entrega un único ítem suelto).

### 4. `entrega.astro` — resolver también ítems sueltos, no solo equipos

Se añade un segundo tipo de entrega, discriminado por `tipo`:

```ts
type Entrega =
  | { tipo: 'equipo'; equipo: Equipo; items: Item[] }
  | { tipo: 'item'; item: Item };
```

En el bucle que recorre `line_items` de la sesión de Stripe verificada:

```ts
for (const li of sesion.line_items?.data ?? []) {
  const slug = li.price?.product?.metadata?.slug;
  const equipo = EQUIPOS.find((e) => e.id === slug);
  if (equipo) { entregas.push({ tipo: 'equipo', equipo, items: itemsDeGrupo(equipo.catalogo, equipo.grupo) }); continue; }
  const item = ITEMS.find((i) => i.id === slug && i.blueprint);
  if (item) entregas.push({ tipo: 'item', item });
}
```

(`ITEMS` ya se exporta desde `../data/biblioteca`, solo hace falta importarlo
en `entrega.astro`.) El guardado `&& i.blueprint` evita que un slug erróneo
resuelva accidentalmente a un prompt gratis (que no tiene `blueprint`).

El render se bifurca por `entrega.tipo`: para `'equipo'` se mantiene la
cabecera con el nombre del grupo/equipo + la lista de `<BlueprintCard>`; para
`'item'` se renderiza un único `<BlueprintCard item={entrega.item} />` sin
cabecera de equipo.

**Copy genérico:** el título de éxito pasa de "Tu equipo de IA está listo" a
"Tu compra está lista", y el texto de apoyo de "Aquí tienes cada blueprint
completo..." a "Aquí tienes tu blueprint completo..." — frases que funcionan
igual de bien para 1 ítem que para los 25 de un equipo. Mismo criterio para
el `<BaseLayout title=... description=...>` y la nota final de "guarda esta
página".

## Creación de los Payment Links del piloto (25 ítems)

Mismo patrón de scripting ya usado y probado para los 10 equipos (Fase 4 de
la Biblioteca): un script Node que crea Producto (nombre = `item.titulo`,
descripción = `item.beneficio`, `metadata.slug = item.id`) + Precio (199
céntimos, EUR) + Payment Link (redirect a
`.../entrega?session_id={CHECKOUT_SESSION_ID}`) por cada uno de los 25 ítems
`sw01`–`sw25`.

Se reutilizan las claves de Stripe ya existentes en Doppler
(`STRIPE_SECRET_KEY_TEST` en `dev`, `STRIPE_SECRET_KEY_LIVE_SETUP` en `prd`) —
mismo procedimiento de seguridad ya validado: crear primero en modo test,
hacer una compra real de prueba con tarjeta 4242 y confirmar que `/entrega`
resuelve el ítem individual correctamente, y solo entonces replicar en modo
live. La clave live se revoca al terminar TODO el trabajo pendiente (incluido
este), no antes.

## Testing (objetivo 100% cobertura)

`tests/biblioteca-compra.test.ts` (nuevo):
- `compraUrlDeItem` devuelve `undefined` para un id que no está en el mapa.
- Para cada id presente en `COMPRA_URLS`, `compraUrlDeItem` devuelve
  exactamente esa URL, y la URL empieza por `https://buy.stripe.com/`.
- Cada clave de `COMPRA_URLS` corresponde a un `Item.id` real (usando `ITEMS`
  de `./index`) — atrapa typos de id.

`entrega.astro` y `BibliotecaIA.astro` no tienen tests unitarios (son
plantillas Astro; mismo patrón ya establecido) — se verifican con
`npm run build` + `grep` sobre el HTML generado, y una compra de prueba real
en modo test (smoke manual), igual que se hizo para los equipos.

## Fuera de alcance

- **Los 175 ítems restantes** (todo excepto el grupo "Auditoría de tu
  software"): una vez validado el piloto, es repetir el mismo script de
  creación de Payment Links con la lista de ítems de cada grupo restante y
  añadir sus entradas a `COMPRA_URLS` — sin cambios de diseño ni de código
  adicionales. Se hará en una sesión de seguimiento, no bloquea esta.
- Combinar la compra de un ítem suelto + el resto de su equipo en un único
  flujo de "completa tu equipo" (descuento por lo ya comprado, etc.) — no
  pedido, no se construye.
- Revocar `STRIPE_SECRET_KEY_LIVE_SETUP` — pendiente aparte, se hace cuando
  todo el trabajo de Stripe esté cerrado (piloto + resto).
