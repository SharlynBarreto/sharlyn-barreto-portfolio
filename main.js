/* Sharlyn Barreto — portfolio interactions
   Hero: a real-time golden-hour meadow painted on <canvas> — layered hills,
   drifting lit clouds, sun glow, fireflies that drift toward the cursor, and
   hundreds of grass blades + wildflowers that sway in wind and bend away from
   the mouse. Below: scroll-linked scrubbed reveals and kinetic headlines.
   No dependencies. */

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
     GOLDEN-HOUR MEADOW (canvas)
     ========================================================================== */
  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");

  const mouse = { x: -9999, y: -9999, vx: 0, inside: false };
  let lastMX = null;
  window.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.inside = mouse.y > 0 && mouse.y < r.height;
    mouse.vx = lastMX === null ? 0 : e.clientX - lastMX;
    lastMX = e.clientX;
  }, { passive: true });

  let W = 0, H = 0;
  let hills = [], blades = [], flowers = [], flies = [], clouds = [];

  const GRASS_COLORS = ["#5E7048", "#6C7C5D", "#77895C", "#4F5D47", "#556647"];
  const PETALS = ["#C2603E", "#C97B8E", "#9187B0", "#D8B266", "#D98A62", "#E58FA8"];

  /* smooth rolling silhouette: base height + two sine octaves */
  const makeHill = (base, a1, f1, p1, a2, f2, p2, top, bottom, depth, rim) => ({
    y: (x) => H * (base + a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2)),
    top, bottom, depth, rim,
  });

  const buildScene = () => {
    W = hero.clientWidth;
    H = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    hills = [
      makeHill(0.60, 0.022, 0.0016, 1.1, 0.012, 0.0042, 4.0, "#A995AC", "#8E86A0", 0.08, null),
      makeHill(0.685, 0.026, 0.0013, 3.9, 0.013, 0.0038, 0.7, "#7E8F6C", "#66785A", 0.16, "rgba(242,200,137,0.5)"),
      makeHill(0.80, 0.024, 0.0011, 5.6, 0.012, 0.0035, 2.3, "#5C6D4B", "#42513B", 0.28, "rgba(242,200,137,0.35)"),
    ];
    const nearY = hills[2].y;

    blades = [];
    const count = Math.max(140, Math.min(340, Math.round(W / 4.2)));
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (W + 40) - 20;
      const surface = nearY(x);
      const rootY = surface + 8 + Math.random() * (H - surface - 4) * 0.9;
      const deepness = (rootY - surface) / Math.max(1, H - surface); // 0 crest → 1 bottom
      blades.push({
        x, rootY,
        len: (26 + Math.random() * 34) * (0.75 + deepness * 0.7),
        w: 1.6 + Math.random() * 1.7,
        color: Math.random() < 0.12 ? "#C9A45C" : GRASS_COLORS[(Math.random() * GRASS_COLORS.length) | 0],
        phase: Math.random() * Math.PI * 2,
        bend: 0,
      });
    }
    blades.sort((a, b) => a.rootY - b.rootY); // paint back-to-front

    flowers = [];
    const fCount = Math.max(10, Math.min(26, Math.round(W / 60)));
    for (let i = 0; i < fCount; i++) {
      const x = 20 + Math.random() * (W - 40);
      const surface = nearY(x);
      const rootY = surface + 14 + Math.random() * (H - surface - 10) * 0.8;
      flowers.push({
        x, rootY,
        len: 46 + Math.random() * 42,
        r: 3.2 + Math.random() * 2.4,
        color: PETALS[(Math.random() * PETALS.length) | 0],
        phase: Math.random() * Math.PI * 2,
        bend: 0,
      });
    }

    flies = [];
    for (let i = 0; i < 36; i++) {
      flies.push({
        x: Math.random() * W,
        y: H * 0.45 + Math.random() * H * 0.5,
        r: 5 + Math.random() * 4,
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2,
      });
    }

    clouds = [];
    for (let i = 0; i < 6; i++) {
      const puffs = [];
      const n = 4 + ((Math.random() * 4) | 0);
      for (let j = 0; j < n; j++) {
        puffs.push({
          dx: (j - n / 2) * (26 + Math.random() * 22),
          dy: (Math.random() - 0.5) * 16,
          r: 26 + Math.random() * 30,
        });
      }
      clouds.push({
        x: Math.random() * W,
        y: H * (0.08 + Math.random() * 0.24),
        speed: (0.004 + Math.random() * 0.014) * (Math.random() < 0.5 ? 1 : -1),
        puffs,
      });
    }
  };

  const wind = (x, t) =>
    0.28 * Math.sin(t * 0.0009 + x * 0.004) +
    0.16 * Math.sin(t * 0.0016 + x * 0.012) +
    0.30 * Math.pow(Math.sin(t * 0.00023), 3);

  /* cursor pushes vegetation aside as it sweeps the field */
  const cursorPush = (x, rootY) => {
    if (!mouse.inside || mouse.y < H * 0.45) return 0;
    const dx = x - mouse.x;
    const d = Math.abs(dx);
    if (d > 150 || Math.abs(rootY - mouse.y) > 220) return 0;
    const s = 1 - d / 150;
    return Math.sign(dx || 1) * s * s * (0.5 + Math.min(1.3, Math.abs(mouse.vx) * 0.05));
  };

  const drawScene = (t, scrollY, mx, my) => {
    /* sky */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#6E6390");
    sky.addColorStop(0.34, "#9A7D9C");
    sky.addColorStop(0.58, "#CE9187");
    sky.addColorStop(0.78, "#E8AF7E");
    sky.addColorStop(1, "#F2CE8B");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* sun + halo */
    const sx = W * 0.73 + mx * -14;
    const sy = H * 0.32 + scrollY * 0.12 + my * -8;
    const breathe = 0.9 + 0.1 * Math.sin(t * 0.0007);
    ctx.globalCompositeOperation = "lighter";
    let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.55);
    g.addColorStop(0, `rgba(247,201,137,${0.5 * breathe})`);
    g.addColorStop(1, "rgba(247,201,137,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.09);
    g.addColorStop(0, "#FFF0C8");
    g.addColorStop(0.55, "#FFE3A3");
    g.addColorStop(1, "rgba(255,227,163,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, H * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    /* clouds, lit by the sun on their near side */
    clouds.forEach((c) => {
      c.x += c.speed * 16;
      if (c.x > W + 160) c.x = -160;
      if (c.x < -160) c.x = W + 160;
      c.puffs.forEach((p) => {
        const px = c.x + p.dx + mx * -10;
        const py = c.y + p.dy + my * -6;
        const sunNear = Math.max(0, 1 - Math.hypot(px - sx, py - sy) / (W * 0.55));
        const cg = ctx.createRadialGradient(px, py, 0, px, py, p.r);
        cg.addColorStop(0, `rgba(${252 - sunNear * 6},${238 - sunNear * 30},${232 - sunNear * 60},0.5)`);
        cg.addColorStop(1, "rgba(252,238,232,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    /* hills with atmospheric depth (+ mist band between far and mid) */
    hills.forEach((hill, idx) => {
      const offY = scrollY * hill.depth + my * hill.depth * -30;
      const offX = mx * hill.depth * -46;
      ctx.beginPath();
      ctx.moveTo(-60, H + 60);
      for (let x = -60; x <= W + 60; x += 14) {
        ctx.lineTo(x + offX, hill.y(x) + offY);
      }
      ctx.lineTo(W + 60, H + 60);
      ctx.closePath();
      const hg = ctx.createLinearGradient(0, H * 0.45, 0, H);
      hg.addColorStop(0, hill.top);
      hg.addColorStop(1, hill.bottom);
      ctx.fillStyle = hg;
      ctx.fill();
      if (hill.rim) { /* dusk light catching the ridge */
        ctx.strokeStyle = hill.rim;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = -60; x <= W + 60; x += 14) {
          const y = hill.y(x) + offY;
          x === -60 ? ctx.moveTo(x + offX, y) : ctx.lineTo(x + offX, y);
        }
        ctx.stroke();
      }
      if (idx === 0) {
        const mist = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.72);
        mist.addColorStop(0, "rgba(244,228,222,0)");
        mist.addColorStop(0.5, "rgba(244,228,222,0.4)");
        mist.addColorStop(1, "rgba(244,228,222,0)");
        ctx.fillStyle = mist;
        ctx.fillRect(0, H * 0.5, W, H * 0.3);
      }
    });

    /* warm wash from the sun over the land */
    ctx.globalCompositeOperation = "lighter";
    g = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.75);
    g.addColorStop(0, "rgba(242,190,120,0.08)");
    g.addColorStop(1, "rgba(242,190,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    /* grass — each blade springs toward wind + cursor push */
    ctx.lineCap = "round";
    blades.forEach((b) => {
      const target = wind(b.x, t + b.phase * 900) + cursorPush(b.x, b.rootY);
      b.bend += (target - b.bend) * 0.085;
      const sway = b.bend * b.len * 0.45;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(b.x, b.rootY);
      ctx.quadraticCurveTo(b.x + sway * 0.35, b.rootY - b.len * 0.6, b.x + sway, b.rootY - b.len);
      ctx.stroke();
    });

    /* wildflowers */
    flowers.forEach((f) => {
      const target = wind(f.x, t + f.phase * 900) + cursorPush(f.x, f.rootY);
      f.bend += (target - f.bend) * 0.07;
      const sway = f.bend * f.len * 0.4;
      const tipX = f.x + sway, tipY = f.rootY - f.len;
      ctx.strokeStyle = "#4F5D47";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(f.x, f.rootY);
      ctx.quadraticCurveTo(f.x + sway * 0.35, f.rootY - f.len * 0.6, tipX, tipY);
      ctx.stroke();
      ctx.fillStyle = f.color;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + f.phase;
        ctx.beginPath();
        ctx.arc(tipX + Math.cos(a) * f.r, tipY + Math.sin(a) * f.r, f.r * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#E8C777";
      ctx.beginPath();
      ctx.arc(tipX, tipY, f.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    /* fireflies, gently drawn toward the cursor */
    ctx.globalCompositeOperation = "lighter";
    flies.forEach((fl) => {
      fl.x += 0.42 * Math.sin(t * 0.0006 + fl.p1);
      fl.y += 0.34 * Math.cos(t * 0.0005 + fl.p2);
      if (mouse.inside) {
        const dx = mouse.x - fl.x, dy = mouse.y - fl.y;
        const d = Math.hypot(dx, dy);
        if (d < 280 && d > 24) { fl.x += (dx / d) * 0.5; fl.y += (dy / d) * 0.5; }
      }
      if (fl.x < -20) fl.x = W + 20; if (fl.x > W + 20) fl.x = -20;
      if (fl.y < H * 0.3) fl.y = H * 0.3; if (fl.y > H + 10) fl.y = H * 0.55;
      const a = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.003 + fl.p1 * 3));
      const fg = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, fl.r);
      fg.addColorStop(0, `rgba(255,214,140,${a})`);
      fg.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,243,206,${Math.min(1, a + 0.25)})`;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";

    /* a small flock crossing the sky */
    ctx.strokeStyle = "rgba(66,58,84,0.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const p = ((t * 0.000022 + i * 0.035) % 1.25) - 0.12;
      const bx = p * W * 1.2;
      const by = H * (0.16 + 0.03 * i % 2) + H * 0.03 * Math.sin(p * 7 + i * 2);
      const flap = 3 + 3.5 * Math.sin(t * 0.012 + i * 1.7);
      const span = 9 + (i % 3) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - span, by);
      ctx.quadraticCurveTo(bx - span * 0.4, by - flap, bx, by);
      ctx.quadraticCurveTo(bx + span * 0.4, by - flap, bx + span, by);
      ctx.stroke();
    }

    /* vignette for depth */
    const v = ctx.createRadialGradient(W * 0.5, H * 0.42, Math.min(W, H) * 0.42, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    v.addColorStop(0, "rgba(46,34,60,0)");
    v.addColorStop(1, "rgba(46,34,60,0.22)");
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
