# apply-contract

Skill para ingerir el **contrato del Pilar 0** como base del sistema de diseño en Figma: convierte los tokens DTCG en variables (tres niveles con alias) y crea stubs de componente cuyos nombres siguen la nomenclatura `category/role/variant` del registry. Es el cable Pilar 0 → Murdoc.

## Prerequisito
Carga figma-use antes de ejecutar este skill.

## Regla de oro
El contrato es la fuente de verdad. Este skill **consume** el contrato; **no** redefine tokens ni nomenclatura. Es la base alternativa a `setup-radix-base`/`apply-design-system` cuando existe un contrato del Pilar 0.

## Cuando usar este skill
- Al iniciar un proyecto que parte del contrato del Pilar 0 (existe `docs/contract-reference/` o el usuario provee la ruta al contrato).
- Como paso previo a `generate-*` cuando la base es el contrato y no Radix.
- Cuando `sync-tokens` importa DTCG (delega en este skill el alta de variables).

## Insumos que consume
Por defecto lee de `docs/contract-reference/` (colócalo antes de correr; ver README de esa carpeta). El usuario puede indicar otra ruta.

```
docs/contract-reference/
├── tokens/design.tokens.json          # DTCG, 3 niveles · fuente de verdad
├── registry.json                       # manifiesto shadcn con items[].meta.contract
├── contract/
│   ├── component-contract.schema.json
│   ├── naming.md                        # convención category/role/variant
│   └── examples/*.contract.json         # un contrato por componente
└── tools/validate-contract.mjs          # gate del Pilar 0
```

Si no existen, **detente y pídelos**: sin ellos no hay contra qué crear ni validar.

## Parámetros disponibles
- `ruta`: carpeta del contrato (default: `docs/contract-reference`)
- `alcance`: `tokens` · `componentes` · `todo` (default: `todo`)
- `stubs`: `si` · `no` — crear componentes stub o solo variables (default: `si`)

---

## Pasos de ejecución

### Paso 1 — Verificar conexión y contrato
```
- figma_get_status → confirmar conexión con Figma Desktop
- Leer <ruta>/tokens/design.tokens.json, <ruta>/registry.json y <ruta>/contract/examples/*.contract.json
- figma_get_variables → verificar si ya existen colecciones "Contract / *"
  - Si existen, preguntar al usuario: sobreescribir, versionar (v2) o cancelar
- (Opcional, recomendado) correr `node <ruta>/tools/validate-contract.mjs`; si el gate falla, no ingerir un contrato inválido
```

### Paso 2 — Tokens DTCG → variables de Figma

Se crean **tres colecciones**, una por nivel, en este orden (por las referencias entre niveles):

| Colección Figma | Nivel DTCG | Referencia a |
|---|---|---|
| `Contract / Primitive` | `primitive.*` | valores crudos (sin alias) |
| `Contract / Semantic`  | `semantic.*`  | alias → Primitive |
| `Contract / Component` | `component.*` | alias → Semantic |

> **Regla dura del contrato:** los componentes referencian **semántico**, nunca primitivo. Respétalo al crear los alias.

#### Reglas de parseo DTCG (2025.10)
- **Nombre de variable**: aplana el path DTCG con `/`. Ej: `primitive.color.neutral.0` → variable `color/neutral/0` en la colección `Contract / Primitive`.
- **`$type`** se hereda del grupo ancestro si el token no lo declara. Mapeo a tipo de variable Figma:

  | `$type` DTCG | Tipo variable Figma | Valor |
  |---|---|---|
  | `color` | `COLOR` | hex → `{r,g,b}` normalizado 0–1 |
  | `dimension` | `FLOAT` | usar `$value.value` (el `.unit` se guarda en `setPluginData`) |
  | `fontFamily` | `STRING` | string tal cual |
  | `fontWeight` | `FLOAT` | número |

- **Referencias** `{a.b.c...}`: el primer segmento (`primitive`/`semantic`/`component`) indica la **colección destino**; el resto es el nombre de la variable con `/`. Se crea un **alias de variable** (`VARIABLE_ALIAS`), no un valor literal.
  - Ej: `semantic.color.bg.base` con `$value: "{primitive.color.neutral.0}"` → variable `color/bg/base` en `Contract / Semantic`, aliaseada a `color/neutral/0` de `Contract / Primitive`.
