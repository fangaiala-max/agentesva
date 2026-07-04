# Diseño — Lote 1 de skill packs para la tienda `/recursos`

**Fecha:** 2026-07-04 · **Ramas:** `feat/skill-packs-lote1` (sitio) + repo nuevo `agentesva-skills` (fuente)
**Fuentes de verdad:** [business brief](./2026-06-21-agentesva-directory-business-brief.md) (§ escalera de valor, Authority.md, tiers 4,99/14,99/29,99 €) · [spec /recursos](./2026-07-03-recursos-tienda-design.md) (colección + fichas + entrega) · `DESIGN.md` (Futurista) · `docs/brand-guidelines.md` (voz) · `docs/blog-fact-checking-protocol.md` (Tier A/B/C/D)

## Resumen

Construir el **primer lote de inventario real** para la tienda `/recursos` (ya en vivo): **3 Claude Agent Skills funcionales** (no PDFs) + **1 bundle**, en español, construidos de verdad (SKILL.md operativo + ficheros de recursos + ejemplo trabajado), reutilizando el código real del laboratorio del curso de seguridad. Un imán de leads **gratis** de público amplio + una línea **"Dev IA" de pago** que aprovecha la demanda ya probada por el curso (19 €). Los fuentes viven en un **monorepo privado `agentesva-skills`**; la entrega de pago es por **Gumroad** (como el curso) y la gratis por **puerta a newsletter** (como el pack de 30 prompts). En el sitio solo se añaden **4 fichas JSON** a la colección `recursos` existente — sin colección ni componentes nuevos.

**Enfoque macro:** el esfuerzo real está en construir 3 skills de alta calidad; la tienda ya existe y solo se siembra con fichas nuevas.

## Decisiones (resueltas en brainstorming)

| Decisión | Elección | Razón |
|---|---|---|
| Tamaño del lote | **3 skills + 1 bundle** (4 productos) | "Ajustado y profundo": calidad alta, estrena rápido, ampliable en lotes siguientes |
| Reparto gratis/pago | **1 gratis (amplio) + 2 de pago (Dev IA) + bundle** | gratis = imán de leads PyME; pago = demanda técnica ya probada por el curso |
| Fuente de los packs | **Monorepo privado `agentesva-skills`** | un sitio, una carpeta por pack, un script de empaquetado; patrón del curso consolidado |
| Entrega de pago | **Gumroad** (2 singles + 1 bundle) | cero infra de pago propia; idéntico al curso |
| Entrega gratis | **Puerta → `/newsletter`** (`gated:true`), zip en `public/` | idéntico al pack de 30 prompts; preserva la captación de email |
| Precios | singles **4,99 €**, bundle **7,99 €** (ahorro ~2 €) | escalera Authority.md (single 4,99 → 2-pack 7,99 → futuro 4-pack 14,99 / 10-pack 29,99); matemática de descuento honesta |
| Integración tienda | **4 fichas JSON** en `recursos` (tipo `skill`) | reutiliza colección + `RecursoCard` + `/recurso/[slug]` + `/ir` + JSON-LD |
| Gating de publicación | **Ficha gratis en vivo ya; 3 fichas de pago cuando existan las URLs de Gumroad** | evita anunciar "pago" sin enlace de compra funcional |

## A. El lote (contenido)

### Skill 1 — Asistente de atención al cliente con IA · **Gratis**
- **Slug/name:** `atencion-cliente-ia` · **Categoría:** Atención al cliente · **tipo:** `skill`
- **Qué hace:** a partir del mensaje de un cliente + contexto del negocio (sector, tono, políticas), redacta la respuesta para **email / WhatsApp / reseña de Google / reclamación** en la voz de la marca, español ES o LATAM neutro; entrega 2 variantes + una nota de por qué.
- **Público:** cualquier PyME (el imán de leads más amplio; muestra el formato "skill").
- **Recursos:** `referencia/tono-y-voz.md` (cómo fijar tono/registro), `plantillas/{email,whatsapp,resena-google,reclamacion}.md`, `ejemplos/` (3 casos: pregunta pre-venta, reclamación, respuesta a reseña negativa).

