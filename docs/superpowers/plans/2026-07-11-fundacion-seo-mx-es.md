# Fundación Técnica SEO (MX + España) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrumentar medición (GA4 con consentimiento GDPR), quitar el sesgo geo España-only y self-hostear las fuentes, para que agentesva.com sea medible y elegible en México y España.

**Architecture:** Sitio Astro 7 estático en Vercel. Un módulo externo `src/scripts/consent.ts` (CSP-safe, `script-src 'self'`) gestiona Google Consent Mode v2 (default `denied`), persistencia en `localStorage` e inyección diferida de `gtag.js` sólo tras aceptación; un componente `ConsentBanner.astro` aporta la UI y se monta en `BaseLayout`. Las señales geo viven en `BaseLayout.astro`; la CSP en `vercel.json`. Las fuentes pasan a self-host vía paquetes `@fontsource`.

**Tech Stack:** Astro 7, TypeScript, Vitest + happy-dom, `@fontsource`/`@fontsource-variable`, Google Analytics 4 (gtag.js + Consent Mode v2), Vercel headers.

---

## File Structure

- `package.json` — añade dependencias `@fontsource*`.
- `src/layouts/BaseLayout.astro` — quita `<link>`/`preconnect` a Google Fonts; quita meta geo España; ajusta `og:locale`; añade `hreflang`; importa fuentes fontsource; monta `<ConsentBanner />`.
- `src/styles/global.css` — actualiza las CSS vars `--sans`/`--mono` a las familias variable de fontsource (fallbacks intactos).
- `src/scripts/consent.ts` — **nuevo**. Lógica testeable de Consent Mode + carga GA4 + wiring del banner.
- `src/components/ConsentBanner.astro` — **nuevo**. Markup del banner + `<script>` que importa e inicializa `consent.ts`.
- `tests/consent.test.ts` — **nuevo**. Tests unitarios de `consent.ts`.
- `vercel.json` — CSP: quita dominios Google Fonts, añade dominios GA4.
- `src/pages/cookies.astro` — declara GA4; corrige el texto "no hace falta banner".
- `src/pages/privacidad.astro` — añade GA4 como tercero/encargado.
- `.env.example` — documenta `PUBLIC_GA4_ID`.

**Orden de tareas:** 0 (prereq) → 1 (fuentes, independiente) → 2 (geo, independiente) → 3 (consent.ts + tests) → 4 (banner + CSP GA4) → 5 (legales) → 6 (verificación). Tareas 1 y 2 son de bajo riesgo y aisladas; 3–4 son el núcleo; 5 acompaña legalmente; 6 verifica end-to-end.

---

## Task 0 (Prerequisito humano): Propiedad GA4 + variable de entorno

Esta tarea NO es de código: requiere acciones del dueño del sitio. Documentarla y confirmarla antes de la Task 3.

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Crear la propiedad GA4 (manual)**

El dueño crea una propiedad Google Analytics 4 en https://analytics.google.com para el dominio `agentesva.com` y copia el **Measurement ID** (formato `G-XXXXXXXXXX`).

- [ ] **Step 2: Configurar la variable de entorno en Vercel (manual)**

En Vercel → Project → Settings → Environment Variables, añadir `PUBLIC_GA4_ID = G-XXXXXXXXXX` para Production y Preview. El prefijo `PUBLIC_` hace que Astro la exponga al cliente.

- [ ] **Step 3: Documentar la variable en `.env.example`**

Añadir al final de `.env.example`:

```
# Google Analytics 4 — Measurement ID (formato G-XXXXXXXXXX).
# Si está vacío, no se carga analytics ni se muestra el banner de consentimiento.
PUBLIC_GA4_ID=
```

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "docs(env): documenta PUBLIC_GA4_ID para GA4"
```

---

## Task 1: Self-host de fuentes (Core Web Vitals)

Elimina la dependencia externa de Google Fonts (bloqueo de render + tercero). Usa `@fontsource` (woff2 servidos desde el propio bundle, `font-display: swap` por defecto).

**Files:**
- Modify: `package.json` (vía npm install)
- Modify: `src/layouts/BaseLayout.astro` (frontmatter + head)
- Modify: `src/styles/global.css:27-29`
- Modify: `vercel.json` (CSP style-src/font-src)

- [ ] **Step 1: Instalar los paquetes fontsource**

Run:
```bash
npm install @fontsource/dm-serif-display @fontsource-variable/dm-sans @fontsource-variable/jetbrains-mono
```
Expected: se añaden 3 dependencias, `found 0 vulnerabilities`.

- [ ] **Step 2: Importar las fuentes en el frontmatter de `BaseLayout.astro`**

En `src/layouts/BaseLayout.astro`, dentro del bloque frontmatter (`---`), tras `import '../styles/global.css';`, añadir:

```astro
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/jetbrains-mono';
```

- [ ] **Step 3: Quitar el `<link>` y `preconnect` a Google Fonts del `<head>`**

En `src/layouts/BaseLayout.astro`, eliminar estas líneas del `<head>`:

```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 4: Actualizar los nombres de familia en `global.css`**

