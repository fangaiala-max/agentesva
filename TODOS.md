# TODOS

## QA

Fuente principal: [backlog QA de agosto de 2026](docs/qa-backlog-2026-08-03.md), con prompts operativos en [docs/qa-backlog-prompts-cowork.md](docs/qa-backlog-prompts-cowork.md). El informe original registró una salud de 69/100.

### AGV-17 · Poblar enlaces de afiliado

**What:** Completar `affiliateUrl` para las 54 herramientas del catálogo.

**Why:** El redirector ya soporta afiliación, pero ninguna herramienta puede monetizar ese flujo mientras los enlaces estén vacíos.

**Context:** Las altas están en curso y `/ir/[slug].ts` ya contiene el soporte técnico necesario.

**Effort:** L
**Priority:** P0
**Depends on:** Aprobación de los programas de afiliación

### AGV-21 · Definir un producto de pago

**What:** Diseñar un producto de pago alineado con el público de AgentesVA.

**Why:** El sitio necesita una oferta propia que complemente afiliación, recursos y newsletter.

**Context:** Debe encajar con PyMEs y autónomos hispanohablantes y validarse antes de ampliar catálogo o producción.

**Effort:** XL
**Priority:** P0
**Depends on:** Validación de disposición a pagar

### AGV-12 · Mejorar la medida de los estudios

**What:** Limitar la longitud de línea del contenido de `/estudios`.

**Why:** Una medida excesiva reduce legibilidad y comprensión en pantallas amplias.

**Context:** Hallazgo de la auditoría QA de agosto de 2026.

**Effort:** S
**Priority:** P1
**Depends on:** None

### AGV-16 · Resolver CTA duplicados del pack

**What:** Unificar o jerarquizar las llamadas a la acción repetidas del pack gratuito.

**Why:** CTA equivalentes compiten entre sí y diluyen la acción principal.

**Context:** Revisar la portada y las barras o bloques persistentes relacionados con el pack.

**Effort:** M
**Priority:** P1
**Depends on:** None

### AGV-19 · Publicar precios reales

**What:** Completar y verificar los precios mostrados en las fichas de herramientas.

**Why:** Los datos de precio incompletos reducen la utilidad de las comparativas y la confianza editorial.

**Context:** Requiere contrastar cada ficha con la fuente oficial correspondiente.

**Effort:** L
**Priority:** P1
**Depends on:** Revisión de fuentes oficiales

### AGV-13 · Sustituir respuestas de plantilla del FAQ

**What:** Reescribir las respuestas genéricas o repetidas de preguntas frecuentes.

**Why:** Respuestas específicas mejoran utilidad, credibilidad y cobertura de intención de búsqueda.

**Context:** El FAQ ya muestra puntuaciones reales; falta elevar la calidad editorial de sus respuestas.

**Effort:** L
**Priority:** P2
**Depends on:** None

### AGV-18 · Unificar las dos búsquedas

**What:** Compartir comportamiento y criterios entre los dos sistemas de búsqueda del sitio.

**Why:** Implementaciones separadas pueden producir resultados distintos para la misma consulta.

**Context:** La búsqueda ya tokeniza términos y reconoce sinónimos; la siguiente mejora es consolidar ambas rutas.

**Effort:** L
**Priority:** P2
**Depends on:** None

### AGV-20 · Normalizar tildes en Pagefind

**What:** Conseguir que Pagefind encuentre resultados con independencia de las tildes introducidas.

**Why:** Las personas esperan que consultas como “video” y “vídeo” produzcan resultados equivalentes.

**Context:** La búsqueda del directorio ya es insensible a tildes, pero Pagefind mantiene una experiencia distinta.

**Effort:** M
**Priority:** P2
**Depends on:** None

### AGV-22 · Establecer cadencia de noticias

**What:** Definir y sostener una frecuencia editorial para `/noticias`.

**Why:** La regularidad evita periodos largos sin contenido y hace fiables las señales de actualidad.

**Context:** Debe coordinarse con el workflow diario y la revisión humana previa a publicación.

**Effort:** L
**Priority:** P2
**Depends on:** Capacidad editorial

### AGV-23 · Revisar el voseo del consentimiento

**What:** Adaptar el texto del banner de consentimiento a la voz lingüística aprobada.

**Why:** Una variante inconsistente rompe la uniformidad del tono de marca.

**Context:** Hallazgo incorporado al backlog QA actualizado de 23 tareas.

**Effort:** S
**Priority:** P2
**Depends on:** Criterio editorial de marca

## Newsletter

Fuente: `docs/superpowers/specs/2026-06-21-agentesva-newsletter-business-brief.md`.

### Secuencia de bienvenida en Brevo

**What:** Crear el email de entrega del lead magnet y una secuencia de 3 a 5 emails de onboarding.

