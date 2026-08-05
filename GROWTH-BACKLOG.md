# Backlog de crecimiento — AgentesVA

**Dirección estratégica:** AgentesVA es primero un motor de captación para servicios de automatización con IA. La afiliación queda aplazada hasta validar tráfico, intención y demanda de implementación.

**Objetivo de negocio:** convertir tráfico orgánico, directo y referido en diagnósticos completados, oportunidades cualificadas y proyectos de implementación.

**Orden obligatorio de trabajo:**

1. Instrumentación y embudo.
2. Diagnóstico y superficies comerciales.
3. Integración del funnel en el contenido existente.
4. Crecimiento SEO y conversión.
5. Operaciones offline, prueba social y distribución.

## Criterios de prioridad

- **P0:** imprescindible para captar o medir demanda. Bloquea el resto.
- **P1:** aumenta tráfico cualificado o conversión después de tener el embudo.
- **P2:** escala canales que ya muestran señales positivas.
- **P3:** experimento posterior; no debe desplazar P0/P1.

Estimaciones: **S** ≤ 1 día · **M** 2–4 días · **L** 5–10 días · **XL** requiere dividirse.

---

# Fase 1 — Código primero

## P0 · Medición y embudo comercial

### GROW-001 — Definir el contrato de eventos del funnel

- **Estado:** completado el 4 ago 2026 — [`docs/analytics-events.md`](docs/analytics-events.md)
- **Impacto:** crítico
- **Esfuerzo:** S
- **Dependencias:** ninguna
- **Tarea:** documentar nombres, propiedades y disparadores de los eventos: `service_cta_click`, `diagnostic_started`, `diagnostic_step_completed`, `diagnostic_completed`, `lead_qualified`, `booking_started` y `booking_completed`.
- **Aceptación:** existe una tabla versionada con evento, disparador, propiedades permitidas y página; no se transmiten datos personales a GA4.
- **Métrica:** 100% de los pasos principales observables en DebugView/Realtime tras consentimiento.

### GROW-002 — Instrumentar CTAs y embudo en GA4

- **Estado:** completado el 4 ago 2026 — contrato runtime y tests en `src/scripts/track.ts` / `tests/track.test.ts`; los placements se conectarán al crear cada superficie.
- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-001
- **Tarea:** extender el sistema actual `data-track-*` para medir página de entrada, clúster, servicio, ubicación del CTA y progreso del diagnóstico.
- **Aceptación:** tests unitarios; los eventos se emiten una sola vez con ClientRouter y solo después de consentimiento; el build sigue verde.
- **Métrica:** ratio visita → CTA → inicio → finalización calculable sin hojas manuales.

### GROW-003 — Crear `/diagnostico-automatizacion-ia/`

- **Estado:** completado el 4 ago 2026 — interfaz de 8 pasos, validación, resultado determinista, consentimiento y entrega segura verificados en Vercel Preview; se mantiene `noindex` hasta publicar la ruta en producción.
- **Impacto:** crítico
- **Esfuerzo:** L
- **Dependencias:** GROW-001, definición offline mínima de cualificación OFL-001
- **Tarea:** diagnóstico de 6–8 pasos: negocio, equipo, objetivo, proceso, volumen, herramientas actuales, presupuesto y plazo.
- **Aceptación:** progreso visible, navegación accesible, validación, resultado inmediato útil, consentimiento, estado de error y confirmación; funciona sin pérdida de datos al retroceder entre pasos.
- **Métrica:** ≥40% de finalización entre usuarios que comienzan.

### GROW-004 — Implementar recepción segura de leads

- **Estado:** completado el 4 ago 2026 — endpoint server-side, validación, honeypot, rate limit por instancia, entrega autenticable y consentimiento implementados; `DIAGNOSTIC_WEBHOOK_URL` configurada y entrega real confirmada en Make desde Vercel Preview.
- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-003, OFL-001
- **Tarea:** endpoint server-side con validación, honeypot/rate limit razonable y entrega al CRM o Brevo. No exponer webhooks sensibles en cliente.
- **Aceptación:** esquema de payload probado; respuestas 2xx/4xx/5xx claras; logs sin datos personales completos; prueba de envío en staging.
- **Métrica:** ≥99% de envíos válidos aceptados; errores observables.

