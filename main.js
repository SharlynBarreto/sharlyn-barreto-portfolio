/* Sharlyn Barreto — portfolio interactions
   Hero: a real-time sunset over the ocean painted on <canvas> — layered
   sunset sky, glowing sun, moving swells, a shimmering glitter path of
   sunlight on the water, and ripples that follow the cursor. Below: the
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
     SUNSET OVER THE OCEAN (canvas)
     ========================================================================== */
  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");

  const mouse = { x: -9999, y: -9999, inside: false };
  const ripples = [];
  let lastRipple = 0;

  let W = 0, H = 0, HORIZON = 0;
  let waves = [], glitter = [], clouds = [];

  window.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.inside = mouse.y > 0 && mouse.y < r.height;
    /* cursor touching the sea leaves ripples */
    const now = performance.now();
    if (mouse.inside && mouse.y > HORIZON && now - lastRipple > 80 && ripples.length < 36) {
      ripples.push({ x: mouse.x, y: mouse.y, r: 3, a: 0.4 });
      lastRipple = now;
    }
  }, { passive: true });

  const buildScene = () => {
    W = hero.clientWidth;
    H = hero.clientHeight;
    HORIZON = H * 0.6;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* swell rows, spaced with perspective (dense at horizon, wide up close) */
    waves = [];
    const rows = 26;
    for (let i = 0; i < rows; i++) {
      const f = i / (rows - 1); // 0 horizon → 1 shore
      waves.push({
        y: HORIZON + 6 + Math.pow(f, 1.6) * (H - HORIZON - 10),
        f,
        amp: 1.2 + f * 7,
        len: 110 + f * 220 + Math.random() * 40,
        speed: (0.018 + f * 0.05) * (i % 2 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        light: i % 3 === 0, // every third row catches the sun
      });
    }

    /* the glitter path — precomputed dashes that shimmer under the sun */
    glitter = [];
    const dashes = Math.max(60, Math.min(130, Math.round(W / 11)));
    for (let i = 0; i < dashes; i++) {
      const fy = Math.pow(Math.random(), 1.4); // denser near the horizon
      glitter.push({
        fy,
        gxNorm: (Math.random() * 2 - 1) * (0.35 + fy),
        len: 3 + fy * 26,
        h: 1.2 + fy * 2.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.004,
        baseA: 0.25 + Math.random() * 0.5,
      });
    }

    clouds = [];
    for (let i = 0; i < 6; i++) {
      const puffs = [];
      const n = 4 + ((Math.random() * 4) | 0);
      for (let j = 0; j < n; j++) {
        puffs.push({
          dx: (j - n / 2) * (26 + Math.random() * 22),
          dy: (Math.random() - 0.5) * 14,
          r: 24 + Math.random() * 30,
        });
      }
      clouds.push({
        x: Math.random() * W,
        y: H * (0.06 + Math.random() * 0.22),
        speed: (0.004 + Math.random() * 0.014) * (Math.random() < 0.5 ? 1 : -1),
        puffs,
      });
    }
  };

  const drawScene = (t, scrollY, mx, my) => {
    /* --- sunset sky --- */
    const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
    sky.addColorStop(0, "#7E2B1A");
    sky.addColorStop(0.42, "#BF4E28");
    sky.addColorStop(0.72, "#EE8A3E");
    sky.addColorStop(1, "#FBC468");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, HORIZON + 1);

    /* --- sun low over the water --- */
    const sx = W * 0.77 + mx * -14;
    const sy = HORIZON - H * 0.075 + scrollY * 0.06 + my * -6;
    const breathe = 0.9 + 0.1 * Math.sin(t * 0.0007);
    ctx.globalCompositeOperation = "lighter";
    let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.4);
    g.addColorStop(0, `rgba(255,180,90,${0.5 * breathe})`);
    g.addColorStop(1, "rgba(255,180,90,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HORIZON + 1);
    ctx.globalCompositeOperation = "source-over";
    /* slightly flattened disc, the way a setting sun looks */
    g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.055);
    g.addColorStop(0, "#FFF6D6");
    g.addColorStop(0.6, "#FFDF96");
    g.addColorStop(1, "rgba(255,223,150,0)");
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.94);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, H * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* --- clouds, lit from the sun side --- */
    clouds.forEach((c) => {
      c.x += c.speed * 16;
      if (c.x > W + 160) c.x = -160;
      if (c.x < -160) c.x = W + 160;
      c.puffs.forEach((p) => {
        const px = c.x + p.dx + mx * -10;
        const py = c.y + p.dy + my * -6;
        const sunNear = Math.max(0, 1 - Math.hypot(px - sx, py - sy) / (W * 0.55));
        const cg = ctx.createRadialGradient(px, py, 0, px, py, p.r);
        cg.addColorStop(0, `rgba(${250 - sunNear * 4},${222 - sunNear * 50},${188 - sunNear * 95},0.45)`);
        cg.addColorStop(1, "rgba(250,222,188,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    /* --- a small flock crossing the sky --- */
    ctx.strokeStyle = "rgba(72,48,34,0.85)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const p = ((t * 0.000022 + i * 0.035) % 1.25) - 0.12;
      const bx = p * W * 1.2;
      const by = H * (0.14 + 0.03 * (i % 2)) + H * 0.03 * Math.sin(p * 7 + i * 2);
      const flap = 3 + 3.5 * Math.sin(t * 0.012 + i * 1.7);
      const span = 9 + (i % 3) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - span, by);
      ctx.quadraticCurveTo(bx - span * 0.4, by - flap, bx, by);
      ctx.quadraticCurveTo(bx + span * 0.4, by - flap, bx + span, by);
      ctx.stroke();
    }

    /* --- the ocean --- */
    const sea = ctx.createLinearGradient(0, HORIZON, 0, H);
    sea.addColorStop(0, "#F2A85C");
    sea.addColorStop(0.2, "#CE7D48");
    sea.addColorStop(0.48, "#8A6650");
    sea.addColorStop(0.78, "#4A5052");
    sea.addColorStop(1, "#33454B");
    ctx.fillStyle = sea;
    ctx.fillRect(0, HORIZON, W, H - HORIZON);

    /* sunlit horizon edge */
    ctx.strokeStyle = "rgba(255,220,150,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, HORIZON);
    ctx.lineTo(W, HORIZON);
    ctx.stroke();

    /* broad reflection column under the sun */
    ctx.globalCompositeOperation = "lighter";
    const col = ctx.createLinearGradient(0, HORIZON, 0, H);
    col.addColorStop(0, "rgba(255,185,95,0.32)");
    col.addColorStop(1, "rgba(255,185,95,0.04)");
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(sx - 22, HORIZON);
    ctx.lineTo(sx + 22, HORIZON);
    ctx.lineTo(sx + 95, H);
    ctx.lineTo(sx - 95, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    /* moving swells — dark rows for depth, light rows catching the sun */
    waves.forEach((wv) => {
      const swell = 2.5 * Math.sin(t * 0.0004 + wv.y * 0.05);
      ctx.strokeStyle = wv.light
        ? `rgba(255,205,130,${0.14 + wv.f * 0.1})`
        : `rgba(30,48,52,${0.16 + wv.f * 0.16})`;
      ctx.lineWidth = wv.light ? 1 + wv.f * 1.6 : 1.4 + wv.f * 2.2;
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 12) {
        const y = wv.y + swell + wv.amp * Math.sin(((x + t * wv.speed * 60) / wv.len) * Math.PI * 2 + wv.phase)
          + my * wv.f * -10;
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    /* the glitter path — dashes of sunlight shimmering on the water */
    ctx.globalCompositeOperation = "lighter";
    glitter.forEach((d) => {
      const gy = HORIZON + 4 + d.fy * (H - HORIZON - 8);
      const colHalf = 16 + (gy - HORIZON) * 0.42;
      const gx = sx + d.gxNorm * colHalf;
      const a = d.baseA * Math.max(0, Math.sin(t * d.speed * 1000 * 0.003 + d.phase));
      if (a < 0.03) return;
      ctx.fillStyle = `rgba(255,231,170,${a})`;
      ctx.fillRect(gx - d.len / 2, gy - d.h / 2, d.len, d.h);
    });

    /* cursor ripples on the sea */
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 2.1;
      rp.a *= 0.94;
      if (rp.a < 0.02) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(255,225,170,${rp.a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    /* vignette for depth */
    const v = ctx.createRadialGradient(W * 0.5, H * 0.42, Math.min(W, H) * 0.42, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    v.addColorStop(0, "rgba(58,26,14,0)");
    v.addColorStop(1, "rgba(58,26,14,0.26)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  };

  buildScene();

  if (reduceMotion) {
    drawScene(0, 0, 0, 0); // static painting, no loop
    return;
  }

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

  const frame = (now) => {
    const targetY = window.scrollY;
    smoothY = lerp(smoothY, targetY, 0.12);
    if (Math.abs(smoothY - targetY) < 0.1) smoothY = targetY;
    mx = lerp(mx, tx, 0.06);
    my = lerp(my, ty, 0.06);

    if (smoothY < H + 80) {
      drawScene(now, smoothY, mx, my);
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
      buildScene();
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
