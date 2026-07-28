# Changelog — AgentesVA

Historial de releases de agentesva.com. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es/); versiones `MAYOR.MENOR.PARCHE.MICRO` (ver `VERSION`).

## [0.3.1.3] - 2026-07-29

### Fixed
- El radar de noticias ya no vuelve a proponer historias que ya están publicadas. Comparaba el título español publicado contra el titular original en inglés, así que no podía emparejarlas nunca; ahora compara la URL de la fuente, que no depende del idioma. En la cola de hoy, 3 de 6 candidatos eran repeticiones.
- Las noticias nuevas dejan de nacer con la URL en inglés y cortada a media palabra (`perplexity-s-personal-computer-turns-windows-pcs-into-ai-age`). El slug se deriva ahora del título en español, que es lo que posiciona.

## [0.3.1.2] - 2026-07-29

### Fixed
- El pipeline diario de noticias ya no falla al final. Empujaba la cola de candidatos correctamente pero moría al crear el PR, porque el repositorio tiene desactivado que Actions abra pull requests. Ahora empuja la rama y deja en el resumen del run un enlace para abrir el PR con título y etiquetas ya rellenados. Cada ejecución fallida dejaba además una rama suelta sin PR.

### Changed
- El workflow de noticias pierde el permiso `pull-requests: write`, que ya no necesita.

## [0.3.1.1] - 2026-07-28

### Added
- Guard en tests que impide volver a romper un formulario con un handler de evento en línea (`onsubmit`, `onclick`…). La CSP del sitio los bloquea en producción pero no en local, así que el fallo era invisible hasta desplegar; ahora la suite falla en el sitio y señala fichero y línea.

## [0.3.1.0] - 2026-07-28

### Fixed
- Pulsar Enter en el buscador de la Biblioteca de IA ya no borra lo escrito ni resetea el filtro: la búsqueda se mantiene. Antes recargaba la ficha y volvías a ver los 100 recursos de golpe.
- Pulsar Enter en `/buscar` ya no recarga la página. Los dos formularios dependían de un `onsubmit` en línea que la CSP del sitio (`script-src 'self'`) bloquea, así que el navegador acababa enviando el formulario de verdad.

### Changed
- El script de la página `/buscar` vive ahora en `src/scripts/buscar.ts`, como el resto de páginas, con tests que cubren la precarga de `?q=`, el sincronizado de la URL y el guard de envío.

## [0.3.0.0] - 2026-07-20

### Added
- Instrumentación (CRO — motor de clicks de afiliado): helper GA4 `track()` (respeta consentimiento) + eventos `affiliate_click`, `view_ficha`, `newsletter_submit`; logging estructurado JSON de cada click en `/ir/` (src, referer, hasAffiliate).
- Toolkit de conversión: `AffiliateCTA` (CTA de salida tracked, 3 variantes), `Badge` + `badgesFor` (badges honestos por dato), `TrustSignals`, `ToolCallout`.
- Ficha rediseñada como página de conversión: veredicto editorial, pros/contras, señales de confianza, CTA fija móvil y 4 placements tracked (hero/sticky/compare/bottom).
- Feeders: badges + CTA "Visitar ↗" tracked en tarjetas del home/directorio; `ToolCallout`s en estudios y noticias.
- Esquema: campos opcionales `popular`, `verdict`, `pros`, `cons`, `addedAt`.

### Notes
- Sin nuevas dependencias ni cambios de CSP (dominios GA ya permitidos).
- Pendiente (fuera de alcance): poblar `affiliateUrl` por herramienta y fijar `PUBLIC_GA4_ID` en producción para que fluyan los eventos cliente.

## [0.2.1.0] - 2026-07-19

### Security
- Endurecido `POST /api/subscribe` contra abuso (subscription/email bombing): gate por cabecera `Origin` con allowlist configurable (`SUBSCRIBE_ALLOWED_ORIGINS`, por defecto los dominios de producción). Corta scripts/curl sin un `Origin` válido sin afectar al formulario real; el límite de tasa por IP se delega al WAF de Vercel.
- El endpoint deja de reenviar el mensaje de error de Brevo al cliente (posible fuga de detalle interno): ahora responde genérico y registra el detalle solo en el log del servidor.

### Added
- Registro de consentimiento (RGPD) en el alta: con `consent=true` se guardan los atributos `OPT_IN_AT` (marca ISO) y `OPT_IN_SOURCE` en Brevo.
- Suite de tests para `api/subscribe.js` (16 casos: preflight/métodos, gate de Origin, honeypot, validación, alta directa/DOI, consentimiento y errores upstream).

## [0.2.0.0] - 2026-07-05

### Added
- Home rediseñada como marketplace (diseño "AgentesVA - Home web" de claude.ai/design): hero a dos columnas con tarjeta "★ Elección del editor", banners "Explora por objetivo" con conteos reales por categoría y banner de colección curada.
- Directorio con dos vistas conmutables: **Escaparate** (estantes con scroll horizontal: Destacadas, Gratis y freemium, Mejor valoradas) y **Tienda** (sidebar con filtros de categoría y precio, ordenación y vista cuadrícula/lista).
- **Comparador de herramientas**: hasta 3 a la vez, con barra inferior y modal de comparativa (categoría, precio, valoración, ideal para) enlazando a las fichas. Accesible: focus trap, cierre con Escape/clic fuera, anuncios `aria-live`.
- Barra CTA fija del Pack de Recursos IA, descartable y recordada por sesión.
- Búsqueda del directorio insensible a tildes: "video" encuentra "Vídeo" (home y /herramientas).
- Suite de tests (Vitest + happy-dom, 52 tests) y pipeline de CI que ejecuta tests y build en cada PR.

### Changed
- Claims numéricos derivados del dato real: "+50 herramientas" (hero, stats, ticker y metas) se calcula del catálogo en vez del "+120" estático.
- El pack gratuito se ofrece sin countdown ni "por tiempo limitado" (era urgencia artificial: el pack es gratis siempre).
- Tarjetas de herramienta: badge "★ Editor" para las destacadas, botón de comparar y estrella en dorado; colores de precio unificados con los tokens del sistema.

### Fixed
- Con View Transitions, los scripts de una página ya no interfieren con otra (los filtros del directorio y los marcadores dejan de duplicarse al navegar entre home, /herramientas y fichas).
- Sin JavaScript, la home muestra el directorio completo (el fallback anterior dejaba la lista vacía).
- Las barras fijas ya no tapan el final de la página y se recalculan al redimensionar.
- La home genera 54 capas de transición (una por herramienta) en lugar de 78: navegación más ligera en móvil.
