# Revisión de oportunidades 21st.dev y paridad EN/ES

Fecha: 2026-09-06. Base: main, commits d189fe8 y 4c0e65e.

## Estado de implementación — 2026-09-06

La revisión original que aparece debajo se ha ejecutado. Cambios aplicados localmente; no publicados en esta iteración.

- 01, 06, 07: menú móvil con diagnóstico, desplegable de seis recursos, búsqueda Pagefind en EN/ES. Los CTAs guardan placement, servicio y opción; cambiar el idioma del diagnóstico conserva ese contexto.
- 02, 03: un directorio y una ficha compartidos para las 54 herramientas y sus categorías. Comparación de dos herramientas, destacados, pestañas con teclado, guardado local, FAQs, alternativas, enlaces de clúster y CTA según categoría. Datos estructurados SoftwareApplication, FAQPage y BreadcrumbList conservados.
- 04, 05, 12: precios numéricos centralizados; misma tabla de tres opciones, entrada gratuita y soporte mensual separado. Cada opción tiene una acción que guarda su intención.
- 08, 09, 10, 11, 13: home compartida con hero animado localizado; timeline de seis fases con responsable y entregable; explicación de flujo normal/excepción; criterios de encaje, FAQs y banner de conversión comunes.
- 14: resumen de respuestas antes del envío; suscripción solo confirma éxito cuando el servidor devuelve `success: true`, con error localizado y reintento. La reparación operativa de Brevo y el reenvío sigue pendiente de acceso a esas cuentas; no se ha validado entrega de emails en esta iteración.
- 15: directorios de cursos y recursos compartidos, con búsqueda, categoría, nivel/formato, acceso e idioma del material. Se conservan las fichas extensas, descargas y biblioteca españolas; no se presentan como materiales traducidos al inglés. Las versiones inglesas indican el idioma real antes del CTA.
- 16: 20 de 54 identidades con logos SVG locales (4 anteriores + 16 recuperados mediante búsqueda de 21st.dev/SVGL). Se consultaron las marcas restantes; las coincidencias inexistentes o incorrectas se descartaron. Se mantiene un icono neutral para 34 marcas; no se inventaron logos ni capturas de producto.

### Referencias realmente consultadas

Se recuperó el código de los seis candidatos nuevos con `21st.get_component`: 18191, 21218, 1943, 1414, 435 y 1530. Se aplicaron sus patrones de jerarquía, comparación, recorrido y divulgación a componentes Astro nativos. No se instalaron las dependencias React/Radix/Motion de esos ejemplos ni se afirma que su código se haya copiado íntegro. El desplazamiento dirigido de la timeline se sustituyó por lectura libre con detalles nativos. Las pestañas de herramientas y el hero mantienen las adaptaciones 21st ya existentes (1115 y 919).

Procedencia de los nuevos logos: `src/data/tool-logo-sources.json`. Componentes nuevos: `src/components/shared/`. Se mantienen la paleta Gemini y la tipografía aprobadas.

### Validación realizada

- `npm test`: 505 pruebas aprobadas en 60 archivos.
- `npm run build`: aprobado, con comprobaciones del postbuild sobre 128 páginas (20 páginas principales + 108 fichas). Verifica rutas, menús, búsqueda, tablas, intención de precio, timeline, tabs y schemas.
- Navegador sobre el build real: 50 combinaciones (10 páginas × 320, 390, 768, 1024 y 1440 px), sin desbordamiento horizontal de página. Las tablas conservan scroll interior.
- Comparación Claude/Canva en español, menú móvil, búsqueda EN/ES y cambio de idioma del diagnóstico con parámetros comprobados. Capturas revisadas de home móvil, precios y destacados.
- No se afirma una auditoría WCAG completa ni entrega efectiva de emails. El contenido editorial largo EN sigue identificado como adaptación cuando corresponde.

## Revisión original (registro previo a la implementación)

## Alcance y evidencia

Inspección del código compartido y de 16 rutas locales: home, servicios, precios, proceso, catálogo, ficha Claude, diagnóstico y newsletter, en ambos idiomas. Las 16 respondieron HTTP 200. Se inventariaron encabezados, tablas, pestañas, controles de comparación y destinos de CTA. Se consultó el catálogo real de 21st.dev por MCP. La siguiente comprobación visual/móvil fue bloqueada por el límite de uso de herramientas; no se considera completada. Este documento es una revisión y especificación de implementación, no una afirmación de cambios aplicados.

## Hallazgos y componentes propuestos

