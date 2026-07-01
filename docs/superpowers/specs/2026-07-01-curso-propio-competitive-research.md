# Anexo — Investigación competitiva: curso propio (AI Engineering / Seguridad LLM)

**Fecha de verificación: 2026-07-01** (páginas vivas; Udemy vía render de navegador + comidoc por bloqueo 403). Soporta las decisiones de [2026-07-01-curso-seguridad-llm-design.md](./2026-07-01-curso-seguridad-llm-design.md). Método: 5 agentes de búsqueda en paralelo + verificación directa de ~25 páginas + Semrush (ES/MX).

## Decisión que motivó esta investigación

El plan A era un curso completo de AI Engineering (49€, 8 módulos). La investigación lo **aparcó**: el nicho en español no está vacío, 49€ caía en zona muerta de precio, y los huecos reales apuntaban a un producto más pequeño y afilado (mini-curso de seguridad LLM a 19€ como test de demanda).

## Mapa competitivo (verificado)

### Español — los que pisan el terreno

| Competidor | Precio real | Alcance | Le falta |
|---|---|---|---|
| **Frogames/Gomila** — "Ingeniería de LLM" (44,5h) + "Ingeniería de Agentes" (55h, semana entera de MCP) + "IA y MLOps en Producción" (55h, Langfuse) — adaptaciones oficiales de Ed Donner | **99,99€/curso** (≈300€ el equivalente) ó 199€/año la ruta; en Udemy **11,99-14,99€** oferta (4.900-5.600 alumnos/curso) | RAG, fine-tuning QLoRA, agentes (SDK/CrewAI/LangGraph/AutoGen), MCP, benchmarks de modelos, despliegue | **Defensa anti-injection, evals de aplicación** (solo benchmarks de modelos + 1 lección suelta de judge), integración en un solo capstone |
| **Platzi** (ruta "AI Software Engineer", 9 cursos de 2-6h: LangChain, Agentes, LangGraph, OpenAI API, RAG Azure, **MCP Azure**, **Observabilidad LangSmith** — este último con clase "LLM as a Judge") | Basic 59€/mes · Expert **299€/año** | ~7 de los 8 módulos del plan A, fragmentados, 3+ instructores | Hilo integrador, capstone, **defensa anti-injection** (solo 1 clase de 3:53 en el curso MCP), evals de regresión |
| **Código Facilito** — Bootcamp LLMs (12 semanas; ya solo replays vía suscripción) | $150 único (histórico) / Premium $97/año | Transformers, prompting, RAG+fine-tuning, 1 clase de despliegue/costes/evaluación (PromptBench), 1 clase de privacidad/seguridad | Agentes, MCP, injection ingenieril, profundidad de evals |
| **KeepCoding** — "Programa Técnico Avanzado en Ingeniería de IA" | **599€** | LLMs en producción, agentes, RAG avanzado (temario no público) | Sin verificar MCP/evals/injection. Bootcamp full-stack aparte: 6.950€, otra categoría |
| **EDteam** — píldoras: LangChain, RAG, "crea tu LLM", **"Agentes MCP con LangChain" (1h16m)** | **$9-12/curso** de por vida | Amplitud barata | Profundidad; sin evals, sin injection, producción superficial |
| **Academia IA** — "Curso de RAG" (cohorte 3 meses) | **328€** | Lo más serio en evals… **solo de RAG**: RAGAS/TruLens/DeepEval, reranking, GraphRAG, producción | Todo lo demás; solo ámbito RAG |
| **DevTalles** — "IA para Developers: Claude API, RAG y Agentes con Node" | **$60** único | ⚠️ **El único con defensa anti-injection explícita en español**: sección de guardrails en 3 capas, "detección de prompt injection (16 patrones)", rate limiting | Es **Node.js**, una *sección* dentro de un curso general; sin MCP, sin evals |
| **Aceleradora AI (Colomer)** — Bootcamp Udemy 93,5h (15.708 alumnos, **4,1★**) | 11,99€ oferta; presencial 999-1.499€ | LangChain 1.0, RAG, CrewAI/LangGraph, LangSmith "LLMOps" nominal | MCP, injection, evals como disciplina; rating mediocre |
| Otros verificados | — | midudev (**gratis**, usar IA para programar, cubre MCPs a nivel de uso — fija la barra gratuita); Alura, IEBS (no-code), Nuclio/Founderz (negocio), UNED (127€, no reeditado) | No compiten en ingeniería de apps LLM con código |

