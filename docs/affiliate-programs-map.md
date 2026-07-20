# Mapa de programas de afiliados — directorio AgentesVA

**Investigado:** 2026-07-20 · **Cobertura:** las 54 herramientas de `src/content/tools/`
**Método:** verificación web contra la web oficial de cada herramienta (o su red de afiliados). Cada fila lleva un nivel de confianza.

> ⚠️ **Los programas cambian.** Confirma comisión, ventana de cookie y condiciones **en el momento de darte de alta** — las cifras de abajo son las publicadas en la fecha de investigación, no un contrato.

---

## Cómo se usa esto

1. Date de alta en los programas por orden de prioridad (abajo).
2. Cuando tengas tu enlace de seguimiento, añádelo al JSON de la herramienta:

```jsonc
// src/content/tools/brevo.json
{
  "name": "Brevo",
  // …
  "affiliateUrl": "https://tu-enlace-de-seguimiento"   // ← opcional, debe ser URL válida
}
```

3. Nada más. `/ir/{slug}` ya redirige a `affiliateUrl` cuando existe (y a la web oficial cuando no), y el log de clicks pasa a marcar `hasAffiliate: true`. **No hay que tocar código.**

---

## 🔑 El atajo: 4 redes desbloquean 24 de los 29 programas

La mayoría de estas herramientas no gestionan su programa por su cuenta — usan una red. **Date de alta una vez en cada red y podrás solicitar muchos programas desde un único panel:**

