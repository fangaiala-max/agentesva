import { classifyDiagnostic, clusterFor, type DiagnosticAnswers, type DiagnosticResult } from '../data/diagnostico';
import { trackGrowthEvent } from './track';

function renderList(node: HTMLElement | null, items: readonly string[]): void {
  if (!node) return;
  node.replaceChildren(...items.map((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    return li;
  }));
}

export function renderDiagnosticPlan(root: HTMLElement, diagnostic: DiagnosticResult): void {
  const priority = root.querySelector<HTMLElement>('[data-result-priority]');
  const complexity = root.querySelector<HTMLElement>('[data-result-complexity]');
  const nextStep = root.querySelector<HTMLAnchorElement>('[data-result-next-step]');
  if (priority) priority.textContent = diagnostic.priority;
  if (complexity) complexity.textContent = diagnostic.complexity;
  renderList(root.querySelector<HTMLElement>('[data-result-opportunities]'), diagnostic.opportunities);
  renderList(root.querySelector<HTMLElement>('[data-result-reasons]'), diagnostic.reasons);
  if (nextStep) {
    nextStep.textContent = diagnostic.nextStep.label;
    nextStep.href = diagnostic.nextStep.href;
  }
}

function value(form: HTMLFormElement, name: string): string {
  const data = new FormData(form);
  return String(data.get(name) ?? '');
}

function answers(form: HTMLFormElement): DiagnosticAnswers {
  return {
    businessType: value(form, 'businessType'),
    teamSize: value(form, 'teamSize') as DiagnosticAnswers['teamSize'],
    goal: value(form, 'goal') as DiagnosticAnswers['goal'],
    process: value(form, 'process'),
    frequency: value(form, 'frequency') as DiagnosticAnswers['frequency'],
    currentTools: value(form, 'currentTools') as DiagnosticAnswers['currentTools'],
    budget: value(form, 'budget') as DiagnosticAnswers['budget'],
    timeline: value(form, 'timeline') as DiagnosticAnswers['timeline'],
    risk: value(form, 'risk') as DiagnosticAnswers['risk'],
  };
}

