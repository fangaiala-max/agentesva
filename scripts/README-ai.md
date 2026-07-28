# Pipeline de contenido — Vercel AI Gateway

Genera contenido **original en español a escala** vía [AI Gateway](https://vercel.com/docs/ai-gateway) (un endpoint para 100+ modelos, con failover, tags y seguimiento de coste). Salida validada con Zod y escrita en las content collections — versionada en el repo, no en runtime.

## Qué genera (hoy)
- **`ai:faqs`** — 4 FAQs por herramienta (`faq` en `src/content/tools/*.json`). Las fichas las renderizan (visibles) y emiten **FAQPage** (GEO/AEO, citable por IA).
- **`ai:estudios`** — comparativas en forma de respuesta ("mejores herramientas para X", "IA para Y") como Markdown en `src/content/estudios/*.md`. Los temas se definen en `scripts/ai/estudios-briefs.json` (tema, pregunta, herramientas reales del directorio, puntos a cubrir); el modelo ancla el contenido en los datos reales de cada ficha y enlaza a `/herramienta/<slug>`. Emite **Article + FAQPage**.

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

npm run ai:estudios             # genera los estudios del brief que aún no existen
npm run ai:estudios -- --force  # regenera todos
npm run ai:estudios -- --only=ia-para-atencion-al-cliente
```
Luego **revisa** el contenido (`docs/blog-fact-checking-protocol.md`) y commitea `src/content/tools/*.json` / `src/content/estudios/*.md`. El build valida con Zod. Para añadir temas de estudios, edita `scripts/ai/estudios-briefs.json` (usa slugs de herramientas que existan en `src/content/tools/`).

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

## Noticias diarias (candidatos)

`ai:radar` + `ai:select` alimentan el workflow `.github/workflows/noticias-diarias.yml`
(cron lun–vie 06:00 Madrid). El workflow **solo cura**: descarga RSS + señales sociales
(HN/Reddit), puntúa y selecciona hasta 4 candidatos con temas diversos, y abre un **PR
draft** con la lista sobre la rama `noticias/candidatos-<fecha>`. **No redacta nada
automáticamente → sin API key, sin coste, sin superficie de inyección.**

La **redacción** de cada noticia la hace un humano en una **sesión de Claude Code**
ejecutando el skill **tom-4pass** (research + verificación + voz editorial), y la commitea
a esa rama; luego se marca el PR como *ready*, se revisa (Pass 4) y se mergea. Nada se
publica solo; nunca rellena en días flojos.

- Probar la curación localmente: `npm run ai:radar && npm run ai:select`
- Escribir un candidato: `node scripts/ai/build-prompt.mjs --date=<fecha> --index=<i>` → tom-4pass.
- Lanzar el workflow a mano: **Actions → Noticias diarias — candidatos → Run workflow**.
- **Sin secretos**: el workflow no usa ninguna API key.
- Ajustar fuentes/pesos/umbral: `scripts/ai/news-sources.json`.
