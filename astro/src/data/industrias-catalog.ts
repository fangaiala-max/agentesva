// Industry pages for /catalogo/[slug]/ — 12 entries extracted from
// source HTML at /catalogo/[slug]/index.html (Week 2 migration).
//
// industriaFilter maps to the filter pill on /catalogo/?filter=ind-X
// agentesRecomendados references agent IDs from agents.ts

export interface IndustriaCatalog {
  slug: string;
  nombre: string;
  glyph: string;
  icono: string; // material symbol name
  seoTitle: string;
  seoDescription: string;
  heroH1: string;
  heroLede: string;
  industriaFilter?: string; // matches agents[].industria
  usoCasos: { titulo: string; desc: string }[];
  agentesRecomendados: number[];
  testimonio: { quote: string; author: string; role: string };
  ctaTitulo: string;
}

export const industriasCatalog: IndustriaCatalog[] = [
  {
    slug: 'academia',
    nombre: 'Academias y Cursos',
    glyph: '🎓',
    icono: 'school',
    seoTitle: 'Agentes IA para Academias y Cursos | AgentesVA',
    seoDescription:
      'Llena grupos y cobra puntual en tu academia con agentes de IA. Inscripciones, cobros y recordatorios automáticos. Sin código.',
    heroH1: 'La inteligencia detrás de tu academia.',
    heroLede:
      'Automatiza inscripciones, cobros y recordatorios con agentes de IA diseñados para academias y escuelas de cursos en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Inscripciones por WhatsApp', desc: 'El alumno se inscribe sin llamadas; la IA confirma plaza y envía datos de pago.' },
      { titulo: 'Cobros y mensualidades', desc: 'Recordatorios automáticos antes y después del vencimiento. Cobros puntuales sin perseguir.' },
      { titulo: 'Recordatorios de clase', desc: 'Aviso 24h antes para reducir ausentismo. Personalizado por grupo y nivel.' },
    ],
    agentesRecomendados: [1, 9, 11, 18],
    testimonio: {
      quote: 'Antes pasaba el día persiguiendo pagos. Ahora la IA se encarga y tengo tiempo para enseñar.',
      author: 'Lucía M.',
      role: 'Directora, Academia Idiomas Norte',
    },
    ctaTitulo: '¿Listo para llenar tu academia?',
  },
  {
    slug: 'agencia',
    nombre: 'Agencias Digitales',
    glyph: '🏢',
    icono: 'campaign',
    seoTitle: 'Agentes IA para Agencias Digitales | AgentesVA',
    seoDescription:
      'Escala tu agencia digital sin contratar más personal. Onboarding automático, reportes mensuales y cobranza puntual con agentes de IA.',
    heroH1: 'Escala tu agencia sin contratar más personal.',
    heroLede:
      'Onboarding de clientes, reportes mensuales y cobranza en automático. Dedica tu equipo a crear, no a administrar.',
    industriaFilter: 'Agencia',
    usoCasos: [
      { titulo: 'Onboarding de clientes', desc: 'Cuestionarios, accesos y bienvenida automatizados. Cliente listo en 24h sin meeting de onboarding.' },
      { titulo: 'Reportes mensuales', desc: 'Datos de Meta Ads, GA4 y Search Console consolidados en un PDF mensual con IA narrativa.' },
      { titulo: 'Cobranza puntual', desc: 'Facturas y recordatorios automáticos. Cobra el día 5, no el día 25.' },
    ],
    agentesRecomendados: [1, 8, 10, 21],
    testimonio: {
      quote: 'Pasamos de 8 a 14 clientes con el mismo equipo. La IA hace el trabajo administrativo que mataba márgenes.',
      author: 'Diego R.',
      role: 'Founder, Agencia Performance MX',
    },
    ctaTitulo: '¿Listo para escalar tu agencia?',
  },
  {
    slug: 'coach',
    nombre: 'Coaches y Consultores',
    glyph: '🎯',
    icono: 'psychology',
    seoTitle: 'Agentes IA para Coaches y Consultores | AgentesVA',
    seoDescription:
      'Llena tu agenda y cobra puntual como coach o consultor independiente con agentes de IA. Sesiones, cobros y materiales en automático.',
    heroH1: 'La inteligencia detrás de tu práctica de coaching.',
    heroLede:
      'Agenda, cobros y seguimiento de clientes automatizados con agentes de IA diseñados para coaches en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Agenda llena', desc: 'Calendly + IA que califica leads y solo deja pasar a clientes ideales a tu agenda.' },
      { titulo: 'Cobros recurrentes', desc: 'Suscripciones, recordatorios y cobros automáticos. Cero perseguir pagos.' },
      { titulo: 'Material de sesión', desc: 'IA prepara resumen, tareas y seguimiento después de cada sesión.' },
    ],
    agentesRecomendados: [9, 11, 8, 20],
    testimonio: {
      quote: 'Recuperé 10 horas a la semana que dedicaba a admin. Ahora son 10 horas más de sesiones pagas.',
      author: 'Mariana S.',
      role: 'Coach ejecutivo, Bogotá',
    },
    ctaTitulo: '¿Listo para llenar tu agenda?',
  },
  {
    slug: 'consultoria',
    nombre: 'Consultoras y Despachos',
    glyph: '📊',
    icono: 'analytics',
    seoTitle: 'Agentes IA para Consultoras y Despachos | AgentesVA',
    seoDescription:
      'Automatiza propuestas, contratos y cobranza en tu consultoría o despacho con agentes de IA. Cierra proyectos 50% más rápido.',
    heroH1: 'La inteligencia detrás de tu consultoría.',
    heroLede:
      'Propuestas, contratos y cobranza automatizados para consultorías y despachos en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Propuestas en horas', desc: 'Brief → propuesta personalizada en tu plantilla, en menos de 60 minutos.' },
      { titulo: 'Contratos automatizados', desc: 'Generación, firma electrónica y archivo. Sin que un asociado pierda 4 horas.' },
      { titulo: 'Cobranza profesional', desc: 'Recordatorios firmes pero amables. Cobros puntuales sin tensar la relación.' },
    ],
    agentesRecomendados: [1, 10, 11, 21],
    testimonio: {
      quote: 'Antes una propuesta tardaba 3 días. Hoy salen el mismo día y cerramos 2.7× más.',
      author: 'Andrés P.',
      role: 'Socio director, despacho legal',
    },
    ctaTitulo: '¿Listo para cerrar más proyectos?',
  },
  {
    slug: 'consultorio',
    nombre: 'Consultorios Médicos y Dentales',
    glyph: '🩺',
    icono: 'stethoscope',
    seoTitle: 'Agentes IA para Consultorio Médico y Dental | AgentesVA',
    seoDescription:
      'Automatiza citas, recordatorios y cobros en tu consultorio médico o dental con agentes de IA. Menos administración, más pacientes.',
    heroH1: 'La inteligencia detrás de tu consultorio.',
    heroLede:
      'Automatiza citas, recordatorios y cobros con agentes de IA diseñados para consultorios médicos y dentales en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Citas por WhatsApp', desc: 'El paciente reserva sin llamar a recepción. Agenda llena, recepción concentrada en pacientes presentes.' },
      { titulo: 'Recordatorios 24h antes', desc: 'Reduce no-shows del 25% al 8%. Confirmación bidireccional automática.' },
      { titulo: 'Cobros y facturación', desc: 'Cobro previo o post-consulta automatizado. Facturas a CFDI/SAT/AFIP automáticas.' },
    ],
    agentesRecomendados: [9, 8, 11, 20],
    testimonio: {
      quote: 'Pasamos de 25% de no-shows a menos del 10%. Cada hora vale oro y ya no las regalamos.',
      author: 'Dr. Carlos V.',
      role: 'Director, clínica dental Roma Norte',
    },
    ctaTitulo: '¿Listo para llenar tu agenda?',
  },
  {
    slug: 'ecommerce',
    nombre: 'Tienda Online',
    glyph: '🛒',
    icono: 'shopping_cart',
    seoTitle: 'Agentes IA para Tienda Online | AgentesVA',
    seoDescription:
      'Recupera carritos abandonados, automatiza soporte 24/7 y multiplica recompras en tu tienda online con agentes de IA.',
    heroH1: 'Vende más en tu tienda online con IA.',
    heroLede:
      'Carritos abandonados, soporte y postventa automatizados con agentes de IA diseñados para tiendas online en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Ecommerce',
    usoCasos: [
      { titulo: 'Carritos abandonados', desc: 'WhatsApp + email automatizados. Recupera 18-25% de carritos perdidos sin esfuerzo.' },
      { titulo: 'Soporte 24/7', desc: 'IA responde dudas de envío, talla, devoluciones. Solo escala los casos complejos a humano.' },
      { titulo: 'Recompras y reseñas', desc: 'Pide reseña 7 días post-entrega. Sugerencia de recompra basada en historial.' },
    ],
    agentesRecomendados: [1, 9, 11, 21],
    testimonio: {
      quote: 'Recuperamos 22% de carritos con el agente de WhatsApp. Antes perdíamos esa venta.',
      author: 'Sofía T.',
      role: 'Founder, marca de ropa CDMX',
    },
    ctaTitulo: '¿Listo para vender más?',
  },
  {
    slug: 'estetica',
    nombre: 'Clínica Estética',
    glyph: '💆',
    icono: 'spa',
    seoTitle: 'Agentes IA para Clínica Estética | AgentesVA',
    seoDescription:
      'Convierte consultas en citas en tu clínica estética con agentes de IA. Cotizaciones, seguimiento y agenda llena. Sin código.',
    heroH1: 'La inteligencia detrás de tu clínica estética.',
    heroLede:
      'Consultas, cotizaciones y agenda automatizadas con agentes de IA diseñados para clínicas estéticas en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Cotizaciones al instante', desc: 'IA responde precio, duración y disponibilidad por WhatsApp. 24/7, sin esperar a recepción.' },
      { titulo: 'Agenda de tratamientos', desc: 'Reserva, confirma y recuerda. Calendario coordinado entre cabinas y profesionales.' },
      { titulo: 'Seguimiento post-tratamiento', desc: 'IA pide reseña, recuerda mantenimiento y sugiere tratamientos complementarios.' },
    ],
    agentesRecomendados: [9, 8, 11, 20],
    testimonio: {
      quote: 'La IA cierra cotizaciones de noche, cuando antes el lead se perdía. Subimos 30% en consultas pagas.',
      author: 'Valeria N.',
      role: 'Owner, clínica estética Polanco',
    },
    ctaTitulo: '¿Listo para llenar tu agenda?',
  },
  {
    slug: 'farmacia',
    nombre: 'Farmacias',
    glyph: '💊',
    icono: 'medication',
    seoTitle: 'Agentes IA para Farmacias | AgentesVA',
    seoDescription:
      'Automatiza recetas, recordatorios y control de inventario en tu farmacia con agentes de IA. Mejor adherencia al tratamiento.',
    heroH1: 'La inteligencia detrás de tu farmacia.',
    heroLede:
      'Automatiza recetas, recordatorios de toma e inventario con agentes de IA diseñados para farmacias en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Recordatorios de toma', desc: 'IA envía recordatorios de tratamiento al paciente. Mejora adherencia 40%.' },
      { titulo: 'Recetas recurrentes', desc: 'Aviso automático cuando toca renovar receta. Cliente recurrente sin esfuerzo.' },
      { titulo: 'Control de inventario', desc: 'IA detecta stock bajo y sugiere pedido al proveedor automático.' },
    ],
    agentesRecomendados: [1, 8, 11, 18],
    testimonio: {
      quote: 'Los pacientes nos agradecen los recordatorios y vuelven antes a recoger su tratamiento.',
      author: 'Patricia G.',
      role: 'Farmacéutica titular, farmacia barrio',
    },
    ctaTitulo: '¿Listo para automatizar tu farmacia?',
  },
  {
    slug: 'gimnasio',
    nombre: 'Gimnasios y Centros Fitness',
    glyph: '💪',
    icono: 'fitness_center',
    seoTitle: 'Agentes IA para Gimnasios y Centros Fitness | AgentesVA',
    seoDescription:
      'Retén más socios en tu gimnasio con agentes de IA. Membresías, renovaciones y seguimiento automático. Menos cancelaciones.',
    heroH1: 'Retén más socios en tu gimnasio con IA.',
    heroLede:
      'Registro, renovaciones y retención de socios automatizados con agentes de IA diseñados para gimnasios en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Renovaciones automáticas', desc: 'Aviso 7 días antes del vencimiento. Renovación con un click. Tasa de renovación +15%.' },
      { titulo: 'Onboarding de socio nuevo', desc: 'Bienvenida, plan inicial y guía. El socio activo desde el día 1 = retención.' },
      { titulo: 'Recuperación de inactivos', desc: 'IA detecta socio sin asistir 14 días y le manda mensaje motivacional + oferta de retención.' },
    ],
    agentesRecomendados: [9, 8, 11, 20],
    testimonio: {
      quote: 'Antes perdíamos socios sin saber por qué. Ahora la IA detecta señales tempranas y los recuperamos.',
      author: 'Roberto K.',
      role: 'Manager, gimnasio Premium Sur',
    },
    ctaTitulo: '¿Listo para retener más socios?',
  },
  {
    slug: 'inmobiliaria',
    nombre: 'Inmobiliarias',
    glyph: '🏠',
    icono: 'home',
    seoTitle: 'Agentes IA para Inmobiliarias | AgentesVA',
    seoDescription:
      'Califica leads, agenda visitas y envía propuestas en tu inmobiliaria con agentes de IA. Cierra más ventas sin contratar.',
    heroH1: 'Cierra más ventas en tu inmobiliaria con IA.',
    heroLede:
      'Leads, visitas y propuestas automatizados con agentes de IA diseñados para inmobiliarias en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Inmobiliaria',
    usoCasos: [
      { titulo: 'Calificación de leads 24/7', desc: 'IA pregunta presupuesto, zona y plazos. Solo asesores reciben leads listos para visita.' },
      { titulo: 'Agenda de visitas', desc: 'Coordinación de calendarios entre comprador, vendedor y asesor. Sin idas y vueltas.' },
      { titulo: 'Propuestas y contratos', desc: 'Generación automática con datos del CRM. El asesor cierra, no redacta.' },
    ],
    agentesRecomendados: [9, 8, 11, 21],
    testimonio: {
      quote: 'El agente IA califica leads de noche. Mi equipo solo habla con gente que ya está lista.',
      author: 'Esteban L.',
      role: 'Broker, inmobiliaria CDMX',
    },
    ctaTitulo: '¿Listo para cerrar más ventas?',
  },
  {
    slug: 'restaurante',
    nombre: 'Restaurante y Cafetería',
    glyph: '🍽️',
    icono: 'restaurant',
    seoTitle: 'Agentes IA para Restaurante y Cafetería | AgentesVA',
    seoDescription:
      'Automatiza reservas, pedidos a domicilio y fidelización en tu restaurante con agentes de IA. Más clientes, menos trabajo administrativo.',
    heroH1: 'Llena tu restaurante y fideliza clientes con IA.',
    heroLede:
      'Reservas, pedidos y seguimiento de clientes frecuentes en automático. Menos llamadas, más mesas llenas y clientes que regresan.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Reservas por WhatsApp', desc: 'El cliente elige fecha, hora y personas directo por WhatsApp. Sin llamadas, sin confusiones.' },
      { titulo: 'Pedidos a domicilio', desc: 'El agente procesa y confirma cada pedido al instante. Integrado con tu cocina.' },
      { titulo: 'Clientes frecuentes', desc: 'Ofertas personalizadas para que vuelvan una y otra vez. Programa de fidelidad automatizado.' },
    ],
    agentesRecomendados: [9, 8, 11, 20],
    testimonio: {
      quote: 'Antes nos llamaban en plena hora pico para reservar y era un caos. Ahora todo llega por WhatsApp y el sistema lo organiza solo.',
      author: 'Carlos E.',
      role: 'Gerente, Bistro 47',
    },
    ctaTitulo: '¿Listo para llenar tu restaurante?',
  },
  {
    slug: 'salon',
    nombre: 'Salón, Spa y Barbería',
    glyph: '💇',
    icono: 'content_cut',
    seoTitle: 'Agentes IA para Salón, Spa y Barbería | AgentesVA',
    seoDescription:
      'Llena tu agenda en tu salón, spa o barbería con agentes de IA. Citas, recordatorios y fidelización automáticos.',
    heroH1: 'La inteligencia detrás de tu salón.',
    heroLede:
      'Citas, recordatorios y fidelización automatizados con agentes de IA diseñados para salones y spas en Latinoamérica. Sin código, sin servidores.',
    industriaFilter: 'Servicios',
    usoCasos: [
      { titulo: 'Citas por WhatsApp', desc: 'Reserva, confirma y reagenda sin tocar el teléfono. Tu equipo se concentra en el cliente sentado.' },
      { titulo: 'Recordatorios', desc: 'Aviso 24h y 2h antes. Reduce no-shows del 20% al 5%.' },
      { titulo: 'Fidelización', desc: 'IA pide reseña, recuerda servicios y sugiere próxima cita según historial.' },
    ],
    agentesRecomendados: [9, 8, 11, 20],
    testimonio: {
      quote: 'No tenemos recepcionista — la IA hace todo. Mis estilistas trabajan tranquilos y la agenda está siempre llena.',
      author: 'Mónica F.',
      role: 'Owner, salón Condesa',
    },
    ctaTitulo: '¿Listo para llenar tu agenda?',
  },
];
