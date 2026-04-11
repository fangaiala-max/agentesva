# Buyer Journey Simplification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar el funnel de compra de AgentesVA: el catálogo se convierte en un flujo de 3 pasos (industria → agentes → setup), eliminando la confusión de doble precio.

**Architecture:** Sitio estático HTML/CSS/JS inline. Sin frameworks. 23 páginas independientes con footer compartido. Los cambios son: (1) footer fix global via Python, (2) ediciones quirúrgicas en index.html y catalogo/index.html, (3) actualización de copy en precios/index.html.

**Tech Stack:** HTML5, CSS3, Vanilla JS inline en cada página. Servidor local: `python3 -m http.server 8000` desde la raíz.

---

## Mapa de archivos

| Archivo | Qué cambia |
|---|---|
| `index.html` | CTA texto + bloque de industry pills |
| `catalogo/index.html` | Sección #setup nueva + `buildAgentModal()` + `showSolution()` agente-mini-price + `scrollToSetup()` |
| `precios/index.html` | Hero copy: kicker, h1, sub, value-props |
| 23 archivos `*.html` | Footer: fix links rotos + eliminar precios |

---

## Task 1: Fix footer links en las 23 páginas

**Files:**
- Modify: todos los `*.html` del proyecto (no `_archive/`)

Hay dos patrones rotos en los footers. El script Python los normaliza todos a una versión limpia sin precios.

- [ ] **Step 1: Verificar los patrones actuales**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
grep -rn "Agentes B.*IA" --include="*.html" | grep -v "_archive" | head -6
```

Debes ver dos patrones: el roto con `<a>` anidados (la mayoría de páginas) y el limpio con precio (index.html).

- [ ] **Step 2: Ejecutar el script de fix**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
python3 - <<'EOF'
import os, re, glob

root = "/Users/fernandoangulo/Sitios web/05-agentesva"
files = glob.glob(os.path.join(root, "**/*.html"), recursive=True)
files = [f for f in files if "_archive" not in f]

# Patrón roto (nested anchors) — 21 páginas
broken_basic   = '<li><a href="/catalogo/#todos">Agentes B<a href="/catalogo/">Agentes B&aacute;sicos</a>aacute;sicos IA \u2014 $29</a></li>'
broken_standard= '<li><a href="/catalogo/#todos">Agentes Est<a href="/catalogo/">Agentes Est&aacute;ndar</a>aacute;ndar IA \u2014 $47</a></li>'
broken_advanced= '<li><a href="/catalogo/#todos">Agentes Avanzados IA \u2014 $97</a></li>'

# Patrón limpio con precio (index.html y algunos otros)
clean_basic    = '<li><a href="/catalogo/">Agentes B&aacute;sicos IA \u2014 $29</a></li>'
clean_standard = '<li><a href="/catalogo/">Agentes Est&aacute;ndar IA \u2014 $47</a></li>'
clean_advanced = '<li><a href="/catalogo/#todos">Agentes Avanzados IA \u2014 $97</a></li>'

# Versión final correcta
fixed_basic    = '<li><a href="/catalogo/">Agentes B&aacute;sicos IA</a></li>'
fixed_standard = '<li><a href="/catalogo/">Agentes Est&aacute;ndar IA</a></li>'
fixed_advanced = '<li><a href="/catalogo/">Agentes Avanzados IA</a></li>'

replacements = [
    (broken_basic,    fixed_basic),
    (broken_standard, fixed_standard),
    (broken_advanced, fixed_advanced),
    (clean_basic,     fixed_basic),
    (clean_standard,  fixed_standard),
    (clean_advanced,  fixed_advanced),
]

changed = 0
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {fpath.replace(root+'/', '')}")
        changed += 1

print(f"\nTotal files updated: {changed}")
EOF
```

Esperado: `Total files updated: 22` (o similar — todas las páginas con footer).

- [ ] **Step 3: Verificar que no quedan patrones rotos**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
grep -rn "catalogo/#todos.*Agentes B\|aacute;sicos IA" --include="*.html" | grep -v "_archive"
```

Esperado: sin resultados.

- [ ] **Step 4: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add -u
git commit -m "fix: reparar links rotos de footer en 23 páginas — eliminar precios del footer"
```

---

## Task 2: Home — actualizar CTA y agregar industry pills

**Files:**
- Modify: `index.html` (líneas ~1993-2005)

- [ ] **Step 1: Localizar el bloque hero-actions**

```bash
grep -n "Ver los 42 agentes\|hero-actions\|industry-pill" "/Users/fernandoangulo/Sitios web/05-agentesva/index.html"
```

