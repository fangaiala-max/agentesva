# Lote 1 de skill packs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 3 real, working Claude Agent Skills (+1 bundle) as inventory for the live `/recursos` store: 1 free lead-magnet + 2 paid "Dev IA" skills, sourced from a new `agentesva-skills` monorepo and surfaced as `recursos` fichas.

**Architecture:** Two repos. (1) NEW private monorepo `agentesva-skills` holds the source of each skill (`packs/<slug>/SKILL.md` + `referencia/` + `plantillas/` + `ejemplos/` + `README.md`) plus `scripts/package.sh` that zips each pack + a bundle for Gumroad. (2) The existing Astro site repo (`feat/skill-packs-lote1`) gets 4 JSON fichas in the existing `recursos` collection — no schema/component changes. Paid delivery = Gumroad (user wires manually); free delivery = gated → `/newsletter`, zip served from the site's `public/` and offered on `/gracias` (mirrors the existing 30-prompts flow).

**Tech Stack:** Markdown (Claude Agent Skills: YAML frontmatter `name`+`description` + progressive disclosure), Bash (`zip`), Astro content collections (Zod JSON), git/gh.

**Reference material (read before authoring):**
- Course lab (private, reuse code/content): `/Users/fernandoangulo/Sitios web/agentesva-curso-seguridad-llm` — `code/labkit/defenses.py` (3-layer model: diseño/guardrails/evals), `code/labkit/rag.py` (`InMemoryRAG`), `code/app_vulnerable/app.py` + `code/app_hardened/app.py`, `lessons/`, `gumroad/{listing.md,setup-browser-agent.md}`, `scripts/package.sh`.
- Site `recursos` schema: `src/content.config.ts:161` (enum `tipo`, `superRefine`: Pago⇒`gumroadUrl`+`precioDesde`; Gratis⇒`downloadUrl`|`gated`).
- Existing free-delivery flow: `src/pages/newsletter.astro` (gate, promises the reward) → `src/pages/gracias.astro` (`const PACK='/pack-30-prompts-ia.pdf'`, download card).
- Existing ficha template: `src/content/recursos/pack-30-prompts.json`.
- Agent Skill frontmatter (portable): `---\nname: <slug>\ndescription: <cuándo usarla>\n---` (see `~/.claude/skills/spec/SKILL.md` for shape; product skills use only `name`+`description`, no gstack-only fields).

**Voice & rigor:** `docs/brand-guidelines.md` (voz de marca) · `docs/blog-fact-checking-protocol.md` (Tier A/B/C/D — technical claims in the OWASP + RAG reference docs must be Tier A/B with a `FUENTES.md`).

---

## File Structure

**Repo A — `agentesva-skills`** (new, private; local path: create at `/Users/fernandoangulo/Sitios web/agentesva-skills`):
```
agentesva-skills/
  README.md                 # qué es + cómo instalar una skill en Claude
  LICENSE-USO.md            # licencia de uso (personal + comercial, no reventa)
  .gitignore                # dist/, __pycache__, .DS_Store
  scripts/package.sh        # zipea cada pack + bundle Dev IA a dist/
  packs/
    atencion-cliente-ia/    # FREE
      SKILL.md
      referencia/tono-y-voz.md
      plantillas/{email,whatsapp,resena-google,reclamacion}.md
      ejemplos/{pre-venta,reclamacion,resena-negativa}.md
      README.md
    auditor-seguridad-prompts/   # PAID
      SKILL.md
      referencia/owasp-llm-top10.md
      plantillas/informe-auditoria.md
      checklists/hardening.md
      ejemplos/auditoria-system-prompt-vulnerable.md
      FUENTES.md
      README.md
    arquitecto-rag/          # PAID
      SKILL.md
      referencia/decisiones-rag.md
      plantillas/{arquitectura-rag,eval-rag}.md
      ejemplos/rag-soporte-pyme.md
      FUENTES.md
      README.md
  gumroad/
    setup-gumroad.md
    listing-atencion-cliente.md
    listing-auditor-seguridad.md
    listing-arquitecto-rag.md
    listing-pack-dev-ia.md
  dist/                      # gitignored; generated zips
```

**Repo B — site** (`feat/skill-packs-lote1`):
```
public/skill-atencion-cliente-ia.zip          # copied from agentesva-skills/dist (Task 5)
src/content/recursos/skill-atencion-cliente.json   # FREE ficha — ships live (Task 6)
src/content/recursos/skill-auditor-seguridad.json  # PAID — staged, added post-Gumroad (Task 8)
src/content/recursos/skill-arquitecto-rag.json     # PAID — staged (Task 8)
src/content/recursos/pack-dev-ia.json              # PAID bundle — staged (Task 8)
src/pages/gracias.astro                            # add 2nd download card (Task 6)
src/pages/newsletter.astro                         # reward copy mentions the skill (Task 6)
```

---

## Task 1: Scaffold the `agentesva-skills` monorepo

**Files (all in the NEW repo `/Users/fernandoangulo/Sitios web/agentesva-skills`):**
- Create: `README.md`, `LICENSE-USO.md`, `.gitignore`, `scripts/package.sh`, `packs/.gitkeep`

- [ ] **Step 1: Create the repo and directory skeleton**

