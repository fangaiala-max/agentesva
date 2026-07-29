# Worklog — Personal Computer de Perplexity llega a Windows

Candidato del radar 2026-07-28, índice 0. Formato: **noticia**.

---

## GATE 1 — Order Level

| | |
|---|---|
| **Formato** | noticia (actualidad curada con fuente primaria) |
| **AI-query target** | "¿hay alguna IA que use mi ordenador y haga las tareas por mí?" |
| **Lector / tema / mercado** | Dueño de PyME con equipos Windows · tema `Automatización` · España + LATAM |
| **Herramientas a cross-linkear** | `perplexity`, `microsoft-copilot` — ambas verificadas en `src/content/tools/` |
| **Claim afilado (≤20 palabras)** | En Mac el mismo producto pasó de 200 $ a 20 $ en un mes. En Windows, la noticia es esperar. |
| **Riesgo Tier A** | Ninguno. No toca certificaciones, subvenciones ni legal/regulatorio. |

### Canibalización — comprobado, no la hay

`agentes-de-ia-que-hacen-el-trabajo-solos.md` (2026-06-23) cubre agentes **en la nube**
(n8n, Make, Bardeen, Relevance AI). Cero menciones de Perplexity, ordenador, escritorio o
Windows. Este va de un agente que corre **en tu propia máquina** y opera tus apps
instaladas: producto distinto, problema distinto. Se enlazará como contexto, no compite.

---

## GATE 2 — Brief Level

### El hueco

La cobertura en inglés se queda en el anuncio: "Perplexity lanza agente para Windows,
1.000 millones de dispositivos". Nadie conecta el lanzamiento de Windows con **lo que ya
pasó en Mac hace tres meses**, que es justo lo accionable para quien tiene que decidir si
paga. Ese es el post.

### Fuentes con tier

