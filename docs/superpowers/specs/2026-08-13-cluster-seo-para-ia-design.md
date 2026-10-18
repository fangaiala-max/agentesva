# Clúster editorial SEO para IA — diseño

**Fecha:** 2026-08-13
**Estado:** aprobado para planificación
**Superficie:** `/guias/`
**Audiencia:** marketers y responsables de contenido en España y Latinoamérica

## Objetivo

Publicar un clúster evergreen de tres guías que explique cómo cambia la búsqueda
cuando un sistema de IA descubre, compara y recomienda marcas. El clúster debe
captar demanda orgánica existente, construir autoridad temática para AgentesVA y
conducir de forma gradual al blueprint de auditoría de visibilidad `gr22`.

El resultado debe responder tres intenciones diferentes:

1. entender el SEO para IA;
2. aplicar un proceso para aparecer en ChatGPT;
3. medir la presencia de una marca en respuestas de IA.

No se presenta `Agentic Search` como keyword principal. Se explica como concepto
dentro de la guía pilar porque SEMrush España registra más demanda para `SEO para
IA`, `SEO para ChatGPT` y consultas sobre aparecer o medir presencia en ChatGPT.

## Arquitectura del clúster

### 1. Guía pilar

**Ruta:** `/guias/seo-para-ia/`
**Título de trabajo:** `SEO para IA: cómo conseguir que los buscadores de IA entiendan y recomienden tu marca`
**Keyword principal:** `SEO para IA`
**Intención:** comprender y planificar
**Extensión objetivo:** 2.200–2.800 palabras

La guía define SEO para IA, GEO, AEO y Agentic Search sin convertir los acrónimos
en disciplinas artificialmente separadas. Debe explicar el recorrido completo:
descubrimiento de fuentes, interpretación de entidades, corroboración, selección
de respuestas y, cuando proceda, ejecución de una acción.

Secciones mínimas:

- respuesta breve y puntos clave;
- qué es SEO para IA;
- diferencia frente al SEO tradicional;
- cómo descubre, verifica y recomienda una marca un agente;
- señales controlables: contenido, entidad, datos estructurados y datos vigentes;
- señales externas: menciones, reseñas, fuentes y consistencia;
- plan de trabajo por fases;
- errores frecuentes y límites de lo que se puede garantizar;
- FAQ.

La guía no tendrá CTA comercial de servicio. Sus enlaces de continuación llevarán
a la guía práctica sobre ChatGPT y a la guía de medición.

### 2. Guía de aplicación

**Ruta:** `/guias/como-aparecer-en-chatgpt/`
**Título de trabajo:** `Cómo aparecer en ChatGPT: proceso para posicionar una empresa en respuestas de IA`
**Keyword principal:** `cómo aparecer en ChatGPT`
**Intención:** implementar
**Extensión objetivo:** 1.400–1.800 palabras

La guía convierte los principios de la página pilar en un proceso ejecutable. No
prometerá inclusión, ranking ni una frecuencia estable de menciones. Enseñará a
preparar hechos verificables, reforzar la relación entre marca y categoría,
publicar contenido que responda preguntas reales, conseguir corroboración externa
y probar una batería estable de prompts.

Secciones mínimas:

- respuesta breve y puntos clave;
- qué significa realmente “aparecer”;
- inventario de hechos verificables;
- asociación entre marca, categoría, productos y audiencia;
- arquitectura de contenido citable;
- señales externas y consistencia entre fuentes;
- batería neutral de consultas para ChatGPT y Perplexity;
- qué corregir cuando la IA omite o describe mal la marca;
- FAQ.

La guía enlazará a las fichas de ChatGPT y Perplexity como contexto de producto,
no como sustituto del método. Su siguiente paso principal será la guía de medición.

### 3. Guía de medición

**Ruta:** `/guias/medir-visibilidad-en-chatgpt/`
**Título de trabajo:** `Cómo medir la visibilidad de tu marca en ChatGPT y otros buscadores de IA`
**Keyword principal:** `analizar visibilidad en ChatGPT`
**Intención:** auditar y medir
**Extensión objetivo:** 1.400–1.800 palabras

La guía definirá un protocolo repetible. Separará presencia, exactitud, sentimiento,
competencia y resultado comercial. Una consulta puntual no se presentará como una
medición concluyente; cada observación debe guardar prompt, plataforma, fecha y
respuesta.

Secciones mínimas:

- respuesta breve y puntos clave;
- por qué Analytics no muestra todo el impacto;
- conjunto estable de prompts por etapa de decisión;
- métricas: tasa de mención, share of voice, exactitud, sentimiento, fuentes y
  conversiones asistidas;
- plantilla de registro y frecuencia de revisión;
- interpretación de cambios y falsos positivos;
- acciones según el tipo de problema detectado;
- FAQ.

Esta guía tendrá un CTA comercial hacia el blueprint `gr22`, `Descubre qué dicen
ChatGPT y Perplexity de tu marca cuando tú no estás mirando`. La URL de compra se
resolverá desde `compraUrlDeItem('gr22')`; no se duplicará el enlace de Stripe en
el Markdown.

## Enlazado interno

Cada guía enlazará a las otras dos una sola vez dentro del cuerpo cuando el enlace
resuelva el siguiente paso natural. Las tres también aparecerán en `relacionados`.

Enlaces estratégicos adicionales:

