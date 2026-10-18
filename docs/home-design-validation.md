# Validación comparativa de la home — 6 septiembre 2026

**Dictamen: aprobar la dirección visual, condicionar la aprobación final a corregir móvil, contraste y claridad comercial.** La nueva home organiza mejor la oferta, pero los tests funcionales anteriores no demuestran calidad de diseño ni mejora de conversión.

Evaluación experta del renderizado, no test con usuarios ni experimento A/B. Referencia anterior: captura previa real `artifacts/english-first/before/home.png` (1440 × 4435). Referencia nueva: captura `after/home-1440.png` y navegador local a 1440 × 1000 y 390 × 844. La home española actual ya comparte modificaciones y no se considera un control original. La captura antigua muestra la cabecera fija a media página: puede ser un artefacto de captura; no se interpreta como fallo real de navegación.

| Dimensión | Comparación | Decisión |
| --- | --- | --- |
| Propuesta de valor | Ambos titulares son aspiracionales. El nuevo subtítulo explica mejor la conexión de herramientas, pero el H1 no dice qué se vende | Mejorar el titular con automatización y destinatario |
| Navegación | Nueva agrupación legible, menos ruido visual, selector de idioma visible | Conservar |
| Identidad | Nuevo símbolo funciona mejor en pequeño; pierde parte del carácter editorial del wordmark serif. El símbolo puede leerse como A/AI más que AV | Conservar la dirección; revisar reconocimiento a 16/24/32px |
| Tipografía | Lectura principal más limpia y jerarquía más estable; persisten microtextos y aparece unión de palabras en móvil | Aprobación condicionada |
| Oferta | Nuevas filas explican atención al cliente, ventas y operaciones antes de pedir interacción | Mejora clara |
| Demo | Se conserva un activo diferenciador y límites honestos; en móvil hay dos demostraciones largas y un control de ejecución tardío | Reorganizar para móvil |
| Conversión | Evaluación ahora es acción principal, pero sus nombres varían y no siempre describen el destino | Unificar CTA |
| Confianza | Alcance, precio orientativo y revisión humana explican la oferta; la demo sigue siendo ilustrativa, sin evidencia de resultados reales | Añadir evidencia real cuando exista |
| Idioma | Inglés prioritario y acceso a español; esto cumple una estrategia, no prueba que convierta más | Conservar y medir por idioma |

## Hallazgos priorizados

1. **Alta — palabras unidas en móvil.** A 390px se lee «Make room forthe work thatmoves you forward». El texto alrededor de saltos de línea carece de separación al desaparecer estos en móvil. Afecta también a otros titulares. Evidencia: `after/design-review-mobile-hero.png`. Criterio de aceptación: ningún término unido a 320, 390, 768 y 1440px; mantener composición natural en cada ancho.

2. **Alta — contraste insuficiente en etiqueta de demo.** «Explore a working example» usa RGB(181,196,226), 12px, sobre RGB(247,248,252): aproximadamente 1.65:1. Evidencia visual: `after/design-review-mobile-demo.png`; valores de estilos computados en navegador. Oscurecer etiquetas sobre fondos claros y comprobar al menos 4.5:1 para texto pequeño. La demo también contiene etiquetas de 10–13px; aumentar lo necesario para usarla con comodidad.

3. **Alta — móvil demasiado extenso para la tarea principal.** Altura medida 8786px a 390px; hero 1292px, servicios 899px, demo 1887px. El bloque de inversión empieza alrededor de y=4881. Evidencia: `after/home-mobile.png` como panorama y capturas nuevas del hero/demo. El escritorio crece de 4435 a 5342px (+20.5%) con el nuevo bloque de servicios. La longitud no es un fallo por sí sola; aquí la repetición de simulaciones y el coste de llegar al control principal justifican reducirla. Propuesta: hero móvil con una vista resumida; selector, entrada y botón de ejecución juntos; flujo detallado desplegable; resultado inmediatamente después del botón.

4. **Media — CTA comercial poco explícito y variable.** «Find my first workflow», «Let’s find your first workflow» y «Take the free assessment» llevan al mismo destino. Propuesta: «Get my free automation assessment», con microcopy «About 3 minutes · Get an initial recommendation». No prometer llamada, entrega por email o consultoría que el flujo no incluya.

5. **Media — titular demasiado genérico.** «Make room for the work that moves you forward» transmite beneficio emocional pero podría encabezar muchas consultoras. Propuesta: «Automate the repetitive work. Keep your team in control.» Mantener «AI automation for small businesses» visible como contexto. Evaluar comprensión antes de declarar superioridad de conversión.

6. **Media — falta evidencia de capacidad real.** Los ejemplos son claramente ficticios, lo cual está bien. No sustituyen un caso verificable. Añadir un flujo real anonimizado con permiso, alcance y resultado medido, o una muestra real de documentación entregable. No inventar clientes, métricas ni testimonios.

7. **Baja — algunos controles siguen siendo estrechos.** En móvil ES mide 39×44px, menú 40×44px y Reset 31×44px. Varios enlaces secundarios tienen 17–21px de alto. Revisar espaciado y ampliar los botones a 44×44px como objetivo de comodidad; no se declara automáticamente incumplimiento normativo por esas medidas.

## Ajustes rápidos

- Recuperar espacios naturales en todos los titulares adaptativos.
- Oscurecer las etiquetas de secciones claras y aumentar el texto funcional pequeño.
- Unificar el CTA de evaluación y su microcopy.
- Ampliar las áreas de pulsación de menú, idioma y Reset.

La reorganización móvil de la demo y la incorporación de evidencia real requieren una intervención mayor. No se modificó el código de la home durante esta validación: los hallazgos quedan separados de la implementación anterior.

## Criterio de aprobación

Mantener navegación, filas de servicios, precios transparentes, tipografía principal y prioridad inglesa. Resolver los dos fallos de lectura y compactar el recorrido móvil antes de aprobación final. Después medir comprensión de oferta/destino del CTA y finalización de evaluación, separadas por dispositivo e idioma. Cero overflow y una build correcta no equivalen a una experiencia móvil bien resuelta.

## Cambios aplicados tras aprobación

- Paleta editorial aplicada: papel #F7F8FA, tinta #142033, azul #244FE0, hover #193CB5, fondo secundario #EDF2FA y texto secundario #526176. Hero y footer oscuros; servicios y proceso/precios claros; cierre comercial con fondo suave.
- Titular explícito y espacios preservados en todos los saltos de línea de la home inglesa. CTA principal unificado hacia la evaluación gratuita.
- Móvil: vista inicial reducida, entrada y ejecución juntas, resultado a continuación, pasos en un desplegable nativo. Precios movidos antes de integraciones.
- Texto funcional ampliado y etiquetas claras oscurecidas. Controles de idioma, menú y Reset con objetivo mínimo 44×44px.
- Documentación real de la demo disponible en `/examples/demo-handover.md`, con límites explícitos y sin atribuirla a un cliente.
- Verificación: 488 tests pasan; build y revisión de 305 HTML pasan. Sin desbordamiento a 320/390/768/1024/1440px. Los seis escenarios de demo completan; reset, desplegable, menú/Escape y descarga comprobados en navegador.
- Medida móvil comparable a 390px: página 8786 → 7553px (aprox. 14% menos); inversión empieza alrededor de y=3140 frente a y=4881. No se afirma mejora de conversión medida.
- Capturas finales: `artifacts/english-first/after/refined-mobile-hero-final.png`, `refined-mobile-final.png`, `refined-desktop-final.png`.

La validación previa queda conservada como registro histórico. No se ha desplegado a producción.
