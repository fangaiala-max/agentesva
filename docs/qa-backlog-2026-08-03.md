# Backlog QA — agentesva.com (3 agosto 2026)

Origen: [`.gstack/qa-reports/qa-report-agentesva-com-2026-08-03.md`](../.gstack/qa-reports/qa-report-agentesva-com-2026-08-03.md)
Salud actual: **69/100**

Ordenado **de más fácil a más difícil**. La prioridad va etiquetada aparte, así
que se puede barrer de arriba abajo sin dejar atrás nada crítico: las tres
correcciones de mayor impacto del informe resultaron ser cambios de una línea y
están en el primer bloque.

**Escala de dificultad**

| Nivel | Significado |
|---|---|
| `XS` | Una línea, un dato o una variable de entorno. Menos de 30 min. |
| `S` | Un fichero, lógica acotada. 1–2 h. |
| `M` | Componente nuevo o varios ficheros. Media jornada. |
| `L` | Diseño + código + contenido. 1–3 días. |
| `XL` | Trabajo de producto o negocio, no solo de código. Semanas. |

**Resumen**

| Dificultad | Tareas | De ellas P0 |
|---|---:|---:|
| XS | 6 | 3 |
| S  | 7 | 1 |
| M  | 5 | 2 |
| L  | 2 | 0 |
| XL | 2 | 1 |

---

## XS — empezar por aquí

### ~~AGV-01 · Definir `PUBLIC_GA4_ID` en Vercel~~ ✅ HECHO (3 ago 2026)
**Prioridad:** P0 · **Dificultad:** XS · **Código:** ninguno · Ref: ISSUE-005

**Verificado en producción:** `G-87SBNWCTWZ` (propiedad GA4 ya existente,
ID 531435443 — no se creó una duplicada). Variable puesta en Production,
Preview y Development; redeploy hecho.

Comprobación independiente sobre agentesva.com:
- El ID aparece inlineado en el bundle `ConsentBanner…huI-kWCH.js` (antes `BK3wNrLr`), así que el build nuevo está sirviéndose.
- Banner visible en sesión limpia (`position: fixed`, 125 px de alto, botones Aceptar / Rechazar).
- **Antes de elegir:** cero peticiones a Google.
- **Tras Aceptar:** `googletagmanager.com/gtag/js?id=G-87SBNWCTWZ` y `agv-consent = granted`.

El embudo ya se puede medir. A partir de ahora las demás tareas son validables
con datos en vez de por intuición.

> Pendiente menor detectado al verificar: el texto del banner dice «Podés
> aceptarlas o rechazarlas» (voseo), mientras que el resto del sitio tutea
> («Llévate el pack», «tu negocio», «Suscríbete», «Prueba otra palabra»). Para
> un público España + LATAM conviene unificar en tuteo. Ver AGV-23.

Hoy no hay analítica en producción. `ConsentBanner.astro:5` solo renderiza si
existe la variable, así que ni sale el banner ni carga GA4. El código de Consent
Mode v2 en `src/scripts/consent.ts` es correcto y cumple RGPD, simplemente nunca
se ejecuta.

- [ ] Crear propiedad GA4 y copiar el ID de medición
- [ ] `vercel env add PUBLIC_GA4_ID production` (y preview)
- [ ] Redeploy y verificar que el banner aparece y que `gtag` carga tras aceptar

**Hecho cuando:** en una sesión nueva sale el banner, al aceptar se ve la
petición a `googletagmanager.com`, y al rechazar no se ve ninguna.

> Va la primera aunque no sea la más grave: sin esto no se puede validar ninguna
> de las demás.

---

### AGV-02 · Arreglar el FAQ sin puntuación
**Prioridad:** P1 · **Dificultad:** XS · **Código:** 1 línea · Ref: ISSUE-006

`src/data/tools.ts:40`

```ts
{ q: `¿Cómo empiezo a usar ${tool.name}?`, a: tool.steps.join(' ') }
```

`steps.join(' ')` pega los tres pasos sin puntuación: *"Entra en claude.ai y
regístrate Sube tu documento o pega el texto Pídele un resumen"*. Cambiar a un
join que cierre cada paso con punto, contemplando los pasos que ya terminan en
signo de puntuación.

- [ ] Cambiar el join en `tools.ts:40`
- [ ] Revisar 3–4 fichas con pasos que ya acaban en punto o interrogación

