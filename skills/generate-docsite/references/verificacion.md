# Verificación

> Basada en la sección de verificación de **figma-uikit-docsite v2** de **ALX**. **[Murdoc]** El original usaba Playwright con una ruta de Chromium del sandbox de Linux (`/opt/pw-browsers/...`) que no existe en Claude Code; aquí se automatiza con `scripts/verify-site.mjs`, que usa el Chrome local vía `puppeteer-core` (la misma dependencia de la captura viva de Murdoc).

## Cómo correrla

```bash
node "<assets de la skill>/../scripts/verify-site.mjs" <carpeta-del-sitio> [--out <carpeta-de-capturas>]
```
La ruta de la skill la devuelve `use_skill`. Sale con código 0 si todo pasa y 1 si algo falla; imprime un reporte JSON.

## Qué verifica el script
- Carga **cada página** por `file://` (sin servidor) y registra errores de consola y solicitudes de red externas.
- Cuenta `.is-active` visibles en el sidebar: **debe ser exactamente 1** por página.
- Toma screenshots **light y dark** (`prefers-color-scheme`) de cada página.
- Corre el **checker de contraste** WCAG sobre cada par texto/fondo calculado de los elementos visibles con texto (≥ 4.5:1 normal, ≥ 3:1 grande).
- Verifica que `assets/tokens.json` existe y es JSON válido con forma DTCG (`$value`).
- Verifica que no haya `@import` de fuentes y que `<html lang>` esté definido.

## Lo que sigue siendo manual
- Comparar medidas contra Figma (`getBoundingClientRect` vs `figma_get_component_for_development`) en los componentes tocados.
- Regresión de la interactividad (toolbar de estados, pestañas de código, modal fullscreen con Escape).

## Del original (criterio que se conserva)

Después de cada cambio, levantar `python3 -m http.server 8123` (como llamada separada de cualquier `pkill`) y correr la verificación headless (**[Murdoc]** `scripts/verify-site.mjs`) que:
- toma screenshots light Y dark de las páginas tocadas
- mide `getBoundingClientRect()` de elementos relevantes y compara contra valores de Figma
- corre regresión de toda la interactividad existente
- **cuenta `.is-active` visibles en el sidebar** — debe ser exactamente 1
- **corre el checker de contraste** sobre `tokens.css`:
  ```python
  def lum(hexc):
      hexc = hexc.lstrip('#')
      r,g,b = [int(hexc[i:i+2],16)/255 for i in (0,2,4)]
      f = lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
      return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
  def contrast(c1,c2):
      l1,l2 = sorted([lum(c1),lum(c2)], reverse=True)
      return (l1+0.05)/(l2+0.05)
  ```

Esta verificación es red de seguridad mínima, no garantía definitiva. El bug de CSS Grid + sticky no se reprodujo en headless — la defensa real es el patrón de layout Flexbox.
