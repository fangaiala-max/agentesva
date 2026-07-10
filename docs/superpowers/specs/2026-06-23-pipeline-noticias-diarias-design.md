# Pipeline diario de noticias AgentesVA — Diseño

**Fecha:** 2026-06-23
**Estado:** Aprobado para plan de implementación
**Repo:** `fangaiala-max/agentesva` (Astro + Vercel)

---

## 1. Problema

Las noticias actuales de `/noticias` son *thin content* y poco relevantes. Se
necesita un flujo que cada día laborable produzca **hasta 4 noticias frescas,
profesionales y verificadas**, basadas en las novedades de IA más virales /
enlazadas / relevantes para un dueño de PyME hispanohablante, redactadas en
español nativo con la calidad del proceso **tom-4pass**.

## 2. Principio rector

De `tom-4pass`: **"Bad process × AI = faster bad results."** El objetivo no es
rellenar 4 huecos al día, sino publicar piezas que ganen la consulta real de un
dueño de PyME en ChatGPT / Google AI Mode. **Si un día no hay 4 noticias que de
verdad valgan, se publican menos.** La automatización nunca genera thin content
para cumplir cuota.

## 3. Objetivos / No-objetivos

**Objetivos**
- Generar **hasta 4 noticias/día, de lunes a viernes**, en español.
- Selección por señal de **viralidad + relevancia PyME-IA + frescura + autoridad**.
- Calidad **tom-4pass real** (research + verificación + voz editorial + schema).
- **Gate humano**: nada se publica sin que Fernando revise y mergee un PR.
- Vivir dentro del repo; cero infraestructura nueva (GitHub Actions cron).

**No-objetivos**
- Publicación 100% automática sin revisión.
- Generar estudios (este pipeline es solo `noticias`; estudios siguen su flujo).
- Tocar el contenido o el diseño existente del sitio.

## 4. Decisiones cerradas

| Decisión | Elección |
|---|---|
| Gate humano | PR diario para revisar → merge → Vercel publica |
| Motor de calidad | Claude Code **headless** ejecutando el skill `tom-4pass` real |
| Fuentes / ranking | RSS de medios IA + señales sociales (HN / Reddit) |
| Runtime | GitHub Actions cron |
| Horario | 06:00 Europe/Madrid (05:00 UTC) |
| Auth del motor | `ANTHROPIC_API_KEY` (Claude API), secret de GitHub |
| Cadencia | Lunes a viernes |

## 5. Arquitectura — 5 etapas

```
[A] News Radar         scripts/ai/news-radar.mjs
     RSS medios IA + señales sociales (HN/Reddit) → scoring → top ~10 candidatos
            │
[B] Selección          scripts/ai/select-noticias.mjs
     top 4 con diversidad de tema (no 4 de lo mismo) + anti-canibalización
            │
[C] tom-4pass headless  claude -p ejecuta el skill tom-4pass REAL por noticia
     Pass 1 scoping · Pass 2 research (WebSearch/WebFetch) · Pass 3 redacción
     → src/content/noticias/<slug>.md + docs/content/worklogs/<slug>.md
            │
[D] Validación          npm run build (Zod schema, 0 errores)
            │
[E] Pull Request        rama noticias/auto-YYYY-MM-DD + checklist Pass-4
            │
       👤 Fernando: Pass 4 (verifica Tier-B, confirma Tier-A) → merge → Vercel
```

## 6. Especificación por etapa

### [A] News Radar — `scripts/ai/news-radar.mjs`
1. Lee RSS de una lista fija (`scripts/ai/news-sources.json`): medios IA / tech /
   negocio (TechCrunch, The Verge, VentureBeat, MIT Tech Review, etc.). Ventana
   **24–36 h**.
2. Enriquece con **señales sociales gratis** (sin tokens):
   - Hacker News (Algolia Search API) → puntos + comentarios.
   - Reddit search en subreddits objetivo (r/artificial, r/ChatGPT,
     r/smallbusiness, r/SaaS…) → score + nº de hilos.
3. Puntúa: `score = w1·viralidad_social + w2·relevancia_PyME_IA + w3·frescura +
   w4·autoridad_fuente` (pesos configurables).
4. Filtro editorial: IA **aplicable a un negocio pequeño** (asistentes,
   automatización, código, marketing, WhatsApp). Descarta papers / hardware puro
   salvo bombazo.
5. Anti-canibalización: descarta temas ya cubiertos en `src/content/noticias/`.
6. Salida: `docs/content/news-queue/YYYY-MM-DD.json` (top ~10: título, url,
   fuente, señales, score, tema sugerido).

