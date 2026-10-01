# Accesibilidad (obligatorio, no opcional)

> Contenido de **figma-uikit-docsite v2** de **ALX**. Las adaptaciones de Murdoc van marcadas con **[Murdoc]**.

1. **Contraste WCAG AA mínimo**: ≥ 4.5:1 texto normal, ≥ 3:1 texto grande/bordes de foco. Calcular con la fórmula de luminancia real sobre CADA par texto/fondo.
2. **Nunca texto oscuro-sobre-oscuro ni claro-sobre-claro** — calcularlo, no asumirlo.
3. **Exactamente UN estado activo** en navegación. Calculado en `build.py` comparando `href == current_path`, nunca hardcodeado.
4. **Links de sidebar con `href` real** + `aria-current="page"` en el activo. Envueltos en `<nav aria-label="Navegación de componentes">`.
5. **Botones son `<button type="button">`**, nunca `<div>` ni `<a>` sin href.
6. **`:focus-visible` global** con contraste ≥ 3:1 contra todas las superficies donde aparece.
7. **`lang` correcto, jerarquía de encabezados sin saltos**, `alt` en imágenes funcionales.
8. **Objetivos de toque ≥ 24×24px** (idealmente 44×44px).

**[Murdoc]** Antes de documentar, corre `figma_audit_component_accessibility` sobre cada componente y lleva los hallazgos a la tabla de specs. `scripts/verify-site.mjs` revalida contraste, foco y estado activo en el HTML generado.
