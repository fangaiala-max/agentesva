import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Resuelve primero herramientas (#50), luego cursos (#54), luego recursos (#57).
// Los slugs son únicos entre las tres colecciones (guard de build en /cursos y /recursos).
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
  if (curso) {
    // propio → Gumroad (officialUrl es su propia ficha, evita bucle 302); externo → afiliado||oficial.
    const dest = curso.data.tipo === 'propio'
      ? (curso.data.gumroadUrl || curso.data.officialUrl)
      : (curso.data.affiliateUrl || curso.data.officialUrl);
    return redirect(dest, 'curso', slug);
  }

  const recurso = (await getCollection('recursos')).find((r) => r.id === slug);
  if (recurso) {
    // pago → Gumroad; gratis → descarga directa o /newsletter (con puerta).
    const dest =
      recurso.data.precio === 'Pago'
        ? (recurso.data.gumroadUrl as string)
        : (recurso.data.downloadUrl || '/newsletter');
    return redirect(dest, 'recurso', slug);
  }

  return new Response('No encontrado', { status: 404 });
};