Las fuentes variable de fontsource exponen familias `DM Sans Variable` y `JetBrains Mono Variable`. En `src/styles/global.css`, reemplazar las líneas 27-29:

```css
  --serif: 'DM Serif Display', Georgia, 'Times New Roman', serif;
  --sans: 'DM Sans', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
```

por:

```css
  --serif: 'DM Serif Display', Georgia, 'Times New Roman', serif;
  --sans: 'DM Sans Variable', 'DM Sans', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
```

- [ ] **Step 5: Quitar los dominios de Google Fonts de la CSP**

En `vercel.json`, en el valor de `Content-Security-Policy`:
- En `style-src`, quitar ` https://fonts.googleapis.com` → queda `style-src 'self' 'unsafe-inline';`
- En `font-src`, quitar ` https://fonts.gstatic.com` → queda `font-src 'self' data:;`

El valor completo resultante de la CSP tras este paso:

```
default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
```

- [ ] **Step 6: Build y verificación de que no queda referencia a Google Fonts**

Run:
```bash
npm run build && grep -rc "fonts.googleapis.com\|fonts.gstatic.com" dist/ .vercel/output/ 2>/dev/null | grep -v ':0' || echo "OK: sin referencias a Google Fonts"
```
Expected: `OK: sin referencias a Google Fonts` y build sin errores.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/layouts/BaseLayout.astro src/styles/global.css vercel.json
git commit -m "perf(fonts): self-host DM Serif/DM Sans/JetBrains Mono vía fontsource"
```

---

## Task 2: Señales geo España → es neutro (MX + España)

Quita el encasillamiento a España y presenta el sitio como español-neutro elegible en ambos mercados.

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (head)

- [ ] **Step 1: Eliminar los meta geo España-only**

En `src/layouts/BaseLayout.astro`, eliminar estas dos líneas del `<head>`:

```astro
    <meta name="geo.placename" content="España" />
    <meta name="geo.region" content="ES" />
```

- [ ] **Step 2: Neutralizar `og:locale` y declarar alternativa MX**

En `src/layouts/BaseLayout.astro`, reemplazar:

```astro
    <meta property="og:locale" content="es_ES" />
```

por:

```astro
    <meta property="og:locale" content="es" />
    <meta property="og:locale:alternate" content="es_MX" />
    <meta property="og:locale:alternate" content="es_ES" />
```

- [ ] **Step 3: Añadir hreflang `es` + `x-default`**

En `src/layouts/BaseLayout.astro`, justo debajo de `<link rel="canonical" href={canonical} />`, añadir:

```astro
    <link rel="alternate" hreflang="es" href={canonical} />
    <link rel="alternate" hreflang="x-default" href={canonical} />
