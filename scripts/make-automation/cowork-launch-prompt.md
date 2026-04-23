# Prompt para Claude Cowork — Setup end-to-end para lanzar automation AgentesVA

Copia y pega este prompt completo a Claude Cowork (o cualquier instancia con acceso a navegador web).

---

## PROMPT

Eres un ingeniero de operaciones senior. Tu misión: ejecutar el setup técnico de 4 cuentas SaaS para dejar operativa la automatización **HubSpot → Claude → Resend → email** del proyecto AgentesVA (agentesva.com).

Al final, un lead que complete el quiz en `agentesva.com/diagnostico/` recibirá un email personalizado generado por IA en menos de 30 segundos.

**Reglas de trabajo:**

1. **Trabaja tarea por tarea en el orden listado.** La tarea 1 (Resend DNS) es bloqueante porque DNS tarda 5-30 min en propagar — arranca esa primero y avanza en paralelo con las demás mientras propaga.
2. **Pide credenciales al usuario cuando las necesites.** No las inventes.
3. **NUNCA expongas API keys o tokens completos en tus respuestas.** Solo reporta primeros 8 caracteres + últimos 4 para confirmar que existen. Las keys completas las guarda el usuario en su gestor de contraseñas.
4. **Reporta progreso después de cada tarea** con formato: ✅ listo / ⚠️ parcial / 🔴 bloqueado + qué falta.
5. **Si te atascas, para y pregunta.** No inventes.
6. **Al final entrega un reporte ejecutivo** con estado de las 4 cuentas y qué puedo hacer yo ya.

---

## CONTEXTO DEL PROYECTO

**AgentesVA** es una consultora de automatización IA para PyMEs en España y LATAM.

**Stack ya montado (NO tocar):**
- Sitio web en Vercel: agentesva.com
- Dominio + DNS en Cloudflare
- Cloudflare Email Routing → `hola@agentesva.com` forwarding a Gmail personal
- HubSpot CRM Free con form "Diagnóstico AgentesVA" (Portal ID `148323903`, Form GUID `6a283564-7cb8-46a6-a812-76101a686d41`)
- 6 custom properties creadas
- Make.com plan Core €9/mes (región EU) con conexión Claude activa

**Stack pendiente de montar (lo que haces TÚ en este prompt):**
- Resend para envío de emails desde `hola@agentesva.com`
- Claude auto-reload + API key dedicada AgentesVA
- HubSpot OAuth connection en Make.com
- Cleanup de 9 scenarios Make legacy

---

## TAREA 1 — Resend: añadir dominio, DNS, API key (15-20 min setup + 5-30 min propagación)

### 1.1 Pide al usuario:
- Credenciales login a https://resend.com
- Credenciales login a Cloudflare (o acceso al workspace de agentesva.com)

### 1.2 En Resend dashboard:
1. **Domains** → **Add Domain** → introduce `agentesva.com`
2. Región: `eu-west-1` (servidores Europa, mejor compliance + latencia)
3. Resend te mostrará entre 3 y 5 registros DNS para añadir:
   - 1 registro **MX** (dominio `send.agentesva.com` probablemente)
   - 1 registro **TXT** tipo SPF (ej: `v=spf1 include:amazonses.com ~all`)
   - 1-2 registros **TXT** tipo DKIM (nombres tipo `resend._domainkey` + `resend2._domainkey`)
   - Opcionalmente 1 registro **TXT** DMARC
4. Copia TODOS esos records exactamente como los muestra Resend

### 1.3 En Cloudflare DNS:
1. Navega a Cloudflare → agentesva.com → **DNS** → **Records**
2. Añade CADA uno de los records que Resend mostró:
   - **Type:** MX / TXT según corresponda
   - **Name:** exactamente como Resend indica
   - **Content:** exactamente como Resend indica (sin comillas extras, copiar pegar literal)
   - **Proxy status:** 🔴 CRÍTICO — **"DNS only" (nube GRIS)**, NUNCA proxied (naranja). Los records de email no pueden ir proxied.
   - **TTL:** Auto
3. Verifica que NO tocas los registros existentes (A apuntando a Vercel, CNAME www, los MX de Email Routing de Cloudflare). Solo AÑADES los de Resend.
4. Captura pantalla de la tabla de DNS final como evidencia

