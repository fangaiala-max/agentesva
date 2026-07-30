# Worklog — Microsoft unificará todos sus Copilot en una sola app

Candidato del radar 2026-07-30, índice 1. Formato: **noticia**.

---

## GATE 1 — Order

| | |
|---|---|
| **Formato** | noticia |
| **AI-query target** | "¿merece la pena pagar Copilot para mi empresa?" |
| **Lector / tema / mercado** | PyME que ya usa Microsoft 365 · `Automatización` · España + LATAM |
| **Herramientas** | `microsoft-copilot`, `chatgpt` — verificadas en `src/content/tools/` |
| **Claim afilado** | El agente que ibas a pagar aparte ya está dentro de lo que pagas: Cowork lleva desde junio disponible. |
| **Riesgo Tier A** | Ninguno. |

**Canibalización:** tres noticias mencionan Copilot de pasada (asistentes gratis, editores
de código, la de Perplexity), ninguna trata de él. No compite; la de Perplexity se
complementa —esta es su continuación natural.

## GATE 2 — Brief

### El hueco

La cobertura se queda en "Microsoft confirma super app". Nadie señala que **la pieza que
ejecuta trabajo (Cowork) ya está en disponibilidad general desde el 16 de junio**, ni pone
el precio al lado del de la alternativa de la que todo el mundo habla. Eso es lo accionable.

### Fuentes con tier — todas fetcheadas, ninguna de resumen de búsqueda

| # | Claim | Fuente | Fecha | Tier |
|---|---|---|---|---|
| 1 | Nadella confirma la super app; cita textual "from chat to Cowork to Autopilots… in one super app"; abarca consumo y empresa | [The Verge](https://www.theverge.com/tech/972927/microsoft-copilot-super-app-confirmed) (Emma Roth), leída con navegador | 2026-07-29T22:17:38Z | B |
| 2 | Lo dijo en la llamada de resultados del miércoles | The Verge | 2026-07-29 (miércoles, comprobado) | B |
| 3 | OpenAI presentó ChatGPT Work (ChatGPT + Codex) | The Verge | 2026-07-29 | B |
| 4 | Copilot Cowork **en disponibilidad general** | [Blog M365](https://www.microsoft.com/en-us/microsoft-365/blog/) — post "Copilot Cowork is now generally available" | 2026-06-16 | B |
| 5 | Qué hace Cowork: plan, ejecución en segundo plano, puntos de control, apoyado en correos/reuniones/ficheros | Blog M365 oficial | 2026-03-09 / 2026-06-16 | B |
| 6 | Copilot Business add-on **18 $/usuario/mes** anual (21 sin compromiso) | [Microsoft 365 Copilot para empresas](https://www.microsoft.com/en-us/microsoft-365/copilot/business) | consultado 2026-07-30 | B |
| 7 | Business Standard con Copilot 23,50 $ · Business Premium con Copilot 32 $ | Microsoft, misma página | consultado 2026-07-30 | B |
| 8 | Perplexity Max 200 $/mes · Enterprise Max 271 $/puesto | Página oficial de precios de Perplexity (verificada en la noticia anterior) | 2026-07-29 | B |

### Precauciones tomadas

- **"Autopilots"** se atribuye explícitamente como palabra de Nadella, no como producto
  contratable: el blog de M365 no muestra ningún producto con ese nombre.
- **La super app** se presenta como lo que es —una afirmación en una llamada de
  resultados, sin fecha, precio ni demo—, no como lanzamiento.
- **Fecha de la fuente:** The Verge marca `2026-07-29T22:17:38+00:00`, que en hora española
  (GMT+2) es el **30 de julio a las 00:17**. Se usa el 30 en el cierre porque es la fecha
  que ve el lector objetivo.

## GATE 4 — Fact check

| Comprobación | Resultado |
|---|---|
| Slugs `microsoft-copilot` y `chatgpt` existen | ✅ |
| Enlaces `/herramienta/` coinciden con `herramientas[]` | ✅ |
| `[SIN VERIFICAR]` restantes | 0 |
| 2026-07-29 fue miércoles | ✅ comprobado |
| 200 ÷ 18 = 11,1 | Corregido: decía "diez veces", ahora "más de diez veces" |
| URL de `fuente` resuelve | ✅ leída con navegador |
| `npm run build` | ✅ 0 errores |

### Lección de la noticia anterior, aplicada

Los cinco errores de la pieza de Perplexity vinieron de fiarse de resúmenes de WebSearch y
de aceptar un 403 como definitivo. Aquí **ningún dato entra desde un resumen**: The Verge
se leyó con Playwright (bloquea WebFetch) y los precios salen de la página oficial de
Microsoft fetcheada. La única búsqueda que se usó fue para *localizar* URLs, no para
extraer datos.

**655 palabras.** Sin commitear.
