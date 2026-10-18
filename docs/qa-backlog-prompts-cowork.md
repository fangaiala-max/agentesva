# Prompts para el agente de navegador (cowork)

Tareas del backlog QA que **no son de código**: hay que entrar en paneles de
control, darse de alta en programas y recopilar datos. Cada bloque es un prompt
autónomo — cópialo entero, incluida la sección de contexto.

Orden recomendado: **P1 → P2 → P3**. El P1 desbloquea la medición de todo lo
demás; el P2 tarda semanas en aprobarse, así que cuanto antes se envíe, mejor.

Referencia: [`docs/qa-backlog-2026-08-03.md`](./qa-backlog-2026-08-03.md)

---

## P1 · AGV-01 — Crear la propiedad GA4 y conectarla a Vercel

> **Contexto**
> Soy el dueño de agentesva.com, un directorio de herramientas de IA en español
> alojado en Vercel (proyecto `agentesva`, repo `fangaiala-max/agentesva`).
> El sitio **no tiene analítica funcionando**. El código ya está escrito y
> cumple RGPD: hay un banner de consentimiento con Google Consent Mode v2 que
> solo se renderiza si existe la variable de entorno `PUBLIC_GA4_ID`. Esa
> variable no está definida en producción, así que ni sale el banner ni carga
> GA4. No hay que tocar código: solo crear la propiedad y poner la variable.
>
> **Lo que necesito que hagas**
>
> 1. Entra en Google Analytics (analytics.google.com) con mi cuenta.
> 2. Comprueba primero si ya existe una propiedad para agentesva.com. Si existe,
>    NO crees otra: dame su ID de medición y sigue en el paso 5.
> 3. Si no existe, crea una propiedad GA4:
>    - Nombre: `AgentesVA`
>    - Zona horaria: España (GMT+1/+2)
>    - Moneda: Euro (EUR)
>    - Sector: Internet y telecomunicaciones (o el más parecido)
> 4. Crea un flujo de datos **Web** para `https://agentesva.com`. Deja activada
>    la medición mejorada.
> 5. Copia el **ID de medición**, que tiene el formato `G-XXXXXXXXXX`.
> 6. Entra en vercel.com → proyecto `agentesva` → Settings → Environment Variables.
> 7. Añade una variable:
>    - Nombre: `PUBLIC_GA4_ID`
>    - Valor: el `G-XXXXXXXXXX` del paso 5
>    - Entornos: marca **Production**, **Preview** y **Development**
> 8. Ve a la pestaña Deployments y vuelve a desplegar el último despliegue de
>    producción (Redeploy). La variable solo entra en vigor con un build nuevo.
> 9. Cuando termine el despliegue, abre `https://agentesva.com` en una ventana
>    de incógnito y comprueba:
>    - Aparece el banner de cookies abajo.
>    - Si **rechazas**, en la pestaña Network NO debe haber ninguna petición a
>      `googletagmanager.com`.
>    - Si **aceptas**, sí debe aparecer esa petición.
>
> **Qué me tienes que devolver**
> - El ID de medición `G-XXXXXXXXXX`.
> - Captura del banner de cookies en producción.
> - Confirmación de las dos pruebas del paso 9 (rechazar y aceptar).
> - Si algo falla, dime en qué paso exacto y qué viste en pantalla.
>
> **Cuidado con esto**
> - No toques ninguna otra variable de entorno del proyecto.
> - No actives Google Signals ni la personalización de anuncios: el banner solo
>   informa de analítica, y activar publicidad incumpliría lo que declara.
> - Si te pide vincular Google Ads, sáltalo.

---

## P2 · AGV-17 — Altas en programas de afiliados

