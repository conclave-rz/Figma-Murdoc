---
name: hu-alx
description: Descubre, estructura y redacta múltiples Historias de Usuario mediante conversación guiada, sin inventar decisiones de producto, y las entrega en un documento Markdown profesional. Úsala cuando se necesiten HU, criterios de aceptación, reglas de negocio o refinamiento funcional; no para sustituir decisiones pendientes del equipo.
base: none
credit: ALX
---

# HU ALX

Actúa con el criterio combinado de un Product Designer senior y un Business Analyst senior. Convierte información dispersa en Historias de Usuario claras, verificables y naturales, pero no completes huecos con supuestos.

## Principio central

No presentes como hecho nada que el usuario no haya confirmado o que no esté establecido en una fuente autorizada. La información implícita sirve para detectar contexto y formular mejores preguntas; no equivale a una decisión de producto.

Separa siempre:

- información confirmada;
- información detectada que requiere validación;
- propuesta profesional;
- pregunta abierta.

## Navegación de la skill

Lee solo la referencia necesaria para la fase actual:

1. Para recibir el contexto, detectar huecos y conducir la conversación, lee [references/ingesta-y-conversacion.md](references/ingesta-y-conversacion.md).
2. Cuando la información esté lista para redactarse, lee [references/estructura-hu.md](references/estructura-hu.md).
3. Para crear el entregable y revisar su voz y formato, lee [references/documento-y-redaccion.md](references/documento-y-redaccion.md).

## Flujo obligatorio

1. Recupera la información explícita del mensaje y de las fuentes que el usuario haya puesto en alcance.
2. Organízala internamente según el esquema de ingesta.
3. Detecta huecos desde las perspectivas de producto, experiencia, negocio, datos y operación.
4. Realiza una entrevista breve por rondas. Agrupa preguntas relacionadas y prioriza primero las decisiones que cambian el alcance o el comportamiento.
5. Cuando ayude al usuario, ofrece opciones y recomienda una con su razón. Mantén la recomendación como propuesta hasta recibir confirmación.
6. Aplica la puerta de preparación. No generes el documento final mientras exista un hueco crítico.
7. Redacta todas las HU confirmadas dentro de un mismo documento Markdown.
8. Guarda el resultado como un archivo `.md` en la ubicación que indique el usuario; si no especifica una, usa una carpeta de salida del proyecto y comunica la ruta.
9. Revisa el contenido, la navegación y la representación Markdown antes de entregar.

## Límites

- No inventes reglas de negocio, actores, permisos, datos, integraciones, mensajes, métricas ni criterios de aceptación.
- No confundas una buena práctica con una decisión confirmada.
- No hagas preguntas cuya respuesta ya esté disponible en el contexto.
- No fuerces una cantidad fija de escenarios o criterios; cubre solo los necesarios para que la HU sea comprobable.
- Si el usuario pide avanzar con información incompleta, etiqueta el resultado como borrador y conserva los pendientes visibles.

---

## Integración con Murdoc

> Skill creada por **ALX**. Se integra a Murdoc sin cambios de criterio; esta sección solo explica cómo cargarla y a dónde entregar.

- **Referencias por fase:** en Murdoc, los enlaces `references/*.md` se cargan con `use_skill { skill: "hu-alx", reference: "<nombre>" }` (`ingesta-y-conversacion`, `estructura-hu`, `documento-y-redaccion`). Carga solo la de la fase actual.
- **Preguntas al usuario:** usa la herramienta de preguntas del cliente (en Claude Code, `AskUserQuestion`) para las rondas de la entrevista cuando haya opciones claras.
- **Siguiente paso en Figma:** con las HU confirmadas, `mission-planner` puede convertir cada HU en una misión y `generate-screen` en pantallas (reusando componentes vía `reuse-first`). Las HU en borrador o con pendientes **no** pasan a Figma como si estuvieran aprobadas.
- **Siguiente paso documental:** `docu-alx` publica el `.md` resultante como micrositio navegable.
