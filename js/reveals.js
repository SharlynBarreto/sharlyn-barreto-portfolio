/* Scroll reveals for About and Leadership. Each plays once as its section
   enters, so content never re-hides while someone is reading.
   About: the cartouche's copper rule draws itself, the halo card fades up,
   the graduation photo pops in with a tilt, then heading, text and the
   education facts stagger in.
   Leadership: the heading slides in, each photo unveils bottom-up behind a
   clip mask with its image settling from a zoom, captions follow.
   Returns a cleanup function. */
export function initReveals(doc, { gsap }) {
  const tls = [];
  const once = (trigger, start = 'top 72%') => {
    const tl = gsap.timeline({ scrollTrigger: { trigger, start, once: true } });
    tls.push(tl); return tl;
  };

  const about = doc.querySelector('.about-band');
  /* on-screen length of the cartouche outline (viewBox 640x440 stretched to the box) */
  const ruleLength = () => {
    const svg = about.querySelector('.cartouche-frame'), path = svg?.querySelector('path');
    if (!path) return 0;
    const r = svg.getBoundingClientRect();
    return Math.ceil(path.getTotalLength() * Math.max(r.width / 640, r.height / 440)) + 20;
  };
  if (about) {
    const q = (s) => about.querySelectorAll(s);
    once(about)
      .from(q('.cartouche-frame .halo'), { opacity: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 0.8, ease: 'power3.out' })
      // the stroke is non-scaling, so dashes are in screen px: use the path's
      // length scaled to the stretched box as the dash, then draw it on
      .fromTo(q('.cartouche-frame .rule'), { strokeDasharray: ruleLength, strokeDashoffset: ruleLength },
        { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0.1)
      .from(q('.about-photo'), { scale: 0.4, rotate: -18, opacity: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.3)
      .from(q('.about-h'), { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.45)
      .from(q('.about-text'), { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.6)
      .from(q('.edu-row > div'), { y: 24, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, 0.85);
  }

  const lead = doc.querySelector('.lead');
  if (lead) {
    const frames = [...lead.querySelectorAll('.frame')];
    const tl = once(lead)
      .from(lead.querySelector('.rule-head'), { x: -60, opacity: 0, duration: 0.7, ease: 'power3.out' });
    frames.forEach((f, i) => {
      const at = 0.2 + i * 0.15;
      tl.fromTo(f.querySelector('.art'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'expo.out' }, at)
        .from(f.querySelector('.art img'), { scale: 1.3, duration: 1.2, ease: 'expo.out' }, at)
        .from(f.querySelectorAll('.cap > *'), { y: 16, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, at + 0.35);
    });
  }
  return () => tls.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}
