# AgentesVA

Servicio de automatización con inteligencia artificial para PyMEs y autónomos de España y Latinoamérica, respaldado por un directorio y un medio práctico en español. La portada conduce primero al diagnóstico y a la implementación; herramientas, cursos, recursos, estudios, noticias y plantillas quedan disponibles como apoyo para explorar y decidir.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run test     # Vitest + happy-dom
npm run build    # Astro + salida de Vercel + índice Pagefind
npm run preview
```

## Stack

- Astro 7 con salida estática y adaptador de Vercel.
- Tailwind 4 mediante PostCSS y estilos propios en `src/styles/global.css`.
- Content Collections para herramientas, cursos, recursos, estudios y noticias.
- Vitest + happy-dom para pruebas unitarias y de scripts de cliente.
- Pagefind para la búsqueda global del contenido prerenderizado.

## Superficie pública

- `/` — ruta comercial principal: diagnóstico, tres áreas de automatización, entregables, proceso y precio inicial antes del contenido editorial.
- `/herramientas/` — directorio y categorías de herramientas de IA.
- `/cursos/` — cursos seleccionados y organizados por categoría.
- `/recursos/` — biblioteca, packs y otros recursos prácticos.
- `/estudios/` y `/noticias/` — contenido editorial en español.
- `/prompts/` — seis colecciones de prompts para ChatGPT, marketing, ventas, redes sociales, atención al cliente y PyMEs.
- `/generador-de-prompts/` — generador local que estructura el prompt sin enviar los campos a un servidor.
- `/servicios/`, `/precios-automatizacion-ia/` y `/como-trabajamos/` — oferta comercial, rangos y proceso de implementación.
- `/diagnostico-automatizacion-ia/` — diagnóstico de ocho pasos con recomendación inmediata y entrega segura del lead.
- `/gracias-diagnostico/` — cierre dinámico `noindex`; ofrece reserva cuando `BOOKING_URL` y un secreto de firma están configurados, y una alternativa segura si no.

## Contenido y datos

- `src/content/tools/` — fichas de herramientas.
- `src/content/cursos/` y `src/content/recursos/` — catálogo educativo y recursos.
- `src/content/estudios/` y `src/content/noticias/` — publicaciones Markdown.
- `src/data/biblioteca/` — prompts y blueprints de la Biblioteca de IA.
- `src/data/prompt-landings.ts` — metadatos y selección de plantillas de las colecciones SEO.

Los esquemas de `src/content.config.ts` validan el contenido durante `npm run build`.

## Entrega

Las pull requests generan una preview en Vercel. Al fusionar en `main`, Vercel construye y publica producción. Antes de abrir una PR deben pasar:

```bash
npm run test
npm run build
```

Para probar el cierre cualificado con reserva en local:

```bash
DIAGNOSTIC_ALLOWED_ORIGINS=http://localhost:4321 \
NOTION_TOKEN=token-de-integracion-interna \
NOTION_DATA_SOURCE_ID=id-de-pipeline-de-leads \
DIAGNOSTIC_SIGNING_SECRET=secreto-local-de-32-caracteres \
BOOKING_URL=https://calendly.com/tu-cuenta/revision-automatizacion npm run dev
```

La integración de Notion debe tener acceso a `Pipeline de leads`; la API deduplica por `Submission ID` antes de crear o actualizar el registro.

## Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — topología, contenido, variables y despliegue.
- [`DESIGN.md`](./DESIGN.md) — sistema visual y patrones de interacción.
- [`OPERATIONS.md`](./OPERATIONS.md) — operación, alertas y respuesta a incidentes.
- [`TESTING.md`](./TESTING.md) — estrategia y convenciones de pruebas.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de versiones.
- [`TODOS.md`](./TODOS.md) — trabajo pendiente priorizado.
