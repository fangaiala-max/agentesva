# 📋 AGENTESVA — MASTER DEPLOYMENT BACKLOG
**Última actualización**: 2026-04-06
**Metodología**: Priorizado por **EASE × CRITICALITY** (fácil+crítico primero)
**Target Launch**: 2026-04-15 | **Días restantes**: 9

---

## 🗺️ RESUMEN DE SPRINTS

```
SPRINT 1 (Hoy, Day 1-2):   Quick Wins → tareas <2h, fáciles, críticas
SPRINT 2 (Day 2-4):        Core Blockers → tareas 2-6h, bloquean el launch
SPRINT 3 (Day 4-6):        Pre-Launch Polish → demos, mobile test, QA
─────────────────────────────────────────────────────────
GO/NO-GO:                  2026-04-11 (Viernes)
LAUNCH DAY:                2026-04-15 (Martes)
─────────────────────────────────────────────────────────
POST-LAUNCH (Apr 15-17):   Monitor + Fix + Lead Magnet
WEEK 1 GROWTH (Apr 18-24): Email, landing pages, comparación
MONTH 1+ (Apr 25+):        Optimización continua
```

---

# 🟢 SPRINT 1 — QUICK WINS (Hoy, <2h cada una)
> **Empezar aquí.** Tareas rápidas y de alto impacto que desbloqueamos HOY.
> Se pueden hacer en paralelo. No requieren dependencias.

---

## ✅ TASK S1.1: Verificar & Optimizar .htaccess
**Tiempo**: 1 hora | **Responsable**: DevOps/CTO | **Status**: 🔴 PENDIENTE
**Prioridad**: Crítica — afecta velocidad + SEO directamente

**Checklist**:
- [ ] Abrir `.htaccess` actual (4692 bytes) y revisar
- [ ] Confirmar que gzip/deflate está activo
- [ ] Confirmar cache headers (1 año para static assets)
- [ ] Confirmar redirects www → non-www (o viceversa)
- [ ] Agregar headers de seguridad si faltan:
  ```apache
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  ```
- [ ] Test: `curl -I https://agentesva.com` para verificar headers

**Entregable**: .htaccess actualizado + confirmación de headers
**Dependencias**: Ninguna

---

## ✅ TASK S1.2: Validar robots.txt + sitemap.xml
**Tiempo**: 0.5 horas | **Responsable**: DevOps/SEO | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — SEO foundation antes del launch

**Checklist**:
- [ ] Abrir `robots.txt` y verificar que no bloquee nada importante
- [ ] Abrir `sitemap.xml` y verificar que incluye todas las 13+ URLs
- [ ] Verificar que sitemap tiene formato correcto (XML válido)
- [ ] Agregar al sitemap si faltan páginas:
  - `/como-funciona/`
  - `/como-empezar/`
  - `/precios/`
  - `/servicios/`
  - `/faq/`
  - `/catalogo/`
  - `/catalogo/[industria]/` (12 industrias)
- [ ] Verificar que robots.txt referencia al sitemap: `Sitemap: https://agentesva.com/sitemap.xml`

**Entregable**: robots.txt + sitemap.xml validados
**Dependencias**: Ninguna

---

## ✅ TASK S1.3: Agregar Schema.org Markup (JSON-LD)
**Tiempo**: 1 hora | **Responsable**: Frontend/SEO | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — missing gap en SEO identificado en arquitectura

**Qué agregar al `<head>` de index.html**:
```html
<!-- Organization Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AgentesVA",
  "url": "https://agentesva.com",
  "description": "Agentes IA listos para Make.com — para PyMEs latinoamericanas",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@agentesva.com",
    "contactType": "customer service",
    "availableLanguage": "Spanish"
  }
}
</script>

<!-- SoftwareApplication Schema (para catálogo) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AgentesVA Catalog",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "19",
    "priceCurrency": "USD"
  }
}
</script>
```

**Entregable**: JSON-LD agregado a index.html
**Dependencias**: Ninguna

---

