// Interactividad del directorio de cursos (CSP-safe: sin onclick inline).
// Filtra por categoría + nivel + precio + búsqueda y gestiona los bookmarks
// (mismo localStorage que el directorio de herramientas).
const SAVED_KEY = 'agentesva:saved';

const CHIP_ACTIVE = { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' };
const CHIP_IDLE = { background: 'transparent', color: 'var(--fg-3)', borderColor: 'var(--line-2)' };

function applyChip(el: HTMLElement, active: boolean) {
  const s = active ? CHIP_ACTIVE : CHIP_IDLE;
  el.style.background = s.background;
  el.style.color = s.color;
  el.style.borderColor = s.borderColor;
  el.setAttribute('aria-pressed', String(active));
}

function setupChipGroup(selector: string, onChange: (val: string) => void) {
  const chips = Array.from(document.querySelectorAll<HTMLElement>(selector));
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.chip || '';
      chips.forEach((c) => applyChip(c, c === chip));
      onChange(val);
    });
  });
}

function setupFilter() {
  const search = document.getElementById('curso-search') as HTMLInputElement | null;
  const grid = document.getElementById('curso-grid');
  const empty = document.getElementById('curso-empty');
  const countEl = document.getElementById('curso-count');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.curso-card'));
  if (!grid) return;

  let activeCat = 'Todas';
  let activeNivel = 'Todos';
  let activePrecio = 'Todos';

  const filter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match =
        (activeCat === 'Todas' || (card.dataset.cat || '') === activeCat) &&
        (activeNivel === 'Todos' || (card.dataset.nivel || '') === activeNivel) &&
        (activePrecio === 'Todos' || (card.dataset.precio || '') === activePrecio) &&
        (!q || (card.dataset.search || '').includes(q));
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
    grid.style.display = visible === 0 ? 'none' : 'grid';
  };

  search?.addEventListener('input', filter);
  document.getElementById('curso-search-form')?.addEventListener('submit', (e) => e.preventDefault());

  setupChipGroup('.cat-chip', (v) => { activeCat = v || 'Todas'; filter(); });
  setupChipGroup('.nivel-chip', (v) => { activeNivel = v || 'Todos'; filter(); });
  setupChipGroup('.precio-chip', (v) => { activePrecio = v || 'Todos'; filter(); });
}

function setupBookmarks() {
  let saved: Set<string>;
  try { saved = new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); }
  catch { saved = new Set(); }
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-bookmark]'));
  const paint = (btn: HTMLButtonElement, on: boolean) => {
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', on ? 'var(--accent)' : 'none');
      svg.setAttribute('stroke', on ? 'var(--accent)' : 'var(--fg-5)');
    }
    btn.setAttribute('aria-pressed', String(on));
  };
  buttons.forEach((btn) => {
    const slug = btn.dataset.bookmark || '';
    paint(btn, saved.has(slug));
    btn.addEventListener('click', () => {
      if (saved.has(slug)) saved.delete(slug); else saved.add(slug);
      paint(btn, saved.has(slug));
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch { /* ignore */ }
    });
  });
}

export function initCursos() {
  setupFilter();
  setupBookmarks();
}
