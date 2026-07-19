# Changelog — AgentesVA

Historial de releases de agentesva.com. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es/); versiones `MAYOR.MENOR.PARCHE.MICRO` (ver `VERSION`).

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
