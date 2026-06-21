> ⚠️ **SUSTITUIDO (2026-06-21):** el proyecto evolucionó de "newsletter" a "directorio/medio de IA".
> Fuente de verdad actual: [`2026-06-21-agentesva-directory-business-brief.md`](./2026-06-21-agentesva-directory-business-brief.md).
> Este archivo se conserva por contexto histórico (la capa newsletter sigue siendo válida dentro del modelo nuevo).

# Brief de Negocio — AgentesVA Newsletter ("lista → monetización")

- **Fecha:** 2026-06-21
- **Autor:** Fernando Angulo
- **Estado:** Definición de idea (pre-diseño) — para revisión CEO
- **Referencias:** [Grow With AI](https://growwithaiguide.substack.com/) (motor de lista) · [Authority.md](https://authority.md/) (tienda de productos digitales)

---

## 1. Resumen ejecutivo

Construir una **newsletter en español de "IA para tu negocio"** bajo la marca **AgentesVA**, con un objetivo de negocio claro y secuenciado:

1. **Ahora:** construir una **base de datos de suscriptores (email)** lo más grande y barata posible. La lista *es* el activo.
2. **Después:** **monetizar** esa lista mediante **productos digitales** (packs de prompts/plantillas/skills en español, modelo Authority.md) y **patrocinios**.

La página combina dos modelos probados: **Grow With AI** (la máquina de suscripción gratis) y **Authority.md** (la tienda de activos digitales de pago).

## 2. Problema / oportunidad

- PyMEs, autónomos y profesionales hispanohablantes (España + LATAM) tienen **curiosidad + incertidumbre** sobre cómo usar IA de forma práctica.
- El contenido de IA **accionable en español** es escaso frente al inglés.
- Ventana: captar atención top-of-funnel **ahora** (audiencia barata) y monetizarla **después** con activos digitales — la economía de creadores y Authority.md demuestran el modelo.

## 3. Cliente objetivo (ICP)

- **Primario:** dueños/operadores de PyME y autónomos hispanos que quieren usar IA para crecer (marketing, ventas, operaciones) **sin ser técnicos**.
- **Secundario:** profesionales de marketing/growth curiosos por IA.
- **Idioma/geografía:** español, España + LATAM.

## 4. El producto (2 fases)

### Fase 1 — La máquina de lista *(construir ahora)*
- Landing tipo Substack en `agentesva.com/newsletter`, marca **AgentesVA**.
- Hero + propuesta de valor + **formulario de suscripción** → Brevo (infra ya existente: `/api/subscribe`).
- **Gancho (lead magnet):** pack de recursos de IA gratis (reaprovecha `prompts/`, `catalogo/`).
- Feed de posts (reaprovecha 7 posts del blog actual), categorías, página "Sobre", CTAs de suscripción repetidos (sticky + final).
- **Infra:** Brevo + Astro estático. **Esfuerzo: bajo-medio.**

### Fase 2 — La tienda *(monetización futura)*
- Catálogo de **packs de pago** (prompts/skills/plantillas en español), modelo Authority.md.
- Comparador interactivo ("prompt típico" vs "tu pack"), tabla de precios (3 tiers), FAQs/objeciones.
- **Checkout + entrega digital** vía pasarela externa (Gumroad / Lemon Squeezy / Stripe).
- **Infra:** pasarela de pago + entrega digital (NO existe hoy). **Esfuerzo: medio-alto.**

## 5. Propuesta de valor / posicionamiento

- Promesa: **"1 idea de IA por semana para crecer tu negocio — en español, sin tecnicismos."**
- Diferenciación: español nativo + foco PyME/LATAM + activos **accionables** (no teoría).

## 6. Modelo de negocio

| Momento | Ingreso | Mecanismo |
|---|---|---|
| Fase 1 · suscripción | $0 (gratis) | La suscripción es gratis para maximizar volumen; la lista es el activo |
| Fase 1 · afiliados | Variable | Enlaces de afiliado a herramientas de IA en la página de recursos + footer de la newsletter. La fuente más rentable en newsletters de IA 2026. Genera ingreso sin necesitar volumen. Requiere disclosure legal. (añadido por revisión CEO 2026-06-21) |
| Futuro (Fase 2) | Productos digitales | Packs de prompts/plantillas/skills, low-ticket ($5–30) |
| Futuro (Fase 2) | Patrocinios | Marcas pagan por llegar a la audiencia (requiere volumen) |
| Opcional | Cross-sell SaaS | Vender AgentesVA (visibilidad IA) a la parte cualificada de la lista |

## 7. Go-to-market (cómo crece la lista)

- Lead magnet potente en la landing (conversión visita→suscriptor).
- Reutilización SEO del blog existente (7 posts) + contenido nuevo.
- Compartibilidad del gancho.
- Canales: orgánico/SEO, redes sociales, recomendaciones cruzadas (estilo Substack).

## 8. Panorama competitivo / referencias

- **Grow With AI** — modelo de motor de lista (suscripción + recursos gratis).
- **Authority.md** — modelo de tienda de productos `.md` (459 frameworks, precios $4.99–$29.99).
- Mercado de "tips de IA" **muy saturado en inglés**; en español hay menos competencia pero **demanda menos probada**.

## 9. Métricas de éxito

- **Fase 1:** conversión landing (visita→suscriptor), nº suscriptores, coste por suscriptor, tasa de apertura/clic.
- **Fase 2:** conversión suscriptor→comprador, ingresos por producto, valor por suscriptor (LTV).

## 10. Riesgos y supuestos (sin filtro)

- **Demanda monetizable no validada:** datos Semrush propios muestran volumen de búsqueda **modesto en España y casi nulo en LATAM** para términos de IA/agencias. La disposición a **pagar** por productos de IA en español está sin probar.
- **Riesgo de marca:** "AgentesVA" es un nombre de **producto SaaS fintech**; usarlo para una newsletter amplia de IA puede **diluir** el posicionamiento de visibilidad IA del producto.
- **Riesgo de ejecución/cadencia:** una newsletter exige **publicación regular sostenida**. Sin cadencia, la lista se enfría. ¿Quién escribe, con qué frecuencia?
- **Riesgo de monetización:** patrocinios requieren **volumen alto** (varios miles de subs); productos requieren que la audiencia **compre** (no validado).
- **Coste de oportunidad:** esto compite por tiempo con el SaaS AgentesVA (que ya tenía un pilot de pago pendiente de validar).

## 11. Hoja de ruta

1. **Fase 1 (este sprint):** landing + suscripción + lead magnet + feed de posts.
2. **Fase 2 (cuando la lista supere un umbral, p.ej. ≥1–3k subs):** tienda de packs con checkout externo.

## 12. Preguntas abiertas

- ¿Cadencia de publicación realista y quién la sostiene?
- ¿Cuál es el lead magnet concreto v1?
- ¿Meta de suscriptores y plazo (define "éxito")?
- ¿Validamos disposición a pagar **antes** de construir la Fase 2?
- ¿Sub-marca propia vs. marca AgentesVA — decisión final? (hoy: AgentesVA)

---

## 13. Decisiones de la revisión CEO (2026-06-21)

Modo: **Expansión selectiva**. El alcance "newsletter amplia, marca AgentesVA" se mantiene como base.

| # | Decisión | Resultado | Razón |
|---|----------|-----------|-------|
| D1 | Enfoque estratégico | **Construir AMPLIO** (vol. máximo, modelo "IA en Español") | Decisión del fundador; prioriza alcance sobre nicho. Riesgo de incumbente aceptado conscientemente. |
| D2 | Postura de revisión | **Expansión selectiva** | Mantener alcance amplio + cherry-pick de mejoras |
| D3 | Canal de afiliados | **ACEPTADO → Fase 1** | Fuente más rentable en newsletters de IA 2026; monetiza sin volumen |
| D3 | Programa de referidos | DIFERIDO → TODOS.md | Motor de volumen; retomar al arrancar la lista |
| D3 | Secuencia de bienvenida | DIFERIDO → TODOS.md | Sube engagement; Brevo lo soporta |
| D3 | Sub-ángulo anti-incumbente | DIFERIDO → TODOS.md | Diferenciación vs "IA en Español" (50k subs) |
| Default | Captura SEO en blog | EN BASE (Fase 1) | Barato y obviamente bueno |
| Default | Doble opt-in (GDPR) | EN BASE (Fase 1) — **trabajo nuevo** | `api/subscribe.js` hoy hace POST directo a Brevo `/contacts`, SIN `doubleOptin`. Hay que añadirlo + plantilla DOI en Brevo. No es "ya listo". |

### Riesgos vivos (registrados, no bloqueantes)
- **Incumbente:** "IA en Español" (+50.500 subs) posee el hueco genérico. Sin un sub-ángulo (diferido) compites sin filo. Revisar cuando la lista arranque.
- **Demanda de pago no validada** en español/LATAM (mediana creador Substack ~$4k/año, hábito de pago débil). La Fase 2 (tienda) NO debe construirse hasta validar disposición a pagar.
- **Coste de oportunidad** vs. el pilot de pago del SaaS AgentesVA (aún sin validar).

---

## 14. Criterios de aceptación Fase 1 + decisiones provisionales (revisión adversarial 2026-06-21)

**Criterios técnicos/legales (objetivos, no negociables):**
- **Stack/ubicación:** la landing vive en la **app Astro** (`astro/src/pages/newsletter.astro`), reutilizando la content collection `astro/src/content/blog/` (los 7 posts). NO en el HTML estático suelto de `/blog/` (esa es salida buildeada).
- **Doble opt-in:** trabajo NUEVO en `api/subscribe.js` (añadir flag `doubleOptin` + plantilla DOI en Brevo). No está implementado hoy.
- **Consentimiento GDPR:** checkbox de consentimiento + enlace a `/legal/` (privacidad) en el formulario; enlace de baja en cada email.
- **Disclosure de afiliados:** aviso visible en la página de recursos + footer de la newsletter (deber legal FTC/UE).
- **Entregabilidad:** DKIM ya configurado en Cloudflare (per ARCHITECTURE.md); confirmar SPF + DMARC antes de envíos masivos.

**Decisiones provisionales (CONFIRMAR con Fernando antes de construir):**
- **Meta Fase 1:** 500 suscriptores en 90 días *(provisional)*.
- **Cadencia:** 1 envío/semana *(provisional)*.
- **Autor:** Fernando, con borradores asistidos por IA *(provisional)*.
- **Lead magnet v1:** pendiente — es el siguiente paso de diseño.

---

## GSTACK REVIEW REPORT

| Run | Status | Findings |
|-----|--------|----------|
| Landscape check (WebSearch) | DONE | Incumbente de 50k subs identificado; afiliados = canal más rentable y ausente del plan original (corregido) |
| 0A Premise challenge | DONE | 3 retos planteados; fundador eligió construir amplio conscientemente |
| 0C-bis Alternativas | DONE | A (validar) / B (nicho) / C (amplio) → elegido **C** |
| 0F Mode | DONE | Expansión selectiva |
| 0D Cherry-pick | DONE | Afiliados aceptado; 3 diferidos a TODOS.md |
| Revisión adversarial (subagente) | DONE | Score 6.5/10; arreglados: tabla monetización, "doble opt-in ya listo" (falso), stack/dir, GDPR + disclosure afiliados; metas provisionales fijadas (§14) |

**VERDICT:** Plan de negocio APROBADO para Fase 1 (newsletter amplia + lead magnet + afiliados), con riesgos de incumbente y demanda-de-pago registrados. Criterios técnicos/legales en §14. Fase 2 (tienda) bloqueada hasta validar disposición a pagar.

**UNRESOLVED DECISIONS:**
- Lead magnet concreto v1 (siguiente paso de diseño)
- Confirmar decisiones provisionales de §14 (meta 500/90d, cadencia semanal, autor)