```bash
mkdir -p "/Users/fernandoangulo/Sitios web/agentesva-skills"
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git init -q
mkdir -p packs scripts gumroad
touch packs/.gitkeep
```

- [ ] **Step 2: Write `.gitignore`**

```gitignore
dist/
**/__pycache__/
*.pyc
.DS_Store
```

- [ ] **Step 3: Write `scripts/package.sh`** (exact content)

```bash
#!/usr/bin/env bash
set -euo pipefail
# Empaqueta cada skill pack para Gumroad. Los zips van a dist/ (gitignored).
# Ejecutar desde la raíz del repo:  chmod +x scripts/package.sh && ./scripts/package.sh
cd "$(dirname "$0")/.."
mkdir -p dist
rm -f dist/*.zip

# Un zip por pack: el zip contiene una carpeta con el slug (packs/<slug> → <slug>/…).
for dir in packs/*/; do
  slug="$(basename "$dir")"
  [ "$slug" = "*" ] && continue
  ( cd packs && zip -r "../dist/${slug}.zip" "$slug" -x "*/__pycache__/*" "*.pyc" ".DS_Store" >/dev/null )
  echo "Pack:   dist/${slug}.zip"
done

# Bundle "Pack Dev IA" = auditor + arquitecto (dos carpetas de skill en un zip).
if [ -d packs/auditor-seguridad-prompts ] && [ -d packs/arquitecto-rag ]; then
  ( cd packs && zip -r "../dist/pack-dev-ia.zip" auditor-seguridad-prompts arquitecto-rag \
      -x "*/__pycache__/*" "*.pyc" ".DS_Store" >/dev/null )
  echo "Bundle: dist/pack-dev-ia.zip"
fi

echo "Listo. Contenido de dist/:"
ls -1 dist/
```

- [ ] **Step 4: Write `README.md`** — sections (author concise ES prose, ~150–250 words):
  1. Título + una frase: "Skills de IA en español, listas para instalar en Claude, de AgentesVA."
  2. **Qué es una skill** (2–3 frases): un `SKILL.md` con instrucciones + recursos que Claude carga bajo demanda (divulgación progresiva).
  3. **Cómo instalar una skill** (pasos): descomprime el zip; coloca la carpeta `<slug>/` en tu directorio de skills de Claude (p. ej. `~/.claude/skills/`); reinicia/activa; invócala por su nombre o describe la tarea.
  4. **Packs incluidos** (lista): `atencion-cliente-ia` (gratis), `auditor-seguridad-prompts`, `arquitecto-rag`.
  5. Licencia: enlace a `LICENSE-USO.md`. Marca: "AgentesVA · agentesva.com".

- [ ] **Step 5: Write `LICENSE-USO.md`** — licencia de uso propietaria, breve (ES):
  - Permite uso personal y comercial por el comprador (usarla en su negocio/proyectos).
  - Prohíbe reventa, redistribución del archivo, o publicarla como propia.
  - Sin garantías; la skill es una plantilla de trabajo que el usuario adapta.
  - "© 2026 AgentesVA. Todos los derechos reservados."

- [ ] **Step 6: Verify `package.sh` runs with no packs yet**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
chmod +x scripts/package.sh && ./scripts/package.sh
```
Expected: prints "Listo. Contenido de dist/:" and an empty listing (no packs → no zips, no error). If `zip` is missing, `brew install zip`.

- [ ] **Step 7: Commit + create private GitHub repo + push**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git add -A && git commit -q -m "chore: scaffold agentesva-skills monorepo (packaging + docs)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
gh repo create fangaiala-max/agentesva-skills --private --source=. --remote=origin --push
git rev-parse --short HEAD
```
Expected: repo created, branch pushed. (If `gh repo create` prompts, the repo may exist — then `git remote add origin` + `git push -u origin HEAD`.)

---

## Task 2: Pack 1 — `atencion-cliente-ia` (FREE)

**Files (in `agentesva-skills/packs/atencion-cliente-ia/`):**
- Create: `SKILL.md`, `referencia/tono-y-voz.md`, `plantillas/{email,whatsapp,resena-google,reclamacion}.md`, `ejemplos/{pre-venta,reclamacion,resena-negativa}.md`, `README.md`

- [ ] **Step 1: Write `SKILL.md`** — frontmatter EXACT, body per spec

Frontmatter (verbatim):
```markdown
---
name: atencion-cliente-ia
description: Redacta respuestas de atención al cliente on-brand (email, WhatsApp, reseñas de Google, reclamaciones) en español, a partir del mensaje del cliente y una breve guía de tono del negocio. Úsala cuando haya que contestar a un cliente y quieras hacerlo rápido, con la voz de tu marca y sin sonar a robot.
---
```
Body (author ES, ~250–400 words, progressive disclosure):
- **Cuándo usarla** (1 frase).
- **Qué necesito de ti** (la skill pide, si no están en el mensaje): sector/negocio, tono deseado (cercano/formal/…), canal (email/WhatsApp/reseña/reclamación), datos clave (política de devoluciones, plazos…), y el mensaje del cliente.
- **Cómo trabajo** (pasos): 1) detecto canal e intención; 2) cargo la plantilla del canal desde `plantillas/`; 3) aplico la guía de tono (`referencia/tono-y-voz.md`); 4) entrego **2 variantes** (una más breve, una más completa) + una nota de 1 línea de por qué; 5) marco entre `[corchetes]` lo que el usuario debe personalizar.
- **Reglas**: nunca inventar datos (precios, plazos) — si faltan, dejar `[dato]`; no prometer lo que la política no permite; español ES por defecto, ofrecer variante LATAM neutro si se pide.
- **Recursos** (enlaces a los ficheros): "Consulta `referencia/tono-y-voz.md` para fijar el registro y `plantillas/` para la estructura de cada canal. Ejemplos trabajados en `ejemplos/`."