```

- [ ] **Step 4: Build y verificación del HTML servido**

Run:
```bash
npm run build && grep -c 'geo.placename\|content="es_ES"' dist/index.html; grep -c 'hreflang="x-default"' dist/index.html
```
Expected: primer `grep` → `0` (sin señales España-only); segundo → `1` (hreflang presente). Build sin errores.

> Nota: si el output estático no está en `dist/` sino en `.vercel/output/static/`, ajustar la ruta del grep a `.vercel/output/static/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "seo(geo): quita señales España-only, es neutro + hreflang es/x-default"
```

---

## Task 3: Módulo `consent.ts` (Consent Mode v2 + carga GA4) con tests

Lógica pura y testeable, sin depender de env (el `id` se pasa por parámetro). GA4 nunca se carga hasta `granted`.

**Files:**
- Create: `src/scripts/consent.ts`
- Test: `tests/consent.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `tests/consent.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CONSENT_KEY,
  getConsent,
  setConsent,
  isGA4Loaded,
  grantConsent,
  denyConsent,
  initConsentMode,
} from '../src/scripts/consent';

const GA_ID = 'G-TEST123';

beforeEach(() => {
  localStorage.clear();
  document.head.querySelectorAll('script[data-ga4]').forEach((s) => s.remove());
  // @ts-expect-error reset dataLayer entre tests
  window.dataLayer = undefined;
});

describe('consent state', () => {
  it('getConsent devuelve null sin elección previa', () => {
    expect(getConsent()).toBeNull();
  });

  it('setConsent persiste en localStorage', () => {
    setConsent('granted');
    expect(localStorage.getItem(CONSENT_KEY)).toBe('granted');
    expect(getConsent()).toBe('granted');
  });
});

describe('initConsentMode', () => {
  it('inicializa dataLayer con consent default denegado', () => {
    initConsentMode();
    // @ts-expect-error dataLayer inyectado
    const events = window.dataLayer as unknown[];
    expect(Array.isArray(events)).toBe(true);
    const hasDefaultDenied = events.some(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'default' &&
        (e[2] as Record<string, string>).analytics_storage === 'denied',
    );
    expect(hasDefaultDenied).toBe(true);
  });
});

describe('grant / deny', () => {
  it('denyConsent no carga GA4 y persiste denied', () => {
    initConsentMode();
    denyConsent();
    expect(getConsent()).toBe('denied');
    expect(isGA4Loaded()).toBe(false);
  });

  it('grantConsent carga gtag.js y persiste granted', () => {
    initConsentMode();
    grantConsent(GA_ID);
    expect(getConsent()).toBe('granted');
    expect(isGA4Loaded()).toBe(true);
    const tag = document.head.querySelector('script[data-ga4]') as HTMLScriptElement;
    expect(tag).not.toBeNull();
    expect(tag.src).toContain('googletagmanager.com/gtag/js');
    expect(tag.src).toContain(GA_ID);
  });

  it('grantConsent es idempotente (no duplica el script)', () => {
    initConsentMode();
    grantConsent(GA_ID);
    grantConsent(GA_ID);
    expect(document.head.querySelectorAll('script[data-ga4]').length).toBe(1);
  });

  it('grantConsent empuja un consent update a granted', () => {
    initConsentMode();
    grantConsent(GA_ID);
    // @ts-expect-error dataLayer inyectado
    const events = window.dataLayer as unknown[];
    const hasUpdateGranted = events.some(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update' &&
        (e[2] as Record<string, string>).analytics_storage === 'granted',
    );
    expect(hasUpdateGranted).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutar los tests para verificar que fallan**

Run: `npm test -- consent`
Expected: FAIL — `Cannot find module '../src/scripts/consent'`.

- [ ] **Step 3: Implementar `consent.ts`**

Crear `src/scripts/consent.ts`:

```typescript
// Google Consent Mode v2 + carga diferida de GA4 (cliente). CSP-safe: módulo externo
// (script-src 'self'); gtag.js se inyecta dinámicamente sólo tras aceptar. GDPR: default
// denegado, no se carga analytics ni cookies hasta consentimiento explícito.

export const CONSENT_KEY = 'agv-consent';

type ConsentValue = 'granted' | 'denied';

