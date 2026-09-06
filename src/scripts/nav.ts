// Navegación móvil (AGV-14). Hasta 900px la nav principal es un panel
// desplegable; por encima, el <nav> inline de siempre y este código no hace nada
// visible. CSP-safe: sin handlers inline.

const OPEN = 'data-open';

export function setupNav(): () => void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return () => {};

  const isOpen = () => nav.hasAttribute(OPEN);

  const setOpen = (open: boolean) => {
    nav.toggleAttribute(OPEN, open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', document.documentElement.lang === 'en' ? (open ? 'Close menu' : 'Open menu') : (open ? 'Cerrar menú' : 'Abrir menú'));
  };

  const close = () => {
    if (!isOpen()) return;
    setOpen(false);
    toggle.focus();
  };

  const onToggle = (e: MouseEvent) => {
    e.stopPropagation();
    const open = !isOpen();
    setOpen(open);
    // Al abrir con teclado, llevar el foco al primer enlace del panel.
    if (open) nav.querySelector<HTMLAnchorElement>('a')?.focus();
  };

  // Esc cierra, y con Tab fuera del panel también: el menú no debe quedarse
  // abierto tapando contenido cuando el foco ya está en otro sitio.
  const onKeydown = (e: KeyboardEvent) => {
    if(e.key==='Escape'){nav.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d=>{d.open=false;d.querySelector<HTMLElement>('summary')?.focus();});}
    if (e.key === 'Escape') close();
  };

  const onFocusIn = (e: FocusEvent) => {
    const t = e.target as Node | null;
    if (!t || nav.contains(t) || toggle.contains(t)) return;
    nav.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d=>d.open=false);
    if (isOpen()) setOpen(false);
  };

  // Tocar fuera cierra. Navegar dentro también: con View Transitions el DOM se
  // reemplaza, pero si el destino es un ancla de la misma página no se dispara
  // `astro:page-load` y el panel se quedaría abierto.
  const onDocClick = (e: MouseEvent) => {
    const t = e.target as Node | null;
    if (!t) return;
    if(!nav.contains(t)||(t as HTMLElement).closest?.('a'))nav.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d=>d.open=false);
    if(!isOpen()) return;
    if (nav.contains(t)) {
      if ((t as HTMLElement).closest?.('a')) setOpen(false);
      return;
    }
    if (!toggle.contains(t)) setOpen(false);
  };

  // Si se agranda la ventana con el panel abierto, la nav vuelve a ser inline:
  // hay que limpiar el estado para no dejar atributos incoherentes.
  const mq = window.matchMedia('(max-width: 900px)');
  const onChange = () => { if (!mq.matches) setOpen(false); };

  toggle.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onDocClick);
  document.addEventListener('focusin', onFocusIn);
  mq.addEventListener('change', onChange);

  setOpen(false);

  return () => {
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('focusin', onFocusIn);
    mq.removeEventListener('change', onChange);
  };
}