| # | Claim | Fuente | Fecha | Tier |
|---|---|---|---|---|
| 1 | Personal Computer llega a Windows; hace documentos Word, hojas Excel, organiza ficheros, investiga y encadena apps | [SiliconANGLE](https://siliconangle.com/2026/07/28/perplexity-brings-personal-computer-ai-agent-windows/) | 2026-07-28 | B |
| 2 | Sale para Max y Enterprise Max, "que empiezan en 200 $/mes" | [SiliconANGLE](https://siliconangle.com/2026/07/28/perplexity-brings-personal-computer-ai-agent-windows/) | 2026-07-28 | B |
| 3 | Max = 200 $/mes · Pro = 20 $/mes · Enterprise Pro = 40 $/mes por persona | [TechCrunch](https://techcrunch.com/2025/07/02/perplexity-launches-a-200-monthly-subscription-plan/) | 2025-07-02 | B |
| 4 | En Mac salió en abril de 2026, solo Max y con lista de espera | [TechCrunch](https://techcrunch.com/2026/05/07/perplexitys-personal-computer-is-now-available-everyone-on-mac/) | 2026-05-07 | B |
| 5 | El 7 de mayo de 2026 se abrió a todos los Mac, pero **exige Pro o Max** | [TechCrunch](https://techcrunch.com/2026/05/07/perplexitys-personal-computer-is-now-available-everyone-on-mac/) | 2026-05-07 | B |
| 6 | Arquitectura híbrida: el PC pone las manos, la nube pone el cerebro | [SiliconANGLE](https://siliconangle.com/2026/07/28/perplexity-brings-personal-computer-ai-agent-windows/) | 2026-07-28 | B |
| 7 | Pide aprobación antes de acciones sensibles o difíciles de revertir (enviar email, borrar ficheros); registra actividad; no entrena con datos de empresa | [SiliconANGLE](https://siliconangle.com/2026/07/28/perplexity-brings-personal-computer-ai-agent-windows/) | 2026-07-28 | B |
| 8 | Integra Microsoft 365 y Teams | [SiliconANGLE](https://siliconangle.com/2026/07/28/perplexity-brings-personal-computer-ai-agent-windows/) | 2026-07-28 | B |

**Fuente primaria a atribuir:** The Verge — la del candidato del radar
(`https://www.theverge.com/ai-artificial-intelligence/971750/perplexity-personal-computer-windows-ai-agents`).

### Limitación de la verificación — declarada

`perplexity.ai/pricing` y `perplexity.ai/hub/blog` devuelven **HTTP 403** al fetch
automatizado, así que **el precio no está confirmado contra la página oficial**. Los
200 $/mes se sostienen en dos medios independientes (TechCrunch 2025-07-02 y SiliconANGLE,
que lo repite en la nota del lanzamiento Windows de 2026-07-28). En el texto se atribuye
al medio, no se afirma como dato oficial. Conviene confirmarlo en un navegador antes de
publicar.

### Outline bloqueado

1. **Qué ha pasado** — Personal Computer llega a Windows. Qué hace, en concreto.
2. **Cómo funciona** — híbrido: tu PC ejecuta, la nube razona. Por qué importa (tus ficheros salen de tu máquina).
3. **El precio, sin rodeos** — 200 $/mes, plan Max. Contra Pro a 20 $.
4. **El dato que nadie está contando** — el recorrido en Mac: abril, solo Max → 7 de mayo, cualquiera con Pro. Un mes, precio de entrada ÷10.
5. **Qué hacer si tienes una PyME** — esperar; mientras tanto, qué tienes ya: [Microsoft Copilot](/herramienta/microsoft-copilot) integrado en Windows y M365.
6. **Salvaguardas** — pide permiso antes de lo irreversible, registra lo que hace. Y la pregunta de protección de datos.
7. Cierre + "Fuente: …".

### Slug propuesto

`perplexity-llega-a-windows-agente-que-usa-tu-pc`

Español, sin tildes, 8 palabras con sentido completo.

---

## GATE 4 — Fact check

| Claim en el texto | Fuente | Fecha | Tier | Estado |
|---|---|---|---|---|
| Personal Computer llega a Windows; abre Word, actualiza Excel, ordena carpetas, investiga, encadena apps | SiliconANGLE | 2026-07-28 | B | ✅ |
| Se integra con Microsoft 365 y Teams | SiliconANGLE | 2026-07-28 | B | ✅ |
| Antes solo existía para Mac | TechCrunch | 2026-05-07 | B | ✅ |
| Arquitectura híbrida: el PC ejecuta, la nube razona; un modelo local reparte | SiliconANGLE + heise | 2026-07-28 | B | ✅ |
| Windows sale solo para Max y Enterprise Max, "desde 200 $/mes" | SiliconANGLE | 2026-07-28 | B | ⚠️ atribuido al medio |
| Pro = 20 $/mes · Enterprise Pro = 40 $/mes por persona | TechCrunch | 2025-07-02 | B | ✅ |
| Mac: abril 2026, solo Max, con lista de espera | TechCrunch | 2026-05-07 | B | ✅ |
| Mac: 7 mayo 2026 abierto a todos, pero exige Pro o Max | TechCrunch | 2026-05-07 | B | ✅ |
| Pide aprobación antes de acciones irreversibles; registra actividad; no entrena con datos de empresa | SiliconANGLE | 2026-07-28 | B | ✅ |
| URL de `fuente` resuelve | curl → HTTP 200 | 2026-07-28 | — | ✅ |
| Slugs `perplexity` y `microsoft-copilot` existen en `src/content/tools/` | repo | — | — | ✅ |

**`[SIN VERIFICAR]` restantes: 0.**

### La única salvedad

El precio de 200 $/mes **no está confirmado contra la página oficial de Perplexity**:
`perplexity.ai/pricing` y `perplexity.ai/hub/blog` devuelven HTTP 403 al fetch
automatizado. Se sostiene en dos medios independientes (TechCrunch 2025-07-02 al lanzarse
el plan Max, y SiliconANGLE repitiéndolo el 2026-07-28 en la nota de Windows). En el texto
va **atribuido al medio**, nunca afirmado como dato oficial. Confirmarlo en un navegador
antes de publicar lo subiría a verificado.

### Downstream impact

Al unificar el vano temporal Mac (abril → 7 de mayo) se detectó una incoherencia interna:
el texto decía "poco más de un mes" en un sitio y "cinco semanas" en otro. Sin la fecha
exacta de abril, cinco semanas era precisión inventada. Corregido a "un mes" en ambos.

### Gate de validación

`npm run build` → **exit 0**. Página generada en
`/noticias/perplexity-llega-a-windows-agente-que-usa-tu-pc/`, con los dos cross-links a
fichas renderizados y la fuente atribuida.

**748 palabras.** No commiteado: pendiente de aprobación.

---

## Segunda pasada de verificación (anti-alucinación)

Revisión adicional a petición del usuario, reverificando contra las fuentes en vez de
contra las notas del GATE 2. **Tres errores encontrados y corregidos.**

### E1 — Arquitectura descrita al revés (grave)

El borrador decía: *"No es una IA que corra dentro de tu ordenador… la nube pone el
cerebro"*. **The Verge, la fuente primaria, dice justo lo contrario:** describe Windows
como *"a locally run AI system"*. SiliconANGLE lo confirma en la otra dirección: *"uses a
hybrid architecture rather than depending entirely on local AI processing, drawing on
Perplexity's cloud infrastructure when more computing power is required"* — es decir, sí
hay proceso local, solo que no exclusivo.

**Origen del error:** la afirmación venía de un resumen de búsqueda de techtimes
("does not run AI reasoning on your Windows machine") que nunca llegué a fetchear. Era la
fuente más débil de las tres y contradecía a la primaria. Se coló por no verificarla.

**Corregido:** el párrafo ahora dice que se ejecuta en local (citando a The Verge) y que
tira de la nube cuando la tarea pide más cálculo (citando a SiliconANGLE con fecha).

### E2 — "Se integra con Microsoft 365 y **Teams**"

Teams **no aparece** en SiliconANGLE. Comprobado explícitamente: *"Teams is NOT mentioned
in the article"*. Lo que sí dice es que combina ficheros y apps locales con información de
Microsoft 365 y sitios web. Venía también del resumen de techtimes sin verificar.

**Corregido:** eliminada la mención a Teams; reformulado según SiliconANGLE.

### E3 — "Un modelo local reparte cada tarea"

Procedía de heise, **con fecha 2026-06-04**, anterior al lanzamiento de Windows del 28 de
julio: describía el producto en otro momento. No aparece en SiliconANGLE (verificado:
"NOT IN ARTICLE"). **Corregido:** frase eliminada; la idea que sí está sostenida
—arquitectura híbrida— se mantiene con su cita.

### Confirmaciones adicionales

| Dato | Cómo se confirmó |
|---|---|
| The Verge publicó la pieza el 2026-07-28 con ese titular | RSS propio de The Verge capturado por el radar (`2026-07-28T12:30:00Z`) |
| Lanzamiento en Mac en abril | Confirmado ahora también por la primaria: *"Like the Mac version that Perplexity launched in April"* |
| "general-purpose digital worker" | Textual en el RSS de The Verge |
| Capacidades (Word, Excel, carpetas, research, multi-app) | SiliconANGLE, textual |
| 200 × 12 = 2.400 · 200 ÷ 20 = 10 | Aritmética comprobada |

### Lección para el pipeline

Los tres errores comparten origen: **datos tomados de resúmenes de búsqueda en vez de la
fuente fetcheada**. Los resúmenes de WebSearch agregan varios medios y pierden la
atribución, así que una afirmación de un medio débil acaba pareciendo consenso. Regla para
próximas noticias: **ningún dato entra al texto si no viene de un WebFetch a una URL
concreta**, y ante versiones en conflicto manda la fuente primaria.

`npm run build` tras las correcciones → **exit 0**.

---

## Tercera pasada — precios verificados contra la fuente oficial

El 403 que bloqueaba `perplexity.ai` era contra el user-agent de WebFetch, no contra un
navegador. Cargando las páginas con Playwright se accede sin problema: son públicas y no
requieren login. **La salvedad del GATE 4 queda cerrada, y aparecieron dos errores más.**

### Precios oficiales (perplexity.ai/hub/pricing y centro de ayuda)

| Plan | Precio oficial | Personal Computer |
|---|---|---|
| Free | 0 $/mes | — |
| Pro | **20 $/mes** | Acceso + 4.000 créditos bonus, **sin créditos mensuales** |
| Max | **200 $/mes** (2.000 $/año) | Acceso + 35.000 bonus + **10.000 créditos/mes** |
| Enterprise Pro | **34 $/mes/puesto** (anual) | Acceso + 500 créditos/mes |
| Enterprise Max | **271 $/mes/puesto** (anual) | Acceso + 15.000 créditos/mes |

Textual del centro de ayuda: *"Perplexity Max costs $200/monthly or $2000/annually."*

### E4 — "Max y Enterprise Max **arrancan en 200 $/mes**"

Falso para Enterprise Max: cuesta **271 $/mes por puesto** con facturación anual. La frase
venía de SiliconANGLE (*"which start at $200 per month"*), redacción laxa del medio que yo
repetí como si aplicara a los dos planes. **Corregido** con las dos cifras oficiales por
separado.

### E5 — El plan Pro vendido de más

El texto daba a entender que por 20 $ tienes Personal Computer funcionando. La tabla
comparativa oficial muestra `Computer credits: Free — · Pro — · Max 10.000/month`: en Pro
hay **acceso** y créditos iniciales, pero **ningún crédito mensual incluido**. Para uso
continuado se queda corto. **Corregido** con un párrafo de letra pequeña que lo dice.

El ángulo central aguanta —el precio de entrada sí cayó de 200 a 20— pero ahora con la
matización que lo hace honesto.

### Ascendidos a fuente oficial (antes atribuidos a medios)

- Max = 200 $/mes → antes TechCrunch, ahora centro de ayuda de Perplexity.
- Pro = 20 $/mes → antes TechCrunch, ahora página oficial de precios.
- Enterprise Pro = 34 $/puesto anual → sustituye al "40 $" de TechCrunch (ambos existen:
  40 en facturación mensual según el centro de ayuda, 34 en anual según la página de
  precios). Se usa la cifra anual, que es la que muestra la página de precios.

**Total de errores encontrados en las revisiones: 5.** Tres por usar resúmenes de WebSearch
en vez de fuentes fetcheadas (E1-E3), dos por no llegar a la fuente oficial de precios
(E4-E5).

`npm run build` → **exit 0**. 868 palabras. Sigue sin commitear.
