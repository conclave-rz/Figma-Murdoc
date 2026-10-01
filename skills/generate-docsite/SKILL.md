---
name: generate-docsite
description: Genera un sitio estático de documentación estilo Pattern Lab (Atomic Design) a partir de un archivo de Figma — specs, tokens DTCG, iconos SVG, código multi-framework, previews interactivos y scorecard AI-Ready. Evolución de generate-showcase-page.
credit: ALX
---

# generate-docsite — sitio de documentación de UI Kit (estilo Pattern Lab)

> Basada en **figma-uikit-docsite v2** de **ALX** (proyecto de referencia: ToolKit). Adaptada a Murdoc: tools nativas del Desktop Bridge, tokens en DTCG vía `figma_export_tokens`, verificación con el Chrome local y entrega en Claude Code.

Convierte un archivo de Figma en un sitio HTML/CSS/JS navegable: un generador estático (`tools/build.py`) produce documentación organizada por Atomic Design, con specs, código copiable y previews interactivos por componente. El resultado no depende de un framework ni de build en producción: abre directo desde `file://`.

## Prerequisito
`use_skill` antepone `figma-use` automáticamente. Al terminar, corre `ai-ready-audit` (paso 9).

## Referencias (cárgalas por fase con `use_skill { skill: "generate-docsite", reference: "<nombre>" }`)
| Referencia | Cuándo |
|---|---|
| `tokens-y-estructura` | Pasos 2–4: convención de tokens de 3 capas, estructura de carpetas y páginas |
| `codigo-multiframework` | Paso 4: bloque de código con pestañas HTML/React/Vue/Angular |
| `componentes-y-assets` | Paso 4: pipeline de iconos/logo SVG, modal fullscreen, diseño flat, reglas de contenido |
| `accesibilidad` | Pasos 4 y 8: requisitos WCAG obligatorios |
| `verificacion` | Paso 8: checklist y uso de `scripts/verify-site.mjs` |

---

## ⚠️ PASO 0 — Confirmación obligatoria antes de hacer cualquier cosa

Antes de leer Figma, crear archivos o escribir código, usa la herramienta de preguntas del cliente (`AskUserQuestion` en Claude Code) para resolver lo que falte. Si el usuario ya lo especificó, no lo vuelvas a preguntar.

1. **Formatos de código** (`multiSelect: true`): HTML · React/JSX · Vue 3 SFC · Angular. Cada formato es una pestaña en el bloque "Código". Si no sabe, recomienda **HTML + React**.
2. **Alcance de Figma** (radio): solo la página/frame compartida · todas las páginas · páginas específicas ("Other").
3. **Alcance de tokens** (`multiSelect: true`): colores · espaciado y radios · grid y layout · tipografía · efectos · **todos** (recomendado).

---

## Mapa de capacidades → tools de Murdoc

La skill original era agnóstica al MCP. En Murdoc usa estas tools (Desktop Bridge, sin cuotas):

| Capacidad | Tool de Murdoc |
|---|---|
| Estructura del archivo / páginas | `figma_get_file_data` (con `nodeIds` y `depth`) o `figma_execute` con `figma.loadAllPagesAsync()` |
| Componentes y variantes | `figma_search_components`, `figma_get_component_for_development`, `figma_analyze_component_set` |
| Tokens (variables) | **`figma_export_tokens`** con `format: "dtcg"` (canónico) y `format: "css-vars"` (para `tokens.css`) |
| Estilos (texto, efectos) | `figma_get_styles`, `figma_get_text_styles` |
| Captura de nodo | `figma_take_screenshot` / `figma_get_component_image` |
| Iconos SVG | `figma_take_screenshot` con `format: "svg"` por `nodeId` |
| Contraste / a11y del diseño | `figma_lint_design`, `figma_audit_component_accessibility` |

**Nunca inventes valores.** Si una capacidad falla, usa captura + medición y dile al usuario qué dato no se pudo confirmar.

---

## Flujo de trabajo

1. **Paso 0 — Confirmación** (arriba).
2. **Extraer datos de Figma** según el alcance: paleta real (hex), variables, spacing, grid, tipografía, capas de cada componente.
   - Tokens: `figma_export_tokens { format: "dtcg", outputPath: "<proyecto>/assets/tokens.json" }` y `{ format: "css-vars" }` como base de `tokens.css`. Si el proyecto tiene contrato del Pilar 0 (`docs/contract-reference/`), los nombres de token siguen el contrato, no se inventan.
3. **Levantar la carpeta del proyecto** (ver `tokens-y-estructura`).
4. **Escribir `tools/build.py`**: link activo SIEMPRE por `href == current_path`; chrome del sitio con Flexbox (nunca CSS Grid + sticky). Copia también `tokens.json` (DTCG) a `assets/`.
5. **Tipografía**: `<link rel="preconnect">` + `<link rel="stylesheet">` en `<head>`, nunca `@import`, siempre con fallback de sistema. Si el sitio debe abrir sin red, autohospeda las fuentes (`.woff2` + licencia).
6. **Ejecutar** `python3 tools/build.py`.
7. **Previews contra Figma**: para cada componente, compara el preview con `figma_get_component_image` del mismo nodo.
8. **Verificar** con `node <ruta de la skill>/scripts/verify-site.mjs <carpeta-del-sitio>` (ver `verificacion`). Corrige antes de seguir.
9. **Auditoría AI-Ready**: `use_skill { skill: "ai-ready-audit" }` sobre el sitio **y** el archivo de Figma; publica el scorecard en `docs/intro.html` y el badge `AI-Ready X/8` en `index.html`.
10. **Entregar**: `zip -rq <nombre>.zip <carpeta>`, comunica la ruta de `index.html` y del ZIP, y un resumen en español: qué se generó, qué datos no se pudieron confirmar y el AI-Ready score.

---

## Barra de calidad: ToolKit (de ALX) es la referencia

- Sitio multi-página real (`index.html` + `docs/*.html` + `atoms/` + `molecules/` + `organisms/` + `templates/`), generado por `tools/build.py`. NO un archivo único con anclas.
- `index.html` con buscador de componentes, tarjetas por categoría con badge de tipo y **badge AI-Ready**.
- CSS en capas: `tokens.css`, `base.css`, `components.css`, `docs.css`.
- Chrome del sitio con Flexbox.

## Diagnóstico rápido
- "Se ve en blanco" → CSS Grid + sticky (reconstruir con Flexbox) o dependencia de red bloqueada.
- "El contraste no pasa" o "varios botones activos" → `verify-site.mjs` reporta contraste y conteo de `.is-active`.

## Relación con otros skills
- Reemplaza a **generate-showcase-page** (que queda como alias).
- **generate-documentation** produce la documentación por componente que este sitio puede incorporar.
- **sync-tokens** y **apply-contract** comparten los tokens DTCG.
- **ai-ready-audit** produce el scorecard.
