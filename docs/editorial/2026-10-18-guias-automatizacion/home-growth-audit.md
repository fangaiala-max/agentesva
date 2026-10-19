# Auditoría de crecimiento de la home de AgentesVA

**Fecha:** 18 de octubre de 2026. **Veredicto: optimizar y medir.** La home ya explica una oferta comprensible: automatizar una tarea recurrente de un pequeño negocio, con alcance definido y aprobación humana. Tiene precios iniciales, ejemplos, criterios de decisión y un diagnóstico que entrega orientación antes de pedir el email. Conviene conservar esa base. Las prioridades son corregir una fricción móvil concreta, medir el valor recibido antes del contacto, conectar mejor demostración y siguiente paso, y desarrollar prueba real y adquisición por casos de uso.

La evidencia disponible no permite afirmar que la home «no convierte» ni que necesite un rediseño completo. Según la lectura de analítica recibida del responsable de la sesión, los últimos 28 días completos suman **5 usuarios, 8 sesiones y 9 vistas en la propiedad**, no necesariamente todos en la home. Esta muestra no sostiene inferencia causal de CRO, segmentación fiable ni un A/B test convencional.

Se aplica una perspectiva de dirección de growth marketing —adquisición, activación, avance comercial, valor para el cliente y aprendizaje— mediante los skills `homepage-audit` y `value-for-client`. No se encontró un skill instalado llamado Head of Growth Marketing; este informe no atribuye su autoría a una credencial o persona inexistente.

## 1. Alcance, clasificación y límites

**Tipo:** servicio de implementación/consultoría, con un medio y catálogo educativo secundarios; no es un SaaS de autoservicio. **Conversión principal propuesta para la home:** que alguien con un proceso adecuado reciba una orientación y solicite revisión de su caso cuando tenga sentido. Una reserva o un envío no equivalen todavía a oportunidad aceptada por ventas, cliente o ingreso.

