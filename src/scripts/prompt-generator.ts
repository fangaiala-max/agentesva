export interface PromptParts {
  role: string;
  context: string;
  task: string;
  restrictions: string;
  format: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, ' ');

export function buildPrompt(parts: PromptParts): string {
  const fields = [
    ['Rol', parts.role],
    ['Contexto', parts.context],
    ['Tarea', parts.task],
    ['Restricciones', parts.restrictions],
    ['Formato', parts.format],
  ] as const;

  return fields
    .filter(([, value]) => clean(value).length > 0)
    .map(([label, value]) => `${label}: ${clean(value)}`)
    .join('\n\n');
}

export function initPromptGenerator(): void {
  const form = document.getElementById('prompt-generator-form') as HTMLFormElement | null;
  const output = document.getElementById('prompt-generator-output') as HTMLTextAreaElement | null;
  const copy = document.getElementById('prompt-generator-copy') as HTMLButtonElement | null;
  const status = document.getElementById('prompt-generator-status');
  if (!form || !output || !copy) return;

  const generate = () => {
    const data = new FormData(form);
    const parts = {
      role: String(data.get('role') ?? ''),
      context: String(data.get('context') ?? ''),
      task: String(data.get('task') ?? ''),
      restrictions: String(data.get('restrictions') ?? ''),
      format: String(data.get('format') ?? ''),
    };
    output.value = clean(parts.task) ? buildPrompt(parts) : '';
    copy.disabled = output.value.length === 0;
    if (status) status.textContent = output.value ? 'Prompt generado. Revísalo antes de copiar.' : 'Describe la tarea para generar el prompt.';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    generate();
  });

  form.addEventListener('input', generate);
  const copyLabel = copy.textContent;
  copy.addEventListener('click', async () => {
    if (!output.value) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(output.value);
      copy.textContent = '¡Copiado!';
      window.setTimeout(() => { copy.textContent = copyLabel; }, 1500);
    } catch {
      if (status) status.textContent = 'No se pudo copiar. Selecciona el texto y cópialo manualmente.';
    }
  });

  generate();
}