**Hecho cuando:** las 54 fichas y su JSON-LD de `FAQPage` devuelven frases
gramaticales. Arregla a la vez la página y los datos estructurados que consumen
Google y los asistentes de IA.

---

### AGV-03 · Tokenizar la búsqueda de la home
**Prioridad:** P0 · **Dificultad:** XS · **Código:** 1 línea · Ref: ISSUE-001

`src/scripts/home.ts:80`

```ts
(!q || fold(card.dataset.search || '').includes(q));
```

`includes(q)` exige que la frase completa aparezca literal. Por eso
`automatizar WhatsApp` da 0 y `crear vídeos` da 0, que son justo los ejemplos
que sugiere el propio placeholder. Partir `q` por espacios y exigir que **todas**
las palabras estén presentes.

- [ ] Partir la consulta en palabras y usar `every()`
- [ ] Comprobar que `whatsapp` sigue dando 5 y que `automatizar WhatsApp` ya da 5

**Hecho cuando:** los tres ejemplos del placeholder (`chatbot`,
`automatizar WhatsApp`, `crear vídeos`) devuelven resultados.

---

### AGV-04 · Tokenizar la búsqueda de /herramientas
**Prioridad:** P0 · **Dificultad:** XS · **Código:** 1 línea · Ref: ISSUE-001

`src/scripts/directory.ts:36` — mismo `hay.includes(q)`, mismo arreglo. Son dos
motores distintos que comparten `fold()`; conviene extraer el predicado a una
función compartida en `directory.ts` y que `home.ts` la importe, como ya hace
con `fold`.

- [ ] Extraer `matchesQuery(hay, q)` a `directory.ts`
- [ ] Importarla desde `home.ts` (elimina la duplicación de AGV-03)

**Hecho cuando:** las dos búsquedas se comportan igual ante la misma consulta.

---

### AGV-23 · Unificar el tratamiento a tuteo en el banner de consentimiento
**Prioridad:** P2 · **Dificultad:** XS · Detectado al verificar AGV-01

El banner dice «Podés aceptarlas o rechazarlas» (voseo rioplatense); el resto
del sitio tutea de forma consistente. Cambiar a «Puedes aceptarlas o
rechazarlas» en `src/components/ConsentBanner.astro`.

**Hecho cuando:** no queda ninguna forma de voseo en la interfaz.

---

### AGV-05 · Actualizar el destino de `/ir/chatgpt`
**Prioridad:** P2 · **Dificultad:** XS · **Código:** dato · Ref: ISSUE-004

Apunta a `chat.openai.com`, que quedó obsoleto. Cambiar a `chatgpt.com` en
`src/content/tools/chatgpt.json`.

**Hecho cuando:** `curl -sI https://agentesva.com/ir/chatgpt` devuelve el dominio nuevo.

---

### AGV-06 · Renderizar los contadores con su valor final
**Prioridad:** P2 · **Dificultad:** XS · Ref: ISSUE-015

`src/pages/index.astro:358,364,372` emiten `<span data-count="50">0</span>`. La
animación funciona bien, pero si JS falla o tarda, se lee *"+0 negocios
suscritos"* justo encima del formulario. Renderizar el valor final y animar
desde él como mejora progresiva.

**Hecho cuando:** con JS desactivado, la banda muestra 50 / 30 / 1.200.

---

## S — una tarde

### AGV-07 · Mapa de intención → categoría en la búsqueda
**Prioridad:** P0 · **Dificultad:** S · Ref: ISSUE-001

Con AGV-03/04 hechos, siguen fallando las consultas por tarea porque nadie
escribe el nombre de la categoría: `facturas`, `atender clientes`,
`contestar mensajes`, `crear imágenes`, `redes sociales`, `excel`,
`presupuestos`, `contabilidad`. Añadir un diccionario de sinónimos que amplíe
`data-search` en tiempo de build.

- [ ] Diccionario `intent → [categorías, términos]` en `src/data/`
- [ ] Inyectarlo en el `data-search` de `ToolCard.astro`
- [ ] Cubrir las 10 categorías con 5–8 sinónimos cada una

**Hecho cuando:** las 8 consultas fallidas del informe devuelven resultados
relevantes. Es el segmento de mayor intención de compra (28 de 100).

---

