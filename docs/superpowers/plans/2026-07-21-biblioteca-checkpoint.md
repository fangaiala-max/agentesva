# Biblioteca de IA — checkpoint (2026-07-21)

> Documento de traspaso para retomar en otra máquina/sesión. Lee esto primero.

## Cómo retomar en la nueva máquina

```bash
cd 05-agentesva   # el checkout normal del repo
git fetch origin
git checkout feat/guia-100-prompts   # ya está pusheada a origin
npm install
npm run test && npm run build        # debería quedar todo en verde
```

Si quieres seguir trabajando en un worktree aparte (recomendado si vas a tener
otra rama activa en el checkout principal — así fue como se hizo esta sesión):

```bash
git worktree add ../05-agentesva-biblioteca feat/guia-100-prompts
cd ../05-agentesva-biblioteca
npm install   # NO symlinkear node_modules del repo principal — puede tener
               # otra versión de dependencias (pasó con una migración de
               # Tailwind 4 en paralelo en esta sesión)
```

## Rama y estado

- Rama: `feat/guia-100-prompts`, pusheada a `origin`.
- Working tree limpio, 88/88 tests y build en verde en el último commit.
- Spec: `docs/superpowers/specs/2026-07-15-guia-100-prompts-design.md`
- Plan: `docs/superpowers/plans/2026-07-15-biblioteca-ia.md`

## Completado

- **Fase 1** — motor de datos (`src/data/biblioteca/{index,equipos}.ts`) + 100 prompts
  gratis (`prompts.ts`) + componente navegable (`BibliotecaIA.astro`) + script cliente
  (`biblioteca.ts`) + recurso en `/recurso/biblioteca-ia` + tests.
- **Rediseño visual** (a petición del usuario) — fichas más "CRO/comerciales": títulos
  serif, teaser de beneficio extraído del prompt, botón "Copiar" con icono.
- **Agrupación por tema** (a petición del usuario, evitar "wall of cards") — cada grupo
  se subdivide en subtemas (5×5 en catálogos A/B, 3-6 variable en C). Helpers
  `temasDeGrupo`/`itemsDeTema` en `index.ts`.
- **Fase 2** — 100 blueprints de software (`software.ts`), catálogo B, 4 grupos × 25 (5
  subtemas de 5 cada uno).
- **Fase 3** — 100 blueprints de growth (`growth.ts`), catálogo C, 6 grupos con el
  reparto natural 17/17/17/17/16/16 (no forzado a 25). Cifras de precisión sospechosa
  del catálogo origen suavizadas a lenguaje cualitativo (fact-checking).
- **Fase 4 — COMPLETA.** Página `/entrega.astro`: verifica sesión de Stripe (mismo
  patrón que `/descarga.astro` ya existente) y renderiza los blueprints completos del
  equipo comprado. Los 10 Payment Links se crearon primero en modo TEST (validados con
  una compra real usando tarjeta 4242 — flujo completo confirmado: pago → `/entrega`
  → blueprints renderizados → botón "Copiar prompt" funcionando) y después replicados
  en modo LIVE vía API. `equipo.compraUrl` en `src/data/biblioteca/equipos.ts` ya tiene
  los 10 Payment Links reales — el CTA "Contratar equipo" en `BibliotecaIA.astro` ya
  compra de verdad.

## Pendiente / housekeeping

- **Revocar `STRIPE_SECRET_KEY_LIVE_SETUP`** (Doppler, proyecto `agentes-va`, config
  `prd`) desde el dashboard de Stripe — era de un solo uso (crear los 10 Payment
  Links live) y ya cumplió su función. `STRIPE_SECRET_KEY_TEST` (config `dev`) se
  puede dejar o revocar también, a discreción.
- **Diferido, fuera de esta fase:** Payment Links para los 200 ítems sueltos a
  1,99 € cada uno — el plan recomienda añadirlos después de validar los equipos (ya
  validados).
- **Opcional:** no se hizo una compra real en modo live (solo se verificó la creación
  correcta de los 10 objetos vía API) — si se quiere el 100% de confianza, se puede
  hacer una compra real de 3,99 € y confirmar que `/entrega` en producción (Vercel,
  usando el `STRIPE_SECRET_KEY` ya existente, de solo lectura) verifica correctamente
  una sesión live.
- El PR de esta rama (`feat/guia-100-prompts`) hacia `main` todavía no se ha abierto.

## Dónde está todo (mapa de archivos)

| Qué | Dónde |
|---|---|
| Tipos + helpers + catálogos + equipos | `src/data/biblioteca/index.ts`, `equipos.ts` |
| Contenido catálogo A (prompts, gratis) | `src/data/biblioteca/prompts.ts` |
| Contenido catálogo B (software, pago) | `src/data/biblioteca/software.ts` |
| Contenido catálogo C (growth, pago) | `src/data/biblioteca/growth.ts` |
| Componente de la biblioteca | `src/components/BibliotecaIA.astro` |
| Cliente (filtros, copiar) | `src/scripts/biblioteca.ts` |
| Ficha del recurso + hook | `src/content/recursos/biblioteca-ia.json`, `src/pages/recurso/[slug].astro` |
| Entrega post-pago | `src/pages/entrega.astro` |
| Tests | `tests/biblioteca.test.ts`, `tests/biblioteca-ui.test.ts` |

## Notas de contexto (para no repetir trabajo ni sorprenderse)

- El directorio principal del repo (`05-agentesva`, sin sufijo) se usó en paralelo por
  otra sesión/la IDE durante este trabajo — cambió de rama varias veces bajo los pies
  de esta sesión (a `feat/tailwind-4`, luego a `docs/ai-visibility-audit-baseline`,
  luego a `feat/metodologia`). Por eso todo este trabajo se hizo en un **worktree
  separado** (`../05-agentesva-biblioteca`) y no en el checkout principal. Si sigues
  en la misma máquina, ese worktree debería seguir ahí; si es una máquina nueva, créalo
  de nuevo (ver arriba).
- Quedó un commit de plan de Tailwind (`e9aaf80`, solo un `.md`) mezclado en esta rama
  por error de otra sesión — es inofensivo, no lo toques a menos que quieras limpiarlo.
- Los prompts/blueprints de contenido (300 en total) se generaron con subagentes en
  paralelo (uno por grupo/pilar), validados programáticamente contra el schema antes de
  escribirlos a los `.ts` finales — si hay que regenerar/ampliar algún grupo, ese es el
  patrón a seguir (ver el historial de esta sesión o los prompts usados, recuperables
  del plan si hace falta reconstruir el enfoque).
