---
name: docu-alx
description: Convierte Historias de Usuario definidas, especialmente en Markdown, en documentación HTML navegable con menú lateral, consulta local, recursos visuales y descarga en Markdown. Úsala para publicar, explorar o compartir HU en formato web; no para descubrir requisitos faltantes ni sustituir el refinamiento funcional de hu-alx.
base: none
credit: ALX
---

# Docu ALX

Transforma un conjunto de Historias de Usuario en un micrositio documental claro, accesible y autosuficiente. Conserva el significado, la certeza y la trazabilidad del contenido fuente; mejora su navegación y presentación, no sus decisiones de producto.

## Relación con HU ALX

- Usa `hu-alx` antes cuando las HU aún deban descubrirse, refinarse o validarse.
- Usa `docu-alx` cuando exista contenido suficiente para documentar, aunque esté marcado como borrador.
- No vuelvas a entrevistar al usuario por detalles editoriales que puedan resolverse con una presentación neutra.
- Si detectas un hueco funcional crítico, no lo completes: consérvalo como pendiente visible y recomienda volver a `hu-alx`.

## Flujo

1. Reúne las HU, preferentemente desde un archivo Markdown generado por `hu-alx`, y cualquier contexto, imagen o identidad visual que el usuario haya puesto en alcance.
2. Clasifica cada afirmación como confirmada, propuesta o pendiente; conserva estas etiquetas en la publicación.
3. Normaliza el contenido con [references/modelo-de-contenido.md](references/modelo-de-contenido.md). No exijas secciones vacías ni inventes texto para completar el modelo.
4. Copia `assets/site-template/` a una carpeta de salida y sustituye los datos de ejemplo de `content.js` por el contenido real. Conserva el sistema visual descrito en [references/ui-toolkit.md](references/ui-toolkit.md), salvo que el usuario proporcione otra identidad o pida una adaptación.
5. Incorpora recursos visuales según [references/imagenes-contextuales.md](references/imagenes-contextuales.md). Una imagen conceptual debe identificarse como propuesta, nunca como interfaz aprobada.
6. Configura el asistente local según [references/asistente-documental.md](references/asistente-documental.md). Sus respuestas deben derivarse solo del contenido registrado.
7. Verifica el resultado con [references/verificacion.md](references/verificacion.md). Corrige el HTML antes de entregarlo.
8. Entrega la carpeta web o un archivo ZIP cuando facilite su uso. Indica `index.html` como punto de entrada. Publica en internet solo si el usuario lo solicita.

## Contrato del entregable

El resultado debe funcionar como sitio estático, sin compilación ni dependencias remotas, y contener como mínimo:

- menú lateral con todas las HU, ID, título y estado;
- navegación directa mediante URL con fragmento estable;
- búsqueda por ID, título y contenido;
- botón de chat en el extremo derecho del encabezado y panel conversacional desplegable;
- respuestas locales con extractos y enlaces a las HU que las respaldan, sin afirmar que usa IA;
- lectura de una HU a la vez, con jerarquía clara y diseño adaptable a móvil;
- portada con resumen del alcance y tarjetas que permitan escanear todas las HU;
- contexto general y pendientes compartidos cuando existan;
- imágenes contextuales con texto alternativo, pie y tipo de evidencia;
- descarga en `.md` de la HU visible y del documento completo;
- impresión legible desde el navegador;
- estados vacío y sin resultados comprensibles.

## Criterios editoriales

- Respeta el orden, identificadores y vocabulario de la fuente.
- Prioriza contenido funcional sobre decoración; evita una apariencia genérica de panel administrativo.
- Distingue visualmente **Confirmado**, **Propuesta** y **Pendiente**.
- No presentes mockups generados como capturas del producto real.
- No expongas notas internas, prompts ni el proceso de generación.
- No incluyas datos sensibles en el HTML: un sitio estático distribuye todo su contenido al navegador.
- Mantén el entregable local salvo solicitud explícita de publicación.

## Decisiones razonables sin consulta

Puedes elegir tipografía del sistema, espaciado, colores neutros, iconos sencillos, orden responsivo y microcopys de navegación. Pregunta solo cuando falte una decisión que cambie el significado, la confidencialidad, el alcance, la identidad visual o la forma de publicación.

---

## Integración con Murdoc

> Skill creada por **ALX**. Se integra a Murdoc sin cambios de criterio; esta sección solo explica cómo cargarla y cómo aprovechar Figma.

- **Referencias por fase:** carga cada `references/*.md` con `use_skill { skill: "docu-alx", reference: "<nombre>" }` (`modelo-de-contenido`, `ui-toolkit`, `imagenes-contextuales`, `asistente-documental`, `verificacion`).
- **Plantilla:** `use_skill` devuelve la ruta absoluta de `assets/`; copia `assets/site-template/` completo a la carpeta de salida antes de editar `content.js`.
- **Imágenes desde Figma (Referencia real):** si la HU tiene pantallas en Figma, expórtalas con `figma_take_screenshot` (o `figma_get_component_image`) por `nodeId` y guárdalas en `assets/` del sitio. Rotúlalas como **Referencia real** solo si el diseño está aprobado; si es exploración, como **Propuesta visual · No representa una interfaz aprobada**.
- **Verificación local:** sirve el sitio con `python3 -m http.server` y verifica con el navegador headless de Murdoc (Chrome vía `puppeteer-core`) o Playwright si está instalado: carga, fragmentos de URL, búsqueda, chat, descargas, móvil y cero solicitudes de red.
- **Entrega:** indica la ruta de `index.html` (y del ZIP si lo generas). No publiques en internet salvo petición explícita.
