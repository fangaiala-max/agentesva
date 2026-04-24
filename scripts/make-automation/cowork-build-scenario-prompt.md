# Prompt Cowork — Construir scenario Make.com AgentesVA (7 módulos)

Copia y pega este prompt a Claude Cowork. Construye el scenario Make.com end-to-end: quiz → Claude → email vía Resend.

---

## PROMPT

Eres un ingeniero de integraciones senior. Tu misión: **construir el scenario Make.com** del proyecto AgentesVA siguiendo la arquitectura definida. Todo el setup previo ya está listo (cuentas verificadas, API keys creadas, connections OAuth activas).

**Arquitectura:**
```
HubSpot Form "Diagnóstico AgentesVA" submitted
  → Claude API (modelo claude-sonnet-4-6) genera diagnóstico HTML
  → [Si Claude falla] Gemini 2.5 Flash fallback
  → Router: elige output Claude o Gemini
  → Text merge template email
  → Resend API envía email a lead
  → HubSpot: update contact con lead_score + nota
```

**Reglas de trabajo:**

1. **Un módulo a la vez. Confirma con el usuario antes de pasar al siguiente.**
2. **Pide credenciales cuando sean necesarias** (API keys, OAuth authorizations).
3. **NUNCA expongas API keys completas en el chat.** Usuario copia/pega directamente en Make.
4. **Usa los valores literales de este prompt** para config — no inventes nada.
5. **Al terminar cada módulo, haz "Run once" para validar** con datos de prueba.
6. **Reporta al final** con estado por módulo.

---

## PARÁMETROS FIJOS DEL PROYECTO

```
HUBSPOT_PORTAL_ID:     148323903
HUBSPOT_FORM_GUID:     6a283564-7cb8-46a6-a812-76101a686d41
HUBSPOT_FORM_NAME:     "Diagnóstico AgentesVA"
FROM_EMAIL:            hola@agentesva.com
FROM_NAME:             AgentesVA
MEETING_URL:           https://calendly.com/fangaiala/auditoria-gratis-agentesva-30-min
CLAUDE_MODEL:          claude-sonnet-4-6
GEMINI_MODEL:          gemini-2.5-flash
```

El usuario tiene estas API keys en su gestor de contraseñas (las copiará/pegará en Make cuando sean necesarias):
- **Anthropic key:** "AgentesVA" (prefix sk-ant-api03)
- **Resend key:** "AgentesVA Make.com" (prefix re_)
- **Gemini key:** pedir al usuario si no existe, o crear en https://aistudio.google.com/apikey (free tier)

---

## ARRANQUE

1. Login en https://eu1.make.com
2. Click **Create a new scenario**
3. Name: `AgentesVA - Diagnóstico Auto-Email`
4. Workspace: el que contenga las connections ya creadas
5. Continúa con Módulo 1

---

## MÓDULO 1 — Trigger: HubSpot Watch form submissions

**Acción:** el scenario se dispara cada vez que un lead completa el quiz.

### Configuración:

1. Click **+** para añadir primer módulo
2. Busca **HubSpot CRM**
3. Selecciona **Watch form submissions**
4. **Connection:** `HubSpot AgentesVA` (la que ya existe)
5. Config del módulo:
   - **Form:** buscar y seleccionar `Diagnóstico AgentesVA`
   - **Limit:** 10 submissions per execution
6. Click **OK**

### Validación:

1. Haz **Run once** en el scenario
2. Simultáneamente, en otra pestaña: completa el quiz en https://agentesva.com/diagnostico/ con datos de prueba (email: el tuyo)
3. Vuelve a Make → deberías ver el módulo 1 con datos:
   - `email`: [tu email de prueba]
   - `properties.firstname`: [nombre]
   - `properties.industria_agentesva`: [industria seleccionada]
   - `properties.tamano_equipo`: [valor]
   - `properties.herramientas_actuales`: [valores multi]
   - `properties.dolor_principal`: [texto con metadata]
   - `properties.presupuesto_rango`: [valor]

