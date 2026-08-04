# Oferta y cualificación de servicios — v1

**Estado:** hipótesis operativa aprobada para construir y medir el funnel. Revisar después de 10 diagnósticos completados o 5 conversaciones comerciales, lo que ocurra antes.

## Posicionamiento

AgentesVA ayuda a PyMEs y autónomos a detectar, diseñar e implementar automatizaciones con IA que reduzcan trabajo repetitivo en atención al cliente, ventas y operaciones.

La promesa no es “instalar IA” ni garantizar un porcentaje de ahorro. La promesa es entregar un proceso definido, una automatización funcional dentro del alcance acordado y una forma verificable de comprobar su funcionamiento.

## Cliente inicial

### Encaje principal

- PyME o profesional con un proceso repetitivo que ya ocurre todas las semanas.
- Al menos una persona dedica tiempo manual al proceso.
- Existe un responsable capaz de decidir y facilitar accesos.
- Usa herramientas con API, webhook o exportación razonable, o acepta cambiar alguna pieza del stack.
- Puede invertir desde 1.500 € en una implementación acotada.
- Quiere comenzar en los próximos tres meses.

### Encaje secundario

- Negocio aún sin presupuesto de implementación, pero dispuesto a pagar un taller de definición.
- Equipo que necesita priorizar oportunidades antes de solicitar propuestas.
- Proyecto viable técnicamente cuyo alcance todavía no está suficientemente definido.

### Sin encaje por ahora

- Busca una herramienta gratuita sin implementación.
- Necesita desarrollo de producto completo, ERP a medida o sustitución integral de sistemas.
- No puede proporcionar acceso a los sistemas ni una persona responsable.
- El proceso ocurre pocas veces y el ahorro potencial no justifica el proyecto.
- Espera que la IA opere sin supervisión en decisiones legales, médicas, financieras o laborales de alto impacto.
- Presupuesto inferior a 300 € y ninguna posibilidad de ampliación.

## Líneas de servicio

### 1. Atención al cliente

Ejemplos: clasificación de consultas, borradores de respuesta, FAQ, derivación a una persona, seguimiento de tickets y resúmenes.

No incluye por defecto atención autónoma de reclamaciones sensibles, decisiones vinculantes ni acceso indiscriminado a datos personales.

### 2. Ventas y seguimiento

Ejemplos: captura y enriquecimiento limitado de leads, cualificación, asignación, recordatorios, borradores de seguimiento y actualización de CRM.

No incluye spam, compra de bases de datos ni envío automático sin consentimiento o base legítima.

### 3. Operaciones

Ejemplos: extracción de datos de documentos, clasificación de emails, preparación de informes, traspaso entre herramientas y alertas internas.

No incluye sustituir controles contables, fiscales o regulatorios que requieran validación profesional.

## Escalera comercial

| Oferta | Precio orientativo | Para quién | Entregable principal | Duración orientativa |
|---|---:|---|---|---|
| Diagnóstico inicial | Gratis | Negocio con problema identificable | Priorización inicial y siguiente paso | Resultado inmediato + revisión cuando aplique |
| Taller de automatización | Desde 300 € | Encaje posible, alcance aún difuso | Mapa del proceso, viabilidad, riesgos y plan | 1 semana |
| Implementación acotada | Desde 1.500 € | Un flujo con sistemas y responsable definidos | Automatización funcional, pruebas y documentación | 2–4 semanas |
| Implementación multiherramienta | Desde 3.000 € | Flujo con varias integraciones o mayor criticidad | Diseño, implementación, pruebas, formación y puesta en marcha | 4–8 semanas |
| Soporte y optimización | Desde 300 €/mes | Automatización ya operativa | Monitorización, mantenimiento y mejoras acordadas | Mensual |

Los importes son rangos de entrada, no presupuestos vinculantes. El precio final depende de volumen, integraciones, estado de los datos, riesgo, necesidad de revisión humana y soporte.

## Capacidad inicial

