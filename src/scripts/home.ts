// Interactividad de la home "marketplace" (diseño AgentesVA - Home web):
// countdown, vistas Escaparate/Tienda, filtros, ordenación, comparador y CTA fija.
// CSP-safe (sin handlers inline) e idempotente entre navegaciones (View Transitions).
import { setupCounters, setupBookmarks } from './directory';

type Price = 'Gratis' | 'Freemium' | 'Pago';

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CTA_KEY = 'agentesva:cta-dismissed';

const CHIP_ACTIVE = { background: 'var(--accent)', color: 'var(--bg)', borderColor: 'var(--accent)' };
const CHIP_IDLE = { background: 'transparent', color: 'var(--fg-3)', borderColor: 'var(--line-2)' };

function paintChip(el: HTMLElement, active: boolean) {
  const s = active ? CHIP_ACTIVE : CHIP_IDLE;
  el.style.background = s.background;
  el.style.color = s.color;
  el.style.borderColor = s.borderColor;
  el.setAttribute('aria-pressed', String(active));
}

function paintSideCat(el: HTMLElement, active: boolean) {
  el.style.background = active ? 'var(--panel-2)' : 'transparent';
  el.style.color = active ? '#fff' : 'var(--fg-2)';
  el.style.borderColor = active ? 'var(--line-2)' : 'transparent';
  el.setAttribute('aria-pressed', String(active));
}

function paintSeg(el: HTMLElement, active: boolean) {
  el.style.background = active ? 'var(--accent)' : 'transparent';
  el.style.color = active ? 'var(--bg)' : 'var(--fg-3)';
  el.style.fontWeight = active ? '600' : '400';
  el.setAttribute('aria-pressed', String(active));
}

const priceRank = (p: string) => (p === 'Gratis' ? 0 : p === 'Freemium' ? 1 : 2);

// ===== Countdown (oferta del pack: termina a medianoche local) =====
let countdownTimer: ReturnType<typeof setInterval> | undefined;
// Listener global de Escape del modal: se reemplaza en cada init (View
// Transitions re-ejecuta initHome por navegación; sin esto se acumulan).
let escHandler: ((e: KeyboardEvent) => void) | undefined;

function setupCountdown() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-countdown]'));
  if (countdownTimer) clearInterval(countdownTimer);
  if (!els.length) return;
  const pad = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    const text = `${pad(h)}:${pad(m)}:${pad(s - m * 60)}`;
    els.forEach((el) => (el.textContent = text));
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

