# Diseño: Simplificación del Buyer Journey — AgentesVA

**Fecha:** 2026-04-12  
**Estado:** Aprobado  
**Enfoque elegido:** B — Refactoring del catálogo como funnel principal

---

## Contexto

El sitio AgentesVA tiene una estructura de compra confusa con dos tiendas paralelas:
- Agentes individuales en `/catalogo/` ($29/$47/$97 por agente)
- Planes de setup en `/precios/` ($19/$49/$97)

El número $97 aparece en ambos con significados distintos, generando abandono. El flujo actual requiere hasta 10 pasos para completar una compra.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Producto principal | Setup service ($19/$49/$97) |
| Agentes individuales | Eliminados como producto primario; incluidos en todos los planes |
| Punto de entrada del funnel | Selector de industria |
| Agentes gratis | Visibles como "Demo gratis", sin precio — requieren plan para instalar |
| Power users (solo blueprint) | Línea secundaria al fondo de la página, no CTA principal |

---

## Cambios por página

### 1. Home (`/index.html`)

**CTA principal:** Cambia de `"Ver los 42 agentes →"` a `"Automatiza tu negocio →"` (mantiene href a `/catalogo/`)

**Nuevo bloque debajo del hero:** Industry pills — atajos directos al catálogo con industria preseleccionada:
```
🏥 Consultorio  🍽️ Restaurante  🛍️ Ecommerce  ✂️ Salón  🏠 Inmobiliaria  + 7 más →
```
Cada pill enlaza a `/catalogo/#industria-[slug]` (ej: `/catalogo/#industria-consultorio`).  
El catálogo leerá este hash al cargar y activará automáticamente el tile correspondiente en el Paso 1.

---

### 2. Catálogo (`/catalogo/index.html`) — cambio principal

El catálogo se transforma en un funnel de 3 pasos secuenciales en una sola página.

#### Paso 1 — ¿Qué tipo de negocio tienes?
- Grid de tiles de industria (ya existe, se mantiene el diseño actual)
- Al seleccionar una industria, hace scroll suave al Paso 2 y filtra los agentes
- **Nueva lógica JS:** Al cargar la página, leer `window.location.hash`. Si el hash es `#industria-[slug]` (ej: `#industria-consultorio`), activar ese tile automáticamente y hacer scroll al Paso 2. Usar el mapeo existente de `biz-tile` slugs.

#### Paso 2 — Tus agentes recomendados
- Muestra 3-5 agentes más relevantes para la industria seleccionada
- Cada card muestra: emoji, nombre, descripción breve
- Badge verde **"Incluido en tu plan"** reemplaza el precio en todos los agentes de pago
- Agentes demo muestran badge gris **"Demo gratis"** con ícono de candado abierto
- Link secundario: "Ver los 42 agentes →" — llama a la función JS existente `showAllAgents()` que ya existe en el catálogo, muestra el grid completo sin filtro
- Al hacer click en una card → modal actualizado (ver abajo)

#### Paso 3 — ¿Cuánta ayuda necesitas?
- Sección fija debajo de los agentes, con anchor `#setup`
- Los 3 tiers presentados como cards comparativas:

| Tier | Precio | Label | CTA | Stripe link |
|---|---|---|---|---|
| Lo hago yo | $19 | — | "Empezar →" | `buy.stripe.com/cNi14ngtc171gN00TEfn000` |
| Con ayuda | $49 | "MÁS POPULAR" | "Reservar sesión →" | `buy.stripe.com/5kQbJ1b8S4jd8gu59Ufn001` |
| Full Service | $97 | — | "Quiero Full Service →" | `buy.stripe.com/8x27sLccW17100231MfnO02` |

- Línea de texto secundaria al fondo: *"¿Ya usas Make.com y solo necesitas el blueprint? → Descarga individual desde $19"* — link a `/precios/` (que se mantiene como página secundaria para power users)

---

### 3. Modal de agente (actualización)

Cuando el usuario hace click en una card del Paso 2:
- **Eliminar:** precio individual, botón de compra individual, opciones "simple/avanzado"
- **Agregar:** badge "Incluido en tu plan" (verde) o "Demo gratis" (gris según tipo)
- **CTA principal del modal:** "Elegir mi setup ↓" — hace `scrollIntoView` al Paso 3 y cierra el modal
- **Agentes demo:** botón "Ver blueprint de muestra" (puede abrir PDF preview o descripción ampliada)

---

### 4. Página `/precios/`

Se mantiene como página secundaria para power users (usuarios que ya conocen Make.com y solo quieren el blueprint). No se redirige.

Cambios:
- Actualizar el hero copy: de "3 formas de automatizar" a "Blueprints individuales — para quienes ya usan Make.com"
- Agregar link de retorno al catálogo: *"¿Prefieres que te ayudemos? → Ver planes con setup incluido"* → `/catalogo/#setup`
- Mantener los Stripe links de setup ($19/$49/$97) como referencia, pero marcarlos como secundarios frente a los del catálogo

---

### 5. Footer — fix links rotos (todas las páginas)

Los footers contienen `<a>` anidados inválidos generados por un bug de templating:
```html
<!-- Actual (inválido) -->
<li><a href="/catalogo/#todos">Agentes B<a href="/catalogo/">Agentes Básicos</a>ásicos IA — $29</a></li>

<!-- Correcto -->
<li><a href="/catalogo/">Agentes Básicos IA</a></li>
```

Actualizar los 3 links rotos en el footer de las **23 páginas HTML**:
- `Agentes Básicos IA — $29` → `<a href="/catalogo/">Agentes Básicos IA</a>`
- `Agentes Estándar IA — $47` → `<a href="/catalogo/">Agentes Estándar IA</a>`
- El texto de pricing ($29/$47/$97) se elimina del footer (ya no es relevante con el nuevo modelo)

---

## Flujo completo post-cambios

```
Home
  → CTA "Automatiza tu negocio →" ──────────────────→ /catalogo/
  → Industry pill (ej: 🏥 Consultorio) ─────────────→ /catalogo/#industria-consultorio

/catalogo/  [FUNNEL PRINCIPAL]
  Paso 1: Selecciona industria
  Paso 2: Ve 3-5 agentes recomendados
           → Click en card → Modal (info + "Elegir mi setup ↓")
  Paso 3: Elige setup ($19 / $49 / $97)
           → Stripe checkout → /gracias/
  (pie de página) "¿Solo el blueprint?" → /precios/

/precios/  [SECUNDARIO — power users]
  → Blueprints individuales para usuarios Make.com avanzados
  → Link de regreso: "Ver planes con setup" → /catalogo/#setup
```

---

## Páginas afectadas

| Página | Tipo de cambio |
|---|---|
| `/index.html` | CTA + industry pills |
| `/catalogo/index.html` | Refactoring mayor (3 pasos + modal) |
| `/precios/index.html` | Meta refresh + canonical |
| 23 páginas (todos los footers) | Fix links rotos |

---

## Lo que NO cambia

- Páginas de industria individuales (`/catalogo/restaurante/`, etc.)
- Página `/gracias/` y `/gracias-gratis/`
- Páginas `/servicios/`, `/como-funciona/`, `/faq/`, `/legal/`
- Links de Stripe existentes
- Diseño visual (colores, tipografía, dark theme)
- SEO on-page (títulos, meta descriptions, sitemap)
