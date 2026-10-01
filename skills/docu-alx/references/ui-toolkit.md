# Sistema visual ToolKit para Docu ALX

La plantilla base adapta el lenguaje visual del sitio local `toolkit-design-system`: no replica su arquitectura de documentación atómica ni convierte las HU en fichas de componentes.

## Fundamentos retenidos

- Source Sans 3 autohospedada, con pesos 400, 600 y 700 y su licencia OFL dentro del entregable.
- Escala espacial de 4, 8, 12, 16, 24 y 32 px.
- Radios de 8, 16 y 24 px.
- Sidebar azul oscuro `#1A202C`, texto claro y acento mint `#1BDEA6`.
- Superficies neutras `#FFFFFF`, `#F6F6F6` y `#F4F4F4`.
- Texto principal `#1A202C`, secundario `#3A485D` y acción `#0E6270`.
- Encabezado pegajoso, breadcrumb discreto, tarjetas planas y estados con rótulo textual.
- Movimiento breve: 120–320 ms, con foco visible y respeto por `prefers-reduced-motion`.

## Aplicación documental

- El sidebar representa el inventario de HU, no categorías de Atomic Design.
- La portada resume el alcance y presenta tarjetas de acceso a cada HU.
- La vista de detalle mantiene una columna de lectura cómoda; evita títulos desproporcionados y decoración editorial que compita con el contenido.
- Los criterios de aceptación, propuestas y pendientes se muestran como superficies funcionales, con color y texto redundantes.
- El chat reutiliza el patrón ToolKit de burbuja de entrada, salida ligera, input amplio y acciones circulares, pero no muestra selectores de modelo ni acciones que impliquen IA.

## Adaptación de marca

Si el usuario aporta identidad visual, cambia primero tokens y tipografía; conserva la jerarquía, contraste, estados y comportamiento responsive. No mezcles parcialmente dos marcas si eso produce inconsistencias.
