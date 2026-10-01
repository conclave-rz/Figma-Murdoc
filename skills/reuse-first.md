# reuse-first

Preflight de **buscar-antes-de-generar**: antes de crear cualquier pieza, consulta el registry del contrato y la librería/DS del archivo; si la pieza ya existe, la **reutiliza** en vez de recrearla. Las tools de búsqueda ya existen — este skill añade el paso, no la capacidad.

## Prerequisito
Carga figma-use antes de ejecutar este skill.

## Regla de oro
No recrees lo que ya existe. Una instancia reutilizada del contrato/DS siempre gana a un elemento nuevo construido desde cero: mantiene nomenclatura, tokens y Code Connect intactos.

## Cuando usar este skill
- Como **Paso 0** de `generate-screen`, `generate-library` y `generate-industry` (enganchado ahí; no rompe su flujo).
- Cuando el usuario pide una pantalla/componente y podría existir ya en el registry o en la librería.
- Standalone: "¿ya existe un botón primario que pueda usar?"

## Insumos que consulta
- `docs/contract-reference/registry.json` → `items[].meta.contract` (ids `category/role/variant`) y `when` (cuándo usar cada pieza).
- La librería/DS del archivo activo de Figma.

---

## Pasos de ejecución

### Paso 1 — Construir la lista de piezas requeridas
A partir de lo que el skill llamador va a generar (botón, input, card, nav, modal…), lista las piezas necesarias. Cuando exista contrato, exprésalas como ids `category/role/variant` usando el campo `when` del registry para elegir la variante correcta (ej. "acción principal única" → `action/button/primary`).

### Paso 2 — Buscar antes de generar
Para cada pieza, en este orden (de más autoritativo a menos):
```
1. Registry del contrato (docs/contract-reference/registry.json)
   - ¿Existe un item cuyo meta.contract corresponda? Guardar el id y su .contract.json.
2. figma_search_components → ¿existe ya una instancia/componente con ese nombre o equivalente en el archivo?
3. figma_get_library_components → ¿existe en una librería publicada vinculada?
4. figma_get_design_system_summary → panorama del DS del archivo para descartar duplicados.
```
Si conoces la key de un componente de librería (registry, `code-connect.map.json`), resuélvelo directo con `figma_get_library_component_by_key`.

**Búsqueda de respaldo (obligatoria si el paso 2 devuelve 0 resultados o error).** Un "0 resultados" puede significar que la búsqueda no corrió, no que el componente no exista (visto en v2: más de 120 s y 0 resultados en un archivo con una página de Buttons). Antes de decidir GENERAR, barre el archivo con `figma_execute` (timeout 30000):
```js
await figma.loadAllPagesAsync();
const comps = figma.root.findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] })
  .filter(c => c.type === "COMPONENT_SET" || c.parent?.type !== "COMPONENT_SET");
const norm = s => s.toLowerCase().replace(/[\s_]+/g, "-").trim();
const lev = (a, b) => { const d = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
const wanted = PIEZAS; // ["action/button/primary", ...]
return wanted.map(q => {
  const exact = comps.find(c => norm(c.name) === norm(q));
  if (exact) return { q, match: exact.name, nodeId: exact.id, how: "exacto" };
  const near = comps.map(c => ({ c, d: lev(norm(c.name), norm(q)) })).sort((x, y) => x.d - y.d)[0];
  return near && near.d <= 2 ? { q, match: near.c.name, nodeId: near.c.id, how: "fuzzy d=" + near.d } : { q, match: null };
});
```
Verificado en vivo: exacto, mayúsculas (`Action/Button/Primary`) y typo (`primaryy`, d=1) reusan; una pieza inexistente cae a GENERAR. Un match **fuzzy** se reporta al usuario antes de reusar.
Registrar por cada pieza: `{ pieza, encontrada: si|no, fuente: registry|archivo|libreria|ninguna, ref }`.

### Paso 3 — Decidir reusar vs. generar
```
- encontrada=si  → REUSAR vía figma_execute con el helper reuseComponent(). Todo async:
                    · local   → await figma.getNodeByIdAsync(nodeId)
                    · librería → await figma.importComponentByKeyAsync(variantKey)
                    → comp.createInstance() → appendChild + x/y → setProperties(variant/overrides).
                    Ver helper reuseComponent(). No reconstruir.
- encontrada=no  → marcar la pieza como "a generar" y devolver el control al skill llamador,
                    que la crea siguiendo sus reglas (Auto Layout, tokens del DS/contrato).
```
Si el registry define la pieza pero no hay componente en el archivo, sugerir correr `apply-contract` primero para materializar el stub y reusarlo.

> **Sobre `figma_instantiate_component`.** En v2 se colgaba 15 s. La causa real (verificada en vivo en v3) no era dynamic-page: el bridge intentaba primero `importComponentByKeyAsync(componentKey)`, que con un componente **local no publicado** nunca resuelve, y el servidor cortaba antes de llegar al fallback por `nodeId`. El bridge v3 busca primero el `nodeId` local. Aun así, el helper `reuseComponent()` vía `figma_execute` sigue siendo la ruta por defecto: es async de punta a punta y tarda ~90 ms para varias instancias.
>
> **Ojo con los timeouts:** una llamada que da timeout **puede crear la instancia después**, en silencio. Si una instanciación falla por timeout, busca y elimina instancias huérfanas antes de reintentar.

**Helper de reúso (drop-in async, seguro en dynamic-page):**
```js
async function reuseComponent({ nodeId, componentKey, parentId, position, variant, overrides }) {
  let comp = null;
  if (nodeId)                comp = await figma.getNodeByIdAsync(nodeId);
  if (!comp && componentKey) comp = await figma.importComponentByKeyAsync(componentKey);
  if (!comp) throw new Error("componente no resuelto: " + (nodeId || componentKey));
  if (comp.type === "COMPONENT_SET") comp = comp.defaultVariant || comp.children[0];

  const inst = comp.createInstance();
  if (parentId) { const p = await figma.getNodeByIdAsync(parentId); if (p) p.appendChild(inst); }
  if (position) { inst.x = position.x; inst.y = position.y; }
  const props = { ...(variant || {}), ...(overrides || {}) };
  if (Object.keys(props).length) inst.setProperties(props); // los nombres de prop pueden traer sufijo #nodeId

  const main = await inst.getMainComponentAsync();
  return { instanceId: inst.id, name: inst.name, mainComponentId: main && main.id };
}
```

### Paso 4 — Reportar el preflight
Emitir un resumen que el skill llamador incorpora a su flujo:
```
Preflight reuse-first:
- action/button/primary → REUSAR (librería: Button)
- form/field/text       → REUSAR (registry stub 123:45)
- data/table/default    → GENERAR (no existe)
```

## Aceptación (cómo se valida este skill)
La generación registra explícitamente un **paso de búsqueda** y **reutiliza un componente existente** cuando lo hay (aparece una instancia del componente encontrado, no una copia reconstruida desde cero).

## Enganche en los skills de generación
`generate-screen`, `generate-library` y `generate-industry` invocan este skill como Paso 0. El preflight no reemplaza su reconocimiento del DS; lo antecede: primero decide qué reusar, luego el skill solo genera lo que no existe.

## Ejemplos de uso
- "Antes de generar la pantalla, revisa qué componentes ya existen"
- "¿Tengo ya un modal en el sistema o lo tengo que crear?"
- "Reusa lo que haya del contrato antes de construir el flujo"