**⚠️ IMPORTANTE sobre conflicto MX:** Cloudflare Email Routing ya tiene registros MX para recibir email. Resend añade un subdominio `send.agentesva.com` (distinto del root), no debería haber conflicto. Pero si Resend pide MX para el root `@`, **NO lo añadas sin preguntar al usuario primero** — rompería Email Routing.

### 1.4 Volver a Resend:
1. En la vista del dominio → **Verify DNS records**
2. Esperar entre 5 y 30 min. Ir haciendo otras tareas mientras.
3. Cuando el status del dominio cambie a **Verified** ✅, continuar

### 1.5 Crear API key:
1. Resend → **API Keys** → **Create API Key**
2. Name: `AgentesVA Make.com`
3. Permission: **Sending access** (no Full access)
4. Domain: `agentesva.com`
5. Click Create → Resend muestra la key UNA sola vez
6. El usuario copia la key a su gestor de contraseñas
7. **NO pegues la key completa en el reporte.** Solo confirma: "Key creada, prefijo `re_xxx...`, guardada por usuario en [gestor]"

### 1.6 Reporta:
```
TAREA 1 — Resend
  - Dominio agentesva.com: ✅ verified / ⚠️ pending / 🔴 error
  - DNS records añadidos: [lista]
  - Conflictos DNS con Email Routing: sí/no
  - API key "AgentesVA Make.com" creada: sí/no
  - From address disponible: hola@agentesva.com
  - Bloqueadores: [ninguno o lista]
```

---

## TAREA 2 — Anthropic Console: auto-reload + API key dedicada (3 min)

### 2.1 Pide al usuario:
- Credenciales login a https://console.anthropic.com

### 2.2 Activar auto-reload:
1. Settings → **Billing**
2. Auto reload toggle → **ON**
3. Configuración:
   - **Reload amount:** $20
   - **When balance drops below:** $5
4. Tarjeta asociada: verificar que la Mastercard ••••3343 sigue activa
5. Save

### 2.3 Crear API key dedicada:
1. **API Keys** → **Create Key**
2. Name: `AgentesVA Production`
3. Workspace: Default (o crea uno nuevo llamado `AgentesVA` si el tier lo permite)
4. Copia la key → usuario la guarda en gestor de contraseñas
5. **NO pegues la key completa.** Solo prefijo + sufijo.

### 2.4 Reporta:
```
TAREA 2 — Anthropic
  - Auto-reload: ✅ activo ($20 cuando baja de $5)
  - Tarjeta: ✅ Mastercard ••••3343
  - API key "AgentesVA Production" creada: sí/no (prefijo sk-ant-xxx...suffix)
  - Usuario confirmó guardado en gestor: sí/no
```

---

## TAREA 3 — Make.com: conexión HubSpot + cleanup (10 min)

### 3.1 Pide al usuario:
- Acceso a https://eu1.make.com (región Europa)
- Confirmación de que quiere borrar los 9 scenarios legacy (ver lista abajo)

### 3.2 Crear conexión HubSpot:
1. Make dashboard → **Connections** (menú lateral)
2. **Add** → busca "HubSpot CRM"
3. Name: `HubSpot AgentesVA`
4. Autoriza vía OAuth usando la cuenta HubSpot del usuario (Portal ID `148323903`)
5. Confirma que la conexión queda en estado verde

### 3.3 Cleanup scenarios legacy (confirmar con usuario antes):
Scenarios a **BORRAR** (del modelo de precios viejo AgentesVA v1):
- AgentesVA - Agente de Bienvenida v1
- AgentesVA - Agente de Reactivación v1
- AgentesVA - Agente de Soporte FAQ v1
- AgentesVA - Asistente de Cotizaciones v1
- AgentesVA - Clasificador de Correos v1 (tiene alerta activa — probable OAuth caducado)
- AgentesVA - Clasificador de Leads Inmobiliarios v1
- AgentesVA - Colector de Reseñas Google v1
- AgentesVA - Generador de Contenido Semanal v1
- AgentesVA - Recordatorio de Citas v1

Scenarios a **CONSERVAR** (no relacionados con AgentesVA):
- Cobrador — Recordatorio 1 (Día 3)
- Cobrador — Recordatorio 2 (Día 7)
- LinkBuilderAgent — Daily Cron for fernandoangulo.com