### Skill 2 — Auditor de seguridad de prompts (OWASP LLM Top 10) · **4,99 €**
- **Slug/name:** `auditor-seguridad-prompts` · **Categoría:** Desarrollo con IA · **tipo:** `skill`
- **Qué hace:** dado un system-prompt / plantilla de prompt / descripción de mini-app LLM, audita riesgos del **OWASP LLM Top 10** (foco LLM01 inyección, LLM02 salida insegura, LLM06 fuga de datos, LLM08 agencia excesiva) y emite un **informe** (severidad · evidencia · corrección) mapeado a IDs OWASP + recomendaciones de *hardening*.
- **Defensibilidad:** no hay equivalente gratis bueno en español; construido sobre el código real del curso (`defenses.py`, ejemplos vulnerable/hardened). Termina con un puntero al curso (upsell).
- **Recursos:** `referencia/owasp-llm-top10.md` (los 10 con explicación ES + qué comprobar — **Tier A**, citar OWASP GenAI Security Project), `plantillas/informe-auditoria.md`, `checklists/hardening.md`, `ejemplos/` (auditoría de un system-prompt vulnerable → informe).

### Skill 3 — Arquitecto de RAG en español · **4,99 €**
- **Slug/name:** `arquitecto-rag` · **Categoría:** Desarrollo con IA · **tipo:** `skill`
- **Qué hace:** a partir de requisitos (tipo/tamaño de corpus, latencia/coste, idioma), diseña el **pipeline RAG**: estrategia de *chunking*, elección de *embeddings*, almacén vectorial, recuperación (top-k, *reranking*), plan de *evals* y modos de fallo. Entrega un documento de arquitectura + una config inicial.
- **Defensibilidad:** guía de decisión original en español, aterrizada en el `rag.py` del laboratorio del curso.
- **Recursos:** `referencia/decisiones-rag.md` (guía: tamaños de chunk, embeddings, búsqueda híbrida, reranking, métricas de eval — **Tier A/B**, citar fuentes), `plantillas/{arquitectura-rag,eval-rag}.md`, `ejemplos/` (diseño RAG para una base de conocimiento de soporte PyME).

### Bundle — Pack Dev IA (2 skills) · **7,99 €**
- **Slug/name:** `pack-dev-ia` · **Categoría:** Desarrollo con IA · **tipo:** `skill`
- **Qué es:** Skills 2 + 3 en un solo zip. Producto Gumroad propio a 7,99 € (ahorro ~2 € frente a 9,98). Su ficha es una entrada más de `recursos` cuyo CTA va a su Gumroad.

## B. Anatomía de cada pack (qué = "construido de verdad")

Cada pack es una **Claude Agent Skill operativa**, con divulgación progresiva:
```
packs/<slug>/
  SKILL.md          # frontmatter YAML (name, description ≤ ~1 frase) + instrucciones operativas
  referencia/*.md   # capa de conocimiento que la skill carga bajo demanda
  plantillas/*.md   # plantillas de salida que la skill rellena
  ejemplos/*.md     # ≥1 caso trabajado (entrada → salida) que prueba que funciona
  README.md         # cómo instalarla en Claude (dónde va SKILL.md) + qué incluye
```
- El `SKILL.md` de cada pack **funciona** (probado cargándolo y ejecutando el ejemplo antes de empaquetar).
- Los ficheros con afirmaciones técnicas (OWASP, RAG) se **verifican Tier A/B** con `FUENTES.md` por pack.
- Licencia/uso: nota corta de licencia de uso personal/comercial (no reventa).

## C. Monorepo `agentesva-skills` (fuente + empaquetado)

Repo **privado** nuevo (GitHub `fangaiala-max/agentesva-skills`), patrón del repo del curso consolidado:
```
agentesva-skills/
  README.md                 # qué es, cómo instalar una skill en Claude
  LICENSE-USO.md
  scripts/package.sh        # zipea cada pack a dist/<slug>.zip + el bundle dist/pack-dev-ia.zip
  packs/
    atencion-cliente-ia/    (ver B)
    auditor-seguridad-prompts/
    arquitecto-rag/
  gumroad/
    setup-gumroad.md        # pasos para el navegador (como el curso; ⛔ HUMANO en login/pago/publicar)
    listing-atencion-cliente.md
    listing-auditor-seguridad.md
    listing-arquitecto-rag.md
    listing-pack-dev-ia.md
  dist/                     # gitignored; zips generados
```
- `package.sh`: para cada pack en `packs/`, crea `dist/<slug>.zip` con el contenido del pack; para el bundle, `dist/pack-dev-ia.zip` = auditor + arquitecto juntos.
- El zip de la skill gratis se **copia a `public/skill-atencion-cliente-ia.zip`** del repo del sitio para la entrega por newsletter.

