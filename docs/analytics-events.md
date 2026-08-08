# Contrato de eventos de crecimiento

**Propietario:** Growth/Product

**Implementación:** `src/scripts/track.ts`
**Consentimiento:** GA4 solo recibe eventos cuando `analytics_storage` está concedido y el script de GA4 está cargado.

Este documento es la fuente de verdad para los eventos de adquisición y conversión de AgentesVA. Un cambio de nombre, significado o propiedades requiere actualizar este archivo y sus tests en el mismo cambio.

## Principios

1. Los nombres de evento y propiedades usan `snake_case`.
2. Un evento representa una acción verificable, no una intención inferida.
3. GA4 no recibe información personal ni texto libre introducido por el usuario.
4. Los valores son categorías cerradas y estables, no copy visible de la interfaz.
5. Cada conversión se dispara una sola vez por acción, incluso con Astro ClientRouter.
6. La cualificación se calcula en servidor o con reglas deterministas; nunca se envían respuestas individuales del diagnóstico a GA4.

## Propiedades comunes permitidas

| Propiedad | Tipo | Ejemplo | Uso |
|---|---|---|---|
| `page_type` | string | `tool_detail` | Tipo estable de página. |
| `content_slug` | string | `claude` | Slug público del contenido. |
| `cluster` | enum | `customer_service` | Clúster comercial atribuido. |
| `service` | enum | `sales_automation` | Servicio relacionado. |
| `placement` | enum/string controlado | `tool_midpage` | Ubicación funcional del CTA. |
| `step` | integer serializado | `3` | Número del paso del diagnóstico. |
| `step_id` | enum | `business_goal` | Identificador estable del paso. |
| `result_type` | enum | `qualified_call` | Ruta de resultado, nunca las respuestas. |
| `qualification_band` | enum | `high` | Banda agregada `low`, `medium` o `high`. |
| `booking_provider` | enum | `calendly`, `cal`, `external` | Proveedor de reserva derivado de la URL HTTPS configurada. |
| `list` | enum | `newsletter` | Lista de suscripción. |
| `slug` | string | `claude` | Compatibilidad con eventos del directorio. |
| `category` | string controlado | `Asistentes` | Categoría pública del directorio. |
| `src` | string controlado | `ficha-hero` | Placement heredado de `/ir/`. |
| `has_affiliate` | boolean serializado | `0` | Compatibilidad con salida a proveedores. |

### Valores controlados

`cluster`:

- `customer_service`
- `sales`
- `operations`
- `general`

`service`:

- `customer_service_automation`
- `sales_automation`
- `process_automation`
- `general_consulting`

`placement` se compone como `{page_type}_{position}`. Posiciones iniciales: `hero`, `midpage`, `bottom`, `card`, `nav` y `result`.

Placements controlados de la portada comercial: `hero`, `hero_pricing`, `service_card`, `methodology`, `mid_page` y `sticky`. Permiten distinguir el diagnóstico principal, la consulta de precios, las tres áreas de servicio, el proceso, el cierre intermedio y la barra fija sin enviar el texto visible del CTA.

## Propiedades prohibidas

No deben aparecer en `data-track-*`, llamadas a `track()` ni configuración de GA4:

- Email, nombre, teléfono o empresa.
- Dirección postal, IP o identificadores internos del CRM.
- Presupuesto exacto o facturación exacta.
- Texto libre o descripción del proceso del usuario.
- Respuestas individuales del diagnóstico.
- URL completa si contiene query strings; usar ruta, slug o valores UTM saneados.
- Cualquier dato que permita identificar directa o indirectamente a una persona.

## Funnel principal

```text
service_cta_click
  → diagnostic_started
  → diagnostic_step_completed (1..N)
  → diagnostic_completed
  → lead_qualified
  → booking_started
  → booking_completed
```

`lead_qualified` no significa que el visitante sea cliente. Solo indica que las reglas de encaje le ofrecen una conversación comercial.

## Eventos comerciales