- [ ] **Step 2: Write `referencia/tono-y-voz.md`** — guía práctica ES (~300 words): cómo describir el tono en 1 frase (ejes: cercanía, formalidad, energía), 4–5 registros de ejemplo con muestra de saludo/despedida, cómo mantener consistencia de marca, errores a evitar (sonar a plantilla, exceso de disculpas, tecnicismos).

- [ ] **Step 3: Write the 4 `plantillas/`** (each a short ES markdown template with `[marcadores]` to fill):
  - `email.md`: estructura asunto + saludo + reconocimiento + respuesta/solución + siguiente paso + despedida + firma.
  - `whatsapp.md`: mensaje corto, tono cercano, 1 emoji máximo opcional, CTA claro, sin párrafos largos.
  - `resena-google.md`: respuesta pública a reseña (agradecer + personalizar + breve + invitar a volver / llevar a privado si es queja).
  - `reclamacion.md`: acuse + empatía + qué haremos + plazo + compensación si aplica + canal de seguimiento.
  Each template ends with a "Variante corta / Variante completa" note.

- [ ] **Step 4: Write the 3 `ejemplos/`** (each = Entrada → Salida trabajada, ES):
  - `pre-venta.md`: cliente pregunta disponibilidad/precio de un servicio → 2 variantes de respuesta email.
  - `reclamacion.md`: pedido llega tarde/dañado → respuesta de reclamación con plazo y solución.
  - `resena-negativa.md`: reseña de 2★ en Google → respuesta pública que desescala y lleva a privado.
  Each shows the input (contexto + mensaje) then the skill's output (2 variantes + nota).

- [ ] **Step 5: Write `README.md`** (pack-level): qué hace la skill, qué incluye, cómo instalarla (ver README raíz), un ejemplo de invocación ("Ayúdame a responder esta reseña: …").

- [ ] **Step 6: Verify the skill works (dry run)**

Load `SKILL.md` mentally/in a scratch Claude session and run the `ejemplos/pre-venta.md` **input** through the skill's documented process. Confirm the produced answer: (a) uses the email plantilla structure, (b) applies a tone, (c) returns 2 variants + a 1-line rationale, (d) leaves `[marcadores]` for unknown data (no invented prices). If any of a–d fails, fix `SKILL.md`/plantillas until it holds. Record the run in the task notes.

- [ ] **Step 7: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git add packs/atencion-cliente-ia
git commit -q -m "feat(atencion-cliente-ia): skill gratis de respuestas al cliente

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Pack 2 — `auditor-seguridad-prompts` (PAID)

**Files (in `agentesva-skills/packs/auditor-seguridad-prompts/`):**
- Create: `SKILL.md`, `referencia/owasp-llm-top10.md`, `plantillas/informe-auditoria.md`, `checklists/hardening.md`, `ejemplos/auditoria-system-prompt-vulnerable.md`, `FUENTES.md`, `README.md`
- Read (reuse): course `code/labkit/defenses.py`, `code/app_vulnerable/app.py`, `code/app_hardened/app.py`

- [ ] **Step 1: Verify the OWASP source before authoring (Tier A)**

Confirm the current OWASP GenAI/LLM Top 10 IDs and titles from the OWASP GenAI Security Project (WebSearch/WebFetch `genai.owasp.org` "OWASP Top 10 for LLM Applications"). Capture the canonical list (LLM01…LLM10 with the current year's titles) — this grounds `referencia/owasp-llm-top10.md` and `FUENTES.md`. Do not author the reference from memory.

- [ ] **Step 2: Write `referencia/owasp-llm-top10.md`** — the 10 riesgos con: ID, título ES, qué es (2–3 frases), **qué comprobar** (viñetas de auditoría), y señal de ejemplo. Foco extendido en LLM01 (inyección directa/indirecta), LLM02 (salida insegura), LLM06 (fuga de datos sensibles), LLM08 (agencia excesiva). Cada riesgo cita su fuente OWASP en `FUENTES.md`. Aterriza LLM01/guardrails en el modelo de 3 capas del curso (diseño → guardrails → evals), parafraseando `defenses.py` (spotlighting/`wrap_prompt`, `sanitize_context`, `is_suspicious_input`, `output_guard`).

- [ ] **Step 3: Write `plantillas/informe-auditoria.md`** — plantilla de informe: cabecera (objetivo auditado, fecha, alcance), **tabla de hallazgos** (`ID OWASP | Severidad [Crítica/Alta/Media/Baja] | Evidencia | Corrección`), resumen ejecutivo, y "próximos pasos / hardening". Marcadores `[…]`.

- [ ] **Step 4: Write `checklists/hardening.md`** — checklist accionable de endurecimiento en 3 capas (diseño/guardrails/evals), parafraseando el curso: separar datos de instrucciones (spotlighting), sanear contexto RAG, detectar override directo, guard de salida + canary, y evals de regresión. Cada ítem = una casilla `- [ ]` con una frase de por qué.

- [ ] **Step 5: Write `SKILL.md`**

Frontmatter (verbatim):
```markdown
---
name: auditor-seguridad-prompts
description: Audita un system prompt, una plantilla de prompt o una mini-app de LLM en busca de los riesgos del OWASP LLM Top 10 (inyección de prompts, salida insegura, fuga de datos, agencia excesiva…) y emite un informe con severidad, evidencia y corrección. Úsala antes de poner en producción un asistente o agente de IA.
---
```
Body (ES, ~300–450 words): cuándo usarla; qué necesita (el system prompt / la descripción de la app / el flujo de datos y herramientas); cómo trabaja (1) mapea la superficie de ataque, 2) recorre el OWASP LLM Top 10 con `referencia/owasp-llm-top10.md`, 3) rellena `plantillas/informe-auditoria.md` con hallazgos priorizados, 4) propone hardening con `checklists/hardening.md`); reglas (no ejecutar exploits reales, señalar supuestos, severidad justificada); cierre con puntero al curso de seguridad de AgentesVA para profundizar. Enlaza los recursos.

