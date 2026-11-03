/* 3D tilt + moving glare for [data-tilt] elements (project polaroids,
   leadership photos). The element leans toward the pointer and its image
   zooms slightly; a glare layer follows the pointer. Existing CSS rotation
   (the polaroid's 3deg lean) is kept because GSAP reads it as `rotation`.
   Mouse devices only. Returns a cleanup function. */
export function initTilt(els, { gsap }, max = 10) {
  const offs = els.map((el) => {
    const glare = document.createElement('span');
    glare.className = 'tilt-glare'; glare.setAttribute('aria-hidden', 'true');
    el.append(glare);
    const img = el.querySelector('img, svg');
    gsap.set(el, { transformPerspective: 800 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height; // 0..1
      ry((nx - 0.5) * max * 2); rx((0.5 - ny) * max * 2);
      el.style.setProperty('--gx', `${nx * 100}%`); el.style.setProperty('--gy', `${ny * 100}%`);
    };
    const enter = () => { el.classList.add('is-tilting'); if (img) gsap.to(img, { scale: 1.07, duration: 0.6, ease: 'power3' }); };
    const leave = () => {
      el.classList.remove('is-tilting'); rx(0); ry(0);
      if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: 'power3' });
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); glare.remove(); };
  });
  return () => offs.forEach((f) => f());
}