**Why:** La secuencia convierte una suscripción puntual en una relación editorial recurrente.

**Context:** Debe respetar el consentimiento registrado y la propuesta de valor de la newsletter.

**Effort:** L
**Priority:** P1
**Depends on:** Lead magnet definitivo

### Programa de referidos

**What:** Incorporar un sistema de referidos similar a SparkLoop.

**Why:** Un incentivo de recomendación puede acelerar el crecimiento orgánico de la lista.

**Context:** Retomar cuando la newsletter tenga suficiente volumen y una cadencia estable.

**Effort:** XL
**Priority:** P2
**Depends on:** Tracción inicial de la newsletter

### Subángulo anti-incumbente

**What:** Definir una voz y un formato diferenciados frente a “IA en Español”.

**Why:** Una posición editorial reconocible evita competir únicamente por volumen con una lista de 50.000 suscriptores.

**Context:** Validar el enfoque después de observar respuesta y retención de las primeras ediciones.

**Effort:** M
**Priority:** P3
**Depends on:** Datos de adopción de la newsletter

## Noticias

Fuente: revisión de `/ship` de `v0.3.2.0`, rama `design/noticias-tipografia`.

### Evitar distintivos de frescura congelados

**What:** Recalcular “Nuevo” y “Tendencia” sin depender exclusivamente de un nuevo deploy.

**Why:** Tras varios días sin despliegue, una píldora puede seguir afirmando que una noticia es reciente cuando ya no lo es.

**Context:** El pulso verde ya comprueba la fecha real, pero los distintivos siguen calculándose durante el build. Opciones: cron diario de Vercel o cálculo cliente desde el `datetime` de cada `<time>`.

**Effort:** M
**Priority:** P1
**Depends on:** Elegir estrategia de actualización

### Rechazar fechas futuras en noticias

**What:** Añadir al esquema una validación que impida fechas posteriores al momento del build.

**Why:** Una fecha futura puede secuestrar la portada, crear un mes fantasma y alterar la fecha destacada de la cabecera.

**Context:** `fecha: z.coerce.date()` convierte el valor, pero todavía no valida el rango; añadir un `refine` que falle en voz alta.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Paginar el archivo de noticias

**What:** Limitar el número de noticias y elementos JSON-LD renderizados en una sola página.

**Why:** A una cadencia de cuatro noticias por día laborable, `/noticias` podría superar las mil entradas anuales.

**Context:** La agrupación mensual actual proporciona una base natural para paginación o archivo por periodos.

**Effort:** L
**Priority:** P2
**Depends on:** Definir URL y estrategia SEO del archivo

## Completed

### AGV-01 · Activar GA4 en producción

**What:** Definir `PUBLIC_GA4_ID` y verificar el gating de consentimiento.

**Why:** Habilita analítica respetando la elección de cookies de la persona usuaria.

**Context:** GA4 `G-87SBNWCTWZ` verificado en producción con banner de consentimiento.

**Effort:** S
**Priority:** P0
**Depends on:** None
**Completed:** v0.3.2.0 (2026-08-03)

### AGV-02 a AGV-11 · Correcciones fundamentales de QA

**What:** Corregir FAQ con puntuación real, búsquedas tokenizadas, destino afiliado, contadores en HTML, sinónimos, estado vacío, tipografía, flechas y pruebas de regresión.

**Why:** Resuelve los fallos de búsqueda, navegación, legibilidad y verificación señalados por la auditoría.

**Context:** Incluye `AGV-02`, `AGV-03`, `AGV-04`, `AGV-05`, `AGV-06`, `AGV-07`, `AGV-08`, `AGV-09`, `AGV-10` y `AGV-11`. El backlog histórico las describía también como tareas P0 de tokenización y sinónimos.

**Effort:** XL
**Priority:** P0
**Depends on:** None
**Completed:** rama QA de agosto de 2026 (2026-08-03)

### AGV-14 y AGV-15 · Navegación móvil accesible

**What:** Añadir menú móvil y objetivos táctiles adecuados.

**Why:** Permite acceder a toda la navegación y pulsar los controles con comodidad en teléfonos.

**Context:** El backlog original señalaba que “Pack gratis” quedaba fuera de pantalla y que faltaba una hamburguesa en anchos móviles.

**Effort:** M
**Priority:** P0
**Depends on:** None
**Completed:** rama QA de agosto de 2026 (2026-08-03)

### Fase 2 · Tienda de packs

**What:** Lanzar `/recursos` con Stripe Payment Links y entrega en `/descarga`.

**Why:** Valida un modelo de ingresos propio basado en packs de recursos.

**Context:** Fase definida en `Authority.md`, inicialmente bloqueada hasta validar disposición a pagar.

**Effort:** XL
**Priority:** P1
**Depends on:** Validación de disposición a pagar
**Completed:** PRs #108/#109 (2026-07-04)