### AGV-08 · Estado vacío que proponga
**Prioridad:** P1 · **Dificultad:** S · Ref: ISSUE-001

Hoy dice *"Prueba otra palabra o quita algún filtro"* y ahí muere. Ofrecer las
categorías más buscadas, 3 herramientas destacadas y los estudios relacionados.

**Hecho cuando:** desde una búsqueda sin resultados se puede seguir navegando sin volver atrás.

---

### AGV-09 · Subir la escala tipográfica
**Prioridad:** P1 · **Dificultad:** S · Ref: ISSUE-007

Medido en la home: descripciones de ficha a 13,5 px, prueba social a 11 px,
etiquetas de sección a 10 px. El público tiene 35–60 años.

- [ ] Descripciones de `ToolCard` a 15–16 px
- [ ] Etiquetas y secundarios, mínimo 14 px
- [ ] Ticker y eyebrows, mínimo 12 px

**Ojo:** el contraste ya cumple AA en todo (mínimo 4,56:1). Aquí solo se toca
tamaño, no color.

---

### AGV-10 · Flechas en los carruseles
**Prioridad:** P1 · **Dificultad:** S · Ref: ISSUE-008

Los tres estantes (`Destacadas`, `Gratis y freemium`, `Mejor valoradas`) miden
2.432 px dentro de 1.176 px visibles: **1.256 px ocultos, el 52 %**, sin ninguna
señal. Añadir botones anterior/siguiente, o pasar a rejilla que envuelve.

**Hecho cuando:** se puede llegar a las 8 fichas de cada estante sin gesto horizontal.

---

### AGV-11 · Tests de regresión
**Prioridad:** P1 · **Dificultad:** S · Ref: TESTING.md

- [ ] `matchesQuery()` — multipalabra, tildes, orden, vacío
- [ ] `toolFaq()` — que el join produzca frases con puntuación
- [ ] Caso concreto: `automatizar WhatsApp` devuelve las 5 de WhatsApp

Lógica pura, sin navegador. Encaja con la meta de cobertura del proyecto.

---

### AGV-12 · Medida y escala en los estudios
**Prioridad:** P1 · **Dificultad:** S · Ref: ISSUE-012

87 caracteres por línea (óptimo 50–75) y 7 tamaños distintos en un mismo
artículo. Limitar el cuerpo a ~70ch y reducir a 4 tamaños.

La redacción no se toca: Fernández-Huerta 80,8 («Fácil») ya está bien calibrada.

---

### AGV-13 · Limpiar las respuestas de plantilla del FAQ
**Prioridad:** P2 · **Dificultad:** S · Ref: ISSUE-006

En `src/data/tools.ts`: la respuesta 1 duplica literalmente el párrafo *Qué es*
(penaliza en SEO), y la 3 sale como *"Ideal para Servicios profesionales."*, con
mayúscula suelta a media frase.

---

## M — media jornada

### AGV-14 · Menú móvil
**Prioridad:** P0 · **Dificultad:** M · Ref: ISSUE-002

No existe ningún hamburguesa en el sitio. El `<nav>` de `SiteHeader.astro` mide
479 px y no colapsa nunca.

| Ancho | scrollWidth | «Pack gratis» |
|---|---:|---|
| 320 / 360 / 390 / 414 px | 511 | fuera de pantalla |
| 768 px | 768 | visible |

- [ ] Hamburguesa por debajo de 768 px en `SiteHeader.astro`
- [ ] Panel accesible: foco atrapado, `Esc` cierra, `aria-expanded`
- [ ] Verificar `document.scrollWidth === window.innerWidth` a 320 px

**Hecho cuando:** no hay desplazamiento horizontal en ningún ancho de teléfono y
«Pack gratis» es alcanzable. Es la tarea de mayor impacto del backlog: afecta a
la mayoría del tráfico de pymes.

---

### AGV-15 · Objetivos táctiles a 44×44
**Prioridad:** P1 · **Dificultad:** M · Ref: ISSUE-002

92 elementos por debajo del mínimo a 390 px (los enlaces de nav miden 33 px de
alto). Parte se resuelve sola con AGV-14; el resto son botones de guardar y
comparar de las fichas.

---

### AGV-16 · Resolver los dos CTA de pack duplicados
**Prioridad:** P1 · **Dificultad:** M · Ref: ISSUE-009

