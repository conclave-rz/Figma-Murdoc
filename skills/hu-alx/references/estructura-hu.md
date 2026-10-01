# Estructura de las Historias de Usuario

## Documento completo

Agrupa todas las HU del alcance dentro de un mismo documento. Mantén esta estructura general:

1. Título del documento.
2. Propósito y contexto del producto o iniciativa.
3. Índice navegable.
4. Resumen de alcance.
5. Historias de Usuario.
6. Dependencias o decisiones compartidas entre varias HU, si existen.
7. Preguntas abiertas, si permanecen detalles no críticos.

No repitas contexto idéntico dentro de cada HU. Colócalo una vez en la introducción o en una sección compartida y referencia la regla común con claridad.

## Estructura de cada HU

Usa una sección de primer nivel para cada Historia de Usuario, con identificador y título. Incluye:

1. **ID y título.** Breve, específico y orientado a la capacidad.
2. **Objetivo.** Necesidad que resuelve y resultado que busca.
3. **Historia de Usuario.** Como [actor], quiero [capacidad], para [beneficio].
4. **Contexto funcional.** Situación y lugar que ocupa dentro del flujo.
5. **Descripción funcional.** Comportamiento esperado sin convertir la HU en una solución técnica no confirmada.
6. **Flujo principal.** Secuencia normal desde el inicio hasta el resultado.
7. **Variantes y casos alternos.** Rutas válidas que cambian el comportamiento.
8. **Estados de la experiencia.** Inicial, procesamiento, éxito, vacío, información incompleta, error o reintento solo cuando apliquen.
9. **Reglas de negocio.** Condiciones confirmadas que gobiernan el resultado.
10. **Validaciones.** Datos obligatorios, formatos, límites y combinaciones inválidas.
11. **Criterios de aceptación.** Escenarios verificables en formato Dado, Cuando y Entonces.
12. **Mensajes y retroalimentación.** Confirmaciones, errores, advertencias e instrucciones relevantes.
13. **Datos de entrada.** Información necesaria para operar.
14. **Datos de salida.** Información presentada, generada, guardada o enviada.
15. **Consideraciones de UX y UI.** Interacción, jerarquía, consistencia y accesibilidad confirmadas o necesarias.
16. **Dependencias e integraciones.** Sistemas, servicios, equipos o HU relacionadas.
17. **Casos límite.** Situaciones plausibles con impacto funcional.
18. **Fuera de alcance.** Límites explícitos de la HU.
19. **Supuestos y preguntas abiertas.** Solo para borradores o detalles no críticos; nunca uses esta sección para esconder una decisión necesaria.
20. **Definition of Done.** Condiciones acordadas para considerar concluida la HU.

## Reglas de uso de la estructura

- Los puntos 1 a 12 forman el núcleo de la HU.
- Incluye los puntos 13 a 20 cuando sean aplicables o exista información confirmada.
- No escribas una sección vacía ni inventes contenido para completar la plantilla. Si una sección no aplica, omítela; si su ausencia representa un hueco crítico, vuelve a la conversación.
- Mantén una HU enfocada en un resultado coherente. Si contiene actores, objetivos o resultados independientes, propón dividirla y solicita confirmación.
- Los criterios de aceptación deben poder probarse y corresponder con las reglas y estados descritos.
- Incluye el camino exitoso y únicamente las variantes, validaciones o excepciones relevantes.
- No introduzcas decisiones de interfaz dentro de los criterios si no fueron confirmadas.

## Revisión cruzada

Antes de cerrar cada HU, comprueba:

- que actor, capacidad y beneficio sean consistentes;
- que el flujo respete todas las reglas de negocio;
- que las validaciones tengan respuesta visible o comportamiento definido;
- que entradas y salidas sean compatibles;
- que dependencias y permisos estén reflejados;
- que cada criterio de aceptación pueda rastrearse a una necesidad, regla o estado;
- que el fuera de alcance no contradiga el flujo;
- que no haya propuestas redactadas como decisiones.