| Red | Programas de tu directorio | Alta |
|---|---|---|
| **PartnerStack** | 13 — Brevo, Surfer SEO, ManyChat, Landbot, ElevenLabs, n8n, Gamma, Tidio, Murf, Wati, Descript, Fathom, (HubSpot vía Impact) | [partnerstack.com](https://partnerstack.com) |
| **Rewardful** | 5 — Synthesia, HeyGen, Relevance AI, Mem, Play.ht | alta por programa |
| **Impact** | 3 — HubSpot, Grammarly, Otter | [impact.com](https://impact.com) |
| **FirstPromoter** | 3 — Chatfuel, Jasper, Writesonic | alta por programa |

**Empieza por PartnerStack** — es el que más cubre y varios de tus mejores pagos están ahí.

---

## 🥇 Tier 1 — date de alta esta semana

Mayor ingreso esperado × mejor encaje con PyMEs hispanohablantes.

| # | Herramienta | Comisión | Cookie | Red | Alta |
|---|---|---|---|---|---|
| 1 | **Brevo** | **5 €/registro gratis + 100 €/suscripción de pago** | 90 d | PartnerStack | [brevo.com/partners/affiliates](https://www.brevo.com/partners/affiliates/) |
| 2 | **HubSpot** | 30 % recurrente hasta 12 meses | **180 d** | Impact | [hubspot.com/partners/affiliates](https://www.hubspot.com/partners/affiliates) |
| 3 | **Surfer SEO** | **75–125 % de la mensualidad** (CPA por tramos) | — | PartnerStack | [surferseo.com/affiliate-program](https://surferseo.com/affiliate-program/) |
| 4 | **Make** | 35 % durante 12 meses | 30 d | directo | [make.com/en/affiliate](https://www.make.com/en/affiliate) |
| 5 | **ManyChat** | 30 % → 40 % → **50 %** recurrente 12 meses (por volumen) | 90 d | PartnerStack | [affiliate.manychat.com](https://affiliate.manychat.com/) |
| 6 | **Landbot** | 20 % recurrente **hasta 24 meses** | 90 d | PartnerStack | [landbot.io/affiliates](https://landbot.io/affiliates) |

**Por qué estos seis:** Brevo paga un CPA fijo altísimo (y ya usas Brevo, así que conoces el producto); HubSpot tiene el ticket más alto y la cookie más larga (180 d); Surfer paga más del 100 % del primer mes; Make/ManyChat/Landbot son justo las categorías que más consume tu audiencia (Automatización y WhatsApp) — y Landbot además es española.

## 🥈 Tier 2 — alto valor, justo después

| Herramienta | Comisión | Cookie | Red | Alta |
|---|---|---|---|---|
| **Grammarly** | hasta 30 % | 90 d | Impact | [grammarly.com/affiliates](https://www.grammarly.com/affiliates) |
| **ElevenLabs** | 22 % recurrente 12 meses (11 % Business) | 90 d | PartnerStack | [elevenlabs.io/affiliates](https://elevenlabs.io/affiliates/app/sign-up) |
| **n8n** | 30 % rev-share 12 meses (Cloud Starter/Pro) | — | PartnerStack | [n8n.io/affiliates](https://n8n.io/affiliates/) |
| **Gamma** | 30 % recurrente 12 meses | 90 d | PartnerStack | [gammaapp.partnerstack.com](https://gammaapp.partnerstack.com/?group=affiliates) |
| **Tidio** | hasta 30 % (lifetime) | — | PartnerStack | [tidio.com/partners/affiliate](https://www.tidio.com/partners/affiliate/) |
| **Chatfuel** | 30–50 % recurrente 12 meses (tope 2.000 $/cliente) | 60 d | FirstPromoter | [affiliate.chatfuel.com](https://affiliate.chatfuel.com/) |
| **Synthesia** | 25 % primeros 12 meses | 60 d | Rewardful | [synthesia.getrewardful.com](https://synthesia.getrewardful.com/signup) |
| **Murf** | 20 % recurrente **hasta 24 meses** | 90 d | PartnerStack | [murfai.partnerstack.com](https://murfai.partnerstack.com/?group=affiliatepartners20) |
| **Wati** | 15–20 % recurrente 12 meses | 90 d | PartnerStack | [wati.io/become-an-affiliate](https://www.wati.io/become-an-affiliate/) |

## 🥉 Tier 3 — vale la pena, pero menor pago / ventana corta / términos no públicos

| Herramienta | Comisión | Cookie | Red | Alta | Nota |
|---|---|---|---|---|---|
| **Writesonic** | 20 % recurrente 12 meses | 60 d | FirstPromoter | [writesonic.com/affiliate](https://writesonic.com/affiliate) | |
| **Descript** | 25 $ fijo por suscriptor de pago | — | PartnerStack | [descriptinc.partnerstack.com](https://descriptinc.partnerstack.com/?group=affiliates) | CPA fijo bajo |
| **HeyGen** | 35 % 3 meses (creadores) / ~20 % general | 30 d | Rewardful | [heygen.getrewardful.com](https://heygen.getrewardful.com/signup) | 2 vías; la de creadores pide +5k seguidores |
| **Adobe Firefly** | 8–85 % del primer mes; 8,33 % anual | 30 d | Partnerize | [adobe.com/affiliates](https://www.adobe.com/affiliates.html) | No hay programa solo-Firefly; entra por el de Adobe general |
| **Jasper** | 25 % (30 % con volumen) | **14 d** ⚠️ | FirstPromoter | [jasper.ai/partners](https://www.jasper.ai/partners) | Cookie muy corta |
| **Play.ht** | 25 % recurrente | 60 d | Rewardful | [play.ht/affiliates](https://play.ht/affiliates/) | *likely* — rebautizado PlayAI |
| **Relevance AI** | recurrente, % no público | — | Rewardful | [relevance-ai.getrewardful.com](https://relevance-ai.getrewardful.com/signup) | % solo visible dentro del portal |
| **Fathom** | rev-share no público | 90 d | PartnerStack | [fathom.ai/program/growth-partner](https://www.fathom.ai/program/growth-partner) | ⚠️ No confundir con Fathom Analytics |
| **Otter.ai** | 15–20 % primer año | 30 d | Impact | contacto: `affiliate@otter.ai` | *likely* — sin enlace público en su web |
| **Mem** | no público | — | Rewardful | [mem.getrewardful.com](https://mem.getrewardful.com/signup?campaign=mem-affiliate-program) | *likely* |
| **v0 (Vercel)** | no público | — | Dub | [partners.dub.co/v0/apply](https://partners.dub.co/v0/apply) | *likely* — vía términos de afiliación de Vercel |
| **Ideogram** | no público | — | directo | formulario Google (ver Creators Club) | *likely* — términos solo tras aprobación |
| **Krea** | ~25 % + créditos | — | directo | [krea.ai/cpp](https://www.krea.ai/cpp) | *likely* — abre por ventanas de inscripción |
| **Mailchimp** | 25 % nuevos + 5 % gestionados | 30 d | directo | [mailchimp.com/andco](https://mailchimp.com/andco/) | ⚠️ Exige gestionar 2+ cuentas de cliente de pago — modelo agencia, mal encaje para un directorio |

---

## ⏸️ Cerrados o restringidos ahora mismo (revisar más adelante)

| Herramienta | Situación |
|---|---|
| **Canva** | El acceso de afiliados pasa por el programa embajador *Canvassador*, **cerrado a nuevas solicitudes**. Corre en Impact una vez admitido. |
| **Notion** | Programa publicado (hasta 50 $/alta + 20 % del primer año, cookie 180 d) pero la web dice explícitamente que **no acepta nuevos afiliados**. |
| **Leonardo AI** | Programa **cerrado** (según su FAQ oficial, desde el 7 abr 2026). Un post no oficial dice que "ha vuelto" — sin confirmar. |

## 💳 Pagan en créditos, no en dinero (no sirven para monetizar el directorio)

**Replit** (20 $ de crédito por referido) · **Cursor** (25 $ de crédito, además invitación restringida).

## ❌ Sin programa de afiliados (19) — deja `affiliateUrl` vacío

`bolt` · `chatgpt` · `claude` · `deepl` · `deepseek` · `gemini` · `github-copilot` · `grok` · `huggingchat` · `leonardo-ai` · `microsoft-copilot` · `midjourney` · `mistral` · `perplexity` · `pika` · `runway` · `suno` · `tome` · `zapier`

Los grandes LLM de primera parte (OpenAI, Anthropic, Google, Microsoft, xAI, Mistral, DeepSeek) no tienen programa de afiliados de consumo. Zapier solo tiene programas de partner/integración, no de referidos con comisión self-serve.

**Estas siguen funcionando igual:** `/ir/{slug}` redirige a la web oficial y el click se registra (`hasAffiliate: false`) — así sabrás cuánto tráfico estás regalando y podrás renegociar o repriorizar contenido.

## ❓ Sin verificar / probablemente discontinuados (3)

| Herramienta | Situación |
|---|---|
| **Bardeen** | `bardeen.ai/affiliate` sin contenido y su enlace de Tapfiliate redirige fuera — parece discontinuado pese a menciones antiguas de 20 %/24 meses. |
| **Copy.ai** | `copy.ai/affiliates` da 404 y no hay enlace en el pie; las cifras de 45 %/60 d que circulan son de terceros y probablemente obsoletas. |
| **Cursor** | Solo programa de referidos por invitación que paga en créditos. El "20 % recurrente" solo aparece en un registro comunitario, no en su web. |

---

## ⚠️ Trampas de nombres detectadas (verificadas una a una)

Estas confusiones habrían generado enlaces de afiliado **hacia el producto equivocado**:

- **`pika.art`** (Pika Labs, vídeo IA — el del directorio) ≠ **`pika.style`** (herramienta de mockups, con su propio programa al 30 %).
- **`tome.app`** (el del directorio; ha pivotado a ventas enterprise, sin programa) ≠ **`tomeapp.ai`** (clon de presentaciones con programa al 50 %).
- **`fathom.video`/`fathom.ai`** (notas de reunión IA — el del directorio) ≠ **Fathom Analytics** (`usefathom.com`, analítica web).
- **GitHub Copilot** ≠ **`copilot.com`** (empresa de portales de cliente, sin relación, con programa propio al 20 %).

---

## Resumen

| Estado | Nº |
|---|---|
| ✅ Programa activo y abierto | **29** |
| ⏸️ Cerrado / restringido ahora | 3 |
| 💳 Solo créditos | 1 (+1) |
| ❌ Sin programa | 19 |
| ❓ Sin verificar | 3 |
| **Total** | **54** |

**Siguiente paso recomendado:** crea la cuenta de **PartnerStack** y solicita los 6 del Tier 1. Con eso cubres las categorías de mayor intención de tu directorio (email marketing, CRM, SEO, automatización y WhatsApp) antes de tocar la larga cola.
