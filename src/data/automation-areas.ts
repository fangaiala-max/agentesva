export const AUTOMATION_AREAS = [
  {
    label: 'Atención al cliente',
    href: '/servicios/automatizacion-atencion-cliente/',
    service: 'customer_service_automation',
    cluster: 'customer_service',
    title: 'Responde y deriva consultas',
    description: 'Email, tickets, formularios y WhatsApp con control humano.',
  },
  {
    label: 'Ventas',
    href: '/servicios/automatizacion-ventas/',
    service: 'sales_automation',
    cluster: 'sales',
    title: 'Conecta leads, CRM y seguimiento',
    description: 'Evita oportunidades sin responsable o siguiente paso.',
  },
  {
    label: 'Operaciones',
    href: '/servicios/automatizacion-procesos/',
    service: 'process_automation',
    cluster: 'operations',
    title: 'Reduce tareas entre sistemas',
    description: 'Documentos, informes y tareas administrativas.',
  },
] as const;
