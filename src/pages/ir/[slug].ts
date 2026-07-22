import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pickToolDest, sanitizeSrc, buildClickLog } from '../../data/ir';

// Salida afiliado: ruta on-demand (no se prerenderiza). 302 → afiliado||oficial.
// Resuelve primero herramientas (#50), luego cursos (#54), luego recursos (#57).
// Los slugs son únicos entre las tres colecciones (guard de build en /cursos y /recursos).
export const prerender = false;

function redirect(
  dest: string,
  meta: { type: string; slug: string; hasAffiliate: boolean; src: string | null; referer: string | null },
): Response {
  // Log estructurado JSON: 100% de captura, sin cookies/consentimiento (server-side).
  // Fuente de verdad de clicks de afiliado en los logs de la función Vercel.
  console.log(
    JSON.stringify(
      buildClickLog({
        type: meta.type,
        slug: meta.slug,
        dest,
        hasAffiliate: meta.hasAffiliate,
        src: meta.src,
        referer: meta.referer,
        ts: new Date().toISOString(),
      }),
    ),
  );
  return new Response(null, {
    status: 302,
    headers: {
      Location: dest,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  });
}

export const GET: APIRoute = async ({ params, url, request }) => {
  const slug = params.slug;
  if (!slug) return new Response('No encontrado', { status: 404 });

  const src = sanitizeSrc(url.searchParams.get('src'));
  const referer = request.headers.get('referer');

  const tool = (await getCollection('tools')).find((t) => t.id === slug);
  if (tool) {
    const { dest, hasAffiliate } = pickToolDest(tool.data);
    return redirect(dest, { type: 'tool', slug, hasAffiliate, src, referer });
  }

  const curso = (await getCollection('cursos')).find((c) => c.id === slug);
  if (curso) {
    // propio → Gumroad (officialUrl es su propia ficha, evita bucle 302); externo → afiliado||oficial.
    const dest =
      curso.data.tipo === 'propio'
        ? curso.data.gumroadUrl || curso.data.officialUrl
        : curso.data.affiliateUrl || curso.data.officialUrl;
    const hasAffiliate = curso.data.tipo === 'propio' ? Boolean(curso.data.gumroadUrl) : Boolean(curso.data.affiliateUrl);
    return redirect(dest, { type: 'curso', slug, hasAffiliate, src, referer });
  }

  const recurso = (await getCollection('recursos')).find((r) => r.id === slug);
  if (recurso) {
    // pago → compraUrl (Gumroad/Stripe); gratis → descarga directa o /newsletter (con puerta).
    const dest =
      recurso.data.precio === 'Pago'
        ? (recurso.data.compraUrl as string)
        : recurso.data.downloadUrl || '/newsletter';
    return redirect(dest, { type: 'recurso', slug, hasAffiliate: recurso.data.precio === 'Pago', src, referer });
  }

  return new Response('No encontrado', { status: 404 });
};