## D. Entrega

- **Pago (2 singles + bundle) → Gumroad.** Yo construyo los zips + el copy de listing + `setup-gumroad.md`. **El usuario** crea los 3 productos en Gumroad (navegador; el agente se detiene ⛔ en login/2FA, diálogos de archivo del SO, identidad/fiscal/banco y publicación) y me pasa las 3 URLs. Las fichas de pago se añaden **con la URL real**.
- **Gratis → puerta a newsletter.** Ficha con `gated:true` → `/newsletter`; el zip se sirve desde `public/skill-atencion-cliente-ia.zip` y se enlaza en el flujo DOI/`/gracias` existente (mismo mecanismo que el pack de 30 prompts; verificar el mecanismo real de entrega durante el build y reutilizarlo).

## E. Integración en la tienda (sitio)

4 fichas nuevas en `src/content/recursos/` (colección existente, sin cambios de schema):

| Ficha (archivo) | tipo | categoría | precio | entrega |
|---|---|---|---|---|
| `skill-atencion-cliente.json` | skill | Atención al cliente | Gratis, `gated:true` | → `/newsletter` |
| `skill-auditor-seguridad.json` | skill | Desarrollo con IA | Pago, `precioDesde:"4,99 €"` | `gumroadUrl` (pendiente) |
| `skill-arquitecto-rag.json` | skill | Desarrollo con IA | Pago, `precioDesde:"4,99 €"` | `gumroadUrl` (pendiente) |
| `pack-dev-ia.json` | skill | Desarrollo con IA | Pago, `precioDesde:"7,99 €"` | `gumroadUrl` (pendiente) |

- Cada ficha: `titulo`, `desc`, `long`, `tagline`, `ideal`, `formato` ("Claude Skill · SKILL.md + plantillas + ejemplos"), `color`, `orden`, `actualizado`, `faq` — copy original ES (voz de marca).
- La `superRefine` de `recursos` ya obliga: Pago ⇒ `gumroadUrl` + `precioDesde`; Gratis ⇒ `downloadUrl` **o** `gated`. Por eso las fichas de pago **no pueden** existir sin URL (el build falla) — refuerza el gating de publicación.
- SEO: `Product` + `offers` reales (precio 0 / 4,99 / 7,99, EUR) vía `jsonLdSerialize`, ya implementado en `/recurso/[slug]`. Pagefind ya indexa las fichas con `tipo:Recurso`.
- Sin tocar nav, búsqueda ni componentes (ya soportan `recursos`).

## F. Secuencia de construcción

1. Monorepo `agentesva-skills`: scaffold + `README` + `package.sh` + `.gitignore`.
2. Pack 1 (gratis): `atencion-cliente-ia` — SKILL.md + recursos + ejemplos; probar; zip a `public/` del sitio.
3. Pack 2 (pago): `auditor-seguridad-prompts` — íd., con `FUENTES.md` Tier A OWASP.
4. Pack 3 (pago): `arquitecto-rag` — íd., con `FUENTES.md` Tier A/B.
5. `gumroad/`: copy de listing (4) + `setup-gumroad.md`; generar `dist/` zips.
6. Sitio: **ficha gratis `skill-atencion-cliente.json`** (en vivo) + wiring de entrega del zip por newsletter.
7. Revisión holística + PR del sitio (solo ficha gratis) → merge tras confirmación. Handoff de Gumroad al usuario.
8. **(Tras Gumroad)** añadir las 3 fichas de pago con URLs reales → PR/commit de seguimiento.

## Criterios de aceptación

