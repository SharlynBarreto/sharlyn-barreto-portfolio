/* Experience timeline: a copper line draws across (down, on narrow
   screens) the roles as you scroll, and each role's node pops in with its
   card as the line reaches it. The line is scrubbed to scroll so it can be
   drawn back and forth. Returns a cleanup function. */
export function initTimeline(grid, { gsap, ScrollTrigger }) {
  if (!grid) return () => {};
  const line = document.createElement('span');
  line.className = 'xp-line'; line.setAttribute('aria-hidden', 'true');
  grid.prepend(line);
  const items = [...grid.querySelectorAll('.xp-item')];

  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 601px)', narrow: '(max-width: 600px)' }, ({ conditions: { wide } }) => {
    gsap.fromTo(line, { [wide ? 'scaleX' : 'scaleY']: 0 }, { [wide ? 'scaleX' : 'scaleY']: 1, ease: 'none',
      scrollTrigger: { trigger: grid, start: 'top 85%', end: 'bottom 55%', scrub: 0.5 } });
    items.forEach((it) => {
      gsap.timeline({ scrollTrigger: { trigger: it, start: 'top 80%', toggleActions: 'play none none reverse' } })
        .from(it, { '--node': 0, duration: 0.5, ease: 'back.out(3)' })
        .from(it.children, { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '<0.1');
    });
  });
  return () => { mm.revert(); line.remove(); };
}
