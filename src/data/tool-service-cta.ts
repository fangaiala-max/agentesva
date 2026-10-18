import type { Price, Tool } from './tools';

export interface ToolServiceRecommendation {
  service: 'customer_service_automation' | 'sales_automation' | 'process_automation' | 'team_adoption';
  cluster: 'customer_service' | 'sales' | 'operations' | 'adoption';
  href: string;
  title: string;
  description: string;
  example: string;
  difficulty: 'Baja' | 'Media' | 'Alta';
  compatible: string;
}

const recommendations: Record<string, Omit<ToolServiceRecommendation, 'difficulty'>> = {
  WhatsApp: { service: 'customer_service_automation', cluster: 'customer_service', href: '/servicios/automatizacion-atencion-cliente/', title: '¿Quieres usarla para atender o vender por WhatsApp?', description: 'Diseñamos el flujo, las respuestas aprobadas y la derivación a tu equipo.', example: 'Clasificar consultas, recoger contexto y asignar conversaciones.', compatible: 'WhatsApp Business, CRM, help desk y formularios' },
  Automatización: { service: 'process_automation', cluster: 'operations', href: '/servicios/automatizacion-procesos/', title: '¿Quieres conectar esta herramienta con tus procesos?', description: 'Mapeamos la tarea, conectamos sistemas y dejamos excepciones y alertas bajo control.', example: 'Mover datos, validar documentos y activar tareas internas.', compatible: 'Correo, hojas, formularios, ERP y APIs' },
  Marketing: { service: 'sales_automation', cluster: 'sales', href: '/servicios/automatizacion-ventas/', title: '¿Quieres convertir esta herramienta en un flujo comercial?', description: 'Conectamos captación, cualificación, CRM y seguimiento con atribución.', example: 'Registrar leads y activar el siguiente paso comercial.', compatible: 'Formularios, CRM, email y analítica' },
  Productividad: { service: 'process_automation', cluster: 'operations', href: '/servicios/automatizacion-procesos/', title: '¿Quieres integrarla en las operaciones del equipo?', description: 'Convertimos una tarea aislada en un flujo documentado y supervisable.', example: 'Resumir reuniones, crear tareas y actualizar sistemas.', compatible: 'Calendario, correo, documentos y gestores de tareas' },
  Asistentes: { service: 'team_adoption', cluster: 'adoption', href: '/diagnostico-automatizacion-ia/', title: '¿Quieres implantarla en tu equipo?', description: 'Diseñamos casos de uso, instrucciones, controles y formación para una adopción útil.', example: 'Crear asistentes internos con fuentes y reglas aprobadas.', compatible: 'Documentos, bases de conocimiento y herramientas internas' },
  Código: { service: 'process_automation', cluster: 'operations', href: '/servicios/automatizacion-procesos/', title: '¿Quieres integrarla en un flujo técnico fiable?', description: 'Definimos controles, pruebas y traspasos para que no dependa de uso improvisado.', example: 'Generar borradores, validar cambios y documentar entregas.', compatible: 'Repositorios, CI, gestores de tareas y documentación' },
  Diseño: { service: 'sales_automation', cluster: 'sales', href: '/servicios/automatizacion-ventas/', title: '¿Quieres incorporarla a tu captación y contenido?', description: 'Conectamos briefs, aprobaciones y distribución con el flujo comercial.', example: 'Crear variantes desde un brief y solicitar aprobación.', compatible: 'Formularios, DAM, redes y gestores de proyectos' },
  Escritura: { service: 'sales_automation', cluster: 'sales', href: '/servicios/automatizacion-ventas/', title: '¿Quieres usarla en un flujo de marketing o ventas?', description: 'Diseñamos prompts, fuentes, revisión y entrega para contenido consistente.', example: 'Preparar borradores personalizados con revisión humana.', compatible: 'CRM, email, CMS y documentos' },
  Voz: { service: 'sales_automation', cluster: 'sales', href: '/servicios/automatizacion-ventas/', title: '¿Quieres integrarla en tu producción de contenido?', description: 'Automatizamos preparación, aprobación y distribución sin perder control de marca.', example: 'Generar locuciones aprobadas desde guiones revisados.', compatible: 'Editores, almacenamiento, CMS y redes' },
  Vídeo: { service: 'sales_automation', cluster: 'sales', href: '/servicios/automatizacion-ventas/', title: '¿Quieres conectarla con tu captación de clientes?', description: 'Diseñamos un flujo desde el brief hasta la aprobación y publicación.', example: 'Crear variantes de vídeo y registrar resultados.', compatible: 'CMS, almacenamiento, redes y analítica' },
};

const difficultyByCategory: Record<string, ToolServiceRecommendation['difficulty']> = { Asistentes: 'Baja', Escritura: 'Baja', Diseño: 'Media', Voz: 'Media', Vídeo: 'Media', Productividad: 'Media', Marketing: 'Media', WhatsApp: 'Alta', Automatización: 'Alta', Código: 'Alta' };

export const implementationCost = (price: Price) => price === 'Gratis' ? 'Herramienta: plan gratuito; implementación profesional desde 1.500 €' : price === 'Freemium' ? 'Herramienta: plan gratis o de pago; implementación profesional desde 1.500 €' : 'Herramienta: licencia de pago; implementación profesional desde 1.500 €';

export function toolServiceRecommendation(tool: Pick<Tool, 'cat'>): ToolServiceRecommendation {
  const base = recommendations[tool.cat] ?? recommendations.Productividad!;
  return { ...base, difficulty: difficultyByCategory[tool.cat] ?? 'Media' };
}
