# TASK: Crear 3 Product Demos para AgentesVA
**Asignado a**: Video Producer / Designer
**Estimado**: 4-8 horas (2-3h por demo)
**Deadline**: Antes del launch 2026-04-15
**Herramientas**: Loom / ScreenFlow / OBS + Make.com

---

## CONTEXTO

El catálogo vende 42 agentes IA que corren en Make.com.
Sin demos en video, la conversión estimada es <2%.
Con demos: conversión esperada >5-8%.

**3 demos a crear** (en orden de prioridad):
1. Agente de Bienvenida (id:9)
2. Clasificador de Leads (id:7)
3. Agente Soporte FAQ (id:33)

---

## ESTÁNDARES DE CALIDAD (TODOS LOS DEMOS)

| Requisito | Spec |
|-----------|------|
| Duración | 30-60 segundos |
| Formato exportar | MP4 + GIF animado |
| Peso MP4 | < 50MB |
| Peso GIF | < 5MB |
| Subtítulos | Sí, en español |
| Audio | Sin ruido de fondo, voz clara o mudo con texto |
| Resolución | 1280x720 mínimo |
| Intro | 0-2s — mostrar nombre del agente |
| Ritmo | Corte cada 3-5s — sin tiempo muerto |

---

## DEMO 1: Agente de Bienvenida ⭐ (Empezar aquí)
**Duración objetivo**: 45 segundos
**Agente ID**: 9 | **Precio**: $29

### Historia a mostrar
> Un restaurante recibe un mensaje de WhatsApp a las 11 PM.
> El dueño está durmiendo. El agente responde solo.

### Guión de pantalla (qué grabar)

**[0-5s] Pantalla: WhatsApp o teléfono**
- Mostrar mensaje entrante: *"Hola, ¿tienen mesa disponible para 4 personas el sábado?"*
- Texto en pantalla: "11:47 PM — dueño dormido"

**[5-15s] Pantalla: Make.com — el escenario corriendo**
- El webhook recibe el mensaje
- Mostrar el flujo: Trigger → OpenAI → WhatsApp Business
- Destacar que todo ocurre en segundos (resaltar el reloj o timestamp)

**[15-30s] Pantalla: Respuesta enviada en WhatsApp**
- Mostrar la respuesta automática: *"¡Hola! Sí tenemos disponibilidad el sábado. ¿Prefieres las 7 PM u 8 PM? Te confirmo en un momento 😊"*
- Texto en pantalla: "Respondido en 8 segundos"

**[30-45s] Pantalla: Google Sheet o CRM**
- Mostrar que el contacto fue capturado: nombre, número, fecha de interés
- Texto final en pantalla: **"Ahorra 5 horas/semana en atención. $29 — pago único."**
- Fade out con logo AgentesVA

### Texto para subtítulos
```
0:00 - Son las 11 PM.
0:03 - Un cliente pregunta por mesa.
0:08 - El agente de bienvenida responde solo.
0:15 - Captura el contacto automáticamente.
0:30 - Sin que toques el teléfono.
0:40 - 5 horas/semana ahorradas. $29 pago único.
```

---

## DEMO 2: Clasificador de Leads
**Duración objetivo**: 40 segundos
**Agente ID**: 7 | **Precio**: $0 (gratis)

### Historia a mostrar
> Una agencia recibe 50 formularios esta semana.
> Sin el agente: 3 horas clasificando a mano.
> Con el agente: automático en segundos.

### Guión de pantalla

**[0-8s] Pantalla: Google Sheets o email — caos de leads**
- Mostrar hoja llena de filas sin clasificar
- Texto: "50 leads sin clasificar — ¿por dónde empiezo?"

**[8-20s] Pantalla: Make.com corriendo**
- El agente analiza cada lead (email o form)
- GPT-4o asigna score: 🔥 Caliente / ⚠️ Tibio / ❄️ Frío
- Mostrar JSON de respuesta brevemente (solo 1-2 segundos)

**[20-35s] Pantalla: Google Sheet — resultado**
- Leads ahora ordenados por columna "PRIORIDAD"
- Top 5 en verde (calientes), resto en amarillo/gris
- Texto: "50 leads clasificados en 40 segundos"

**[35-40s] Pantalla: cierre**
- Texto: **"Gratis. Empieza hoy."**
- CTA: agentesva.com/catalogo

