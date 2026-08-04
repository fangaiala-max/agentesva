export interface PromptLanding {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  promptIds: string[];
  faqs: Array<{ q: string; a: string }>;
}

export const PROMPT_LANDINGS: PromptLanding[] = [
  {
    slug: 'chatgpt',
    title: 'Prompts para ChatGPT en español',
    seoTitle: 'Prompts para ChatGPT en español: ejemplos para copiar | AgentesVA',
    description:
      'Prompts para ChatGPT en español, listos para copiar: marketing, ventas, trabajo, análisis y productividad. Con variables y formato de salida.',
    eyebrow: 'Prompts ChatGPT · Gratis',
    intro:
      'Una selección práctica para trabajar con ChatGPT sin empezar desde una pantalla en blanco. Cada plantilla define el rol, el contexto, la tarea, las restricciones y el formato para obtener una respuesta más útil desde el primer intento.',
    promptIds: ['p01', 'p06', 'p11', 'p22', 'p31', 'p37', 'p51', 'p62', 'p91', 'p95'],
    faqs: [
      { q: '¿Cómo se usa un prompt en ChatGPT?', a: 'Copia la plantilla, sustituye los campos entre corchetes por tus datos y pégala en un chat nuevo. Revisa siempre cifras, nombres y afirmaciones antes de usar la respuesta.' },
      { q: '¿Estos prompts funcionan con ChatGPT gratis?', a: 'Sí. Están escritos con instrucciones de texto estándar y no dependen de una función exclusiva de los planes de pago.' },
      { q: '¿También funcionan con Claude o Gemini?', a: 'Sí. La estructura es compatible con los principales asistentes, aunque el resultado puede variar según el modelo y el contexto disponible.' },
    ],
  },
  {
    slug: 'marketing',
    title: 'Prompts de IA para marketing',
    seoTitle: 'Prompts de IA para marketing: plantillas listas para copiar | AgentesVA',
    description:
      'Prompts de marketing para ChatGPT y otras IA: copy, calendario editorial, anuncios, SEO e influencers. Gratis y listos para adaptar.',
    eyebrow: 'Marketing con IA · Gratis',
    intro:
      'Plantillas para convertir un objetivo de marketing en una instrucción clara: qué audiencia quieres alcanzar, qué mensaje necesitas y en qué formato debe entregarlo la IA.',
    promptIds: ['p01', 'p02', 'p03', 'p04', 'p05', 'p29', 'p33', 'p46', 'p49', 'p50'],
    faqs: [
      { q: '¿Qué datos debo completar antes de usar estos prompts?', a: 'Como mínimo: producto o servicio, audiencia, objetivo, canal, tono y cualquier dato verificable que la IA no deba inventar.' },
      { q: '¿Puedo publicar directamente el contenido generado?', a: 'No es recomendable. Úsalo como borrador y revisa hechos, tono de marca, derechos y requisitos de cada plataforma.' },
      { q: '¿Sirven para una PyME con poco tiempo?', a: 'Sí. Están pensados para tareas acotadas y formatos que un equipo pequeño puede revisar y publicar.' },
    ],
  },
  {
    slug: 'ventas',
    title: 'Prompts de IA para ventas',
    seoTitle: 'Prompts de IA para ventas: emails, llamadas y objeciones | AgentesVA',
    description:
      'Prompts de ventas para ChatGPT: correo en frío, objeciones, llamadas, propuestas de valor, LinkedIn y seguimiento comercial.',
    eyebrow: 'Ventas con IA · Gratis',
    intro:
      'Prompts para preparar conversaciones comerciales sin convertir la IA en una máquina de mensajes genéricos. Personaliza siempre el problema real del prospecto y evita inventar datos sobre su empresa.',
    promptIds: ['p06', 'p07', 'p08', 'p09', 'p10', 'p27', 'p42', 'p47', 'p73', 'p97'],
    faqs: [
      { q: '¿La IA puede escribir un correo en frío personalizado?', a: 'Puede preparar la estructura y variantes, pero necesita datos reales del destinatario. Si no los tienes, conserva los marcadores en vez de inventarlos.' },
      { q: '¿Cómo evito que los mensajes suenen a robot?', a: 'Añade contexto específico, reduce los adjetivos comerciales y lee el texto en voz alta antes de enviarlo.' },
      { q: '¿Estos prompts sustituyen un proceso de ventas?', a: 'No. Ayudan a preparar mensajes y análisis; la selección de cuentas, el consentimiento, el seguimiento y la relación comercial siguen requiriendo criterio humano.' },
    ],
  },
  {
    slug: 'redes-sociales',
    title: 'Prompts para redes sociales',
    seoTitle: 'Prompts para redes sociales: LinkedIn, vídeos y anuncios | AgentesVA',
    description:
      'Prompts para crear publicaciones, hooks, anuncios y calendarios de redes sociales con ChatGPT. Plantillas en español listas para copiar.',
    eyebrow: 'Redes sociales · Gratis',
    intro:
      'Una colección para idear y adaptar contenido a cada canal manteniendo una voz reconocible. Las plantillas piden formatos concretos y evitan promesas o estadísticas inventadas.',
    promptIds: ['p02', 'p03', 'p05', 'p10', 'p45', 'p49', 'p60', 'p66', 'p70', 'p99'],
    faqs: [
      { q: '¿Qué red social debo indicar en el prompt?', a: 'Especifica la plataforma, el formato, la longitud y el objetivo. Una publicación de LinkedIn no se estructura igual que un Reel o un anuncio.' },
      { q: '¿La IA puede mantener mi tono de marca?', a: 'Sí, si incluyes ejemplos aprobados y reglas claras. Sin esas referencias tenderá a producir un tono genérico.' },
      { q: '¿Puede publicar automáticamente?', a: 'Estos prompts crean borradores. La publicación requiere una herramienta conectada y una revisión humana previa.' },
    ],
  },
  {
    slug: 'atencion-cliente',
    title: 'Prompts para atención al cliente',
    seoTitle: 'Prompts para atención al cliente: email, WhatsApp y reseñas | AgentesVA',
    description:
      'Prompts para responder clientes por email, WhatsApp, reseñas y redes sociales con empatía, límites claros y datos verificables.',
    eyebrow: 'Atención al cliente · Gratis',
    intro:
      'Plantillas para redactar respuestas útiles sin inventar precios, plazos ni políticas. Cuando falta un dato, el prompt obliga a señalarlo para que una persona lo complete.',
    promptIds: ['p20', 'p39', 'p41', 'p43', 'p44', 'p45', 'p65', 'p72', 'p74', 'p75'],
    faqs: [
      { q: '¿Puedo pegar datos personales de clientes en una IA?', a: 'Evita compartir datos personales, credenciales, información médica o financiera. Anonimiza el mensaje y respeta las políticas de tu empresa y del proveedor.' },
      { q: '¿Qué hago si la IA inventa una política o un plazo?', a: 'No envíes la respuesta. Completa el prompt con la política real y exige que cualquier dato ausente quede marcado entre corchetes.' },
      { q: '¿Sirven para WhatsApp Business?', a: 'Sí. Puedes pedir una variante breve para WhatsApp y otra completa para email, manteniendo la misma solución y el mismo tono.' },
    ],
  },
  {
    slug: 'empresas-pymes',
    title: 'Prompts de IA para empresas y PyMEs',
    seoTitle: 'Prompts de IA para empresas y PyMEs: 10 plantillas | AgentesVA',
    description:
      'Prompts de IA para empresas y PyMEs: finanzas, estrategia, productividad, procesos, análisis y planificación. En español y gratis.',
    eyebrow: 'IA para PyMEs · Gratis',
    intro:
      'Diez plantillas para aplicar IA a decisiones y tareas habituales de una empresa pequeña. Están diseñadas para separar hechos, supuestos y datos por confirmar.',
    promptIds: ['p22', 'p25', 'p36', 'p37', 'p38', 'p51', 'p54', 'p80', 'p93', 'p95'],
    faqs: [
      { q: '¿Qué tareas empresariales conviene empezar a hacer con IA?', a: 'Empieza por borradores, resúmenes, clasificación y planificación. Mantén revisión humana en decisiones financieras, legales, laborales o que afecten a clientes.' },
      { q: '¿Necesito una cuenta de pago?', a: 'No para estas plantillas. Una cuenta de pago puede admitir más contexto o archivos, pero no es necesaria para probarlas.' },
      { q: '¿Cómo adapto un prompt a mi empresa?', a: 'Sustituye los marcadores por el sector, tamaño, objetivo, restricciones y datos reales de tu negocio. Cuanto mejor sea el contexto, menos genérica será la respuesta.' },
    ],
  },
];

export function promptLanding(slug: string): PromptLanding | undefined {
  return PROMPT_LANDINGS.find((landing) => landing.slug === slug);
}
