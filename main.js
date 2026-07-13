/* Sharlyn Barreto — portfolio interactions
   Hero: a looping aurora night-sky video (assets/hero-aurora-*.mp4) behind
   the headline. JS picks the rendition for the viewport (1080p desktop,
   540p small screens), skips loading it entirely under
   prefers-reduced-motion (the poster stays), pauses playback offscreen,
   and drifts the frame gently with cursor and scroll. Below:
   scroll-linked scrubbed reveals and kinetic headlines. No dependencies. */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav background on scroll ---------- */
  const nav = document.getElementById("siteNav");
  const setNavState = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  /* ---------- mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- active nav link ---------- */
  const navLinks = new Map(
    [...document.querySelectorAll(".nav-links a")].map((a) => [a.getAttribute("href").slice(1), a])
  );
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinks.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ==========================================================================
     AURORA VIDEO HERO
     The <video> ships without a src; we assign one per viewport so phones
     never download the desktop rendition. Under prefers-reduced-motion no
     src is set at all and the poster frame stands in. An observer pauses
     playback whenever the hero scrolls out of view.
     ========================================================================== */
  const hero = document.getElementById("hero");
  const video = document.getElementById("heroVideo");

  let H = hero.clientHeight;

  if (!reduceMotion) {
    video.src = window.matchMedia("(max-width: 820px)").matches
      ? "assets/hero-aurora-540.mp4"
      : "assets/hero-aurora-1080.mp4";
    const tryPlay = () => video.play().catch(() => {}); // autoplay may be blocked; poster remains
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? tryPlay() : video.pause()),
        { threshold: 0.05 }
      ).observe(hero);
    } else {
      tryPlay();
    }
  }

  if (reduceMotion) return; // static page: poster hero, no scrubbed motion

  /* ==========================================================================
     SCROLL-LINKED MOTION ENGINE (scrubbed reveals + kinetic headlines)
     ========================================================================== */
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);

  const shiftFor = (el) => {
    if (el.matches(".feature-art, .about-photos, figure")) return 90;
    if (el.matches(".card, .skill-card, .edu-card, .feature-body")) return 70;
    if (el.matches(".kicker")) return 30;
    if (el.matches("h1, h2, h3")) return 52;
    return 44;
  };

  const splitWords = (h) => {
    const frag = document.createDocumentFragment();
    [...h.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) {
            frag.appendChild(document.createTextNode(piece));
          } else {
            const w = document.createElement("span");
            w.className = "w";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = piece;
            w.appendChild(wi);
            frag.appendChild(w);
          }
        });
      } else {
        const w = document.createElement("span");
        w.className = "w";
        const wi = document.createElement("span");
        wi.className = "wi";
        wi.appendChild(node.cloneNode(true));
        w.appendChild(wi);
        frag.appendChild(w);
      }
    });
    h.textContent = "";
    h.appendChild(frag);
    return [...h.querySelectorAll(".wi")];
  };

  const targets = [];
  const addTarget = (el, lag, mode) => {
    targets.push({ el, lag, mode, shift: mode === "rise" ? shiftFor(el) : 0, baseTop: 0, cur: -1 });
  };

  document.querySelectorAll(".reveal").forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const baseLag = siblings.indexOf(el) * 0.07;

    if (el.matches(".section-head")) {
      const kicker = el.querySelector(".kicker");
      if (kicker) addTarget(kicker, baseLag, "rise");
      const h2 = el.querySelector("h2");
      if (h2) splitWords(h2).forEach((wi, i) => addTarget(wi, baseLag + 0.08 + i * 0.05, "mask"));
      return;
    }
    if (el.matches("h2")) {
      splitWords(el).forEach((wi, i) => addTarget(wi, baseLag + i * 0.05, "mask"));
      return;
    }
    if (el.matches(".feature")) {
      [...el.children].forEach((part, i) => addTarget(part, baseLag + i * 0.09, "rise"));
      return;
    }
    addTarget(el, baseLag, "rise");
  });

  const measure = () => {
    const y = window.scrollY;
    targets.forEach((t) => {
      const prev = t.el.style.transform;
      t.el.style.transform = "none";
      t.baseTop = t.el.getBoundingClientRect().top + y;
      t.el.style.transform = prev;
    });
  };

  const heroContent = hero.querySelector("[data-fade]");
  const kineticLines = hero.querySelectorAll("[data-kinetic]");

  let tx = 0, ty = 0, mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let smoothY = window.scrollY;
  let vh = window.innerHeight;

  const frame = () => {
    const targetY = window.scrollY;
    smoothY = lerp(smoothY, targetY, 0.12);
    if (Math.abs(smoothY - targetY) < 0.1) smoothY = targetY;
    mx = lerp(mx, tx, 0.06);
    my = lerp(my, ty, 0.06);

    if (smoothY < H + 80) {
      video.style.transform = `translate3d(${mx * -10}px, ${smoothY * 0.24}px, 0) scale(1.06)`;
      heroContent.style.transform = `translate(${mx * -10}px, ${smoothY * 0.28}px)`;
      heroContent.style.opacity = String(clamp01(1 - (smoothY / Math.max(1, H)) * 1.5));
      kineticLines.forEach((line) => {
        const dir = parseFloat(line.dataset.kinetic);
        line.style.transform = `translateX(${smoothY * dir * 0.22 + mx * dir * 16}px)`;
      });
    }

    targets.forEach((t) => {
      const raw = (smoothY + vh * 0.96 - t.baseTop) / (vh * 0.36);
      const p = clamp01(raw - t.lag);
      if (p === t.cur) return;
      t.cur = p;
      const eased = easeOut(p);
      if (t.mode === "mask") {
        t.el.style.transform = `translateY(${(1 - eased) * 112}%)`;
      } else {
        t.el.style.transform = `translateY(${(1 - eased) * t.shift}px)`;
        t.el.style.opacity = String(easeOut(clamp01(p * 1.3)));
      }
    });

    requestAnimationFrame(frame);
  };

  measure();
  requestAnimationFrame(frame);

  /* re-measure / rebuild when layout changes */
  window.addEventListener("load", measure);
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      vh = window.innerHeight;
      H = hero.clientHeight;
      measure();
    }, 150);
  });
  if ("ResizeObserver" in window) {
    let lastH = document.body.scrollHeight;
    new ResizeObserver(() => {
      if (document.body.scrollHeight !== lastH) {
        lastH = document.body.scrollHeight;
        measure();
      }
    }).observe(document.body);
  }
})();
