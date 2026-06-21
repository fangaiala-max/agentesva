// AgentesVA — directorio de herramientas de IA (semilla del diseño "Futurista").
// Fuente única por ahora; migrable a content collections (PRD #50) más adelante.

export type Price = 'Gratis' | 'Freemium' | 'Pago';

export interface Tool {
  slug: string;
  name: string;
  cat: string;
  desc: string; // descripción corta para la tarjeta
  price: Price;
  rating: string;
  color: string; // color de marca para el monograma
  tagline: string;
  ideal: string;
  url: string; // sitio oficial (salida)
  long: string;
  features: string[];
  steps: string[];
}

export const CATEGORIES = [
  'Todas',
  'Asistentes',
  'Automatización',
  'WhatsApp',
  'Marketing',
  'Diseño',
  'Voz',
  'Vídeo',
] as const;

export const PRICE_COLOR: Record<Price, string> = {
  Gratis: '#4ec98a',
  Freemium: '#5B7CFF',
  Pago: '#a5a5b2',
};

export const TOOLS: Tool[] = [
  {
    slug: 'chatgpt', name: 'ChatGPT', cat: 'Asistentes',
    desc: 'Escribe, resume y responde lo que necesites.', price: 'Freemium', rating: '4.9', color: '#10A37F',
    tagline: 'El asistente de IA más versátil para el día a día.', ideal: 'Autónomos y equipos pequeños', url: 'https://chat.openai.com',
    long: 'ChatGPT entiende lo que le pides en lenguaje normal y te ayuda a redactar, resumir, traducir y resolver dudas. Es el mejor punto de partida para casi cualquier tarea con IA en tu negocio.',
    features: ['Redacta emails, anuncios y publicaciones', 'Resume documentos y reuniones largas', 'Genera ideas y responde dudas al instante'],
    steps: ['Crea una cuenta gratis en chat.openai.com', 'Escribe tu petición como si hablaras con un empleado', 'Afina el resultado pidiéndole cambios concretos'],
  },
  {
    slug: 'claude', name: 'Claude', cat: 'Asistentes',
    desc: 'Textos largos y razonamiento de calidad.', price: 'Freemium', rating: '4.8', color: '#D97757',
    tagline: 'Ideal para textos largos y trabajo que exige criterio.', ideal: 'Servicios profesionales', url: 'https://claude.ai',
    long: 'Claude destaca redactando y analizando documentos extensos con un tono natural, y mantiene el contexto de conversaciones largas mejor que la media.',
    features: ['Analiza contratos y documentos largos', 'Redacta con un tono cuidado y natural', 'Resume PDFs e informes completos'],
    steps: ['Entra en claude.ai y regístrate', 'Sube tu documento o pega el texto', 'Pídele un resumen, borrador o análisis'],
  },
  {
    slug: 'perplexity', name: 'Perplexity', cat: 'Asistentes',
    desc: 'Respuestas con fuentes citadas.', price: 'Freemium', rating: '4.7', color: '#20808D',
    tagline: 'Buscador con IA que responde citando sus fuentes.', ideal: 'Investigación y contenido', url: 'https://perplexity.ai',
    long: 'Perplexity combina buscador y asistente: responde tus preguntas y enlaza las fuentes para que verifiques. Muy útil para investigar mercado y competencia.',
    features: ['Respuestas con fuentes citadas', 'Investigación de mercado rápida', 'Resúmenes de temas complejos'],
    steps: ['Abre perplexity.ai', 'Haz tu pregunta en español', 'Revisa las fuentes enlazadas'],
  },
  {
    slug: 'make', name: 'Make', cat: 'Automatización',
    desc: 'Conecta tus apps sin escribir código.', price: 'Pago', rating: '4.7', color: '#6D5EF7',
    tagline: 'Automatiza procesos conectando tus apps, sin código.', ideal: 'Operaciones y back office', url: 'https://make.com',
    long: 'Make une tus herramientas (email, hojas, CRM, WhatsApp) en flujos automáticos visuales. Lo que hacías a mano, ocurre solo.',
    features: ['Conecta cientos de aplicaciones', 'Flujos visuales sin programar', 'Automatiza tareas repetitivas'],
    steps: ['Crea una cuenta en make.com', 'Elige las apps que quieres conectar', 'Diseña el flujo arrastrando módulos'],
  },
  {
    slug: 'zapier', name: 'Zapier', cat: 'Automatización',
    desc: 'Automatiza tareas repetitivas al instante.', price: 'Freemium', rating: '4.6', color: '#FF4F00',
    tagline: 'La forma más sencilla de automatizar tareas.', ideal: 'Pymes sin equipo técnico', url: 'https://zapier.com',
    long: 'Zapier conecta tus aplicaciones para que pasen cosas solas: un formulario que crea un contacto, un pedido que avisa por WhatsApp. Sin escribir código.',
    features: ['Más de 6.000 apps integradas', 'Plantillas listas para usar', 'Dispara acciones automáticas'],
    steps: ['Regístrate en zapier.com', 'Elige un disparador (ej: nuevo email)', 'Define la acción automática'],
  },
  {
    slug: 'notion-ia', name: 'Notion IA', cat: 'Automatización',
    desc: 'Docs, notas y tareas con IA integrada.', price: 'Pago', rating: '4.5', color: '#373530',
    tagline: 'Tu espacio de trabajo con IA integrada.', ideal: 'Equipos y documentación', url: 'https://notion.so',
    long: 'Notion reúne notas, tareas y documentos en un solo lugar, con una IA que redacta y resume sin salir de la página.',
    features: ['Redacta y resume dentro de tus notas', 'Organiza proyectos y tareas', 'Crea bases de datos sencillas'],
    steps: ['Abre tu espacio en notion.so', 'Activa la IA con la barra espaciadora', 'Pídele borradores o resúmenes'],
  },
  {
    slug: 'manychat', name: 'ManyChat', cat: 'WhatsApp',
    desc: 'Bots de WhatsApp e Instagram para vender.', price: 'Freemium', rating: '4.6', color: '#2BC3A8',
    tagline: 'Bots de WhatsApp e Instagram que venden por ti.', ideal: 'Tiendas y servicios locales', url: 'https://manychat.com',
    long: 'ManyChat automatiza la conversación con tus clientes en WhatsApp e Instagram: responde, capta datos y agenda sin que tengas que estar pendiente.',
    features: ['Responde mensajes 24/7', 'Capta clientes desde Instagram', 'Envía campañas por WhatsApp'],
    steps: ['Conecta tu cuenta en manychat.com', 'Diseña el flujo de conversación', 'Activa las respuestas automáticas'],
  },
  {
    slug: 'landbot', name: 'Landbot', cat: 'WhatsApp',
    desc: 'Chatbots conversacionales sin código.', price: 'Freemium', rating: '4.5', color: '#1A6DFF',
    tagline: 'Chatbots conversacionales sin escribir código.', ideal: 'Captación de leads', url: 'https://landbot.io',
    long: 'Landbot crea asistentes conversacionales con un editor visual. Ideal para guiar al visitante y captar contactos sin perder el tono humano.',
    features: ['Constructor visual de chatbots', 'Capta y cualifica leads', 'Integra con tu web y WhatsApp'],
    steps: ['Regístrate en landbot.io', 'Diseña el bot arrastrando bloques', 'Incrústalo en tu web o WhatsApp'],
  },
  {
    slug: 'hubspot-ia', name: 'HubSpot IA', cat: 'Marketing',
    desc: 'CRM, emails y contenido con IA.', price: 'Pago', rating: '4.5', color: '#FF7A59',
    tagline: 'CRM con IA para vender y fidelizar.', ideal: 'Ventas B2B', url: 'https://hubspot.com',
    long: 'HubSpot organiza tus clientes y oportunidades, y su IA te ayuda a escribir, priorizar y hacer seguimiento para que no se te escape ninguna venta.',
    features: ['Gestiona contactos y oportunidades', 'Redacta emails con IA', 'Automatiza el seguimiento'],
    steps: ['Crea una cuenta en hubspot.com', 'Importa tus contactos', 'Usa la IA para emails y tareas'],
  },
  {
    slug: 'canva-ia', name: 'Canva IA', cat: 'Diseño',
    desc: 'Posts e imágenes de marca al instante.', price: 'Freemium', rating: '4.7', color: '#7D2AE8',
    tagline: 'Diseña posts e imágenes de marca al instante.', ideal: 'Marketing visual', url: 'https://canva.com',
    long: 'Canva pone el diseño al alcance de cualquiera: plantillas, generación de imágenes con IA y edición sencilla para que tus redes luzcan profesionales.',
    features: ['Plantillas para redes y anuncios', 'Genera imágenes por texto', 'Quita fondos y edita rápido'],
    steps: ['Entra en canva.com', 'Elige una plantilla o pide una imagen', 'Ajusta colores y texto a tu marca'],
  },
  {
    slug: 'midjourney', name: 'Midjourney', cat: 'Diseño',
    desc: 'Imágenes de alta calidad por texto.', price: 'Pago', rating: '4.8', color: '#4A4DE6',
    tagline: 'Imágenes de alta calidad a partir de texto.', ideal: 'Marca y creatividad', url: 'https://midjourney.com',
    long: 'Midjourney genera imágenes de gran calidad a partir de descripciones. Perfecta para conceptos de marca, moodboards y piezas visuales con personalidad.',
    features: ['Imágenes únicas y artísticas', 'Control de estilo y formato', 'Ideal para conceptos visuales'],
    steps: ['Únete al Discord de Midjourney', 'Escribe /imagine y tu descripción', 'Descarga y refina la imagen'],
  },
  {
    slug: 'elevenlabs', name: 'ElevenLabs', cat: 'Voz',
    desc: 'Voces de IA naturales en español.', price: 'Freemium', rating: '4.6', color: '#111827',
    tagline: 'Voces de IA naturales en español.', ideal: 'Vídeo y podcast', url: 'https://elevenlabs.io',
    long: 'ElevenLabs convierte texto en voz natural en español. Útil para locutar vídeos, anuncios o tutoriales sin un estudio de grabación.',
    features: ['Voces realistas para vídeos', 'Locuta textos y guiones', 'Clona tu propia voz'],
    steps: ['Regístrate en elevenlabs.io', 'Pega tu texto y elige una voz', 'Descarga el audio generado'],
  },
  {
    slug: 'heygen', name: 'HeyGen', cat: 'Vídeo',
    desc: 'Avatares y vídeos con IA en minutos.', price: 'Pago', rating: '4.5', color: '#5B47FB',
    tagline: 'Avatares y vídeos con IA en minutos.', ideal: 'Contenido en vídeo', url: 'https://heygen.com',
    long: 'HeyGen crea vídeos con avatares realistas a partir de un guion. Ideal para formación, marketing y comunicación sin necesidad de grabar.',
    features: ['Avatares que hablan por ti', 'Traduce vídeos a otros idiomas', 'Sin cámara ni edición'],
    steps: ['Crea una cuenta en heygen.com', 'Elige un avatar y escribe el guion', 'Genera y descarga el vídeo'],
  },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const getAlternatives = (tool: Tool) =>
  TOOLS.filter((t) => t.cat === tool.cat && t.slug !== tool.slug).slice(0, 3);