function dataLayer(): unknown[] {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

// gtag empuja `arguments` (array-like) al dataLayer; replicamos el patrón oficial.
function gtag(...args: unknown[]): void {
  dataLayer().push(args);
}

export function getConsent(): ConsentValue | null {
  const v = localStorage.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function setConsent(value: ConsentValue): void {
  localStorage.setItem(CONSENT_KEY, value);
}

export function isGA4Loaded(): boolean {
  return document.head.querySelector('script[data-ga4]') !== null;
}

// Estado por defecto: todo denegado. Se llama en cada carga, antes de nada.
export function initConsentMode(): void {
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

function loadGA4(id: string): void {
  if (isGA4Loaded()) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.setAttribute('data-ga4', '1');
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', id);
}

export function grantConsent(id: string): void {
  setConsent('granted');
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
  loadGA4(id);
}

export function denyConsent(): void {
  setConsent('denied');
  gtag('consent', 'update', { analytics_storage: 'denied' });
}
```

- [ ] **Step 4: Ejecutar los tests para verificar que pasan**

Run: `npm test -- consent`
Expected: PASS (todos los tests de `consent.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/consent.ts tests/consent.test.ts
git commit -m "feat(consent): Consent Mode v2 + carga diferida de GA4 (testeado)"
```

---

## Task 4: Componente `ConsentBanner` + wiring + CSP de GA4

UI del banner y su cableado; sólo se muestra si no hay elección previa y si `PUBLIC_GA4_ID` está definido. Añade los dominios GA4 a la CSP.

**Files:**
- Create: `src/components/ConsentBanner.astro`
- Modify: `src/scripts/consent.ts` (añade `initConsent` + `wireBanner`)
- Modify: `tests/consent.test.ts` (tests de wiring)
- Modify: `src/layouts/BaseLayout.astro` (monta el banner)
- Modify: `vercel.json` (CSP GA4)

- [ ] **Step 1: Escribir los tests de wiring que fallan**

Añadir a `tests/consent.test.ts` (import ampliado arriba y nuevo bloque abajo):

Cambiar la línea de import inicial para incluir `initConsent`:

```typescript
import {
  CONSENT_KEY,
  getConsent,
  setConsent,
  isGA4Loaded,
  grantConsent,
  denyConsent,
  initConsentMode,
  initConsent,
} from '../src/scripts/consent';
```

Añadir al final del archivo:

```typescript
function mountBanner(): HTMLElement {
  document.body.innerHTML = `
    <div data-consent-banner hidden>
      <button data-consent-accept>Aceptar</button>
      <button data-consent-reject>Rechazar</button>
    </div>`;
  return document.querySelector('[data-consent-banner]') as HTMLElement;
}

describe('initConsent (wiring del banner)', () => {
  it('muestra el banner si no hay elección previa', () => {
    const banner = mountBanner();
    initConsent('G-TEST123');
    expect(banner.hidden).toBe(false);
    expect(isGA4Loaded()).toBe(false);
  });

  it('aceptar carga GA4, persiste granted y oculta el banner', () => {
    const banner = mountBanner();
    initConsent('G-TEST123');
    banner.querySelector<HTMLButtonElement>('[data-consent-accept]')!.click();
    expect(getConsent()).toBe('granted');
    expect(isGA4Loaded()).toBe(true);
    expect(banner.hidden).toBe(true);
  });

  it('rechazar persiste denied, no carga GA4 y oculta el banner', () => {
    const banner = mountBanner();
    initConsent('G-TEST123');
    banner.querySelector<HTMLButtonElement>('[data-consent-reject]')!.click();
    expect(getConsent()).toBe('denied');
    expect(isGA4Loaded()).toBe(false);
    expect(banner.hidden).toBe(true);
  });

  it('si ya había granted, carga GA4 sin mostrar el banner', () => {
    const banner = mountBanner();
    setConsent('granted');
    initConsent('G-TEST123');
    expect(isGA4Loaded()).toBe(true);
    expect(banner.hidden).toBe(true);
  });

  it('si ya había denied, ni carga GA4 ni muestra el banner', () => {
    const banner = mountBanner();
    setConsent('denied');
    initConsent('G-TEST123');
    expect(isGA4Loaded()).toBe(false);
    expect(banner.hidden).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutar para verificar que fallan**

Run: `npm test -- consent`
Expected: FAIL — `initConsent is not a function` (o import no resuelto).

- [ ] **Step 3: Implementar `initConsent` y el wiring en `consent.ts`**

Añadir al final de `src/scripts/consent.ts`:

```typescript
function wireBanner(banner: HTMLElement, id: string): void {
  const accept = banner.querySelector<HTMLButtonElement>('[data-consent-accept]');
  const reject = banner.querySelector<HTMLButtonElement>('[data-consent-reject]');
  accept?.addEventListener('click', () => {
    grantConsent(id);
    banner.hidden = true;
  });
  reject?.addEventListener('click', () => {
    denyConsent();
    banner.hidden = true;
  });
}

// Punto de entrada de página: fija el default denegado, respeta la elección previa
// (carga GA4 si ya se aceptó) y, si no hay elección, muestra y cablea el banner.
export function initConsent(id: string): void {
  initConsentMode();
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  const prior = getConsent();
  if (prior === 'granted') {
    grantConsent(id);
    if (banner) banner.hidden = true;
    return;
  }
  if (prior === 'denied') {
    if (banner) banner.hidden = true;
    return;
  }
  if (banner) {
    banner.hidden = false;
    wireBanner(banner, id);
  }
}
```

- [ ] **Step 4: Ejecutar para verificar que pasan**

Run: `npm test -- consent`
Expected: PASS (todos, incluidos los nuevos de wiring).

- [ ] **Step 5: Crear el componente `ConsentBanner.astro`**

Crear `src/components/ConsentBanner.astro`:

```astro
---
// Banner de consentimiento de cookies (GDPR). Sólo se renderiza si PUBLIC_GA4_ID
// está definido. El wiring y la carga de GA4 los hace src/scripts/consent.ts,
// que se inicializa en el <script> de abajo (externo → CSP-safe).
const gaId = import.meta.env.PUBLIC_GA4_ID;
---

{gaId && (
  <div
    data-consent-banner
    hidden
    role="dialog"
    aria-live="polite"
    aria-label="Aviso de cookies"
    style="position: fixed; bottom: 16px; left: 16px; right: 16px; max-width: 560px; margin: 0 auto; z-index: 60; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 8px; padding: 16px 18px; box-shadow: 0 8px 30px rgba(0,0,0,0.4);"
  >
    <p style="margin: 0 0 12px; font-family: var(--sans); font-size: 13px; color: var(--fg-2); line-height: 1.5;">
      Usamos cookies de analítica (Google Analytics) para entender qué contenido es útil.
      Podés aceptarlas o rechazarlas. Más info en <a href="/cookies" style="color: var(--accent); text-decoration: underline;">Cookies</a>.
    </p>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        data-consent-accept
        style="font-family: var(--sans); font-weight: 600; font-size: 13px; color: #fff; background: var(--accent); border: none; border-radius: 6px; padding: 9px 16px; cursor: pointer;"
      >
        Aceptar
      </button>
      <button
        data-consent-reject
        style="font-family: var(--sans); font-weight: 500; font-size: 13px; color: var(--fg-2); background: transparent; border: 1px solid var(--line-2); border-radius: 6px; padding: 9px 16px; cursor: pointer;"
      >
        Rechazar
      </button>
    </div>
  </div>
)}

<script>
  // NOTA Astro: los <script> se bundlean siempre (no son condicionales), por eso
  // va FUERA del `{gaId && ...}`. El guard `if (id)` evita hacer nada sin GA4 ID.
  import { initConsent } from '../scripts/consent';
  const id = import.meta.env.PUBLIC_GA4_ID;
  if (id) initConsent(id);
</script>
```

- [ ] **Step 6: Montar el banner en `BaseLayout.astro`**

En `src/layouts/BaseLayout.astro`, importar el componente en el frontmatter (junto a los otros imports):

```astro
import ConsentBanner from '../components/ConsentBanner.astro';
```

Y en el `<body>`, justo después de `<slot />`, añadir:

```astro
    <ConsentBanner />
```

- [ ] **Step 7: Añadir los dominios GA4 a la CSP**

En `vercel.json`, en el valor de `Content-Security-Policy`:
- En `script-src`, añadir ` https://www.googletagmanager.com`
- En `connect-src`, añadir ` https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`

El valor completo resultante de la CSP tras este paso (asume Task 1 ya aplicada):

```
default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
```

- [ ] **Step 8: Build + tests completos**

Run:
```bash
npm run build && npm test
```
Expected: build sin errores; todos los tests PASS (incluye `consent.test.ts` y los 52 previos).

- [ ] **Step 9: Commit**

```bash
git add src/components/ConsentBanner.astro src/scripts/consent.ts tests/consent.test.ts src/layouts/BaseLayout.astro vercel.json
git commit -m "feat(consent): banner GDPR + monta GA4 tras aceptar + CSP para GA4"
```

---

## Task 5: Actualizar páginas legales (cookies + privacidad)

Declarar GA4 conforme a GDPR y corregir el texto obsoleto que afirma que no hay cookies de terceros.

**Files:**
- Modify: `src/pages/cookies.astro`
- Modify: `src/pages/privacidad.astro`

- [ ] **Step 1: Localizar el texto obsoleto en `cookies.astro`**

Run:
```bash
grep -n "no instalamos cookies de terceros\|no es necesario un banner\|Documento de partida\|Si se añade analítica" src/pages/cookies.astro
```
Expected: devuelve las líneas a editar (alrededor de las líneas 42 y 66 según la exploración).

- [ ] **Step 2: Reescribir la sección de cookies de terceros en `cookies.astro`**

Sustituir el párrafo que dice que no se instalan cookies de terceros / no hace falta banner por una declaración de GA4. Usar este texto (ajustar el elemento contenedor `<p>`/`<li>` al patrón existente de la página):

```astro
        Usamos <strong>Google Analytics 4</strong> (Google Ireland Ltd.) para medir de forma
        agregada qué contenido es útil. Estas cookies analíticas <strong>solo se instalan si las
        aceptás</strong> en el banner de consentimiento; por defecto están bloqueadas (Google
        Consent Mode v2). Base legal: tu consentimiento (art. 6.1.a RGPD), revocable en cualquier
        momento borrando las cookies del navegador. Cookies principales: <code>_ga</code> y
        <code>_ga_&lt;ID&gt;</code>, con una duración de hasta 24 meses.
```

- [ ] **Step 3: Eliminar la nota "Documento de partida / Si se añade analítica"**

En `src/pages/cookies.astro`, borrar la nota que dice que es un documento de partida y que "si se añade analítica (p. ej. Google Analytics, Plausible)…", ya que la analítica ya está añadida y descrita.

- [ ] **Step 4: Declarar GA4 en `privacidad.astro`**

En `src/pages/privacidad.astro`, en la sección de terceros / encargados del tratamiento (buscar con `grep -n "terceros\|encargado\|Brevo\|Vercel" src/pages/privacidad.astro` para encontrar el patrón), añadir una entrada:

```astro
        <strong>Google Analytics 4</strong> (Google Ireland Ltd.) — analítica web agregada.
        Solo se activa con tu consentimiento. Consultá la
        <a href="/cookies" style="color: var(--accent); text-decoration: underline;">política de cookies</a>.
```

- [ ] **Step 5: Build y verificación**

Run:
```bash
npm run build && grep -c "Google Analytics" src/pages/cookies.astro src/pages/privacidad.astro
```
Expected: build sin errores; cada archivo devuelve ≥1.

- [ ] **Step 6: Commit**

```bash
git add src/pages/cookies.astro src/pages/privacidad.astro
git commit -m "legal: declara GA4 en cookies y privacidad (base legal consentimiento)"
```

---

## Task 6: Verificación end-to-end (preview + post-deploy)

No introduce código; valida el sistema completo. Se ejecuta sobre el preview de Vercel de la PR y, tras merge, en producción.

**Files:** ninguno (verificación).

- [ ] **Step 1: Build y suite completa en local**

Run: `npm run build && npm test`
Expected: build OK; 100% de tests PASS.

- [ ] **Step 2: Abrir PR y esperar el preview de Vercel**

Run: `gh pr create --base main --head <rama> --title "feat(seo): fundación técnica MX+España (GA4+geo+fuentes)" --body "..."` y esperar checks verdes (`test` + `Vercel`).

- [ ] **Step 3: Checklist manual en el preview**

En la URL de preview de Vercel, verificar:
- El **banner de consentimiento aparece** en la primera visita (sin elección previa).
- En DevTools → Network, **no hay request a `googletagmanager.com`** antes de aceptar.
- Al pulsar **Aceptar**: se carga `gtag/js`, el banner desaparece y al recargar no reaparece.
- Al pulsar **Rechazar** (en sesión limpia / borrando `localStorage`): no se carga GA4 y el banner no reaparece.
- En "View Source" del HTML: **no** aparecen `geo.placename`, `geo.region` ni `content="es_ES"`; **sí** aparecen `hreflang="es"` y `hreflang="x-default"`.
- En Network → filtro Fonts: las fuentes se sirven desde el **propio dominio** (no `fonts.gstatic.com`).
- La consola no muestra **violaciones de CSP**.

- [ ] **Step 4: Verificación post-deploy (tras merge)**

- En GA4 → **Realtime**, confirmar que llegan eventos tras aceptar cookies en producción.
- En GA4, confirmar que el desglose por país separa **México** y **España**.
- Confirmar en Search Console que el sitemap sigue enviándose sin errores nuevos.

- [ ] **Step 5: Marcar la fase como completa**

Actualizar el estado del spec `docs/superpowers/specs/2026-07-10-fundacion-seo-mx-es-design.md` a "Implementado" y anotar la fecha de deploy.

---

## Notas de implementación

- **Sin `PUBLIC_GA4_ID`:** `ConsentBanner.astro` no renderiza nada y no se carga GA4 — el sitio funciona igual. Esto permite mergear el código antes de que exista la propiedad GA4 (Task 0) sin romper nada.
- **CSP:** los cambios de Task 1 (quitar Google Fonts) y Task 4 (añadir GA4) se combinan en el mismo header. El bloque de CSP "resultante" de Task 4 ya asume ambos.
- **Ruta del output estático:** Astro+Vercel puede emitir en `dist/` o `.vercel/output/static/`. Si un `grep` de verificación da vacío, probar la otra ruta.
- **CI:** el workflow `.github/workflows/test.yml` correrá `npm test` en la PR; `consent.test.ts` entra automáticamente por el glob `tests/**/*.test.ts`.
