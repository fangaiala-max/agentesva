# Mapa SEO comercial — AgentesVA

**Actualizado:** 5 ago 2026  
**Objetivo:** separar intención informativa, comparativa y comercial para que cada query tenga una URL canónica y un siguiente paso medible.

## Reglas de arquitectura

- Las páginas `/servicios/` capturan intención comercial y de implementación.
- Las guías responden una decisión concreta y enlazan al servicio, pero no intentan posicionar por “servicio de…”.
- Los estudios comparan herramientas; las fichas evalúan una marca; ninguna debe competir con una guía por problema.
- Cada pieza nueva debe declarar query primaria, intención, madre, CTA y enlaces antes de publicarse.
- “Automatizar tareas” permanece en el estudio existente; la guía nueva atacará “qué procesos automatizar primero”.

## Páginas comerciales canónicas

| URL | Intención | Query primaria | Variantes | CTA | Página madre | Enlaces previstos |
|---|---|---|---|---|---|---|
| `/servicios/` | Comercial | servicios de automatización con IA | consultoría automatización IA; automatización para PyMEs | Diagnóstico | Home | 3 verticales, precios, proceso |
| `/servicios/automatizacion-atencion-cliente/` | Comercial | automatización atención al cliente | automatizar soporte; IA atención al cliente empresa | Diagnóstico contextual | Servicios | chatbot PyME, WhatsApp, estudio de atención |
| `/servicios/automatizacion-ventas/` | Comercial | automatización de ventas | automatizar seguimiento de leads; automatización CRM | Diagnóstico contextual | Servicios | guía de leads, WhatsApp, marketing |
| `/servicios/automatizacion-procesos/` | Comercial | automatización de procesos con IA | automatizar procesos PyME; automatización administrativa | Diagnóstico contextual | Servicios | procesos prioritarios, comparativa no-code, coste |
| `/precios-automatizacion-ia/` | Comercial | precio automatización con IA | cuánto cuesta automatizar una empresa; coste automatización PyME | Diagnóstico | Servicios | guía de coste, proceso, 3 verticales |
| `/como-trabajamos/` | Comercial de confianza | cómo implementar automatización con IA | proyecto automatización fases; consultoría automatización proceso | Diagnóstico | Servicios | precio, casos, verticales |
| `/diagnostico-automatizacion-ia/` | Transaccional | diagnóstico de automatización | qué automatizar en mi empresa; evaluar automatización | Completar formulario | Home/Servicios | resultado, gracias |

## Seis piezas GROW-019

| Slug propuesto | Intención | Query primaria | Secundarias | Madre | CTA | Enlaces internos obligatorios |
|---|---|---|---|---|---|---|
| `/guias/chatbot-para-pymes/` | Informativa → comercial | chatbot para PyMEs | chatbot atención al cliente; bot para empresa | Atención al cliente | Ver servicio | estudio atención, WhatsApp, Tidio/Landbot/ManyChat |
| `/guias/automatizar-whatsapp-empresa/` | Informativa → comercial | automatizar WhatsApp empresa | automatizar WhatsApp Business; bot WhatsApp PyME | Atención / Ventas | Evaluar canal | estudio WhatsApp, Wati/ManyChat/Chatfuel, 2 servicios |
| `/guias/automatizar-seguimiento-de-leads/` | Problema → comercial | automatizar seguimiento de leads | seguimiento CRM automático; no perder leads | Ventas | Ver servicio | HubSpot, Make, formularios, precios |
| `/guias/make-vs-n8n-vs-zapier/` | Comparativa | Make vs n8n vs Zapier | n8n o Make; Zapier alternativas; automatización no-code | Procesos | Evaluar implementación | 3 fichas, estudio existente, servicio procesos |
| `/guias/cuanto-cuesta-automatizar-un-negocio/` | Comercial investigativa | cuánto cuesta automatizar un negocio | precio automatización procesos; coste IA empresa | Precios | Ver precios / diagnóstico | precios, proceso, 3 servicios |
| `/guias/procesos-que-conviene-automatizar-primero/` | Informativa → comercial | qué procesos automatizar primero | procesos automatizables PyME; tareas repetitivas empresa | Procesos | Diagnóstico | estudio de herramientas, coste, 3 servicios |

## Clústeres y anclas

### Atención al cliente

- Madre: `/servicios/automatizacion-atencion-cliente/`
- Soporte: chatbot PyME, automatizar WhatsApp, estudio `ia-para-atencion-al-cliente`.
- Anclas: “automatización de atención al cliente”, “chatbot para una PyME”, “automatizar WhatsApp con derivación humana”.

### Ventas

- Madre: `/servicios/automatizacion-ventas/`
- Soporte: seguimiento de leads, automatizar WhatsApp, herramientas de marketing.
- Anclas: “automatizar el seguimiento de leads”, “conectar formularios y CRM”, “automatización comercial”.

### Operaciones

- Madre: `/servicios/automatizacion-procesos/`
- Soporte: comparativa Make/n8n/Zapier, procesos prioritarios, coste, estudio de herramientas.
- Anclas: “automatización de procesos”, “elegir Make, n8n o Zapier”, “procesos que conviene automatizar primero”.

## Prevención de canibalización

| Tema | URL que debe posicionar | URLs que deben apoyar, no competir |
|---|---|---|
| IA en atención al cliente | estudio para intención informativa; servicio para intención comercial | chatbot y WhatsApp enlazan a ambas según decisión |
| Herramientas para automatizar tareas | estudio existente | comparativa se limita a Make/n8n/Zapier; procesos prioritarios evita “mejores herramientas” |
| Precio de automatización | página de precios para rangos; guía para explicación y cálculo | servicios mencionan rangos sin desarrollar la query |
| WhatsApp | guía para implementación; estudio para comparación de herramientas | fichas responden solo la marca |
| Chatbot | guía para decisión y alcance | servicio mantiene intención de contratación |

## Evidencia SERP revisada

- “Cuánto cuesta automatizar” devuelve páginas específicas de precios y variables de presupuesto, señal de intención comercial investigativa.
- “Qué procesos automatizar” devuelve listas por área y criterios de prioridad, señal informativa con transición natural al diagnóstico.
- “Make vs n8n vs Zapier” devuelve comparativas centradas en elección, señal comparativa distinta del estudio general de herramientas.

Fuentes de contraste: [comparativa de herramientas](https://www.softwaredoit.es/herramientas-para-conectar-aplicaciones/n8n-zapier-make-comparativa-herramientas-automatizacion.html), [procesos por área](https://futureflow.cl/blog/que-procesos-automatizar-empresa-pyme-chile), [coste y variables](https://hawkins.es/cuanto-cuesta-automatizar-empresa-con-ia).

## Definition of done para contenido nuevo

- [ ] Query e intención declaradas en este mapa.
- [ ] Title, description y H1 diferenciados.
- [ ] Respuesta breve al inicio.
- [ ] Al menos tres enlaces internos contextuales.
- [ ] CTA atribuido al clúster y placement.
- [ ] Fuentes primarias para precios, políticas o especificaciones cambiantes.
- [ ] Sin afirmaciones de ahorro o resultados no demostrados.
