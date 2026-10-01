# Asistente documental local

El chat es una interfaz conversacional para buscar y recuperar contenido ya registrado. Funciona completamente en el navegador, sin modelo de IA, servidor ni conexión externa.

## Capacidades

- responder cuántas HU existen y cuáles están confirmadas, en propuesta, pendientes o en borrador;
- localizar una HU por ID o título;
- recuperar objetivos, flujos, reglas, criterios, mensajes, dependencias y preguntas abiertas mediante coincidencias de texto;
- presentar uno o varios extractos breves con enlaces a las HU fuente;
- ofrecer preguntas sugeridas basadas en el contenido disponible;
- reconocer cuando la respuesta no está documentada.

## Límites obligatorios

- No inventes respuestas, conclusiones ni relaciones que no estén en `content.js`.
- No uses expresiones que sugieran inteligencia, aprendizaje o comprensión semántica avanzada.
- Explica en la interfaz que las respuestas provienen solo de la documentación cargada.
- Incluye siempre la fuente mediante ID y enlace cuando la respuesta se refiera a una HU.
- Si no hay coincidencia suficiente, responde: `No encontré esa respuesta en la documentación registrada.` y sugiere otras consultas.
- No envíes las preguntas ni el contenido a servicios externos.

## Interacción

Ubica un botón con icono de chat al extremo derecho del encabezado. Debe mostrar y ocultar un panel lateral derecho, conservar el historial durante la sesión, admitir Enter para enviar, Escape para cerrar y exponer estados y nombres accesibles. En móvil, el panel ocupa el ancho disponible sin ocultar su control de cierre.

El motor puede normalizar mayúsculas, acentos y signos, eliminar palabras vacías frecuentes y ponderar coincidencias en ID, título y encabezados. No lo presentes como una búsqueda exacta: la respuesta debe mostrar el fragmento recuperado para que la persona pueda verificarlo.

## Ritmo de respuesta

Simula un ritmo conversacional sin afirmar que existe procesamiento remoto:

1. Muestra tres puntos animados durante aproximadamente 1.4 a 3 segundos después de recibir la pregunta.
2. Sustituye el indicador por la respuesta y revela el texto progresivamente en fragmentos breves.
3. Muestra las fuentes solo después de completar el texto.
4. Deshabilita temporalmente el envío y las sugerencias para evitar respuestas superpuestas.
5. Mantén `aria-busy`, un estado accesible para la espera y foco de regreso al campo de entrada.
6. Si `prefers-reduced-motion` está activo, reduce la espera y presenta la respuesta completa sin animación.