## ✅ TASK S1.4: Verificar Formularios (Email Capture)
**Tiempo**: 1 hora | **Responsable**: CTO | **Status**: 🔴 PENDIENTE
**Prioridad**: 🔴 CRÍTICA — si no funciona, se pierden TODOS los leads

**Checklist**:
- [ ] Buscar todos los `<form>` en el sitio (index.html, gracias.html, etc.)
- [ ] Verificar que existen formularios de lead capture (¿hay alguno?)
- [ ] Si hay form: probar submit con datos reales → ¿llega email a info@agentesva.com?
- [ ] Si NO hay form: crear form básico de captura (nombre + email + CTA)
- [ ] Verificar que /gracias/ y /gracias-gratis/ son accesibles post-submit
- [ ] Test con email real antes del launch

**Nota crítica**: La arquitectura detectó que posiblemente NO hay backend para captura de leads.
Si no hay form funcional = 0 leads capturados en el launch.

**Entregable**: Form funcional o confirmación de que no existe (para crear uno)
**Dependencias**: Ninguna

---

## ✅ TASK S1.5: Optimizar Imágenes OG (WebP)
**Tiempo**: 1.5 horas | **Responsable**: Designer/Frontend | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — OG images se cargan en social sharing + SEO

**Imágenes a optimizar**:
- `og-home.png` (44KB → target <20KB)
- `og-catalogo.png` (52KB → target <25KB)
- `apple-touch-icon.png` → verificar dimensiones correctas (180×180px)

**Proceso**:
1. [ ] Convertir PNG → WebP: `cwebp -q 80 og-home.png -o og-home.webp`
2. [ ] Comprimir con TinyPNG o Squoosh
3. [ ] Crear versiones responsive con `<picture>` + `srcset`
4. [ ] Implementar lazy-load: `<img loading="lazy">`
5. [ ] Test visual: verificar que siguen viéndose bien

**Entregable**: OG images <25KB, WebP + JPG fallback
**Dependencias**: Ninguna

---

## ✅ TASK S1.6: Setup Sentry (Error Monitoring)
**Tiempo**: 1 hora | **Responsable**: Frontend/DevOps | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — necesario ANTES del launch para detectar errores en producción

**Setup**:
- [ ] Crear cuenta Sentry (gratis tier suficiente)
- [ ] Instalar SDK en `<head>`:
  ```html
  <script
    src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"
    crossorigin="anonymous"
  ></script>
  <script>
    Sentry.init({ dsn: "YOUR_DSN_HERE" });
  </script>
  ```
- [ ] Verificar que errores JS se capturan (provocar error de test)
- [ ] Configurar alertas por email si hay errores críticos

**Entregable**: Sentry activo y verificado antes del launch
**Dependencias**: Ninguna

---

**SPRINT 1 RESUMEN:**
| Tarea | Tiempo | Owner | Dependencia |
|-------|--------|-------|-------------|
| S1.1: .htaccess + security headers | 1h | DevOps | Ninguna |
| S1.2: robots.txt + sitemap | 0.5h | DevOps | Ninguna |
| S1.3: Schema.org markup | 1h | Frontend | Ninguna |
| S1.4: Verificar formularios | 1h | CTO | Ninguna |
| S1.5: Optimizar OG images | 1.5h | Designer | Ninguna |
| S1.6: Setup Sentry monitoring | 1h | Frontend | Ninguna |
| **TOTAL** | **6h** | Paralelo | — |

> **⚡ Todas se pueden hacer en paralelo.** Con 2-3 personas = completar en 2-3 horas hoy.

---

---

# 🟡 SPRINT 2 — CORE BLOCKERS (Day 2-4, 2-6h cada una)
> Tareas críticas que bloquean el launch. Más esfuerzo pero esenciales.

---

## ✅ TASK S2.1: Setup Analytics — GA4 + Mixpanel
**Tiempo**: 2-3 horas | **Responsable**: PM + Growth | **Status**: 🔴 PENDIENTE
**Prioridad**: Crítica — sin data no podemos medir nada post-launch

