// Keep short interface labels independent of search titles and service-specific answers.
export const serviceSeo = {
 en: {
  'customer-support': {title:'AI customer support automation', faqs:[
   ['Can you connect our existing support channels?','We review the agreed email, messaging or CRM channel for API access, permissions and limits before including it in scope.'],
   ['Will AI send every customer reply automatically?','No. We agree which messages can proceed and which need approval. Sensitive, incomplete or unusual requests go to a person.'],
   ['What information does the workflow need?','An approved knowledge base, representative enquiries, a tone guide and clear escalation rules.'],
   ['How do we measure customer support automation?','Track response time, classification accuracy, accepted drafts and cases requiring human intervention.'] ]},
  sales:{title:'AI sales automation and CRM follow-up', faqs:[
   ['Can you connect forms to our CRM?','We check the required fields, permissions and available integrations, then agree how to handle ownership and duplicate contacts.'],
   ['Does AI decide which leads deserve a call?','Qualification supports your team using explicit criteria and available information. Your team retains the commercial decision.'],
   ['Can follow-up messages be automated?','The scope can include approved drafts, sequences and reminders. Sending rules, consent and exceptions must be agreed before activation.'],
   ['How do we measure sales automation?','Track time to first contact, opportunities with a next step, complete CRM records and duplicates.'] ]},
  operations:{title:'AI process automation for small businesses', faqs:[
   ['Which business process should we automate first?','Choose a recurring process with clear inputs, outputs and an owner. Start where manual interventions and errors can be measured.'],
   ['Can you process invoices and other documents?','The scope can include extraction of agreed fields and validation. Missing or inconsistent data requires review; payment approval needs the agreed controls.'],
   ['Can you connect spreadsheets, email and internal tools?','We review permissions and integration options for the tools in scope before committing to a connection.'],
   ['How do we measure process automation?','Track manual interventions, processing time, validation errors and completed records using representative cases.'] ]},
  pricing:{title:'AI automation pricing and implementation costs'},
  'how-we-work':{title:'How we deliver AI automation: process and handover'},
  services:{title:'AI automation services for small businesses'}
 },
 es:{
  'customer-support':{title:'Automatización de atención al cliente con IA',faqs:[
   ['¿Podéis conectar nuestros canales de atención?','Revisamos el canal de correo, mensajería o CRM acordado: acceso a API, permisos y límites antes de incluirlo en el alcance.'],
   ['¿La IA enviará todas las respuestas automáticamente?','No. Acordamos qué mensajes pueden continuar y cuáles necesitan aprobación. Las solicitudes sensibles, incompletas o inusuales pasan a una persona.'],
   ['¿Qué información necesita el flujo?','Una base de conocimiento aprobada, consultas representativas, una guía de tono y reglas claras de derivación.'],
   ['¿Cómo se mide la automatización de atención al cliente?','Tiempo de respuesta, clasificación correcta, aceptación de borradores y casos que requieren intervención humana.'] ]},
  sales:{title:'Automatización de ventas y seguimiento CRM con IA',faqs:[
   ['¿Podéis conectar formularios con nuestro CRM?','Revisamos campos, permisos e integraciones disponibles y acordamos cómo gestionar responsables y contactos duplicados.'],
   ['¿La IA decide qué oportunidades merecen una llamada?','La cualificación ayuda al equipo con criterios explícitos e información disponible. Tu equipo conserva la decisión comercial.'],
   ['¿Se pueden automatizar los mensajes de seguimiento?','El alcance puede incluir borradores aprobados, secuencias y recordatorios. Antes de activarlos acordamos reglas de envío, consentimiento y excepciones.'],
   ['¿Cómo se mide la automatización de ventas?','Tiempo hasta el primer contacto, oportunidades con siguiente paso, registros completos en el CRM y duplicados.'] ]},
  operations:{title:'Automatización de procesos con IA para pymes',faqs:[
   ['¿Qué proceso conviene automatizar primero?','Un proceso recurrente con entradas, salidas y responsable definidos. Empieza donde se puedan medir intervenciones manuales y errores.'],
   ['¿Podéis procesar facturas y otros documentos?','El alcance puede incluir extracción de campos acordados y validación. Los datos incompletos o incoherentes requieren revisión; aprobar pagos exige los controles acordados.'],
   ['¿Podéis conectar hojas de cálculo, correo y herramientas internas?','Revisamos permisos y opciones de integración de las herramientas incluidas antes de comprometernos con una conexión.'],
   ['¿Cómo se mide la automatización de procesos?','Intervenciones manuales, tiempo de procesamiento, errores de validación y registros completados con casos representativos.'] ]},
  pricing:{title:'Precios de automatización con IA e implementación'},
  'how-we-work':{title:'Cómo trabajamos la automatización con IA: proceso y entrega'},
  services:{title:'Servicios de automatización con IA para pymes'}
 }
} as const;
