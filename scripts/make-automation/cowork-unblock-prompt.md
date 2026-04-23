# Prompt Cowork — UNBLOCK final para lanzar scenario AgentesVA

Copia y pega este prompt completo a Claude Cowork. Es un prompt de ejecución quirúrgica. El audit ya se hizo, ahora solo arreglamos 3 problemas concretos en orden.

---

## PROMPT

Eres un ingeniero de operaciones. Tu misión: **desbloquear 3 items concretos** para que podamos lanzar el scenario Make.com del proyecto AgentesVA. El audit ya se hizo — esto es solo fix quirúrgico.

**Reglas:**
1. Trabaja en orden estricto (Resend DKIM primero, bloqueante para el resto del flujo).
2. Pide credenciales al usuario cuando necesites acceso.
3. NUNCA pegues API keys completas en el chat. Solo prefijo/sufijo para confirmar.
4. Si algo raro aparece, para y pregunta.
5. Al final entrega reporte con formato fijo (ver abajo).

---

## PROBLEMA 1 — Resend DKIM inválido (BLOQUEANTE)

### Diagnóstico actual
- Dominio `agentesva.com` añadido en Resend (región `eu-west-1`)
- DKIM record `resend._domainkey` → Cloudflare marca error "Invalid DKIM: The record value is incorrect"
- SPF y MX para `send` subdomain parecen OK
- DMARC no configurado

### Pasos de fix

**Fase A — Obtener el valor correcto de DKIM desde Resend:**

1. Login en https://resend.com
2. **Domains** → click `agentesva.com`
3. Tab **DNS records** o similar
4. Identifica el record DKIM — formato:
   - Type: TXT
   - Name: `resend._domainkey` (sin `.agentesva.com`, solo la parte relativa)
   - Value: una cadena larga que empieza con `p=MIGfMA0GCSqG...` (empieza con `p=M`, NO con `v=DKIM1`)
5. Haz **click en el icono de copiar** del valor (NO selecciones con mouse — copy button garantiza no romper caracteres)

**Fase B — Reemplazar el record en Cloudflare:**

1. Login en Cloudflare → agentesva.com → **DNS** → **Records**
2. Busca el record TXT con name `resend._domainkey`
3. **Click Edit**
4. **BORRA TODO** el contenido del campo Content
5. **Pega** el valor nuevo copiado de Resend
6. Verifica visualmente:
   - NO hay comillas `"..."` envolviendo el valor (Cloudflare las añade automáticamente si las pones tú)
   - NO hay saltos de línea
   - Empieza con `p=M...`
   - Longitud aproximada: 200-400 caracteres
7. **Proxy status:** 🔴 DNS only (nube GRIS), nunca proxied
8. **TTL:** Auto
9. Save

**Fase C — Verificar en Resend:**

1. Volver a Resend → Domains → agentesva.com
2. Click botón **Verify DNS records** (o "Restart" / "Recheck")
3. Esperar 2-5 min (la TTL en Cloudflare es rápida)
4. Status debería pasar a **Verified** ✅

**Fase D — Si sigue fallando:**

Diagnóstico alternativo: el valor DKIM puede estar llegando partido en múltiples líneas porque supera 255 caracteres (límite de TXT strings). Solución:

- Cloudflare maneja esto automáticamente si pegas el string completo sin comillas
- Si Resend te da el valor YA partido con comillas `"parte1" "parte2"`, pega así literal en Cloudflare (incluye las comillas como separador)
- También verifica con: `dig TXT resend._domainkey.agentesva.com @1.1.1.1` desde cualquier terminal para ver cómo está realmente propagado

Si tras 2 intentos sigue "Invalid DKIM", pide al usuario: screenshot de Resend DNS records view + screenshot del edit en Cloudflare.

### ❓ Si el usuario tiene dudas sobre MX conflict

Cloudflare Email Routing ya tiene registros MX para el ROOT (`agentesva.com`). Resend usa el subdominio `send.agentesva.com` para MX de bounce. Son records DISTINTOS (nombres distintos), NO hay conflicto. Si Cloudflare detecta algún conflicto visual, es warning visual, no real.

---

## PROBLEMA 2 — Activar auto-reload Claude (2 min)

Contexto: $4.55 actual. Suficiente para testing pero en prod puede agotarse.

### Pasos

1. Login en https://console.anthropic.com
2. **Settings** → **Billing**
3. Buscar sección **Auto reload** o **Automatic billing**
4. Toggle: **ON**
5. Configuración:
   - **Reload amount:** $20
   - **When balance drops below:** $5
6. Payment method: confirmar Mastercard ••••3343
7. Save

**Verificar:** la key "AgentesVA" (creada 23 abril) aparece en API Keys listada, con "Never used" — esa es la que conectaremos a Make.

---

## PROBLEMA 3 — Crear conexión HubSpot en Make.com (2 min)

### Pasos

1. Login en https://eu1.make.com
2. **Connections** (menú lateral)
3. Click **+ Add**
4. Busca **HubSpot CRM**
5. Name: `HubSpot AgentesVA`
6. Click **Save** → se abre popup OAuth HubSpot
7. Login HubSpot usando la cuenta con Portal ID `148323903`
8. Autoriza los scopes que Make pida
9. Confirmar que la conexión queda con status **verde**

---

## BONUS (opcional, 5 min) — Cleanup scenarios legacy

Si el usuario lo autoriza, borra los 9 scenarios v1 que ya no aplican al nuevo modelo:

Scenarios a BORRAR:
- AgentesVA - Agente de Bienvenida v1
- AgentesVA - Agente de Reactivación v1
- AgentesVA - Agente de Soporte FAQ v1
- AgentesVA - Asistente de Cotizaciones v1
- AgentesVA - Clasificador de Correos v1
- AgentesVA - Clasificador de Leads Inmobiliarios v1
- AgentesVA - Colector de Reseñas Google v1
- AgentesVA - Generador de Contenido Semanal v1
- AgentesVA - Recordatorio de Citas v1

Scenarios a CONSERVAR:
- Cobrador — Recordatorio 1 (Día 3)
- Cobrador — Recordatorio 2 (Día 7)
- LinkBuilderAgent — Daily Cron for fernandoangulo.com

---

## REPORTE FINAL

Cuando termines, entrega este bloque exacto:

```
═══════════════════════════════════════════
REPORTE UNBLOCK — AGENTESVA
═══════════════════════════════════════════

P1 Resend DKIM:
  - Status dominio agentesva.com: ✅ Verified / 🔴 sigue Invalid
  - DKIM corregido: sí/no
  - SPF OK: sí/no
  - DMARC añadido: sí/no
  - Detalle del fix: [1-2 líneas qué cambiaste exactamente]

P2 Anthropic auto-reload:
  - Activado: sí/no
  - Threshold: $5 → reload $20 (Mastercard ••••3343)
  - Key "AgentesVA" lista: sí/no

P3 Make HubSpot connection:
  - Connection "HubSpot AgentesVA" creada: sí/no
  - Status: ✅ verde / ⚠️ error
  - Portal ID autorizado: 148323903 confirmado sí/no

Bonus cleanup Make:
  - 9 scenarios v1 borrados: sí/no/parcial

═══════════════════════════════════════════
TODO LISTO PARA CONSTRUIR SCENARIO: SÍ / NO
═══════════════════════════════════════════

Si NO, bloqueadores:
[lista]

═══════════════════════════════════════════
```

**Ejecuta ahora en orden. Reporta al terminar.**