### GROW-005 — Construir resultado y enrutamiento del diagnóstico

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-003, GROW-004
- **Tarea:** devolver prioridad recomendada, 2–3 oportunidades, complejidad orientativa y siguiente paso. Leads con encaje alto van a reserva; el resto recibe recursos/newsletter.
- **Aceptación:** reglas deterministas y testeadas; ningún resultado promete ahorro no sustentado; existe ruta clara para cada perfil.
- **Métrica:** diagnóstico completado → reserva iniciada ≥15% en perfiles cualificados.

### GROW-006 — Crear página de gracias específica del diagnóstico

- **Impacto:** alto
- **Esfuerzo:** S
- **Dependencias:** GROW-005
- **Tarea:** página `noindex` con resumen, próximos pasos, expectativa de respuesta y CTA de reserva cuando corresponda.
- **Aceptación:** no existe callejón sin salida; el evento `diagnostic_completed` no se duplica al recargar.
- **Métrica:** resultado cualificado → reserva completada medible.

## P0 · Oferta visible y páginas comerciales

### GROW-007 — Crear hub `/servicios/`

- **Estado:** completado el 4 ago 2026 — hub comercial con tres líneas de servicio, proceso, precios orientativos, criterios de encaje, FAQ, datos estructurados y CTA medidos hacia el diagnóstico.
- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** OFL-001, OFL-002
- **Tarea:** explicar problemas resueltos, servicios, proceso, rangos de inversión, prueba disponible y CTA al diagnóstico.
- **Aceptación:** title, description, canonical, BreadcrumbList, Service JSON-LD cuando corresponda y enlaces a los tres servicios.
- **Métrica:** visita a servicios → diagnóstico iniciado ≥8%.

### GROW-008 — Página de automatización de atención al cliente

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-007, OFL-002
- **Ruta:** `/servicios/automatizacion-atencion-cliente/`
- **Aceptación:** problema, casos de uso, ejemplo de flujo, entregables, plazo, rango de precio, límites, FAQ y CTA contextual.
- **Métrica:** leads cualificados atribuidos a este servicio.

### GROW-009 — Página de automatización de ventas y seguimiento

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-007, OFL-002
- **Ruta:** `/servicios/automatizacion-ventas/`
- **Aceptación:** mismos requisitos de GROW-008 adaptados a captación, cualificación, CRM y seguimiento.
- **Métrica:** leads cualificados atribuidos a este servicio.

### GROW-010 — Página de automatización de operaciones

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-007, OFL-002
- **Ruta:** `/servicios/automatizacion-procesos/`
- **Aceptación:** mismos requisitos de GROW-008 adaptados a documentos, reporting y tareas administrativas.
- **Métrica:** leads cualificados atribuidos a este servicio.

### GROW-011 — Publicar precios orientativos y criterios de encaje

- **Impacto:** alto
- **Esfuerzo:** S
- **Dependencias:** OFL-001
- **Tarea:** incorporar rangos de inversión, qué incluyen y qué hace variar el precio; indicar claramente para quién no es el servicio.
- **Aceptación:** el rango es consistente en home, servicios, diagnóstico y FAQ; no se presentan presupuestos cerrados como promesas.
- **Métrica:** menor proporción de leads sin presupuesto; mayor ratio lead → reunión.

## P0 · Conectar el activo SEO existente con el servicio

### GROW-012 — Añadir CTA contextual a fichas de herramientas

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-003, GROW-008–010
- **Tarea:** mapear cada categoría a un servicio y mostrar un bloque relevante: “¿Quieres implementarla en tu negocio?”. Mantener “Visitar sitio” como acción secundaria.
- **Aceptación:** componente reutilizable, copy por categoría, placement medido y sin CTA genérico duplicado.
- **Métrica:** ficha → diagnóstico iniciado ≥3%.

### GROW-013 — Añadir CTA contextual a estudios

- **Impacto:** crítico
- **Esfuerzo:** M
- **Dependencias:** GROW-003, GROW-008–010
- **Tarea:** incluir CTA después del resumen/comparativa y al final, usando el problema tratado por el estudio.
- **Aceptación:** los ocho estudios enlazan al diagnóstico o servicio correcto; eventos diferenciados por placement.
- **Métrica:** estudio → diagnóstico iniciado ≥5%.

### GROW-014 — Reorientar la home hacia implementación

- **Impacto:** crítico
- **Esfuerzo:** L
- **Dependencias:** GROW-003, GROW-007–011
- **Tarea:** el hero debe prometer detección e implementación de automatizaciones. Priorizar diagnóstico, tres problemas, proceso, prueba y servicios; conservar el directorio como exploración secundaria.
- **Aceptación:** un CTA primario por viewport; directorio accesible; sin dos promociones simultáneas del mismo pack; no empeoran accesibilidad ni rendimiento.
- **Métrica:** home → diagnóstico iniciado ≥8%.

