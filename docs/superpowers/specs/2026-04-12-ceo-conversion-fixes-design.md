# CEO Conversion Fixes — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Scope:** 6 conversion issues identified in CEO site review

---

## Context

After completing the buyer journey simplification (industry pills, #setup section, modal updates, color palette), a CEO-level review identified 6 remaining conversion gaps. All fixes target existing pages with surgical edits — no new pages, no structural refactoring.

**Files affected:**
- `index.html` (home — issues 5, 6)
- `catalogo/index.html` (catalog — issues 1, 2, 3)
- `catalogo/consultorio/index.html` (industry page — issue 4)

---

## Issue 1: Catalog Overwhelm (HIGH)

**Problem:** Default `/catalogo/` view shows all 42 agents at once. Users arriving without a hash see an overwhelming wall of cards.

**Fix:** Change the default catalog load behavior. When no hash is present, show the industry selector grid (already exists as `showSelector()`). The "Ver todos los agentes" becomes a secondary link within the selector, not the default.

**Implementation:**
- In the DOMContentLoaded handler (~line 3759), change the else branch (no hash) to call `showSelector()` instead of doing nothing (which falls through to showing all agents)
- Ensure `showSelector()` is the landing state — user must pick an industry or explicitly click "Ver todos"

---

## Issue 2: Total Cost Confusion (HIGH)

**Problem:** Setup tiers show $19/$49/$97 but the agent cost (included) and Make.com $9/mo recurring are not visible at the decision point.

**Fix:** Add transparency to the #setup section:
1. A callout strip above the 3 tier cards: "Cada plan incluye: agente completo + blueprint + Make.com desde $9/mes para ejecutarlo"
2. Under each tier price, add a muted line: "+ Make.com desde $9/mes"

**Implementation:**
- Add a `<div>` before the tier grid with the transparency callout
- Add a `<div>` after each `$19` / `$49` / `$97` price display with the Make.com cost note

---

## Issue 3: Too Many Decision Points (MEDIUM)

**Problem:** Current flow requires ~5 clicks to reach Stripe. CEO wants 3.

**Target flow:**
1. Click industry pill (home → catalog filtered)
2. Click "Elegir mi plan" CTA (solution view → scroll to #setup)
3. Click Stripe button (#setup tier)

**Fix:** Add a prominent CTA button at the bottom of each `showSolution()` view that scrolls to #setup, bypassing the agent modal entirely. The modal remains available for users who want details, but it's no longer required in the purchase path.

**Implementation:**
- In `showSolution()` function, after the agent mini-cards grid, append a CTA block:
  - Green button: "Elegir mi plan de setup ↓"
  - `onclick="scrollToSetup()"` (function already exists)
  - Muted text below: "o haz click en cualquier agente para ver detalles"

---

## Issue 4: Industry Page Too Generic (MEDIUM)

**Problem:** `/catalogo/consultorio/` has generic content. Dental/medical users need to see compliance, integrations, and ROI to trust the product.

**Fix:** Add 3 content blocks after the existing hero section:

### 4a. Compliance badges
Horizontal row of 3 badges:
- NOM-024-SSA3 (Mexico health data regulation)
- HIPAA-ready (US/international standard)
- Datos encriptados en tránsito y reposo

### 4b. Integrations
Row of integration icons with labels:
- WhatsApp Business (confirmaciones de cita)
- Google Calendar (agenda automática)
- Gmail (recordatorios y seguimiento)
- Google Sheets (historial de pacientes)

### 4c. ROI mini case study
Card with concrete numbers:
- "Consultorio dental con 3 dentistas"
- "Antes: 45 min/día en tareas administrativas"
- "Después: 5 min/día — el agente maneja citas, recordatorios y cobros"
- "Ahorro estimado: 40 horas/mes por consultorio"

---

## Issue 5: No Visual Walkthrough (MEDIUM)

**Problem:** No before/after visual showing what automation actually changes. Users can't picture the transformation.

**Fix:** Add a "Antes / Después" two-column section on the homepage between the Pain section and the Solution section.

**Left column (Antes — sin AgentesVA):**
- Copiar datos de pacientes a mano
- Responder WhatsApp uno por uno
- Recordar citas mentalmente
- Buscar facturas en carpetas
- Perder clientes por no contestar a tiempo

**Right column (Después — con AgentesVA):**
- Datos sincronizados automáticamente
- Respuestas instantáneas 24/7
- Recordatorios automáticos por WhatsApp
- Cobros y facturas en un click
- Cada mensaje contestado en < 2 min

**Visual treatment:** Left side uses muted/red-tinted X icons. Right side uses green check icons with primary color accent. Simple CSS grid, two columns on desktop, stacked on mobile.

---

## Issue 6: Make.com Dependency Prominent (LOW)

**Problem:** Make.com is the execution platform but only mentioned in FAQ and meta tags. Users don't know what powers the agents until deep in the funnel.

**Fix:** Add a trust/technology strip on the homepage, after the social proof stats bar and before the pain section. One line:

"Funciona con Make.com — la plataforma #1 de automatización sin código. Desde $9/mes."

**Visual treatment:** Subtle background (var(--bg3)), centered text, small font. Not a full section — just a thin strip that establishes the technology dependency early.

---

## What's NOT in scope

- No changes to precios/index.html (already repositioned for power users)
- No changes to other industry subpages (consultorio is the pilot)
- No new pages created
- No Stripe payment link changes
- No tracking/analytics changes
