# Bloques de código multi-framework

> Contenido de **figma-uikit-docsite v2** de **ALX**. Las adaptaciones de Murdoc van marcadas con **[Murdoc]**.

Cada página de componente genera un bloque de código con una pestaña por cada formato seleccionado en el Paso 0. El JS de `interactions.js` gestiona el toggle de pestañas. Estructura HTML del bloque:

```html
<div class="code-block" data-tabs>
  <div class="code-tabs">
    <button class="code-tab is-active" data-tab="html">HTML</button>
    <button class="code-tab" data-tab="react">React</button>
    <button class="code-tab" data-tab="vue">Vue 3</button>
  </div>
  <div class="code-panel" data-panel="html">
    <pre>...snippet HTML...</pre>
    <button type="button" class="code-copy">Copiar</button>
  </div>
  <div class="code-panel" data-panel="react" hidden>
    <pre>...snippet JSX...</pre>
    <button type="button" class="code-copy">Copiar</button>
  </div>
  <div class="code-panel" data-panel="vue" hidden>
    <pre>...snippet Vue SFC...</pre>
    <button type="button" class="code-copy">Copiar</button>
  </div>
</div>
```

El snippet de cada formato debe ser mínimo y reproducible:
- **HTML**: clases CSS reales, sin JS extra si el componente es estático
- **React**: componente funcional con props tipadas en comentario, imports de CSS al tope
- **Vue 3 SFC**: `<template>` + `<script setup lang="ts">` + `<style scoped>` importando los tokens
- **Angular**: selector del componente + sus `@Input()` documentados como comentario

**[Murdoc]** Si existe `code-connect.map.json` (skill `connect-codebase`), el snippet de React usa el `import` y el nombre de componente reales del mapa en vez de un componente genérico.