**Si no aparecen todos los datos:** avisa al usuario y detente. Hay que diagnosticar el form submission antes de seguir.

### Reporte Módulo 1:
```
M1 HubSpot trigger: ✅ / 🔴
  - Connection usada: HubSpot AgentesVA
  - Form detectado: sí/no
  - Test submission capturada: sí/no
  - Datos recibidos: [lista de propiedades con valores]
```

---

## MÓDULO 2 — HTTP call a Claude API

**Acción:** envía las respuestas del quiz a Claude, recibe HTML del diagnóstico.

### Configuración:

1. Después de Módulo 1, click **+**
2. Busca **HTTP** → selecciona **Make a request**
3. Config:

**URL:** `https://api.anthropic.com/v1/messages`

**Method:** POST

**Headers (Add item × 3):**
| Name | Value |
|---|---|
| `x-api-key` | [PEDIR AL USUARIO: pegar su key "AgentesVA" de Anthropic] |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

**Body type:** Raw

**Content type:** JSON (application/json)

**Request content (pega exactamente esto, incluidos los mapeos {{1...}}):**

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1500,
  "temperature": 0.7,
  "system": "Eres el analista senior de AgentesVA, una consultora de automatización con IA para PyMEs en España y Latinoamérica. Tu trabajo es generar diagnósticos personalizados tras un quiz de 5 preguntas.\n\nTONO: directo, sin jerga corporativa, concreto, orientado a ROI. No usas palabras vacías como 'sinergia', 'robusto', 'integral'. Hablas como un consultor senior que no tiene tiempo que perder.\n\nFORMATO DE SALIDA: HTML limpio para insertar en un email. Usa <h3>, <p>, <ul>, <strong>, <em>. NO uses <html>, <body>, ni <style>. NO uses markdown. NO uses emojis. Español neutro.\n\nLONGITUD: 350-500 palabras máximo.\n\nESTRUCTURA OBLIGATORIA (5 secciones):\n1. <h3>Lo que nos contaste</h3> - 2-3 frases parafraseando el dolor.\n2. <h3>El coste real de seguir así</h3> - Calcula el coste mensual en € y horas.\n3. <h3>Top 3 automatizaciones priorizadas</h3> - <ul> con 3 automatizaciones específicas para la industria.\n4. <h3>Tu siguiente paso</h3> - Basado en presupuesto: si ≥1500€ invitar a auditoría 30 min; si <500€ camino DIY; si 'no lo sé' invitar a 15 min sin compromiso.\n5. <h3>¿Por qué te decimos esto gratis?</h3> - 2 frases sobre filosofía AgentesVA. Firma: 'El equipo de AgentesVA'.\n\nREGLAS CRÍTICAS:\n- NUNCA inventes datos que el usuario no dijo\n- NUNCA prometas resultados específicos. Usa rangos ('clientes similares han visto entre 15-30%')\n- NO uses 'estimado/a cliente', usa el nombre si está disponible",
  "messages": [
    {
      "role": "user",
      "content": "Genera el diagnóstico para este lead:\n\nNombre: {{1.properties.firstname}}\nIndustria: {{1.properties.industria_agentesva}}\nTamaño equipo: {{1.properties.tamano_equipo}}\nHerramientas: {{1.properties.herramientas_actuales}}\nDolor: {{1.properties.dolor_principal}}\nPresupuesto: {{1.properties.presupuesto_rango}}"
    }
  ]
}
```

**NOTA IMPORTANTE:** cuando pegues el JSON en Make, los `{{1.properties.XXX}}` deben convertirse en chips visuales (Make los detecta automáticamente). Si no, cámbialos manualmente clickeando en el campo → buscar y seleccionar la propiedad del módulo 1.

**Other settings:**
- **Parse response:** ✅ Yes

4. Click **OK**

### Validación:

1. Click **Run once** (o re-run). Use los datos del test anterior.
2. Módulo 2 debe devolver status 200 y un objeto con:
   - `content[0].text` = HTML del diagnóstico (~350-500 palabras)
3. Si error 401: api key incorrecta
4. Si error 400: hay un error en el JSON body
5. Si error 429: rate limited (esperar 1 min y retry)

### Reporte Módulo 2:
```
M2 Claude HTTP: ✅ / 🔴
  - Status code: 200
  - Output token count: [número]
  - HTML generado correctamente: sí/no
  - Sample output: [primeras 100 chars]
