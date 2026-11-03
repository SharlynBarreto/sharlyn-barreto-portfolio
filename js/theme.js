/* Light/dark toggle. The theme lives on <html data-theme>, set before
   paint by the inline script in <head> (dark unless the visitor chose light). Switching plays a circular
   "sunset" wipe from the button (View Transitions API) and the button's
   sun sinks into a moon. Falls back to an instant swap. Choice persists in
   localStorage when available. Returns a cleanup function. */
export const nextTheme = (t) => (t === 'dark' ? 'light' : 'dark');

export function initTheme(btn, { still }, store = window.localStorage) {
  if (!btn) return () => {};
  const root = document.documentElement;
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-pressed', dark);
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  const apply = (t) => { root.dataset.theme = t; try { store.setItem('theme', t); } catch {} sync(); };

  const click = () => {
    const t = nextTheme(root.dataset.theme);
    if (still || !document.startViewTransition) { apply(t); return; }
    const r = btn.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    document.startViewTransition(() => apply(t));
  };
  sync();
  btn.addEventListener('click', click);
  return () => btn.removeEventListener('click', click);
}
