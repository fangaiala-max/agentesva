// Suscripción a la newsletter (cliente). CSP-safe: script externo (script-src 'self').
// Cablea TODOS los bloques marcados con [data-subscribe-root] del documento, así que
// vale para la landing /newsletter, el formulario inline del footer y el #pack de la home.
//
// Estructura esperada dentro de cada [data-subscribe-root]:
//   form[data-subscribe] (data-list="newsletter")
//     input[data-subscribe-email]    (email, requerido)
//     input[data-subscribe-hp]       (honeypot oculto; si trae valor → bot)
//     input[data-subscribe-consent]  (checkbox; si existe, es obligatorio — RGPD)
//     button[data-subscribe-submit]
//   [data-subscribe-success]         (oculto; se muestra tras enviar)
//   [data-subscribe-error]           (oculto; mensaje de error)
import { track } from './track';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wire(root: HTMLElement) {
  if (root.dataset.subscribeWired) return;
  root.dataset.subscribeWired = '1';

  const form = root.querySelector<HTMLFormElement>('form[data-subscribe]');
  const email = root.querySelector<HTMLInputElement>('[data-subscribe-email]');
  const submit = root.querySelector<HTMLButtonElement>('[data-subscribe-submit]');
  if (!form || !email || !submit) return;

  const hp = root.querySelector<HTMLInputElement>('[data-subscribe-hp]');
  const consent = root.querySelector<HTMLInputElement>('[data-subscribe-consent]');
  const ok = root.querySelector<HTMLElement>('[data-subscribe-success]');
  const err = root.querySelector<HTMLElement>('[data-subscribe-error]');
  const list = form.dataset.list || 'newsletter';

  const showErr = (msg: string) => {
    if (err) {
      err.hidden = false;
      err.textContent = msg;
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (err) err.hidden = true;

    const value = email.value.trim();
    if (!EMAIL_RE.test(value)) return showErr('Introduce un email válido.');
    if (consent && !consent.checked) return showErr('Marca la casilla para aceptar la política de privacidad.');

    // Honeypot relleno → simula éxito sin enviar nada (los bots no se enteran).
    if (hp && hp.value) {
      form.hidden = true;
      if (ok) ok.hidden = false;
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'Enviando…';
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          list,
          consent: consent ? consent.checked : undefined,
          company: hp ? hp.value : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo completar la suscripción.');
      }
      form.hidden = true;
      if (ok) ok.hidden = false;
      track('newsletter_submit', { list });
    } catch (e2) {
      submit.disabled = false;
      submit.textContent = original;
      showErr((e2 as Error).message);
    }
  });
}

export function initSubscribe() {
  document.querySelectorAll<HTMLElement>('[data-subscribe-root]').forEach(wire);
}