| ID / prioridad | Ubicación y evidencia | Implementación propuesta | Referencia 21st.dev | Criterio de aceptación EN/ES |
|---|---|---|---|---|
| 01 / P0 | `SiteHeader.astro`: a menos de 600 px se oculta `.studio-cta`; `#site-nav` solo contiene cuatro enlaces y ninguno al diagnóstico. Hallazgo de código, pendiente de comprobación visual móvil. | Menú móvil con CTA persistente dentro del panel y navegación agrupada por servicios y recursos. | Rich Navigation Menu, shadcnui-blocks, 18191 | CTA visible al abrir el menú a 390 px, foco correcto, Escape y cierre al navegar; destino localizado. |
| 02 / P0 | `/tools/`: 54 botones de comparación, destacados y contacto para marcas. `/herramientas/`: ninguno de esos controles. | Extraer un `ToolDirectory` compartido con locale, datos traducidos y el comparador existente. | Expanding Cards 5526 + Comparison Table 7469, ya adaptados | Misma selección editorial, comparación de dos herramientas, filtros, estados y contacto para marcas en ambas rutas y categorías. |
| 03 / P0 | `/tools/claude/`: tres pestañas. `/herramienta/claude/`: sin pestañas, pero contiene FAQs, alternativas y más CTA contextuales. | Una ficha compartida que reúna las funciones útiles de ambas versiones. Conservar FAQs, alternativas y enlaces contextuales al traducir. | Animated Tabs, ibelick, 1115, ya adaptado | Las 54 parejas tienen las mismas secciones y acciones; teclas de flecha/Home/End, alternativas reales y avisos de afiliación equivalentes. |
| 04 / P0 | `/pricing/` tiene tabla con tres opciones y soporte aparte. `/precios-automatizacion-ia/` tiene cinco tarjetas sin tabla. | Comparación común: diagnóstico gratuito como entrada; taller, primera implementación e integraciones comparables; soporte separado por ser recurrente. | Feature Comparison Table, 7ovr, 21218 | Mismos importes, alcance, exclusiones y duración; acciones por opción; tabla accesible con desplazamiento interno y alternativa legible en móvil. |
| 05 / P0 | Inglés escribe los precios directamente en `ServicePage.astro`; español usa `SERVICE_OFFER`. | Una fuente de datos de ofertas con importes y claves estables, etiquetas localizadas y formato monetario por idioma. | Base de datos compartida del componente 21218; no exige otro componente | Modificar un importe actualiza home, servicios, tabla, soporte y datos estructurados de ambos idiomas. |
| 06 / P0 | CTA de servicios/precios enlazan al diagnóstico sin query; `diagnostico.ts` lee `placement` y `service` desde query. Los atributos de tracking del botón no transportan esos valores por sí solos. | `AssessmentCTA` compartido que añada servicio, origen y opción de precio a la URL, y registre el evento correspondiente. | Call to action, tommyjepsen, 1414, como presentación | El lead conserva servicio y ubicación de origen; ninguna promesa de preselección hasta implementarla; EN/ES llegan a su ruta correcta. |
| 07 / P1 | `SiteHeader.astro`: búsqueda y SearchModal solo existen en ES; “Explore AI” lleva únicamente al catálogo. | Navegación desplegable con Tools/Herramientas, Courses/Cursos, Guides/Guías, Research/Estudios y Resources/Recursos; búsqueda localizada con Pagefind. | Rich Navigation Menu 18191 | Misma arquitectura y capacidad de búsqueda; idioma de resultados controlado; subrutas mantienen marcada la sección activa. |
| 08 / P1 | Las dos páginas de proceso contienen seis fases, pero con layouts y profundidad distintos. | Timeline con fase, responsable, entregable y criterio para avanzar. Mantener toda la información disponible sin depender de animación o scroll. | Process Timeline, youcefbnm, 1943 | Seis fases equivalentes; sin scroll forzado; versión estática con movimiento reducido; lectura vertical en móvil. |
| 09 / P1 | Home y páginas de servicios explican flujos con componentes distintos; la demo nativa ya ofrece tres modos. | Reutilizar la demo por servicio e incorporar entradas → automatización → revisión humana → resultado, con caso normal y excepción. | Animated Beam 919 existente + Tabs, originui, 435 | Mismo ejemplo y excepción traducidos; conservar controles funcionales existentes; un CTA contextual después de entender el ejemplo. |
| 10 / P1 | Home EN tiene ChaosFlow; home ES conserva otra composición y da prioridad visual a “Ver una demo”. | Un hero común con una misma jerarquía comercial y copy adaptado: diagnóstico principal, demo secundaria. | Adaptación existente Animated Beam 919 / ChaosFlow | Igual movimiento, pausa/repetición y alternativa estática; longitud de texto española sin solapamientos. |
| 11 / P1 | CTA de cierre y banners tienen estilos, copy y seguimiento dispares. | `ConversionBanner` común: una pregunta contextual, una frase de valor, CTA principal y como máximo uno secundario. Barra móvil solo después de salir del CTA principal. | Call to action 1414 | No tapa controles, consentimiento ni barra del comparador; se puede cerrar; no aparece durante la cumplimentación del formulario. |
| 12 / P1 | Precios muestran niveles, pero las opciones no tienen acciones propias. | “Scope this workshop / Definir este taller”, “Assess this workflow / Evaluar este flujo”, “Discuss support / Consultar soporte”, conectados a una intención explícita. | Botones de la tabla 21218 + CTA 1414 | Mantener contexto de opción; no usar “Comprar” para un precio indicativo ni simular un checkout inexistente. |
| 13 / P1 | FAQs nativas ya funcionan; español e inglés no siempre muestran el mismo conjunto. | Unificar contenido y estilo conservando `details/summary`; adaptar solo el patrón visual necesario. | Accordion, shadcn, 1530 | Preguntas equivalentes, respuestas disponibles sin JS, teclado nativo y estado abierto perceptible. |
| 14 / P1 | Diagnósticos tienen la mayor paridad actual: ocho pasos y mismo script. Newsletter usa Brevo y falló con 401 en la prueba real. | Mantener cuestionario; reforzar resumen antes de enviar y mensajes de envío/error/éxito. No añadir banners que promuevan un formulario con entrega fallida. | Reutilizar patrones de CTA/Accordion; no reemplazar la lógica por un formulario de demostración | Éxito solo después de respuesta válida; errores localizados; reintento seguro; prueba real de entrega separada de la revisión visual. |
| 15 / P2 | Catálogos de cursos/recursos usan plantillas distintas por idioma; no inspeccionados individualmente en navegador en esta revisión. | Revisar y consolidar cards: propósito, idioma del recurso, tipo de acceso, perfil y acción comercial diferenciados. | Patrón de cards existente; evaluar nueva pieza solo si resuelve una carencia concreta | Paridad de etiquetas y acciones, indicar contenido disponible solo en español; no introducir compra donde solo existe enlace informativo. |
| 16 / P2 | Solo cuatro herramientas tienen logos locales verificados; el resto usa un símbolo genérico. | Completar logos mediante búsqueda 21st/SVGL y añadir capturas autorizadas cuando existan. Mantener las ilustraciones identificadas. | `search_logo` de 21st.dev | Sin logos inventados, imágenes estables y dimensiones reservadas; misma imagen y alternativa localizada en ambas fichas. |

