import { describe, expect, it } from 'vitest';

describe('entorno DOM de pruebas', () => {
  it('simula como exitosa la carga externa desactivada', () => {
    const settings = (
      window as typeof window & {
        happyDOM: {
          settings: {
            enableJavaScriptEvaluation: boolean;
            handleDisabledFileLoadingAsSuccess: boolean;
          };
        };
      }
    ).happyDOM.settings;

    expect(settings.enableJavaScriptEvaluation).toBe(false);
    expect(settings.handleDisabledFileLoadingAsSuccess).toBe(true);
  });
});
