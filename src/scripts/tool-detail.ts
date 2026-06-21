// Botón "Guardar" de la ficha de herramienta (comparte estado con el directorio).
const SAVED_KEY = 'agentesva:saved';

export function initToolDetail() {
  const btn = document.getElementById('save-btn') as HTMLButtonElement | null;
  if (!btn) return;
  const slug = btn.dataset.slug || '';
  const label = document.getElementById('save-label');

  let saved: Set<string>;
  try { saved = new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); }
  catch { saved = new Set(); }

  const paint = () => {
    const on = saved.has(slug);
    if (label) label.textContent = on ? 'Guardada ✓' : 'Guardar';
    btn.setAttribute('aria-pressed', String(on));
    btn.style.borderColor = on ? 'var(--accent)' : 'var(--line-2)';
    btn.style.color = on ? 'var(--accent)' : 'var(--fg-2)';
  };
  paint();

  btn.addEventListener('click', () => {
    if (saved.has(slug)) saved.delete(slug); else saved.add(slug);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch { /* ignore */ }
    paint();
  });
}
