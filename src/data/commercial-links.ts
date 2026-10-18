export interface CommercialLink { title: string; description: string; href: string }
const guides = {
  chatbot: { title: 'Chatbot para PyMEs', description: 'Qué automatizar, cómo derivar y qué medir.', href: '/guias/chatbot-para-pymes/' },
  whatsapp: { title: 'Automatizar WhatsApp', description: 'Canal oficial, integraciones y control humano.', href: '/guias/automatizar-whatsapp-empresa/' },
  leads: { title: 'Seguimiento de leads', description: 'Captación, CRM, responsables y cadencias.', href: '/guias/automatizar-seguimiento-de-leads/' },
  platforms: { title: 'Make vs n8n vs Zapier', description: 'Elige por proceso, operación y coste real.', href: '/guias/make-vs-n8n-vs-zapier/' },
  cost: { title: 'Cuánto cuesta automatizar', description: 'Rangos, variables y cálculo de retorno.', href: '/guias/cuanto-cuesta-automatizar-un-negocio/' },
  priority: { title: 'Qué automatizar primero', description: 'Una matriz para priorizar el primer proyecto.', href: '/guias/procesos-que-conviene-automatizar-primero/' },
} as const;
export const serviceClusterLinks = {
  atencion: [guides.chatbot, guides.whatsapp, { title: 'Herramientas de IA para atención', description: 'Comparativa de opciones y casos de uso.', href: '/estudios/ia-para-atencion-al-cliente/' }],
  ventas: [guides.leads, guides.whatsapp, { title: 'Precios de automatización', description: 'Qué alcance encaja con cada rango.', href: '/precios-automatizacion-ia/' }],
  procesos: [guides.priority, guides.platforms, guides.cost],
} as const satisfies Record<string, readonly CommercialLink[]>;
const studyLinks: Record<string, readonly CommercialLink[]> = {
  'ia-para-atencion-al-cliente': [guides.chatbot, guides.whatsapp],
  'mejores-herramientas-ia-whatsapp': [guides.whatsapp, guides.chatbot],
  'herramientas-ia-para-automatizar-tareas': [guides.priority, guides.platforms],
};
export const linksForStudy = (slug: string): readonly CommercialLink[] => studyLinks[slug] ?? [];
const toolLinks: Record<string, readonly CommercialLink[]> = {
  make: [guides.platforms, guides.priority], n8n: [guides.platforms, guides.priority], zapier: [guides.platforms, guides.priority],
  wati: [guides.whatsapp, guides.chatbot], manychat: [guides.whatsapp, guides.chatbot], chatfuel: [guides.whatsapp, guides.chatbot], landbot: [guides.chatbot, guides.whatsapp], tidio: [guides.chatbot, guides.whatsapp],
  'hubspot-ia': [guides.leads, guides.cost], mailchimp: [guides.leads, guides.cost], brevo: [guides.leads, guides.cost],
};
export const linksForTool = (slug: string): readonly CommercialLink[] => toolLinks[slug] ?? [];
