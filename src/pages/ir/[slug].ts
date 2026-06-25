import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Resuelve primero herramientas (#50), luego cursos (#54). Los slugs son únicos
// entre ambas colecciones (guard de build en /cursos).
export const prerender = false;

function redirect(dest: string, kind: string, slug: string): Response {
  console.log(`[ir] click ${kind} ${slug} → ${dest}`);
  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('No encontrado', { status: 404 });

  const tool = (await getCollection('tools')).find((t) => t.id === slug);
  if (tool) return redirect(tool.data.affiliateUrl || tool.data.url, 'tool', slug);

  const curso = (await getCollection('cursos')).find((c) => c.id === slug);
  if (curso) return redirect(curso.data.affiliateUrl || curso.data.officialUrl, 'curso', slug);

  return new Response('No encontrado', { status: 404 });
};