### GROW-015 — Actualizar navegación y footer

- **Impacto:** alto
- **Esfuerzo:** S
- **Dependencias:** GROW-007
- **Tarea:** añadir “Servicios” y “Diagnóstico” sin diluir la navegación; relegar secciones editoriales secundarias si es necesario.
- **Aceptación:** header, menú móvil, footer, breadcrumbs y schema usan rutas consistentes.
- **Métrica:** CTR hacia servicios y diagnóstico.

## P1 · SEO de intención comercial

### GROW-016 — Crear mapa de keywords por problema e intención

- **Impacto:** alto
- **Esfuerzo:** M
- **Dependencias:** GROW-008–010
- **Tarea:** asignar una keyword primaria y variantes a cada página; separar intención informativa, comparativa, comercial y local para evitar canibalización.
- **Aceptación:** cada URL tiene intención, query principal, secundarias, CTA, página madre y enlaces previstos.
- **Métrica:** cero páginas nuevas sin keyword e intención asignadas.

### GROW-017 — Crear seis piezas de soporte comercial

- **Impacto:** alto
- **Esfuerzo:** XL, dividir en seis entregas
- **Dependencias:** GROW-016, protocolo de fact-checking
- **Temas iniciales:** chatbot para PyME; automatizar WhatsApp; seguimiento de leads; Make vs n8n vs Zapier; coste de automatizar un negocio; procesos que conviene automatizar primero.
- **Aceptación:** respuesta breve inicial, profundidad práctica, fuentes, ejemplos, enlaces al clúster y CTA contextual; sin texto programático repetido.
- **Métrica:** impresiones no-brand, CTR y diagnósticos asistidos por pieza.

### GROW-018 — Reforzar enlazado interno por clúster

- **Impacto:** alto
- **Esfuerzo:** M
- **Dependencias:** GROW-008–010, GROW-017
- **Tarea:** enlazar herramienta ↔ estudio ↔ guía ↔ servicio con anclas descriptivas; añadir “siguiente decisión” en páginas sin salida.
- **Aceptación:** toda página comercial recibe enlaces desde al menos tres páginas relevantes; ningún contenido prioritario queda huérfano.
- **Métrica:** profundidad de navegación y páginas por sesión del clúster.

### GROW-019 — Optimizar snippets con datos de Search Console

- **Impacto:** alto
- **Esfuerzo:** M recurrente
- **Dependencias:** cuatro semanas de datos posteriores al cambio
- **Tarea:** revisar queries con impresiones altas, posiciones 3–15 o CTR inferior al esperado; ajustar title, description y encabezado sin cambiar intención.
- **Aceptación:** registro antes/después por URL; no modificar más de una variable principal por prueba.
- **Métrica:** mejora de CTR y clics no-brand a 28 días.

### GROW-020 — Añadir campos de decisión a las 10 fichas prioritarias

- **Impacto:** alto
- **Esfuerzo:** L
- **Dependencias:** OFL-003
- **Tarea:** precio real, límites del plan gratis, español, dificultad, integraciones, “elige si”, “evita si” y última verificación.
- **Aceptación:** schema actualizado, datos visibles y verificables, fecha de revisión y tests de contenido.
- **Métrica:** ficha → CTA de proveedor o diagnóstico; tiempo útil en página.

### GROW-021 — Plantilla SEO para casos prácticos

- **Impacto:** alto
- **Esfuerzo:** M
- **Dependencias:** OFL-004
- **Tarea:** colección/rutas para situación, proceso anterior, solución, diagrama, herramientas, plazo, resultado y disclaimer de demo cuando aplique.
- **Aceptación:** CaseStudy/Article schema apropiado, enlaces a servicio y diagnóstico, OG específico y campos que impiden publicar métricas sin fuente.
- **Métrica:** tráfico y leads asistidos por casos.

## P1 · Tráfico directo y retorno

### GROW-022 — Reposicionar newsletter y segmentar interés

- **Impacto:** alto
- **Esfuerzo:** M
- **Dependencias:** OFL-005
- **Tarea:** promesa centrada en una automatización aplicable por semana; capturar interés en ventas, atención, marketing u operaciones.
- **Aceptación:** formularios, payload y etiquetas/listas actualizados; consentimiento explícito; migración compatible con formularios actuales.
- **Métrica:** conversión por placement, confirmación DOI y engagement por segmento.

### GROW-023 — Crear calculadora de ahorro por automatización

