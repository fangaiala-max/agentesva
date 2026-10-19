# Revisión de guías existentes — 18 de octubre de 2026

**Veredicto: optimizar cuatro guías y conservar las otras seis en esta pasada.** Se han editado los archivos fuente y sus cuatro resúmenes ingleses existentes. No se ha publicado, creado una PR ni cambiado la fecha de las piezas conservadas.

## Decisión del lector y criterio de selección

El lector de esta selección es una persona responsable de operaciones, ventas o atención de una PyME que necesita decidir qué contratar y cómo operar un primer flujo. La oferta actual de AgentesVA combina diagnóstico, taller de alcance, implementación y soporte. Los precios propios se contrastaron con `src/data/service-offer.ts`; no se modificaron las tarifas ni se añadieron prestaciones.

«Más valor» describe aquí utilidad editorial para una decisión de compra o uso y relación con la oferta. No significa «más visitas», «más conversiones» o «mejor retorno demostrado». La muestra de analítica comunicada por la revisión principal —8 sesiones en 28 días— no permite ordenar de forma fiable el rendimiento de estos artículos. No hay entrevistas, llamadas ni resultados de clientes nuevos que justifiquen afirmar un efecto comercial.

Se priorizó: consecuencia de equivocarse, vigencia del dato, encaje con los servicios actuales y posibilidad de dejar una acción comprobable. No se añadieron estadísticas de adopción, ahorro, ingresos o rendimiento.

| Guía inventariada | Decisión | Motivo |
|---|---|---|
| `make-vs-n8n-vs-zapier` | Actualizar | La comparación carecía de entrada gratuita, límites y referencias actuales de coste; afecta directamente a la selección de software. |
| `cuanto-cuesta-automatizar-un-negocio` | Actualizar | Faltaban un presupuesto operativo verificable, alternativas de menor compromiso y un ejemplo con revisión/mantenimiento descontados. |
| `automatizar-whatsapp-empresa` | Actualizar | «Conversaciones o uso» era demasiado ambiguo para el modelo de facturación actual; la regla de plantillas no explicaba la ventana operativa. |
| `automatizar-seguimiento-de-leads` | Actualizar | Citaba Google, pero no convertía los requisitos de envío ni la cancelación de mensajes en una prueba operativa. |
| `procesos-que-conviene-automatizar-primero` | Conservar | Mantiene inventario, línea base, excepciones, riesgo y regla de parada. No contiene tarifas o cupos que haya que sustituir en esta selección. |
| `chatbot-para-pymes` | Conservar | Conserva alcance acotado, fuente mantenida, derivación humana y métricas; no necesita introducir nuevas promesas para aportar utilidad. |
| `como-aparecer-en-chatgpt` | Conservar | Pregunta distinta de la compra de automatización; mantiene la distinción entre mención, descripción y cita. Sin nueva evidencia, no se cambia la fecha. |
| `medir-visibilidad-en-chatgpt` | Conservar | La metodología y denominadores no se benefician de insertar precios de software. No se revalidó todo su corpus en esta pasada. |
| `seo-para-ia` | Conservar | Contenido fundacional de otra decisión; revisión integral fuera del alcance elegido. |
| `como-convertirse-en-especialista-geo` | Conservar | Trabaja con una muestra de empleo fechada y atribuida. No se presenta como dato laboral actualizado ni se cambia el corpus sin investigación específica. |

Se inventariaron las diez guías por contenido, estructura y fuentes, y se revisaron completas las cuatro modificadas. No fue necesario modificar estudios: la comparación de plataformas, costes y dos canales operativos ya cubren cuatro decisiones concretas de las guías. Las seis conservadas no quedan certificadas como íntegramente revalidadas a octubre.

## Antes y después de los cambios

