/* Sharlyn Barreto - portfolio interactions
   Only the Selected Works row needs script: arrow buttons scroll it a card
   at a time, the right-edge fade clears at the end, and the cards rise in
   once the row is on screen. Everything is guarded for reduced motion and
   works without JS (cards are visible by default). */

(() => {

    /* works row: arrow scrolling, edge fade until the end, staggered rise-in */
    const works = document.querySelector('.works');
    const row = works.querySelector('.cards');
    const wrap = works.querySelector('.cards-wrap');
    const step = () => (row.querySelector('.frame')?.getBoundingClientRect().width || 380) + 26;
    works.querySelectorAll('.works-nav button').forEach((b) =>
      b.addEventListener('click', () => row.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' })));
    const edge = () => {
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      wrap.classList.toggle('at-end', atEnd);
      works.querySelector('[data-dir="-1"]').disabled = row.scrollLeft <= 4;
      works.querySelector('[data-dir="1"]').disabled = atEnd;
    };
    row.addEventListener('scroll', edge, { passive: true }); window.addEventListener('resize', edge); edge();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still && 'IntersectionObserver' in window) {
      works.classList.add('armed');
      new IntersectionObserver((entries, io) => {
        if (entries.some((e) => e.isIntersecting)) { works.classList.add('in-view'); io.disconnect(); }
      }, { threshold: 0.15 }).observe(row);
    }
  })();
