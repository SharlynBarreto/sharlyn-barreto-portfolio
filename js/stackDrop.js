/* Stack "drop into place". When a panel's tiles come into view (or a tab
   is picked) they fall from above, each landing in its own grid slot with
   a squash-and-bounce, staggered left to right. The grid stays the layout,
   so nothing ever ends up messy.
   On mouse devices tiles can also be grabbed and flung; on release they
   spring back to their slot. Returns a cleanup function. */
export function initStackDrop(section, { gsap, ScrollTrigger, Draggable, fine }) {
  if (!section) return () => {};
  const panels = [...section.querySelectorAll('.stack-panel')];
  let seen = false;

  const drop = (panel) => {
    const lis = [...panel.querySelectorAll('.tiles li')];
    gsap.killTweensOf(lis);
    gsap.timeline()
      .fromTo(lis, { y: () => -gsap.utils.random(260, 420), rotate: () => gsap.utils.random(-30, 30), opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.7, ease: 'bounce.out', stagger: { each: 0.06, from: 'start' } })
      // squash on landing: each tile flattens a touch as it hits, then recovers
      .fromTo(lis.map((li) => li.querySelector('.blob')), { scaleY: 1, scaleX: 1 },
        { keyframes: [{ scaleY: 0.78, scaleX: 1.18, duration: 0.09 }, { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' }],
          stagger: 0.06 }, 0.42);
  };

  // first drop when the section scrolls in; tabs replay it afterwards
  const st = ScrollTrigger.create({ trigger: section, start: 'top 70%', once: true,
    onEnter: () => { seen = true; drop(panels.find((p) => !p.hidden) || panels[0]); } });
  const mo = new MutationObserver((recs) => recs.forEach((r) => { if (seen && !r.target.hidden) drop(r.target); }));
  panels.forEach((p) => mo.observe(p, { attributes: true, attributeFilter: ['hidden'] }));
  if (!seen) panels.forEach((p) => gsap.set(p.querySelectorAll('.tiles li'), { opacity: 0 }));

  // fling and snap home (mouse only, so touch scrolling is never captured)
  const drags = fine && Draggable ? panels.flatMap((p) => Draggable.create(p.querySelectorAll('.tiles li'), {
    zIndexBoost: true,
    onPress() { gsap.to(this.target, { scale: 1.12, rotate: gsap.utils.random(-8, 8), duration: 0.2 }); },
    onRelease() { gsap.to(this.target, { x: 0, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }); },
  })) : [];

  return () => { st.kill(); mo.disconnect(); drags.forEach((d) => d.kill()); };
}