- **Impacto:** medio-alto
- **Esfuerzo:** L
- **Dependencias:** OFL-006
- **Tarea:** horas por tarea, frecuencia, coste/hora y porcentaje automatizable; resultado conservador con metodología visible.
- **Aceptación:** funciona en cliente, accesible, sin almacenar datos sensibles; resultado compartible y CTA al diagnóstico.
- **Métrica:** calculadora completada → diagnóstico iniciado ≥10%.

### GROW-024 — Añadir parámetros UTM y atribución first/last touch

- **Impacto:** alto
- **Esfuerzo:** M
- **Dependencias:** GROW-001
- **Tarea:** conservar campaña y primera landing hasta el envío del lead sin transmitir PII a analítica.
- **Aceptación:** el CRM recibe fuente, medio, campaña y landing; pruebas para tráfico directo y ausencia de UTM.
- **Métrica:** ≥90% de oportunidades con fuente atribuida.

## P2 · Escala SEO y distribución técnica

### GROW-025 — Páginas sectoriales, solo después de validar demanda

- **Impacto:** medio-alto
- **Esfuerzo:** XL
- **Dependencias:** al menos 10 diagnósticos y OFL-007
- **Tarea:** lanzar máximo tres sectores con procesos, ejemplos y lenguaje propios; prohibidas las páginas programáticas superficiales.
- **Aceptación:** evidencia de demanda, contenido original, CTA y caso/demostración sectorial.
- **Métrica:** leads cualificados por sector.

### GROW-026 — Sistema de actualización de precios y fichas

- **Impacto:** medio
- **Esfuerzo:** L
- **Dependencias:** GROW-020
- **Tarea:** guardar `verifiedAt`, avisar de fichas caducadas y mostrar fecha de revisión.
- **Aceptación:** el build o CI identifica fichas prioritarias con más de 90 días sin verificar.
- **Métrica:** porcentaje de fichas prioritarias vigentes.

### GROW-027 — Preparar páginas/activos enlazables con datos propios

- **Impacto:** medio-alto
- **Esfuerzo:** L
- **Dependencias:** OFL-008
- **Tarea:** soporte técnico para informe, dataset/metodología, gráficos compartibles y URLs estables.
- **Aceptación:** fuentes, metodología, fecha, embeds/descargas y CTA editorial presentes.
- **Métrica:** dominios de referencia y menciones.

## P3 · Pospuesto

### GROW-028 — Activar afiliación

- **Estado:** pospuesto por decisión estratégica
- **Condición de entrada:** tráfico orgánico estable y evidencia de salidas a proveedores que no canibalizan servicios.
- **Tarea futura:** poblar `affiliateUrl` solo para herramientas relevantes y aprobadas; medir ingreso por 1.000 sesiones cualificadas.
- **Regla:** nunca sustituir el CTA de diagnóstico en páginas con intención de implementación.

---

# Fase 2 — Trabajo offline

Estas tareas requieren decisiones, experiencia del fundador, contacto humano o sistemas externos. Deben empezar cuando desbloqueen una tarea de código, pero no sustituyen el orden de implementación anterior.

## P0 · Definición comercial

### OFL-001 — Definir oferta, cualificación y rangos de inversión

- **Estado:** completado el 4 ago 2026 — [`docs/service-offer.md`](docs/service-offer.md)
- Elegir ticket mínimo, servicios incluidos, exclusiones, territorio, capacidad mensual y señales de lead cualificado.
- Definir qué perfiles reciben llamada, recurso o taller de pago.
- **Entregable:** ficha operativa de una página usada por GROW-003, GROW-005 y GROW-011.

### OFL-002 — Diseñar los tres paquetes de servicio

- Atención al cliente, ventas/seguimiento y operaciones.
- Para cada uno: problema, entregables, plazo, stack habitual, dependencias del cliente, rango y mantenimiento.
- **Entregable:** contenido aprobado para GROW-007–010.

### OFL-003 — Investigación manual de las 10 herramientas prioritarias

- Verificar precio, límites, español, integraciones, privacidad, dificultad y casos de uso.
- Guardar URL y fecha de cada fuente.
- **Entregable:** matriz fact-checkeada para GROW-020.

## P1 · Prueba y ventas

### OFL-004 — Crear tres demostraciones y conseguir el primer caso real

- Una demo por servicio con diagrama y resultado verificable.
- Etiquetar las demos como demostraciones, nunca como clientes.
- Ofrecer una implementación piloto a un negocio con acceso a métricas iniciales y finales.
- **Entregable:** evidencia para GROW-014 y GROW-021.

