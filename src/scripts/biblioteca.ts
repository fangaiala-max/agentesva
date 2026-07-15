// Interactividad de la Biblioteca de IA (CSP-safe: sin onclick inline).
// Filtrado por catálogo + búsqueda de texto, y copiar-al-portapapeles de los prompts.

// Búsqueda insensible a tildes y mayúsculas.
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function initBiblioteca() {
  const cats = Array.from(document.querySelectorAll<HTMLElement>('.bib-cat'));
  const search = document.getElementById('bib-search') as HTMLInputElement | null;
  const items = Array.from(document.querySelectorAll<HTMLElement>('.bib-item'));
  const grupos = Array.from(document.querySelectorAll<HTMLElement>('.bib-grupo'));
  const temas = Array.from(document.querySelectorAll<HTMLElement>('.bib-tema'));
  const descs = Array.from(document.querySelectorAll<HTMLElement>('.bib-desc'));
  const empty = document.getElementById('bib-empty');
  const count = document.getElementById('bib-count');
  if (!cats.length && !items.length) return;

  let cat =
    cats.find((c) => c.getAttribute('aria-pressed') === 'true')?.dataset.cat ||
    cats[0]?.dataset.cat ||
    items[0]?.dataset.cat ||
    '';

  const apply = () => {
    const q = fold((search?.value || '').trim());
    let visible = 0;
    items.forEach((el) => {
      const match = el.dataset.cat === cat && (!q || fold(el.dataset.search || '').includes(q));
      el.hidden = !match;
      if (match) visible++;
    });
    temas.forEach((t) => {
      const anyVisible = Array.from(t.querySelectorAll<HTMLElement>('.bib-item')).some((el) => !el.hidden);
      t.hidden = !anyVisible;
    });
    grupos.forEach((g) => {
      const anyVisible = Array.from(g.querySelectorAll<HTMLElement>('.bib-item')).some((el) => !el.hidden);
      g.hidden = g.dataset.cat !== cat || !anyVisible;
    });
    descs.forEach((d) => {
      d.hidden = d.dataset.cat !== cat;
    });
    cats.forEach((c) => {
      const on = c.dataset.cat === cat;
      c.setAttribute('aria-pressed', String(on));
      c.style.background = on ? 'var(--accent)' : 'transparent';
      c.style.color = on ? 'var(--bg)' : 'var(--fg-3)';
      c.style.borderColor = on ? 'var(--accent)' : 'var(--line-2)';
    });
    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = visible ? `${visible} recurso${visible === 1 ? '' : 's'}` : '';
  };

  cats.forEach((c) =>
    c.addEventListener('click', () => {
      cat = c.dataset.cat || cat;
      apply();
    }),
  );
  search?.addEventListener('input', apply);
  apply();
}

export function initBibliotecaCopy() {
  const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.bib-copy'));
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy || '';
      const restore = btn.textContent;
      Promise.resolve(navigator.clipboard?.writeText(text))
        .then(() => {
          btn.textContent = '¡Copiado!';
          btn.style.color = 'var(--accent)';
          setTimeout(() => {
            btn.textContent = restore;
            btn.style.color = 'var(--fg-2)';
          }, 1500);
        })
        .catch(() => {
          /* clipboard no disponible: no-op */
        });
    });
  });
}
