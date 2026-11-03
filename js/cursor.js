/* Copper cursor: a dot that tracks exactly and a ring that trails it.
   Over links/buttons the ring swells; over elements with data-cursor="View"
   it shows that word. Mouse devices only; the native cursor stays visible
   on text inputs. Returns a cleanup function. */
export function initCursor(doc, { gsap }) {
  const dot = doc.createElement('div'), ring = doc.createElement('div');
  dot.className = 'cur-dot'; ring.className = 'cur-ring';
  [dot, ring].forEach((n) => { n.setAttribute('aria-hidden', 'true'); doc.body.append(n); });
  doc.documentElement.classList.add('has-cursor');

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };

  const HOT = 'a, button, [role="tab"], [data-cursor]';
  const over = (e) => {
    const t = e.target.closest?.(HOT);
    ring.classList.toggle('is-hot', !!t);
    ring.dataset.label = t?.dataset.cursor || '';
  };
  const down = () => ring.classList.add('is-down'), up = () => ring.classList.remove('is-down');
  const leave = () => doc.documentElement.classList.add('cur-out'), enter = () => doc.documentElement.classList.remove('cur-out');

  const on = [['pointermove', move], ['pointerover', over], ['pointerdown', down], ['pointerup', up]];
  on.forEach(([t, f]) => doc.addEventListener(t, f));
  doc.documentElement.addEventListener('pointerleave', leave);
  doc.documentElement.addEventListener('pointerenter', enter);
  return () => { on.forEach(([t, f]) => doc.removeEventListener(t, f)); dot.remove(); ring.remove(); doc.documentElement.classList.remove('has-cursor'); };
}