**Google Analytics 4 (GA4)**:
- [ ] Crear propiedad GA4 en analytics.google.com
- [ ] Obtener Measurement ID (`G-XXXXXXXXXX`)
- [ ] Agregar a `<head>` de TODAS las páginas:
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXX');
  </script>
  ```
- [ ] Verificar que pageview se dispara (Real-time report en GA4)
- [ ] Crear goals/conversiones:
  - `viewed_catalog` (llegó a /catalogo/)
  - `clicked_cta` (click en "Obtener")
  - `submitted_lead_form` (submit de form)
  - `viewed_demo` (play en video)
  - `visited_pricing` (llegó a /precios/)

**Mixpanel (Event Tracking)**:
- [ ] Crear proyecto en mixpanel.com
- [ ] Instalar SDK + agregar events clave:
  ```js
  mixpanel.track('page_viewed', { page: window.location.pathname });
  mixpanel.track('cta_clicked', { button: 'Obtener', agent: agentName });
  mixpanel.track('lead_form_submitted', { source: 'home' });
  mixpanel.track('agent_viewed', { agent_id: agentId });
  ```
- [ ] Verificar que eventos aparecen en Live View

**Entregable**: GA4 + Mixpanel activos con eventos básicos
**Dependencias**: Ninguna (puede ir mientras se hace S2.2)

---

## ✅ TASK S2.2: Completar Catálogo — 40+ Agent Hooks
**Tiempo**: 4-6 horas | **Responsable**: PM + Copywriter | **Status**: 🔴 BLOQUEADOR
**Prioridad**: 🔴 CRÍTICA — usuarios no saben qué hace cada agente = no compran

**¿Qué son "hooks"?**
Cada agente en el catálogo necesita:
```javascript
{
  id: 'agente-bienvenida-v1',
  name: 'Agente de Bienvenida',
  description: 'Recibe clientes las 24/7, responde preguntas y captura contactos automáticamente',
  benefit: 'Ahorra 5 horas/semana en atención al cliente',
  setupTime: '5 minutos',
  industry: 'Restaurante, Consultorio, Agencia',
  price: 19,
  cta: 'Obtener →',
  link: '/catalogo/#agente-bienvenida'
}
```

**Proceso**:
1. [ ] Extraer lista de 40+ agentes sin descripción del JS array
2. [ ] Crear Google Doc con template para cada agente
3. [ ] Copywriter: escribir 1-2 líneas benefit-driven por agente (es-MX/es-CO)
4. [ ] PM: revisar + aprobar
5. [ ] Developer: agregar al JS array en `catalogo/index.html`
6. [ ] Test: verificar que cada agente muestra descripción + CTA funcional

**Guía de escritura**:
- ✅ Enfoque en BENEFICIO no en características
- ✅ Mencionar tiempo ahorrado: "Ahorra X horas/semana en..."
- ✅ Tono: profesional pero cercano, en español
- ❌ No usar jerga técnica
- ❌ No más de 2 líneas de descripción

**Entregable**: JS array completo con 40+ agentes documentados
**Dependencias**: Ninguna

---

## ✅ TASK S2.3: Minificar & Optimizar index.html
**Tiempo**: 3-4 horas | **Responsable**: CTO | **Status**: 🔴 BLOQUEADOR CRÍTICO
**Prioridad**: 🔴 MÁXIMA — 151MB = imposible de servir (>30s carga en 3G)

**Análisis primero (30 min)**:
- [ ] Identificar qué ocupa los 151MB:
  ```bash
  wc -c index.html      # bytes total
  grep -c "" index.html # líneas total
  ```
- [ ] ¿CSS inline enorme? ¿JS inline? ¿Datos base64 embebidos? ¿SVGs enormes?
- [ ] Usar `index.html.bak` como backup (ya existe ✅)

**Opciones de optimización (en orden de impacto)**:
1. [ ] **Extraer CSS a archivo separado** `/assets/css/main.css` (mayor impacto si CSS es el culpable)
2. [ ] **Extraer JS a archivo separado** `/assets/js/main.js`
3. [ ] **Minificar HTML** (remover comentarios, espacios extra)
4. [ ] **Comprimir cualquier dato base64** o SVG inline grande
5. [ ] **Lazy-load scripts no-críticos** con `defer` o `async`
6. [ ] Verificar gzip en .htaccess (reduce 70-80% el tamaño transferido)

**Target**:
- Archivo HTML: <5MB
- Con gzip: <1MB transferido
- Tiempo de carga: <3s en WiFi, <10s en 3G

**Herramientas**:
- HTML Minifier: `html-minifier` (npm)
- CSS Extractor: manual o VS Code bulk select
- Test: DevTools Network tab, Lighthouse, WebPageTest

**Entregable**: index.html <5MB + Lighthouse >80 + load time <3s
**Dependencias**: Ninguna (pero S2.4 depende de este)

---

## ✅ TASK S2.4: Refactorizar Scripts a Módulos ES6
**Tiempo**: 2-3 horas | **Responsable**: CTO/Frontend | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — mejora mantenimiento + carga (después de S2.3)

**Qué extraer**:
- [ ] FAQ Accordion → `/assets/js/modules/faq.js`
- [ ] Flip Card Toggle → `/assets/js/modules/flipcard.js`
- [ ] Countdown Timer → `/assets/js/modules/countdown.js`
- [ ] Navigation Pill → `/assets/js/modules/nav.js`
- [ ] Holographic Card Effect → `/assets/js/modules/holo.js`
- [ ] Footer Scroll Animation → `/assets/js/modules/scroll.js`
- [ ] Analytics Events → `/assets/js/modules/analytics.js`

**Implementación**:
```html
<!-- Críticos: cargar al inicio -->
<script type="module" src="/assets/js/modules/nav.js"></script>

