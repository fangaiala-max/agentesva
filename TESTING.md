# Testing — AgentesVA

100% de cobertura es la clave para vibe-codear con confianza: los tests te dejan moverte rápido y shippear sin miedo. Sin ellos, es yolo coding.

## Framework

**Vitest** (`vitest run`) con entorno **happy-dom** para los scripts de cliente. Config en [`vitest.config.ts`](./vitest.config.ts); stubs de navegador (IntersectionObserver) en [`tests/setup.ts`](./tests/setup.ts).

## Cómo ejecutar

```bash
npm run test        # suite completa (CI usa esto)
npx vitest          # modo watch en desarrollo
```

CI: `.github/workflows/test.yml` ejecuta la suite en cada push a `main` y en cada PR.

## Capas

| Capa | Qué cubre | Dónde |
|---|---|---|
| Unit | Helpers puros (`src/data/*.ts`: FAQs derivadas, alternativas, paleta) | `tests/tools.test.ts` |
| DOM/integración | Scripts de cliente sobre fixtures de DOM (filtros, vistas, comparador, CTA, marcadores) | `tests/home.test.ts`, `tests/directory.test.ts` |
| Build | Esquemas Zod de content collections — un JSON inválido rompe `npm run build` | `src/content.config.ts` |
| Smoke manual | Flujos reales en navegador (dev/preview) antes de shippear | /qa, /verify |

## Convenciones

- Archivos `tests/<módulo>.test.ts`, un `describe` por comportamiento, asserts sobre lo que el usuario ve (`aria-pressed`, `hidden`, `textContent`) — nunca `toBeDefined()`.
- Fixtures de DOM como template strings con datos estáticos del propio test.
- Al escribir una función nueva, escribe su test; al arreglar un bug, escribe el test de regresión; cada condicional nueva, testea ambas ramas.
- Nunca importar secretos ni credenciales en tests.
