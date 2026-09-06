# Email delivery repair — 2026-09-06

## Verified production findings

- Vercel project: `05-agentesva`, production domain `agentesva.com`.
- Production logs show `[subscribe] Brevo error 401 unauthorized` for the authorized newsletter test.
- `BREVO_API_KEY` exists in Vercel as a sensitive variable shared by production, preview and development. Vercel does not expose its plaintext through the environment API. The absence of a returned value does not mean that the deployed key is empty.
- Doppler project `agentes-va`, config `prd`, does not currently contain a Brevo key. `dev` does not either. Do not assume the example environment documentation describes the active secret source accurately.
- Public MX records use Cloudflare Email Routing. SPF includes `_spf.mx.cloudflare.net`; a Brevo verification TXT and a monitoring DMARC record are present. These records alone do not establish an active forwarding rule or authenticated outbound delivery.
- Brevo and Cloudflare login access is needed to replace the rejected credential, verify the outbound sender/domain and inspect the forwarding rule. No credentials or email-routing settings have been changed so far.

## Prepared code

- `src/lib/diagnostic-email.ts`: transactional Brevo notification to the fixed recipient `hola@agentesva.com`, with the visitor's address as Reply-To, plain text lead details and an idempotency key derived from the submission ID.
- `api/diagnostic.ts`: notification follows successful Notion persistence. When enabled, a provider failure returns a recoverable 502; the lead remains in Notion and a retry uses the existing submission ID.
- `DIAGNOSTIC_EMAIL_FROM` explicitly enables the notification and must be a verified sender on `agentesva.com`. It is not yet configured in production. Without it the existing Notion-only behavior remains.
- Brevo's documented idempotency window is 30 minutes; this is not an unlimited guarantee against later duplicate notifications. Reference: https://developers.brevo.com/docs/heterogenous-versions-batch-emails
- Trim incidental whitespace from the Brevo API key. This is defensive handling, not a claimed fix for the production authentication failure.

## Validation and remaining steps

- 500 tests across 59 files pass, including new notification tests for recipient/sender/reply-to, authentication rejection, malformed responses, network failure, explicit activation and duplicate handling. Production build passes.
- Restore Brevo access and validate a replacement key with the account API before updating Vercel. Preserve its existing target environments.
- Verify the outbound sender and domain authentication in Brevo; configure `DIAGNOSTIC_EMAIL_FROM` only after that verification.
- Confirm the Cloudflare custom address `hola@agentesva.com` routes to verified destination `fangaiala@gmail.com`; change only if necessary.
- Deploy the mail repair, then submit clearly labeled diagnostic and newsletter tests. Check provider logs, Gmail inbox and spam, and authentication headers. Production deployment and end-to-end delivery are still pending.

No production settings have been changed and no new test messages were sent during preparation of this repair.