function wire(root: HTMLElement): void {
  if (root.dataset.diagnosticWired === '1') return;
  root.dataset.diagnosticWired = '1';

  const form = root.querySelector<HTMLFormElement>('[data-diagnostic-form]');
  const steps = Array.from(root.querySelectorAll<HTMLFieldSetElement>('[data-step]'));
  const back = root.querySelector<HTMLButtonElement>('[data-back]');
  const next = root.querySelector<HTMLButtonElement>('[data-next]');
  const finish = root.querySelector<HTMLButtonElement>('[data-finish]');
  const current = root.querySelector<HTMLElement>('[data-step-current]');
  const progress = root.querySelector<HTMLElement>('[data-progress]');
  const bar = root.querySelector<HTMLElement>('[data-progress-bar]');
  const error = root.querySelector<HTMLElement>('[data-diagnostic-error]');
  const result = root.querySelector<HTMLElement>('[data-diagnostic-result]');
  const contactForm = root.querySelector<HTMLFormElement>('[data-diagnostic-contact]');
  const contactError = root.querySelector<HTMLElement>('[data-contact-error]');
  const contactSuccess = root.querySelector<HTMLElement>('[data-contact-success]');
  const contactSubmit = root.querySelector<HTMLButtonElement>('[data-contact-submit]');
  if (!form || !steps.length || !back || !next || !finish || !current || !progress || !bar || !error || !result || !contactForm || !contactError || !contactSuccess || !contactSubmit) return;

  let index = 0;
  let started = false;
  let currentResult: ReturnType<typeof classifyDiagnostic> | null = null;
  const storageKey = 'agentesva:diagnostic:v1';

  const clearState = () => {
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
  };

  const persistState = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    try { sessionStorage.setItem(storageKey, JSON.stringify({ index, data })); } catch { /* Storage is optional. */ }
  };

  const restoreState = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { index?: number; data?: Record<string, string> } | null;
      if (!saved?.data) return;
      for (const [name, savedValue] of Object.entries(saved.data)) {
        const controls = form.elements.namedItem(name);
        if (controls instanceof RadioNodeList) {
          Array.from(controls).forEach((control) => {
            if (control instanceof HTMLInputElement) control.checked = control.value === savedValue;
          });
        } else if (controls instanceof HTMLInputElement || controls instanceof HTMLTextAreaElement) {
          controls.value = savedValue;
        }
      }
      index = Math.max(0, Math.min(steps.length - 1, Number(saved.index) || 0));
      started = index > 0;
    } catch {
      clearState();
    }
  };
  let submissionId: string | null = null;
  let submitting = false;

  const showStep = (nextIndex: number, focusControl = true) => {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    steps.forEach((step, i) => { step.hidden = i !== index; });
    current.textContent = String(index + 1);
    progress.setAttribute('aria-valuenow', String(index + 1));
    bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    back.hidden = index === 0;
    next.hidden = index === steps.length - 1;
    finish.hidden = index !== steps.length - 1;
    error.hidden = true;
    if (focusControl) {
      const focusTarget = steps[index]?.querySelector<HTMLElement>('input, textarea');
      focusTarget?.focus();
    }
  };

  const validCurrentStep = (): boolean => {
    const controls = Array.from(steps[index]!.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
    const invalid = controls.find((control) => !control.checkValidity());
    if (!invalid) return true;
    error.textContent = invalid.validity.valueMissing
      ? 'Selecciona o completa una respuesta para continuar.'
      : 'Añade un poco más de detalle para que la recomendación sea útil.';
    error.hidden = false;
    invalid.focus();
    return false;
  };

  next.addEventListener('click', () => {
    if (!validCurrentStep()) return;
    const a = answers(form);
    if (!started) {
      started = true;
      trackGrowthEvent('diagnostic_started', {
        page_type: 'diagnostic',
        placement: 'diagnostic_hero',
        cluster: a.goal ? clusterFor(a.goal) : 'general',
      });
    }
    trackGrowthEvent('diagnostic_step_completed', {
      step: index + 1,
      step_id: steps[index]!.dataset.stepId || `step_${index + 1}`,
      cluster: a.goal ? clusterFor(a.goal) : 'general',
    });
    showStep(index + 1);
    persistState();
  });

  back.addEventListener('click', () => { showStep(index - 1); persistState(); });
  form.addEventListener('input', persistState);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validCurrentStep()) return;
    const diagnostic = classifyDiagnostic(answers(form));
    currentResult = diagnostic;
    trackGrowthEvent('diagnostic_step_completed', {
      step: index + 1,
      step_id: steps[index]!.dataset.stepId || `step_${index + 1}`,
      cluster: diagnostic.cluster,
      service: diagnostic.service,
    });

    form.hidden = true;
    root.querySelector<HTMLElement>('.progress-wrap')!.hidden = true;
    root.querySelectorAll<HTMLElement>('[data-result]').forEach((node) => {
      node.hidden = node.dataset.result !== diagnostic.resultType;
    });
    renderDiagnosticPlan(result, diagnostic);
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'start' });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!currentResult || !contactForm.checkValidity()) {
      contactError.textContent = 'Completa tus datos y acepta la política de privacidad para enviar el diagnóstico.';
      contactError.hidden = false;
      contactForm.querySelector<HTMLElement>(':invalid')?.focus();
      return;
    }

    contactError.hidden = true;
    submitting = true;
    submissionId ||= crypto.randomUUID();
    contactSubmit.disabled = true;
    const original = contactSubmit.textContent;
    contactSubmit.textContent = 'Enviando…';
    const contact = new FormData(contactForm);

    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers(form),
          name: String(contact.get('name') || ''),
          email: String(contact.get('email') || ''),
          organizationName: String(contact.get('organizationName') || ''),
          role: String(contact.get('role') || ''),
          website: String(contact.get('website') || ''),
          consent: contact.get('consent') === 'on',
          source: {
            landingPage: window.location.pathname,
            referrer: document.referrer,
            ctaPlacement: new URLSearchParams(window.location.search).get('placement') || '',
            serviceIntent: new URLSearchParams(window.location.search).get('service') || '',
            utm: Object.fromEntries(Array.from(new URLSearchParams(window.location.search)).filter(([key]) => key.startsWith('utm_'))),
          },
          submissionId,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.result || typeof payload.redirectUrl !== 'string' || !payload.redirectUrl.startsWith('/gracias-diagnostico/?')) {
        throw new Error('No se pudo enviar el diagnóstico. Inténtalo de nuevo.');
      }

      currentResult = payload.result;
      trackGrowthEvent('diagnostic_completed', {
        result_type: currentResult.resultType,
        qualification_band: currentResult.qualificationBand,
        cluster: currentResult.cluster,
        service: currentResult.service,
      });
      if (currentResult.resultType === 'qualified_call') {
        trackGrowthEvent('lead_qualified', {
          result_type: currentResult.resultType,
          qualification_band: currentResult.qualificationBand,
          cluster: currentResult.cluster,
          service: currentResult.service,
        });
      }

      contactForm.hidden = true;
      contactSuccess.hidden = false;
      contactSuccess.focus();
      clearState();
      window.location.assign(payload.redirectUrl);
    } catch (submissionError) {
      submitting = false;
      contactSubmit.disabled = false;
      contactSubmit.textContent = original;
      contactError.textContent = submissionError instanceof Error ? submissionError.message : 'No se pudo enviar el diagnóstico.';
      contactError.hidden = false;
    }
  });

  root.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
    if (submitting) return;
    form.reset();
    form.hidden = false;
    root.querySelector<HTMLElement>('.progress-wrap')!.hidden = false;
    result.hidden = true;
    contactForm.reset();
    contactForm.hidden = false;
    contactSuccess.hidden = true;
    contactError.hidden = true;
    contactSubmit.disabled = false;
    contactSubmit.textContent = 'Enviar diagnóstico →';
    currentResult = null;
    submissionId = null;
    submitting = false;
    started = false;
    clearState();
    showStep(0);
  });

  root.querySelector<HTMLAnchorElement>('[data-booking-link]')?.addEventListener('click', () => {
    if (!currentResult) return;
    trackGrowthEvent('booking_started', {
      booking_provider: 'calendly',
      placement: 'diagnostic_result',
      cluster: currentResult.cluster,
      service: currentResult.service,
      qualification_band: currentResult.qualificationBand,
    });
  });

  restoreState();
  showStep(index, false);
}

export function initDiagnostic(): void {
  document.querySelectorAll<HTMLElement>('[data-diagnostic-root]').forEach(wire);
}
