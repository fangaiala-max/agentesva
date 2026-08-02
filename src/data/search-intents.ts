// Sinónimos de intención por categoría.
//
// El público objetivo (dueños de pymes, sin perfil técnico) no busca por el
// nombre de la categoría: busca por la tarea que quiere resolver. Escribe
// "facturas", "atender clientes" o "crear imagenes", no "Automatización",
// "WhatsApp" ni "Diseño".
//
// Estos términos se concatenan al `data-search` de cada ficha en tiempo de
// build (ver ToolCard.astro), así que el filtro cliente no cambia: solo tiene
// más texto donde encontrar coincidencias.
//
// Se escriben SIN tildes a propósito: `fold()` normaliza la consulta del
// usuario, y así "diseno" y "diseño" caen en el mismo sitio.
export const CATEGORY_INTENTS: Record<string, string[]> = {
  Asistentes: [
    'redactar', 'escribir', 'resumir', 'traducir', 'correos', 'emails',
    'responder', 'chat', 'chatbot', 'preguntas', 'documentos', 'textos',
    'analizar', 'ideas', 'borradores',
  ],
  Automatizacion: [
    'automatizar', 'automatico', 'integrar', 'conectar', 'flujos', 'procesos',
    'tareas repetitivas', 'sin codigo', 'nocode', 'facturas', 'facturacion',
    'presupuestos', 'pedidos', 'excel', 'hojas de calculo', 'sincronizar',
    'ahorrar tiempo',
  ],
  WhatsApp: [
    'whatsapp', 'chatbot', 'bots', 'atender clientes', 'atencion al cliente',
    'responder mensajes', 'contestar', 'vender por chat', 'soporte',
    'mensajeria', 'conversaciones', 'automatizar whatsapp',
  ],
  Marketing: [
    'marketing', 'captar clientes', 'leads', 'email marketing', 'newsletter',
    'campañas', 'campanas', 'seo', 'anuncios', 'publicidad', 'redes sociales',
    'embudo', 'crm', 'fidelizar', 'vender mas',
  ],
  Diseno: [
    'diseno', 'crear imagenes', 'imagenes', 'fotos', 'logos', 'logotipo',
    'banners', 'carteles', 'ilustraciones', 'marca', 'branding', 'plantillas',
    'presentaciones', 'editar fotos',
  ],
  Video: [
    'video', 'videos', 'crear videos', 'editar video', 'montaje', 'avatares',
    'subtitulos', 'clips', 'reels', 'youtube', 'tiktok', 'grabar',
    'presentador virtual',
  ],
  Voz: [
    'voz', 'audio', 'locucion', 'narracion', 'podcast', 'doblaje',
    'transcribir', 'transcripcion', 'musica', 'sonido', 'leer en voz alta',
  ],
  Escritura: [
    'escribir', 'redactar', 'copywriting', 'copys', 'blog', 'articulos',
    'contenido', 'corregir', 'ortografia', 'gramatica', 'traducir', 'textos',
    'posts',
  ],
  Codigo: [
    'codigo', 'programar', 'desarrollo', 'desarrollar', 'apps', 'aplicaciones',
    'web', 'pagina web', 'debug', 'errores', 'scripts', 'automatizar tareas tecnicas',
  ],
  Productividad: [
    'productividad', 'organizar', 'notas', 'apuntes', 'reuniones', 'actas',
    'resumen de reuniones', 'tareas', 'agenda', 'calendario', 'documentos',
    'pdf', 'facturas', 'contabilidad', 'gestion', 'ahorrar tiempo',
  ],
};

// Las claves van sin tildes ni caracteres especiales para poder cruzarlas con
// `tool.cat`, que sí los lleva ("Automatización", "Diseño", "Vídeo", "Código").
const normalizeKey = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '');

/** Términos de intención de una categoría. Vacío si la categoría no está mapeada. */
export function intentsFor(cat: string): string[] {
  return CATEGORY_INTENTS[normalizeKey(cat)] ?? [];
}

/** Texto indexable de una ficha: lo visible más los sinónimos de su categoría. */
export function buildSearchIndex(name: string, desc: string, cat: string): string {
  return [name, desc, cat, ...intentsFor(cat)].join(' ').toLowerCase();
}