| Archivo / localización | Antes | Después y utilidad |
|---|---|---|
| Make/n8n/Zapier, después de la comparación inicial | Solo caracterización de las plataformas y cinco criterios. | Tabla de prueba gratuita y pago, moneda, facturación anual/mensual y unidades distintas. Permite comprobar si se necesita comprar y qué límite se va a alcanzar. |
| Make/n8n/Zapier, fuentes | Ayuda genérica de selección de plan de Zapier. | Precios oficiales actuales, tarifas por acción y ediciones de n8n; sin tratar tareas, créditos y ejecuciones como equivalentes. |
| Coste, fórmula de retorno | «Divide inversión inicial entre beneficio mensual». | Añade la condición de beneficio positivo y estable y expresa los errores evitados en coste; evita mezclar recuentos con euros o un plazo ficticio sin beneficio neto. |
| Coste, sección nueva | No había ficha de coste operativo ni ejemplo numérico de retorno. | Tabla de volumen, software, servicios externos, personas, contrato y salida. Ejemplo explícitamente hipotético: `(20−5)×20−60 = 240 €/mes`; `1.500/240 = 6,25 meses`. Se exige recalcular con soporte y demás costes aplicables. |
| Coste, alternativas | Reutilizar sistemas y acotar alcance. | Conserva ese consejo y añade simplificar, función nativa o trabajo manual antes de contratar. La capacidad liberada no se presenta automáticamente como ahorro en caja. |
| WhatsApp, costes | «Conversaciones o uso». | «Mensajes facturables», distinguiendo Meta y proveedor. No se introduce un precio universal por país o categoría. |
| WhatsApp, reglas de salida | Plantillas «cuando sean necesarias». | Ventana de 24 horas, comprobación de permiso y plantilla al caducar; ejemplo propuesto de recordatorio que pasa a revisión si faltan condiciones. |
| Leads, fuente Google | «Google and Yahoo email sender requirements», enlazando solo Google. | Título exacto de Google, ámbito de Gmail personal, requisitos generales y de volumen; no se atribuyen condiciones a Yahoo sin fuente. |
| Leads, operación | Detener la cadencia por respuesta/reunión/baja/estado. | Mantiene esos eventos y añade ensayo de cancelación en sistemas conectados, rebote y duplicado antes de activar. |
| Leads, formulario | «Cada fricción reduce la finalización». | «Pedir información que todavía no necesitas añade esfuerzo y puede dificultar la respuesta». Se elimina la causalidad universal sin medida. |
| Cuatro guías, metadata | Actualización `2026-08-05`. | Actualización `2026-10-18` por revisión sustantiva. Se conserva la fecha original de publicación. |
| Cuatro entradas de `editorial.json` | Resúmenes anteriores. | Se trasladan las principales condiciones de compra y operación. Siguen siendo adaptaciones breves, no traducciones completas. |

## Evidencia y límites de comprobación

Fuentes oficiales consultadas el **18 de octubre de 2026**, salvo la verificación interna de oferta que se identifica aparte. En los cuerpos hay enlaces junto a las afirmaciones nuevas y fechas de consulta; los ejemplos de proceso y retorno se etiquetan como propuestas o hipótesis.