- [ ] **Step 6: Write `ejemplos/auditoria-system-prompt-vulnerable.md`** — caso trabajado real: toma como entrada el system prompt del `app_vulnerable` del curso (cópialo/parafraséalo desde `code/app_vulnerable/app.py`), pásalo por la skill, y muestra el **informe** resultante: debe detectar al menos LLM01 (inyección: el asistente vulnerable obedece "ignora tus instrucciones" y filtra el secreto/canary) y LLM06 (fuga del secreto), con severidad Crítica/Alta, evidencia (el ataque concreto) y corrección (las capas de `defenses.py`). El informe debe ser coherente con que `app_hardened` corrige esos hallazgos.

- [ ] **Step 7: Write `FUENTES.md`** — fuentes Tier A/B: OWASP GenAI Security Project (URL + año de la lista), y referencia interna al curso de seguridad como base del modelo de 3 capas. Formato: cada afirmación técnica → su fuente.

- [ ] **Step 8: Write `README.md`** (pack-level): qué hace, qué incluye, cómo instalar, ejemplo de invocación ("Audita este system prompt: …").

- [ ] **Step 9: Verify the skill works (dry run)**

Run the `ejemplos/` input (the vulnerable system prompt) through the skill's process. Confirm the report: (a) flags LLM01 and LLM06 with justified severity, (b) cites concrete evidence (the injection/leak), (c) proposes the 3-layer fixes, (d) maps each finding to an OWASP ID from the reference. Cross-check the findings are consistent with what `app_hardened/app.py` + `defenses.py` actually mitigate. Fix until it holds.

- [ ] **Step 10: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git add packs/auditor-seguridad-prompts
git commit -q -m "feat(auditor-seguridad-prompts): skill de auditoría OWASP LLM Top 10

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Pack 3 — `arquitecto-rag` (PAID)

**Files (in `agentesva-skills/packs/arquitecto-rag/`):**
- Create: `SKILL.md`, `referencia/decisiones-rag.md`, `plantillas/{arquitectura-rag,eval-rag}.md`, `ejemplos/rag-soporte-pyme.md`, `FUENTES.md`, `README.md`
- Read (reuse): course `code/labkit/rag.py` (`InMemoryRAG`, retrieval por solapamiento), `code/tests/test_rag.py`.

- [ ] **Step 1: Verify RAG sources before authoring (Tier A/B)**

Confirm the technical claims you'll make (chunking sizes, embedding-model tradeoffs, hybrid/BM25+dense, reranking, eval metrics like recall@k / faithfulness) against reputable sources (WebSearch/WebFetch — e.g. vendor docs for embeddings/rerankers, RAG evaluation references). Capture URLs for `FUENTES.md`. Don't state specific numbers/model names from memory without a source.

- [ ] **Step 2: Write `referencia/decisiones-rag.md`** — guía de decisión ES: cuándo RAG (vs fine-tuning/contexto largo); **chunking** (tamaños, solapamiento, por estructura); **embeddings** (criterios de elección, idioma español, coste/latencia); **almacén** (in-memory vs vectorial, cuándo escalar); **recuperación** (top-k, búsqueda híbrida, reranking); **evaluación** (métricas y cómo montar un set); **modos de fallo** (recuperación pobre, alucinación, inyección indirecta vía documentos — enlaza al auditor). Aterriza el ejemplo mínimo en `rag.py` (recuperación por solapamiento como baseline didáctico) y explica cómo escalar desde ahí. Cita fuentes.

- [ ] **Step 3: Write the 2 `plantillas/`:**
  - `arquitectura-rag.md`: plantilla de documento de arquitectura (requisitos, corpus, pipeline por etapas, decisiones justificadas, diagrama en texto, riesgos). Marcadores `[…]`.
  - `eval-rag.md`: plantilla de plan de evals (preguntas de prueba, métricas, umbrales, cómo iterar).