- ChatGPT: definición de la superficie y ejecución de las pruebas;
- Perplexity: comparación de respuestas con citas y fuentes;
- Surfer SEO: ejemplo de optimización editorial tradicional, acompañado de la
  aclaración de que una puntuación SEO no equivale a visibilidad en respuestas de
  IA;
- Biblioteca de IA: contexto del blueprint y acceso a la colección;
- metodología de AgentesVA: explicación del criterio editorial y las fuentes.

No se añadirán enlaces repetidos solo para aumentar densidad. Los anchors deben
describir el destino y evitar `haz clic aquí`.

## Modelo híbrido de CTA

La colección `guias` actualmente obliga a declarar `servicio` y el renderer muestra
el mismo CTA comercial dos veces. El nuevo clúster necesita otro comportamiento sin
alterar las seis guías comerciales existentes.

El esquema evolucionará de forma compatible:

- `servicio` pasa a ser opcional;
- se añade `recurso` opcional para CTA de producto editorial;
- una guía puede tener `servicio`, `recurso` o ninguno, pero nunca ambos;
- las guías existentes conservan `GuideServiceCTA` y su tracking;
- las dos primeras guías nuevas no muestran CTA comercial repetido;
- la tercera usa un nuevo CTA de recurso, con evento y atributos distintos de
  `service_cta_click`.

El CTA de recurso debe mostrar nombre, título, descripción, precio y botón. El
componente resolverá el enlace a partir del ID del blueprint. El clic se medirá
como recurso o blueprint, no como servicio de consultoría.

## Índice de guías

`/guias/` dejará de describirse exclusivamente como una colección para automatizar
empresas. El H1, la introducción, el título SEO y el `CollectionPage` cubrirán tres
áreas: automatización, adopción práctica de IA y visibilidad en buscadores de IA.

No se crearán categorías, filtros ni una nueva plantilla en esta entrega. Las
tarjetas existentes, ordenadas por fecha de actualización, son suficientes para
nueve guías.

## Criterios editoriales y de citabilidad

- Español claro y neutro, útil en España y Latinoamérica.
- Primera respuesta directa bajo cada H2 que formule una pregunta.
- Bloques autocontenidos que conserven sujeto y contexto al ser extraídos.
- Ejemplos centrados en marketers y PyMEs, no en equipos de ingeniería.
- Definiciones calibradas y sin garantías de aparecer o ser citado.
- Diferenciación explícita entre hecho documentado, inferencia y recomendación.
- Cifras de SEMrush solo como criterio interno de priorización; no es necesario
  convertirlas en claims dentro de las guías.
- Fuentes primarias u oficiales para funcionamiento y recomendaciones técnicas.
- Fecha de actualización visible y revisión semestral de claims dependientes de
  plataformas.

Cada guía mantendrá `Article`, `FAQPage` y breadcrumbs en JSON-LD mediante la
plantilla existente. Las FAQ visibles y las declaradas en schema serán idénticas.

## Fuentes previstas

La redacción se apoyará principalmente en:

- documentación oficial de Google Search y Google Analytics;
- documentación oficial de OpenAI sobre búsqueda y rastreo cuando sea aplicable;
- documentación oficial de Microsoft/Bing y Perplexity cuando describa su propio
  producto;
- Schema.org para entidades y datos estructurados;
- fuentes de investigación originales cuando una afirmación no esté cubierta por
  documentación de plataforma.

No se citarán resúmenes de terceros para describir el comportamiento oficial de
una plataforma cuando exista una fuente primaria disponible.

## Analítica

Los enlaces internos conservarán el comportamiento actual. El CTA de `gr22`
necesita un evento diferenciado que identifique:

- tipo de página `guide`;
- slug `medir-visibilidad-en-chatgpt`;
- recurso `gr22`;
- placement;
- destino de compra.

El problema observado en GA4 no cambia el diseño del clúster. La etiqueta correcta
está desplegada, pero el Chrome usado para comprobarla bloquea `gtag.js` con
`ERR_BLOCKED_BY_CLIENT`. La verificación end-to-end de eventos requiere repetir la
prueba en un perfil que permita Google Tag Manager y que haya concedido el
consentimiento analítico.

## Pruebas y aceptación

La implementación se considera terminada cuando:

1. las tres rutas compilan y aparecen en el sitemap;
2. cada frontmatter valida contra la colección `guias`;
3. las seis guías existentes conservan sus dos CTA de servicio;
4. las dos primeras guías nuevas no muestran CTA comercial de servicio;
5. la tercera guía resuelve `gr22` desde la fuente de datos central y registra el
   evento de recurso correcto;
6. los enlaces entre las tres guías y las fichas de herramientas resuelven a rutas
   existentes;
7. el índice `/guias/` refleja el alcance editorial ampliado;
8. cada FAQ visible coincide con su `FAQPage`;
9. no quedan claims de riesgo alto sin fuente;
10. las pruebas completas y `npm run build` terminan sin errores.

La revisión manual comprobará legibilidad móvil y desktop, jerarquía de headings,
CTA, fuentes, relacionados y ausencia de promesas no verificables.

## Fuera de alcance

- crear un servicio de consultoría de AI Search;
- desarrollar un dashboard automático de visibilidad;
- consultar automáticamente ChatGPT, Perplexity o Gemini;
- rediseñar las fichas de herramientas;
- añadir filtros o taxonomías al índice de guías;
- corregir o reconfigurar extensiones de privacidad del navegador del usuario;
- desplegar a producción antes de completar revisión, pruebas y flujo de entrega.
