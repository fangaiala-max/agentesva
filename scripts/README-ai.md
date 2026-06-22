# Pipeline de contenido — Vercel AI Gateway

Genera contenido **original en español a escala** vía [AI Gateway](https://vercel.com/docs/ai-gateway) (un endpoint para 100+ modelos, con failover, tags y seguimiento de coste). Salida validada con Zod y escrita en las content collections — versionada en el repo, no en runtime.

## Qué genera (hoy)
- **`ai:faqs`** — 4 FAQs por herramienta (`faq` en `src/content/tools/*.json`). Las fichas las renderizan (visibles) y emiten **FAQPage** (GEO/AEO, citable por IA).
- _Próximo:_ `ai:estudios` — comparativas en forma de respuesta ("mejores herramientas para X", "alternativas a Y") para `/estudios`. Reusa `scripts/ai/gateway.mjs`.

## Setup (una vez)
1. **Habilita AI Gateway** en el proyecto: Vercel → `05-agentesva` → **AI Gateway** (incluye créditos gratis/mes).
2. **Auth** (una de las dos):
   - `AI_GATEWAY_API_KEY=...` en `.env.local` (Vercel → AI Gateway → **API Keys**), **o**
   - `vercel env pull .env.local` (token OIDC, ~24h; re-pull cuando caduque).

El SDK `ai` lee esa auth automáticamente.

## Uso
```bash
npm run ai:faqs                 # todas las herramientas sin FAQ
npm run ai:faqs -- --force      # regenera todas
npm run ai:faqs -- --only=cursor,make
```
Luego **revisa** las FAQs (`docs/blog-fact-checking-protocol.md`) y commitea `src/content/tools/*.json`. El build valida con Zod.

## Modelo
- Por defecto `anthropic/claude-sonnet-4.6`. Override con `AI_MODEL=...`. Failover con `AI_FALLBACK_MODELS=openai/gpt-5.4,...`.
- Para abaratar el lote alto-volumen: `AI_MODEL=anthropic/claude-haiku-4.5`.
- Si un slug está obsoleto, el gateway hace failover; o lista los actuales:
  ```js
  import { gateway } from 'ai';
  console.log((await gateway.getAvailableModels()).map((m) => m.id));
  ```

## Coste / observabilidad
Cada llamada va etiquetada (`project:agentesva`, `feature:tool-faqs`, `tool:<slug>`). Mira gasto y trazas en Vercel → AI Gateway → Observability. Tokens a precio de proveedor, sin markup.
