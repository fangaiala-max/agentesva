# Diseño — Curso propio: "Seguridad de LLMs: defensa contra prompt injection" (19€)

**Fecha:** 2026-07-01 · **Rama:** `feat/curso-seguridad-llm` · **Precio:** 19€ (Gumroad, pago único)
**Fuentes de verdad:** [business brief](./2026-06-21-agentesva-directory-business-brief.md) (§ tienda/validación) · `docs/brand-guidelines.md` (voz) · `DESIGN.md` (marca) · [anexo competitivo](./2026-07-01-curso-propio-competitive-research.md)

## Resumen

Primer **producto propio de pago** de AgentesVA: un **mini-curso en español, dedicado a la seguridad de aplicaciones LLM** (prompt injection y sus defensas), para desarrolladores/practitioners que construyen chatbots, RAG o agentes. 8 lecciones + mini-capstone, Python-first, 19€ en Gumroad. Reemplaza al placeholder `curso-express-ia-negocio.json` como el curso `propio` del directorio.

Es a la vez: (1) el **test de demanda de pago** que el brief exige antes de abrir la tienda ("1 producto pequeño vía Gumroad"), y (2) la **semilla del curso grande de AI Engineering** (aparcado): si valida, estas lecciones se convierten en su módulo de seguridad y los compradores obtienen upgrade con descuento.

## Por qué este producto (validado contra el mercado, 2026-07-01)

Investigación competitiva completa en el [anexo](./2026-07-01-curso-propio-competitive-research.md). Lo esencial:

- El plan original (curso completo de AI Engineering, 49€, 8 módulos) quedó **aparcado**: el nicho en español NO está vacío (Gomila/Frogames ~300€ en 3 cursos ó 12-15€ en Udemy con 42h; Platzi cubre ~7/8 módulos fragmentados; ~25.000 alumnos acumulados en Udemy-ES) y 49€ caía en zona muerta de precio.
- Los **huecos reales verificados** en español: (a) **defensa contra prompt injection** — exactamente *un* curso la toca como sección (DevTalles, $60, Node.js); **ninguno dedicado, ninguno en Python**; (b) **evals de aplicación / LLM-as-judge** como disciplina — inexistente como contenido estructurado; (c) producción coste/latencia/observabilidad como módulo central.
- Este mini-curso ataca (a) como foco y (b) como lección puente (evals de seguridad).
- **Claim de posicionamiento (exacto y verificado):** "El único curso en español **dedicado** a la seguridad de aplicaciones LLM." No usar "el primero de AI engineering" (falso — Gomila) ni "nadie enseña inyección" (DevTalles la toca como sección).
- **Demanda (Semrush ES+MX):** los términos de curso tienen volumen bajo; la demanda vive en los topics: `prompt engineering` 1.900+1.300/mes, `agentes ia` 1.000+720 (CPC 7,32€ MX), `langchain` 4.400+720. El SEO de la ficha y el contenido de apoyo apuntan a esos términos + el ángulo de actualidad (incidentes de inyección → /noticias → funnel).

## Público y promesa

- **Para:** developers y perfiles técnicos hispanohablantes que ya tienen (o construyen) una app con LLMs — chatbot, RAG, agente — en producción o camino de ella.
- **Promesa:** "Protege tu app de IA antes de que un usuario la rompa: aprende a atacarla en un laboratorio y a defenderla en 3 capas, con código que puedes copiar."
- **Nivel:** intermedio (sabe Python básico y qué es una API de LLM). No requiere GPU ni gasto: los laboratorios corren contra **cualquier endpoint OpenAI-compatible**, con dos rutas documentadas: **Ollama local (gratis)** u OpenAI/otros (API key propia).

## Temario (8 lecciones + mini-capstone)

| # | Lección | Tipo | Vídeo kit |
|---|---|---|---|
| 1 | **Por qué tu app LLM es atacable** — incidentes reales documentados (Tier A), superficie de ataque de una app LLM | teoría | HeyGen |
| 2 | **Anatomía del prompt injection** — directo, indirecto (vía RAG/documentos/web), jailbreaks, exfiltración de datos y de system prompts | teoría | HeyGen |
| 3 | **OWASP Top 10 para aplicaciones LLM, en español** — el mapa completo del riesgo (versión vigente verificada al escribir) | teoría | HeyGen |
| 4 | **Laboratorio de ataque** — construimos y rompemos una app RAG vulnerable (inyección directa e indirecta; exfiltración con canary tokens) | código | screencast |
| 5 | **Defensa capa 1: diseño** — separación instrucciones/datos, delimitadores, plantillas endurecidas, least-privilege en tools | código | screencast |
| 6 | **Defensa capa 2: guardrails programáticos** — validación de entrada/salida, structured outputs como defensa, clasificador de inyección, human-in-the-loop; panorama de librerías (implementamos desde cero, sin lock-in) | código | screencast |
| 7 | **Defensa capa 3: evals de seguridad** — dataset red-team propio, suite de regresión con pytest, LLM-as-judge para seguridad *(puente al futuro módulo de evals)* | código | screencast |
| 8 | **Checklist de producción** — monitorización, logging, PII, rate limiting, respuesta a incidentes; checklist descargable | teoría+plantilla | HeyGen |
| ★ | **Mini-capstone: de vulnerable a defendida** — la app de la lección 4 endurecida con las 3 capas; la suite de la lección 7 demuestra el antes/después | código | screencast |

