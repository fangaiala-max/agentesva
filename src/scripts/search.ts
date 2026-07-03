// Motor de búsqueda global con Pagefind (lazy). Compartido por el modal de la
// cabecera y la página /buscar. Pagefind se importa solo al primer uso.
// CSP: requiere 'wasm-unsafe-eval' (WebAssembly) — ver vercel.json.

type ResultData = { url: string; meta: Record<string, string> & { title?: string }; excerpt: string };

// Tipo → etiqueta + color del badge (coincide con la maqueta aprobada).
const TYPE_META: Record<string, { label: string; color: string; border: string }> = {
  Herramienta: { label: 'Herramienta', color: '#4fd39a', border: '#235' },
  Curso: { label: 'Curso', color: '#c08bff', border: '#43306a' },
  Estudio: { label: 'Estudio', color: '#5b7cff', border: 'var(--line-2)' },
  Noticia: { label: 'Noticia', color: '#ffb86b', border: '#5a4326' },
  Recurso: { label: 'Recurso', color: '#4ec98a', border: '#235' },
};

let pagefindPromise: Promise<any> | null = null;
function loadPagefind(): Promise<any> {
  if (!pagefindPromise) {
    const url = '/pagefind/pagefind.js';
    // Variable + @vite-ignore: import en runtime, no lo empaqueta Vite (el bundle
    // se genera en postbuild y no existe en tiempo de compilación).
    pagefindPromise = import(/* @vite-ignore */ url);
  }
  return pagefindPromise;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string));
}

function renderResult(d: ResultData, i: number): string {
  const tipo = d.meta.tipo ?? '';
  const tm = TYPE_META[tipo];
  const color = tm?.color ?? 'var(--accent)';
  const title = d.meta.title ?? d.url;
  const badge = tm
    ? `<span class="sr-badge" style="color:${tm.color};border-color:${tm.border}">${esc(tm.label)}</span>`
    : '';
  return `<a class="sr-row" id="sr-row-${i}" href="${esc(d.url)}" role="option" aria-selected="false">
      <span class="sr-mono" style="background:${color}">${esc((title || '?').charAt(0).toUpperCase())}</span>
      <span class="sr-rowmain">
        <span class="sr-top"><span class="sr-title">${esc(title)}</span>${badge}</span>
        <span class="sr-excerpt">${d.excerpt}</span>
      </span>
    </a>`;
}

export interface SearchEngine { run: () => void; focus: () => void }

// Contrato DOM dentro de `root`:
//  [data-search-input]      input de texto
//  [data-search-results]    contenedor de resultados (role=listbox)
//  [data-search-count]      contador
//  [data-search-empty]      estado inicial "escribe para buscar"
//  [data-search-noresults]  estado "sin resultados"
//  [data-search-filter]     chips con data-value ('' = Todo)
export function createSearch(root: HTMLElement): SearchEngine {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  const results = root.querySelector<HTMLElement>('[data-search-results]');
  const count = root.querySelector<HTMLElement>('[data-search-count]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const noresults = root.querySelector<HTMLElement>('[data-search-noresults]');
  const filters = Array.from(root.querySelectorAll<HTMLElement>('[data-search-filter]'));
  const noop = { run: () => {}, focus: () => {} };
  if (!input || !results || !count || !empty || !noresults) return noop;

  let activeFilter = '';
  let timer: number | undefined;
  let seq = 0;
  let sel = -1; // índice del resultado seleccionado por teclado (-1 = ninguno)

  // Anclas de resultado actualmente renderizadas (se recalcula tras cada render).
  const rows = (): HTMLAnchorElement[] =>
    Array.from(results.querySelectorAll<HTMLAnchorElement>('.sr-row'));

  const setSel = (next: number) => {
    const rs = rows();
    if (!rs.length) {
      sel = -1;
      input.removeAttribute('aria-activedescendant');
      return;
    }
    const i = Math.max(0, Math.min(next, rs.length - 1)); // clamp en los extremos
    rs.forEach((r, idx) => {
      const on = idx === i;
      r.classList.toggle('sel', on);
      r.setAttribute('aria-selected', String(on));
    });
    sel = i;
    input.setAttribute('aria-activedescendant', rs[i].id);
    rs[i].scrollIntoView({ block: 'nearest' });
  };

  const setState = (s: 'empty' | 'results' | 'none' | 'error') => {
    empty.hidden = s !== 'empty';
    noresults.hidden = s !== 'none';
    results.hidden = !(s === 'results' || s === 'error');
    count.hidden = s !== 'results';
  };

  const run = async () => {
    sel = -1; // cada render reinicia la selección por teclado
    input.removeAttribute('aria-activedescendant');
    const q = input.value.trim();
    if (!q) { results.innerHTML = ''; count.textContent = ''; setState('empty'); return; }
    const my = ++seq;
    let pf: any;
    try { pf = await loadPagefind(); }
    catch {
      results.innerHTML = '<p class="sr-msg">La búsqueda está disponible en el sitio publicado.</p>';
      setState('error');
      return;
    }
    const search = await pf.search(q, activeFilter ? { filters: { tipo: activeFilter } } : undefined);
    if (my !== seq) return;
    const top = await Promise.all(search.results.slice(0, 12).map((r: any) => r.data()));
    if (my !== seq) return;
    if (!top.length) { results.innerHTML = ''; setState('none'); return; }
    results.innerHTML = top.map(renderResult).join('');
    const n = search.results.length;
    count.textContent = `${n} resultado${n === 1 ? '' : 's'}`;
    setState('results');
  };

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 160);
  });

  // Navegación con teclado entre resultados (↑ ↓ · ↵). El footer del modal lo anuncia.
  input.addEventListener('keydown', (e) => {
    const rs = rows();
    if (e.key === 'ArrowDown') {
      if (!rs.length) return;
      e.preventDefault();
      setSel(sel < 0 ? 0 : sel + 1);
    } else if (e.key === 'ArrowUp') {
      if (!rs.length) return;
      e.preventDefault();
      setSel(sel < 0 ? 0 : sel - 1);
    } else if (e.key === 'Enter') {
      if (!rs.length) return;
      e.preventDefault();
      const target = sel >= 0 ? rs[sel] : rs[0]; // sin selección: abre el primero
      if (target) location.assign(target.href);
    }
  });

  filters.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.value || '';
      filters.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      run();
    });
  });

  setState('empty');
  return { run, focus: () => input.focus() };
}
