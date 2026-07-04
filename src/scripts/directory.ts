// Interactividad del directorio "Futurista" (CSP-safe: sin onclick inline).
export const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CHIP_ACTIVE = { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' };
const CHIP_IDLE = { background: 'transparent', color: 'var(--fg-3)', borderColor: 'var(--line-2)' };

export function applyChipStyle(el: HTMLElement, active: boolean) {
  const s = active ? CHIP_ACTIVE : CHIP_IDLE;
  el.style.background = s.background;
  el.style.color = s.color;
  el.style.borderColor = s.borderColor;
  el.setAttribute('aria-pressed', String(active));
}

function setupFilter() {
  const search = document.getElementById('tool-search') as HTMLInputElement | null;
  const grid = document.getElementById('tool-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');
  const catEl = document.getElementById('result-cat');
  const chips = Array.from(document.querySelectorAll<HTMLElement>('.cat-chip'));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.tool-card'));
  if (!grid) return;

  let activeCat = 'Todas';

  const filter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.dataset.cat || '';
      const hay = card.dataset.search || '';
      const match = (activeCat === 'Todas' || cat === activeCat) && (!q || hay.includes(q));
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
    if (catEl) catEl.textContent = activeCat;
    if (empty) empty.hidden = visible !== 0;
    grid.style.display = visible === 0 ? 'none' : 'grid';
  };

  search?.addEventListener('input', filter);
  document.getElementById('search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('directorio')?.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeCat = chip.dataset.chip || 'Todas';
      chips.forEach((c) => applyChipStyle(c, c === chip));
      filter();
    });
  });
}

export function setupCounters() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  const run = (el: HTMLElement) => {
    const target = parseFloat(el.getAttribute('data-count') || '0');
    if (REDUCE) { el.textContent = target.toLocaleString('es-ES'); return; }
    const dur = 1400, start = performance.now(), ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * ease(p)).toLocaleString('es-ES');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  els.forEach((el) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(el); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(el);
  });
}

const SAVED_KEY = 'agentesva:saved';
function loadSaved(): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return new Set(Array.isArray(v) ? v : []);
  } catch { return new Set(); }
}
export function setupBookmarks() {
  const saved = loadSaved();
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-bookmark]'));
  const paint = (btn: HTMLButtonElement, on: boolean) => {
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', on ? 'var(--accent)' : 'none');
      svg.setAttribute('stroke', on ? 'var(--accent)' : 'var(--fg-5)');
    }
    btn.setAttribute('aria-pressed', String(on));
  };
  // Pinta todas las instancias del mismo slug (la home duplica tarjetas en estantes + grid).
  const paintSlug = (slug: string, on: boolean) => {
    buttons.forEach((b) => { if (b.dataset.bookmark === slug) paint(b, on); });
  };
  buttons.forEach((btn) => {
    const slug = btn.dataset.bookmark || '';
    paint(btn, saved.has(slug));
    btn.addEventListener('click', () => {
      if (saved.has(slug)) saved.delete(slug); else saved.add(slug);
      paintSlug(slug, saved.has(slug));
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch { /* ignore */ }
    });
  });
}

export function initDirectory() {
  // Con View Transitions los listeners de astro:page-load de CADA página
  // visitada persisten y se disparan en todas las navegaciones:
  // 1) la home tiene su propio motor (home.ts) y comparte ids/clases con el
  //    directorio — #dir-body solo existe en la home, así que aquí se cede;
  // 2) /herramientas y /herramientas/[categoria] registran cada una este init;
  //    el marcador en el DOM (fresco tras cada swap) evita el doble cableado.
  if (document.getElementById('dir-body')) return;
  const grid = document.getElementById('tool-grid');
  if (grid?.dataset.dirWired) return;
  if (grid) grid.dataset.dirWired = '1';
  setupFilter();
  setupCounters();
  setupBookmarks();
  // La suscripción del #pack la gestiona src/scripts/subscribe.ts (DOI + honeypot + consentimiento).
}
