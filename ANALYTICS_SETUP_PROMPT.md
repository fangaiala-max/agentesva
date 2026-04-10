# TASK: Setup Analytics para AgentesVA
**Asignado a**: Cowork / Growth
**Estimado**: 2-3 horas
**Deadline**: Antes del launch (2026-04-15)

---

## CONTEXTO

Sitio web estático en SiteGround. Sin framework, HTML puro.
URL: https://agentesva.com
Stack: HTML5 + CSS3 + Vanilla JS

Necesitas instalar GA4 + Mixpanel en **todas** las páginas del sitio.

---

## PASO 1 — Google Analytics 4 (GA4) — 45 min

### 1.1 Crear propiedad
1. Ve a https://analytics.google.com
2. Admin → Crear propiedad → Nombre: "AgentesVA"
3. Categoría: E-commerce / Tecnología
4. Zona horaria: México (o tu país)
5. Moneda: USD
6. Copiar el **Measurement ID** → formato `G-XXXXXXXXXX`

### 1.2 Snippet a agregar
Pegar este bloque en el `<head>` de **cada archivo HTML** (antes del `</head>`):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

> ⚠️ Reemplaza `G-XXXXXXXXXX` con tu Measurement ID real.

### 1.3 Archivos donde agregarlo (TODOS)
```
index.html
catalogo/index.html
catalogo/academia/index.html
catalogo/agencia/index.html
catalogo/coach/index.html
catalogo/consultoria/index.html
catalogo/consultorio/index.html
catalogo/ecommerce/index.html
catalogo/estetica/index.html
catalogo/farmacia/index.html
catalogo/gimnasio/index.html
catalogo/inmobiliaria/index.html
catalogo/restaurante/index.html
catalogo/salon/index.html
como-funciona/index.html
como-empezar/index.html
precios/index.html
servicios/index.html
faq/index.html
gracias/index.html
gracias-gratis/index.html
legal/index.html
```

### 1.4 Crear conversiones en GA4
En GA4 → Admin → Eventos → Marcar como conversión:
- `viewed_catalog` (llegó a /catalogo/)
- `submitted_lead_form` (submit del form gratis)
- `purchase` (compra Stripe completada)
- `visited_pricing` (llegó a /precios/)

---

## PASO 2 — Mixpanel (eventos detallados) — 60 min

### 2.1 Crear proyecto
1. Ve a https://mixpanel.com → Sign up gratis
2. Crear proyecto → Nombre: "AgentesVA"
3. Copiar el **Project Token** → formato `abc123def456...`

### 2.2 Snippet base a agregar
En el `<head>` de **TODOS** los archivos HTML (después del snippet de GA4):

```html
<!-- Mixpanel -->
<script type="text/javascript">
(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e].concat([call2]))}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
</script>
<script>
  mixpanel.init('TU_PROJECT_TOKEN_AQUI');
  mixpanel.track('page_viewed', { page: window.location.pathname });
</script>
```

> ⚠️ Reemplaza `TU_PROJECT_TOKEN_AQUI` con tu Project Token real.

### 2.3 Eventos adicionales a agregar en páginas específicas

**En `catalogo/index.html`** — agregar dentro del JS existente donde ya hay handlers:

Buscar la función `openModal` (aprox línea 3270) y agregar al inicio:
```js
// Dentro de openModal(type, item):
mixpanel.track('agent_viewed', {
    agent_id: item.id,
    agent_name: item.name,
    agent_price: item.price,
    agent_tier: item.tier
});
```

Buscar el botón de Stripe (aprox línea 3313) y agregar al click:
```html
<a href="${stripeLinks[a.id]}"
   class="btn-buy"
   target="_blank"
   rel="noopener"
   onclick="mixpanel.track('purchase_initiated', {agent_id:'${a.id}', agent_name:'${a.name}', price:${a.price}})">
   Comprar ahora →
</a>
```

**En `gracias/index.html`** — agregar al cargar la página:
```html
<script>
  mixpanel.track('lead_form_submitted', {
    product: new URLSearchParams(window.location.search).get('product'),
    type: new URLSearchParams(window.location.search).get('type')
  });
</script>
```

**En `precios/index.html`** — agregar al cargar:
```html
<script>
  mixpanel.track('visited_pricing', { source: document.referrer });
</script>
```

---

## PASO 3 — Verificación — 30 min

### 3.1 Verificar GA4
1. Abre https://agentesva.com en el browser
2. En GA4 → Reports → Realtime → debe aparecer "1 active user"
3. Navega a /catalogo/ → debe aparecer pageview en Realtime

### 3.2 Verificar Mixpanel
1. Abre https://agentesva.com en el browser
2. En Mixpanel → Live View → debe aparecer evento `page_viewed`
3. Click en un agente → debe aparecer evento `agent_viewed`

### 3.3 Test de conversión
1. Abre /catalogo/
2. Click en un agente gratis
3. Pon un email de prueba → Submit
4. En Mixpanel Live View: debe aparecer `lead_form_submitted`
5. En Brevo → Contacts → Lista 8: debe aparecer el email

---

## ENTREGABLES

Al terminar, confirma en Slack #agentesva-deploy:
```
✅ GA4 instalado — Measurement ID: G-XXXXXXXXXX
✅ Mixpanel instalado — Project Token: xxxxxxxxx
✅ Pageviews verificados en ambas plataformas
✅ Evento agent_viewed funcionando
✅ Evento lead_form_submitted funcionando
📊 Dashboard creado: [link]
```

---

## NOTAS

- El sitio ya tiene captura de leads con Brevo (lista ID: 8) — no tocar ese código
- El `EMAIL_ENDPOINT` ya está configurado — no cambiar
- Si encuentras problemas con CORS en Mixpanel, usar la versión de snippet con `cross_subdomain_cookie: false`
- Archivos de backup en `_archive/` — NO subir esa carpeta a producción (745MB)

---

**¿Dudas?** Preguntar en Slack o revisar docs:
- GA4: https://developers.google.com/analytics/devguides/collection/ga4
- Mixpanel: https://docs.mixpanel.com/docs/quickstart/connect-your-data