| Evento | Disparador único | Propiedades requeridas | Propiedades opcionales | Página/superficie |
|---|---|---|---|---|
| `service_cta_click` | Click en un CTA que conduce a diagnóstico o servicio. | `page_type`, `placement` | `content_slug`, `cluster`, `service` | Home, fichas, estudios, guías, navegación y servicios. |
| `diagnostic_started` | Primera interacción válida del paso 1, no la mera vista. | `page_type`, `placement` | `cluster`, `service` | Diagnóstico. |
| `diagnostic_step_completed` | El usuario valida un paso y avanza. | `step`, `step_id` | `cluster`, `service` | Diagnóstico. |
| `diagnostic_completed` | El servidor acepta el envío final. | `result_type` | `qualification_band`, `cluster`, `service` | Diagnóstico/resultado. |
| `lead_qualified` | Las reglas asignan una ruta comercial. | `qualification_band`, `result_type` | `cluster`, `service` | Servidor o resultado; una vez por diagnóstico aceptado. |
| `booking_started` | Click hacia el proveedor de reserva desde un resultado cualificado. | `booking_provider`, `placement` | `cluster`, `service`, `qualification_band` | Resultado, gracias o servicio. |
| `booking_completed` | Confirmación verificable del proveedor, no la carga del calendario. | `booking_provider` | `cluster`, `service` | Callback/webhook o página de confirmación validada. |

## Eventos existentes que se conservan

| Evento | Disparador | Propiedades |
|---|---|---|
| `view_ficha` | Vista de una ficha de herramienta. | `slug`, `category` |
| `affiliate_click` | Click de salida por `/ir/`, tenga o no afiliación. | `slug`, `src`, `has_affiliate` |
| `newsletter_submit` | El endpoint acepta el intento de suscripción. | `list` |

Aunque `affiliate_click` conserve el nombre por compatibilidad histórica, `has_affiliate=0` indica una salida ordinaria a proveedor. No se usará como conversión principal mientras el negocio priorice servicios.

## Semántica de disparo

### Clicks declarativos

Los CTAs renderizan atributos estables:

```html
<a
  href="/diagnostico-automatizacion-ia/"
  data-track-event="service_cta_click"
  data-track-page-type="tool_detail"
  data-track-content-slug="claude"
  data-track-cluster="operations"
  data-track-service="process_automation"
  data-track-placement="tool_detail_midpage"
>Analizamos tu caso</a>
```

`initTracking()` transforma automáticamente los guiones de atributos en guiones bajos.

### Eventos de estado

Los eventos dependientes de validación o respuesta del servidor se llaman desde código:

```ts
track('diagnostic_step_completed', {
  step: 2,
  step_id: 'business_goal',
  cluster: 'sales',
});
```

`diagnostic_completed` se emite únicamente después de una respuesta exitosa del endpoint. `booking_completed` exige confirmación real; no puede inferirse de un click.

## Conversiones de GA4

Marcar como eventos clave:

- `diagnostic_completed`
- `lead_qualified`
- `booking_completed`

Mantener como microconversiones para análisis:

- `service_cta_click`
- `diagnostic_started`
- `booking_started`
- `newsletter_submit`

## Embudo y métricas derivadas

| Métrica | Fórmula |
|---|---|
| CTR comercial | `service_cta_click / sesión con CTA` |
| Inicio de diagnóstico | `diagnostic_started / service_cta_click` |
| Finalización | `diagnostic_completed / diagnostic_started` |
| Cualificación | `lead_qualified / diagnostic_completed` |
| Inicio de reserva | `booking_started / lead_qualified` |
| Reserva confirmada | `booking_completed / booking_started` |

Los porcentajes se segmentan por `page_type`, `cluster`, `service` y `placement`. No se deben comparar placements con muy poco volumen como si fueran conclusiones firmes.

## Checklist de implementación

- [ ] El evento existe en este contrato.
- [ ] El disparador es observable y no inferido.
- [ ] Solo usa propiedades permitidas.
- [ ] No contiene PII ni texto libre.
- [ ] Respeta el consentimiento.
- [ ] No se duplica con ClientRouter o recarga.
- [ ] Tiene test unitario o prueba de integración proporcional al riesgo.
- [ ] Se valida en GA4 DebugView/Realtime antes de producción.
