# Evidencia de auditoría de la home — 2026-10-18

Inspección de producción con Chrome mediante CUA. Lectura visual, árbol de accesibilidad y navegación real. No se modificó el sitio ni se envió ningún formulario de contacto.

| Archivo | Evidencia |
|---|---|
| `en-home-desktop.png` | Home inglesa completa, viewport de escritorio 1470 × 745 |
| `es-home-desktop.png` | Home española completa, mismo escritorio |
| `en-home-dom.txt`, `es-home-dom.txt` | Contenido y destinos accesibles de las dos homes |
| `en-home-mobile390.png`, `es-home-mobile390.png` | Capturas completas a 390 × 844 |
| `en-home-mobile320.png`, `es-home-mobile320.png` | Capturas completas a 320 × 740 |
| `es-mobile390-menu.png` | Menú móvil abierto y acceso a servicios, precios, exploración y diagnóstico |
| `en-demo-normal.png`, `en-demo-exception.png` | Resultado normal y excepción de soporte; ambos terminados |
| `en-demo-mobile320.png`, `es-demo-mobile320.png` | Tercera pestaña parcialmente recortada a 320 px |
| `es-demo-operations-mobile320.png` | Tras seleccionar Operaciones: recorte lateral del contenido de la consola |
| `en-assessment-mobile320-start.png` | Llegada desde CTA sticky, pregunta 1 y breadcrumb parcialmente español |
| `en-assessment-selfserve-mobile320.png`, `en-assessment-selfserve-dom.txt` | Ocho preguntas completadas y recomendación antes del email |
| `en-assessment-resource-handoff.png`, `en-assessment-resource-dom.txt` | Guía inglesa realmente enlazada desde recomendación de preparación |

Dimensiones leídas del DOM visible: home ES a 390 px, `scrollWidth=390`, altura 12.671 px; ES a 320 px, `scrollWidth=320`, altura 14.016 px; EN a 390 px, `scrollWidth=390`, altura 12.044 px. Son observaciones de una sesión, no métricas de rendimiento. En consola ES320, la fila de pestañas tenía `clientWidth=262`, `scrollWidth=320`, `overflow-x:visible`; Operaciones medía aproximadamente 124 px y empezaba en x225 antes de seleccionarla. No se atribuye causa de CSS sin reproducción de desarrollo.

Recorrido del diagnóstico: exploración; una persona; tipo de negocio «Audit simulation — no real business»; tarea ficticia de copiar un formulario a una hoja con comprobación humana; pocas veces al año; inversión desconocida; más adelante; ninguno de los riesgos enumerados. Solo se pulsó «See my recommendation». No se introdujo nombre/email, no se aceptó privacidad, no se pulsó «Send my assessment», no se reservó cita. Posibles eventos de inicio/pasos son tráfico de auditoría, no demanda real. Según el código inspeccionado, `diagnostic_completed` y `lead_qualified` requieren éxito del envío de contacto y no debieron emitirse en esta prueba.

Se leyó `/pricing/` en vivo: taller desde 300 €, implementación desde 1.500 €, varias integraciones desde 3.000 €, soporte desde 300 €/mes; plazos y costes condicionados. La conexión de navegador dejó de estar disponible durante el guardado opcional de su captura. `/how-we-work/` se contrastó en código, no se completó su recorrido visual. El override responsive se restableció antes de esa interrupción.

No hay medición Lighthouse, PageSpeed, Core Web Vitals de campo, entrevistas, CRM ni pruebas con personas. No se ejecutaron los seis casos completos de demo; soporte normal/excepción EN finalizó, soporte normal ES se inició y Operaciones ES se seleccionó. No se probó envío de leads, correo recibido ni reserva confirmada.