## Referencias exactas

- Rich Navigation Menu 18191: https://21st.dev/@shadcnui-blocks/components/navigation-menu-06
- Feature Comparison Table 21218: https://21st.dev/@7ovr/components/comparison-3
- Process Timeline 1943: https://21st.dev/@youcefbnm/components/process-timeline
- Call to action 1414: https://21st.dev/@tommyjepsen/components/call-to-action
- Tabs 435: https://21st.dev/@originui/components/tabs
- Accordion 1530: https://21st.dev/@shadcn/components/accordion
- Expanding Cards 5526: https://21st.dev/@vaib215/components/expanding-cards
- Animated Tabs 1115: https://21st.dev/@ibelick/components/animated-tabs
- Comparison Table 7469: https://21st.dev/@ruixen.ui/components/comparison-table
- Animated Beam 919: https://21st.dev/@dillionverma/components/animated-beam

Los seis candidatos nuevos se verificaron en resultados del catálogo (metadatos); no se ha inspeccionado todavía su código ni se garantiza instalación directa. Los cuatro patrones existentes ya se recuperaron/adaptaron anteriormente. Se descarta el CTA Banner 19341 de estilo Tron: luces, scanlines y decoración no aportan claridad a este recorrido.

## Arquitectura de paridad

Mantener URLs existentes y prioridad inglesa. Una plantilla por familia, con `locale` y diccionario; no dos copias que vuelvan a divergir. Compartir Header, AssessmentCTA, ConversionBanner, PricingComparison, ProcessTimeline, ToolDirectory, ToolProfile y FAQ. Las ofertas, IDs de herramientas, destinos y nombres de eventos son independientes del idioma. Localizar labels, aria-labels, estados, texto alternativo, moneda y contenido editorial. Preservar hreflang, canonical, structured data y enlaces relacionados al migrar.

Recorrido: necesidad → ejemplo y excepción → alcance/precio → diagnóstico contextual → confirmación → siguiente paso. Para herramientas: tarea → perfil/comparación → proveedor o evaluación del proceso. Para marcas: criterios editoriales → presentar herramienta o colaboración → contacto real.

