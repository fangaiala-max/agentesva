// AgentesVA — Brevo subscription proxy (multi-list)
// POST /api/subscribe  { "email": "...", "name"?: "...", "list"?: "newsletter" | "voice-waitlist" }

const LIST_MAP = {
  // Default list (general signup) — kept for backward compatibility
  default: () => parseInt(process.env.BREVO_LIST_ID || '8', 10),
  // Blog newsletter
  newsletter: () => parseInt(process.env.BREVO_LIST_ID_NEWSLETTER || process.env.BREVO_LIST_ID || '8', 10),
  // Voice agents waitlist
  'voice-waitlist': () => parseInt(process.env.BREVO_LIST_ID_VOICE_WAITLIST || process.env.BREVO_LIST_ID || '8', 10),
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://agentesva.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration' });

  const { email = '', name = '', list = 'default' } = req.body || {};
  const cleanEmail = email.trim();
  const cleanName  = name.trim().slice(0, 100);

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  const resolveListId = LIST_MAP[list] || LIST_MAP.default;
  const listId = resolveListId();

  const payload = {
    email: cleanEmail,
    listIds: [listId],
    updateEnabled: true,
    attributes: { SOURCE_LIST: list },
  };
  if (cleanName) {
    const [firstName, ...rest] = cleanName.split(' ');
    payload.attributes.FIRSTNAME = firstName;
    if (rest.length) payload.attributes.LASTNAME = rest.join(' ');
  }

  const upstream = await fetch('https://api.brevo.com/v3/contacts', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'api-key': apiKey },
    body:    JSON.stringify(payload),
  });

  if (upstream.status === 201 || upstream.status === 204) {
    return res.status(200).json({ success: true, list });
  }

  const body = await upstream.json().catch(() => ({}));
  return res.status(upstream.status >= 400 ? upstream.status : 500).json({ error: body.message || 'Subscription failed' });
}
