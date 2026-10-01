---
name: ai-ready-audit
description: Audita si una librería de componentes es AI-Ready (una IA puede consumirla y generar UI coherente sin fricción) con un scorecard de 8 dimensiones, sobre el archivo de Figma y/o el sitio de documentación generado.
credit: ALX
---

# ai-ready-audit — scorecard AI-Ready (8 dimensiones)

> Scorecard creado por **ALX** dentro de figma-uikit-docsite v2. Murdoc lo convierte en skill independiente y le agrega el **modo Figma**: las mismas 8 dimensiones medidas directo sobre el archivo, no solo sobre el sitio.

Una librería es **AI-Ready** cuando una IA (o un desarrollador vía IA) puede consumirla, entenderla y generar interfaces coherentes sin fricción.

## Prerequisito
`use_skill` antepone `figma-use`. Para el modo sitio, el sitio ya debe existir (`generate-docsite`).

## Modos
- **Figma** — audita el archivo conectado. No requiere sitio. Útil antes de un handoff o para priorizar deuda del DS.
- **Sitio** — audita el sitio de `generate-docsite` y publica el scorecard en `docs/intro.html`.
- **Ambos** (recomendado tras `generate-docsite`) — una columna por modo; las discrepancias entre Figma y código son hallazgos en sí mismas.

Cada dimensión: ✅ Cumple · ⚠️ Parcial · ❌ Falta. Score = dimensiones en ✅ sobre 8.

---

## Las 8 dimensiones

| # | Dimensión | Criterio (original de ALX) | Cómo medir en Figma (Murdoc) |
|---|---|---|---|
| 1 | **Tokens semánticos estructurados** | Ningún valor hardcodeado; 3 capas primitivo → semántico → componente; naming `--{rol}-{superficie}-{estado}`; export JSON | `figma_export_tokens { format: "dtcg" }` → ¿hay colecciones/grupos por capa? `figma_lint_design` → conteo de fills/strokes sin variable |
| 2 | **Nomenclatura de variantes consistente** | Mismo vocabulario (`size: sm/md/lg`, `hierarchy: primary/secondary`, `state: default/hover/active/disabled`) en CSS, código y capas | `figma_analyze_component_set` por set → compara nombres y valores de propiedades entre sets |
| 3 | **Snippets por framework** | Snippet mínimo y reproducible por formato; mismas clases/props que el preview | Solo sitio. En Figma: ⚠️ si no hay `code-connect.map.json` ni descripción `Code:` |
| 4 | **Metadatos de accesibilidad** | Rol ARIA, atributos obligatorios, teclado; contraste WCAG AA publicado | `figma_audit_component_accessibility` por componente; anotaciones de a11y (`figma_get_annotations`) |
| 5 | **Trazabilidad Figma ↔ código** | Nombre exacto de la capa en cada componente; variables con el mismo nombre que los tokens CSS | Compara nombres de variables (DTCG) contra `tokens.css` / contrato del Pilar 0; `connect-codebase` → % `linked` |
| 6 | **Props y estados cubiertos** | Todos los estados visuales documentados; ningún estado de Figma sin código | Variantes de `state` por set vs estados del contrato (`states[]` del `.contract.json`) |
| 7 | **Microinteracciones especificadas** | Timing, easing y trigger por transición; motion tokens (`--duration-*`, `--easing-*`) | Variables de duración/easing en el export DTCG; prototype reactions con `figma_execute` (`node.reactions`) |
| 8 | **Independencia de red** | Abre por `file://` sin CDN; fuentes con fallback; iconos SVG inline | Solo sitio: `generate-docsite/scripts/verify-site.mjs --offline`. En Figma: iconos como componentes vectoriales, no imágenes raster |

### Script de apoyo (modo Figma)
Para las dimensiones 2 y 6, recorre los component sets con `figma_execute` (timeout 20000) y devuelve compacto:
```js
await figma.loadAllPagesAsync();
const sets = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET"] });
return sets.slice(0, 200).map(s => ({
  name: s.name,
  props: Object.fromEntries(Object.entries(s.componentPropertyDefinitions)
    .filter(([, d]) => d.type === "VARIANT")
    .map(([k, d]) => [k.split("#")[0], d.variantOptions])),
}));
```
Normaliza claves (`Size`/`size`, `State`/`state`) y reporta vocabularios divergentes: p. ej. `size: [S, M, L]` en un set y `size: [sm, md, lg]` en otro → ⚠️ en la dimensión 2.

---

## Acción por cada ❌ (del original, más modo Figma)
- Token sin export → generar `assets/tokens.json` con `figma_export_tokens { format: "dtcg" }`.
- Naming drift Figma ↔ CSS → documentar en la tabla de specs con `[⚠️ renombrar en Figma]`; en modo Figma, listar las variables a renombrar (no renombrar sin confirmación del usuario).
- Estado de Figma sin snippet → agregar el estado al preview interactivo antes de entregar.
- Motion tokens faltantes → agregar `--duration-fast: 120ms`, `--duration-base: 200ms`, `--easing-standard: cubic-bezier(.4,0,.2,1)` a `tokens.css` y referenciarlos; en Figma, proponer la colección `Motion` (crearla solo con confirmación).

## Salida
1. Tabla de 8 filas: dimensión · estado (por modo) · nota breve de qué falta en cada ⚠️/❌.
2. Score `AI-Ready X/8` (si hay ambos modos, se publica el menor y se explica la diferencia).
3. Modo sitio: tabla HTML al final de `docs/intro.html` (generada por `build.py`) y badge en `index.html`.
4. Top 3 acciones de mayor impacto, ordenadas.

## Reglas
- No modifiques el archivo de Figma durante la auditoría: es de solo lectura. Las correcciones se proponen y se aplican después, con confirmación.
- Cada ✅ debe tener evidencia (conteo, nombre de tool, ejemplo). Sin evidencia es ⚠️.

## Relación con otros skills
- **generate-docsite** la invoca en el paso 9.
- **audit-quality** y **review-gates** cubren drift y gates generales; esta skill mide la consumibilidad por IA.
- **connect-codebase** alimenta la dimensión 5.
