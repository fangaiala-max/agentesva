import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPrompt, initPromptGenerator } from '../src/scripts/prompt-generator';

describe('buildPrompt', () => {
  it('construye el framework en orden y omite campos vacíos', () => {
    expect(buildPrompt({
      role: ' Consultor SEO ',
      context: '',
      task: 'Analiza   esta web',
      restrictions: 'No inventes datos',
      format: 'Tabla',
    })).toBe('Rol: Consultor SEO\n\nTarea: Analiza esta web\n\nRestricciones: No inventes datos\n\nFormato: Tabla');
  });

  it('devuelve vacío cuando todos los campos contienen solo espacios', () => {
    expect(buildPrompt({
      role: '  ',
      context: '\n\t',
      task: '',
      restrictions: '   ',
      format: '',
    })).toBe('');
  });
});

describe('initPromptGenerator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="prompt-generator-form">
        <input name="role" value="Especialista" />
        <textarea name="context"></textarea>
        <textarea name="task">Crea un plan</textarea>
        <textarea name="restrictions"></textarea>
        <input name="format" value="Lista" />
      </form>
      <textarea id="prompt-generator-output"></textarea>
      <button id="prompt-generator-copy" type="button">Copiar prompt</button>
      <span id="prompt-generator-status"></span>`;
  });

  it('genera en el navegador y copia el resultado', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    initPromptGenerator();
    const output = document.getElementById('prompt-generator-output') as HTMLTextAreaElement;
    expect(output.value).toContain('Rol: Especialista');
    expect(output.value).toContain('Tarea: Crea un plan');
    (document.getElementById('prompt-generator-copy') as HTMLButtonElement).click();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith(output.value);
  });

  it('actualiza el resultado al escribir y al enviar sin navegar', () => {
    initPromptGenerator();
    const form = document.getElementById('prompt-generator-form') as HTMLFormElement;
    const task = form.elements.namedItem('task') as HTMLTextAreaElement;
    const output = document.getElementById('prompt-generator-output') as HTMLTextAreaElement;

    task.value = 'Resume el informe';
    task.dispatchEvent(new Event('input', { bubbles: true }));
    expect(output.value).toContain('Tarea: Resume el informe');

    task.value = 'Compara las opciones';
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    expect(output.value).toContain('Tarea: Compara las opciones');
  });

  it('exige una tarea aunque el rol esté precargado', () => {
    document.body.innerHTML = `
      <form id="prompt-generator-form">
        <input name="role" value="Especialista" />
        <textarea name="context"></textarea>
        <textarea name="task" required></textarea>
        <textarea name="restrictions"></textarea>
        <input name="format" />
      </form>
      <textarea id="prompt-generator-output"></textarea>
      <button id="prompt-generator-copy" type="button">Copiar prompt</button>
      <span id="prompt-generator-status"></span>`;
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    initPromptGenerator();

    const copy = document.getElementById('prompt-generator-copy') as HTMLButtonElement;
    expect((document.getElementById('prompt-generator-output') as HTMLTextAreaElement).value).toBe('');
    expect(copy.disabled).toBe(true);
    expect(document.getElementById('prompt-generator-status')!.textContent).toBe('Describe la tarea para generar el prompt.');
    copy.click();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('funciona sin el nodo de estado opcional', () => {
    document.getElementById('prompt-generator-status')!.remove();
    expect(() => initPromptGenerator()).not.toThrow();
    expect((document.getElementById('prompt-generator-output') as HTMLTextAreaElement).value).toContain('Tarea: Crea un plan');
  });

  it.each([
    ['formulario', '#prompt-generator-form'],
    ['salida', '#prompt-generator-output'],
    ['botón de copia', '#prompt-generator-copy'],
  ])('cede sin registrar eventos cuando falta %s', (_label, selector) => {
    document.querySelector(selector)!.remove();
    expect(() => initPromptGenerator()).not.toThrow();
  });

  it('confirma la copia y restaura la etiqueta después de 1,5 segundos', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.useFakeTimers();
    initPromptGenerator();
    const copy = document.getElementById('prompt-generator-copy') as HTMLButtonElement;

    copy.click();
    await Promise.resolve();
    expect(copy.textContent).toBe('¡Copiado!');
    vi.advanceTimersByTime(1500);
    expect(copy.textContent).toBe('Copiar prompt');
    vi.useRealTimers();
  });

  it.each([
    ['no está disponible', undefined],
    ['rechaza el permiso', { writeText: vi.fn().mockRejectedValue(new Error('denied')) }],
  ])('ofrece copia manual cuando el portapapeles %s', async (_case, clipboard) => {
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
    initPromptGenerator();
    const copy = document.getElementById('prompt-generator-copy') as HTMLButtonElement;

    copy.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(copy.textContent).toBe('Copiar prompt');
    expect(document.getElementById('prompt-generator-status')!.textContent).toBe(
      'No se pudo copiar. Selecciona el texto y cópialo manualmente.',
    );
  });
});
