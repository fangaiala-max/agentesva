// Flechas de los estantes de la home (AGV-10).
//
// Los estantes son carruseles con overflow-x. Con ratón no hay forma de saber
// que hay más fichas a la derecha: se veían 4 de 8. Las flechas sólo aparecen
// si realmente hay desbordamiento, y se desactivan en cada extremo.

export function setupShelves(): () => void {
  const shelves = Array.from(document.querySelectorAll<HTMLElement>('[data-shelf]'));
  const cleanups: Array<() => void> = [];

  shelves.forEach((shelf) => {
    const scroller = shelf.querySelector<HTMLElement>('[data-shelf-scroll]');
    const nav = shelf.querySelector<HTMLElement>('[data-shelf-nav]');
    const prev = shelf.querySelector<HTMLButtonElement>('[data-shelf-prev]');
    const next = shelf.querySelector<HTMLButtonElement>('[data-shelf-next]');
    if (!scroller || !nav || !prev || !next) return;

    // Avanza una "página" completa menos un poco, para dejar pista visual de
    // que la fila continúa.
    const step = () => Math.max(scroller.clientWidth * 0.85, 260);

    const sync = () => {
      const overflow = scroller.scrollWidth - scroller.clientWidth;
      nav.hidden = overflow < 8;
      if (nav.hidden) return;
      // 2px de margen: los navegadores redondean scrollLeft en pantallas HiDPI.
      prev.disabled = scroller.scrollLeft <= 2;
      next.disabled = scroller.scrollLeft >= overflow - 2;
    };

    const onPrev = () => scroller.scrollBy({ left: -step() });
    const onNext = () => scroller.scrollBy({ left: step() });

    prev.addEventListener('click', onPrev);
    next.addEventListener('click', onNext);
    scroller.addEventListener('scroll', sync, { passive: true });

    // El estante puede estar oculto al cargar (vista Tienda o filtro activo):
    // sus medidas son 0 hasta que se muestra, así que hay que re-sincronizar.
    const ro = new ResizeObserver(sync);
    ro.observe(scroller);

    sync();

    cleanups.push(() => {
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      scroller.removeEventListener('scroll', sync);
      ro.disconnect();
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