### [B] Selección — `scripts/ai/select-noticias.mjs`
- Toma el JSON de la cola y elige **hasta 4** maximizando score con **diversidad
  de `tema`** (evitar 4 de lo mismo).
- Si hay <4 candidatos por encima del umbral de calidad, devuelve menos (y lo
  marca). **No rellena.**
- Salida: lista de 4 (o menos) ítems seleccionados.

### [C] tom-4pass headless
- Por cada ítem seleccionado, el workflow lanza:
  `claude -p "Ejecuta el skill tom-4pass para una NOTICIA sobre: <url + señales>"`
- Con el repo ya clonado en el runner, Claude ejecuta el skill `tom-4pass`
  (en `.claude/skills/tom-4pass/`) tal cual: scoping, research real de la fuente
  primaria + páginas oficiales de las herramientas (WebSearch/WebFetch
  integradas), redacción en voz editorial AgentesVA, frontmatter con schema
  `noticia`, y **cross-link solo a slugs reales** de `src/content/tools/`.
- Escribe `src/content/noticias/<slug>.md` + worklog
  `docs/content/worklogs/<slug>.md` con la tabla `claim → fuente → tier`.
- **Limitación conocida:** en CI no hay MCP interactivos (Semrush /
  Reddit-insights); el Pass-2 automático se apoya en WebSearch/WebFetch. La
  verificación fina Tier-B/Tier-A la cierra el humano en el PR — el reparto que
  el propio skill define ("pipeline output = Pass-3 draft; debe pasar Pass-4").

### [D] Validación
- `npm run build` desde la raíz del repo. Zod valida el frontmatter. **0 errores**
  es requisito para abrir el PR como *ready*; si falla, el PR se abre como **draft**
  con el log del error (nada roto se publica).

### [E] Pull Request
- Rama `noticias/auto-YYYY-MM-DD`. Commit con los `.md` + worklogs + el JSON de
  cola.
- PR title: `📰 Noticias diarias — YYYY-MM-DD (N)`.
- PR body, por noticia: título · fuente (link) · tema · score; **checklist
  Pass-4** (tabla claim→fuente→tier + cualquier `[SIN VERIFICAR]` resaltado);
  petición de confirmación explícita si hay algo **Tier-A** (legal / subvenciones
  / Kit Digital).
- Labels: `noticias`, `automated`.

## 7. Configuración y operación

- **Cron:** `0 5 * * 1-5` (05:00 UTC = 06:00 Madrid, lun–vie).
- **Secret:** `ANTHROPIC_API_KEY` en GitHub → Settings → Secrets.
- **Modelo:** Claude Sonnet por defecto; override por env. Guardrail de
  presupuesto de tokens por run.
- **Días flojos:** <4 ítems de calidad → publica menos y lo indica en el PR.
- **Fallo de build / motor:** PR en draft con el error; nunca publica roto.

## 8. Archivos nuevos (no toca contenido existente)

```
.github/workflows/noticias-diarias.yml   ← cron + orquestación de las 5 etapas
scripts/ai/news-radar.mjs                ← [A] RSS + señales + scoring
scripts/ai/news-sources.json             ← lista editable de feeds + pesos
scripts/ai/select-noticias.mjs           ← [B] selección top 4 con diversidad
docs/content/news-queue/.gitkeep         ← cola diaria (auditable)
docs/content/worklogs/.gitkeep           ← worklogs tom-4pass (no shipped)
```

## 9. Criterios de éxito

- Un día laborable a las ~06:10 Madrid existe un PR con **hasta 4** borradores de
  noticia que **pasan `npm run build`**.
- Cada borrador tiene: frontmatter válido (`titulo, descripcion, fecha, tema,
  fuente{nombre,url}`), voz editorial AgentesVA, `herramientas[]` con slugs
  reales, y worklog con tabla claim→fuente→tier.
- Fernando revisa y mergea en ≤10 min; el contenido publicado **no es thin**.
- En días sin material de calidad, el PR trae menos de 4 (o ninguno) — sin
  relleno.

## 10. Riesgos

- **Coste de tokens** (4 research/día): mitigado con guardrail de presupuesto +
  modelo configurable.
- **Calidad del research headless** sin MCPs: mitigado por el gate humano Pass-4.
- **Rate limits / feeds caídos**: el radar tolera fuentes fallidas y sigue con el
  resto.
- **Volumen de revisión** (hasta 20 PRs/semana): mitigado por el checklist Pass-4
  ya preparado en el PR para revisión rápida.
