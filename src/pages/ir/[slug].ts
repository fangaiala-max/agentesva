import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Permite cambiar links centralmente, medir EPC y aplicar rel=sponsored en el origen.
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('No encontrado', { status: 404 });

  const tools = await getCollection('tools');
  const tool = tools.find((t) => t.id === slug);
  if (!tool) {
    return new Response('Herramienta no encontrada', { status: 404 });
  }

  const dest = tool.data.affiliateUrl || tool.data.url;
  // Log de clic — MVP: visible en los logs de Vercel (sin UI de analítica).
  console.log(`[ir] click ${slug} → ${dest}`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
};
