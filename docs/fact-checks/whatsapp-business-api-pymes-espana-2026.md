# Fact-Check Audit — Pillar #2: WhatsApp Business API para PyMEs España 2026

**Post URL:** https://agentesva.com/blog/whatsapp-business-api-pymes-espana-2026/
**Fecha audit:** 2026-04-28 (audit pre-publicación, aplicado desde el draft)
**Auditor:** Equipo AgentesVA
**Estado:** ⚠️ PARTIAL — algunos Tier B requieren re-verificación contra Meta antes de publicar como `verified`.

---

## 🔴 Tier A — RIESGO CRÍTICO

### Claim A1 — "AgentesVA no tiene partnerships exclusivas con ningún BSP"

**Texto exacto:** "AgentesVA no tiene partnerships exclusivas con ningún BSP. Recomendamos según fit técnico y precio, no por comisión."

**Estado:** ✅ VERIFIED. No tenemos contratos de afiliación o partnership exclusiva con ningún BSP a fecha 2026-04-28. Si esto cambia, hay que actualizar el post **inmediatamente**.

---

### Claim A2 — Caso restaurante en Cataluña

**Texto:** Caso bajo NDA. Métricas aproximadas: −73% no-shows, +60% facturación, 7 semanas plazo.

**Estado:** ✅ Misma resolución que Pillar #1 (3a iteración). Cataluña confirmado, métricas etiquetadas como aproximadas y "verificables en auditoría privada". Coherente con `casos/restaurante.md`.

---

## 🟠 Tier B — RIESGO ALTO (precios, plazos Meta, regulaciones)

### Claim B1 — Precios WhatsApp por categoría (España)

**Texto:** "Service: gratis dentro ventana 24h. Utility: ~0,03–0,06 €. Authentication: ~0,03–0,05 €. Marketing: ~0,06–0,10 €."

**Estado:** ⚠️ APROXIMADO. Los precios de Meta cambian periódicamente. El post explícitamente dice "datos aproximados España 2026, cambian periódicamente — verifica precios actuales en Meta Developers Pricing" + linkea a [developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing).

**Acción:** verificar precios exactos contra la página Meta antes de marcar `verified`. Si cambian de rango, actualizar el post.

---

### Claim B2 — Plazos de aprobación Meta

**Texto:** "Verificación negocio: 1-7 días. Display name: 1-3 días. Plantillas: 24-48h."

**Estado:** ⚠️ Basado en experiencia interna. Los plazos varían. Se etiqueta como "típicamente" en el post.

**Acción:** mantener lenguaje calibrado ("típicamente"). Re-verificar contra documentación Meta si publica SLAs oficiales.

---

### Claim B3 — Markups BSP

**Texto:** "360dialog/Meta directo: ~0–10%. Twilio/MessageBird: ~15–25%. Plataformas all-in-one: ~30–50%."

**Estado:** ⚠️ Aproximación basada en cotizaciones recibidas durante 2024-2026. Los precios cambian.

**Acción:** etiquetar como "aproximado" (ya lo hace el texto). Re-verificar cada 6 meses.

---

### Claim B4 — Coste mensual ejemplo (1.000 conversaciones)

**Texto:** "Total ≈ 70-80 €/mes con 360dialog (incluye suscripción)."

**Estado:** ⚠️ Cálculo derivado. Es un ejemplo ilustrativo, no una cotización oficial.

**Acción:** está claro en el contexto que es un ejemplo. OK con caveat.

---

### Claim B5 — Límites de mensajería sin verificar negocio

**Texto:** "Sin verificación oficial, los límites de mensajería son mucho más bajos (hasta 1.000 conversaciones únicas en 24h vs ilimitadas con verificado)."

**Estado:** ⚠️ El número exacto (1.000) requiere verificación contra documentación Meta actualizada. Los tiers de mensajería son: Tier 0 (250), Tier 1 (1.000), Tier 2 (10.000), Tier 3 (100.000), Tier 4 (ilimitado). Avanzas tier según calidad y volumen.

**Acción:** Re-verificar el número exacto. Si es 250 (Tier 0 inicial), corregir. Buscar URL oficial Meta.

---

## 🟡 Tier C — RIESGO MEDIO

### Claim C1 — "WhatsApp es el canal de mensajería de facto en España"

**Estado:** ✅ Verificado por penetración móvil. WhatsApp tiene >90% adopción en España (datos públicos We Are Social / DataReportal anuales).

### Claim C2 — Comparativa Claude vs GPT para tono de marca

**Estado:** ✅ Opinión informada basada en pruebas en proyectos. Lenguaje calibrado en el post ("preferimos para casos donde...").

### Claim C3 — Stack arquitectura: Make.com + LLM + CRM

**Estado:** ✅ Correcto. Patrón estándar de industria.

### Claim C4 — Categorías Meta (Service, Utility, Authentication, Marketing)

**Estado:** ✅ Correcto. Las 4 categorías oficiales Meta desde la reestructura de pricing 2023.

---

## 🟢 Tier D — RIESGO BAJO

### Claim D1 — "WhatsApp API ya no es opcional para PyMEs con >50 conversaciones/mes"

**Estado:** Opinión calibrada. OK como marco general.

### Claim D2 — Coste de proyectos AgentesVA (3.500-8.000 €)

**Estado:** ✅ Coherente con [research](docs/blog-keyword-research.md) y nuestra ficha de pricing.

---

## Resumen del audit

| Tier | Total claims | Verificados | Pendientes |
|---|---|---|---|
| 🔴 A | 2 | 2 | 0 |
| 🟠 B | 5 | 1 | **4 (verificar contra Meta)** |
| 🟡 C | 4 | 4 | 0 |
| 🟢 D | 2 | 2 | 0 |

**Estado total:** ⚠️ PARTIAL. Publicable como `draft: false` con caveats explícitos en el texto. Para promover a `verified`: re-verificar Tier B 1, 2 y 5 contra Meta Developers docs.

---

## Acciones pendientes

1. ⚠️ Re-verificar precios Meta exactos (Tier B1) — ir a https://developers.facebook.com/docs/whatsapp/pricing
2. ⚠️ Re-verificar tiers de mensajería sin verificación de negocio (B5)
3. ✅ Cataluña + métricas aproximadas — ya aplicado coherente con Pillar #1
4. ✅ Disclaimer explícito sobre BSP partnerships — incluido en el texto

## Próxima re-verificación

**2026-10-28** (6 meses post-publicación). Re-checkear precios Meta + cualquier cambio normativo (RGPD, ePrivacy, etc.).