### 3.4 Reporta:
```
TAREA 3 — Make.com
  - HubSpot connection "HubSpot AgentesVA": ✅ verde / ⚠️ error
  - Scenarios eliminados: [N/9]
  - Scenarios conservados: 3 (Cobrador x2 + LinkBuilder)
  - Workspace limpio para construir nuevo scenario: sí/no
```

---

## TAREA 4 — Verificaciones finales (5 min)

### 4.1 Email Routing Cloudflare:
1. Cloudflare → agentesva.com → **Email** → **Email Routing**
2. Verifica:
   - Status: ✅ Active
   - Regla `hola@agentesva.com` → Gmail usuario: activa y verificada
3. Test rápido (si el usuario acepta): envía email desde Gmail al `hola@agentesva.com` y confirma que llega de vuelta al Gmail en <30 seg.

### 4.2 HubSpot Private App token (ROTAR):
Contexto: el token actual pasó por un chat externo hace unas horas. Aunque el scope es limitado (solo write), buena práctica rotarlo.

1. Navega a https://app-eu1.hubspot.com/private-apps/148323903/37349989
2. Tab **Auth** → **Rotate token**
3. Usuario guarda el nuevo token en gestor de contraseñas
4. El token viejo queda invalidado

### 4.3 Test quiz → HubSpot (opcional pero recomendado):
1. El usuario completa quiz en https://agentesva.com/diagnostico/ con datos de prueba
2. Verifica en HubSpot → Contacts que el nuevo contacto aparece con todas las 5 propiedades rellenadas
3. Si falta alguna propiedad → reportar al usuario

### 4.4 Reporta:
```
TAREA 4 — Verificaciones
  - Cloudflare Email Routing activo: sí/no
  - Test email hola@agentesva.com: ✅ llega / ⚠️ delay / 🔴 no llega
  - HubSpot Private App token rotado: sí/no
  - Quiz → HubSpot contact flujo: ✅ funciona / 🔴 roto
```

---

## REPORTE FINAL (entrégalo cuando termines todas las tareas)

Al final de tu sesión, pega al usuario UN bloque resumen con este formato exacto:

```
═══════════════════════════════════════════
REPORTE FINAL — SETUP AGENTESVA AUTOMATION
═══════════════════════════════════════════

CUENTAS LISTAS PARA MAKE SCENARIO:
  ✅/🔴 Resend:      dominio verified, API key creada
  ✅/🔴 Anthropic:   auto-reload ON, API key dedicada
  ✅/🔴 Make:        HubSpot connection verde, workspace limpio
  ✅/🔴 Cloudflare:  Email Routing activo, hola@ funciona
  ✅/🔴 HubSpot:     token rotado, quiz→contact verificado

CREDENCIALES GUARDADAS POR EL USUARIO (NO pegar aquí, solo confirmar):
  - Resend API key "AgentesVA Make.com" → gestor de contraseñas
  - Anthropic API key "AgentesVA Production" → gestor de contraseñas
  - HubSpot Private App token (rotado) → gestor de contraseñas

BLOQUEADORES PENDIENTES:
  [lista si hay, o "ninguno"]

SIGUIENTE PASO PARA EL DEV (Claude Code session):
  Construir Make.com scenario siguiendo scripts/make-automation/SETUP.md
  Módulos 1-7 documentados, tiempo estimado 45-60 min

═══════════════════════════════════════════
```

---

## LÍMITES DE TU AUTORIDAD

- ❌ NO compres planes adicionales sin confirmación explícita (Resend Pro, HubSpot Starter, Claude Scale).
- ❌ NO cambies DNS existentes (solo AÑADES los nuevos de Resend).
- ❌ NO borres archivos ni datos fuera del cleanup de 9 scenarios Make autorizado.
- ❌ NO publiques emails de prueba al mundo — todas las pruebas van a Gmail del usuario.
- ✅ SÍ pides credenciales cuando las necesites.
- ✅ SÍ pausas si ves algo raro y preguntas antes de actuar.

**Ejecuta ahora, tarea por tarea. Reporta después de cada una. Entrega el reporte final al terminar.**