Esperado: línea ~1994 con `Ver los 42 agentes &rarr;`

- [ ] **Step 2: Cambiar texto del CTA principal**

En `index.html` línea ~1994, reemplazar:
```html
<a href="/catalogo/" class="btn-primary">Ver los 42 agentes &rarr;</a>
```
Por:
```html
<a href="/catalogo/" class="btn-primary">Automatiza tu negocio &rarr;</a>
```

- [ ] **Step 3: Agregar bloque de industry pills después de hero-actions**

Después del cierre de `</div>` del bloque `.hero-actions` (~línea 1998), insertar:

```html
            <!-- ── Industry pills ── -->
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;justify-content:center;">
                <a href="/catalogo/#clinica"      style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--text);transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">🏥 Consultorio</a>
                <a href="/catalogo/#restaurante"  style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--text);transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">🍽️ Restaurante</a>
                <a href="/catalogo/#ecommerce"    style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--text);transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">🛍️ Ecommerce</a>
                <a href="/catalogo/#salon"        style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--text);transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">✂️ Salón</a>
                <a href="/catalogo/#inmobiliaria" style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--text);transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">🏠 Inmobiliaria</a>
                <a href="/catalogo/" style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:transparent;border:1px solid var(--border);border-radius:var(--r-full);font-size:0.82rem;color:var(--primary);transition:border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">+ 7 industrias &rarr;</a>
            </div>
```

- [ ] **Step 4: Verificar en browser**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
python3 -m http.server 8000
```

Abrir http://localhost:8000 y verificar:
- El botón principal dice "Automatiza tu negocio →"
- Los industry pills aparecen debajo del CTA
- Al hacer click en "🏥 Consultorio" va a `/catalogo/#clinica` y muestra la vista de solución para clínica
- Al hacer click en "🍽️ Restaurante" va a `/catalogo/#restaurante` y muestra la vista de restaurante

- [ ] **Step 5: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add index.html
git commit -m "feat: actualizar CTA home + agregar industry pills de acceso rápido al catálogo"
```

---

## Task 3: Catálogo — agregar sección Paso 3 (#setup)

**Files:**
- Modify: `catalogo/index.html`

La sección `#setup` es siempre visible, vive después de todos los `<main>` de vistas. Cuando el usuario llega por un industry pill, ve automáticamente la vista de solución (ya funciona con el hash) y debajo está la sección de setup.

- [ ] **Step 1: Localizar el final de las vistas en el catálogo**

```bash
grep -n "vista-todos\|</main>\|<!-- ===.*FAQ\|faq-section" "/Users/fernandoangulo/Sitios web/05-agentesva/catalogo/index.html" | tail -10
```

Buscar la línea donde termina `<main id="vista-todos">` y empieza el FAQ o el footer.

- [ ] **Step 2: Agregar la sección #setup antes del FAQ**

Insertar antes de `<section class="faq-section"` (buscar la línea exacta con `grep -n "faq-section" catalogo/index.html`):