> **Contexto**
> Tengo un directorio de herramientas de IA en español, agentesva.com, dirigido
> a pymes de España y Latinoamérica. Ahora mismo el sitio manda ~39 clics de
> salida por cada 100 visitantes hacia las webs de esas herramientas, y **no
> gano nada** porque los enlaces no llevan parámetro de afiliado.
>
> La parte técnica ya está resuelta: cada herramienta tiene un campo
> `affiliateUrl` y el redirector lo usa automáticamente si está relleno. Lo que
> falta es darse de alta en los programas y conseguir los enlaces.
>
> **Datos del sitio para los formularios**
> - Web: `https://agentesva.com`
> - Tipo: directorio editorial / medio de contenidos sobre IA en español
> - Público: pymes y autónomos hispanohablantes (España + LATAM)
> - Modelo: reseñas y comparativas, tráfico orgánico de buscadores
> - Nombre del sitio: AgentesVA
>
> **Lo que necesito que hagas**
>
> Para cada herramienta de la lista, en este orden:
>
> 1. Busca si tiene programa de afiliados o de partners (prueba
>    `<herramienta> affiliate program` y mira también el pie de su web).
> 2. Si existe y acepta sitios de contenido, **completa la solicitud** con los
>    datos de arriba.
> 3. Anota en una tabla: herramienta · ¿tiene programa? · plataforma (Impact,
>    PartnerStack, Tapfiliate, propio…) · comisión ofrecida · estado (enviada /
>    aprobada / rechazada / no tiene) · enlace de afiliado si ya te lo dan.
>
> **Lista, por prioridad** (las primeras son las que más tráfico reciben):
> `Make` · `Zapier` · `ManyChat` · `Landbot` · `Tidio` · `Jasper` · `HubSpot` ·
> `Canva` · `Surfer SEO` · `Brevo` · `Mailchimp` · `Wati` · `Chatfuel` ·
> `Synthesia` · `HeyGen` · `Descript` · `ElevenLabs` · `Grammarly` · `DeepL` ·
> `Notion`
>
> **Qué me tienes que devolver**
> - La tabla completa, aunque muchas salgan como "no tiene programa".
> - Los enlaces de afiliado que ya estén activos, para poder meterlos ya.
> - Aviso de cuáles quedan pendientes de aprobación y el plazo que indiquen.
>
> **Cuidado con esto**
> - Si un programa exige tráfico mínimo o exclusividad, **no lo aceptes**:
>   anótalo y sigue.
> - No aceptes condiciones que obliguen a publicar contenido patrocinado sin
>   marcarlo — el sitio se vende como directorio independiente y eso lo rompe.
> - No uses la misma contraseña en las distintas plataformas.

---

## P3 · AGV-19 — Investigar precios reales de las 54 herramientas

> **Contexto**
> En agentesva.com cada herramienta tiene una ficha, pero en el precio solo pone
> "Gratis", "Freemium" o "Pago". Quien entra buscando decidir necesita saber
> cuánto cuesta de verdad. Necesito el dato real para poder ponerlo en las fichas.
>
> **Lo que necesito que hagas**
>
> Entra en la página de precios oficial de cada herramienta de la lista y anota:
>
> - Nombre de la herramienta
> - ¿Tiene plan gratis de verdad? (sí / no / solo prueba temporal)
> - Si es prueba temporal: cuántos días
> - Precio del plan de entrada, **en euros al mes**, facturación mensual
> - Precio del mismo plan con facturación anual (si lo hay)
> - Qué límite tiene el plan gratis, en una frase corta y concreta
>   (ej: "20 mensajes al día", "3 vídeos al mes")
> - URL exacta de la página de precios
> - Fecha en que lo has consultado
>
> **Lista** (las 54 de la web; empieza por estas 20, que son las más visitadas):
> `ChatGPT` · `Claude` · `Perplexity` · `Make` · `Zapier` · `Notion IA` ·
> `ManyChat` · `Landbot` · `HubSpot` · `Canva IA` · `Midjourney` ·
> `ElevenLabs` · `HeyGen` · `Gemini` · `Microsoft Copilot` · `DeepSeek` ·
> `Mistral` · `n8n` · `Tidio` · `Wati`
>
> **Qué me tienes que devolver**
> - Una tabla en CSV con esas columnas, lista para importar.
> - Marca en rojo las que hayan cambiado de modelo (ej: ya no tienen plan gratis).
>
> **Cuidado con esto**
> - Coge el precio de la **página oficial**, nunca de blogs ni comparadores:
>   suelen estar desactualizados.
> - Si la web muestra precios en dólares, apunta el dólar y márcalo como USD;
>   no lo conviertas tú.
> - Si hay precio distinto para España y LATAM, apunta el de España e indícalo.
> - Si no encuentras el precio sin registrarte, **no te registres**: anótalo
>   como "requiere cuenta".

---

## Nota sobre AGV-21 (producto de pago)

No es tarea de navegador. Es una decisión de producto que conviene tomar
**después** de que AGV-01 lleve 2–3 semanas midiendo: con datos reales de qué
categorías traen tráfico, el producto se elige por evidencia y no por intuición.
