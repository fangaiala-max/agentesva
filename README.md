# AgentesVA

Directorio y medio de inteligencia artificial en español para PyMEs y autónomos de España y Latinoamérica. El sitio reúne herramientas, cursos, recursos, estudios, noticias y plantillas prácticas de IA.

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

- `/herramientas/` — directorio y categorías de herramientas de IA.
- `/cursos/` — cursos seleccionados y organizados por categoría.
- `/recursos/` — biblioteca, packs y otros recursos prácticos.
- `/estudios/` y `/noticias/` — contenido editorial en español.
- `/prompts/` — seis colecciones de prompts para ChatGPT, marketing, ventas, redes sociales, atención al cliente y PyMEs.
- `/generador-de-prompts/` — generador local que estructura el prompt sin enviar los campos a un servidor.

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

## Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — topología, contenido, variables y despliegue.
- [`DESIGN.md`](./DESIGN.md) — sistema visual y patrones de interacción.
- [`OPERATIONS.md`](./OPERATIONS.md) — operación, alertas y respuesta a incidentes.
- [`TESTING.md`](./TESTING.md) — estrategia y convenciones de pruebas.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de versiones.
- [`TODOS.md`](./TODOS.md) — trabajo pendiente priorizado.
