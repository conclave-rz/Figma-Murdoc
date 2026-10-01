# sync-tokens

Skill para sincronizar tokens entre Figma y el codebase, en **ambas direcciones**, sobre las tools nativas `figma_export_tokens` y `figma_import_tokens` (diff-aware, con dry-run, detección de conflictos y round-trip por IDs de variable). Exporta a DTCG, CSS, Tailwind v3/v4, SCSS, TS o JSON; importa DTCG (`design.tokens.json`) a variables de Figma.

## Prerequisito
Carga figma-use antes de ejecutar este skill.

## Regla de oro
**No reimplementes el export/import con `figma_execute`.** Las tools nativas ya resuelven alias entre colecciones, modos, dimensiones DTCG `{value, unit}`, diff contra el estado actual y la protección contra sobrescribir archivos con un export vacío. `figma_execute` queda solo como diagnóstico.

## Cuando usar este skill
- Development necesita los tokens actualizados del DS (export)
- Cambios en variables de Figma que deben llegar a código (export)
- El contrato del Pilar 0 (`design.tokens.json` DTCG) debe entrar a Figma (import)
- Setup inicial de tokens en un proyecto nuevo
- Detectar drift entre Figma y código (dry-run en cualquiera de las dos direcciones)
- Round-trip DTCG código → Figma → código sin pérdida

## Parámetros disponibles
- `direccion`: export · import (default: export)
- `formato` (export): **dtcg** · css · tailwind · tailwind-v3 · scss · ts · json (default: css)
- `archivo` (import): ruta del DTCG (default: `docs/contract-reference/tokens/design.tokens.json`)
- `colecciones`: todas · [nombres] (default: todas)
- `modo`: light · dark · todos (default: todos)

### Mapeo `formato` → `figma_export_tokens.format`
| formato | format nativo | Notas |
|---|---|---|
| dtcg | `dtcg` | **Contrato del Pilar 0: `dtcgDialect: "2025"`** (dimensiones y colores como objeto). Sin contrato: dialecto `legacy` (hex string, máxima compatibilidad). |
| css | `css-vars` | Selectores por modo (`:root`, `.dark`, `[data-theme=…]`) |
| tailwind | `tailwind-v4` | `@theme inline` |
| tailwind-v3 | `tailwind-v3` | `theme.extend` |
| scss | `scss` | Variable primaria + mapa por modo |
| ts | `ts-module` | `export const tokens = {…} as const` |
| json | `json-nested` (o `json-flat`) | Para scripts propios |

---

## DIRECCIÓN: export (Figma → código)

### Paso 1 — Resumen y confirmación
```
- figma_get_variables (verbosity: "summary") → X variables en Y colecciones con Z modos
- Confirmar colecciones y modos a exportar (collectionIds / modes)
```

### Paso 2 — Previsualizar sin escribir
```
- figma_export_tokens { format, collectionIds?, modes?, dtcgDialect?, strategy: "dry-run" }
- Si existe un archivo destino, la respuesta trae el diff: tokens nuevos, eliminados y cambiados.
- Mostrar el diff al usuario y pedir confirmación.
```

### Paso 3 — Escribir
```
- figma_export_tokens { ..., outputPath: "<ruta del archivo>", strategy: "merge" }
- "merge" se niega a escribir si el export sobrescribiría tokens que solo existen en el archivo:
  reportarlo y preguntar antes de usar "replace".
- Con tokens.config.json en la raíz del proyecto, la tool puede llamarse sin argumentos (lee formatos, rutas y modos del config).
```

> **Regla dura del contrato:** los componentes referencian **semántico**, nunca primitivo. Si el export muestra una variable de componente aliaseada directo a primitivo, avísalo en el reporte.

---

## DIRECCIÓN: import (DTCG → Figma)

### Paso 1 — Localizar y validar
```
- Leer `archivo` (default: docs/contract-reference/tokens/design.tokens.json)
- Validar que es DTCG: tokens con $type/$value; los grupos de primer nivel son los sets
  (en el contrato: primitive · semantic · component)
```

### Paso 2 — Dry-run (siempre primero)
```
- figma_import_tokens {
    files: [{ path: "<archivo>", content: "<contenido>" }],   // o payload: "<contenido>"
    collectionMapping: { primitive: "Contract / Primitive",
                         semantic:  "Contract / Semantic",
                         component: "Contract / Component" },   // solo para el contrato del Pilar 0
    dryRun: true
  }
- Mostrar el plan: colecciones/variables a crear, valores a actualizar, conflictos.
```

### Paso 3 — Aplicar
```
- figma_import_tokens { ...mismos args, dryRun: false, strategy: "merge" }
- Conflictos (cambió en Figma y en código desde el último sync): onConflict "ask" (default) no escribe;
  preguntar al usuario y reintentar con "figma-wins" o "code-wins".
- Reportar variables creadas/actualizadas por colección.
```

`apply-contract` usa exactamente este import para su Paso 2; no dupliques la lógica.

---

## Round-trip (aceptación)
Al menos un token sobrevive **código → Figma → código** sin pérdida:
1. Token conocido: `semantic.color.bg.base = {primitive.color.neutral.0}`.
2. `import` (Paso 2–3) → la variable `color/bg/base` en `Contract / Semantic` queda como alias de `color/neutral/0` en `Contract / Primitive`.
3. `export formato=dtcg` con `dtcgDialect: "2025"`.
4. Comparar: misma referencia `{primitive.color.neutral.0}`, mismo valor resuelto, dimensiones como `{value, unit}`. Los IDs de variable viajan en `$extensions["figma-console-mcp"]`, así que un rename no duplica.
5. Reportar cualquier pérdida (alias colapsado a literal, dimensión convertida a string, set perdido).

## Ejemplos de uso
- "Exporta todos los tokens como CSS variables"
- "Dame el config de Tailwind v4 con los colores del DS"
- "Exporta los tokens en DTCG para el contrato del Pilar 0"
- "Importa el design.tokens.json del contrato a Figma"
- "¿Hay diferencias entre los tokens de Figma y los de nuestro código?" (dry-run)
- "Haz el round-trip del token de fondo base y verifica que no se pierde"
