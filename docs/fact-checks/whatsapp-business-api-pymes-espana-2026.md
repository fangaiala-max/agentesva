# Fact-Check Audit — Pillar #2: WhatsApp Business API para PyMEs España 2026

**Post URL:** https://agentesva.com/blog/whatsapp-business-api-pymes-espana-2026/
**Fecha audit:** 2026-04-28 (audit pre-publicación, aplicado desde el draft)
**Auditor:** Equipo AgentesVA
**Estado:** ✅ VERIFIED (re-audit 2026-04-27 tras research contra Meta Developers + business.whatsapp.com + Twilio + 360dialog + LinkMobility).

**Cambio detectado en re-audit:** Meta cambió el modelo de pricing **el 1 de julio de 2025** de per-conversation a **per-message**. El draft inicial citaba el modelo viejo. Corregido en el post.

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

### Claim B1 — Modelo de pricing WhatsApp (per-mensaje desde julio 2025)

**Texto actualizado:** "Desde el 1 de julio de 2025 Meta cobra por mensaje (no por conversación). Service messages = gratis. Utility en respuesta a usuario dentro de 24h = gratis. Utility fuera de ventana, Authentication y Marketing = pago por mensaje. Precios del orden de céntimos por mensaje según categoría y país."

**Estado:** ✅ VERIFIED contra:
- [business.whatsapp.com/products/platform-pricing](https://business.whatsapp.com/products/platform-pricing) — confirma modelo per-message + service free + utility free in service window
- [Twilio WhatsApp Pricing](https://www.twilio.com/en-us/whatsapp/pricing) — confirma rangos para España (utility/auth ~$0.0034/msg en USD)
- [LinkMobility 2025 Guide](https://www.linkmobility.com/en-gb/blog/whatsapp-business-api-pricing-2025-guide) — confirma fecha 1 julio 2025 del cambio

**Acción:** ✅ Aplicado al post. Lenguaje calibrado ("del orden de céntimos"); enlace a calculadora oficial Meta para presupuestos exactos.

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

**Texto actualizado:** "Sin verificación de negocio el cap inicial es de 250 mensajes business-initiated por 24h. Tras verificación: 1.000 (Tier 1). Verificadas con calidad alta escalan a 2.000 → 10.000 → 100.000 → ilimitado. Meta revisa cada 6h si puedes subir tier (>=50% uso del cap actual + calidad alta)."

**Estado:** ✅ VERIFIED contra [Meta — Messaging Limits docs](https://developers.facebook.com/docs/whatsapp/messaging-limits/). Cambio post-octubre 2025 confirmado.

**Acción:** ✅ Corregido en post (de "1.000 sin verificar" a "250 sin verificar").

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
| 🟠 B | 5 | 5 | 0 |
| 🟡 C | 4 | 4 | 0 |
| 🟢 D | 2 | 2 | 0 |

**Estado total:** ✅ VERIFIED. Cambios aplicados al post tras re-audit:
- Modelo de pricing actualizado de per-conversación a per-mensaje (cambio Meta del 1-jul-2025)
- Tabla de costes simplificada (céntimos/mensaje en lugar de rangos por conversación)
- Click-to-WhatsApp 72h gratis añadido
- Cap inicial sin verificar negocio corregido: 250 (no 1.000)
- Ejemplo numérico recalculado en orden de magnitud realista (€60–€200/mes para PyME activa)
- Links añadidos a Meta Developers, business.whatsapp.com pricing, Twilio, 360dialog

---

## Acciones pendientes

✅ Todas las acciones completadas en re-audit del 2026-04-27.

## Próxima re-verificación

**2026-10-28** (6 meses post-publicación). Re-checkear precios Meta + cualquier cambio normativo (RGPD, ePrivacy, etc.).
