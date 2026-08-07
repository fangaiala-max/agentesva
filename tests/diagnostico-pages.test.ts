import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/gracias-diagnostico.astro', 'utf8');
const client = readFileSync('src/scripts/diagnostico.ts', 'utf8');

describe('cierre del diagnóstico', () => {
  it('tiene una página noindex con expectativa, acción primaria y salida secundaria', () => {
    expect(page).toContain('noindex={true}');
    expect(page).toContain('thanksPlanFor');
    expect(page).toContain('BOOKING_URL');
    expect(page).toContain('plan.expectation');
    expect(page).toContain('plan.action.href');
    expect(page).toContain('plan.secondary.href');
  });

  it('redirige al cierre solo después de que el servidor acepta el lead', () => {
    const accepted = client.indexOf('if (!response.ok || !payload.success || !payload.result)');
    const redirect = client.indexOf('window.location.assign(diagnosticThanksUrl(currentResult))');
    expect(accepted).toBeGreaterThan(-1);
    expect(redirect).toBeGreaterThan(accepted);
  });

  it('instrumenta la reserva solo cuando existe proveedor configurado', () => {
    expect(page).toContain("data-track-event={plan.action.booking ? 'booking_started' : undefined}");
    expect(page).toContain('data-track-booking-provider="calendly"');
    expect(page).toContain('data-track-placement="diagnostic_result"');
  });
});
