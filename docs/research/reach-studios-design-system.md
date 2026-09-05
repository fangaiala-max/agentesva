# Reach Studios → AgentesVA: investigación de dirección visual

Fecha: 4 de septiembre de 2026
Alcance: portada pública de Reach Studios, inspeccionada en escritorio, y traducción de sus principios a un sistema propio para AgentesVA.

## Resumen ejecutivo

Reach Studios no depende de una interfaz compleja: su impacto nace de cinco decisiones coordinadas. Usa negro casi absoluto como marco editorial; reserva un azul eléctrico para momentos de máxima energía; construye jerarquía con grotescas de display en mayúsculas; alterna bloques densos y amplios con tarjetas y controles redondeados; y aplica movimiento direccional breve para revelar contenido sin convertir el scroll en un espectáculo.

La implementación en AgentesVA adopta esa lógica, no su identidad. El nuevo concepto se llama **Signal / Electric**: negro tinta `#050505`, azul eléctrico `#2947FF`, blanco cálido, titulares comprimidos mediante DM Sans Variable, etiquetas técnicas en JetBrains Mono y el wordmark original en DM Serif Display. Así se conserva reconocimiento de marca y se evita incorporar o imitar tipografías comerciales del referente.

## Hallazgos

### 1. Art direction

- La portada abre con una cabecera negra de dos niveles y una escena azul de alto contraste. El contenido posterior alterna secciones negras y blancas, lo que convierte el color de fondo en parte de la narrativa.
- El azul funciona como color de campaña, no como pequeño acento. Ocupa superficies completas y tiñe material visual; el negro aporta gravedad y el blanco crea pausas.
- La composición mezcla tecnología y editorial: titulares en caja alta, rótulos prefijados con `//`, grandes márgenes, carruseles de casos y módulos con bordes mínimos.
- Las pruebas de capacidad aparecen pronto: logos, servicios, casos y testimonios. Esto apoya la promesa comercial que Reach formula como diseño, tecnología y resultados medibles en su [página principal](https://reachstudios.co.uk/).

### 2. Tipografía

La inspección de estilos computados identifica cuatro familias: **Clash Display** para titulares, **Clash Grotesk** para texto, **Sweet Sans** para rótulos y **Be Vietnam** en botones. Clash Display está concebida para tamaños grandes y tiene una estructura neo-grotesca de aperturas estrechas; Fontshare pertenece a Indian Type Foundry y distribuye familias seleccionadas de forma gratuita ([Fontshare](https://www.fontshare.com/about)). Sweet Sans fue diseñada por Mark van Bronkhorst en 2011 ([MVB Fonts](https://www.mvbfonts.com/sweet_sans/sweet_sans_regular/)).

Lo importante no es copiar esas familias, sino reproducir sus roles:

- Display: caja alta, peso medio/semibold, tracking negativo extremo y altura de línea compacta.
- Texto: grotesca neutra, 16–18 px, interlineado cómodo.
- Etiquetas: sans o mono pequeña, mayúsculas, prefijo `//` y tracking positivo.
- Acción: peso alto, tamaño contenido y forma de píldora.

En AgentesVA esos roles se cubren con fuentes ya autoalojadas: DM Sans Variable, DM Serif Display y JetBrains Mono Variable.

### 3. Movimiento

- El hero usa vídeo o imagen en movimiento con control de pausa visible.
- Los elementos de entrada parten aproximadamente de `translateY(±40px)` y transicionan durante unos `700ms` con una curva de salida.
- Tarjetas, menús y CTA usan transformaciones y cambios de color simples; las flechas refuerzan dirección.
- Carruseles y marquesinas crean continuidad horizontal, mientras la mayor parte del contenido permanece estable.

Para AgentesVA se mantiene CSS nativo: una órbita lenta de 28 s, grid estático, entradas existentes de 700 ms, hover de flecha y tarjetas, y desactivación completa bajo `prefers-reduced-motion`. No se añade vídeo para evitar coste de rendimiento y contenido puramente decorativo.

## Sistema aplicado: Signal / Electric

| Rol | Decisión |
|---|---|
| Fondo | Negro tinta `#050505`, paneles `#101010` / `#171717` |
| Energía | Azul eléctrico `#2947FF`, empleado como superficie en el hero |
| Display | DM Sans Variable, 650, caja alta, tracking hasta `-0.075em` |
| Marca | DM Serif Display se conserva solo en el wordmark y usos editoriales existentes |
| Metadatos | JetBrains Mono, 10–11 px, mayúsculas, tracking positivo |
| CTA | Píldora blanca o azul, copy en mayúsculas, flecha direccional |
| Geometría | Hero editorial + tarjeta negra ligeramente rotada + órbitas técnicas |
| Motion | Transform/opacity, curva expo, 700 ms para entradas, 28 s ambiente |

## Límites y decisiones conscientes

La investigación se basa en la versión pública observada el 4 de septiembre de 2026; el sitio puede cambiar. Los nombres tipográficos proceden de estilos computados, mientras que las intenciones creativas son inferencias visuales. No se copiaron activos, vídeo, layouts exactos ni fuentes de Reach. La implementación conserva contenido, SEO, navegación, formularios y arquitectura existentes de AgentesVA.