- [ ] Monorepo `agentesva-skills` con 3 packs; cada `SKILL.md` carga y ejecuta su `ejemplos/` correctamente (probado antes de empaquetar).
- [ ] Ficheros con afirmaciones técnicas verificados Tier A/B (`FUENTES.md` por pack; OWASP LLM Top 10 citado).
- [ ] `package.sh` produce `dist/<slug>.zip` (3) + `dist/pack-dev-ia.zip` (bundle); zip gratis copiado a `public/` del sitio.
- [ ] Copy de listing Gumroad (4) + `setup-gumroad.md` con paradas ⛔ HUMANO.
- [ ] Ficha gratis `skill-atencion-cliente.json` válida (Gratis+gated), en vivo; entrega del zip por el flujo newsletter/DOI verificada.
- [ ] `npm run build` verde; `/recurso/skill-atencion-cliente` con `Product` JSON-LD (offer 0 €) + FAQ; buscable con `tipo:Recurso`.
- [ ] 3 fichas de pago **preparadas** (contenido listo) pero **no publicadas** hasta tener `gumroadUrl` (la `superRefine` lo garantiza).

## Fuera de alcance (lotes/tareas aparte)

- Lote 2 de skills (negocio de pago: propuestas/presupuestos, contenido SEO local, etc.).
- Automatizar la subida a Gumroad (sigue siendo paso manual del usuario en el navegador).
- Pagos on-site, membership, reseñas de usuarios, migración a DB.
- Traducciones/variantes fuera de español ES/LATAM.

---

## ADDENDUM (2026-07-04) — Cobro por Stripe Payment Links (sustituye a Gumroad en §D/§E/§F para los packs)

**Decisión del usuario** (tras conocer los trade-offs): los skill packs de pago se cobran con **Stripe Payment Links**, no Gumroad. Implicaciones aceptadas: AgentesVA es vendedor directo (IVA UE → alta en OSS y declaraciones a cargo del usuario con su gestor; se recomienda activar **Stripe Tax** en los links) y la entrega de archivos es infraestructura propia. **El curso de 19 € sigue en Gumroad** (producto vivo con URL publicada); ambos conviven.

- **Cobro:** 3 Payment Links (auditor 4,99 · arquitecto 4,99 · bundle 7,99). Cada producto Stripe lleva `metadata.slug` = slug del zip (`auditor-seguridad-prompts`, `arquitecto-rag`, `pack-dev-ia`). `after_completion` → redirect a `https://agentesva.com/descarga?session_id={CHECKOUT_SESSION_ID}`.
- **Entrega:** los zips de pago NO pueden vivir en el repo del sitio (**es público**). Se suben a **Vercel Blob** con URL no adivinable (sufijo aleatorio); el mapa slug→URL vive en la env var **`DESCARGAS_JSON`**. Nueva ruta serverless **`/descarga`** (`prerender = false`, como `/ir`): verifica la sesión con la API de Stripe (`payment_status === 'paid'`, `STRIPE_SECRET_KEY`, `fetch` plano sin SDK), resuelve el slug desde `metadata`, y muestra una página Futurista (noindex, no-store) con el botón de descarga. Riesgo aceptado: el enlace es compartible por el comprador (equivalente al recibo de Gumroad); mitigable más adelante.
- **Schema:** `gumroadUrl` → **`compraUrl`** en la colección `recursos` (neutral: contiene la URL de Gumroad en el curso cross-listado y las de Stripe en los packs). superRefine igual (Pago ⇒ `compraUrl` + `precioDesde`). No cambia la colección `cursos`.
- **Gratis sin cambios:** newsletter + `public/` (§D).
- **⛔ HUMANO:** activación de la cuenta Stripe (identidad/banco/fiscal), pegar secretos en Vercel (`STRIPE_SECRET_KEY`, `DESCARGAS_JSON`), activar Stripe Tax, y la decisión fiscal (OSS) con su gestor. El repo pasa de `gumroad/` a **`stripe/`** (copy de productos + guion de setup + script `crear-links.sh` que el usuario ejecuta con su clave).

Los criterios de aceptación de Gumroad se sustituyen por: script `crear-links.sh` funcional (crea producto+precio+link con metadata y redirect), ruta `/descarga` con los 3 caminos (paid → botones; no paid → pendiente; sesión inválida/ausente → error con soporte), y fichas de pago con `compraUrl` = Payment Links reales.

---
_Generado con [Claude Code](https://claude.com/claude-code). Voz: `docs/brand-guidelines.md`. Fact-checking: `docs/blog-fact-checking-protocol.md`._
