# Impacto SEO, GEO y AIO del rediseño bilingüe

Revisión del 6 de septiembre de 2026. Comparación de `4c0e65e` con `3762d1c` (PR #184), mediante compilaciones aisladas de ambos commits, análisis del HTML y comprobación de producción en agentesva.com. El informe evalúa cambios técnicos y editoriales; no demuestra cambios de posicionamiento, tráfico o citas.

**Dictamen: conservar el diseño y corregir las regresiones de metadatos y especificidad editorial. No se ha detectado una ruptura de indexabilidad. La unificación visual ha mejorado la presentación de la oferta, pero ha simplificado demasiado algunas señales de contenido.**

## Evidencia técnica

| Comprobación | Resultado |
|---|---|
| HTML antes/después | 306 archivos en ambos; 305 páginas y un archivo de verificación de Google. Ningún archivo eliminado o añadido. |
| Idiomas | 152 páginas EN y 153 ES, sin cambios. |
| Sitemap | Las mismas 302 URLs antes, después y en producción. |
| Canonical, robots, idioma y hreflang | Sin cambios en ninguna página. Alternativas existentes y recíprocas. |
| H1 y JSON-LD | Un H1 por página; JSON-LD analizable. Se excluye el archivo de verificación de Google. Esto no equivale a validar todos los requisitos de resultados enriquecidos. |
| Enlaces internos | Ningún destino de página inexistente detectado en el HTML estático; se excluyen los endpoints dinámicos `/api/` y `/ir/`. |
| Producción | 20 páginas representativas y robots, llms y los dos sitemaps: HTTP 200; sin cabecera X-Robots-Tag restrictiva en la muestra. |
| Correspondencia con producción | Metadatos y contenido analizado coinciden con la compilación actual. Cloudflare transforma los enlaces de email de los dos directorios en enlaces de protección. |
| Bots | Home HTTP 200 con identificadores Googlebot, OAI-SearchBot y PerplexityBot. No prueba acceso desde las IP reales de esos rastreadores. |

Las páginas `404`, búsqueda y agradecimiento mantienen su noindex. El contenido principal y las respuestas de las fichas están en el HTML; no dependen de ejecutar las animaciones. Las tablas de precios tienen estructura semántica y los nuevos recorridos explican entregables y excepciones.

## Regresiones introducidas

### 1. Prioridad alta: recuperar títulos que expliquen la página

Cambian 149 títulos. Los 108 perfiles EN/ES pasan a `Nombre | AgentesVA`. Por ejemplo:

- EN: `Claude: uses and getting started | AgentesVA` → `Claude | AgentesVA`.
- ES: `Claude — Ideal para textos largos y trabajo que exige criterio. | AgentesVA` → `Claude | AgentesVA`.
- `Automatización de atención al cliente con IA | AgentesVA` → `Atención al cliente | AgentesVA`.
- `Precios de automatización con IA | AgentesVA` → `Precios | AgentesVA`.

Las categorías españolas también pierden su contexto de herramientas, cursos o recursos. Hay colisiones dentro de un mismo idioma, como `Atención al cliente | AgentesVA` para un servicio y una categoría de recursos. Que dos traducciones compartan el nombre de un producto no supone por sí solo contenido duplicado: el problema aquí es perder información sobre propósito e intención.

**Acción:** separar el título SEO del rótulo breve de la interfaz. Ejemplos: `Claude: uses, pricing and alternatives | AgentesVA` y `Claude: usos, precios y alternativas | AgentesVA`, siempre ajustados al contenido disponible. Aplicar la misma precisión a servicios, precios y categorías. Origen: `ToolProfile.astro`, `ServicePage.astro`, `ToolDirectory.astro` y `LearningDirectory.astro`.

### 2. Prioridad alta: recuperar respuestas específicas

Las 54 fichas españolas pasan de cuatro FAQ derivadas de los datos de cada herramienta a dos respuestas genéricas idénticas: cómo evaluarla y dónde consultar precios. Las fichas inglesas ganan dos FAQ, pero también son genéricas. El cuerpo conserva descripción, usos y pasos: no ha desaparecido toda la información del producto.

Los tres servicios españoles conservan cinco FAQ, pero pierden preguntas propias sobre WhatsApp, CRM, facturas, integraciones y medición, sustituidas por las mismas cinco preguntas generales. La pérdida es de especificidad, no del número de preguntas.

**Acción:** mantener las advertencias comunes y añadir respuestas verificadas por herramienta y servicio en ambos idiomas. Priorizar compatibilidad, límites, costes condicionados, casos de uso y criterios para elegir. No restaurar automáticamente afirmaciones antiguas sin comprobarlas. Una FAQ adicional no garantiza un resultado enriquecido ni una cita de IA.

### 3. Prioridad media: descripciones de categorías repetidas

El español hereda el patrón genérico que ya existía en inglés:

- 11 páginas de herramientas comparten una descripción.
- 6 páginas de cursos comparten otra.
- 6 páginas de recursos comparten otra.

Son **23 páginas ES que antes tenían descripciones distintas y ahora forman tres grupos repetidos**. En inglés esos tres grupos ya existían; las siete descripciones repetidas de la biblioteca de prompts también son anteriores.

**Acción:** describir el contenido y la decisión propia de cada categoría, en EN y ES. No es una penalización automática: reduce la diferenciación y el control editorial del resumen presentado al usuario.

### 4. Prioridad media: navegación de categorías

Al sustituir navegación por filtros, cuatro URLs dejan de ser alcanzables desde la home siguiendo los enlaces del HTML, aunque sus traducciones se enlazan entre sí y siguen en el sitemap:

- `/recursos/contenido/` y `/resources/category/contenido/`.
- `/recursos/ventas-marketing/` y `/resources/category/ventas-marketing/`.

Las cuatro ya estaban vacías antes; ahora además pierden ese recorrido de descubrimiento. No son errores 404. Los filtros `<select>` no sustituyen enlaces a páginas de categoría.

**Acción:** añadir navegación enlazable a categorías útiles. Para estas cuatro, decidir entre aportar recursos reales o mantenerlas fuera del índice y del sitemap mientras estén vacías. Las fichas ES también pierden el nivel de categoría en el breadcrumb, aunque conservan otro enlace a esa categoría; conviene recuperar la jerarquía completa.

## Problemas anteriores que siguen pendientes

- `public/llms.txt` aún presenta AgentesVA como medio exclusivamente español y dice que no es una agencia. No refleja la oferta actual ni la prioridad EN. Actualizarlo por coherencia, sin atribuirle beneficios de ranking: Google indica que no utiliza este archivo para visibilidad.
- Algunas páginas editoriales EN son resúmenes de contenidos ES extensos. La última PR no introduce esta diferencia; la paridad visual no equivale a paridad editorial. Completar primero las guías con demanda y valor comercial.
- Quedan 59 enlaces de salto `#main-content` cuyo destino falta, frente a 113 antes. Es una deuda de accesibilidad que ha mejorado con la PR; no una regresión SEO nueva.

## Rendimiento: señal a vigilar, sin veredicto de Core Web Vitals

La suma sin comprimir de los archivos JS/CSS directamente referenciados en el HTML aumenta:

| Página | Antes | Después |
|---|---:|---:|
| Home EN | 127.026 bytes | 144.894 bytes |
| Home ES | 105.496 bytes | 144.894 bytes |
| Herramientas ES | 70.779 bytes | 88.208 bytes |
| Precios ES | 71.922 bytes | 85.233 bytes |

Esto excluye dependencias importadas, fuentes, imágenes, compresión y caché; no representa transferencia real ni LCP/INP/CLS. No se ha medido una regresión de Core Web Vitals. Verificar datos de campo y pruebas móviles antes de optimizar o recortar movimiento por intuición.

## Interpretación GEO/AIO y seguimiento

Las mejoras de presentación no garantizan más citas. Los riesgos observados se concentran en títulos genéricos y respuestas menos útiles para decisiones concretas. Google relaciona sus funciones generativas con las bases del SEO y el contenido útil; no requiere un marcado especial para IA. OpenAI distingue OAI-SearchBot, destinado a búsqueda, de GPTBot, destinado a posibles usos de entrenamiento.

No se consultaron Search Console, analítica de tráfico, logs de bots reales ni un panel repetible de respuestas/citas en asistentes. Por tanto, **no puede afirmarse que haya bajado el tráfico o la visibilidad en IA**.

Tras corregir los puntos anteriores: registrar fecha del cambio; comparar páginas y consultas EN/ES a 30 días con el periodo previo y contexto estacional; repetir a 60 y 90 días. Medir clics, impresiones, CTR, indexación, conversiones orgánicas y rendimiento generativo disponible en Search Console. Para asistentes, repetir un conjunto documentado de preguntas por idioma y registrar URLs citadas, fecha y plataforma, sin tratar una única respuesta como posición estable.

Fuentes oficiales consultadas:

- [Google: optimización para funciones generativas](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- [Google: versiones localizadas y hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions).
- [OpenAI: rastreadores y controles](https://developers.openai.com/api/docs/bots).

Evidencias en `artifacts/seo-geo-aio-2026-09-06/`: comparación de metadatos, grafo de enlaces, respuestas de producción y sondas de bots. El comparador representa los archivos HTML especiales con una ruta normalizada: el archivo de verificación de Google no es una página editorial y se excluye del diagnóstico de H1/canonical. Esta revisión no modifica el diseño ni la aplicación.


## Correcciones aplicadas localmente — 6 de septiembre de 2026

- Títulos SEO independientes de los rótulos visuales en fichas, servicios, precios, proceso y categorías EN/ES.
- Tres preguntas específicas por herramienta, respondidas con su descripción, capacidades y pasos existentes; se mantienen las dos preguntas de evaluación y precios. Sin afirmar nuevas capacidades o precios actuales.
- Cuatro preguntas específicas adicionales por servicio, en ambos idiomas, con alcance y supervisión condicionados a lo acordado.
- Descripciones diferenciadas por categoría y enlaces HTML a las categorías de cursos y recursos con contenido.
- Las cuatro categorías vacías conservan sus URLs con noindex y salen del sitemap, que pasa de 302 a 298 URLs. No se eliminan páginas.
- Breadcrumbs de herramientas con categoría, tanto visibles como en JSON-LD.
- `llms.txt` actualizado en EN/ES; enlaces al contenido y a los servicios actuales.
- Destinos estáticos de los enlaces de salto corregidos en las plantillas pendientes, incluida búsqueda.
- Verificador SEO integrado en postbuild para prevenir la repetición de estas regresiones.

Verificación: 304 páginas `index.html`, 108 fichas y 298 URLs de sitemap; compilación y verificaciones GEO/bilingües. La suite existente dio 504/505 inicialmente: el único fallo señalaba enlaces de prompts que faltaban en la primera edición de llms.txt. Se restauraron y los seis tests de ese archivo pasaron. Navegación de cursos comprobada en navegador sin desbordamiento horizontal en la ventana revisada.

La ampliación editorial completa de las guías inglesas y las mediciones de tráfico, citas y Core Web Vitals requieren trabajo y datos posteriores; estas correcciones no equivalen a haber medido un aumento de visibilidad. Cambios locales, sin publicación en producción en este paso.
