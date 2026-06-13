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

  // ---------- anillos 3D de tickers (precios reales del día) ----------
  // Dos filas: una gira en un sentido, la otra al revés (rotor--rev en CSS).
  const ROWS = [
    {
      id: "ring-rotor",
      symbols: ["NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "MELI", "AMD", "NFLX", "JPM", "V"],
    },
    {
      id: "ring-rotor-2",
      symbols: ["WMT", "HD", "MCD", "NKE", "SBUX", "BA", "GE", "XOM", "CVX", "PFE", "MRK", "KO"],
    },
  ];
  // Fallback si el feed no responde (datos de muestra, no en tiempo real)
  const FALLBACK = {
    NVDA: [205.19, 204.87], AAPL: [291.13, 295.63], MSFT: [390.74, 390.34],
    AMZN: [201.6, 199.2], GOOGL: [178.3, 177.1], META: [591.7, 585.2],
    TSLA: [248.5, 252.3], MELI: [1842.0, 1820.5], AMD: [142.3, 140.8],
    NFLX: [712.4, 718.9], JPM: [224.1, 222.6], V: [308.7, 307.2],
    WMT: [98.4, 97.6], HD: [412.5, 409.2], MCD: [298.7, 300.1],
    NKE: [78.3, 79.5], SBUX: [97.6, 96.8], BA: [178.2, 175.9],
    GE: [182.4, 180.0], XOM: [114.8, 113.5], CVX: [152.3, 151.0],
    PFE: [26.4, 26.7], MRK: [98.9, 99.6], KO: [62.4, 62.1],
  };

  const ringChips = {};
  let ringSymbols = [];

  ROWS.forEach((row) => {
    const rotor = document.getElementById(row.id);
    if (!rotor) return;
    const step = 360 / row.symbols.length;
    row.symbols.forEach((sym, i) => {
      const el = document.createElement("span");
      el.className = "rtick";
      el.style.setProperty("--i", i);
      el.style.setProperty("--step", step + "deg");
      rotor.appendChild(el);
      ringChips[sym] = el;
      ringSymbols.push(sym);
    });
  });

  if (ringSymbols.length) {
    const renderChip = (sym, px, prev) => {
      const chg = prev ? ((px - prev) / prev) * 100 : 0;
      const up = chg >= 0;
      ringChips[sym].innerHTML =
        '<span class="rtick__sym">' + sym + "</span>" +
        '<span class="rtick__px">' + px.toFixed(2) + "</span>" +
        '<span class="rtick__chg ' + (up ? "up" : "down") + '">' +
        (up ? "▲ " : "▼ ") + Math.abs(chg).toFixed(2) + "%</span>";
    };

    // pinta el fallback al instante; el feed real lo pisa cuando llega
    ringSymbols.forEach((s) => { if (FALLBACK[s]) renderChip(s, FALLBACK[s][0], FALLBACK[s][1]); });

    const fetchLive = () => {
      const yahooUrl = "https://query1.finance.yahoo.com/v8/finance/spark?symbols=" +
        ringSymbols.join(",") + "&range=1d&interval=1d";
      fetch("https://corsproxy.io/?url=" + encodeURIComponent(yahooUrl))
        .then((r) => r.json())
        .then((data) => {
          ringSymbols.forEach((sym) => {
            const d = data[sym];
            if (!d || !d.close || !d.close.length) return;
            renderChip(sym, d.close[d.close.length - 1], d.chartPreviousClose);
          });
        })
        .catch(() => { /* el fallback ya está pintado */ });
    };
    fetchLive();
    setInterval(fetchLive, 120000); // refresco cada 2 min
  }

  // ---------- canvas particles (hero + manifesto) ----------
  function initParticles(canvasId, count) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, pts;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function makePoints(n) {
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.25 + 0.04,
      }));
    }
    makePoints(count);

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(62,207,142," + p.a + ")";
        ctx.fill();
      });

      // faint connecting lines between close neighbours
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "rgba(62,207,142," + (0.04 * (1 - dist / 100)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    // pause when tab is hidden (saves CPU)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { draw(); }
    });
  }
  if (!reduceMotion) {
    initParticles("hero-canvas", 70);
    initParticles("manifesto-canvas", 55);
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

  // ---------- hero intro ----------
  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro
    .to(".hero__title .line > span", { y: 0, duration: 1.2, stagger: 0.09 }, 0.15)
    .to(".hero__copy [data-reveal], .hero .console", {
      opacity: 1, y: 0, duration: 1, stagger: 0.12,
    }, 0.55)
    .to(".hero__stats", { opacity: 1, y: 0, duration: 1 }, 0.9);

  // ---------- reveals genéricos ----------
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero")) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // ---------- titulares por línea ----------
  document.querySelectorAll("[data-lines]").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1.3, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      }
    );
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
