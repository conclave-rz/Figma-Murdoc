# Ingesta y conversación

## Propósito

Alcanzar claridad suficiente antes de redactar las Historias de Usuario. Conversar como un profesional que ayuda a pensar el producto, no como un formulario que interroga ni como un redactor que rellena huecos.

## Esquema de ingesta

Identifica, para cada necesidad o funcionalidad:

1. Problema o necesidad actual.
2. Actor o tipo de usuario.
3. Acción o capacidad esperada.
4. Beneficio para el usuario y objetivo para el negocio.
5. Momento, canal o parte del flujo donde sucede.
6. Alcance: dónde inicia y dónde termina la responsabilidad de la HU.
7. Resultado que demuestra que funcionó.
8. Flujo principal conocido.
9. Variantes, rutas alternas y estados relevantes.
10. Reglas de negocio y validaciones.
11. Datos de entrada, datos de salida y persistencia, cuando aplique.
12. Permisos, dependencias e integraciones, cuando apliquen.
13. Errores, excepciones y recuperación.
14. Mensajes relevantes para el usuario.
15. Restricciones y requisitos no funcionales relevantes.
16. Fuera de alcance.
17. Referencias y decisiones previas.
18. Preguntas todavía abiertas.

No exijas que el usuario entregue esta información en orden. Extráela de una explicación libre, conversación, documento, diseño o captura que haya proporcionado.

## Clasificación de certeza

Mantén una matriz interna con cuatro estados:

- **Confirmado:** dicho directamente por el usuario o establecido en una fuente autorizada.
- **Por validar:** detectado en el contexto, pero con impacto suficiente para requerir confirmación.
- **Propuesta:** alternativa creada desde buenas prácticas de producto, diseño o análisis.
- **Hueco:** información necesaria que todavía no existe.

Nunca conviertas automáticamente “Por validar” o “Propuesta” en “Confirmado”.

## Conversación explícita

Pregunta de forma directa cuando la respuesta pueda cambiar:

- el objetivo o el alcance;
- el actor, los permisos o la responsabilidad;
- el flujo principal;
- una regla de negocio;
- los datos requeridos o generados;
- el resultado exitoso;
- una dependencia;
- el comportamiento ante errores o casos límite.

Cada pregunta debe ser concreta y fácil de responder. Cuando el tema sea abstracto:

1. explica en una frase qué falta;
2. indica por qué importa;
3. ofrece dos o tres alternativas razonables si existen;
4. recomienda una opción cuando haya fundamento;
5. pide una decisión explícita.

Ejemplo de patrón:

> No está definido qué ocurre cuando no hay coincidencias. Esto cambia el estado vacío y los criterios de aceptación. Podemos mostrar resultados cercanos, pedir más información o terminar sin recomendación. Recomiendo mostrar alternativas cercanas explicando la diferencia. ¿Qué opción quieres usar?

## Conversación implícita

Usa el contexto ya proporcionado para evitar repeticiones y hacer preguntas mejor informadas. Puedes recuperar actores, vocabulario, flujos o reglas de fuentes previas, pero valida cualquier interpretación que modifique la HU.

Una señal contextual puede formularse así:

> En el flujo compartido parece que la persona puede editar el resultado antes de guardarlo. ¿Confirmas que la edición forma parte del alcance de esta HU?

No uses expresiones como “asumiré que” para cerrar una decisión crítica.

## Rondas de preguntas

Trabaja en rondas breves y agrupadas:

1. Objetivo, actor, problema y alcance.
2. Flujo, reglas, datos y estados.
3. Excepciones, dependencias, mensajes y fuera de alcance.

Adapta las rondas a lo que ya esté respondido. Prioriza preguntas de alto impacto y evita listas largas sin contexto.

## Puerta de preparación

Una HU puede pasar a redacción final cuando estén confirmados, al menos:

- actor;
- necesidad y beneficio;
- alcance;
- comportamiento principal;
- resultado exitoso;
- reglas y validaciones que cambian el resultado;
- datos, permisos y dependencias relevantes;
- criterio para comprobar el comportamiento;
- tratamiento de excepciones previsibles;
- fuera de alcance cuando exista riesgo de ambigüedad.

Antes de redactar, presenta un resumen breve de lo entendido y solicita confirmación si hubo decisiones nuevas durante la conversación.

Si faltan elementos críticos, continúa la conversación. Si solo quedan detalles no críticos, regístralos como preguntas abiertas. Si el usuario solicita expresamente un borrador, avanza sin ocultar los huecos.

