# TODOS

## Newsletter
Fuente: docs/superpowers/specs/2026-06-21-agentesva-newsletter-business-brief.md (revisión CEO 2026-06-21)

### Secuencia de bienvenida en Brevo
**Priority:** P1
Email de entrega del lead magnet + 3-5 emails de onboarding.

### Programa de referidos (tipo SparkLoop)
**Priority:** P2
Motor de volumen viral. Retomar al arrancar la lista.

### Sub-ángulo anti-incumbente
**Priority:** P3
Voz/formato distintivo vs "IA en Español" (50k subs).

## Noticias
Fuente: revisión de /ship en v0.3.2.0 (red team) — rama `design/noticias-tipografia`.

### Los distintivos "Nuevo"/"Tendencia" se congelan hasta el siguiente deploy
**Priority:** P1
Se calculan en build con `new Date()`, pero el sitio solo se despliega al mergear: `vercel.json` no tiene `crons`, no hay deploy hook, y `noticias-diarias.yml` deja el PR a un humano a propósito. Con un hueco de publicación como el de junio→julio (33 días), una píldora "Nuevo" (ventana de 7 días) seguiría afirmando frescura durante semanas. Mitigado a medias en 0.3.2.0 (el pulso verde de "en vivo" solo se enciende si la última noticia es reciente de verdad), pero las píldoras siguen congeladas. Opciones: cron diario de Vercel que redespliegue, o calcular la frescura en cliente desde el `datetime` que ya emite cada `<time>`.

### El esquema de noticias acepta fechas futuras
**Priority:** P2
`fecha: z.coerce.date()` no valida el rango. Una fecha con un dedazo hacia el futuro ganaría el orden descendente y secuestraría la portada, abriría una sección de mes fantasma y fijaría el "última:" de la cabecera — sin distintivos, porque el cálculo sí descarta el futuro. Añadir `.refine(d => d <= new Date())` para que el build falle en voz alta.

### `/noticias` no pagina
**Priority:** P2
La página renderiza todas las noticias y el JSON-LD las enumera todas. La pipeline apunta a 4 noticias por día laborable, así que a régimen son ~1000 entradas al año en una sola página y en sus datos estructurados. La reestructuración por meses es el momento natural para paginar o cortar por archivo.

## Completed

### Fase 2: tienda de packs (modelo Authority.md)
Estaba bloqueada hasta validar disposición a pagar; se lanzó como /recursos con Stripe Payment Links + entrega en /descarga.
**Completed:** PRs #108/#109 (2026-07-04)
