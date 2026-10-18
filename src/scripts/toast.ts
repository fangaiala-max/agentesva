export type ToastKind = 'info' | 'success' | 'warning';

type ToastOptions = {
  detail?: string;
  kind?: ToastKind;
  duration?: number;
};

const COLORS: Record<ToastKind, string> = {
  info: 'var(--accent)',
  success: 'var(--green)',
  warning: 'var(--gold)',
};

const ICONS: Record<ToastKind, string> = { info: 'i', success: '✓', warning: '!' };

function removeToast(toast: HTMLElement) {
  if (!toast.isConnected || toast.dataset.leaving !== undefined) return;
  toast.dataset.leaving = '';
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  window.setTimeout(() => toast.remove(), delay);
}

export function showToast(message: string, options: ToastOptions = {}) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const kind = options.kind ?? 'info';
  const toast = document.createElement('div');
  toast.className = 'ui-toast';
  toast.setAttribute('role', kind === 'warning' ? 'alert' : 'status');
  toast.style.setProperty('--toast-color', COLORS[kind]);

  const icon = document.createElement('span');
  icon.className = 'ui-toast__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ICONS[kind];

  const copy = document.createElement('span');
  copy.className = 'ui-toast__copy';
  const title = document.createElement('strong');
  title.textContent = message;
  copy.appendChild(title);
  if (options.detail) {
    const detail = document.createElement('span');
    detail.textContent = options.detail;
    copy.appendChild(detail);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'ui-toast__close';
  close.setAttribute('aria-label', 'Cerrar notificación');
  close.textContent = '✕';
  close.addEventListener('click', () => removeToast(toast));
  toast.append(icon, copy, close);
  region.prepend(toast);

  while (region.children.length > 3) region.lastElementChild?.remove();
  window.setTimeout(() => removeToast(toast), options.duration ?? 3600);
}
