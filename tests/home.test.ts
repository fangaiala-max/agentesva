import { beforeEach, describe, expect, it } from 'vitest';
import { initHome } from '../src/scripts/home';

interface CardSpec {
  slug: string;
  name: string;
  cat: string;
  price: string;
  rating: string;
  orden: number;
}

const CARDS: CardSpec[] = [
  { slug: 'chatgpt', name: 'ChatGPT', cat: 'Asistentes', price: 'Freemium', rating: '4.9', orden: 1 },
  { slug: 'claude', name: 'Claude', cat: 'Asistentes', price: 'Freemium', rating: '4.8', orden: 2 },
  { slug: 'gemini', name: 'Gemini', cat: 'Asistentes', price: 'Gratis', rating: '4.6', orden: 3 },
  { slug: 'heygen', name: 'HeyGen', cat: 'Vídeo', price: 'Pago', rating: '4.5', orden: 4 },
];

function cardHtml(c: CardSpec): string {
  return `<article class="tool-card" data-slug="${c.slug}" data-name="${c.name}" data-cat="${c.cat}"
    data-search="${(c.name + ' ' + c.cat).toLowerCase()}" data-price="${c.price}" data-rating="${c.rating}"
    data-orden="${c.orden}" data-ideal="Negocios" data-color="#123456" style="display: flex;">
    <button type="button" data-compare="${c.slug}"><svg></svg></button>
    <button type="button" data-bookmark="${c.slug}"><svg></svg></button>
  </article>`;
}

function mountHome() {
  document.body.innerHTML = `
    <form id="search-form"><input id="tool-search" type="search"></form>
    <button class="quick-chip chip" data-quick="Vídeo"></button>
    <section id="directorio">
      <span id="result-count"></span><span id="result-cat"></span>
      <button class="seg" data-layout="shelf" aria-pressed="true"></button>
      <button class="seg" data-layout="shop" aria-pressed="false"></button>
      <div id="chips-row">
        <button class="cat-chip chip" data-chip="Todas"></button>
        <button class="cat-chip chip" data-chip="Asistentes"></button>
        <button class="cat-chip chip" data-chip="Vídeo"></button>
      </div>
      <div id="dir-body">
        <aside id="dir-sidebar" hidden>
          <button class="side-cat chip" data-side-cat="Todas"></button>
          <button class="side-cat chip" data-side-cat="Vídeo"></button>
          <label><input type="checkbox" data-price-filter="Gratis"></label>
          <label><input type="checkbox" data-price-filter="Pago"></label>
          <button id="clear-filters"></button>
        </aside>
        <div>
          <div id="shelves"><div class="shelfscroll">${cardHtml(CARDS[0]).replace('data-compare="chatgpt"', 'data-compare="chatgpt" data-shelf="1"')}</div></div>
          <div id="shop-toolbar" hidden>
            <select id="sort-select">
              <option value="pop">Popularidad</option><option value="rating">Mejor valoradas</option>
              <option value="price">Gratis primero</option><option value="name">Nombre A–Z</option>
            </select>
            <button class="seg view-btn" data-view="grid"></button>
            <button class="seg view-btn" data-view="list"></button>
          </div>
          <div id="tool-grid" hidden>${CARDS.map(cardHtml).join('')}</div>
          <div id="empty-state" hidden></div>
        </div>
      </div>
    </section>
    <div id="cta-bar" hidden><span data-countdown></span><button id="cta-dismiss"></button></div>
    <div id="compare-bar" hidden>
      <div id="compare-chips"></div><span id="compare-hint"></span>
      <button id="compare-clear"></button><button id="compare-open"></button>
    </div>
    <div id="compare-overlay" hidden>
      <div><span id="compare-count"></span><button id="compare-close"></button><div id="compare-table"></div></div>
    </div>`;
  initHome();
}

const gridCards = () => Array.from(document.querySelectorAll<HTMLElement>('#tool-grid .tool-card'));
const visibleGridCards = () => gridCards().filter((c) => c.style.display !== 'none');
const byId = (id: string) => document.getElementById(id)!;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  mountHome();
});

