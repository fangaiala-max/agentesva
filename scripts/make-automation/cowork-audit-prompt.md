# Prompt para Claude Cowork — Auditoría de cuentas AgentesVA automation

Copia y pega este prompt completo a Claude Cowork (o a cualquier instancia con acceso a navegador web).

---

## PROMPT

Eres un auditor técnico. Tu misión: verificar que 3 cuentas SaaS estén correctamente configuradas para construir una automatización Make.com → Claude API → Resend → email. Esta automatización enviará diagnósticos personalizados a leads del sitio agentesva.com tras completar un quiz.

Reporta en formato checklist lo que encuentres. **No hagas cambios en las cuentas, solo audita.** Si algo falta o está mal, dilo explícitamente. Si necesitas credenciales para acceder, pídeselas al usuario.

---

### Cuenta 1 — Make.com (usuario dice: plan de pago activo)

Navega a https://make.com y verifica:

1. **¿Plan actual?** (Free / Core €9/mes / Pro €16/mes / Teams / Enterprise)
2. **¿Cuántas operaciones/mes tiene el plan?**
3. **¿Cuántas operaciones quedan disponibles este mes?**
4. **¿Hay scenarios existentes corriendo?** Lista sus nombres si los hay.
5. **¿Conexiones OAuth ya creadas?** Busca especialmente si hay:
   - Conexión a HubSpot ✓/✗
   - Conexión a Claude/Anthropic ✓/✗
   - Conexión a Resend o SMTP ✓/✗
   - Conexión a Gmail ✓/✗
6. **Región del workspace:** Europa / US / otra
7. **Webhook URL disponible?** (plan paid suele incluir custom webhooks sin polling)

**Output esperado:**
```
Make.com:
  - Plan: [X]
  - Ops disponibles: [X/Y]
  - Scenarios activos: [lista o "ninguno"]
  - Conexiones: [lista]
  - Región: [X]
  - Webhooks disponibles: [sí/no]
  - Estado general: ✓ Listo / ⚠ Requiere acción / ✗ Bloqueado
  - Acciones pendientes: [lista si hay]
```

---

### Cuenta 2 — Anthropic Console (Claude API)

Navega a https://console.anthropic.com y verifica:

1. **¿Existe una API key activa?** No muestres la key completa (riesgo de seguridad), solo confirma existencia y **los primeros 8 caracteres** (ej: `sk-ant-a...`) y **los últimos 4**.
2. **¿Saldo de crédito disponible?** ¿Cuánto?
3. **¿Hay billing configurado (auto-reload)?** Sí/No.
4. **Modelos disponibles según el tier:**
   - claude-opus-4-7 ✓/✗
   - claude-sonnet-4-6 ✓/✗
   - claude-haiku-4-5 ✓/✗
5. **Rate limits del tier actual:** requests/min y tokens/min.
6. **¿Uso del último mes en $?** (útil para calcular coste medio por diagnóstico)

**Output esperado:**
```
Anthropic Console:
  - API key: [prefijo]...[sufijo] (creada: fecha si visible)
  - Crédito disponible: $[X]
  - Auto-reload: [sí/no]
  - Tier: [Build / Scale / Enterprise]
  - Modelos accesibles: [lista]
  - Rate limits: [X RPM / Y TPM]
  - Uso último mes: $[X]
  - Estado general: ✓ Listo / ⚠ Requiere acción / ✗ Bloqueado
```

---

### Cuenta 3 — Resend

Navega a https://resend.com y verifica:

1. **¿Plan actual?** (Free / Pro €20/mes / otro)
2. **¿Emails enviados este mes / límite del plan?**
3. **¿Dominios verificados?** Busca específicamente `agentesva.com`:
   - ¿Está añadido? ✓/✗
   - ¿Status "Verified"? ✓/✗
   - ¿Qué DNS records están configurados? (SPF, DKIM, DMARC, MX de retorno)
4. **¿API keys existentes?** No muestres la key completa, solo confirma existencia.
5. **¿"From" addresses configurados?** Ej: `hola@agentesva.com`. ¿Está listo para enviar?
6. **¿Webhooks configurados?** (para tracking de deliverability)

**Output esperado:**
```
Resend:
  - Plan: [X]
  - Emails este mes: [X/Y]
  - Dominios verificados: [lista]
    - agentesva.com: [status + DNS records]
  - API keys: [N keys activas]
  - From addresses: [lista]
  - Estado general: ✓ Listo / ⚠ Requiere acción / ✗ Bloqueado
  - Acciones pendientes: [lista]
```

---

### Checklist cruzado — ¿estamos listos para construir el scenario?

Al final del reporte, responde:

1. **¿Podemos empezar a construir el scenario Make.com AHORA?** Sí/No.
2. Si NO: **¿Qué 1-3 cosas debo hacer yo primero?** (en orden de prioridad).
3. **¿Cuántas cuotas gratis tengo antes de tener que pagar upgrade de algún servicio?** (ej: 3000 emails Resend free/mes, X diagnósticos/mes antes de upgradeo)
4. **¿Algún riesgo de entregabilidad o configuración que debería resolver AHORA?** (ej: DMARC mal configurado perjudica spam score)

---

## Contexto técnico para que entiendas el uso

El scenario Make.com hará:
- Trigger: HubSpot form `Diagnóstico AgentesVA` submitted (form GUID: `6a283564-7cb8-46a6-a812-76101a686d41`)
- Acción 1: HTTP POST a Claude API (modelo `claude-sonnet-4-6`, ~1500 tokens output, coste ~€0.02-0.05 por llamada)
- Fallback: HTTP POST a Gemini API si Claude falla
- Acción 2: merge HTML template con la respuesta
- Acción 3: Resend API POST para enviar email desde `hola@agentesva.com` al lead
- Acción 4: HubSpot update contact con lead_score y nota

Volumen esperado inicial: 5-30 leads/mes. Escalado a 100-200 leads/mes en 3-6 meses.

Reporta en <500 palabras total. Sé directo. Si encuentras algo raro, dímelo sin edulcorar.
