/* Scroll progress bar across the top plus a floating dot nav on the right
   that marks the section in view. Built from the section ids passed in, so
   adding a section only means adding its id. Returns a cleanup function. */
export function initProgressNav(doc, { gsap, ScrollTrigger, still }, sections) {
  const bar = doc.createElement('div');
  bar.className = 'scroll-bar'; bar.setAttribute('aria-hidden', 'true');
  const nav = doc.createElement('nav');
  nav.className = 'dot-nav'; nav.setAttribute('aria-label', 'Section');
  nav.innerHTML = sections.map(([id, name]) => `<a href="#${id}" data-cursor><span>${name}</span></a>`).join('');
  doc.body.append(bar, nav);
  const links = [...nav.querySelectorAll('a')];

  const tween = gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: still ? true : 0.3 } });
  const triggers = sections.map(([id], i) => ScrollTrigger.create({
    trigger: doc.getElementById(id), start: 'top 55%', end: 'bottom 55%',
    onToggle: ({ isActive }) => {
      links[i].classList.toggle('on', isActive);
      if (isActive) links[i].setAttribute('aria-current', 'true'); else links[i].removeAttribute('aria-current');
    },
  }));
  // dot nav hides over the hero, where the poster itself is the navigation
  const show = ScrollTrigger.create({ trigger: '.hero', start: 'bottom 40%', end: 'max', onToggle: ({ isActive }) => nav.classList.toggle('show', isActive) });

  return () => { tween.kill(); triggers.forEach((t) => t.kill()); show.kill(); bar.remove(); nav.remove(); };
}