describe('estado inicial (Escaparate)', () => {
  it('muestra estantes, oculta grid y sidebar, CTA visible', () => {
    expect(byId('shelves').hidden).toBe(false);
    expect(byId('tool-grid').hidden).toBe(true);
    expect(byId('dir-sidebar').hidden).toBe(true);
    expect(byId('cta-bar').hidden).toBe(false);
    expect(byId('result-count').textContent).toBe('4');
  });

  it('el countdown pinta HH:MM:SS en todos los [data-countdown]', () => {
    expect(document.querySelector('[data-countdown]')!.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe('filtros', () => {
  it('un chip de categoría oculta estantes y filtra el grid', () => {
    (document.querySelector('.cat-chip[data-chip="Vídeo"]') as HTMLElement).click();
    expect(byId('shelves').hidden).toBe(true);
    expect(byId('tool-grid').hidden).toBe(false);
    expect(visibleGridCards().map((c) => c.dataset.slug)).toEqual(['heygen']);
    expect(byId('result-cat').textContent).toBe('Vídeo');
  });

  it('la búsqueda sin resultados muestra el estado vacío', () => {
    const input = byId('tool-search') as HTMLInputElement;
    input.value = 'noexiste';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(byId('empty-state').hidden).toBe(false);
    expect(byId('tool-grid').hidden).toBe(true);
    expect(byId('result-count').textContent).toBe('0');
  });

  it('el filtro de precio se combina con la categoría', () => {
    const gratis = document.querySelector('[data-price-filter="Gratis"]') as HTMLInputElement;
    gratis.checked = true;
    gratis.dispatchEvent(new Event('change', { bubbles: true }));
    expect(visibleGridCards().map((c) => c.dataset.slug)).toEqual(['gemini']);
  });

  it('limpiar filtros restaura estantes y contador', () => {
    (document.querySelector('.cat-chip[data-chip="Vídeo"]') as HTMLElement).click();
    byId('clear-filters').click();
    expect(byId('shelves').hidden).toBe(false);
    expect(byId('result-count').textContent).toBe('4');
    expect(byId('result-cat').textContent).toBe('Todas');
  });
});

describe('vista Tienda', () => {
  it('el toggle muestra sidebar y toolbar y oculta chips', () => {
    (document.querySelector('.seg[data-layout="shop"]') as HTMLElement).click();
    expect(byId('dir-body').classList.contains('shop')).toBe(true);
    expect(byId('dir-sidebar').hidden).toBe(false);
    expect(byId('shop-toolbar').hidden).toBe(false);
    expect(byId('chips-row').hidden).toBe(true);
    expect(byId('tool-grid').hidden).toBe(false);
  });

  it('ordenar por "Gratis primero" y por nombre reordena el grid', () => {
    const sel = byId('sort-select') as HTMLSelectElement;
    sel.value = 'price';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(gridCards()[0].dataset.slug).toBe('gemini');
    sel.value = 'name';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(gridCards().map((c) => c.dataset.name)).toEqual(['ChatGPT', 'Claude', 'Gemini', 'HeyGen']);
  });

  it('el toggle de vista lista aplica la clase view-list', () => {
    (document.querySelector('.view-btn[data-view="list"]') as HTMLElement).click();
    expect(byId('tool-grid').classList.contains('view-list')).toBe(true);
  });

  it('un quick chip del hero salta a Tienda con la categoría activa', () => {
    (document.querySelector('.quick-chip[data-quick="Vídeo"]') as HTMLElement).click();
    expect(byId('dir-body').classList.contains('shop')).toBe(true);
    expect(byId('result-cat').textContent).toBe('Vídeo');
    expect(visibleGridCards().map((c) => c.dataset.slug)).toEqual(['heygen']);
  });
});

describe('comparador', () => {
  const compareBtn = (slug: string) =>
    document.querySelector(`#tool-grid [data-compare="${slug}"]`) as HTMLElement;

  it('admite máximo 3 y muestra la barra (ocultando la CTA)', () => {
    ['chatgpt', 'claude', 'gemini', 'heygen'].forEach((s) => compareBtn(s).click());
    expect(byId('compare-bar').hidden).toBe(false);
    expect(byId('cta-bar').hidden).toBe(true);
    expect(byId('compare-chips').children).toHaveLength(3);
    expect(byId('compare-hint').textContent).toBe('Máximo 3');
    expect(compareBtn('heygen').getAttribute('aria-pressed')).toBe('false');
  });

  it('sincroniza aria-pressed en duplicados del mismo slug (estante + grid)', () => {
    compareBtn('chatgpt').click();
    const shelfBtn = document.querySelector('#shelves [data-compare="chatgpt"]')!;
    expect(shelfBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('el modal construye la tabla y enlaza a las fichas', () => {
    compareBtn('chatgpt').click();
    compareBtn('heygen').click();
    byId('compare-open').click();
    expect(byId('compare-overlay').hidden).toBe(false);
    expect(byId('compare-count').textContent).toBe('2 herramientas');
    expect(byId('compare-table').style.gridTemplateColumns).toContain('repeat(2');
    const links = Array.from(byId('compare-table').querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/herramienta/chatgpt', '/herramienta/heygen']);
    byId('compare-close').click();
    expect(byId('compare-overlay').hidden).toBe(true);
    expect(byId('compare-bar').hidden).toBe(false);
  });

  it('vaciar limpia la selección y devuelve la CTA', () => {
    compareBtn('chatgpt').click();
    byId('compare-clear').click();
    expect(byId('compare-bar').hidden).toBe(true);
    expect(byId('cta-bar').hidden).toBe(false);
    expect(compareBtn('chatgpt').getAttribute('aria-pressed')).toBe('false');
  });
});

describe('CTA fija', () => {
  it('descartar la oculta y persiste en sessionStorage', () => {
    byId('cta-dismiss').click();
    expect(byId('cta-bar').hidden).toBe(true);
    expect(sessionStorage.getItem('agentesva:cta-dismissed')).toBe('1');
    mountHome();
    expect(byId('cta-bar').hidden).toBe(true);
  });
});