- [ ] **Step 4: Write `SKILL.md`**

Frontmatter (verbatim):
```markdown
---
name: arquitecto-rag
description: Diseña la arquitectura de un sistema RAG (Retrieval-Augmented Generation) en español a partir de tus requisitos: estrategia de chunking, elección de embeddings, almacén vectorial, recuperación y reranking, plan de evaluación y modos de fallo. Úsala cuando vayas a construir una base de conocimiento o asistente que responda sobre tus propios documentos.
---
```
Body (ES, ~300–450 words): cuándo usarla; qué necesita (tipo/tamaño de corpus, idioma, restricciones de latencia/coste/privacidad, tipo de preguntas); cómo trabaja (1) recoge requisitos, 2) decide cada etapa con `referencia/decisiones-rag.md` justificando el porqué, 3) rellena `plantillas/arquitectura-rag.md`, 4) define evals con `plantillas/eval-rag.md`); reglas (no sobredimensionar — empezar simple, medir antes de optimizar; señalar supuestos); enlaza recursos.

- [ ] **Step 5: Write `ejemplos/rag-soporte-pyme.md`** — caso trabajado: requisitos de una PyME que quiere un asistente sobre su base de conocimiento de soporte (FAQs + manuales, ~cientos de docs, español, coste bajo). La skill produce un documento de arquitectura completo (chunking elegido + por qué, embeddings, almacén, top-k+reranking, evals, modos de fallo) — internamente coherente y trazable a la guía.

- [ ] **Step 6: Write `FUENTES.md`** — Tier A/B: fuentes de las afirmaciones técnicas (embeddings, reranking, métricas de eval) con URLs; referencia al `rag.py` del curso como baseline.

- [ ] **Step 7: Write `README.md`** (pack-level): qué hace, incluye, instalar, ejemplo de invocación.

- [ ] **Step 8: Verify the skill works (dry run)**

Run the `ejemplos/` requirements through the skill. Confirm the output: (a) fills the arquitectura template with a decision + justification per stage, (b) the eval plan has concrete metrics + thresholds, (c) names failure modes incl. indirect injection (links to the auditor skill), (d) every technical claim traces to `FUENTES.md`. Fix until it holds.

- [ ] **Step 9: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git add packs/arquitecto-rag
git commit -q -m "feat(arquitecto-rag): skill de diseño de arquitectura RAG

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Gumroad assets + generate zips + copy free zip to site

**Files:** `agentesva-skills/gumroad/{setup-gumroad.md,listing-atencion-cliente.md,listing-auditor-seguridad.md,listing-arquitecto-rag.md,listing-pack-dev-ia.md}`; generated `dist/*.zip`; copied `../05-agentesva/public/skill-atencion-cliente-ia.zip`
- Read (mirror): course `gumroad/listing.md` + `gumroad/setup-browser-agent.md`.

- [ ] **Step 1: Write the 4 `listing-*.md`** — cada uno con el copy de Gumroad (mirror the course `listing.md` structure): título, precio (`atencion-cliente` = 0/gratis o "name your price"; `auditor` = 4,99 €; `arquitecto` = 4,99 €; `pack-dev-ia` = 7,99 €), descripción larga (qué es, qué incluye, para quién, cómo se instala, qué NO es), resumen corto, y para el bundle: "incluye las 2 skills, ahorro ~2 €". Voz de marca. (El de `atencion-cliente` sirve de referencia aunque la entrega gratis sea por newsletter, por si se publica también en Gumroad como gratis en el futuro.)

- [ ] **Step 2: Write `gumroad/setup-gumroad.md`** — pasos para un agente de navegador que crea los 3 productos de pago (auditor, arquitecto, bundle), mirror `setup-browser-agent.md` del curso. DEBE incluir paradas explícitas **⛔ HUMANO** en: login/2FA, diálogos de archivo nativos del SO (subir el zip), datos de identidad/fiscales/bancarios (payout), y la **publicación final**. El agente sube el zip correcto por producto (`dist/<slug>.zip`, bundle = `dist/pack-dev-ia.zip`), pega el copy del `listing-*.md`, fija el precio, y **se detiene** antes de publicar. Al final, el usuario copia las 3 URLs (`https://fangaiala.gumroad.com/l/<slug>`) para las fichas.

- [ ] **Step 3: Generate the zips**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
./scripts/package.sh
```
Expected: `dist/atencion-cliente-ia.zip`, `dist/auditor-seguridad-prompts.zip`, `dist/arquitecto-rag.zip`, `dist/pack-dev-ia.zip`. Sanity-check the bundle contains both skill folders: `unzip -l dist/pack-dev-ia.zip | grep SKILL.md` → 2 lines.

- [ ] **Step 4: Copy the free zip into the site's public/**

```bash
cp "/Users/fernandoangulo/Sitios web/agentesva-skills/dist/atencion-cliente-ia.zip" \
   "/Users/fernandoangulo/Sitios web/05-agentesva/public/skill-atencion-cliente-ia.zip"
