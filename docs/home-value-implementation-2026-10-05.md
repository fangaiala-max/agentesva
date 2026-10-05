# Implementación: valor para el cliente en el home

Aplicados Head of Design, Head of Content y Premium Web Design. Fuente autorizada: componentes Astro y paleta existente de `english-home.css`. Se conserva la identidad, el hero y la demo. No se añaden dependencias ni animaciones.

## Decisiones de diseño y contenido

| Componente | Cambio | Criterio de aceptación |
|---|---|---|
| Filas de servicio | Añadir «Qué medir» para cada tarea | Criterios observables; ninguna cifra de ahorro inventada; lectura clara a 390 px |
| Entre demo y precios | Guía de cuatro preguntas para decidir si compensa | Distingue coste, recurrencia, esfuerzo humano y alternativas; una columna en móvil |
| Entrega | Sustituir lista de nombres por explicación de uso | Cada entregable ayuda a operar o comprobar el flujo; soporte separado |
| Nuevo CTA | Enlace localizado al diagnóstico con `placement=value_decision` | Destino español/inglés correcto; reutiliza medición existente |

Referencia de oficio: la composición existente del propio home, observada en escritorio. Se reutilizan tipografía, superficies claras, filas con líneas y acentos de marca. La nueva sección usa dos columnas en escritorio y una en móvil. No se afirma comparación visual externa ni rendimiento comercial demostrado.

## Verificación

- `npm run build`: aprobado, incluidas verificaciones de imágenes sociales, UI bilingüe y SEO.
- `npm test -- tests/home.test.ts tests/agency-home.test.ts`: 48 pruebas aprobadas.
- Home compilado servido localmente en 127.0.0.1:4387; revisión en Chrome.
- Español: sección de decisión en escritorio y 390 px; entrega a 320 px.
- Inglés: servicios y criterios de medición a 390 px.
- Ancho de documento coincide con viewport a 390 y 320 px en los estados comprobados.
- Nuevo CTA español: navegación confirmada al diagnóstico con contexto de origen. No se envía ningún formulario.
- Override de viewport restablecido al terminar.

Aceptación: cambios de contenido y composición revisados en los estados anteriores. No es una auditoría completa de accesibilidad ni una medición de conversión.

## Evidencia y límites

No se publica un caso real porque no se dispone de evidencia verificada y autorizada de una implementación para clientes. La demo sigue identificada como simulación.

El aviso de cookies no se renderiza en esta compilación local al faltar la configuración pública de analítica; no se modifica ni se declara corregido su comportamiento en producción. La comprobación con consentimiento activo queda pendiente. Se mantiene la lógica existente que oculta el recordatorio comercial mientras el aviso está visible, cubierta por las pruebas del home.

No se despliega. Los cambios están en el proyecto local.