Se inspeccionaron en producción [la home inglesa](https://agentesva.com/) y [la española](https://agentesva.com/es/), completas, con capturas de escritorio y de 390/320 px. Se abrió navegación editorial y menú móvil; se completaron los casos normal y de datos incompletos de soporte en la demo inglesa; se probó interacción de demo española; se llegó desde el CTA sticky al [diagnóstico](https://agentesva.com/assessment/), se completaron sus ocho preguntas con un caso ficticio de exploración y se verificó la recomendación anterior al email. Se siguió su enlace a una guía inglesa y se leyó [precios](https://agentesva.com/pricing/). No se enviaron contactos ficticios ni se reservaron citas.

El contraste técnico se hizo con `HomePage.astro`, `HomeEvidence.astro`, `HomeDecision.astro`, los dos componentes de demo, `diagnostico.ts`, `track.ts`, `service-offer.ts`, `ServicePage.astro` y `DESIGN.md`. La revisión parte de `fa29ea0`; cambios editoriales paralelos del equipo no se consideran publicados por aparecer en el checkout. El diseño vigente es English-first con DM Sans y paleta azul/violeta/rosa: no se recomienda recuperar la especificación histórica sustituida.

**Clases de evidencia:** observación = vista o interacción en producción; declaración = promesa de la oferta; lectura de código = comportamiento previsto por la versión revisada; dato recibido = verificación realizada por el responsable de la sesión; hipótesis = explicación o cambio pendiente de validar. No se consultaron llamadas, entrevistas, motivos de pérdida, CRM ni resultados de clientes. No se midió velocidad. `/how-we-work/` se revisó en fuente, sin completar recorrido visual. La conexión del navegador se interrumpió al guardar evidencia opcional de precios, después de restablecer el viewport.

Capturas y notas reproducibles: [índice de evidencia](../../../research/home-growth-evidence/README.md). La inspección anterior del 5 de octubre sirve de antecedente; varias mejoras de aquella revisión ya están presentes. No se vuelven a presentar como pendientes.

## 2. Lectura de cinco segundos y trabajo del cliente

**Se entiende:** hay un servicio para pequeños negocios; actúa sobre consultas, seguimiento de ventas y copia de datos; empieza por una tarea; el equipo conserva decisiones. Dos acciones claras: diagnóstico gratuito y demo. En 390 px ambas caben en el primer viewport observado. El titular tiene buena legibilidad y la animación no sustituye la explicación.

**Cuesta más distinguir:** por qué elegir a AgentesVA frente a configurar mejor el CRM, usar una integración nativa o contratar a otro implementador; qué entrega real respalda la capacidad; cuál es el esfuerzo del cliente en el primer proyecto. El titular comunica un beneficio general, mientras la especificidad vive en el subtítulo. Esto es una oportunidad de precisión, no prueba de que el titular provoque abandono.

Las siguientes son circunstancias descritas por el sitio, no personas compradoras investigadas:

| Circunstancia | Trabajo que el cliente necesita resolver | Valor ofrecido | Condición y alternativa |
|---|---|---|---|
| Preguntas repetidas de clientes | Preparar respuestas correctas y separar excepciones | Clasificación, borradores y derivación | Base aprobada, acceso y persona que revise; comparar con ayuda/plantillas ya disponibles |
| Consultas comerciales sin seguimiento estable | Saber quién atiende cada consulta y cuál es el siguiente contacto | Formulario→CRM, asignación y preparación de mensaje | CRM accesible y responsable; configurar su automatización nativa puede bastar |
| Copia de correos/documentos a otras herramientas | Registrar datos comprobados sin ocultar inconsistencias | Transferencia y validación | Reglas, ejemplos y permisos; comparar con integraciones existentes o ejecución interna |
| Proceso inestable o demanda todavía exploratoria | Elegir una tarea y medir si merece inversión | Orientación gratuita, recursos o taller si procede | No asumir urgencia/presupuesto; preparar el proceso o esperar puede ser correcto |

El comprador puede ser propietario o responsable de función; el usuario será quien opere el flujo; el beneficiario puede ser otro equipo o el cliente final. Esa separación se infiere de la oferta. No están documentados los decisores reales ni su disposición a pagar.

## 3. Estado de la página, bloque por bloque

| Bloque | Qué aporta y conviene conservar | Límite u oportunidad | Dictamen |
|---|---|---|---|
| Cabecera | Servicios, proceso y precios antes de exploración; idioma pareado; CTA principal | Rótulos del diagnóstico varían entre cabecera, hero y menú; la versión inglesa del diagnóstico conserva «INICIO» y «Ruta de navegación» | Optimizar consistencia, sin ampliar navegación |
| Hero | Beneficio comprensible, tres tareas concretas, aprobación humana, email después del resultado | Mensaje principal amplio; CTA inglés largo; en ES320 ocupa dos líneas y la explicación de 3 minutos queda bajo el primer viewport | Conservar estructura; probar copy más específico |
| Servicios | Situaciones reconocibles y una comprobación de utilidad por área | No hay evidencia de resultado en cliente; «qué medir» es un criterio, no un resultado logrado | Conservar; sumar evidencia cuando exista |
| Demo | Normal y excepción terminan correctamente en EN; no inventa fecha si falta referencia; explica revisión humana y simulación local | A 320 px la pestaña Operaciones queda parcialmente recortada en ambos idiomas. En ES, al seleccionarla, se observó recorte lateral del contenido de la consola. Salida comercial actual: «Explore this service»/«Explorar este servicio» | Corregir presentación estrecha; probar puente hacia evaluar la tarea |
| Decisión de inversión | Frecuencia, tiempo, herramientas/costes y personas/excepciones; reconoce que las herramientas existentes pueden bastar | Es un marco de reflexión, no una ficha guardable para aprobación interna | Conservar; desarrollar ficha solo si discovery demuestra su utilidad |
| Proceso y precios | Gratis→taller cuando hace falta→implementación; 300 €/1.500 €, 2–4 semanas condicionadas; IVA y terceros aparte | Alcance exacto y trabajo del cliente dependen de propuesta; no presentar «desde» como presupuesto cerrado | Conservar condiciones y comparar coste total |
| Entrega | Flujo, pruebas, documentación y formación con uso explícito; soporte separado | No se ha observado una entrega real, una aceptación o adopción por un cliente | Conservar; documentar entrega real autorizada |
| Conexiones | Categorías comprensibles y validación por permisos/alcance | No demuestra compatibilidad con una herramienta específica; es ilustración | Conservar límites; no convertir categorías en logos de supuestos partners |
| CTA de cierre y sticky | Repite acción con duración y compromiso; barra descartable | La barra ocupa parte del viewport estrecho; la interacción siguió siendo posible. No se demostró bloqueo general | Mantener descarte y comprobar que no tape foco/acciones al corregir demo |
| Recursos | Permite aprender antes de comprar y respeta visitantes sin encaje inmediato | Enlaces de categoría exigen otra decisión; pueden orientarse por tarea. La guía enlazada desde el resultado EN es una adaptación breve con enlace explícito a edición española completa | Optimizar entradas por intención, sin fingir equivalencia editorial completa |
| FAQ | Resuelve preparación, herramientas, precio, plazos, demo y soporte | No exige más contenido en hero; las respuestas ya están a disposición | Conservar; medir dudas reales antes de añadir FAQs |
| Quién está detrás | Fundadora y dirección editorial identificadas; contacto, perfiles, titular, metodología y documentación | Está al final; prueba identidad y proceso propio, sin acreditar resultados de clientes | Acercar una referencia factual breve al inicio y desarrollar casos reales |
| Footer | Rutas comerciales y editoriales separadas, privacidad y titular | Muchas salidas son razonables en pie; no constituyen por sí mismas dispersión perjudicial | Conservar |

**Móvil, delimitación del defecto:** el ancho global fue correcto en las lecturas realizadas: ES390 `scrollWidth=390`, ES320 `scrollWidth=320`, EN390 `scrollWidth=390`. El problema de demo es local: en ES320 su fila de pestañas tenía 262 px disponibles y 320 px de contenido. Esto no permite declarar que toda la web desborda ni atribuir aún una causa exacta de CSS. Véanse [pestañas recortadas](../../../research/home-growth-evidence/es-demo-mobile320.png) y [estado después de seleccionar Operaciones](../../../research/home-growth-evidence/es-demo-operations-mobile320.png).

**Continuidad idiomática:** homes y servicios principales están localizados; el selector del diagnóstico conserva sus parámetros. Hay un residuo español en breadcrumb del diagnóstico inglés. La documentación de demo es inglesa, expresamente etiquetada así desde ES. La guía de preparación EN comunica que es una adaptación breve. Son situaciones diferentes: corregir el residuo de interfaz; mantener transparentes las limitaciones de contenido; priorizar traducciones completas según demanda. No se declara auditado todo el sitio en ambos idiomas.

## 4. Valor y evidencia comercial

| Nivel | Estado confirmado o declarado |
|---|---|
| Valor comunicado | Menos repetición; tiempo disponible para clientes; seguimiento y registro más ordenados; decisiones humanas |
| Valor incluido, según oferta | Flujo acordado, pruebas, formación y documentación; soporte continuo separado. Precios completos contemplan varias integraciones desde 3.000 € y soporte desde 300 €/mes |
| Valor demostrado en esta revisión | Simulación local de soporte, manejo de dato ausente, documentación propia y orientación antes del contacto |
| Valor aún no demostrado públicamente en lo revisado | Ahorro, reducción de errores, fiabilidad, adopción, retorno o ingreso en clientes reales |
| Condiciones para recibirlo | Tarea estable, responsable, datos/ejemplos, herramientas accesibles, permisos, reglas de aprobación y alcance viable |

No se encontraron testimonios nominativos, logos de clientes ni cifras de resultados de clientes en el material revisado. Esto describe la prueba pública, no la inexistencia de clientes privados. No sustituir esa carencia con cifras sin trazabilidad, logos sin autorización o credenciales de marketing presentadas como evidencia de implementación.

Preguntas resueltas: qué tareas, qué intervención, primer paso, precio/plazo orientativos y control humano. Parciales: esfuerzo del cliente, justificación interna y diferenciación acreditada. Desconocidas por caso: magnitud del problema, decisores, retorno, urgencia e impacto. No hace falta que toda respuesta viva en la home; la propuesta y discovery deben completar las específicas.

**CEO:** buen mecanismo para empezar con alcance pequeño; rentabilidad del proveedor y retorno del comprador siguen sin datos. **CMO:** relevancia concreta, diferenciación pendiente de prueba y lenguaje de clientes reales. **CRO:** hay un camino practicable hasta orientación, con una fricción móvil localizada; falta distinguir activación de captación. **CXO:** formación y responsable están contemplados, pero la adopción no se ha observado. **Ventas:** la clasificación automática puede orientar una revisión; no acredita autoridad, necesidad económica, viabilidad o compromiso de compra.

## 5. Puntuación editorial, no medición de conversión

Rúbrica `homepage-audit`, 1–5. Las notas son juicio basado en inspección; no porcentajes de éxito, un benchmark validado ni un pronóstico de ventas.

| Sección | Elementos puntuados | Nota | Peso de la rúbrica |
|---|---|---:|---:|
| Primer pantallazo | Titular 4; subtítulo 5; CTA 4; visual 3; móvil 3; velocidad **no verificada** | Parcial: 3,8/5 en cinco elementos | 25% |
| Propuesta de valor | Beneficios 4; cliente específico 3; diferenciación 3; funciones→utilidad 4 | 3,5/5 | 25% |
| Prueba social | Testimonios de clientes 1; logos de clientes 1; cifras de resultados 1 | 1/5 | 10% |
| Claridad y copy | Escaneabilidad 4; concisión 4; lenguaje 4; beneficio frente a función 4 | 4/5 | 15% |
| CTA y conversión | Visibilidad 4; frecuencia 4; opción de bajo compromiso 5 | 4,3/5 | 15% |
| Confianza y riesgo | Precios 4; reducción de compromiso 3; objeciones 4 | 3,7/5 | 10% |

**Total ponderado: no calculado.** Falta una variable explícita de la rúbrica —velocidad— y no se rellena con una suposición ni se renormaliza silenciosamente. La ausencia de logos/testimonios pesa en prueba social; la identidad del equipo y transparencia sí sostienen confianza en la sección correspondiente. No se propone una garantía para mejorar una nota.

Rúbrica complementaria `value-for-client`, 0–3, sin media: problema **3**; circunstancias **2**; resultado **2**; intervención/utilidad **3**; casos **2**; relevancia/diferenciación **2**; evidencia **1**; dudas **3**; alcance/responsabilidad **2**; venta interna **2**; siguiente paso **3**; experiencia/adopción **2**. Confianza alta en lo que está escrito/observado, media en su utilidad comercial y baja en efectos de conversión. La debilidad de prueba real no queda oculta por la fortaleza de copy.

## 6. Cinco recomendaciones principales

Impacto y esfuerzo de 1–5 son estimaciones de priorización, no efectos medidos ni presupuestos. «Esta semana» indica secuencia sugerida; cualquier modificación del sitio requiere implementación y verificación posteriores a este informe.

| Recomendación | Impacto esperado | Esfuerzo | Secuencia | Confianza |
|---|---:|---:|---|---|
| R1. Corregir consola de demo en 320 px EN/ES | 4 | 2 | Esta semana | Alta en defecto; efecto comercial desconocido |
| R2. Separar activación, contacto y oportunidad real en medición | 5 | 2 | Esta semana: contrato/verificación; desarrollo según alcance | Alta en semántica de fuente |
| R3. Mejorar continuidad de CTA y consistencia del recorrido | 4 | 2 | Esta semana: copy y especificación; verificar después | Media sobre preferencia del comprador |
| R4. Crear prueba de entrega y valor real autorizada | 5 | 4 | Este mes; depende de acceso y permisos | Alta en carencia pública; disponibilidad desconocida |
| R5. Validar adquisición y mensaje por tarea con compradores reales | 5 | 4 | Este mes | Hipótesis; muestra comercial inexistente |

### R1. Consola móvil usable

**Problema:** tercer tab parcialmente oculto a 320 px y recorte del contenido al seleccionarlo en ES. **Cambio:** adaptar fila/anchos y contención para poder leer y accionar las tres áreas sin desplazar lateralmente el panel; mantener soporte de teclado y foco. No se prescribe un parche de CSS sin reproducirlo en desarrollo. **Tipo/responsable:** recorrido; frontend con diseño. **Dependencias:** comprobar los dos componentes, barra sticky y tamaños estrechos. **Aceptación:** a 320/390 px EN/ES se ven o descubren claramente las tres áreas, ningún texto esencial queda cortado, se ejecutan casos normales/excepción y el foco permanece visible. **Validación:** reproducción y recorrido manual antes/después; después observar uso, sin atribuir ventas al arreglo.

### R2. Medir el valor recibido y el avance real

**Problema:** el cliente recibe la recomendación antes de entregar el contacto, pero el evento `diagnostic_completed` de la fuente solo se emite después de un POST de contacto exitoso. La lista actual no separa explícitamente demo iniciada/finalizada o recomendación vista. **Cambio:** documentar semánticas actuales; añadir, si se implementa, un evento de orientación mostrada y eventos mínimos de demo; conservar contacto aceptado como otro hito. Vincular después reserva confirmada, oportunidad aceptada y proyecto con un registro comercial. No redefinir el evento existente sin migración/versionado. **Tipo/responsable:** medición; growth/analítica con frontend y responsable comercial. **Dependencias:** consentimiento, allowlist, comprobación de duplicados, trazabilidad de backend y datos reales de ventas. **Aceptación:** una prueba local sin email produce activación, cero leads; un envío exitoso produce un contacto; solo una regla explícita marca cualificación automática y revisión comercial separada. No enviar email, texto de proceso ni respuestas libres a GA4. **Hipótesis:** distinguir hitos permitirá localizar dónde termina la utilidad y dónde empieza el avance comercial; no promete más demanda.

### R3. Mantener el contexto del ejemplo al siguiente paso

**Problema:** la demo termina en un enlace genérico al servicio; el CTA general es largo; breadcrumb inglés parcialmente español. **Cambio:** corregir breadcrumb; probar un CTA corto y uniforme; conservar «Explorar este servicio» como acción secundaria y añadir/ensayar evaluación del caso mostrado con contexto de área, sin fingir que la simulación diagnostica el negocio real. Acercar una línea factual con nombres y enlace al bloque de equipo puede hacer su identidad más descubrible sin inventar prueba. **Tipo/responsable:** contenido/recorrido; contenido y frontend. **Dependencias:** validar destino, idioma y conservación del parámetro de intención; no preseleccionar respuestas sin avisar. **Aceptación:** rótulo/destino/compromiso coinciden; interfaz EN en inglés; CTA legible a 320 px; se puede cambiar de área libremente. **Hipótesis:** visitantes que entienden un ejemplo podrán explicar mejor qué sucede después y empezar una evaluación relevante. Comprobar primero comprensión; tasas, cuando haya muestra.

### R4. Evidencia de cliente antes de nuevas promesas

**Problema:** la demo acredita explicación, sin acreditar una implementación o beneficio real. **Cambio:** investigar si existe entrega autorizable. Documentar situación, volumen, referencia previa, alcance, herramientas, revisión humana, periodo, resultado observado, esfuerzo del cliente, aceptación y límites. Si no existe, diseñar un piloto real acotado con responsable y condiciones; hasta entonces conservar la simulación como tal. **Tipo/responsable:** investigación/operación/contenido; implementación y ventas. **Dependencias:** datos, autorización, confidencialidad y capacidad. **Aceptación:** cualquier cifra tiene fuente/periodo/denominador; ahorro neto contempla controles, licencias y mantenimiento; no atribuir causalidad superior a la evidencia. **Validación:** qué objeción resuelve en discovery, posibilidad de justificar inversión y adopción efectiva, además de visitas al caso.

### R5. Crecimiento por problema resuelto, con investigación primaria

**Problema:** el volumen observado limita aprendizaje cuantitativo. La home atiende tres necesidades distintas y el medio ofrece múltiples categorías. **Cambio:** elegir inicialmente una tarea comercial concreta según acceso a compradores y capacidad real; entrevistar/observar personas responsables, revisar alternativas y motivos para no invertir. Como punto de partida operativo, 5–8 conversaciones pueden revelar lenguaje y dudas; es una muestra de conveniencia y no representación estadística. Conectar una guía útil sobre esa tarea, la página de servicio y un siguiente paso; distribuirla donde ya exista audiencia pertinente, sin publicaciones o mensajes no autorizados. Extender a las otras áreas cuando haya evidencia. **Tipo/responsable:** adquisición/investigación; growth y ventas con contenido. **Dependencias:** público, canales accesibles, entrevistas autorizadas y registro de origen/calidad. **Aceptación:** cada pieza responde una intención, enlaza el paso pertinente, diferencia recurso de servicio y tiene fuente/fecha; conversación comercial registra problema, alternativa, decisor y condición para avanzar. **Hipótesis:** contenido específico atraerá menos visitas irrelevantes y más conversaciones con tarea, responsable y criterio de éxito claros. No comprar volumen amplio para compensar desconocimiento del encaje.

## 7. Reescrituras concretas EN/ES

Son propuestas para probar, no cambios aplicados. No añaden ahorros, garantías, clientes ni compatibilidades inexistentes. No es necesario reemplazar todos los textos a la vez.

### Headline Rewrite

**Current:**
> “Less repetitive work. More time for customers.”
> «Menos tareas repetidas. Más tiempo para tus clientes.»

**Why it's weak:** el resultado es comprensible, pero amplio; necesita el subtítulo para identificar qué trabajo y para quién. No se ha medido que esta amplitud reduzca conversión.

**Rewritten:**
> “Automate your small business’s customer enquiries, follow-up and data entry.”
> «Automatiza las consultas, el seguimiento y el registro de datos de tu pyme.»

**Why it's stronger:** reúne cliente y tareas en el titular; facilita reconocer el servicio. Sacrifica parte de la emoción y brevedad actuales, por lo que es una alternativa que debe comprobarse, no un ganador declarado.

**Alternate version:**
> “Start with one recurring task. Keep your team in control.”
> «Empieza por una tarea recurrente. Tu equipo mantiene el control.»

| Pieza | Antes exacto | Después propuesto |
|---|---|---|
| Subtítulo EN | “We build AI workflows for customer enquiries, sales follow-up, and copying data between tools. Start with one recurring task. Your team decides what needs approval.” | “We design and build one workflow around the tools you use, with agreed checks and human approval. Start by checking whether your process is a good fit.” |
| Subtítulo ES | «Creamos automatizaciones con IA para responder consultas, hacer seguimiento comercial y pasar datos entre herramientas. Empezamos por una tarea recurrente. Tu equipo decide qué necesita aprobación.» | «Diseñamos e implementamos un flujo con tus herramientas, comprobaciones acordadas y aprobación humana. Empieza por comprobar si tu proceso tiene encaje.» |
| CTA principal EN/ES | “Get my free automation assessment” / «Obtener mi diagnóstico gratuito» | “Assess my process — free” / «Evaluar mi proceso gratis» |
| Garantía de compromiso EN/ES | “8 questions · About 3 minutes · See your recommendation before sharing your email.” / «8 preguntas · Unos 3 minutos · Ve tu recomendación antes de dejar tu email.» | **Conservar.** Describe el recorrido comprobado; no necesita reescritura para justificar esta auditoría. |
| Demo: salida EN/ES | “Explore this service ↗” / «Explorar este servicio ↗» | Mantener como secundaria y probar “Could this fit my process?” / «¿Encaja con mi proceso?» hacia diagnóstico con área identificada y editable |
| Demo: encabezado ES | «Prueba una automatización.» | «Prueba el flujo. Revisa las excepciones.»; mantener etiqueta de simulación local |
| Breadcrumb diagnóstico EN | “INICIO”; nombre accesible “Ruta de navegación” | “Home”; nombre accesible “Breadcrumb” |
| Recursos: guía EN/ES | “Read a practical guide” / «Lee una guía práctica» | “Choose your first process to automate” / «Elige qué proceso automatizar primero» hacia la guía correspondiente, si se prioriza esa intención |
| Recursos: coste EN/ES | No existe enlace específico de coste en este bloque | Propuesta opcional: “Understand the cost before you invest” / «Entiende el coste antes de invertir»; usar solo con guía revisada y publicada |

**Microprueba de identidad propuesta, sin promesa de resultado:** EN: “Founded by Elizabeth Salguero. Strategy and editorial direction: Fernando Angulo. Meet the team.” ES: «Fundadora: Elizabeth Salguero. Estrategia y dirección editorial: Fernando Angulo. Conoce al equipo.» Basada en atribuciones actuales; no denominarla testimonio ni caso de éxito.

No se propone sustituir las condiciones por «recupera X horas», «aumenta tus ventas» o «funciona con cualquier herramienta». Solo podría publicarse una afirmación así con evidencia y alcance adecuados.

## 8. Medición y experimentos adecuados al estado actual

**Datos recibidos del responsable de la sesión, no leídos en vivo por esta auditoría:** 20 de septiembre–17 de octubre, 5 usuarios/8 sesiones/9 vistas y un evento clave que era `form_start`; el 18 de octubre se desmarcó `form_start` y se marcaron `diagnostic_completed` y `lead_qualified`. Se verificó además un visitante de prueba en tiempo real con dos vistas. Search Console: propiedad raíz verificada, sitemap en estado Success, home indexada e informes generales procesándose. Esto confirma configuraciones y observaciones puntuales; no acredita crecimiento, tráfico orgánico estable, ranking ni una conversión comercial real.

**Lectura de fuente propia:** `diagnostic_started` se emite al avanzar tras la primera respuesta válida; `diagnostic_step_completed` incluye paso 8 cuando se genera orientación; `diagnostic_completed` exige contacto aceptado por backend; `lead_qualified` añade clasificación automática `qualified_call`. La regla utiliza recurrencia, inversión, plazo, descripción y riesgos; no confirma un deal. `booking_started` es clic de salida; la existencia de un nombre `booking_completed` en el contrato no demuestra recepción de reservas confirmadas.

Funnel propuesto para especificar y verificar:

| Hito | Qué significa | Estado actual revisado | Denominador útil |
|---|---|---|---|
| Visita pertinente | Entrada de persona de audiencia/canal definido | No identificable solo por pageview | Usuarios/sesiones por canal e idioma, con límites de consentimiento |
| Inicio diagnóstico | Primera respuesta válida y avance | Evento en fuente | Visitantes que llegaron al diagnóstico |
| Orientación mostrada | Ocho pasos completos y resultado visible sin email | Paso 8 existe; evento explícito propuesto | Diagnósticos iniciados |
| Contacto aceptado | Petición voluntaria recibida correctamente | `diagnostic_completed` en fuente; marcado clave según responsable | Personas que vieron recomendación; separar por tipo de resultado |
| Cualificación automática | Regla del diagnóstico indica revisión de implementación | `lead_qualified`; no aceptación de ventas | Contactos aceptados |
| Reserva confirmada | Proveedor confirma reserva, no clic | No verificada | Contactos pertinentes o clics de reserva, según pregunta |
| Oportunidad aceptada | Problema, responsable, viabilidad y siguiente decisión documentados | No verificada en CRM | Contactos revisados por ventas |
| Proyecto y valor | Contrato/proyecto y resultado/adopción comprobados | No verificados | Oportunidades y entregas con periodo comparable |

No sumar `diagnostic_completed` + `lead_qualified` como dos leads distintos: una persona puede generar ambos. No sumar automáticamente eventos repetidos como personas. Las visitas y pasos de esta auditoría deben reconocerse como pruebas; no se envió contacto. La analítica condicionada por consentimiento no representa a todos los visitantes.

| Prueba | Hipótesis y método | Señal de decisión | Qué no concluye |
|---|---|---|---|
| Comprensión de hero | Mostrar versión actual y una alternativa, en orden alternado, a personas del público; preguntar qué se compra, para quién y qué ocurre al pulsar | Respuestas correctas y dudas recurrentes, con notas literales autorizadas | Preferencia en una muestra pequeña no estima uplift |
| Uso de demo estrecha | Reproducir casos EN/ES320/390 y pedir ejecutar excepción sin ayuda | Tarea completada, controles legibles, ausencia de recorte y errores de expectativa | Corrección visual no prueba incremento de ventas |
| Valor antes del email | Verificar evento y utilidad de recomendación con casos de preparación/implementación/riesgo | Hitos separados, recomendación comprensible y siguiente paso pertinente | Completar ocho preguntas no es lead comercial |
| Entrada por caso de uso | Distribuir una guía revisada a una audiencia pertinente con origen identificable; registrar contexto de cada conversación | Lectura útil, evaluación de proceso y conversaciones con problema/propietario claros; incluir no encaje | Un canal de conveniencia no demuestra superioridad sobre todos los canales |
| Caso real | Usar una ficha autorizada en conversaciones y registrar dudas antes/después | Mayor capacidad de verificar alcance, economía y criterio de aceptación | Una venta aislada no identifica causalidad del caso |

No se fija un tamaño universal ni una meta arbitraria de conversión. Con tráfico suficiente, definir antes del test: métrica primaria, unidad, conversión base, efecto mínimo relevante, potencia, horizonte y reglas de parada. Ahora conviene acumular observaciones cualitativas y recuentos auditables, evitando proclamar ganadores con cinco usuarios.

## 9. Secuencia y criterios de cierre

**Primero:** reproducir/corregir demo320, cerrar contrato de eventos y semántica comercial, corregir breadcrumb y especificar el puente de CTA. **Después:** investigar prueba real y una tarea/canal para adquisición; publicar únicamente piezas autorizadas y verificadas. **Con evidencia nueva:** decidir si merece cambiar hero, completar traducciones o crear una ficha económica.

La revisión queda entregada cuando el equipo puede distinguir qué conserva, qué defecto reproduce, qué hipótesis prueba y qué evidencia falta. Una implementación posterior debe aportar capturas EN/ES320/390, recorrido normal/excepción, prueba de eventos con/sin consentimiento y cero contactos ficticios, y readback de destinos/idiomas. Para velocidad: ejecutar medición reproducible de laboratorio y consultar campo cuando exista muestra; no reducir una nota ni atribuir lentitud sin medirla.

**Autocrítica:** se puntuaron las seis áreas con velocidad explícitamente no evaluable; se mantuvo la clasificación de servicio y la nota no se hizo pasar por conversión. No hay benchmark competitivo investigado: las alternativas citadas son opciones de decisión, sin afirmar precios o prestaciones superiores de terceros. La muestra de analítica y la falta de investigación primaria limitan prioridades de mensaje y adquisición. Los esfuerzos dependen de reproducción y alcance; producir un caso real puede requerir más de un mes. No se fuerzan cambios de oferta, garantías ni testimonios para satisfacer la rúbrica. Este informe no modifica ni publica la web.
