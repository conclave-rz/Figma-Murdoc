# Modelo de contenido y trazabilidad

## Entrada aceptada

Acepta HU provenientes de Google Docs, Word, Markdown, texto, tickets, hojas de cálculo o la salida de `hu-alx`. Conserva los identificadores existentes. Si no existen, usa identificadores provisionales (`HU-P01`, `HU-P02`) y rotúlos como tales.

## Estructura del sitio

Organiza el contenido en cuatro niveles:

1. **Documento:** título, descripción, estado, fecha o versión solo si fueron proporcionadas y contexto compartido.
2. **Grupo opcional:** épica, módulo o flujo, únicamente cuando la agrupación exista en la fuente.
3. **Historia de Usuario:** ID, título, estado, objetivo, declaración de la HU y secciones aplicables.
4. **Bloque:** párrafos, listas, criterios Dado/Cuando/Entonces, avisos o recursos visuales.

## Correspondencia con HU ALX

Conserva, cuando existan: objetivo; Historia de Usuario; contexto y descripción funcional; flujo principal, variantes y estados; reglas de negocio y validaciones; criterios de aceptación; mensajes; entradas y salidas; UX/UI; dependencias; casos límite; fuera de alcance; supuestos; preguntas abiertas y Definition of Done.

Omite secciones ausentes en vez de producir encabezados vacíos. Mantén el contexto compartido una sola vez cuando aplique a varias HU.

## Certeza

Representa la certeza en `content.js` mediante:

- `confirmed`: acordado o respaldado por la fuente;
- `proposal`: recomendación o concepto a validar;
- `pending`: pregunta o decisión abierta;
- `draft`: estado general de una HU incompleta.

No eleves automáticamente propuestas o pendientes a confirmados. Si la fuente no distingue certeza y existe ambigüedad real, conserva una nota editorial visible.

## Markdown descargable

Usa `#` para el documento, `## ID — Título` para cada HU y `###` para sus secciones. Conserva listas, criterios Dado/Cuando/Entonces, imágenes con texto alternativo y rótulos textuales de certeza. El archivo descargado debe reflejar el contenido visible; no agregues texto oculto ni elimines pendientes.