### OFL-005 — Escribir secuencia de bienvenida segmentada

- Email 0: entrega/promesa.
- Email 1: detectar el proceso adecuado.
- Email 2: caso o demo.
- Email 3: errores y límites.
- Email 4: invitación al diagnóstico.
- **Entregable:** copy y automatización en Brevo para GROW-022.

### OFL-006 — Aprobar supuestos de la calculadora

- Definir fórmula conservadora, límites de automatización y disclaimer.
- Validar tres ejemplos de negocio.
- **Entregable:** especificación para GROW-023.

### OFL-007 — Entrevistar a 10 prospectos antes de crear páginas sectoriales

- Registrar sector, proceso doloroso, frecuencia, coste actual, herramientas, presupuesto y objeciones.
- **Gate:** no ejecutar GROW-025 sin patrones repetidos en al menos tres entrevistas.

## P1 · Distribución y tráfico referido

### OFL-008 — Producir un estudio con datos propios

- Tema recomendado: procesos que más tiempo consumen en pequeñas empresas o coste real de automatizarlos.
- Documentar muestra, metodología y limitaciones.
- **Entregable:** dataset y narrativa para GROW-027.

### OFL-009 — Crear lista de 30 partners potenciales

- Agencias de marketing, consultores, implementadores CRM, asesorías digitales, asociaciones y comunidades de PyMEs.
- Priorizar acceso a clientes sobre tamaño de audiencia.
- **Métrica:** 10 conversaciones, 3 pruebas de colaboración, 1 lead referido.

### OFL-010 — Diseñar oferta para partners

- Modelo: el partner conserva la relación; AgentesVA diagnostica e implementa.
- Definir referral fee, white-label opcional, responsabilidad y protección de cuenta.
- **Entregable:** one-pager y email de contacto.

### OFL-011 — Cadencia de distribución del contenido

- Por cada guía: 2 publicaciones de LinkedIn, 1 carrusel/diagrama, 1 newsletter y 1 vídeo breve.
- Reutilizar ideas, no copiar el artículo completo.
- **Métrica:** sesiones directas, búsquedas de marca, suscripciones y diagnósticos asistidos.

## P2 · Operación comercial

### OFL-012 — Pipeline de ventas y SLA

- Estados: nuevo, cualificado, contacto, reunión, propuesta, ganado, perdido.
- Definir responsable, siguiente acción, motivo de pérdida y tiempo máximo de respuesta.
- **Métrica:** respuesta <1 día laborable; conversión por etapa visible.

### OFL-013 — Guion de discovery y plantilla de propuesta

- El guion debe cuantificar volumen, tiempo, coste, riesgo y resultado esperado.
- La propuesta debe incluir alcance, exclusiones, hitos, accesos, soporte y medición.
- **Métrica:** reunión → propuesta y propuesta → cliente.

### OFL-014 — Sistema mensual de decisión

- Revisión conjunta de Search Console, GA4, CRM y ventas.
- Decidir qué clúster ampliar, qué página actualizar y qué canal detener.
- **Regla:** no escalar por tráfico; escalar por oportunidades cualificadas e ingresos asistidos.

---

# Orden recomendado de ejecución

## Sprint 1 — Fundamentos comerciales y medición

`OFL-001` → `OFL-002` → `GROW-001` → `GROW-002` → `GROW-007` → `GROW-011`

## Sprint 2 — Diagnóstico

`GROW-003` → `GROW-004` → `GROW-005` → `GROW-006`

## Sprint 3 — Superficies de conversión

`GROW-008` → `GROW-009` → `GROW-010` → `GROW-012` → `GROW-013` → `GROW-015`

## Sprint 4 — Home y adquisición

`OFL-004` → `GROW-014` → `GROW-016` → primeras entregas de `GROW-017` → `GROW-018`

## Sprint 5 — Retención y optimización

`OFL-005` → `GROW-022` → `GROW-024` → `GROW-019` → `GROW-020`

---

# Definición de éxito a 90 días

- Embudo completo medible desde landing hasta oportunidad.
- Tres servicios publicados con rangos y criterios de encaje.
- Diagnóstico funcional y conectado al sistema comercial.
- Las páginas de mayor tráfico conducen a una acción comercial relevante.
- Al menos un caso real o tres demos claramente etiquetadas.
- Primeras 10 oportunidades cualificadas con fuente atribuida.
- Decisión de continuar, modificar o descartar cada clúster basada en oportunidades, no solo en visitas.