- **Dimensiones DTCG** vienen como objeto `{ "value": 16, "unit": "px" }`, **no** como `"16px"`. Extrae `.value`.

#### Ejecución (tool nativa — v3)
Las reglas de arriba describen el resultado esperado; **la ejecución ya no es manual**. `figma_import_tokens` parsea DTCG 2025.10, toma los grupos de primer nivel como sets (`primitive` · `semantic` · `component`), crea primero los literales y luego los alias, y conserva las dimensiones `{value, unit}`.

1. **Dry-run** (siempre primero):
   ```
   figma_import_tokens {
     files: [{ path: "docs/contract-reference/tokens/design.tokens.json", content: "<contenido>" }],
     collectionMapping: { primitive: "Contract / Primitive", semantic: "Contract / Semantic", component: "Contract / Component" },
     dryRun: true
   }
   ```
   Muestra el plan (colecciones y variables a crear, cambios, conflictos) y pide confirmación.
2. **Aplicar**: mismos argumentos con `dryRun: false`. Si hay conflictos (`onConflict: "ask"`), pregunta antes de reintentar con `figma-wins` o `code-wins`.
3. **Verificar la regla dura**: con `figma_export_tokens { format: "dtcg", dtcgDialect: "2025", strategy: "dry-run" }`, confirma que ninguna variable de `Contract / Component` aliasa directo a `Contract / Primitive`. Si alguna lo hace, **avisa**: viola el contrato.

> **Fallback (solo si la tool nativa no está disponible, p. ej. un servidor viejo):** crear las colecciones con `figma_execute` en el orden Primitive → Semantic → Component, con APIs async y alias `{ type: "VARIABLE_ALIAS", id }`, `timeout: 25000`, devolviendo solo `{ collectionId, count }`.

### Paso 3 — Componentes del registry → stubs con nomenclatura

Para cada item de `registry.json` con `type: "registry:ui"`:
1. Lee su `.contract.json` (ruta en `files[].path`) y su `meta.contract` (el `id` `category/role/variant`).
2. Crea un **componente stub** en Figma cuyo **nombre es exactamente el `id`** (ej: `action/button/primary`). Usa Auto Layout.
3. Escribe la definición del contrato en el nodo:
   - `figma_set_description` → `name`, `description`, `when` (regla de uso), `behavior.primitive` si existe.
   - `figma_execute` → `node.setPluginData("contract", JSON.stringify({ id, slots, states, props, tokensUsed, a11y }))`.
   - Bindea los `tokensUsed` del contrato a las variables `Contract / Component` creadas en el Paso 2 (fills/strokes/radius según corresponda), usando `boundVariables`.
4. Para cada `state` del contrato, crea una variante (o al menos documenta los estados en pluginData si no se generan variantes visuales). Para cada `slot`, prepara un frame Auto Layout con prefijo `slot-` (ver `slot-patterns`; la conversión a slot nativo es manual).

> Los stubs son **definiciones ancla**: fijan nombre + contrato + tokens. `generate-*` (vía `reuse-first`) los reutilizará en vez de recrear.

### Paso 4 — Reportar
- Variables creadas por colección (primitive / semantic / component) y modos.
- Componentes stub creados, con su `id` `category/role/variant`.
- Violaciones detectadas (componente que referencia primitivo, token inexistente, id duplicado).
- Sugerir siguiente paso: `reuse-first` + `generate-screen`, o `connect-codebase` para amarrar a código.

## Aceptación (cómo se valida este skill)
Dado `docs/contract-reference/`, tras correr:
- Existen las variables de los tres niveles con alias correctos (semántico→primitivo, componente→semántico).
- Existen los stubs de componente cuyos **nombres coinciden con los `id`** del registry (`action/button/primary`, `form/field/text`, `overlay/dialog/modal`).

## Ejemplos de uso
- "Aplica el contrato del Pilar 0 en este archivo de Figma"
- "Ingesta los tokens DTCG y crea los componentes del registry"
- "Crea la base del DS desde docs/contract-reference"