```

---

## MÓDULO 3 — Error handler → Gemini fallback

**Acción:** si Claude falla, caer a Gemini (free tier).

### Configuración:

1. **Click derecho** sobre Módulo 2 (Claude) → **Add error handler** → **Resume**
2. El error handler abre una ruta separada cuando Claude falla
3. En esa ruta, click **+** → **HTTP** → **Make a request**

**URL:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=[GEMINI_KEY_AQUI]
```

Reemplaza `[GEMINI_KEY_AQUI]` con la key de Gemini que el usuario provea (o crea en https://aistudio.google.com/apikey).

**Method:** POST

**Headers:**
| Name | Value |
|---|---|
| `content-type` | `application/json` |

**Body type:** Raw → JSON

**Request content:**

```json
{
  "system_instruction": {
    "parts": [{ "text": "Eres el analista senior de AgentesVA... [PEGA EL MISMO SYSTEM PROMPT DEL MÓDULO 2]" }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{
        "text": "Genera el diagnóstico para este lead:\n\nNombre: {{1.properties.firstname}}\nIndustria: {{1.properties.industria_agentesva}}\nTamaño equipo: {{1.properties.tamano_equipo}}\nHerramientas: {{1.properties.herramientas_actuales}}\nDolor: {{1.properties.dolor_principal}}\nPresupuesto: {{1.properties.presupuesto_rango}}"
      }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1500
  }
}
```

**Parse response:** ✅ Yes

### Reporte Módulo 3:
```
M3 Gemini fallback: ✅ / 🔴
  - Configurado como error handler de M2: sí/no
  - Gemini key añadida: sí/no
  - Test funcional: (lo validaremos al final simulando error Claude)
```

---

## MÓDULO 4 — Set variable (normalizar output Claude o Gemini)

**Acción:** crear una variable "diagnostic_html" con el output de Claude si funcionó, o Gemini si falló.

### Configuración:

**Opción A (mejor):** usar módulo **Set variable** de Make.

1. Después de Módulo 2 (y también después del error handler Gemini), click **+** → **Flow Control** → **Set variable**
2. **Variable name:** `diagnostic_html`
3. **Variable value:** en la ruta Claude, mapear `{{2.data.content[0].text}}`. En la ruta Gemini, mapear `{{3.data.candidates[0].content.parts[0].text}}`.

**Opción B (simpler):** no uses Set variable, en módulo 5 usa directamente el output del módulo que haya corrido.

Si la estructura de error handlers de Make lo permite, prefiero **Opción A** porque simplifica el módulo 5.

### Reporte Módulo 4:
```
M4 Variable setter: ✅ / 🔴 / skipped (si usas opción B)
```

---

## MÓDULO 5 — Text merge: email template

**Acción:** inserta el HTML de Claude/Gemini en la plantilla de email con branding AgentesVA.

### Configuración:

1. Click **+** después de Módulo 4
2. Busca **Tools** → **Compose a string**
3. **Content:** pega TODO el HTML de abajo (plantilla del email), reemplazando las variables:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tu diagnóstico — AgentesVA</title>
</head>
<body style="margin:0;padding:0;background:#fbf8ff;font-family:Inter,Arial,sans-serif;color:#151a33;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf8ff;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,48,198,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0030c6 0%,#1e47f1 100%);padding:32px 32px 28px;text-align:left;">
        <div style="color:#ffffff;font-family:Manrope,Arial,sans-serif;font-weight:900;font-size:22px;letter-spacing:-0.02em;">Agentes<span style="color:#b4c2ff;">VA</span></div>
        <div style="color:#b4c2ff;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">Diagnóstico personalizado</div>
      </td></tr>
      <tr><td style="padding:32px 32px 8px;">
        <h1 style="font-family:Manrope,Arial,sans-serif;font-size:24px;font-weight:800;color:#151a33;margin:0 0 16px;">Hola {{1.properties.firstname}},</h1>
        <p style="font-size:15px;color:#444656;margin:0 0 20px;">Gracias por completar el diagnóstico de AgentesVA. Aquí tienes el análisis personalizado que preparamos para tu caso:</p>
      </td></tr>
      <tr><td style="padding:0 32px 16px;font-size:14px;color:#151a33;line-height:1.65;">{{4.diagnostic_html}}</td></tr>
      <tr><td style="padding:8px 32px 32px;text-align:center;">
        <a href="https://calendly.com/fangaiala/auditoria-gratis-agentesva-30-min" style="display:inline-block;background:linear-gradient(135deg,#0030c6,#1e47f1);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:700;font-size:15px;font-family:Manrope,Arial,sans-serif;">Reservar auditoría completa gratis →</a>
        <p style="font-size:12px;color:#676c82;margin:12px 0 0;">30 min · Sin compromiso · Incluye PDF personalizado al final</p>
      </td></tr>
      <tr><td style="background:#fbf8ff;padding:24px 32px;font-size:12px;color:#676c82;border-top:1px solid #ececff;">
        <p style="margin:0 0 8px;"><strong style="color:#0030c6;">AgentesVA</strong> — Automatización con IA para PyMEs en España y Latinoamérica.</p>
        <p style="margin:0 0 8px;">Este email se envió a {{1.properties.email}} porque completaste el diagnóstico en agentesva.com/diagnostico/</p>
        <p style="margin:0;"><a href="https://agentesva.com" style="color:#1e47f1;text-decoration:none;">agentesva.com</a> · <a href="mailto:hola@agentesva.com" style="color:#1e47f1;text-decoration:none;">hola@agentesva.com</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
```

Cambia los tres mapeos:
- `{{1.properties.firstname}}` → arrastra desde Módulo 1 el campo `firstname`
- `{{1.properties.email}}` → arrastra desde Módulo 1 el campo `email`
- `{{4.diagnostic_html}}` → arrastra desde Módulo 4 (o directamente del Módulo 2 si saltaste M4)

4. Click **OK**

### Reporte Módulo 5:
```
M5 Template merge: ✅ / 🔴
  - HTML generado: ~3-4KB
  - Variables mapeadas: firstname/email/diagnostic_html
```

---

## MÓDULO 6 — Resend: enviar email

**Acción:** POST a Resend API para enviar el email al lead.

### Configuración:

1. Click **+** después de Módulo 5
2. Busca **HTTP** → **Make a request**

**URL:** `https://api.resend.com/emails`

**Method:** POST

**Headers:**
| Name | Value |
|---|---|
| `Authorization` | `Bearer [RESEND_API_KEY]` (pegar key completa del usuario) |
| `Content-Type` | `application/json` |

**Body type:** Raw → JSON

**Request content:**

```json
{
  "from": "AgentesVA <hola@agentesva.com>",
  "to": ["{{1.properties.email}}"],
  "subject": "Tu diagnóstico de automatización — AgentesVA",
  "html": "{{5.text}}"
}
```

Nota: `{{5.text}}` es el output del módulo 5 (compose a string). Si el campo se llama distinto en tu versión de Make, usa el mapping correcto.

**Parse response:** ✅ Yes

### Validación:

1. **Run once** el scenario completo
2. Módulo 6 debe devolver status 200 + un `id` (Resend email ID)
3. Verifica en Resend dashboard → **Emails** que aparezca el envío
4. Revisa tu inbox (el email de prueba que usaste) → debe llegar el email con branding en <30 seg

### Reporte Módulo 6:
```
M6 Resend send: ✅ / 🔴
  - Status code: 200
  - Email ID: [res_xxx]
  - Email recibido en inbox: sí/no
  - Branding OK: sí/no
```

---

## MÓDULO 7 — HubSpot: update contact con lead_score + nota

**Acción:** actualizar el contacto HubSpot con el score y guardar el diagnóstico como nota.

### Configuración:

1. Click **+** después de Módulo 6
2. Busca **HubSpot CRM** → **Update a contact**
3. **Connection:** `HubSpot AgentesVA`
4. **Contact ID:** mapear `{{1.contactId}}` (del módulo trigger)
5. **Properties to update:**
   - `lead_score_agentesva`: usa fórmula Make para calcular score. Sintaxis Make:
     ```
     {{if(1.properties.presupuesto_rango = "gt_5000"; 10; if(1.properties.presupuesto_rango = "1500_5000"; 8; if(1.properties.presupuesto_rango = "500_1500"; 5; if(1.properties.presupuesto_rango = "lt_500"; 2; 4))))}}
     ```

6. (Opcional bonus) Añadir otro módulo **HubSpot** → **Create an engagement** (Note) con el HTML del diagnóstico para que quede guardado en el contacto.

### Reporte Módulo 7:
```
M7 HubSpot update: ✅ / 🔴
  - Contact actualizado: sí/no
  - Lead score calculado: [número]
  - Nota con diagnóstico guardada: sí/no/skipped
```

---

## ACTIVACIÓN DEL SCENARIO

Cuando los 7 módulos funcionen en "Run once":

1. Click el botón **Scheduling** (parte inferior izquierda del editor)
2. **Scheduling:** `Immediately` (webhook-like, dispara al instante porque HubSpot "Watch form submissions" soporta realtime con plan Core)
3. **On/Off:** activar (toggle ON)
4. Confirma en el header del scenario que está "Active"

---

## TEST END-TO-END FINAL

1. En una pestaña: https://agentesva.com/diagnostico/
2. Completa el quiz con datos de prueba (email = tu Gmail personal)
3. Submit → pantalla de éxito
4. Espera 30-60 segundos
5. Verifica:
   - ✅ Contacto nuevo en HubSpot con todas las propiedades
   - ✅ Contacto tiene `lead_score_agentesva` calculado
   - ✅ Tu inbox recibió email con branding AgentesVA + diagnóstico personalizado de Claude
   - ✅ Make scenario muestra la ejecución completa en verde

---

## REPORTE FINAL

```
═══════════════════════════════════════════
SCENARIO MAKE.COM — BUILD COMPLETADO
═══════════════════════════════════════════

Nombre: AgentesVA - Diagnóstico Auto-Email
Status: ACTIVO / INACTIVO

Módulos (7):
  M1 HubSpot trigger:     ✅ / 🔴
  M2 Claude HTTP:         ✅ / 🔴
  M3 Gemini fallback:     ✅ / 🔴
  M4 Variable setter:     ✅ / 🔴 / skipped
  M5 Template merge:      ✅ / 🔴
  M6 Resend send:         ✅ / 🔴
  M7 HubSpot update:      ✅ / 🔴

Test end-to-end:
  - Quiz submitted: sí
  - Email recibido: sí/no
  - Tiempo desde submit hasta email: [X seg]
  - Contacto HubSpot actualizado: sí/no

Ops consumidas por lead: ~6-7 operations
Capacidad con plan Core: ~1.400-1.600 leads/mes

BLOQUEADORES PENDIENTES: [ninguno o lista]

═══════════════════════════════════════════
```

---

**Ejecuta ahora. Construye módulo por módulo. Reporta al final.**

Si en algún módulo necesitas una API key o una configuración específica que no está en este prompt, **para y pregunta al usuario**. No inventes.