### Inglés — los referentes que fijan expectativas

| Referente | Precio | Nota |
|---|---|---|
| Ed Donner (Udemy) — LLM Eng 33,5h + Agentic/MCP | 15-20€ oferta · **303K-343K alumnos, 4.7★** | El original de las adaptaciones de Gomila |
| DeepLearning.AI | Pro $25-30/mes | Todo existe como mini-cursos sueltos (MCP c/ Anthropic, Evaluating AI Agents 2,3h, Red Teaming 1,3h); sin ruta integrada |
| Coursera "GenAI with LLMs" | Plus $59/mes | 440K alumnos; curso de *entrenamiento de modelos*, vintage 2023 |
| Scrimba AI Engineer Path | 212€/año | JS-only; sin evals ni injection |
| ZTM | $299/año | 181h; evals/injection no nombrados |
| **Maven — "AI Evals for Engineers & PMs"** (Hamel Husain & Shreya Shankar) | **$3.150-4.200** cohorte · 4.500+ alumni | La prueba de que evals-como-disciplina es premium; no existe en español |

## Los tres hallazgos que gobiernan la decisión

1. **Defensa contra prompt injection:** ningún curso *dedicado* en ningún precio en español; una sola *sección* (DevTalles, Node). En Python: nada. → **El claim del mini-curso: "el único curso en español dedicado a la seguridad de aplicaciones LLM."**
2. **Evals de aplicación / LLM-as-judge como disciplina:** inexistente como contenido estructurado en español (lo más cercano: Academia IA, solo RAG, 328€; Platzi 1 clase). En inglés vale $3.150. → lección 7 del mini-curso y ancla del futuro curso grande.
3. **MCP ya es table stakes** (Frogames semana entera, Platzi curso dedicado, EDteam píldora, ZTM/Scrimba/Donner) — no liderar marketing con MCP.

## Demanda (Semrush, ES + MX, jun-2026)

| Término | ES | MX | Nota |
|---|---|---|---|
| `langchain` | 4.400 | 720 | topic con más volumen |
| `prompt engineering` | 1.900 | 1.300 | |
| `agentes ia` | 1.000 | 720 | CPC MX **7,32€** |
| `fine tuning` | — | 1.000 | |
| `ai engineering` / `ai engineer` | 320-480 | 390 | |
| `curso ai engineering` | **0** | 0 | la gente no busca el curso por ese nombre |
| `curso llm` / `curso rag` / `curso langchain` | ~20 c/u | ~0 | long-tails mínimos |

→ SEO de ficha y contenido de apoyo hacia los *topics* (`prompt engineering`, `agentes ia`, `langchain`) + ángulo de actualidad (incidentes de seguridad → /noticias → funnel).

## Anclas de precio y riesgos registrados

- Anclas: Udemy-ES oferta perpetua 9,99-17,99€ · Frogames directo 99,99€/curso · suscripciones 97-399€/año · cohortes 328-4.200€. **19€ pago único** queda entre la oferta Udemy y Frogames directo, con un claim de nicho sin ocupar.
- Riesgos (aplican también al futuro curso grande): percepción de vídeo-avatar a precio premium (→ estrategia híbrida HeyGen+screencasts); sin certificado/comunidad (aceptado a 19€); treadmill de actualizaciones ("actualizado MM/AAAA" + promesa); **Gumroad no trae tráfico** — la venta depende del funnel propio.

## No verificado / caveats

Precio EUR exacto de algunos productos (Frogames promos, EDteam lista), stats de cursos Udemy pequeños (vía comidoc, no en vivo), temario interno del PTA de KeepCoding y del "AI Assessment" de LIDR, subtítulos ES del curso de Coursera, profundidad real del módulo de evaluación de Código Facilito.

---
_Generado con [Claude Code](https://claude.com/claude-code)._