## Estados de interacción obligatorios

| Elemento | Inicial / vacío | Progreso | Error | Resultado / parcial |
|---|---|---|---|---|
| Menú/búsqueda | Cerrado; búsqueda sin consulta | Indicar carga de índice si procede | Mensaje y enlaces de navegación alternativos | Resultados localizados; cero resultados con limpiar búsqueda |
| Comparador | Sin selección | Una herramienta: elegir otra | Datos ausentes: indicar “no disponible”, no inventar valores | Dos seleccionadas; quitar/cambiar; Escape y retorno de foco |
| Precios | Tabla completa | No fingir cálculo | Dato sin verificar: remitir a alcance confirmado | Opción elegida conserva intención al diagnóstico |
| Diagnóstico | Paso y campos requeridos | Enviando con bloqueo de doble envío | Mensaje traducido y reintento | Confirmación validada; conservar datos si falla |
| Timeline/demo | Contenido accesible estático | Paso/caso activo anunciado | No ocultar información si falla JS | Mostrar salida y excepción con responsable humano |
| Banner | Visible solo en contexto pertinente | No aplica | Enlace alternativo si formulario no operativo | Cierre respetado; sin apilarse sobre otras barras |

## Criterios visuales y técnicos

Conservar Gemini y DM Sans aprobados. Un foco de movimiento por sección; no añadir carruseles sin propósito, rankings inventados, contadores de urgencia, descuentos ni testimonios ficticios. Adaptar las referencias React a Astro cuando sea razonable; decidir dependencias tras leer el código del componente.

Validar 390, 768 y 1440 px; zoom 200%; teclado, foco visible, contraste, movimiento reducido, menús largos en español, tablas con encabezados y scroll interno. El contraste y estos tamaños son criterios de aceptación pendientes, no resultados de esta auditoría. Un test de paridad debe recorrer las parejas de `src/i18n/routes.ts` y comprobar acciones, componentes y destinos equivalentes, sin exigir texto idéntico.

## Orden de implementación

1. Compartir datos de ofertas, CTA contextual y navegación móvil (01, 05, 06, 07).
2. Igualar catálogo y fichas preservando lo útil de ES y EN (02, 03, 16).
3. Unificar precios, acciones por opción y cierre de conversión (04, 11, 12).
4. Unificar hero, explicación de servicios, timeline y FAQs (08, 09, 10, 13).
5. Verificar formularios y extender el sistema a cursos/recursos (14, 15).

No considerar finalizada una familia hasta que su pareja EN/ES pase la misma prueba de interacción. La reparación de Brevo y el reenvío siguen siendo una dependencia operativa independiente.

## Revisión de las siete dimensiones

| Dimensión | Hallazgo / decisión propuesta |
|---|---|
| Arquitectura de información | Header incompleto para exploración; agrupar servicios y recursos y conservar CTA móvil. |
| Estados | Conservar validación existente y especificar vacío/error/parcial para los componentes nuevos. |
| Recorrido | Conectar ejemplo, inversión e intención del diagnóstico; diferenciar visitante comprador de marca colaboradora. |
| Personalidad visual | Mantener identidad aprobada y corregir repeticiones; priorizar contenido y función sobre efectos. |
| Sistema de diseño | Paridad requiere componentes compartidos, no solo variables de color comunes. |
| Responsive/accesibilidad | Detectado CTA móvil oculto por CSS; validación visual móvil de esta revisión pendiente por límite de herramientas. |
| Decisiones pendientes | Código y coste de dependencias de candidatos nuevos; capturas de producto autorizadas; configuración de correo. |

## GSTACK REVIEW REPORT

| Review | Runs | Status | Findings |
|---|---|---|---|
| Revisión de oportunidades y paridad | 1 | Completada con límites declarados | 16 oportunidades; 6 prioridades P0; 16 rutas inspeccionadas. |
| Verificación visual móvil adicional | 0 | Bloqueada | Límite de uso de herramientas comunicado por revisión automática. |
| Implementación de esta propuesta | 0 | No realizada | Este documento no modifica la aplicación. |

VERDICT: Priorizar paridad y conversión; validar código de componentes nuevos antes de integrar.

**UNRESOLVED DECISIONS:**
- Leer y evaluar dependencias de los seis candidatos nuevos antes de elegir su adaptación definitiva.
- Completar pruebas visuales y de accesibilidad pendientes cuando vuelva a estar disponible el navegador.
- Completar la autenticación de Brevo, remitente y reenvío para verificar conversión real.
