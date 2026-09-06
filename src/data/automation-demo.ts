export type DemoMode = 'attention' | 'sales' | 'operations';
export type DemoExample = 'standard' | 'exception';
export const DEMO_MODES = {
  attention: {
    label: 'Atención', icon: '↗', title: 'Una consulta. Un siguiente paso claro.',
    description: 'Organiza los mensajes, prepara una respuesta y deja la decisión en manos de tu equipo.',
    href: '/servicios/automatizacion-atencion-cliente/', service: 'customer_service_automation', cluster: 'customer_service',
    steps: ['Mensaje recibido', 'Clasificación', 'Borrador de respuesta', 'Revisión humana'],
    examples: {
      standard: { label: 'Consulta sobre un pedido', inputLabel: 'Mensaje de ejemplo', input: 'Hola, ¿cuándo llega mi pedido AV-2048? Lo necesito para el viernes.', reference: 'AV-2048', category: 'Estado de pedido', result: 'Tu pedido AV-2048 figura en preparación en este ejemplo. Hemos preparado una respuesta para que el equipo confirme la fecha antes de enviarla.', fields: [['Referencia', 'AV-2048'], ['Tipo de consulta', 'Estado del pedido'], ['Responsable', 'Equipo de atención']], status: 'Borrador listo para revisión', handoff: 'Una persona confirma la fecha y aprueba el envío.' },
      exception: { label: 'Falta el número de pedido', inputLabel: 'Mensaje incompleto', input: 'Hola, mi pedido no ha llegado. ¿Podéis revisarlo?', reference: 'Sin referencia', category: 'Información incompleta', result: 'Necesitamos el número de pedido para consultar su estado. Se prepara una solicitud de información, sin inventar una fecha de entrega.', fields: [['Referencia', 'Pendiente'], ['Dato necesario', 'Número de pedido'], ['Responsable', 'Equipo de atención']], status: 'Derivado al equipo', handoff: 'El equipo solicita el dato que falta. No se envía nada automáticamente.' },
    },
  },
  sales: {
    label: 'Ventas', icon: '↗', title: 'Del interés a una oportunidad ordenada.',
    description: 'Extrae lo importante, actualiza el CRM y prepara un seguimiento con contexto.',
    href: '/servicios/automatizacion-ventas/', service: 'sales_automation', cluster: 'sales',
    steps: ['Solicitud recibida', 'Datos extraídos', 'CRM actualizado', 'Seguimiento preparado'],
    examples: {
      standard: { label: 'Solicitud de presupuesto', inputLabel: 'Solicitud de ejemplo', input: 'Somos un estudio de 8 personas. Queremos conectar formularios y CRM. Tenemos 2.000 € de presupuesto y nos gustaría empezar este mes.', reference: 'OP-013', category: 'Solicitud cualificada', result: 'Oportunidad registrada en el CRM de ejemplo. Se prepara una llamada para revisar el alcance y confirmar la viabilidad; todavía no hay una propuesta aprobada.', fields: [['Equipo', '8 personas'], ['Presupuesto declarado', '2.000 €'], ['Interés', 'Formularios + CRM']], status: 'Seguimiento pendiente de aprobación', handoff: 'Una persona revisa el encaje antes de contactar.' },
      exception: { label: 'Alcance por definir', inputLabel: 'Solicitud incompleta', input: 'Queremos automatizar todo el negocio. ¿Cuánto cuesta?', reference: 'OP-014', category: 'Falta contexto', result: 'Se prepara una lista de preguntas sobre proceso, herramientas, frecuencia y responsable. No se calcula un presupuesto con datos insuficientes.', fields: [['Proceso', 'Por concretar'], ['Presupuesto', 'No indicado'], ['Siguiente paso', 'Revisión de alcance']], status: 'Revisión comercial necesaria', handoff: 'El equipo aclara el alcance antes de proponer una solución.' },
    },
  },
  operations: {
    label: 'Operaciones', icon: '▤', title: 'Datos en su sitio. Excepciones a la vista.',
    description: 'Pasa del documento a un registro validado, con aprobación y trazabilidad.',
    href: '/servicios/automatizacion-procesos/', service: 'process_automation', cluster: 'operations',
    steps: ['Documento recibido', 'Datos extraídos', 'Validación', 'Aprobación pendiente'],
    examples: {
      standard: { label: 'Factura con datos completos', inputLabel: 'Factura ficticia', input: 'FACTURA DEMO-028\nProveedor de ejemplo\nBase: 100,00 € · IVA: 21,00 €\nTotal: 121,00 € · Referencia: OC-028', reference: 'DEMO-028', category: 'Documento validado', result: 'Los importes del ejemplo coinciden. El registro queda preparado para revisión, sin contabilizar ni emitir un pago.', fields: [['Base', '100,00 €'], ['IVA', '21,00 €'], ['Total', '121,00 €']], status: 'Aprobación pendiente', handoff: 'Una persona autoriza el registro definitivo. No se realiza ningún pago.' },
      exception: { label: 'Factura con importes inconsistentes', inputLabel: 'Factura con una excepción', input: 'FACTURA DEMO-029\nProveedor de ejemplo\nBase: 100,00 € · IVA: 21,00 €\nTotal indicado: 150,00 €', reference: 'DEMO-029', category: 'Importes inconsistentes', result: 'La base y el IVA suman 121,00 €, pero el total indicado es 150,00 €. El flujo detiene el registro y señala la diferencia.', fields: [['Total calculado', '121,00 €'], ['Total indicado', '150,00 €'], ['Diferencia', '29,00 €']], status: 'Validación detenida', handoff: 'El equipo revisa el documento original. No se corrige ni aprueba automáticamente.' },
    },
  },
} as const;
export const DEMO_MODE_KEYS = Object.keys(DEMO_MODES) as DemoMode[];
