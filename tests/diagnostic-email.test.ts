import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {notifyDiagnostic, diagnosticEmailKey} from '../src/lib/diagnostic-email';
import {classifyDiagnostic, type DiagnosticAnswers} from '../src/data/diagnostico';
const answers:DiagnosticAnswers={businessType:'QA business',teamSize:'2_5',goal:'operations',process:'TEST notification flow, not a real lead',frequency:'daily',currentTools:'some',budget:'1500_3000',timeline:'one_month',risk:'standard'};
const input={answers,result:classifyDiagnostic(answers),contact:{name:'QA Test',email:'qa@example.com'},submissionId:'test_notification_123456789'};
const request=vi.fn();
beforeEach(()=>{vi.stubEnv('BREVO_API_KEY',' test-key ');vi.stubEnv('DIAGNOSTIC_EMAIL_FROM','notificaciones@agentesva.com');vi.stubGlobal('fetch',request);request.mockReset();});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('uses the verified sender, fixed internal recipient and visitor reply-to',async()=>{
 request.mockResolvedValue(new Response(JSON.stringify({messageId:'test'}),{status:201}));
 expect(await notifyDiagnostic(input)).toBe('sent');
 const [url,init]=request.mock.calls[0];const body=JSON.parse(init.body);
 expect(url).toBe('https://api.brevo.com/v3/smtp/email');
 expect(init.headers['api-key']).toBe('test-key');
 expect(body.to).toEqual([{email:'hola@agentesva.com',name:'AgentesVA'}]);
 expect(body.sender.email).toBe('notificaciones@agentesva.com');
 expect(body.replyTo.email).toBe('qa@example.com');
 expect(body.textContent).toContain(input.submissionId);
 expect(body).not.toHaveProperty('htmlContent');
});
it('does not report success on unauthorized or malformed responses',async()=>{
 request.mockResolvedValue(new Response(JSON.stringify({code:'unauthorized'}),{status:401}));
 expect(await notifyDiagnostic(input)).toBe('failed');
 request.mockResolvedValue(new Response('{}',{status:201}));
 expect(await notifyDiagnostic(input)).toBe('failed');
});
it('handles network failures without leaking provider or contact details',async()=>{
 request.mockRejectedValue(new Error('network'));expect(await notifyDiagnostic(input)).toBe('failed');
});
it('deduplicates retries with a stable UUID and accepts only idempotency duplicate errors',async()=>{
 expect(diagnosticEmailKey(input.submissionId)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
 expect(diagnosticEmailKey(input.submissionId)).toBe(diagnosticEmailKey(input.submissionId));
 expect(diagnosticEmailKey('another')).not.toBe(diagnosticEmailKey(input.submissionId));
 request.mockResolvedValue(new Response(JSON.stringify({code:'duplicate_parameter',message:'idempotencyKey has already been used'}),{status:400}));
 expect(await notifyDiagnostic(input)).toBe('sent');
 request.mockResolvedValue(new Response(JSON.stringify({code:'duplicate_parameter',message:'Duplicate recipient'}),{status:400}));
 expect(await notifyDiagnostic(input)).toBe('failed');
});
it('requires deliberate activation and a sender on the site domain',async()=>{
 vi.stubEnv('DIAGNOSTIC_EMAIL_FROM','');expect(await notifyDiagnostic(input)).toBe('disabled');
 vi.stubEnv('DIAGNOSTIC_EMAIL_FROM','visitor@gmail.com');expect(await notifyDiagnostic(input)).toBe('failed');
 expect(request).not.toHaveBeenCalled();
});