ls -la "/Users/fernandoangulo/Sitios web/05-agentesva/public/skill-atencion-cliente-ia.zip"
```

- [ ] **Step 5: Commit gumroad assets (monorepo)**

```bash
cd "/Users/fernandoangulo/Sitios web/agentesva-skills"
git add gumroad
git commit -q -m "docs(gumroad): copy de listing (4) + setup de navegador con paradas HUMANO

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
```

---

## Task 6: Site — free ficha live + newsletter delivery wiring

**Files (site repo, branch `feat/skill-packs-lote1`):**
- Create: `src/content/recursos/skill-atencion-cliente.json`
- Modify: `src/pages/gracias.astro`, `src/pages/newsletter.astro`
- Binary already added in Task 5: `public/skill-atencion-cliente-ia.zip`

- [ ] **Step 1: Write `src/content/recursos/skill-atencion-cliente.json`** (verbatim; polish `long`/`tagline`/`faq` ES prose to brand voice, keep structure/fields):

```json
{
  "titulo": "Skill: Asistente de atención al cliente con IA",
  "tipo": "skill",
  "categoria": "Atención al cliente",
  "desc": "Skill de Claude que redacta respuestas on-brand para email, WhatsApp y reseñas, en el tono de tu negocio.",
  "long": "Una Claude Skill lista para instalar que redacta respuestas de atención al cliente en tu voz: email, WhatsApp, reseñas de Google y reclamaciones. Le das el mensaje del cliente y una breve guía de tono, y te devuelve dos variantes listas para enviar (una breve, una completa) marcando entre corchetes lo que debes personalizar. Incluye plantillas por canal, una guía de tono y ejemplos trabajados. No inventa datos: si falta un precio o un plazo, lo deja señalado.",
  "tagline": "Responde a tus clientes rápido y con tu propia voz, sin sonar a robot.",
  "ideal": "PyMEs y autónomos que responden a clientes cada día y quieren hacerlo rápido y con su marca",
  "formato": "Claude Skill · SKILL.md + plantillas + ejemplos",
  "precio": "Gratis",
  "gated": true,
  "color": "#4ec98a",
  "orden": 15,
  "destacado": false,
  "actualizado": "2026-07-04",
  "faq": [
    { "q": "¿Qué es una Claude Skill?", "a": "Una carpeta con un archivo SKILL.md de instrucciones y recursos que Claude carga cuando la necesita. La instalas una vez y la invocas cuando quieras responder a un cliente." },
    { "q": "¿Cómo la instalo?", "a": "Descomprime el zip y coloca la carpeta en tu directorio de skills de Claude. Dentro del pack tienes un README con los pasos exactos." },
    { "q": "¿Cómo la consigo?", "a": "Es gratis: suscríbete a la newsletter y te la enviamos junto con el pack de 30 prompts. Cero coste." }
  ]
}
```

- [ ] **Step 2: Verify the free ficha builds (superRefine satisfied)**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
npm run build 2>&1 | tail -5
```
Expected: build green. `precio:"Gratis"` + `gated:true` (no `downloadUrl`) satisfies the `recursos` superRefine. Ficha generates at `/recurso/skill-atencion-cliente`.

- [ ] **Step 3: Add a 2nd download card to `src/pages/gracias.astro`**

In the frontmatter, after `const PACK = '/pack-30-prompts-ia.pdf';` add:
```astro
const SKILL = '/skill-atencion-cliente-ia.zip';
```
After the existing `<div class="animated-border">…</div>` gift card block (the one with the PDF download), insert a second card:
```astro
    <div class="animated-border" style="border-radius: 9px; padding: 1px; margin: 20px auto 0; max-width: 460px;">
      <div style="background: var(--panel); border-radius: 8px; padding: 28px 26px;">
        <p style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0;">Bonus</p>
        <h2 style="font-family: var(--sans); font-weight: 700; font-size: 21px; line-height: 1.2; color: #fff; margin: 10px 0 0;">Skill: Asistente de atención al cliente</h2>
        <p style="font-size: 14.5px; line-height: 1.55; color: var(--fg-3); margin: 10px 0 22px;">Una Claude Skill que redacta respuestas on-brand para email, WhatsApp y reseñas. Descomprime y sigue el README para instalarla.</p>
        <a href={SKILL} download class="lift shimmer" style="display: inline-block; background: var(--accent); color: var(--bg); padding: 14px 28px; border-radius: 2px; font-family: var(--sans); font-weight: 600; font-size: 15px; text-decoration: none;">Descargar la Skill (.zip) ↓</a>
      </div>
    </div>
```

- [ ] **Step 4: Update the reward copy in `src/pages/newsletter.astro`**

Change the reward line (`src/pages/newsletter.astro:30`) from promising only the pack to include the skill:
```astro
        <p style="font-size: 15px; line-height: 1.55; color: var(--fg-4); margin: 16px auto 0; max-width: 30em;">Suscríbete y recibe gratis el <strong style="color: var(--fg-2);">Pack: 30 prompts de IA para tu negocio</strong> + la <strong style="color: var(--fg-2);">Skill de atención al cliente con IA</strong>.</p>
```