**Decisiones técnicas fijadas:**
- Python 3.12+, dependencias mínimas; cliente **OpenAI-compatible** como primario (funciona con Ollama local gratis, OpenAI, DeepSeek…); anexo breve con el SDK de Anthropic. Al escribir contenido específico de Anthropic, verificar contra la documentación actual de la API (skill `claude-api`).
- **Mecanismo de verificación determinista:** canary tokens en system prompt y documentos RAG — un ataque "tiene éxito" si el canary aparece en la salida (asertable por string-match, robusto a la variabilidad del modelo).
- Guardrails implementados **desde primeros principios** (el alumno entiende el mecanismo); las librerías (Guardrails AI, LLM Guard, Rebuff…) se presentan como panorama, no como dependencia.
- Evals: pytest + judge propio; sin vendor lock-in (promptfoo/RAGAS mencionados como panorama).

## Entregables

### A. Repo privado `agentesva-curso-seguridad-llm` (nuevo, GitHub privado)
```
lessons/            8 lecciones + capstone en markdown (ES, voz de marca, técnico sin humo)
code/
  app-vulnerable/   chatbot RAG mínimo, atacable (FastAPI de un solo archivo — realista para las lecciones de rate limiting/logging)
  app-defendida/    misma app con las 3 capas de defensa
  attacks/          suite de ataques (inyecciones directas/indirectas, canaries)
  evals/            dataset red-team + suite pytest + LLM-as-judge
video-kits/
  heygen/           guiones de narración ES con cortes de escena (lecciones 1-3, 8)
  screencasts/      guiones plano-a-plano terminal/editor (lecciones 4-7, capstone)
  decks/            slide decks HTML con tokens Futurista (uno por lección)
gumroad/            copy del listing (título, descripción, FAQ), spec de portada
extras/             checklist de producción (PDF-ready), plantillas
```

### B. Paquete Gumroad (lo que compra el cliente)
Lecciones en PDF (+ bundle HTML), zip del código, checklist, acceso a actualizaciones. **Portada** generada con el brand kit. Copy del listing listo para pegar (Fernando crea el producto en Gumroad y pega la URL real).

### C. Cambios en el sitio (PR pequeña a `main`)
- **Nueva ficha** `src/content/cursos/seguridad-llm.json`: `tipo: "propio"`, `precio: "Pago"`, `precioDesde: "19 €"`, `categoria: "Prompts e ingeniería de prompts"`, `proveedor: "AgentesVA"`, `idioma: "Español"`, descripción original ES; `gumroadUrl` placeholder hasta que exista el producto real → entonces `destacado: true`.
- **Eliminar** `src/content/cursos/curso-express-ia-negocio.json` (el concepto "IA para tu negocio en un fin de semana" queda en la nevera, documentado aquí).
- Build verde (Zod + guard de slugs); el índice Pagefind recoge la ficha automáticamente.

## Estrategia de vídeo (híbrida, decidida por el riesgo de percepción)

- **HeyGen (avatar):** solo lecciones de teoría (1-3, 8) — guiones de narración en ES con cortes de escena + deck de apoyo.
- **Screencasts reales (sin cámara):** lecciones de código (4-7, capstone) — guiones plano-a-plano (qué archivo abrir, qué ejecutar, qué señalar) para grabar pantalla con OBS/Loom. Mitiga el riesgo "curso avatar = AI slop" detectado en la investigación: el código se enseña con pantalla real.

## Calidad (no negociable)

- **Incidentes y claims: Tier A** (`docs/blog-fact-checking-protocol.md`) — cada incidente citado con fuente primaria verificada; versión OWASP LLM Top 10 vigente comprobada al escribir.
- **El código se ejecuta:** el ataque funciona de verdad contra la app vulnerable (canary exfiltrado), la app defendida lo bloquea, y la suite de evals lo demuestra — verificado en local antes de empaquetar (ruta Ollama documentada como la de verificación).
- **Contenido 100 % defensivo** (estilo OWASP): se enseña a atacar *la app de laboratorio propia* para saber defenderla.
- Español neutro, voz de marca; términos técnicos estándar en inglés donde corresponde.

## Criterio de validación (el porqué del producto)

Test de demanda de pago del brief. **Señal orientativa** (ajustable): ≥15 ventas en los primeros 60 días vía funnel propio (newsletter + ficha + contenido de apoyo) = luz verde para evaluar el curso grande de AI Engineering (estas lecciones = su módulo de seguridad; compradores con descuento de upgrade). Por debajo: iterar precio/ángulo antes de producir nada mayor.

## Fuera de alcance

- El curso completo de AI Engineering (8 módulos) — aparcado, documentado en el anexo competitivo.
- Certificados y comunidad (no a 19€; reconsiderar en el curso grande).
- Render de los vídeos (Fernando ejecuta HeyGen/OBS con los kits) y alta del producto en Gumroad (Fernando, con el copy entregado).
- Versión en inglés; venta en Udemy/marketplaces (canal propio primero).
- Infra de pagos/auth en el sitio (Gumroad aloja todo el checkout).

---
_Generado con [Claude Code](https://claude.com/claude-code)._
