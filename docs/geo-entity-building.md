# GEO — Plan de construcción de entidad (post PR #103)

Estado a 2026-07-02. El código (schema + robots) ya está en producción; lo que
queda son señales externas que ningún deploy puede fabricar. Orden por
apalancamiento:

## 1. Página de empresa en LinkedIn (~30 min, máxima prioridad)

`linkedin.com/company/agentesva` no existe (404). Crear con NAP consistente:

- **Nombre:** AgentesVA
- **Descripción:** Directorio y medio de inteligencia artificial en español
  para negocios. (misma frase que el schema Organization)
- **Web:** https://agentesva.com
- **Logo:** `public/brand/avatar.png` · Banner: `public/brand/linkedin-banner.png`

Al crearla, añadir la URL a `organization.sameAs` en `src/data/schema.ts`.
Esto alimenta dos señales del audit: trust-seed profiles y Knowledge Graph (NAP).

## 2. Wikidata (después de LinkedIn — necesita referencias externas)

Crear item en wikidata.org (cuenta gratuita, se edita directo). Borrador:

| Propiedad | Valor |
|---|---|
| Label (es) | AgentesVA |
| Description (es) | directorio y medio digital sobre inteligencia artificial en español |
| Description (en) | Spanish-language AI tools directory and media site |
| instance of (P31) | website (Q35127) |
| official website (P856) | https://agentesva.com |
| language of work (P407) | Spanish (Q1321) |
| country of origin (P495) | Spain (Q29) |
| inception (P571) | 2026 |
| founded by (P112) | (item de Fernando Angulo si existe; si no, omitir) |

Referencias: la propia web + la página de LinkedIn del paso 1. No inflar el
item; los items promocionales sin referencias se borran.

Al crearlo, añadir `https://www.wikidata.org/wiki/Q…` a `organization.sameAs`.

## 3. Trust seeds restantes

- **X/Twitter:** si @agentesva es nuestro, verificar acceso y añadir
  `https://x.com/agentesva` a sameAs (1 línea). Si no es nuestro, registrar
  variante (agentesva_es) y añadirla.
- **GitHub:** valorar org pública `github.com/agentesva` con 1-2 repos útiles
  (p. ej. prompts del pack). El audit sondea GitHub contra el stem del dominio.
- **Trustpilot:** reclamar el perfil del dominio (gratis) aunque no se pidan
  reseñas todavía.

## 4. Densidad factual (10/100 — contenido, no código)

Retrofit de los estudios/noticias existentes vía protocolo tom-4pass:
3+ fuentes nombradas, 15+ datos concretos y citas atribuidas por pieza.
Es la palanca de contenido más rentable según el audit. Sesión propia.

## 5. No hacer

- **Wikipedia:** sin notabilidad todavía; un artículo autopromocional se borra
  y quema el historial. Esperar a cobertura de prensa real.
- **llms.txt:** ya en verde; no sobre-invertir.

## Registro

- 2026-07-01: Cloudflare dejaba de servir nuestro robots.txt (bloqueo de bots
  IA gestionado + managed robots.txt). Desactivado en AI Crawl Control.
- 2026-07-02: PR #103 en producción — grafo de entidades sitewide, autor
  Person con sameAs, robots.txt RFC 9309.
