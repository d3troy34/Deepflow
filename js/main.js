/* ============================================================
   DeepFlow landing — interacción, vanilla JS.
   Sin dependencias externas. Respeta prefers-reduced-motion.
   ============================================================ */

(function () {
  "use strict";

  const CONTACT_EMAIL = "francobales3@gmail.com";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const landingI18n = window.DeepFlowI18n || null;

  function landingLang() {
    return landingI18n && landingI18n.currentLanguage ? landingI18n.currentLanguage() : "es";
  }

  function landingText(key, fallback) {
    return landingI18n && landingI18n.t ? landingI18n.t(key, landingLang()) : fallback;
  }

  // ---------- nav scrolled state ----------
  const nav = document.getElementById("nav");
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  // ---------- theme toggle ----------
  (function () {
    if (localStorage.getItem("df-theme") !== "dark") document.body.classList.add("light");
  })();
  const themeToggle = document.getElementById("theme-toggle");
  function setToggleIcon() {
    if (!themeToggle) return;
    const li = document.body.classList.contains("light");
    themeToggle.setAttribute("aria-label", landingText(li ? "theme.toDark" : "theme.toLight", "Cambiar tema"));
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
      const subject = landingText("contact.mailSubjectPrefix", "DeepFlow — contacto de ") + (data.get("name") || "");
      const body = data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("email") + ")";
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  // ---------- hero run panel: contenido estático, traducible ----------
  // El HTML ya trae el panel en español, listo para no-JS. Si el layer de
  // i18n está disponible, lo volvemos a pintar en el idioma activo.
  const consoleBody = document.getElementById("console-body");
  const consoleState = document.getElementById("console-state");

  function renderConsole() {
    if (!consoleBody || !landingI18n || !landingI18n.consoleEvents) return;
    const events = landingI18n.consoleEvents(landingLang());
    consoleBody.innerHTML = events
      .map(
        (ev) =>
          '<div class="console__row"><span class="console__time">' + ev.t + "</span>" +
          '<span class="console__msg">' + ev.m + "</span></div>"
      )
      .join("");
    if (consoleState && landingI18n.consoleStates) {
      const states = landingI18n.consoleStates(landingLang());
      consoleState.textContent = states[states.length - 1];
    }
  }
  renderConsole();

  // ---------- anchor scroll suave, con offset para la navbar fija ----------
  const NAV_OFFSET = 70;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  // ---------- reveals genéricos (IntersectionObserver, sin librerías) ----------
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ---------- contadores [data-count] ----------
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (!isFinite(target)) return;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function setupCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count;
      });
      return;
    }
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }
  setupCounters();

  // ---------- cambio de idioma: repintar piezas dinámicas ----------
  // El i18n layer reemplaza innerHTML en [data-i18n-html] (incluye los spans
  // [data-count] de las stats), así que hay que re-observarlos.
  window.addEventListener("deepflow:languagechange", () => {
    setToggleIcon();
    renderConsole();
    setupCounters();
  });
})();