```html
    <!-- ==================== PASO 3: SETUP ==================== -->
    <section id="setup" style="background:var(--bg2);padding:72px 32px;">
        <div style="max-width:900px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:40px;">
                <p style="font-family:var(--mono);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--primary);margin-bottom:10px;">PASO 3</p>
                <h2 class="display" style="font-size:clamp(24px,3.5vw,36px);font-weight:800;color:var(--text);margin-bottom:12px;">¿Cuánta ayuda necesitas para instalarlo?</h2>
                <p style="font-size:1rem;color:var(--muted);max-width:520px;margin:0 auto;">Elige tu nivel. Todos los caminos terminan con tu agente funcionando.</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:28px;">

                <!-- Lo hago yo -->
                <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-xl);padding:28px 24px;display:flex;flex-direction:column;gap:12px;">
                    <div style="font-size:2rem;">🛠️</div>
                    <div class="display" style="font-size:1.5rem;font-weight:800;color:var(--primary);">$19</div>
                    <div class="display" style="font-size:1.1rem;font-weight:700;color:var(--text);">Lo hago yo</div>
                    <p style="font-size:0.85rem;color:var(--muted);line-height:1.5;flex:1;">Blueprint listo para importar + guía visual paso a paso + video tutorial (3 min) + soporte por email.</p>
                    <div style="display:flex;gap:8px;font-size:0.78rem;color:var(--muted2);">
                        <span>⏱️ 15 min setup</span>
                        <span>·</span>
                        <span>👤 Tú configuras</span>
                    </div>
                    <a href="https://buy.stripe.com/cNi14ngtc171gN00TEfn000" target="_blank" rel="noopener" style="display:block;text-align:center;padding:12px;background:transparent;border:1.5px solid rgba(84,233,138,0.4);border-radius:var(--r-md);color:var(--primary);font-weight:600;font-size:0.9rem;transition:background 0.2s,border-color 0.2s;" onmouseover="this.style.background='rgba(84,233,138,0.08)';this.style.borderColor='var(--primary)'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(84,233,138,0.4)'">Empezar &rarr;</a>
                </div>

                <!-- Con ayuda -->
                <div style="background:var(--bg);border:2px solid var(--primary);border-radius:var(--r-xl);padding:28px 24px;display:flex;flex-direction:column;gap:12px;position:relative;">
                    <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--primary);color:#003919;font-size:0.7rem;font-weight:800;padding:3px 14px;border-radius:var(--r-full);white-space:nowrap;letter-spacing:0.06em;">MÁS POPULAR</div>
                    <div style="font-size:2rem;">🤝</div>
                    <div class="display" style="font-size:1.5rem;font-weight:800;color:var(--primary);">$49</div>
                    <div class="display" style="font-size:1.1rem;font-weight:700;color:var(--text);">Con ayuda</div>
                    <p style="font-size:0.85rem;color:var(--muted);line-height:1.5;flex:1;">Sesión 1:1 de 60 min para configurarlo juntos. Salimos con el agente activo en tu cuenta.</p>
                    <div style="display:flex;gap:8px;font-size:0.78rem;color:var(--muted2);">
                        <span>📅 Sesión agendada</span>
                        <span>·</span>
                        <span>✅ Garantía 7 días</span>
                    </div>
                    <a href="https://buy.stripe.com/5kQbJ1b8S4jd8gu59Ufn001" target="_blank" rel="noopener" style="display:block;text-align:center;padding:12px;background:var(--primary);border:2px solid var(--primary);border-radius:var(--r-md);color:#003919;font-weight:700;font-size:0.9rem;box-shadow:var(--shadow-cta);transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Reservar sesi&oacute;n &rarr;</a>
                </div>

                <!-- Full Service -->
                <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-xl);padding:28px 24px;display:flex;flex-direction:column;gap:12px;">
                    <div style="font-size:2rem;">🚀</div>
                    <div class="display" style="font-size:1.5rem;font-weight:800;color:var(--primary);">$97</div>
                    <div class="display" style="font-size:1.1rem;font-weight:700;color:var(--text);">Full Service</div>
                    <p style="font-size:0.85rem;color:var(--muted);line-height:1.5;flex:1;">Nosotros lo instalamos y configuramos todo por ti. Listo en 24 horas, sin que toques nada.</p>
                    <div style="display:flex;gap:8px;font-size:0.78rem;color:var(--muted2);">
                        <span>⚡ Listo en 24h</span>
                        <span>·</span>
                        <span>🛡️ Garantía total</span>
                    </div>
                    <a href="https://buy.stripe.com/8x27sLccW17100231MfnO02" target="_blank" rel="noopener" style="display:block;text-align:center;padding:12px;background:transparent;border:1.5px solid rgba(84,233,138,0.4);border-radius:var(--r-md);color:var(--primary);font-weight:600;font-size:0.9rem;transition:background 0.2s,border-color 0.2s;" onmouseover="this.style.background='rgba(84,233,138,0.08)';this.style.borderColor='var(--primary)'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(84,233,138,0.4)'">Quiero Full Service &rarr;</a>
                </div>

            </div>

            <p style="text-align:center;font-size:0.82rem;color:var(--muted2);">
                ¿Ya usas Make.com y solo necesitas el blueprint?
                <a href="/precios/" style="color:var(--primary);">Descarga individual desde $19 &rarr;</a>
            </p>
        </div>
    </section>
```

- [ ] **Step 3: Verificar en browser**

```bash
python3 -m http.server 8000
```

Abrir http://localhost:8000/catalogo/#clinica y verificar:
- La vista de solución para clínica se muestra correctamente
- Al hacer scroll hacia abajo, aparece la sección "Paso 3: ¿Cuánta ayuda necesitas?"
- Los 3 tier cards se ven bien en desktop y mobile (320px)
- El link "Descarga individual desde $19 →" aparece al fondo