| Fuente | Uso y límite |
|---|---|
| [Make: precios](https://www.make.com/pricing) | Planes y capacidad de entrada. La página dinámica `/en/pricing` devolvió extracción incompleta; se usa la comprobación de navegador del agente principal y su [transcripción local de la selección mensual](research/make-monthly-source.txt). Core confirmado: 12 USD/mes anual y 16 USD mensual para 10.000 créditos. No se usa el dato antiguo de 9 USD. |
| [Make: créditos y operaciones](https://help.make.com/credits-and-operations) | Distinción de unidades; no se convierte todo módulo/operación en un crédito universal. |
| [Zapier: precios](https://zapier.com/pricing) | Free y Professional con compromiso anual indicado; no se fija un cupo de pago sin selector confirmado. |
| [Zapier: tarifas de uso](https://zapier.com/pricing/rates) | Consumo según tipo de acción. No se presenta cada acción como exactamente una tarea. |
| [n8n: precios](https://n8n.io/pricing/) | Cloud Starter, cuota y facturación anual; Cloud se presenta como prueba temporal, no plan gratuito permanente. |
| [n8n: ediciones](https://docs.n8n.io/deploy/host-n8n/community-edition-features/) y [licencia](https://docs.n8n.io/sustainable-use-license/) | Community autoalojada y diferencia de edición; no se denomina licencia universal de uso/reventa ni se eliminan costes de operación. |
| [Meta: precios](https://business.whatsapp.com/products/platform-pricing) | Mensajes entregados, categoría/mercado y excepción de servicio; sin cuantificar un precio para España con selector no comprobado. |
| [Meta: política](https://business.whatsapp.com/policy) | Ventana, plantillas y permiso como condiciones del proveedor. La página consultada indica actualización del 23 de septiembre de 2026. No es una declaración de cumplimiento legal de AgentesVA. |
| [Google: requisitos de remitentes](https://support.google.com/a/answer/81126) | Gmail personal; se distingue cualquier remitente de volumen superior a 5.000 mensajes diarios. No se afirma que autenticación equivalga a permiso comercial. |
| `src/data/service-offer.ts` | Los cinco importes propios coinciden con el texto existente. El acceso web a la URL pública de precios falló en esta subrevisión; no se afirma una verificación de producción propia. |

**Aplicación del protocolo del proyecto:** no se añaden certificaciones, partnerships ni declaraciones de cumplimiento (Tier A). Las tarifas y cupos nuevos (Tier B) llevan fuentes y fecha. Las reglas técnicas (Tier C) se atribuyen al proveedor. Recomendaciones, alternativas y ejemplos (Tier D) se presentan como juicio editorial o supuestos. El ejemplo de retorno es aritmética sobre datos inventados y claramente etiquetados para explicar la cuenta, no evidencia de ahorro real. No se añade `factCheck.status: verified` para atribuir una auditoría integral al resto de cada artículo.

## Value for Client aplicado

- **CEO:** coste total y recuperación condicionada; posibilidad de no invertir si el beneficio neto no lo sostiene.
- **CMO:** mensaje alineado con problemas y decisiones reales; sin promesa de rankings, leads o ahorro atribuible al refresh.
- **CRO:** criterios claros para probar gratis, pagar, mantener manual o pedir alcance. La mejora de conversión es una hipótesis sin validar.
- **CXO:** coste de revisión, excepciones, responsables, alertas y salida; conservar lo que ya funciona.
- **Head of Sales:** software no equivale a implementación. La ficha operativa permite una conversación de alcance; presupuesto, acceso y urgencia de cada comprador siguen sin conocerse.

Rúbrica editorial breve (0 ausente, 1 genérico, 2 claro/parcial, 3 específico y respaldado): decisiones y aplicación pasan a 3 por tablas y pruebas concretas; fuentes para datos nuevos a 3 por enlaces oficiales y fecha; resultado demostrado de cliente queda **no evaluable**, porque no se añade evidencia primaria. No se calcula una media ni se interpreta como puntuación comercial.

Se conservan los argumentos originales sobre probar un flujo real, no comprar por número de integraciones, acotar alcance, derivar a una persona y medir el resultado. No se añade una función comercial ni un testimonio.

## Verificación local

- Las cuatro guías pasan el `guideSchema` real compilado con esbuild y parseo YAML; fechas de actualización comprobadas.
- `editorial.json` parsea y modifica exactamente cuatro claves existentes; sin altas ni bajas de entradas en esta subrevisión.
- La aritmética del ejemplo da 240 €/mes y 6,25 meses.
- `git diff --check` sin errores.
- No se ejecutó un benchmark funcional entre proveedores ni un envío real de WhatsApp/email. No hay afirmación de rendimiento relativo.
- El build y la revisión de la web completa quedan en la validación conjunta del agente principal para evitar outputs concurrentes.

Siguiente comprobación tras una publicación autorizada: presencia del contenido y fuentes en ES, resúmenes EN identificados como tales, enlaces internos y lectura móvil. Para medir utilidad, registrar uso de comparativas y calidad de las conversaciones de diagnóstico; no atribuir cambios comerciales con esta muestra de tráfico.
