/* Hero motion, three parts:
   1. intro: name letters spring up, the rest of the poster assembles
   2. pointer parallax: layers drift at different depths toward the cursor
   3. scroll: badge spins, portrait and type part ways as the hero leaves
   Returns a cleanup function. */
import { splitChars } from './splitText.js?v=20261103r';

export function initHero(root, { gsap, fine }) {
  if (!root) return () => {};
  const q = (s) => root.querySelector(s);
  const chars = splitChars(q('.h-name'));

  const intro = gsap.timeline({ defaults: { ease: 'back.out(1.8)' } })
    .from(q('.h-arch'), { yPercent: 40, scaleY: 0.6, transformOrigin: '50% 100%', opacity: 0, duration: 1, ease: 'expo.out' })
    .from(q('.h-photo'), { yPercent: 18, opacity: 0, duration: 1, ease: 'expo.out' }, '<0.15')
    .from(chars, { yPercent: 110, rotate: () => gsap.utils.random(-25, 25), opacity: 0, duration: 0.7, stagger: 0.04 }, 0.2)
    .from([q('.h-sprig'), q('.h-kicker')], { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.3)
    .from([q('.h-script'), q('.h-sub')], { y: 24, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, 0.8)
    .from(q('.h-swash path'), { strokeDasharray: 170, strokeDashoffset: 170, duration: 0.9, ease: 'power2.inOut' }, 1.1)
    .from(q('.h-badge'), { scale: 0, rotate: -180, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 1)
    .from(q('.h-eucalyptus'), { x: 60, y: -40, rotate: 10, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.5);

  // letters hop when hovered: a small playful reward for poking the name
  const hop = (e) => gsap.fromTo(e.currentTarget, { y: 0 }, { y: -14, rotate: gsap.utils.random(-12, 12), duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true });
  chars.forEach((c) => c.addEventListener('pointerenter', hop));

  // scroll-linked: badge spins, type and portrait drift apart while leaving
  const st = { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 };
  // badge spin is created only after the intro lands it upright; making it
  // earlier would capture the mid-intro angle and start the badge upside down
  intro.eventCallback('onComplete', () => gsap.fromTo(q('.h-badge'), { rotate: 0 }, { rotate: 360, ease: 'none', scrollTrigger: st }));
  gsap.to(q('.h-type'), { yPercent: -18, opacity: 0.2, scrollTrigger: st });
  gsap.to(q('.h-visual'), { yPercent: 10, scrollTrigger: st });

  // pointer parallax (mouse only): depth = how far a layer travels
  let off = () => {};
  if (fine) {
    const layers = [['.h-shade', -30], ['.h-eucalyptus', 26], ['.h-arch', 10], ['.h-photo', 18], ['.h-badge', 34]]
      .map(([s, d]) => ({ d, x: gsap.quickTo(q(s), 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(q(s), 'y', { duration: 0.8, ease: 'power3' }) }));
    const move = (e) => {
      const r = root.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); });
    };
    root.addEventListener('pointermove', move);
    off = () => root.removeEventListener('pointermove', move);
  }

  return () => { off(); intro.kill(); chars.forEach((c) => c.removeEventListener('pointerenter', hop)); };
}
