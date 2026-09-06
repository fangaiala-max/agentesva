import { createHash } from 'node:crypto';
import type { DiagnosticAnswers, DiagnosticResult } from '../data/diagnostico';

/** Brevo suppresses requests with the same idempotency key for 30 minutes. */
export function diagnosticEmailKey(submissionId: string): string {
  const h = createHash('sha256').update(`diagnostic-email:${submissionId}`).digest('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}
export async function notifyDiagnostic(input: {
  contact: { name: string; email: string; organizationName?: string; role?: string };
  answers: DiagnosticAnswers;
  result: DiagnosticResult;
  submissionId: string;
}): Promise<'sent' | 'disabled' | 'failed'> {
  const sender = process.env.DIAGNOSTIC_EMAIL_FROM?.trim();
  // Enable only after the sender has been verified in Brevo.
  if (!sender) return 'disabled';
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key || !/^[^\s@]+@agentesva\.com$/i.test(sender)) return 'failed';
  const {contact, answers, result, submissionId} = input;
  const textContent = [
    'Nuevo diagnóstico de AgentesVA',
    `Referencia: ${submissionId}`,
    '',
    `Nombre: ${contact.name}`,
    `Email: ${contact.email}`,
    `Empresa: ${contact.organizationName || 'No indicada'}`,
    `Cargo: ${contact.role || 'No indicado'}`,
    '',
    `Proceso: ${answers.process}`,
    `Negocio: ${answers.businessType}`,
    `Equipo: ${answers.teamSize}`,
    `Objetivo: ${answers.goal}`,
    `Frecuencia: ${answers.frequency}`,
    `Herramientas: ${answers.currentTools}`,
    `Presupuesto: ${answers.budget}`,
    `Plazo: ${answers.timeline}`,
    `Riesgo: ${answers.risk}`,
    '',
    `Resultado: ${result.resultType}`,
    `Prioridad: ${result.priority}`,
    `Servicio: ${result.service}`,
    '',
    'El diagnóstico se ha guardado en Notion. Responde a este correo para contactar con la persona.',
  ].join('\n');
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {'Content-Type':'application/json', Accept:'application/json', 'api-key':key},
      body: JSON.stringify({
        sender: {name:'AgentesVA · Diagnósticos', email:sender},
        to: [{email:'hola@agentesva.com', name:'AgentesVA'}],
        replyTo: {email:contact.email, name:contact.name.replace(/[\r\n]/g,' ')},
        subject: `[AgentesVA] Nuevo diagnóstico — ${contact.name.replace(/[\r\n]/g,' ')}`,
        textContent,
        tags:['diagnostic-notification'],
        headers:{idempotencyKey:diagnosticEmailKey(submissionId)},
      }),
      signal: AbortSignal.timeout(5_000),
    });
    const data = await response.json().catch(()=>({}));
    if (response.status===201 && typeof data.messageId==='string') return 'sent';
    if (response.status===400 && data.code==='duplicate_parameter' && /idempoten/i.test(String(data.message||''))) return 'sent';
    console.error('[diagnostic] Email provider rejected notification', response.status);
    return 'failed';
  } catch {
    console.error('[diagnostic] Email notification unavailable');
    return 'failed';
  }
}
