/* ============================================================
   DeepFlow landing — interacción y scroll animations
   GSAP + ScrollTrigger + Lenis. Con fallback sin motion.
   ============================================================ */

(function () {
  "use strict";

  const CONTACT_EMAIL = "francobales3@gmail.com";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  // ---------- nav scrolled state (se actualiza en el tick de Lenis si está activo) ----------
  const nav = document.getElementById("nav");
  function updateNav(scrollY) {
    nav.classList.toggle("is-scrolled", scrollY > 24);
  }
  updateNav(0);

  // ---------- theme toggle ----------
  (function () {
    if (localStorage.getItem("df-theme") === "light") document.body.classList.add("light");
  })();
  const themeToggle = document.getElementById("theme-toggle");
  function setToggleIcon() {
    if (!themeToggle) return;
    const li = document.body.classList.contains("light");
    themeToggle.innerHTML = li
      ? '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13.5 8.7A6 6 0 0 1 7.3 2.5a6 6 0 1 0 6.2 6.2z" fill="currentColor"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.06 1.06M11.84 11.84l1.06 1.06M3.1 12.9l1.06-1.06M11.84 4.16l1.06-1.06" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  }
  setToggleIcon();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("light");
      localStorage.setItem("df-theme", document.body.classList.contains("light") ? "light" : "dark");
      setToggleIcon();
    });
  }

  // ---------- contact form → mailto ----------
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = "DeepFlow — contacto de " + (data.get("name") || "");
      const body = data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("email") + ")";
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }


  // ---------- canvas particles — Bloomberg terminal vibe ----------
  function initParticles(canvasId, count, floaterCount) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, pts, scanY = 0;
    const isHero = canvasId === "hero-canvas";
    // banda superior libre para que nada se cruce con la navbar (solo el hero la necesita)
    const TOP_SAFE = isHero ? 96 : 0;
    // cuántas filas de datos flotantes muestra esta sección
    const nFloaters = floaterCount || 0;

    // capas flotantes; crosshair solo en el hero
    let floaters = [], crosshair = null;

    const GLYPHS    = ["+", "−", "%", "▲", "▼", "×", "↑", "↓"];
    const NUM_FRAGS = [
      "+28%", "−1%", "+1.2%", "−0.4%", "+12.4%", "−2.8%",
      "VOL", "24.3M", "1.2B", "842M", "4.2", "1.8", "2.5", "0.7",
    ];
    const DATA_ROWS = [
      "NVDA   205.19   ▲ 2.34   +1.15%   VOL 24.3M",
      "BID 204.90   ASK 205.20   SPREAD 0.30",
      "52W H: 276.30   52W L: 102.18   BETA 1.65",
      "EPS $4.82   MKT CAP 5.04T   DIV 0.04%",
      "RSI 14: 58.3   MACD: +1.24   VOL 31.2%",
      "AAPL   291.13   ▲ 5.48   +1.92%   P/E 32.4x",
      "YTD +68.4%   30D VOL 31.2%   SHORT 1.2%",
      "MSFT   478.02   ▼ 1.18   −0.25%   VOL 18.7M",
      "TSLA   412.55   ▲ 9.30   +2.30%   VOL 92.1M",
      "VOL 1.24B   AVG 30D 842M   REL 1.47x",
      "Δ +28.4%   3M +11.2%   6M −4.6%   1Y +68%",
      "GOOGL  198.44   ▲ 0.92   +0.47%   VOL 14.2M",
      "FCF $74.3B   ROE 31.5%   NET MARGIN 28.9%",
      "AMZN   223.71   ▼ 0.64   −0.29%   VOL 27.5M",
    ];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;

      // filas de datos flotantes (subconjunto) — pocas y repartidas
      if (nFloaters > 0) {
        const rows = DATA_ROWS.slice(0, nFloaters);
        const band = (H - TOP_SAFE) / rows.length;
        floaters = rows.map((text, i) => ({
          text,
          x: Math.random() * W,
          y: TOP_SAFE + band * i + Math.random() * band * 0.7,
          vx: (Math.random() - 0.5) * 0.09,
          vy: (Math.random() - 0.5) * 0.07,
          a: Math.random() * 0.12 + 0.08,
        }));
      }

      // crosshair solo en el hero
      if (isHero) {
        crosshair = { x: W * 0.5, y: H * 0.55, vx: 0.07, vy: 0.04, t: 0 };
      }
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function makePoints(n) {
      pts = Array.from({ length: n }, () => {
        const t = Math.random();
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.5 + 0.3,
          a: Math.random() * 0.28 + 0.08,
          type: t < 0.58 ? "dot" : t < 0.8 ? "glyph" : "num",
          char: t < 0.8
            ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            : NUM_FRAGS[Math.floor(Math.random() * NUM_FRAGS.length)],
          amber: Math.random() < 0.22,
        };
      });
    }
    makePoints(count);

    let raf;
    function draw() {
      var li = document.body.classList.contains("light");
      var am = li ? "140,80,10" : "232,179,75";
      var gr = li ? "16,110,68" : "62,207,142";
      ctx.clearRect(0, 0, W, H);

      if (isHero) {
        // scanline (no entra en la banda de la navbar)
        scanY += 0.55;
        if (scanY > H || scanY < TOP_SAFE) scanY = TOP_SAFE;
        ctx.fillStyle = "rgba(" + gr + "," + (li ? 0.09 : 0.055) + ")";
        ctx.fillRect(0, scanY, W, 2);

        // horizontal price grid (amber) — arranca debajo de la navbar
        ctx.lineWidth = 0.5;
        for (let row = 1; row <= 5; row++) {
          const gy = TOP_SAFE + ((H - TOP_SAFE) / 6) * row;
          ctx.strokeStyle = "rgba(" + am + "," + (li ? 0.22 : 0.14) + ")";
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(W, gy);
          ctx.stroke();
        }

        // crosshair (amber, blinking) — se mantiene debajo de la navbar
        if (crosshair) {
          crosshair.x += crosshair.vx; crosshair.y += crosshair.vy;
          if (crosshair.x < 0 || crosshair.x > W) crosshair.vx *= -1;
          if (crosshair.y < TOP_SAFE || crosshair.y > H) crosshair.vy *= -1;
          crosshair.t = (crosshair.t + 0.04) % (Math.PI * 2);
          const ca = (Math.sin(crosshair.t) * 0.5 + 0.5) * (li ? 0.28 : 0.18) + (li ? 0.10 : 0.07);
          ctx.strokeStyle = "rgba(" + am + "," + ca + ")";
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(crosshair.x - 20, crosshair.y); ctx.lineTo(crosshair.x + 20, crosshair.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(crosshair.x, crosshair.y - 20); ctx.lineTo(crosshair.x, crosshair.y + 20); ctx.stroke();
          ctx.beginPath(); ctx.arc(crosshair.x, crosshair.y, 2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(" + am + "," + (ca * 1.8) + ")"; ctx.stroke();
        }
      }

      // filas de datos flotantes (en hero y en el resto de secciones)
      floaters.forEach((f) => {
        f.x += f.vx; f.y += f.vy;
        if (f.x < -620) f.x = W + 20;
        if (f.x > W + 20) f.x = -620;
        if (f.y < TOP_SAFE) f.y = H + 10;
        if (f.y > H + 10) f.y = TOP_SAFE;
        ctx.font = "10px 'JetBrains Mono',monospace";
        ctx.fillStyle = "rgba(" + am + "," + f.a + ")";
        ctx.fillText(f.text, f.x, f.y);
      });

      // particle field
      const top = isHero ? TOP_SAFE : 0;
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < top) p.y = H; if (p.y > H) p.y = top;
        const color = p.amber ? "rgba(" + am + "," + p.a + ")" : "rgba(" + gr + "," + p.a + ")";
        if (p.type === "dot") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        } else {
          ctx.font = (p.type === "num" ? "9" : "10") + "px 'JetBrains Mono',monospace";
          ctx.fillStyle = color; ctx.fillText(p.char, p.x, p.y);
        }
      });

      // neighbour connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "rgba(" + gr + "," + (0.09 * (1 - dist / 90)) + ")";
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { draw(); }
    });
  }
  if (!reduceMotion) {
    // hero: menos cosas flotando para que no confunda
    initParticles("hero-canvas", 60, 5);
    // resto de secciones: pocas, sutiles y blurred (vía CSS)
    initParticles("manifesto-canvas", 38, 3);
    initParticles("solves-canvas", 26, 3);
    initParticles("sample-canvas", 26, 3);
    initParticles("contact-canvas", 26, 3);
  }

  // ---------- hero console (simulación de un run) ----------
  const consoleBody = document.getElementById("console-body");
  const consoleState = document.getElementById("console-state");

  const EVENTS = [
    { t: "00:00.4", m: 'run iniciado · <span class="accent">NVDA</span> · paquete de trabajo creado' },
    { t: "00:03.1", m: "ingesta: SEC/EDGAR · 10-K, 10-Q, 8-K" },
    { t: "00:09.8", m: "ingesta: FMP · Yahoo · Finnhub · news · macro" },
    { t: "00:21.5", m: "normalización → CanonicalResearchPacket" },
    { t: "01:02.0", m: 'gates: datos faltantes <span class="ok">PASS</span> · canaries <span class="ok">PASS</span>' },
    { t: "01:14.3", m: 'gates: consistencia <span class="ok">PASS</span> · source lineage <span class="ok">PASS</span>' },
    { t: "02:38.9", m: "valuación: DCF · SOTP · reverse DCF · peers" },
    { t: "03:50.2", m: 'price targets calculados · <span class="warn">workbook.xlsx</span> generado' },
    { t: "05:06.7", m: "síntesis narrativa con guardrails determinísticos" },
    { t: "07:42.1", m: "memo: IC brief · bull/bear · catalysts · riesgos" },
    { t: "08:55.4", m: 'publishability: <span class="ok">PUBLISHABLE ✓</span>' },
    { t: "09:12.0", m: 'artifacts: <span class="accent">final_memo.pdf</span> · .html · .md · .json' },
  ];

  const STATES = [
    "ingiriendo datos…",
    "normalizando paquete…",
    "corriendo gates de calidad…",
    "valuando…",
    "redactando memo…",
    "run completo · esperando decisión humana",
  ];

  function runConsole() {
    if (!consoleBody) return;
    consoleBody.innerHTML = "";
    let i = 0;
    const tick = () => {
      if (i >= EVENTS.length) {
        if (consoleState) consoleState.textContent = STATES[STATES.length - 1];
        setTimeout(runConsole, 9000);
        return;
      }
      const ev = EVENTS[i];
      const row = document.createElement("div");
      row.className = "console__row";
      row.innerHTML = '<span class="console__time">' + ev.t + "</span>" +
                      '<span class="console__msg">' + ev.m + "</span>";
      consoleBody.appendChild(row);
      if (consoleState) {
        consoleState.textContent = STATES[Math.min(Math.floor(i / 2), STATES.length - 2)];
      }
      i++;
      setTimeout(tick, reduceMotion ? 0 : 600 + Math.random() * 500);
    };
    tick();
  }
  runConsole();

  // ---------- sin GSAP: mostrar todo y salir ----------
  if (!hasGsap || reduceMotion) {
    document.documentElement.classList.add("no-motion");
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".hero__title .line > span").forEach((el) => {
      el.style.transform = "none";
    });
    document.querySelectorAll(".step").forEach((el) => el.classList.add("is-active"));
    window.addEventListener("scroll", () => updateNav(window.scrollY), { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- smooth scroll (Lenis) ----------
  let lenisInstance = null;
  if (typeof window.Lenis !== "undefined") {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,   // keep native on mobile — more reliable
    });
    lenisInstance = lenis;

    // Update nav via Lenis scroll event (avoids fighting with wheel interception)
    lenis.on("scroll", ({ scroll }) => {
      updateNav(scroll);
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const hash = a.getAttribute("href");
        if (hash === "#") return;
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70, duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        }
      });
    });
  } else {
    // Fallback: native scroll for nav
    window.addEventListener("scroll", () => updateNav(window.scrollY), { passive: true });
  }

  // ---------- typing utilities ----------
  function typewriteEl(el, delay, speed, onDone) {
    const tmp = document.createElement("div");
    tmp.innerHTML = el.innerHTML.trim();
    const tokens = [];

    const walk = (node) => {
      if (node.nodeType === 3) {
        [...node.textContent].forEach((ch) => tokens.push({ ch }));
      } else if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        tokens.push({ open: tag });
        node.childNodes.forEach(walk);
        tokens.push({ close: tag });
      }
    };
    tmp.childNodes.forEach(walk);

    gsap.set(el, { opacity: 1, y: 0 });
    el.innerHTML = "";
    let idx = 0;

    function build() {
      let h = "", stack = [];
      for (let i = 0; i < idx; i++) {
        const t = tokens[i];
        if (t.open)  { h += "<" + t.open + ">"; stack.push(t.open); }
        else if (t.close) { h += "</" + t.close + ">"; stack.pop(); }
        else h += t.ch;
      }
      while (stack.length) h += "</" + stack.pop() + ">";
      return h;
    }

    function tick() {
      const done = idx >= tokens.length;
      el.innerHTML = build() + (done ? "" : '<span class="type-cursor" aria-hidden="true"></span>');
      if (!done) { idx++; setTimeout(tick, speed); }
      else if (onDone) setTimeout(onDone, 180);
    }
    setTimeout(tick, delay);
  }

  function charRevealEl(el, charDelay, onDone) {
    const tmp = document.createElement("div");
    tmp.innerHTML = el.innerHTML;
    let out = "";

    tmp.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        [...node.textContent].forEach((ch) => { out += "<span class='ch'>" + ch + "</span>"; });
      } else {
        const tag = node.tagName.toLowerCase();
        out += "<" + tag + ">";
        [...node.textContent].forEach((ch) => { out += "<span class='ch'>" + ch + "</span>"; });
        out += "</" + tag + ">";
      }
    });
    el.innerHTML = out;
    gsap.set(el, { y: 0 }); // revelar DESPUÉS de reemplazar innerHTML (chars en opacity:0)

    const spans = el.querySelectorAll(".ch");
    gsap.set(spans, { opacity: 0 });
    gsap.to(spans, { opacity: 1, duration: 0.001, stagger: charDelay / 1000 });
    if (onDone) setTimeout(onDone, spans.length * charDelay + 120);
  }

  // ---------- hero intro (typing) ----------
  // Los .line > span arrancan en translateY(110%) por CSS → invisible hasta que charRevealEl los revela
  gsap.set(".hero .eyebrow, .hero__sub, .hero__cta, .hero .console, .hero__stats", { opacity: 0, y: 0 });

  const titleLines = gsap.utils.toArray(".hero__title .line > span");

  function typeTitleLines(idx) {
    if (idx >= titleLines.length) {
      typewriteEl(document.querySelector(".hero .eyebrow"), 0, 28);
      setTimeout(() => typewriteEl(document.querySelector(".hero__sub"), 0, 7), 350);
      gsap.to(".hero__cta",    { opacity: 1, duration: 0.8, delay: 0.55, ease: "power3.out" });
      gsap.to(".hero .console",{ opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: "power3.out" });
      gsap.to(".hero__stats",  { opacity: 1, y: 0, duration: 0.8, delay: 1.05, ease: "power3.out" });
      return;
    }
    charRevealEl(titleLines[idx], 26, () => typeTitleLines(idx + 1));
  }
  setTimeout(() => typeTitleLines(0), 250);

  // ---------- reveals genéricos ----------
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero")) return;
    const isText = el.matches("p, h2, h3, h4, .eyebrow");
    if (isText) {
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: () => typewriteEl(el, 0, 16),
      });
    } else {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    }
  });

  // ---------- titulares data-lines ----------
  document.querySelectorAll("[data-lines]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: "top 80%", once: true,
      onEnter: () => typewriteEl(el, 0, 20),
    });
  });

  // ---------- proceso: horizontal pinned scroll ----------
  // La sección se clava y el scroll vertical desliza los 7 panels hacia la derecha.
  // Solo en pantallas anchas; en mobile el track cae a columna (CSS) sin pin.
  const procMM = gsap.matchMedia();
  procMM.add("(min-width: 860px)", () => {
    const track = document.getElementById("process-track");
    const panels = gsap.utils.toArray(".pstep");
    const counter = document.getElementById("proc-current");
    const tip = document.getElementById("proc-tip");
    const chartWrap = document.querySelector(".process__chartwrap");
    if (!track || !panels.length) return;

    // El trazo y el dot se manejan con una sola var --p (progreso 0..1),
    // ambos relativos al mismo ancho → quedan siempre pegados, sin cacheo.
    const drawChart = (progress) => {
      if (!chartWrap) return;
      chartWrap.style.setProperty("--p", progress);
      if (tip) tip.classList.toggle("is-on", progress > 0.001);
    };
    drawChart(0);

    const distance = () => track.scrollWidth - window.innerWidth;

    let activeIdx = -1;
    const setActive = (idx) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      panels.forEach((p, i) => p.classList.toggle("is-active", i === idx));
      if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
    };
    setActive(0);

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".process",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (panels.length - 1));
          setActive(idx);
          drawChart(self.progress);
        },
      },
    });

    return () => { gsap.set(track, { clearProps: "x" }); };
  });

  // ---------- contadores ----------
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });

  // ---------- artifacts: las cards caen a medida que se scrollea ----------
  const mstackCards = gsap.utils.toArray(".mstack__card");
  if (mstackCards.length) {
    const fallTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".mstack",
        start: "top 95%",
        end: "top 40%",
        scrub: 0.6,
      },
    });
    mstackCards.forEach((card, i) => {
      fallTl.from(card, {
        y: -180,
        opacity: 0,
        rotation: i % 2 ? 10 : -10,
        duration: 1,
        ease: "power2.in", // acelera al caer, como gravedad
      }, i * 0.55);
    });
  }

  // ---------- memo tilt ----------
  const memoPage = document.querySelector(".memo__page");
  if (memoPage) {
    gsap.fromTo(memoPage,
      { rotateX: 6, rotateY: -8, y: 60 },
      {
        rotateX: 2, rotateY: -3, y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".memo",
          start: "top 90%",
          end: "top 30%",
          scrub: 0.6,
        },
      }
    );
  }
})();
