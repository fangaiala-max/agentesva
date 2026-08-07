import { createHmac, timingSafeEqual } from 'node:crypto';
import type { DiagnosticResult, ResultType } from './diagnostico';

const RESULT_TYPES = new Set<ResultType>(['qualified_call', 'paid_workshop', 'self_serve_resources', 'manual_review']);
const CLUSTERS = new Set<DiagnosticResult['cluster']>(['customer_service', 'sales', 'operations', 'general']);
const SERVICES = new Set<DiagnosticResult['service']>([
  'customer_service_automation',
  'sales_automation',
  'process_automation',
  'general_consulting',
]);
const TOKEN_TTL_MS = 30 * 60 * 1000;

interface DiagnosticTokenPayload {
  resultType: ResultType;
  cluster: DiagnosticResult['cluster'];
  service: DiagnosticResult['service'];
  expiresAt: number;
}

export function signDiagnosticResult(result: DiagnosticResult, secret: string, now = Date.now()): string | undefined {
  if (secret.length < 24) return undefined;
  const payload: DiagnosticTokenPayload = {
    resultType: result.resultType,
    cluster: result.cluster,
    service: result.service,
    expiresAt: now + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyDiagnosticResultToken(token: string, secret: string, now = Date.now()): DiagnosticTokenPayload | undefined {
  if (secret.length < 24 || token.length > 2_048) return undefined;
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) return undefined;
  const expected = createHmac('sha256', secret).update(encoded).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, 'base64url');
  } catch {
    return undefined;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as DiagnosticTokenPayload;
    if (!RESULT_TYPES.has(payload.resultType) || !CLUSTERS.has(payload.cluster) || !SERVICES.has(payload.service)) return undefined;
    if (!Number.isSafeInteger(payload.expiresAt) || payload.expiresAt < now) return undefined;
    return payload;
  } catch {
    return undefined;
  }
}