- Máximo dos implementaciones simultáneas.
- Máximo cuatro talleres al mes.
- Respuesta a un lead cualificado: siguiente día laborable.
- No prometer fecha de inicio hasta confirmar capacidad y accesos.

Estas restricciones protegen la entrega mientras se valida la demanda. Deben revisarse cuando haya datos reales de duración y carga.

## Datos del diagnóstico

El formulario inicial utilizará categorías cerradas siempre que sea posible:

1. Tipo de negocio.
2. Tamaño del equipo.
3. Objetivo principal.
4. Proceso repetitivo prioritario.
5. Frecuencia o volumen.
6. Herramientas actuales.
7. Rango de inversión.
8. Plazo deseado.

El email y los datos de contacto solo se solicitan al final, cuando el usuario decide recibir el resultado o pedir conversación. Las respuestas individuales no se envían a GA4.

## Bandas de cualificación

La banda determina el siguiente paso, no el valor de la empresa ni la calidad del lead.

### Alta — `high`

Cumple todas:

- Presupuesto `1500_3000`, `3000_5000` o `more_5000`.
- Plazo `now`, `one_month` o `three_months`.
- El proceso ocurre al menos semanalmente o tiene un volumen significativo.
- Existe una herramienta/proceso actual o una descripción concreta del problema.

**Resultado:** ofrecer llamada de diagnóstico y revisión humana prioritaria.

### Media — `medium`

Se cumple alguna:

- Presupuesto `300_1500` con proceso repetitivo claro.
- Presupuesto de implementación, pero plazo superior a tres meses.
- Dolor claro con información insuficiente para estimar viabilidad.

**Resultado:** ofrecer taller de automatización; permitir solicitar llamada sin prometer plaza.

### Baja — `low`

Se cumple alguna:

- Presupuesto `under_300` o `exploring`.
- Proceso esporádico sin volumen apreciable.
- Objetivo principal es únicamente descubrir una herramienta.

**Resultado:** entregar recomendaciones y newsletter segmentada; no mostrar reserva como CTA principal.

## Reglas de seguridad y exclusión

Una respuesta de riesgo alto puede invalidar la ruta automática aunque presupuesto y plazo sean altos:

- Decisiones médicas, legales, financieras o laborales sin revisión humana.
- Tratamiento de datos sensibles sin base, minimización o controles claros.
- Automatización destinada a engaño, spam, suplantación o evasión de controles.
- Solicitud que exija credenciales compartidas de manera insegura.

**Resultado:** no calificar automáticamente; explicar la necesidad de revisión y alcance seguro.

## Tipos de resultado del funnel

| `result_type` | Banda habitual | CTA principal |
|---|---|---|
| `qualified_call` | `high` | Reservar conversación |
| `paid_workshop` | `medium` | Solicitar taller |
| `self_serve_resources` | `low` | Recibir recursos relevantes |
| `manual_review` | cualquiera con riesgo/ambigüedad | Solicitar revisión sin promesa automática |

## Información permitida en analítica

GA4 puede recibir solamente:

- Banda agregada.
- Tipo de resultado.
- Clúster y servicio.
- Paso completado.
- Placement y tipo de página.

GA4 no recibe respuestas, presupuesto exacto, empresa, email, teléfono ni descripción libre. El CRM puede recibir la solicitud completa tras consentimiento explícito y por una conexión server-side.

## Métricas de validación

Durante los primeros 90 días:

- Finalización del diagnóstico: objetivo inicial ≥40%.
- Diagnóstico completado → lead cualificado: medir, sin objetivo hasta 30 completados.
- Lead cualificado → reserva iniciada: objetivo inicial ≥15%.
- Respuesta a lead cualificado: <1 día laborable.
- Registrar motivo de pérdida en el 100% de oportunidades cerradas.

## Decisiones pendientes, no bloqueantes para la primera versión

- Proveedor definitivo de reservas y disponibilidad publicada.
- Si el taller se cobra antes o después de una llamada breve.
- Política de cancelación y reprogramación.
- Capacidad real tras las primeras tres implementaciones.
- Sectores que merecen una oferta vertical.
