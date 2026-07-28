// Página /buscar: cablea el motor Pagefind (src/scripts/search.ts) y sincroniza
// el término con `?q=` para que la búsqueda sea enlazable y sobreviva a un reload.
// CSP-safe: módulo externo (script-src 'self'), sin handlers inline.
//
// Contrato DOM:
//   #buscar-root  contenedor que espera createSearch()
//   #buscar-form  formulario que envuelve el input (submit → preventDefault)
//   [data-search-input] dentro de #buscar-root
import { createSearch } from './search';

export function initBuscar() {
  const root = document.getElementById('buscar-root');
  if (!root) return;

  const engine = createSearch(root);
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');

  // Pagefind busca al teclear; un submit nativo recargaría la página. No puede
  // ser un onsubmit inline — la CSP (script-src 'self') los bloquea.
  document.getElementById('buscar-form')?.addEventListener('submit', (e) => e.preventDefault());

  // Entrada por enlace compartido: ?q=… precarga el input y lanza la búsqueda.
  const q = new URLSearchParams(location.search).get('q');
  if (q && input) {
    input.value = q;
    engine.run();
  }
  input?.focus();

  // Espejo del término en la URL, con debounce para no llenar el historial.
  let t: number | undefined;
  input?.addEventListener('input', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      const u = new URL(location.href);
      const val = input.value.trim();
      if (val) u.searchParams.set('q', val);
      else u.searchParams.delete('q');
      history.replaceState(null, '', u);
    }, 300);
  });
}
