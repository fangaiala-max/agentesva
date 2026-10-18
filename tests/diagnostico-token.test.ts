import { describe, expect, it } from 'vitest';
import { classifyDiagnostic, type DiagnosticAnswers } from '../src/data/diagnostico';
import { signDiagnosticResult, verifyDiagnosticResultToken } from '../src/data/diagnostico-token';

const secret = 'test-signing-secret-with-32-characters';
const answers: DiagnosticAnswers = {
  businessType: 'Agencia de servicios',
  teamSize: '2_5',
  goal: 'sales',
  process: 'Seguimiento manual de nuevos leads que llegan por la web',
  frequency: 'daily',
  currentTools: 'some',
  budget: '1500_3000',
  timeline: 'one_month',
  risk: 'standard',
};

describe('token de resultado del diagnóstico', () => {
  it('verifica un resultado firmado por el servidor', () => {
    const token = signDiagnosticResult(classifyDiagnostic(answers), secret, 1_000)!;
    expect(verifyDiagnosticResultToken(token, secret, 2_000)).toMatchObject({
      resultType: 'qualified_call',
      cluster: 'sales',
      service: 'sales_automation',
    });
  });

  it('rechaza tokens manipulados, caducados o firmados con un secreto débil', () => {
    const token = signDiagnosticResult(classifyDiagnostic(answers), secret, 1_000)!;
    expect(verifyDiagnosticResultToken(`${token}x`, secret, 2_000)).toBeUndefined();
    expect(verifyDiagnosticResultToken(token, secret, 31 * 60 * 1000)).toBeUndefined();
    expect(signDiagnosticResult(classifyDiagnostic(answers), 'short')).toBeUndefined();
  });
});
