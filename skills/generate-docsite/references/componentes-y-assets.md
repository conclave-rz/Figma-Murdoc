# Componentes, iconos y reglas de contenido

> Contenido de **figma-uikit-docsite v2** de **ALX**. Las adaptaciones de Murdoc van marcadas con **[Murdoc]**.

## Pipeline de iconos y logo (SVG real)

1. Exportar cada icono desde Figma como `.svg` a `assets/icons/{slug}.svg`.
2. En `build.py`, cargar todos a un dict `ICON_SVG`.
3. Dict `ICON_ALIAS` mapea nombres genéricos al slug real.
4. Función `svg_for(name)` inyecta `class="icon"` inline. Nunca dejar `class` duplicado en el `<svg>`.
5. Iconos decorativos: `aria-hidden="true"`. Iconos como único contenido de un botón: `aria-label` en el botón.
6. Logo con dict `LOGO_SVG` y función `marca_logo(variant)` soportando variantes `full` y `mark`.

**[Murdoc]** Exporta cada icono con `figma_take_screenshot { nodeId, format: "svg" }` y descarga la URL devuelta a `assets/icons/{slug}.svg`. Para muchos iconos, recórrelos con `figma_execute` + `node.exportAsync({ format: "SVG_STRING" })` y escribe los archivos desde el agente.

## Patrón de modal fullscreen

JS mueve el nodo real del DOM (no lo clona) de `[data-fullscreen-source]` a `[data-fullscreen-slot]`. Botón de cierre siempre visible, soporte de tecla Escape, foco al botón de cierre al abrir. Nunca clonar — clonar rompe IDs y estado interactuado.

## Diseño flat por defecto

Ningún componente lleva `box-shadow` decorativo. Excepción: componentes popover/dropdown (comunican flotación). Nunca tocar sombras de feedback de estado (foco, borde activo).

## Reglas de contenido

- El sitio NUNCA enlaza ni menciona el archivo de Figma fuente.
- Todo el copy es en español salvo que el proyecto especifique otro idioma.
- Cada valor visual tiene su token — nunca un número a ojo.

**[Murdoc]** "Capa Figma" muestra el **nombre de la capa** (trazabilidad para una IA), nunca la URL del archivo.
