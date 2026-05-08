// AgentesVA — Diagnóstico quiz proxy to Make.com
// POST /api/diagnostico  { tipo_negocio, horas_perdidas, leads_perdidos, herramientas, frustracion, email, nombre?, website? }
// Webhook URL is kept server-side (env: MAKE_DIAGNOSTICO_WEBHOOK) so it can't be scraped from client HTML.

const ALLOWED_ORIGIN = 'https://agentesva.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const webhook = process.env.MAKE_DIAGNOSTICO_WEBHOOK;
  if (!webhook) return res.status(500).json({ error: 'Server misconfiguration' });

  const body = req.body || {};
  const { website = '', email = '' } = body;

  if (website) return res.status(200).json({ success: true });

  const cleanEmail = String(email).trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  const { tipo_negocio = '', horas_perdidas = '', leads_perdidos = '', herramientas = [], frustracion = '', nombre = '' } = body;

  const payload = {
    tipo_negocio: String(tipo_negocio).slice(0, 100),
    horas_perdidas: String(horas_perdidas).slice(0, 50),
    leads_perdidos: String(leads_perdidos).slice(0, 50),
    herramientas: Array.isArray(herramientas) ? herramientas.slice(0, 20).map(t => String(t).slice(0, 50)) : [],
    frustracion: String(frustracion).slice(0, 2000),
    email: cleanEmail,
    nombre: String(nombre).slice(0, 100),
  };

  const upstream = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!upstream) return res.status(502).json({ error: 'Upstream unavailable' });
  if (!upstream.ok) return res.status(502).json({ error: 'Upstream error' });

  return res.status(200).json({ success: true });
}
