# Entrega editorial y growth de AgentesVA · 18 octubre 2026

Cinco acciones preparadas para revisión local. No publicado. Rama: `feat/visual-guides-growth-refresh`; base: `fa29ea0`.

## Tres guías completas en español e inglés

| Guía | Español | English | Recomendaciones |
|---|---|---|---:|
| Automatizar procesos | [Texto completo](01-herramientas-automatizar-procesos.md) | [Full guide](01-process-automation-tools.en.md) | 7 |
| Skills de Claude | [Texto completo](02-mejores-skills-claude.md) | [Full guide](02-best-claude-skills.en.md) | 10 |
| Automatizar redes sociales | [Texto completo](03-herramientas-automatizar-redes-sociales.md) | [Full guide](03-social-media-automation-tools.en.md) | 7 |

Cada edición contiene respuesta rápida, comparación, criterios por situación, ejemplos propuestos, límites, precios/unidades comprobados, alternativa gratuita y un plan de prueba. Incluye portada original, atlas visual de selección, ejemplo explicativo y cierre con infografía descargable. Las reseñas completas y las tablas se abren a petición. Fuentes oficiales y consulta del 18 de octubre. No se realizaron pruebas comparativas de producto ni se compraron los packs comerciales de skills.

## Auditoría y actualización

- [Informe detallado de la home](home-growth-audit.md): diagnóstico por bloques, evidencia de producción EN/ES, cinco prioridades, propuestas de copy, contrato de medición y criterios de aceptación. Prioridades inmediatas: demo en 320 px y separación de activación/contacto/oportunidad real. Los cambios recomendados en la home no están ejecutados.
- [Refresh de contenido existente](existing-content-refresh.md): cuatro guías españolas y cuatro resúmenes ingleses actualizados —Make/n8n/Zapier, coste, WhatsApp y seguimiento de leads—; seis guías conservadas con justificación. Selección por utilidad y vigencia; no por un ranking de tráfico con muestra insuficiente.
- [Brief y dirección aplicados](brief.md): `head-of-content`, `head-of-design` y `value-for-client`.
- [Nueva entrega Figma](figma-v2/README.md): 36 composiciones nativas editables, 36 PNG responsive y 6 SVG de infografías. El [manifiesto vigente](figma-v2/asset-manifest.json) identifica cada nodo, exportación y checksum. Las portadas originales se conservan; la carpeta `visuals/` recoge la primera iteración.
- [Revisión gráfica de procesos](visuals/processes-contact-sheet.png), [Claude](visuals/claude-contact-sheet.png) y [redes](visuals/social-contact-sheet.png).

## Validación y límite pendiente

510/510 pruebas. Build de producción correcto, 304 URLs en sitemap. Se verificaron las seis páginas compiladas: artículos completos, 7/10/7 recomendaciones, figuras localizadas, dos descargas finales, enlaces internos, anclas, canonical/hreflang, schema y dimensiones reales de las imágenes. Revisión independiente de cumplimiento y revisión técnica estática: aprobadas.

La home sí fue recorrida en producción antes de la interrupción. Las 24 exportaciones PNG de las guías fueron revisadas visualmente. Queda pendiente la revisión en navegador de las seis páginas nuevas, sus interacciones de teclado y su composición en escritorio y móvil: Chrome sigue sin aparecer disponible, incluso después del aviso de reconexión y de reiniciar el control. No se declara aceptada esa parte por inferencia de las pruebas estáticas.

## Cómo ver la maqueta

La entrega incluye `site/`, una copia estática compilada del sitio con esta propuesta editorial. Desde la carpeta de entrega:

```sh
python3 -m http.server 4358 --bind 127.0.0.1 --directory site
```

Abrir `http://127.0.0.1:4358/_review/`. Usar HTTP local para que las rutas absolutas, tipografías y estilos funcionen. Es una maqueta estática; los servicios de backend y el envío de formularios no se incluyen en esta copia. Los enlaces públicos de fuentes conservan su destino externo.

Los archivos fuente del proyecto están en `/Users/fernandoangulo/Sitios web/05-agentesva/.worktrees/editorial-local`. El checkout original y su trabajo previo se han conservado. No se ha hecho push, PR, merge ni despliegue.

## Código editable instalado en local

Este checkout es independiente de las carpetas temporales; conserva el historial y las dependencias instaladas. No se han modificado los cambios previos del checkout principal.

```sh
npm run dev -- --host 127.0.0.1 --port 4359
```

Guías en desarrollo: http://127.0.0.1:4359/guias/ y http://127.0.0.1:4359/guides/. Los cambios en los archivos fuente se reflejan mediante el servidor de desarrollo.

La revisión Figma reduce un 62–66% el texto HTML expuesto inicialmente, conserva el detalle desplegable y añade tres figuras nativas por artículo. [Ver metodología y resultados](figma-v2/reading-path-comparison.json).
