# Home: bloque «Qué compras» — diseño de mensaje

Fecha: 2026-08-10

## Objetivo

Explicar de forma inmediata y positiva qué recibe el cliente al contratar AgentesVA. El bloque debe presentar una compra concreta y operativa, no empezar defendiendo lo que AgentesVA no hace.

## Texto aprobado

**Kicker:** Qué compras

**Titular:** Una automatización lista para trabajar

**Párrafo:** Conectamos un proceso concreto con las herramientas que ya utilizas y lo dejamos probado, documentado y con control humano. Tu equipo recibe un flujo operativo de principio a fin, no otra herramienta que aprender.

## Entregables que permanecen

Las tres tarjetas existentes se mantienen porque respaldan la promesa principal con entregables verificables:

1. Flujo operativo.
2. Casos probados.
3. Control y relevo.

## Decisiones de conversión

- La promesa abre con el resultado comprado.
- La compatibilidad con las herramientas actuales funciona como argumento de apoyo, no como titular.
- Se elimina el comienzo negativo «No te entregamos…».
- No se introducen cifras de ahorro o ventas hasta disponer de evidencia propia.
- El lenguaje seguirá siendo directo, práctico, en español y sin tecnicismos.

## Alcance de implementación

- Sustituir únicamente el titular y el párrafo del bloque `commercial-proof` en `src/pages/index.astro`.
- Conservar el kicker, las tarjetas, los enlaces, la analítica y la estructura HTML.
- Mantener la corrección visual ya realizada para alinear el bloque con la retícula de 1240 px del home.

## Validación

- Ejecutar la suite completa de Vitest.
- Ejecutar el build de producción.
- Comprobar el bloque en escritorio y móvil, sin desbordamientos ni errores de consola.
- Confirmar que el texto publicado coincide exactamente con esta especificación.

