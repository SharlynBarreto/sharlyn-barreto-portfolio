/* Counts [data-count] numbers up from 0 when they scroll into view, once.
   The final text is already in the HTML, so without JS (or with reduced
   motion) readers see the real value. Returns a cleanup function. */
export function initCounters(els, { gsap, ScrollTrigger }) {
  const triggers = els.map((el) => {
    const end = parseFloat(el.dataset.count);
    const fmt = (v) => String(Math.round(v));
    const o = { v: 0 };
    el.textContent = fmt(0);
    return ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); },
        onComplete: () => gsap.fromTo(el, { scale: 1.25 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }) }),
    });
  });
  return () => triggers.forEach((t) => t.kill());
}
