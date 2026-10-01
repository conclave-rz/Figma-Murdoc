# Tokens y estructura del sitio

> Contenido de **figma-uikit-docsite v2** de **ALX**. Las adaptaciones de Murdoc van marcadas con **[Murdoc]**.

## Convención de tokens (3 capas)

`assets/css/tokens.css` sigue SIEMPRE tres capas, en este orden:

1. **Primitivas** — `--teal-50`, `--gray-100`, `--gray-600`, etc. Nunca referenciadas directamente desde componentes.
2. **Semántico** — `--surface-brand-primary`, `--text-neutral-secondary`, `--border-danger-primary`. Cada semántico apunta a UNA primitiva. Todo par texto/superficie debe cumplir contraste antes de pasar a componente.
3. **Componente** — `--button-primary-container-hover`, `--chip-on-bg-default`.

Spacing y radios: `--spacing-8` … `--spacing-64`, `--radius-4` … `--radius-full`.
Grid: `--grid-margin` (margen exterior), `--grid-gutter` (separación entre columnas).
Motion: `--duration-fast: 120ms`, `--duration-base: 200ms`, `--easing-standard: cubic-bezier(.4,0,.2,1)`.

Cada declaración de color lleva el HEX real como comentario. Nunca aproximar.

**[Murdoc] `assets/tokens.json` en DTCG.** El original generaba un JSON plano estilo Style Dictionary desde `build.py`. En Murdoc el archivo canónico sale de Figma con `figma_export_tokens { format: "dtcg", outputPath: "<sitio>/assets/tokens.json" }`, en el mismo dialecto que el contrato del Pilar 0 y `sync-tokens` (Style Dictionary v4 lo consume directo). `build.py` solo lo copia y valida; no lo reinventa:
```json
{
  "color": {
    "brand": { "primary": { "$type": "color", "$value": "#0b655a" } },
    "neutral": { "text": { "$type": "color", "$value": "#242424" } }
  },
  "spacing": { "8": { "$type": "dimension", "$value": "8px" } },
  "radius": { "full": { "$type": "dimension", "$value": "100px" } }
}
```
Si el archivo de Figma no tiene variables (solo estilos o valores sueltos), genera el DTCG desde `build.py` con la misma forma `$type`/`$value` y avisa en el scorecard (dimensión 5).

## Estructura de carpetas

```
proyecto/
  tools/build.py
  assets/css/tokens.css
  assets/css/base.css
  assets/css/components.css
  assets/css/docs.css
  assets/js/interactions.js
  assets/tokens.json          ← DTCG (figma_export_tokens) [Murdoc]
  assets/icons/*.svg
  assets/logo/*.svg
  index.html, docs/*.html, atoms/*.html, molecules/*.html, organisms/*.html, templates/*.html
```

Chrome del sitio siempre con Flexbox:
```css
.docs-layout{display:flex;min-height:100vh;}
.docs-sidebar{width:272px;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;}
.docs-main{flex:1;min-width:0;}
.docs-topbar{position:sticky;top:0;z-index:5;}
```

## Estructura de páginas (Atomic Design)

Navegación (`NAV` en build.py) en este orden fijo:

1. **Fundamentos** — Introducción (con scorecard AI-Ready), Grid, Color y tokens, Espaciado y radios, Tipografía, Iconografía, Microinteracciones.
2. **Atoms** — componentes atómicos indivisibles
3. **Molecules** — combinaciones de 2+ atoms
4. **Organisms** — secciones completas
5. **Templates & Pages** — composición interactiva de pantalla completa

Cada página de componente (`component_doc(...)`) genera SIEMPRE en este orden:
- badge de tipo + `<h1>` + lead
- nota de "Capa Figma"
- "Vista previa interactiva": stage de damero + toolbar de estado
- "Especificaciones": tabla Propiedad | Valor | Token
- "Microinteracción": timing/easing real
- "Código": bloque multi-framework con pestañas (ver sección anterior)
