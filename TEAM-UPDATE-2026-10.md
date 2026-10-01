# Murdoc Update — Octubre 2026 (v3.0.0)

## Resumen

Murdoc v3 se pone al día con upstream (figma-console-mcp **1.40.8**, **124 tools**), suma el pack de skills de **ALX** (de 22 a **27 skills**) y corrige los bugs que hacían lento a v2. Requiere **reimportar el plugin de Figma una sola vez**.

---

## Cómo actualizar (10 minutos)

### 1. Traer v3 y compilar
En la carpeta donde clonaste Murdoc:
```bash
git pull
npm install
npm run build:local
```
Si `git pull` se queja de cambios locales, avisa antes de forzar nada.

### 2. Reiniciar Claude
- **Claude Desktop:** ciérralo por completo con **⌘Q** y ábrelo de nuevo.
- **Claude Code:** en cada sesión abierta, `/mcp` → `figma-console` → **Reconnect** (o cierra las sesiones viejas).

Un servidor solo carga la versión nueva al reiniciarse: una sesión abierta desde antes del `git pull` sigue con v2.

### 3. Reimportar el plugin en Figma (importante)
1. `Plugins → Development → Manage plugins in development` → elimina **Figma Desktop Bridge**. Solo quita el registro en Figma; no borra archivos.
2. `Plugins → Development → Import plugin from manifest...`
3. Presiona **⌘⇧G**, pega `~/.figma-console-mcp/plugin/` y elige **manifest.json**.
4. Abre el plugin: `Plugins → Development → Figma Desktop Bridge`.

**Por qué:** si importaste el plugin desde otra carpeta (el repo, un clon viejo), Figma sigue corriendo *ese* código aunque actualices Murdoc. En la máquina de Rz el plugin era la versión 1.14.0 de marzo: ningún fix de plugin de v2 se estaba ejecutando. La ruta `~/.figma-console-mcp/plugin/` la actualiza Murdoc solo en cada arranque, así que es la última vez que reimportas.

### 4. Verificar
Pide a Claude: *"corre figma_get_status y list_skills"*.
- ✅ `pluginVersion: "3.0.0"` y `bundledPluginVersion: "3.0.0"`
- ✅ 27 skills

Si `pluginVersion` sale distinto, repite el paso 3.

---

## Qué mejora

### Más rápido (medido en un DS real de 141 componentes)
| Operación | v2 | v3 |
|---|---|---|
| Instanciar un componente local | Timeout a los 15 s (y dejaba una instancia huérfana) | ~1.7 s |
| Key inválida | Timeout a los 15 s | Error claro en 0.6 s |
| `figma_search_components` | Más de 120 s y 0 resultados | ~10 s, 19 resultados |

### Skills nuevos (de ALX)
- **`hu-alx`** — entrevista guiada para redactar Historias de Usuario sin inventar decisiones.
- **`docu-alx`** — publica las HU como micrositio navegable con búsqueda y consulta local.
- **`generate-docsite`** — sitio de documentación del DS estilo Pattern Lab, con verificación automática (contraste, navegación, modo oscuro). Reemplaza a `generate-showcase-page`.
- **`ai-ready-audit`** — scorecard de 8 dimensiones para saber si la librería la puede usar una IA, también directo sobre Figma.

### Herramientas nuevas de upstream (las usan los skills)
Slots nativos (crear, convertir y poblar), sincronización de tokens en DTCG con diff y simulación, historial de versiones, auditoría de accesibilidad, trabajo en varios archivos a la vez y un plugin que se reconecta solo.

### Skills actualizados
`sync-tokens` y `apply-contract` (tokens nativos), `migrate-to-slots` y `slot-patterns` (ya crean slots, sin paso manual), `reuse-first` (búsqueda de respaldo para no duplicar componentes).

---

## Cuidado

- **Tokens:** al importar tokens a un archivo con otras variables usa siempre la estrategia **merge** (la default). En un DS real, `replace` borraría cientos de variables que no vienen en el archivo de tokens. Los skills ya lo advierten.
- **Botón Pause del plugin:** mientras está en pausa, Claude no puede modificar el archivo. Úsalo cuando trabajes en un archivo delicado.

Detalle técnico completo en [CHANGELOG.md](CHANGELOG.md). Créditos del pack en [CREDITS.md](CREDITS.md).
