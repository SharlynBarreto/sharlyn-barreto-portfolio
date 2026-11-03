/* Contact section entrance + small interactions.
   Entrance (once, on scroll): the copper wave pours in from the left, the
   headline rises word by word with "something" swinging in last, the note
   and sprig follow; contact rows slide in with their icons popping; the
   grey arch grows up from the corner and the orange tree photo settles in.
   Ongoing: the orange tree photo drifts slowly, and on mouse devices each contact
   row's icon is pulled a little toward the pointer while hovered.
   Returns a cleanup function. */
export function initContact(root, { gsap, fine }) {
  if (!root) return () => {};
  const q = (s) => root.querySelector(s), qa = (s) => [...root.querySelectorAll(s)];

  // split the headline into words (em stays one unit) for the rise
  const h2 = q('.contact-wave h2');
  h2.setAttribute('aria-label', h2.textContent.trim());
  [...h2.childNodes].forEach((n) => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((w) => {
      if (!w.trim()) { frag.append(w); return; }
      const s = Object.assign(document.createElement('span'), { className: 'cw', textContent: w });
      s.setAttribute('aria-hidden', 'true'); frag.append(s);
    });
    n.replaceWith(frag);
  });
  const em = h2.querySelector('em');
  em.setAttribute('aria-hidden', 'true'); em.classList.add('cw');

  const rows = qa('.contact-list li');
  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true } })
    .fromTo(q('.wave-bg'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'expo.inOut' })
    .from(qa('.contact-wave h2 .cw:not(em)'), { yPercent: 120, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.5)
    .from(em, { rotate: -25, scale: 0.4, opacity: 0, transformOrigin: '0% 100%', duration: 0.8, ease: 'elastic.out(1, 0.5)' }, 0.75)
    .from(q('.contact-wave p'), { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.95)
    .fromTo(q('.contact-sprig path'), { strokeDasharray: 400, strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 1)
    .from(rows, { x: 40, opacity: 0, duration: 0.6, stagger: 0.09, ease: 'power3.out' }, 0.6)
    .from(rows.map((li) => li.querySelector('svg')), { scale: 0, rotate: -90, duration: 0.6, stagger: 0.09, ease: 'back.out(2.5)' }, 0.7)
    .from(q('.contact-art'), { scale: 0.3, transformOrigin: '100% 100%', duration: 1, ease: 'expo.out' }, 0.4)
    .from(q('.contact-art img'), { scale: 1.35, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.5);

  // slow idle drift on the photo (a soft Ken Burns), so the corner feels alive
  // started after the entrance, so it drifts from the settled scale, not the intro's 1.35
  let sway;
  tl.eventCallback('onComplete', () => { sway = gsap.to(q('.contact-art img'), { scale: 1.08, xPercent: -2, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });

  // magnetic icons: pulled toward the pointer while its row is hovered
  const offs = fine ? rows.map((li) => {
    const ic = li.querySelector('svg');
    const x = gsap.quickTo(ic, 'x', { duration: 0.4, ease: 'power3' }), y = gsap.quickTo(ic, 'y', { duration: 0.4, ease: 'power3' });
    const move = (e) => { const r = ic.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.25); };
    const leave = () => { x(0); y(0); };
    li.addEventListener('pointermove', move); li.addEventListener('pointerleave', leave);
    return () => { li.removeEventListener('pointermove', move); li.removeEventListener('pointerleave', leave); };
  }) : [];

  return () => { tl.scrollTrigger?.kill(); tl.kill(); sway?.kill(); offs.forEach((f) => f()); };
}