export function initHome() {
  const grid = document.getElementById('tool-grid');
  const dirBody = document.getElementById('dir-body');
  if (!grid || !dirBody) return;

  const search = document.getElementById('tool-search') as HTMLInputElement | null;
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');
  const catEl = document.getElementById('result-cat');
  const shelvesEl = document.getElementById('shelves');
  const sidebar = document.getElementById('dir-sidebar');
  const toolbar = document.getElementById('shop-toolbar');
  const chipsRow = document.getElementById('chips-row');
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;

  const chips = Array.from(document.querySelectorAll<HTMLElement>('.cat-chip'));
  const sideCats = Array.from(document.querySelectorAll<HTMLElement>('.side-cat'));
  const quickChips = Array.from(document.querySelectorAll<HTMLElement>('.quick-chip'));
  const segBtns = Array.from(document.querySelectorAll<HTMLElement>('.seg[data-layout]'));
  const viewBtns = Array.from(document.querySelectorAll<HTMLElement>('.view-btn'));
  const priceInputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-price-filter]'));
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.tool-card'));

  let layout: 'shelf' | 'shop' = 'shelf';
  let activeCat = 'Todas';
  const prices = new Set<Price>();

  const scrollToDir = () => {
    document.getElementById('directorio')?.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  };

  // ===== Filtro + render de visibilidad =====
  const render = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match =
        (activeCat === 'Todas' || card.dataset.cat === activeCat) &&
        (prices.size === 0 || prices.has(card.dataset.price as Price)) &&
        (!q || (card.dataset.search || '').includes(q));
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
    if (catEl) catEl.textContent = activeCat;

    const filterActive = !!q || activeCat !== 'Todas' || prices.size > 0;
    const showShelves = layout === 'shelf' && !filterActive;
    if (shelvesEl) shelvesEl.hidden = !showShelves;
    grid.hidden = showShelves || visible === 0;
    if (empty) empty.hidden = showShelves || visible !== 0;
  };

  const setCat = (cat: string) => {
    activeCat = cat;
    chips.forEach((c) => paintChip(c, c.dataset.chip === cat));
    sideCats.forEach((c) => paintSideCat(c, c.dataset.sideCat === cat));
    render();
  };

  const applyLayout = () => {
    const shop = layout === 'shop';
    dirBody.classList.toggle('shop', shop);
    if (sidebar) sidebar.hidden = !shop;
    if (toolbar) toolbar.hidden = !shop;
    if (chipsRow) chipsRow.hidden = shop;
    segBtns.forEach((b) => paintSeg(b, b.dataset.layout === layout));
    render();
  };

  search?.addEventListener('input', render);
  document.getElementById('search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    scrollToDir();
  });

  chips.forEach((chip) => chip.addEventListener('click', () => setCat(chip.dataset.chip || 'Todas')));
  sideCats.forEach((btn) => btn.addEventListener('click', () => setCat(btn.dataset.sideCat || 'Todas')));

  quickChips.forEach((chip) =>
    chip.addEventListener('click', () => {
      layout = 'shop';
      applyLayout();
      setCat(chip.dataset.quick || 'Todas');
      scrollToDir();
    }),
  );

  segBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      layout = btn.dataset.layout === 'shop' ? 'shop' : 'shelf';
      applyLayout();
    }),
  );

  priceInputs.forEach((input) =>
    input.addEventListener('change', () => {
      const p = input.dataset.priceFilter as Price;
      if (input.checked) prices.add(p);
      else prices.delete(p);
      render();
    }),
  );

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    prices.clear();
    priceInputs.forEach((i) => (i.checked = false));
    if (search) search.value = '';
    setCat('Todas');
  });

  // ===== Ordenación (vista Tienda) =====
  sortSelect?.addEventListener('change', () => {
    const mode = sortSelect.value;
    const num = (c: HTMLElement, k: 'orden' | 'rating') => parseFloat(c.dataset[k] || '0');
    const sorted = [...cards].sort((a, b) => {
      if (mode === 'rating') return num(b, 'rating') - num(a, 'rating');
      if (mode === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      if (mode === 'price')
        return priceRank(a.dataset.price || '') - priceRank(b.dataset.price || '') || num(a, 'orden') - num(b, 'orden');
      return num(a, 'orden') - num(b, 'orden');
    });
    sorted.forEach((c) => grid.appendChild(c));
  });

  // ===== Vista grid/lista (vista Tienda) =====
  viewBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      const list = btn.dataset.view === 'list';
      grid.classList.toggle('view-list', list);
      viewBtns.forEach((b) => paintSeg(b, b === btn));
    }),
  );

  // ===== CTA fija + comparador =====
  const ctaBar = document.getElementById('cta-bar');
  const compareBar = document.getElementById('compare-bar');
  const compareChipsEl = document.getElementById('compare-chips');
  const compareHint = document.getElementById('compare-hint');
  const compareOpenBtn = document.getElementById('compare-open');
  const overlay = document.getElementById('compare-overlay');
  const table = document.getElementById('compare-table');
  const compare: string[] = [];
  let ctaDismissed = false;
  try {
    ctaDismissed = sessionStorage.getItem(CTA_KEY) === '1';
  } catch {
    /* ignore */
  }

  const poolCard = (slug: string) => grid.querySelector<HTMLElement>(`.tool-card[data-slug="${slug}"]`);

  const updateBars = () => {
    if (compareBar) compareBar.hidden = compare.length === 0;
    if (ctaBar) ctaBar.hidden = ctaDismissed || compare.length > 0;
  };

  const paintCompareBtns = () => {
    document.querySelectorAll<HTMLElement>('[data-compare]').forEach((btn) => {
      const on = compare.includes(btn.dataset.compare || '');
      btn.style.background = on ? 'rgba(91,124,255,0.18)' : 'none';
      btn.style.borderColor = on ? 'var(--accent)' : 'transparent';
      btn.querySelector('svg')?.setAttribute('stroke', on ? 'var(--accent)' : 'var(--fg-5)');
      btn.setAttribute('aria-pressed', String(on));
    });
  };

  const renderCompareBar = () => {
    if (!compareChipsEl) return;
    compareChipsEl.textContent = '';
    compare.forEach((slug) => {
      const data = poolCard(slug)?.dataset;
      if (!data) return;
      const chip = document.createElement('span');
      chip.style.cssText = 'display: flex; align-items: center; gap: 8px; background: var(--panel-2); border: 1px solid var(--line-2); border-radius: 20px; padding: 5px 6px 5px 10px;';
      const mono = document.createElement('span');
      mono.style.cssText = `width: 20px; height: 20px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 11px; color: #fff; background: ${data.color};`;
      mono.textContent = (data.name || '').charAt(0);
      const name = document.createElement('span');
      name.style.cssText = 'font-size: 13px; color: #fff;';
      name.textContent = data.name || '';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Quitar ${data.name} de comparar`);
      remove.style.cssText = 'background: none; border: none; cursor: pointer; color: var(--fg-5); display: flex; padding: 2px; font-size: 13px; line-height: 1;';
      remove.textContent = '✕';
      remove.addEventListener('click', () => toggleCompare(slug));
      chip.append(mono, name, remove);
      compareChipsEl.appendChild(chip);
    });
    if (compareHint) compareHint.textContent = compare.length >= 3 ? 'Máximo 3' : 'Añade hasta 3';
    if (compareOpenBtn) compareOpenBtn.textContent = `Comparar ${compare.length} →`;
  };

  const toggleCompare = (slug: string) => {
    const i = compare.indexOf(slug);
    if (i >= 0) compare.splice(i, 1);
    else if (compare.length < 3) compare.push(slug);
    paintCompareBtns();
    renderCompareBar();
    updateBars();
  };

  document.querySelectorAll<HTMLElement>('[data-compare]').forEach((btn) => {
    btn.addEventListener('click', () => toggleCompare(btn.dataset.compare || ''));
  });

  document.getElementById('compare-clear')?.addEventListener('click', () => {
    compare.length = 0;
    paintCompareBtns();
    renderCompareBar();
    updateBars();
  });

  document.getElementById('cta-dismiss')?.addEventListener('click', () => {
    ctaDismissed = true;
    try {
      sessionStorage.setItem(CTA_KEY, '1');
    } catch {
      /* ignore */
    }
    updateBars();
  });

  // ===== Modal de comparación =====
  const cellBase = 'padding: 16px; border-top: 1px solid var(--line); border-left: 1px solid var(--line); text-align: center; font-size: 14px; color: var(--fg);';
  const labelBase = 'padding: 16px 0; border-top: 1px solid var(--line); font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-5); display: flex; align-items: center;';

  const buildModal = () => {
    if (!table) return;
    const items = compare.map((slug) => ({ slug, data: poolCard(slug)?.dataset })).filter((x) => x.data);
    table.style.gridTemplateColumns = `150px repeat(${Math.max(items.length, 1)}, 1fr)`;
    table.textContent = '';
    const countLabel = document.getElementById('compare-count');
    if (countLabel) countLabel.textContent = `${items.length} herramientas`;

    table.appendChild(document.createElement('div'));
    items.forEach(({ slug, data }) => {
      const head = document.createElement('div');
      head.style.cssText = 'padding: 20px 16px; border-left: 1px solid var(--line); text-align: center;';
      const mono = document.createElement('div');
      mono.style.cssText = `width: 48px; height: 48px; border-radius: 11px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-family: var(--sans); font-weight: 700; font-size: 21px; color: #fff; background: ${data!.color};`;
      mono.textContent = (data!.name || '').charAt(0);
      const name = document.createElement('div');
      name.style.cssText = 'font-family: var(--sans); font-weight: 600; font-size: 16px; color: #fff; margin-top: 10px;';
      name.textContent = data!.name || '';
      const link = document.createElement('a');
      link.href = `/herramienta/${slug}`;
      link.style.cssText = 'display: inline-block; margin-top: 10px; font-family: var(--sans); font-weight: 600; font-size: 12px; color: var(--bg); background: var(--accent); padding: 7px 14px; border-radius: 2px; text-decoration: none;';
      link.textContent = 'Ver ficha →';
      head.append(mono, name, link);
      table.appendChild(head);
    });

    const rows: [string, (d: DOMStringMap) => string][] = [
      ['Categoría', (d) => d.cat || '—'],
      ['Precio', (d) => d.price || '—'],
      ['Valoración', (d) => `★ ${d.rating || '—'}`],
      ['Ideal para', (d) => d.ideal || '—'],
    ];
    rows.forEach(([label, val]) => {
      const l = document.createElement('div');
      l.style.cssText = labelBase;
      l.textContent = label;
      table.appendChild(l);
      items.forEach(({ data }) => {
        const c = document.createElement('div');
        c.style.cssText = cellBase;
        c.textContent = val(data!);
        table.appendChild(c);
      });
    });
  };

  const closeBtn = document.getElementById('compare-close');
  const openModal = () => {
    if (!overlay || compare.length === 0) return;
    buildModal();
    overlay.hidden = false;
    if (compareBar) compareBar.hidden = true;
    closeBtn?.focus();
  };
  const closeModal = () => {
    if (!overlay) return;
    overlay.hidden = true;
    updateBars();
    compareOpenBtn?.focus();
  };

  compareOpenBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  if (escHandler) document.removeEventListener('keydown', escHandler);
  escHandler = (e) => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) closeModal();
  };
  document.addEventListener('keydown', escHandler);

  applyLayout();
  updateBars();
  setupCountdown();
  setupCounters();
  setupBookmarks();
}
