// Config compartida de Vercel AI Gateway para los scripts de contenido.
//
// Auth: el SDK `ai` lee AI_GATEWAY_API_KEY (o VERCEL_OIDC_TOKEN tras
// `vercel env pull .env.local`). Ver scripts/README-ai.md.
//
// Modelo configurable por env; el gateway hace failover a los modelos de
// reserva si el principal no está disponible (slug obsoleto, proveedor caído).

export const MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-4.6';

export const FALLBACK_MODELS = (process.env.AI_FALLBACK_MODELS || 'openai/gpt-5.4')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// providerOptions.gateway: failover + tags para atribución de coste/observabilidad.
export function gatewayOptions(tags = []) {
  return {
    gateway: {
      models: FALLBACK_MODELS,
      tags: ['project:agentesva', ...tags],
    },
  };
}

export function assertAuth() {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    console.error(
      'Falta auth de AI Gateway.\n' +
        '  → Pon AI_GATEWAY_API_KEY en .env.local (Vercel → proyecto → AI Gateway → API Keys)\n' +
        '  → o ejecuta `vercel env pull .env.local` (token OIDC).',
    );
    process.exit(1);
  }
}
