# Brief de Negocio — AgentesVA: Directorio / Medio de IA en español

- **Fecha:** 2026-06-21
- **Autor:** Fernando Angulo
- **Estado:** Modelo de negocio CERRADO (pre-spec técnica)
- **Sustituye a:** `2026-06-21-agentesva-newsletter-business-brief.md` (el proyecto evolucionó de "newsletter" a "directorio/medio")
- **Voz/marca:** [`docs/brand-guidelines.md`](../../brand-guidelines.md) · **Diseño visual:** [`DESIGN.md`](../../DESIGN.md)
- **Referencias:** [aitools.fyi](https://aitools.fyi/) (directorio) · [Grow With AI](https://growwithaiguide.substack.com/) (newsletter) · [Authority.md](https://authority.md/) (tienda)

---

## 1. Resumen ejecutivo

**AgentesVA** se convierte en un **sitio NUEVO e independiente**: un **directorio / medio de IA en español** (España + LATAM) con noticias, estudios, cursos, herramientas y recursos. El modelo combina lo mejor de tres referentes en **una escalera de valor de 3 capas**:

1. **Directorio** (modelo aitools.fyi) — motor de tráfico SEO; gana desde el día 1 con **afiliados**.
2. **Newsletter** (modelo Grow With AI) — convierte ese tráfico en **lista propia** (el activo).
3. **Tienda** (modelo Authority.md) — monetiza la confianza con **producto propio** (packs de skills/prompts, cursos).

**Tipo de negocio:** medio de afiliación / contenido. **No** es SaaS ni agencia. **Motor económico:** tráfico SEO × monetización por capa.

**Contexto:** Citable.agency es el otro proyecto del fundador (el fuerte). AgentesVA arranca limpio: **se borra el sitio de consultoría anterior** (de forma segura, ver §10).

## 2. Qué es / qué NO es

- **ES:** un directorio-medio de IA en español, gratuito para el usuario, monetizado por afiliados + publicidad + (a futuro) vendors, membership y producto propio.
- **NO ES:** un SaaS, una agencia, ni el embudo de consultoría anterior. No arrastra nada del AgentesVA viejo.
- **Audiencia doble:**
  - **Visitante** (consumidor): busca herramientas/cursos/noticias de IA. No paga (clica afiliados, se suscribe gratis).
  - **Vendor/anunciante** (proveedor): quiere aparecer/destacar. Paga (a futuro: listados destacados, banners, empleos).

## 3. Las 3 capas y el flujo

```
Entradas SEO (herramientas · noticias · estudios · cursos · empleos)
   │
   ▼
DIRECTORIO + contenido ──► clic afiliado  ............ $ HOY
   │
   ▼ (se suscribe, gancho = Pack 30 prompts)
NEWSLETTER / lista propia ──► 1 email/semana ──► ↺ devuelve tráfico al directorio
   │                                              + referidos (viral)
   ▼ (a la confianza se le vende)
TIENDA + patrocinios ──► packs/skills, cursos propios, patrocinios .... $ LUEGO
```

El directorio **ya gana** (afiliados) mientras construye la lista. Eso resuelve el agujero del CEO review: una newsletter sola necesita volumen para monetizar; un directorio gana desde el primer visitante.

## 4. Secciones del sitio

| Sección | Rol | SEO |
|---|---|---|
| `/` Home | Hero buscador + categorías + captura newsletter | marca |
| `/herramientas` + `/herramienta/[slug]` | Directorio (fichas → salida afiliado) | long-tail por tool |
| `/cursos` | Cursos gratis + de pago (afiliado); propios a futuro | 🟢 alto valor (CPC 2,24) |
| `/noticias` · `/estudios` | Contenido (RSS + original) | combustible SEO |
| `/recursos` | Packs/plantillas/prompts (gratis + afiliado) | medio |
| `/empleos` | Tablón de empleos IA (gratis ahora) | bajo (mayor en LATAM) |
| `/newsletter` | Landing de suscripción (diseñada, estilo Substack neutro) | conversión |
| `/packs` (tienda) | Skills `.md` + prompts + plantillas de pago | Fase posterior |
| `/destacar` · `/enviar-herramienta` | Monetización de vendors | Fase posterior |

## 5. Monetización por horizonte temporal

| Horizonte | Fuente | Notas |
|---|---|---|
| **HOY** | Afiliados (herramientas, cursos, deals) | desde el visitante #1, sin lista |
| **PRONTO** | Publicidad display (red) + **banners propios** | requiere algo de tráfico |
| **LUEGO** | Listados destacados (vendors) | el vendor paga por posición/badge |
| **LUEGO** | Empleos de pago | gratis ahora para llenar el tablón |
| **LUEGO** | Membership premium | acceso/ventajas de pago |
| **LUEGO** | Venta de **skills/prompts/plantillas** (tienda Authority.md) | escalera 4,99 / 14,99 / 29,99 € |
| **LUEGO** | **Cursos propios** | el escalón más caro |
| **LUEGO** | Patrocinios newsletter | requiere volumen |
| (motor) | Referidos | crecimiento viral de la lista |

## 6. Estrategia de contenido — CURADO, no copiar

**Decisión:** NO copiar/traducir de los referentes (infracción de copyright + penalización SEO por contenido duplicado). Ruta híbrida:
1. **Semrush** decide qué priorizar (keywords reales).
2. **Fuentes legales/primarias** para los datos (webs de tools, Product Hunt, GitHub, APIs; noticias vía RSS con atribución; empleos vía feeds/APIs).
3. **Claude** escribe descripciones **originales en español** a escala + resúmenes, con `docs/blog-fact-checking-protocol.md`.

### Datos Semrush (ES + MX, 2026-06-21)

| Keyword | ES vol | MX vol | CPC € | Implicación |
|---|---|---|---|---|
| inteligencia artificial **gratis** | 12.100 | 9.900 | ~0,5 | 🟢 Liderar con "gratis" (tools/cursos/recursos) |
| chatgpt en español | 1.900 | 1.000 | 0,1 | páginas por herramienta rankean |
| **cursos de ia** | 1.300 | 880 | **2,24** | 🟢 cursos = pilar rentable |
| herramientas de ia | 480 | 720 | ~0,5 | usar "IA" (abreviatura) en URLs/títulos |
| cursos de inteligencia artificial gratis | 720 | 260 | — | refuerza "cursos gratis" |
| ia para empresas | 390 | — | **4,44** | B2B premium para afiliados caros |
| empleos inteligencia artificial | 20 | 170 | — | empleos = SEO pequeño, mayor en LATAM |

**Conclusiones:** (1) liderar con el ángulo **GRATIS**; (2) **cursos** es pilar fuerte; (3) usar **"IA"** no solo "inteligencia artificial"; (4) español **neutro** sirve para ES+MX. *(Pendiente: pull long-tail por categoría para el árbol de contenido completo.)*

## 7. SEO / GEO / AI-SEO (primera clase)

- **Técnico:** Astro estático (rápido), URLs limpias, sitemap, **schema.org** (`SoftwareApplication`, `Course`, `JobPosting`, `Article`, `ItemList`, `BreadcrumbList`, `FAQPage`), canonical, **hreflang** (es-ES / es-419), RSS.
- **GEO / AI-SEO:** contenido en forma de respuesta + entidades + comparativas ("alternativas a X", "mejores herramientas para Y") = citable por ChatGPT/Perplexity. (Era el producto del viejo AgentesVA: comer la propia comida.)
- **Keywords:** árbol de contenido guiado por Semrush.

## 8. Stack / Infraestructura

| Necesidad | Estado | Fase 1 (mínimo) | Más adelante |
|---|---|---|---|
| Framework | ✅ Astro | Astro (hybrid si hace falta) | — |
| Base de datos | ❌ no hay | Content collections (MD/JSON) o DB ligera (Turso/Neon) | Neon Postgres |
| Búsqueda | ❌ | Pagefind (estático, gratis) | Algolia/Meilisearch |
| CMS | ❌ | Markdown en repo | Sanity/Directus/Payload |
| Auth + pagos | ❌ | — | Clerk + Lemon Squeezy/Stripe/Gumroad |
| Email | ✅ Brevo | doble opt-in (trabajo nuevo) | secuencias |
| Secrets | ✅ Doppler | — | — |
| Repo/CI | ✅ GitHub + Vercel (pago) | branch protection, Dependabot | — |
| Tareas | ⚠️ | **GitHub Projects** + gstack | — |
| Seguridad | parcial | Doppler, CSP/headers (ya), branch protection | Vercel WAF/BotID |

## 9. Fases del build

- **Fase 0 — Setup:** archivar sitio viejo (tag + borrado seguro), esqueleto Astro greenfield, decisión DB, fundación SEO (schema/sitemap/hreflang), Doppler, GitHub Projects, branch protection.
- **Fase 1 — MVP:** directorio de herramientas + contenido curado (foco "gratis") + `/cursos` + `/newsletter` (con doble opt-in) + afiliados + SEO.
- **Fase 2 — Crecimiento:** más contenido, display ads + banners, referidos, `/empleos`.
- **Fase 3 — Monetización profunda:** vendors destacados, empleos de pago, tienda de packs/skills, membership, cursos propios.

## 10. Borrado seguro del sitio anterior (Fase 0, tarea 1)

1. `git tag archive/consulting-v1` (rollback siempre posible).
2. Mismo repo + proyecto Vercel (conserva dominio/deploy).
3. Borrar páginas/marketing viejos; **conservar** `docs/` (briefs, voz, diagramas) + config de infra.
4. Greenfield en rama nueva, revisado antes de merge. **Confirmación explícita antes de ejecutar.**

## 11. Métricas de éxito

Tráfico orgánico mensual · EPC de afiliados · tasa visita→suscriptor · nº de vendors de pago (futuro) · % de la lista que compra packs (futuro) · RPM de display (futuro).

## 12. Riesgos vivos

- **Incumbente** "IA en Español" (50k subs) en la capa newsletter; diferenciar con el directorio (no compite ahí) + sub-ángulo.
- **Demanda de pago no validada** (ES/LATAM): tienda/cursos propios bloqueados hasta validar (1 pack de pago vía Gumroad como test PRONTO, opcional).
- **Contenido copiado = riesgo legal + SEO** → mitigado por la ruta curada (§6).
- **Display ads** requieren umbrales de tráfico (AdSense bajo, Mediavine ~50k sesiones).
- **Coste de oportunidad / foco:** es un sitio de medios con muchas secciones → disciplina de fases obligatoria.

## 13. Decisiones (log)

| # | Decisión | Estado |
|---|---|---|
| Concepto | Directorio/medio de IA en español, sitio nuevo independiente | ✅ |
| Marca | AgentesVA (voz de marca, sin cara de fundador) | ✅ |
| Sitio anterior | Borrar (seguro, mismo repo + archivo) | ✅ confirmado |
| Repo | Mismo repo + tag de archivo | ✅ |
| Contenido | Curado (Semrush + fuentes legales + Claude), NO copiar | ✅ |
| Mercado | España + LATAM, español neutro | ✅ |
| Newsletter | Estilo Substack neutro, gancho "Pack 30 prompts" | ✅ diseñado |
| Venta skills/prompts | Sí (tienda Authority.md), horizonte LUEGO; test pronto opcional | ✅ |
| Vendors destacados | Sí, a futuro | ✅ |
| Ingresos nuevos | Display + banners propios, membership, empleos | ✅ |
| Herramienta de tareas | gstack + GitHub Projects | ✅ |

## 14. Preguntas abiertas (para la spec técnica)

- DB: ¿content collections vs Turso/Neon desde el principio?
- ¿Cuántas herramientas/categorías en el MVP? (depende del long-tail Semrush)
- ¿hreflang es-ES/es-419 o un solo español neutro sin variantes?
- ¿Test de pago (1 pack Gumroad) dentro del MVP o Fase 2?