<!-- No críticos: cargar después -->
<script type="module" src="/assets/js/modules/holo.js" defer></script>
<script type="module" src="/assets/js/modules/countdown.js" defer></script>
```

**Entregable**: Scripts externos + comportamiento idéntico al actual
**Dependencias**: S2.3 completada (minificar primero)

---

**SPRINT 2 RESUMEN:**
| Tarea | Tiempo | Owner | Dependencia |
|-------|--------|-------|-------------|
| S2.1: Analytics GA4 + Mixpanel | 2-3h | PM + Growth | Ninguna |
| S2.2: Agent hooks (40+) | 4-6h | PM + Writer | Ninguna |
| S2.3: Minificar index.html | 3-4h | CTO | Ninguna |
| S2.4: JS Modules (después de S2.3) | 2-3h | Frontend | S2.3 |
| **TOTAL** | **11-16h** | Paralelo | — |

> **⚡ S2.1, S2.2, S2.3 en PARALELO.** S2.4 solo después de S2.3.

---

---

# 🔵 SPRINT 3 — PRE-LAUNCH POLISH (Day 4-6)
> Tareas que requieren más recursos (demos, testing). Ejecutar mientras Sprint 2 termina.

---

## ✅ TASK S3.1: Test Mobile & Accessibility
**Tiempo**: 3-4 horas | **Responsable**: QA | **Status**: 🔴 PENDIENTE
**Prioridad**: Alta — 50%+ tráfico es mobile
**Dependencias**: S2.3 completada (necesita HTML optimizado)

**Mobile Testing**:
- [ ] iPhone 12 (Safari) — full page review
- [ ] iPhone 13 (Safari) — full page review
- [ ] Android (Chrome) — full page review
- [ ] iPad (tablet view)
- [ ] Verificar: sin scroll horizontal, botones clickeables, forms funcionales

**Accessibility (WCAG 2.1 AA)**:
- [ ] ARIA labels en elementos interactivos
- [ ] Keyboard navigation (Tab navega todo)
- [ ] Color contrast OK (herramienta: axe DevTools)
- [ ] Imágenes tienen `alt` text
- [ ] Forms tienen `<label>` asociados

**Performance**:
- [ ] Lighthouse score >80 (mobile + desktop)
- [ ] Carga <3s en 4G simulado
- [ ] Zero console errors
- [ ] Zero 404s

**Entregable**: Bug report + fixes implementados + Lighthouse >80
**Dependencias**: S2.3

---

## ✅ TASK S3.2: Crear 3 Product Demos (Video/GIF)
**Tiempo**: 4-8 horas | **Responsable**: Designer/Video | **Status**: 🔴 BLOQUEADOR
**Prioridad**: Alta — sin demo, conversión estimada <2%

### Demo 1: Agente de Bienvenida (2-3h)
- [ ] Grabar screencast: Make.com workflow + mensaje de prueba
- [ ] Mostrar: cliente envía mensaje → agente procesa → respuesta automática
- [ ] Editar a 30-60 segundos con subtítulos
- [ ] Exportar: MP4 (<50MB) + GIF (<5MB)
- [ ] Insertar en `/catalogo/` sección Agente Bienvenida

### Demo 2: Agente Clasificador de Leads (2-3h)
- [ ] Grabar: leads entran → agente clasifica caliente/frío → output spreadsheet
- [ ] Editar a 30-60s con subtítulos
- [ ] Exportar: MP4 + GIF
- [ ] Insertar en catálogo

### Demo 3: Agente Soporte FAQ (2-3h)
- [ ] Grabar: pregunta → búsqueda knowledge base → respuesta IA
- [ ] Editar a 30-60s con subtítulos
- [ ] Exportar: MP4 + GIF
- [ ] Insertar en catálogo

**Estándares de calidad**:
- ✅ Audio claro, sin ruido de fondo
- ✅ Subtítulos sincronizados en español
- ✅ MP4 <50MB, GIF <5MB
- ✅ Funciona en mobile + desktop

**Fallback si no hay tiempo**: Screenshots del workflow con flechas + descripción paso a paso

**Entregable**: 3 demos insertados en catálogo + funcionales en mobile
**Dependencias**: Agentes activos en Make.com

---

**SPRINT 3 RESUMEN:**
| Tarea | Tiempo | Owner | Dependencia |
|-------|--------|-------|-------------|
| S3.1: Mobile + Accessibility Test | 3-4h | QA | S2.3 |
| S3.2: Product Demos (3 videos) | 4-8h | Designer | Make.com activo |
| **TOTAL** | **7-12h** | Paralelo | — |

---

---

# ⛳ GO/NO-GO REVIEW — 2026-04-11 (Viernes)

## Criterios MUST (sin estos = NO-GO)
| Criterio | Owner | Status |
|----------|-------|--------|
| index.html <5MB comprimido | CTO | ⏳ |
| 100% agentes con hooks | PM | ⏳ |
| Form captura leads y llega email | CTO | ⏳ |
| Zero console errors | Frontend | ⏳ |
| Lighthouse >80 | QA | ⏳ |
| Mobile responsive (iOS + Android) | QA | ⏳ |

## Criterios SHOULD (aceptables sin ellos)
| Criterio | Owner | Status |
|----------|-------|--------|
| GA4 + Mixpanel instalados | Growth | ⏳ |
| 3 product demos publicados | Designer | ⏳ |
| Sentry activo | Frontend | ⏳ |

**Decisión**:
- ✅ GO: 6/6 MUST completos
- ⚠️ CONDITIONAL: 5/6 MUST → evaluar riesgo
- 🛑 NO-GO: <5/6 MUST → posponer launch

---

---

# 🚀 FASE LAUNCH DAY — 2026-04-15 (Martes)

## TASK L1: Final QA Sign-Off (2 horas)
**Owner**: QA | **Status**: ⏳

- [ ] Smoke test: todas las páginas cargan
- [ ] Form funciona (submit real)
- [ ] CTAs dirigen a páginas correctas
- [ ] No 404s (crawl completo)
- [ ] Console limpio (0 errores)
- [ ] GA4 + Sentry activos

---

## TASK L2: Deploy a Producción (1-2 horas)
**Owner**: DevOps | **Status**: ⏳
**Nota**: Usar SiteGround File Manager (Monaco editor vía Claude-in-Chrome)

- [ ] Backup del sitio actual
- [ ] Upload archivos optimizados via SiteGround
- [ ] Archivos a subir:
  - `index.html` (optimizado)
  - `/assets/` (CSS + JS + imágenes)
  - `/catalogo/` (agentes actualizados)
  - `.htaccess` (con headers + gzip)
  - Todas las páginas HTML
- [ ] Verificar DNS + SSL activo
- [ ] Flush cache (SiteGround + navegador)
- [ ] Test sitio vivo: load time, links, forms

**Rollback**: `index.html.bak` ya existe ✅

---

## TASK L3: Anuncio Público (1 hora)
**Owner**: Marketing | **Status**: ⏳

- [ ] Email a lista existente (desde info@agentesva.com)
- [ ] Post en Twitter/X + LinkedIn
- [ ] Post en comunidades LATAM relevantes
- [ ] Actualizar Google Business profile

---

**LAUNCH DAY RESUMEN**: ~4 horas total

---

---

# 🔥 POST-LAUNCH — Days 1-3 (Apr 15-17)

## TASK P1: Monitor Analytics (Ongoing, primeras 72h)
**Owner**: Analytics | **Frecuencia**: Cada 2-4 horas

- [ ] Page load time (alerta si >5s)
- [ ] Bounce rate (alerta si >60%)
- [ ] Conversion rate a catálogo (target >5%)
- [ ] Leads capturados (contar diariamente)
- [ ] 404s y errores en Sentry
- [ ] Reportar en Slack daily a las 5 PM

---

## TASK P2: Fix High-Priority Bugs (On-call)
**Owner**: CTO/Frontend | **Response time**: <1 hora

Bugs más probables:
- Load time lento → ajustar minificación
- Links rotos en catálogo → verificar hrefs
- Form no envía → fix backend/action
- Mobile layout roto → fix CSS

---

## TASK P3: Crear Lead Magnet "Agente Gratis"
**Tiempo**: 4-6 horas | **Owner**: Marketing/Product
**Target**: Publicar en Day 1 post-launch

- [ ] Landing page: "Agente de Bienvenida GRATIS 7 días"
  - Headline: "Recibe clientes 24/7 automáticamente (Sin pagar nada)"
  - Benefits list (3-4 bullets)
  - Email form
  - CTA: "Obtener Gratis →"
- [ ] Conectar form a email sequence (Email 1 inmediato)
- [ ] Enlazar desde home + catálogo

---

## TASK P4: Setup A/B Test Headlines
**Tiempo**: 1-2 horas | **Owner**: Growth/Analytics

Variantes a probar (33% tráfico cada una):
1. **Actual**: "Flujos automatizados de agentes IA listos para Make.com"
2. **ROI-focused**: "Automatiza tareas repetitivas en 5 min → Ahorra 10h/semana"
3. **Pain-focused**: "PyMEs: Sin programadores, sin servidores, sin gastos mensuales"

- [ ] Configurar en Google Optimize (gratuito)
- [ ] Medir: conversión al catálogo + time-on-page
- [ ] Duración mínima: 72 horas

---

## TASK P5: Documentar Case Study #1
**Tiempo**: 3-4 horas | **Owner**: Content

```
ESTRUCTURA:
[Empresa + Industria]
PROBLEMA: X horas/semana perdidas en Y tarea
SOLUCIÓN: Agente Z implementado en 15 minutos
RESULTADO: "Recuperé 40 horas/mes" — Nombre, Cargo
CTA: Obtener ahora →
```

- [ ] Contactar primer cliente que compró
- [ ] Entrevista 15 min (grabada)
- [ ] Redactar 300-500 palabras
- [ ] Publicar en blog + landing page de industria

---

**POST-LAUNCH RESUMEN (12-19h):**
| Tarea | Prioridad | Tiempo |
|-------|-----------|--------|
| P1: Monitor Analytics | 🔴 CRITICAL | Ongoing |
| P2: Fix Bugs | 🔴 CRITICAL | On-call |
| P3: Lead Magnet | 🟡 HIGH | 4-6h |
| P4: A/B Test | 🟡 HIGH | 1-2h |
| P5: Case Study #1 | 🟡 HIGH | 3-4h |

---

---

# 📈 WEEK 1 GROWTH — Apr 18-24

## TASK W1: Email Sequence (5 emails)
**Tiempo**: 4-6h | **Owner**: Copywriter/Marketing

- **Email 0** (inmediato): "¡Aquí está tu agente! Sigue estos 4 pasos..."
- **Email 1** (2h): "Video: Cómo usar tu agente en 5 minutos"
- **Email 2** (1 día): "[Caso real] Restaurante X ahorró $2000/mes"
- **Email 3** (3 días): "¿Necesitas ayuda? Aquí estamos"
- **Email 4** (7 días): "Oferta especial: agente adicional $19"

**Tools**: Mailchimp / ConvertKit / SendGrid

---

## TASK W2: Landing Pages por Industria (Top 3)
**Tiempo**: 6-8h | **Owner**: Content/Designer

Top 3 por potencial: Restaurante, Agencia, Consultorio

Por cada landing:
- [ ] Headline específico: "Agentes IA para [Industria]"
- [ ] Pain points de la industria
- [ ] Agentes recomendados
- [ ] Case study de esa industria (si existe)
- [ ] CTA adaptado

---

## TASK W3: FAQ Video (2-3 min)
**Tiempo**: 3-4h | **Owner**: Video Producer

Preguntas a cubrir:
- ¿Cómo funciona AgentesVA?
- ¿Cuánto cuesta realmente?
- ¿Qué agente es mejor para mi negocio?
- ¿Quién puede implementarlo? (no necesitas código)

**Publicar en**: YouTube + Home + /faq/

---

## TASK W4: Comparison Chart vs Make.com
**Tiempo**: 2h | **Owner**: Growth/Designer

```
Feature             | AgentesVA | Make.com | Zapier
Agentes listos      | ✅ 42+    | ❌ 0     | ✅ 100+
Precio por agente   | $19-97    | $9/mes   | $25/mes
Setup time          | 5 min     | 2+ horas | 1+ horas
LatAm español       | ✅        | ❌        | ❌
Lifetime license    | ✅        | ❌        | ❌
```

- [ ] Crear página `/comparacion/`
- [ ] Link desde home + precios
- [ ] SEO: "Make.com vs AgentesVA"

---

## TASK W5: How-it-Works GIFs
**Tiempo**: 3-4h | **Owner**: Designer

4 GIFs de 30s:
1. "Compra agente en 2 clicks"
2. "Configura en Make.com en 5 minutos"
3. "Conecta tus datos (email, spreadsheet)"
4. "Agente trabajando automáticamente"

---

## TASK W6: Trust Signals
**Tiempo**: 2-3h | **Owner**: Product/Marketing

- [ ] Agregar al home: "100+ implementaciones exitosas"
- [ ] Badge: "Garantía 30 días o reembolso"
- [ ] Logos de partners (Make.com, OpenAI)
- [ ] Testimonios con foto + empresa (mínimo 3)
- [ ] "Recomendado para PyMEs LATAM"

---

**WEEK 1 RESUMEN (24-35h):**
| Tarea | Tiempo |
|-------|--------|
| W1: Email Sequence | 4-6h |
| W2: Industry Landing Pages | 6-8h |
| W3: FAQ Video | 3-4h |
| W4: Comparison Chart | 2h |
| W5: How-it-works GIFs | 3-4h |
| W6: Trust Signals | 2-3h |

---

---

# 📊 MONTH 1+ OPTIMIZATION — Apr 25+

## Tareas Continuas (weekly)

| Tarea | Frecuencia | Tiempo/semana | Owner |
|-------|-----------|---------------|-------|
| Analytics Review + Optimization | Semanal | 2-3h | Analytics |
| Content Marketing (blog) | 2-3 posts/semana | 4-6h | Content |
| UX Optimization (basado en heatmaps) | Quincenal | 2-3h | Product |
| Sales Outreach (LinkedIn) | Diario | 3-5h | Sales |
| PPC Ads (Google + LinkedIn) | Continuo | 4-8h | Growth |

## Proyectos del Mes

| Proyecto | Tiempo | Prioridad |
|---------|--------|-----------|
| 2-3 Case Studies más | 6h total | 🟡 HIGH |
| Chat widget (Intercom/Drift) | 2-3h | 🟢 NICE |
| Referral program | 4-6h | 🟢 OPTIONAL |
| Backend API para pagos (Stripe) | 20-30h | 🟡 HIGH si hay demanda |

---

---

# 🎯 MÉTRICAS TARGET — Mes 1

| Métrica | Target | Realista |
|---------|--------|----------|
| Visitantes únicos | 500+ | 300-500 |
| Conversión a catálogo | 8%+ | 5-8% |
| Leads capturados | 50+ | 30-50 |
| Agentes vendidos | 10+ | 5-10 |
| Revenue | $200+ | $100-200 |
| Email subscribers | 100+ | 50-100 |

---

# 📅 TIMELINE COMPLETO

```
HOY (2026-04-06)
├── SPRINT 1 (TODAY): Quick Wins [6h total, paralelo]
│   ├── S1.1: .htaccess + security headers (1h)
│   ├── S1.2: robots.txt + sitemap (0.5h)
│   ├── S1.3: Schema.org markup (1h)
│   ├── S1.4: Verificar formularios (1h)  ← CRÍTICO
│   ├── S1.5: Optimizar OG images (1.5h)
│   └── S1.6: Sentry setup (1h)
│
├── SPRINT 2 (Day 2-4): Core Blockers [11-16h, paralelo]
│   ├── S2.1: Analytics GA4 + Mixpanel (2-3h)
│   ├── S2.2: Agent hooks 40+ (4-6h)           ← BLOQUEADOR
│   ├── S2.3: Minificar index.html (3-4h)       ← BLOQUEADOR
│   └── S2.4: JS Modules (2-3h) [después S2.3]
│
├── SPRINT 3 (Day 4-6): Pre-Launch Polish [7-12h]
│   ├── S3.1: Mobile + A11y Testing (3-4h) [después S2.3]
│   └── S3.2: Product Demos x3 (4-8h) [paralelo]
│
├── GO/NO-GO: 2026-04-11 (Viernes)
│
├── LAUNCH DAY: 2026-04-15 (Martes) [4h total]
│   ├── L1: Final QA (2h)
│   ├── L2: Deploy SiteGround (1-2h)
│   └── L3: Anuncio público (1h)
│
├── POST-LAUNCH (Apr 15-17) [12-19h]
│   ├── P1: Monitor Analytics (ongoing)
│   ├── P2: Fix bugs (on-call)
│   ├── P3: Lead Magnet (4-6h)
│   ├── P4: A/B Test headlines (1-2h)
│   └── P5: Case Study #1 (3-4h)
│
├── WEEK 1 GROWTH (Apr 18-24) [24-35h]
│   ├── W1: Email Sequence
│   ├── W2: Industry Landing Pages
│   ├── W3: FAQ Video
│   ├── W4: Comparison Chart
│   ├── W5: How-it-works GIFs
│   └── W6: Trust Signals
│
└── MONTH 1+ (Apr 25+): Optimización continua
```

---

# 👥 ASIGNACIÓN POR ROL

| Rol | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|-----|----------|----------|----------|-------|
| CTO/Frontend | S1.3, S1.4, S1.6 (3h) | S2.3, S2.4 (5-7h) | S3.1 (3-4h) | ~13-18h |
| DevOps | S1.1, S1.2 (1.5h) | — | — | ~1.5h + deploy |
| PM | — | S2.1, S2.2 (6-9h) | — | ~6-9h |
| Designer | S1.5 (1.5h) | — | S3.2 (4-8h) | ~6-10h |
| Copywriter | — | S2.2 (parte) (2-3h) | — | ~2-3h |
| Growth | — | S2.1 (parte) (1h) | — | ~1h + post-launch |

---

**Documento**: DEPLOYMENT_BACKLOG.md (v2.0 — consolidado y re-priorizado)
**Creado**: 2026-04-06 | **Última revisión**: 2026-04-06
**Status**: 🟡 LISTO PARA EJECUCIÓN

> **EMPEZAR AHORA → SPRINT 1** — Todas las tareas de Sprint 1 son independientes y se pueden hacer en paralelo hoy mismo.