---

## DEMO 3: Agente Soporte FAQ
**Duración objetivo**: 50 segundos
**Agente ID**: 33 | **Precio**: $97

### Historia a mostrar
> Cliente escribe la misma pregunta que 30 personas preguntaron antes.
> Sin el agente: el equipo responde manualmente.
> Con el agente: respuesta personalizada en segundos, 24/7.

### Guión de pantalla

**[0-8s] Pantalla: Inbox de email o chat**
- Mostrar pregunta: *"¿Cuánto tarda en llegar mi pedido?"*
- Contador en esquina: "Pregunta #847 este mes"

**[8-20s] Pantalla: Make.com**
- Webhook recibe la pregunta
- Búsqueda en Knowledge Base (Google Sheet o Notion)
- GPT-4o genera respuesta personalizada
- Resaltar: < 3 segundos de procesamiento

**[20-38s] Pantalla: Respuesta enviada**
- Respuesta completa y personalizada: menciona nombre del cliente, detalla el tiempo de entrega, ofrece tracking link
- Texto: "75% de tickets resueltos sin intervención humana"

**[38-50s] Pantalla: Dashboard o métricas**
- Mostrar: tickets resueltos esta semana vs semana anterior
- Texto final: **"Tu equipo solo atiende lo que importa. $97 — pago único."**

---

## PROCESO DE PRODUCCIÓN

### Antes de grabar
- [ ] Tener Make.com activo con el agente corriendo (no en modo test)
- [ ] Preparar datos de prueba realistas (nombres reales, mensajes reales)
- [ ] Limpiar pantalla — cerrar apps innecesarias, notificaciones off
- [ ] Resolución pantalla: 1280x720 o 1920x1080
- [ ] Audio: silencio ambiental o música de fondo suave (sin hablar está bien)

### Herramienta recomendada
**Loom** (más fácil): loom.com — gratis, captura pantalla + cámara
**OBS** (más control): obsproject.com — gratis, exporta MP4 directamente
**ScreenFlow** (Mac, mejor calidad): $149 — edición integrada

### Edición
- [ ] Cortar tiempo muerto (loading, esperas)
- [ ] Acelerar secciones lentas (x2 está bien para Make.com procesando)
- [ ] Agregar texto en pantalla con los mensajes clave
- [ ] Agregar subtítulos (Loom los genera automático, o usar CapCut gratis)
- [ ] Exportar MP4 < 50MB

### Convertir a GIF
```bash
# Con ffmpeg (gratis):
ffmpeg -i demo1.mp4 -vf "fps=12,scale=640:-1" -loop 0 demo1.gif

# O usar: ezgif.com (online, gratis)
```

### Dónde insertar en el sitio
Los GIFs van en `catalogo/index.html`, dentro de cada card de agente.
Enviárselos al CTO con el nombre exacto del agente (ej: `demo-bienvenida.gif`).

---

## FALLBACK (si no hay tiempo para video)

Si no alcanza el tiempo, usar **screenshots del flujo** con flechas:
1. Screenshot de Make.com con el escenario
2. Screenshot del mensaje/respuesta final
3. Unirlos en Canva con texto encima
4. Exportar como imagen estática JPG

Es mejor que nada y se puede mejorar post-launch.

---

## ENTREGABLES

Al terminar, subir archivos a carpeta compartida y avisar en Slack:
```
✅ Demo 1 — Agente Bienvenida: demo-bienvenida.mp4 + demo-bienvenida.gif
✅ Demo 2 — Clasificador Leads: demo-clasificador.mp4 + demo-clasificador.gif
✅ Demo 3 — Soporte FAQ: demo-soporte.mp4 + demo-soporte.gif

📐 Tamaños:
- demo-bienvenida.mp4: XXmb | .gif: XXmb
- demo-clasificador.mp4: XXmb | .gif: XXmb
- demo-soporte.mp4: XXmb | .gif: XXmb

✅ Revisados en mobile (iPhone Safari)
✅ Subtítulos sincronizados
```

---

**¿Dudas?** Slack #agentesva-deploy o ver ejemplos de referencia:
- Zapier demo style: rápido, sin audio, texto en pantalla
- Make.com tutorials: enfocados en el flujo
- Objetivo: mostrar el RESULTADO, no la configuración técnica