- [ ] **Step 4: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add catalogo/index.html
git commit -m "feat: agregar sección #setup (Paso 3) al catálogo con los 3 tiers de implementación"
```

---

## Task 4: Catálogo — actualizar modal de agente + función scrollToSetup

**Files:**
- Modify: `catalogo/index.html` (funciones JS `buildAgentModal`, `buildPromptModal`, nueva `scrollToSetup`)

- [ ] **Step 1: Agregar función scrollToSetup**

En `catalogo/index.html`, después de la función `closeModal()` (línea ~3440), insertar:

```javascript
function scrollToSetup() {
    closeModal();
    setTimeout(function() {
        const el = document.getElementById('setup');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}
```

- [ ] **Step 2: Reemplazar el bloque paid-action en buildAgentModal**

Buscar y reemplazar en `buildAgentModal` (línea ~3451-3461) el bloque:

```javascript
        : stripeLinks[a.id]
            ? `<div class="paid-action">
                   <div><div class="price-big">\$${a.price}</div><div class="price-note-sm">Pago único · Tuyo para siempre · Actualizaciones incluidas</div></div>
                   <a href="${stripeLinks[a.id]}" class="btn-buy" target="_blank" rel="noopener" onclick="mixpanel.track('purchase_initiated', {agent_id: a.id, agent_name: a.name, price: a.price});">Comprar ahora →</a>
               </div>
               <p class="action-note">Pago seguro con Stripe · Recibes el flujo automatizado por email en &lt;5 min</p>
               <p style="font-size:0.75rem;color:var(--muted2);text-align:center;margin-top:6px;">🛡️ Garantía 7 días. Si no funciona para tu negocio, te devolvemos el 100%.</p>`
            : `<div class="paid-action">
                   <div><div class="price-big">\$${a.price}</div><div class="price-note-sm">Pago único · Tuyo para siempre · Actualizaciones incluidas</div></div>
                   <span class="btn-buy-soon">Próximamente</span>
               </div>`;
```

Por:

```javascript
        : `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:4px 0;">
               <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(84,233,138,0.1);border:1px solid rgba(84,233,138,0.25);border-radius:var(--r-full);padding:6px 16px;font-size:0.82rem;color:var(--primary);font-weight:600;">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                   Incluido en tu plan
               </div>
               <button onclick="scrollToSetup()" style="width:100%;padding:13px;background:var(--primary);border:none;border-radius:var(--r-md);color:#003919;font-weight:700;font-size:0.95rem;cursor:pointer;box-shadow:var(--shadow-cta);transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                   Elegir mi setup ↓
               </button>
               <p style="font-size:0.75rem;color:var(--muted2);text-align:center;">Desde $19 · Pago único · Garantía 7 días</p>
           </div>`;
```

- [ ] **Step 3: Reemplazar el bloque paid-action en buildPromptModal**

Buscar y reemplazar en `buildPromptModal` (línea ~3495-3504) el bloque análogo:

```javascript
        : stripeLinks[p.id]
            ? `<div class="paid-action">
                   <div><div class="price-big">\$${p.price}</div><div class="price-note-sm">Pago único · Tuyo para siempre · Actualizaciones incluidas</div></div>
                   <a href="${stripeLinks[p.id]}" class="btn-buy" target="_blank" rel="noopener">Comprar ahora →</a>
               </div>
               <p class="action-note">Pago seguro con Stripe · Recibes acceso por email en &lt;5 min</p>
               <p style="font-size:0.75rem;color:var(--muted2);text-align:center;margin-top:6px;">🛡️ Garantía 7 días. Si no funciona para tu negocio, te devolvemos el 100%.</p>`
            : `<div class="paid-action">
                   <div><div class="price-big">\$${p.price}</div><div class="price-note-sm">Pago único · Tuyo para siempre · Actualizaciones incluidas</div></div>
                   <span class="btn-buy-soon">Próximamente</span>
               </div>`;
```

Por:

```javascript
        : `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:4px 0;">
               <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(84,233,138,0.1);border:1px solid rgba(84,233,138,0.25);border-radius:var(--r-full);padding:6px 16px;font-size:0.82rem;color:var(--primary);font-weight:600;">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                   Incluido en tu plan
               </div>
               <button onclick="scrollToSetup()" style="width:100%;padding:13px;background:var(--primary);border:none;border-radius:var(--r-md);color:#003919;font-weight:700;font-size:0.95rem;cursor:pointer;box-shadow:var(--shadow-cta);transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                   Elegir mi setup ↓
               </button>
               <p style="font-size:0.75rem;color:var(--muted2);text-align:center;">Desde $19 · Pago único · Garantía 7 días</p>
           </div>`;
```

- [ ] **Step 4: Actualizar agente-mini-price en showSolution**

En `showSolution()` (línea ~3200), reemplazar:

```javascript
      <div class="agente-mini-price">${a.free ? 'GRATIS' : '$' + a.price}</div>
```

Por:

```javascript
      <div class="agente-mini-price" style="font-size:0.72rem;color:${a.free ? 'var(--primary)' : 'var(--muted2)'};font-weight:600;">${a.free ? 'DEMO GRATIS' : 'Incluido en tu plan'}</div>
```

- [ ] **Step 5: Verificar en browser**

```bash
python3 -m http.server 8000
```

Verificar en http://localhost:8000/catalogo/#clinica:
1. Los agent mini-cards en la vista solución muestran "Incluido en tu plan" o "DEMO GRATIS" (no precios)
2. Al hacer click en un agent mini-card → se abre el modal
3. El modal NO muestra precio individual ni "Comprar ahora"
4. El modal muestra badge verde "Incluido en tu plan" y botón "Elegir mi setup ↓"
5. Al hacer click en "Elegir mi setup ↓" → el modal se cierra y hace scroll suave a la sección #setup

- [ ] **Step 6: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add catalogo/index.html
git commit -m "feat: actualizar modal de agente — badge incluido en plan + CTA scroll a setup"
```

---

## Task 5: Precios — actualizar copy para power users

**Files:**
- Modify: `precios/index.html` (sección hero, líneas ~403-435)

- [ ] **Step 1: Actualizar el hero kicker**

En `precios/index.html`, reemplazar:

```html
        <div class="hero-kicker">SETUP &amp; PRECIOS</div>
```

Por:

```html
        <div class="hero-kicker">BLUEPRINTS INDIVIDUALES</div>
```

- [ ] **Step 2: Actualizar el h1**

Reemplazar:

```html
            De cero a tu primer agente activo en menos de 24 horas.
```

Por:

```html
            Blueprints listos para importar — para quienes ya usan Make.com.
```

- [ ] **Step 3: Actualizar el párrafo sub**

Reemplazar:

```html
            Elige cu&aacute;nta ayuda quieres. Todos los caminos terminan con tu agente funcionando.
```

Por:

```html
            Ya conoces Make.com y solo necesitas el archivo. Descarga, importa y activa en 15 minutos.
```

- [ ] **Step 4: Agregar link de retorno al catálogo**

Después del bloque `.hero-links` (~línea 433), agregar:

```html
        <p style="margin-top:20px;font-size:0.85rem;color:var(--muted);">
            ¿Prefieres que te ayudemos a configurarlo?
            <a href="/catalogo/#setup" style="color:var(--primary);font-weight:600;">Ver planes con setup incluido &rarr;</a>
        </p>
```

- [ ] **Step 5: Verificar en browser**

```bash
python3 -m http.server 8000
```

Verificar en http://localhost:8000/precios/:
1. El hero dice "BLUEPRINTS INDIVIDUALES"
2. El h1 refleja el enfoque power user
3. El link "Ver planes con setup incluido" aparece y navega a /catalogo/#setup correctamente

- [ ] **Step 6: Commit**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git add precios/index.html
git commit -m "feat: actualizar /precios/ como página secundaria para power users de Make.com"
```

---

## Verificación final del flujo completo

- [ ] **Verificar flujo completo**

Con `python3 -m http.server 8000`:

1. **Home → Catálogo por CTA:** Ir a http://localhost:8000 → click "Automatiza tu negocio →" → llega a /catalogo/ (vista selector)
2. **Home → Catálogo por pill:** Click en "🏥 Consultorio" → llega a /catalogo/#clinica con vista de solución activa automáticamente
3. **Catálogo → Agente → Modal → Setup:** En vista de solución, click en un agente → modal abre sin precio → click "Elegir mi setup ↓" → modal cierra y scroll a #setup
4. **Catálogo → Setup → Stripe:** En sección #setup, click en "Empezar →" ($19) → abre Stripe en nueva pestaña
5. **Catálogo → Power user:** Link "Descarga individual desde $19" al pie de #setup → abre /precios/
6. **Precios → Catálogo:** En /precios/, link "Ver planes con setup incluido →" → va a /catalogo/#setup

- [ ] **Commit final de verificación**

```bash
cd "/Users/fernandoangulo/Sitios web/05-agentesva"
git log --oneline -6
```

Deben aparecer los 5 commits de este plan + el commit del spec.
