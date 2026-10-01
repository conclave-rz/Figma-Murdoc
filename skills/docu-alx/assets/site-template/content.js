window.DOCU_ALX_DATA = {
  document: {
    title: "Nombre del producto o iniciativa",
    summary: "Historias de Usuario y decisiones funcionales del alcance documentado.",
    status: "draft",
    context: [
      "Sustituye este contenido de ejemplo por el contexto confirmado del producto.",
      "Las propuestas y preguntas abiertas deben conservar su rótulo de certeza."
    ],
    sharedPending: ["Confirmar la fecha objetivo con el equipo responsable."]
  },
  stories: [
    {
      id: "HU-P01",
      title: "Consultar el detalle de una solicitud",
      status: "draft",
      objective: "Permitir que la persona comprenda el estado y los datos relevantes de una solicitud.",
      statement: {
        actor: "persona usuaria",
        capability: "consultar el detalle de una solicitud",
        benefit: "entender su situación y decidir el siguiente paso"
      },
      sections: [
        {
          title: "Flujo principal",
          certainty: "confirmed",
          paragraphs: ["La persona abre una solicitud desde el listado y el sistema muestra su información disponible."],
          items: ["Mostrar el identificador y el estado actual.", "Presentar los datos en orden de relevancia."]
        },
        {
          title: "Criterios de aceptación",
          certainty: "confirmed",
          criteria: [{
            given: "que existe una solicitud disponible para la persona",
            when: "abre su detalle",
            then: "el sistema presenta el identificador, el estado y la información confirmada"
          }]
        },
        {
          title: "Pregunta abierta",
          certainty: "pending",
          paragraphs: ["¿Qué historial de cambios debe ser visible en esta primera versión?"]
        }
      ],
      visuals: [{
        src: "assets/ejemplo-contextual.svg",
        alt: "Diagrama simplificado del paso del listado al detalle de una solicitud.",
        caption: "La imagen ubica el acceso al detalle dentro del flujo; no define una interfaz final.",
        type: "Diagrama explicativo"
      }]
    },
    {
      id: "HU-P02",
      title: "Reconocer un estado sin información",
      status: "proposal",
      objective: "Explicar qué ocurre cuando una solicitud todavía no contiene datos visibles.",
      statement: {
        actor: "persona usuaria",
        capability: "reconocer que aún no hay información disponible",
        benefit: "saber si necesita esperar o realizar otra acción"
      },
      sections: [{
        title: "Propuesta de comportamiento",
        certainty: "proposal",
        paragraphs: ["Mostrar un estado vacío con una explicación breve y la siguiente acción disponible."],
        items: []
      }],
      visuals: []
    }
  ]
};
