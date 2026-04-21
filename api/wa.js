// AgentesVA — Twilio WhatsApp webhook
// Migrated from wh/wa.php
// GET  /wh/wa  → webhook verification
// POST /wh/wa  → incoming message handler

import crypto from 'crypto';

function validateTwilioSig(token, url, params, sig) {
  const sorted = Object.keys(params).sort();
  let data = url;
  for (const k of sorted) data += k + params[k];
  const expected = crypto.createHmac('sha1', token).update(data).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export default async function handler(req, res) {
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const verifyToken = process.env.WA_VERIFY_TOKEN;

  // Webhook verification (GET)
  if (req.method === 'GET') {
    const { hub_mode, hub_challenge, hub_verify_token } = req.query;
    if (hub_mode === 'subscribe' && hub_challenge && hub_verify_token === verifyToken) {
      return res.status(200).send(hub_challenge);
    }
    return res.status(403).end();
  }

  // Incoming message (POST)
  if (req.method === 'POST') {
    const sig = req.headers['x-twilio-signature'];
    if (sig && authToken) {
      const url = 'https://agentesva.com/wh/wa';
      const valid = validateTwilioSig(authToken, url, req.body || {}, sig);
      if (!valid) return res.status(403).end();
    }

    // Log message (Vercel logs, visible in dashboard)
    if (req.body?.From?.startsWith('whatsapp:')) {
      const from = req.body.From.replace('whatsapp:', '');
      const body = req.body.Body || '(sin texto)';
      console.log(`[WA] ${from}: ${body}`);
    }

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }

  return res.status(405).end();
}
