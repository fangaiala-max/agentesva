// AgentesVA — Brevo subscription proxy (multi-list, con doble opt-in).
// POST /api/subscribe  { email, name?, list?, consent?, company? }
//
//   list = "newsletter" + BREVO_DOI_TEMPLATE_ID definido  → doble opt-in (DOI) de Brevo:
//          el contacto NO entra en la lista hasta confirmar por email; Brevo gestiona
//          el token y el correo de confirmación; al confirmar redirige a /gracias.
//   resto (o sin template DOI configurado)               → alta directa (single opt-in),
//          comportamiento previo, para no romper producción mientras se configura el DOI.
//
//   company = honeypot anti-bots (oculto en el form). Si llega con valor, respondemos
//             éxito falso y no damos de alta a nadie.
//
//   Defensa anti-bombing: el navegador SIEMPRE manda cabecera Origin en un fetch
//   POST (mismo origen incluido), así que exigimos un Origin de la lista permitida.
//   Esto corta los scripts/curl que llaman a la API sin Origin (subscription bombing)
//   sin afectar al formulario real. El límite de tasa por IP se hace en el WAF de Vercel.

const LIST_MAP = {
  default: () => parseInt(process.env.BREVO_LIST_ID || '8', 10),
  newsletter: () => parseInt(
    process.env.BREVO_LIST_ID_NEWSLETTER ||
    process.env.BREVO_LIST_BLOG_NEWSLETTER ||
    process.env.BREVO_LIST_ID || '8', 10),
  'voice-waitlist': () => parseInt(
    process.env.BREVO_LIST_VOICE_WAITLIST ||
    process.env.BREVO_LIST_ID_VOICE_WAITLIST ||
    process.env.BREVO_LIST_ID || '8', 10),
};

const DOI_TEMPLATE_ID = () => parseInt(process.env.BREVO_DOI_TEMPLATE_ID || '0', 10);
const DOI_REDIRECT_URL = () => process.env.BREVO_DOI_REDIRECT_URL || 'https://agentesva.com/gracias';

const ALLOWED_ORIGINS = () =>
  (process.env.SUBSCRIBE_ALLOWED_ORIGINS || 'https://agentesva.com,https://www.agentesva.com')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://agentesva.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Gate por Origin: filtra bots/scripts que llaman a la API sin un Origin válido.
  const origin = (req.headers && req.headers.origin) || '';
  if (!ALLOWED_ORIGINS().includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration' });

  const { email = '', name = '', list = 'default', company = '', consent } = req.body || {};

  // Honeypot: campo oculto que solo rellenan los bots → éxito falso, sin alta.
  if (typeof company === 'string' && company.trim()) {
    return res.status(200).json({ success: true });
  }

  const cleanEmail = email.trim();
  const cleanName = name.trim().slice(0, 100);

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  const resolveListId = LIST_MAP[list] || LIST_MAP.default;
  const listId = resolveListId();

  const attributes = { SOURCE_LIST: list };
  if (cleanName) {
    const [firstName, ...rest] = cleanName.split(' ');
    attributes.FIRSTNAME = firstName;
    if (rest.length) attributes.LASTNAME = rest.join(' ');
  }

  // Registro de consentimiento (RGPD): momento y origen del opt-in. Atributos
  // personalizados de Brevo, mismo mecanismo que SOURCE_LIST (crear en el panel
  // si la cuenta valida el esquema de atributos).
  if (consent === true) {
    attributes.OPT_IN_AT = new Date().toISOString();
    attributes.OPT_IN_SOURCE = list;
  }

  const useDoi = list === 'newsletter' && DOI_TEMPLATE_ID() > 0;

  const endpoint = useDoi
    ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
    : 'https://api.brevo.com/v3/contacts';

  const payload = useDoi
    ? {
        email: cleanEmail,
        includeListIds: [listId],
        templateId: DOI_TEMPLATE_ID(),
        redirectionUrl: DOI_REDIRECT_URL(),
        attributes,
      }
    : {
        email: cleanEmail,
        listIds: [listId],
        updateEnabled: true,
        attributes,
      };

  const upstream = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
  });

  // DOI devuelve 201/204; el alta directa también. Ambos = éxito.
  if (upstream.status === 201 || upstream.status === 204) {
    return res.status(200).json({ success: true, list, doi: useDoi });
  }

  // No filtramos el mensaje de Brevo al cliente (puede exponer detalle interno);
  // lo dejamos en el log del servidor para diagnóstico.
  const detail = await upstream.json().catch(() => ({}));
  console.error('[subscribe] Brevo error', upstream.status, (detail && (detail.code || detail.message)) || '');
  return res.status(upstream.status >= 400 ? upstream.status : 500).json({ error: 'Subscription failed' });
}