Se renderizan a la vez el banner amarillo en línea y la barra fija, ambos con
«Conseguir gratis →», y la barra fija tapa el encabezado de *Explora por
objetivo*. Dejar uno, y que la barra fija aparezca solo tras cierto scroll.

---

### AGV-17 · Poblar `affiliateUrl`
**Prioridad:** P0 · **Dificultad:** M · **Código: ya está hecho** · Ref: ISSUE-004

`src/pages/ir/[slug].ts` ya resuelve `tool.data.affiliateUrl || tool.data.url`.
El esquema lo admite. **0 de 54 herramientas tienen el campo puesto**, así que
las 39 salidas por cada 100 visitantes no generan nada.

- [ ] Alta en los programas disponibles (Make, Zapier, ManyChat, Landbot, Tidio, Jasper, HubSpot, Canva, Surfer)
- [ ] Rellenar `affiliateUrl` en los JSON correspondientes
- [ ] Verificar con `curl -sI /ir/<slug>` que el 302 lleva el parámetro

**La dificultad es de gestión, no de código:** son altas y aprobaciones. Es la
única tarea del backlog que convierte tráfico existente en ingresos sin cambiar
el producto.

---

### AGV-18 · Unificar las dos búsquedas
**Prioridad:** P2 · **Dificultad:** M · Ref: ISSUE-010, ISSUE-011

La del hero busca **solo herramientas** (motor propio). La de ⌘K busca todo
(Pagefind, `src/scripts/search.ts:114`). Por eso `facturas` da 0 arriba y 4 en
el modal, y `atención al cliente` da 0 pese a existir un estudio y una skill de
pago sobre ese tema. Además Pagefind falla con frases sin tilde:
`atencion al cliente` → 0, `atención al cliente` → 7.

Decidir: o el hero busca todo el sitio, o se etiqueta explícitamente su alcance.

---

## L — de uno a tres días

### AGV-19 · Enriquecer las fichas
**Prioridad:** P1 · **Dificultad:** L · Ref: ISSUE-004, ISSUE-014

Falta lo que decide una compra: precio real en € y no solo «Freemium», captura
de la herramienta, y fecha de última revisión (el ticker dice «actualizado hoy»,
pero la ficha no lo acredita). Son 54 fichas.

---

### AGV-20 · Búsqueda sin tildes en Pagefind
**Prioridad:** P2 · **Dificultad:** L · Ref: ISSUE-010

Pagefind normaliza bien palabra suelta pero no frases sin tilde. Requiere
configurar la indexación o preprocesar la consulta. En español móvil, escribir
sin tildes es lo habitual.

---

## XL — producto y negocio

### AGV-21 · Un producto de pago que encaje con el público
**Prioridad:** P0 (negocio) · **Dificultad:** XL · Ref: ISSUE-013

Lo único comprable hoy es *«Curso: Seguridad de LLMs (prompt injection)»*, 19 €,
a tres clics y para desarrolladores. La home atrae a dueños de pymes que quieren
vender más por WhatsApp y atender clientes sin estar delante.

Un pack de 19–39 € sobre eso encaja con el tráfico que ya llega. **Mientras no
exista, el techo del embudo es 1 compra por cada 100 visitantes**, hagas lo que
hagas con el resto del backlog.

---

### AGV-22 · Cadencia de noticias
**Prioridad:** P2 · **Dificultad:** XL (continuo) · Ref: ISSUE-014

7 artículos en `/noticias` para una sección posicionada como medio de IA, con un
ticker que dice «actualizado hoy». O se sostiene una cadencia, o se replantea la
promesa.

---

## Orden sugerido de ataque

**Semana 1 — todo XS + los S de búsqueda.** AGV-01, 03, 04, 02, luego 07 y 11.
Son cuatro cambios de una línea y un diccionario: arreglan el defecto que corta
al segmento de mayor intención y dejan el sitio medido.

**Semana 2 — el móvil.** AGV-14 y 15, luego 09 y 16. Es la mitad del tráfico.

**En paralelo desde hoy — AGV-17.** Las altas de afiliados tardan en aprobarse;
cuanto antes se envíen, antes empiezan a contar los clics que ya se están
produciendo.

**Cuando haya datos — AGV-21.** Con AGV-01 hecho, en 2–3 semanas se sabrá qué
categorías traen tráfico real y el producto se podrá elegir con datos en vez de
por intuición.
