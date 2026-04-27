# Blog Fact-Checking Protocol — AgentesVA

**Objetivo:** garantizar 0% de hallucinations en posts del pillar. Un fact incorrecto puede:

- Tumbarte de Google AI Overview (Google penaliza fuertemente fact-incorrectos)
- Romper E-E-A-T y devastar autoridad acumulada
- Generar issues regulatorios (especialmente con subvenciones, pricing, claims sobre certificaciones)
- Dar munición a competidores para reportarte

---

## Sistema de scoring de riesgo (4 tiers)

Cada **claim factual** del post se clasifica en uno de estos tiers ANTES de publicar:

### 🔴 Tier A — RIESGO CRÍTICO (legal/regulatorio)

Claims que si son falsos generan problema legal, regulatorio o de credibilidad masiva.

**Ejemplos:**
- "Estamos dados de alta como Agente Digitalizador certificado por Red.es"
- "Cumplimos GDPR Art. 32 con cifrado AES-256 end-to-end"
- "Este caso fue auditado por [empresa]"
- Cualquier afirmación de certificación, registro oficial, o cumplimiento legal

**Verificación requerida:**
- ✅ Documentación oficial mostrable (registro Red.es, certificado, contrato)
- ✅ URL pública verificable
- ✅ Confirmación explícita por escrito del usuario antes de publicar
- ❌ NUNCA publicar basado en "creo que sí" o "lo era hasta hace poco"

### 🟠 Tier B — RIESGO ALTO (números, fechas, fuentes)

Claims numéricos o temporales que requieren cita explícita.

**Ejemplos:**
- "400.000 PyMEs españolas elegibles en 2026"
- "El 73% de PyMEs en España no usan automatización"
- "Kit Digital Segmento II ofrece hasta 6.000 €"
- "Plazo de 10 días naturales para justificar gasto"
- "La subvención requiere mantenimiento de actividad 24 meses"

**Verificación requerida:**
- ✅ URL específica de fuente oficial (acelerapyme.gob.es, BOE, Red.es)
- ✅ Fecha de la fuente (porque las cifras cambian)
- ✅ Citación inline en el post
- ⚠️ Si el dato es viejo (>12 meses), advertir al lector

### 🟡 Tier C — RIESGO MEDIO (estándares de industria)

Best practices, definiciones técnicas, comparativas razonables.

**Ejemplos:**
- "Make.com es una plataforma de automatización no-code"
- "WhatsApp Business API es la versión enterprise de WhatsApp"
- "El SEO compounding tarda típicamente 6-12 meses"

**Verificación requerida:**
- ✅ Documentación oficial del proveedor o consenso de industria
- ⚠️ Evitar superlativos sin fuente ("el mejor", "el más usado")

### 🟢 Tier D — RIESGO BAJO (opinión informada, framing)

Recomendaciones basadas en experiencia, framing, opinión del autor.

**Ejemplos:**
- "Para PyMEs de servicios pequeños, recomendamos empezar por WhatsApp"
- "El Kit Digital es uno de los programas más generosos de Europa"
- "La transparencia en pricing es un diferenciador competitivo"

**Verificación requerida:**
- Ninguna formal, pero usar lenguaje calibrado: "creemos que", "en nuestra experiencia", "para la mayoría de casos"
- ❌ NO presentar opinión como hecho

---

## Workflow obligatorio antes de publicar cada post

### Paso 1: Extraer todas las claims numéricas/factuales

Lee el post entero. Subraya CADA frase que contenga:
- Un número
- Una fecha
- Un nombre de empresa/regulador/programa
- Una afirmación cuantitativa ("la mayoría", "siempre", "nunca")
- Una citación a fuente

### Paso 2: Asignar tier a cada claim

Para cada claim, asignar 🔴 / 🟠 / 🟡 / 🟢.

### Paso 3: Verificar Tier A y Tier B

- Tier A: confirmación explícita del usuario por escrito ANTES de publicar
- Tier B: WebFetch a fuente oficial, citar URL específica con fecha

### Paso 4: Calibrar lenguaje en Tier C y D

- Tier C: añadir fuentes donde sea fácil
- Tier D: lenguaje calibrado ("en nuestra experiencia", "creemos")

### Paso 5: Marcar el post con metadata de fact-check

En el frontmatter del post `.md`:

```yaml
factCheck:
  status: "verified" | "partial" | "draft"
  lastChecked: 2026-04-30
  tierA_count: 0  # cuántos claims tier A hay (idealmente 0)
  tierB_verified: 12  # cuántos claims tier B están verificados con URL
  tierB_unverified: 0  # cuántos están pendientes
  reviewer: "Equipo AgentesVA"
  externalSources:
    - url: "https://acelerapyme.gob.es/kit-digital"
      checkedDate: 2026-04-30
      claim: "Kit Digital Segmento II ofrece hasta 6.000 €"
```

### Paso 6: Schema.org Article + ClaimReview cuando aplique

Para claims públicos verificables, considerar añadir Schema.org `ClaimReview` al JSON-LD del post. Google lo valora positivamente para fact-density posts.

---

## Reglas duras (no negociables)

0. **Toda CORRECCIÓN de un claim Tier A se trata como un nuevo claim Tier A.** No confíes en tu propia reescritura. Cada edit que tocque Red.es / certificaciones / partnerships requiere re-confirmación explícita del usuario.
   - **Lesson learned 2026-04-27:** al corregir el claim "AgentesVA es Agente Digitalizador" el primer fix introdujo OTRO claim falso ("trabajamos con Agentes de confianza"). El usuario lo cazó. El protocolo no lo hubiera cazado solo porque la nueva frase parecía menos extrema.
   - Regla operativa: cada vez que modifiques un párrafo Tier A, vuelves a leer el párrafo y re-haces el scoring desde cero. No partas de "esto ya estaba mejor que antes".
1. **Nunca publicar Tier A sin verificación explícita.** El "esto creo que está bien" es prohibido.
2. **Nunca inventar números.** Si no encuentras la cifra exacta, dilo: "según fuentes públicas, aproximadamente XX". Mejor decir "aproximadamente" que un número falso preciso.
3. **Cita siempre URL específica**, no "acelerapyme.gob.es" genérico.
4. **Marca fecha** de cada fuente — los datos de subvenciones, leyes, plataformas cambian.
5. **Preferir rangos** a números exactos cuando hay incertidumbre: "entre 3.000 y 5.000 €" mejor que "4.000 €" si no estás seguro.
6. **Casos de cliente:** sólo mostrar métricas que el cliente nos AUTORIZÓ públicamente. Si bajo NDA, decir "datos verificables en auditoría privada".

---

## Audit retroactivo: aplicación a posts ya publicados

Si un post se publicó sin fact-check:

1. Crear documento `docs/fact-checks/[slug].md` con audit completo
2. Marcar TODOS los Tier A pendientes
3. Si encuentras Tier A no verificado: **despublicar inmediatamente** (cambiar `draft: true`) hasta verificar
4. Si encuentras Tier B no verificado: actualizar con fuente o suavizar lenguaje
5. Re-publicar con `factCheck.status: "verified"`

---

## Heurísticas para detectar hallucinations propias (autoaudit)

Cuando escribas un draft, antes de marcar como `verified`:

**Pregúntate por cada número:**
- ¿De dónde saqué este dato exacto? Si no recuerdo, alarma.
- ¿Es un número redondo (10%, 50%, 100%)? Sospechoso de invento.
- ¿La fuente está en español oficial (BOE, Red.es)? Mejor.
- ¿Confirmé esto en los últimos 6 meses? Si no, re-verificar.

**Pregúntate por cada nombre propio:**
- ¿La empresa/programa existe con ese nombre exacto?
- ¿La URL del enlace lleva a la fuente correcta?
- ¿La regulación/ley existe?

**Pregúntate por claims sobre AgentesVA:**
- ¿Realmente hacemos esto / tenemos esta certificación / cumplimos esto?
- Si no estoy 100% seguro: **flag para usuario antes de publicar**.

---

## Template para validar Pillar nuevo (checklist)

```markdown
# Fact-check pillar: [nombre del post]

## Tier A — Crítico (deben ser TODOS verificados)
- [ ] Claim 1: [texto exacto] — Fuente: [URL] — Fecha verificación: [fecha]
- [ ] Claim 2: ...

## Tier B — Alto (números/fechas/fuentes)
- [ ] Claim N: [texto exacto] — Fuente: [URL] — Fecha verificación: [fecha]

## Tier C — Medio
- [ ] Best practices con fuente

## Tier D — Bajo
- [ ] Lenguaje calibrado (no presentar opinión como hecho)

## Resultado
- Estado: verified / partial / draft
- Tier A pendientes: 0 (no se publica hasta 0)
- Tier B pendientes: 0 (no se publica hasta 0)
- Próxima re-verificación: [fecha + 6 meses]
```