- [ ] **Step 5: Rebuild + verify delivery wiring**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
npm run build 2>&1 | tail -3
grep -o "skill-atencion-cliente-ia.zip" dist/client/gracias/index.html | head -1
grep -o "Skill de atención al cliente" dist/client/newsletter/index.html | head -1
```
Expected: build green; both greps return a match (download link on /gracias, promise on /newsletter). The zip exists at `public/skill-atencion-cliente-ia.zip` (Task 5).

- [ ] **Step 6: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add src/content/recursos/skill-atencion-cliente.json src/pages/gracias.astro src/pages/newsletter.astro public/skill-atencion-cliente-ia.zip
git commit -q -m "feat(recursos): skill gratis de atención al cliente + entrega por newsletter

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Holistic review + PR (free ficha only)

- [ ] **Step 1: Holistic review** — dispatch a review of the site diff (`main..feat/skill-packs-lote1`, excluding `docs/superpowers/*`) + the monorepo: SKILL.md files load and their examples hold; free ficha end-to-end (listing → `/recurso/skill-atencion-cliente` → CTA `/newsletter` → subscribe → `/gracias` serves the zip); `superRefine` satisfied; JSON-LD `Product` offer 0 €; searchable `tipo:Recurso`; no secrets; only expected files changed. Verify the zip is a valid archive containing a working `SKILL.md`.

- [ ] **Step 2: Build + open PR**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
npm run build 2>&1 | tail -3
git push -u origin feat/skill-packs-lote1
gh pr create --title "feat(recursos): skill gratis de atención al cliente (lote 1)" --body "Primer producto del lote 1 de skill packs: la skill GRATIS de atención al cliente, entregada por la newsletter (imán de leads). Las 2 skills de pago + bundle se añaden en un commit de seguimiento cuando existan las URLs de Gumroad. Fuente en el monorepo privado agentesva-skills.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 3: Merge only on user confirmation** — this is a production deploy. Present the PR + verification; do NOT merge until the user says so. After merge, verify `/recurso/skill-atencion-cliente` live + the `/gracias` download.

---

## Task 8: (DEFERRED — after user wires Gumroad) Add the 3 paid fichas

**Precondition:** the user has created the 3 Gumroad products and provided the real URLs. Until then, these fichas CANNOT build (the `recursos` superRefine requires `gumroadUrl` for `Pago`), which is the intended publish-gate.

**Files (site repo):** Create `src/content/recursos/{skill-auditor-seguridad,skill-arquitecto-rag,pack-dev-ia}.json`

- [ ] **Step 1: Write the 3 paid fichas** (replace `REEMPLAZAR_URL_GUMROAD` with the real URLs the user provides). Polish `long`/`tagline`/`faq` to brand voice.

`skill-auditor-seguridad.json`:
```json
{
  "titulo": "Skill: Auditor de seguridad de prompts (OWASP LLM Top 10)",
  "tipo": "skill",
  "categoria": "Desarrollo con IA",
  "desc": "Skill de Claude que audita tu system prompt o app de IA contra el OWASP LLM Top 10 y emite un informe.",
  "long": "Una Claude Skill que revisa un system prompt, una plantilla o una mini-app de LLM en busca de los riesgos del OWASP LLM Top 10 —inyección de prompts, salida insegura, fuga de datos, agencia excesiva— y emite un informe con severidad, evidencia y corrección para cada hallazgo. Incluye la referencia OWASP en español, una plantilla de informe, un checklist de hardening en 3 capas y un ejemplo trabajado. Basada en el laboratorio real del curso de seguridad de AgentesVA.",
  "tagline": "Audita tu asistente de IA antes de ponerlo en producción.",
  "ideal": "Desarrolladores y equipos que llevan un asistente o agente de IA a producción",
  "formato": "Claude Skill · SKILL.md + referencia OWASP + plantilla de informe + ejemplo",
  "precio": "Pago",
  "precioDesde": "4,99 €",
  "gumroadUrl": "REEMPLAZAR_URL_GUMROAD",
  "color": "#5b7cff",
  "orden": 20,
  "destacado": false,
  "actualizado": "2026-07-04",
  "faq": [
    { "q": "¿Qué cubre la auditoría?", "a": "El OWASP LLM Top 10, con foco en inyección de prompts (LLM01), salida insegura (LLM02), fuga de datos (LLM06) y agencia excesiva (LLM08)." },
    { "q": "¿Necesito saber programar?", "a": "Ayuda tener contexto técnico. La skill audita el diseño del prompt y el flujo; las correcciones incluyen ejemplos de las 3 capas de defensa." },
    { "q": "¿Se relaciona con el curso?", "a": "Sí: comparte el modelo de 3 capas del curso de Seguridad de LLMs. La skill es la herramienta; el curso es la formación completa." }
  ]
}
```

`skill-arquitecto-rag.json`:
```json
{
  "titulo": "Skill: Arquitecto de RAG en español",
  "tipo": "skill",
  "categoria": "Desarrollo con IA",
  "desc": "Skill de Claude que diseña tu pipeline RAG: chunking, embeddings, recuperación, reranking y evals.",
  "long": "Una Claude Skill que, a partir de tus requisitos, diseña la arquitectura de un sistema RAG: estrategia de chunking, elección de embeddings, almacén vectorial, recuperación con reranking, plan de evaluación y modos de fallo. Entrega un documento de arquitectura justificado y un plan de evals. Incluye una guía de decisión en español, plantillas y un ejemplo trabajado para una base de conocimiento de soporte de PyME.",
  "tagline": "Diseña tu base de conocimiento con IA sin sobredimensionar.",
  "ideal": "Desarrolladores que van a construir un asistente sobre sus propios documentos",
  "formato": "Claude Skill · SKILL.md + guía de decisión + plantillas + ejemplo",
  "precio": "Pago",
  "precioDesde": "4,99 €",
  "gumroadUrl": "REEMPLAZAR_URL_GUMROAD",
  "color": "#8aa3ff",
  "orden": 25,
  "destacado": false,
  "actualizado": "2026-07-04",
  "faq": [
    { "q": "¿Qué me entrega?", "a": "Un documento de arquitectura con cada decisión justificada (chunking, embeddings, almacén, recuperación, reranking) y un plan de evals con métricas y umbrales." },
    { "q": "¿Sirve para español?", "a": "Sí, la guía de decisión considera el idioma español en la elección de embeddings y evaluación." }
  ]
}
```

`pack-dev-ia.json`:
```json
{
  "titulo": "Pack Dev IA: Auditor de seguridad + Arquitecto de RAG",
  "tipo": "skill",
  "categoria": "Desarrollo con IA",
  "desc": "Las dos skills de desarrollo con IA juntas: auditoría de seguridad OWASP + diseño de RAG. Ahorra ~2 €.",
  "long": "El pack para construir asistentes de IA sólidos: incluye la skill de auditoría de seguridad (OWASP LLM Top 10) y la de arquitectura de RAG, en un solo paquete. Diseña tu base de conocimiento con la primera y audítala antes de producción con la segunda. Ambas skills listas para instalar en Claude, con sus referencias, plantillas y ejemplos.",
  "tagline": "Diseña y asegura tu app de IA con las dos skills, por menos.",
  "ideal": "Desarrolladores y equipos que construyen asistentes o agentes de IA sobre sus datos",
  "formato": "2 Claude Skills · auditor de seguridad + arquitecto de RAG",
  "precio": "Pago",
  "precioDesde": "7,99 €",
  "gumroadUrl": "REEMPLAZAR_URL_GUMROAD",
  "color": "#6f8cff",
  "orden": 18,
  "destacado": true,
  "actualizado": "2026-07-04",
  "faq": [
    { "q": "¿Qué incluye el pack?", "a": "Las dos skills de pago: Auditor de seguridad de prompts (OWASP LLM Top 10) y Arquitecto de RAG en español, con todos sus recursos." },
    { "q": "¿Cuánto ahorro?", "a": "Compradas por separado son 9,98 €; en el pack, 7,99 €." }
  ]
}
```

- [ ] **Step 2: Build + verify the paid fichas**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
npm run build 2>&1 | tail -5
```
Expected: build green (superRefine satisfied now that real `gumroadUrl` present). Fichas at `/recurso/skill-auditor-seguridad`, `/recurso/skill-arquitecto-rag`, `/recurso/pack-dev-ia`. Verify each `Product` JSON-LD `offers` price (4.99 / 4.99 / 7.99) and the CTA → the real Gumroad URL. Verify `/ir/pack-dev-ia` (and the other two) resolve to Gumroad (recursos branch, no slug collision).

- [ ] **Step 3: Commit + PR (or extend the branch) → merge on user confirmation**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add src/content/recursos/skill-auditor-seguridad.json src/content/recursos/skill-arquitecto-rag.json src/content/recursos/pack-dev-ia.json
git commit -q -m "feat(recursos): 3 fichas de pago del lote Dev IA (URLs Gumroad reales)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
```

---

## Self-Review (completed against spec)

**Spec coverage:** §A the 3 skills + bundle → Tasks 2/3/4 + bundle packaging in Task 5. §B anatomy → each pack task authors SKILL.md+referencia+plantillas+ejemplos+README + a verify step. §C monorepo+package.sh → Task 1. §D delivery: Gumroad → Task 5 (listings + setup + zips); free/newsletter → Task 6 (ficha gated + gracias/newsletter wiring). §E 4 fichas → Task 6 (free, live) + Task 8 (3 paid, staged). §F sequence → Tasks 1→8 in order. Acceptance criteria: skills tested (verify steps), Tier A/B (Task 3 Step 1, Task 4 Step 1 + FUENTES.md), package.sh zips (Task 5), free ficha live + delivery (Tasks 6/7), build green + JSON-LD + search (Tasks 6/7), paid staged behind superRefine (Task 8 precondition).

**Placeholder scan:** No TBD/TODO. The only deliberate placeholder is `REEMPLAZAR_URL_GUMROAD` in Task 8, which is the single value the user must supply and is gated by the superRefine — documented as such. Content docs (referencia/*) are specified by section + source + quality bar (appropriate for authoring), not left vague.

**Consistency:** Slugs are stable across tasks — pack dirs `atencion-cliente-ia`/`auditor-seguridad-prompts`/`arquitecto-rag`; ficha filenames (=recurso slugs) `skill-atencion-cliente`/`skill-auditor-seguridad`/`skill-arquitecto-rag`/`pack-dev-ia` (distinct from any tool/curso slug — no `/ir` collision); free zip `skill-atencion-cliente-ia.zip` consistent between Task 5 copy, Task 6 gracias.astro `SKILL` const, and `public/`. Prices consistent: 4,99/4,99/7,99 in fichas ↔ Gumroad listings. `tipo:"skill"` on all four.
