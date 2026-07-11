(function () {
  "use strict";

  const CONTACT_EMAIL = "francobales3@gmail.com";
  const root = document.documentElement;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopHoverQuery = window.matchMedia("(hover: hover)");
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const landingI18n = window.DeepFlowI18n || null;
  const disposers = [];
  let animationMedia = null;
  let scrubTween = null;
  let navObserver = null;

  function on(target, eventName, handler, options) {
    if (!target || !target.addEventListener) return;
    target.addEventListener(eventName, handler, options);
    disposers.push(function () {
      target.removeEventListener(eventName, handler, options);
    });
  }

  function currentLanguage() {
    return landingI18n && landingI18n.currentLanguage
      ? landingI18n.currentLanguage()
      : "es";
  }

  function text(key, fallback) {
    return landingI18n && landingI18n.t
      ? landingI18n.t(key, currentLanguage())
      : fallback;
  }

  function storedTheme() {
    try {
      return localStorage.getItem("df-theme");
    } catch (_error) {
      return null;
    }
  }

  function setTheme(theme, persist) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;
    document.body.classList.toggle("light", next === "light");
    if (persist) {
      try {
        localStorage.setItem("df-theme", next);
      } catch (_error) {
        // The theme still works for the current session.
      }
    }
    updateThemeLabel();
  }

  function updateThemeLabel() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const isDark = root.dataset.theme === "dark";
    button.setAttribute(
      "aria-label",
      text(isDark ? "theme.toLight" : "theme.toDark", "Cambiar tema"),
    );
  }

  const themeToggle = document.getElementById("theme-toggle");
  on(themeToggle, "click", function () {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemTheme = function (event) {
    if (!storedTheme()) setTheme(event.matches ? "dark" : "light", false);
  };
  on(colorSchemeQuery, "change", handleSystemTheme);
  setTheme(root.dataset.theme || (colorSchemeQuery.matches ? "dark" : "light"), false);

  const nav = document.getElementById("nav");
  const hero = document.querySelector(".hero");
  if (nav && hero && "IntersectionObserver" in window) {
    navObserver = new IntersectionObserver(
      function (entries) {
        const entry = entries[0];
        nav.classList.toggle("is-scrolled", entry.intersectionRatio < 0.9);
      },
      { threshold: [0, 0.9, 1] },
    );
    navObserver.observe(hero);
  } else if (nav) {
    nav.classList.add("is-scrolled");
  }

  const navToggle = document.getElementById("nav-toggle");
  const primaryNavigation = document.getElementById("primary-navigation");
  const mobileMenuQuery = window.matchMedia("(max-width: 960px)");
  const menuBackground = Array.from(document.querySelectorAll(".site-main, .footer"));

  function setMenu(open) {
    if (!navToggle) return;
    const nextOpen = Boolean(open && mobileMenuQuery.matches);
    document.body.classList.toggle("nav-open", nextOpen);
    navToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    menuBackground.forEach(function (region) {
      region.toggleAttribute("inert", nextOpen);
    });
    if (primaryNavigation) {
      if (mobileMenuQuery.matches) {
        primaryNavigation.setAttribute("aria-hidden", nextOpen ? "false" : "true");
      } else {
        primaryNavigation.removeAttribute("aria-hidden");
      }
    }
    const label = navToggle.querySelector(".sr-only");
    if (label) {
      label.textContent = nextOpen
        ? text("nav.menuClose", "Cerrar menú")
        : text("nav.menuOpen", "Abrir menú");
    }
  }

  on(navToggle, "click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  on(mobileMenuQuery, "change", function () {
    setMenu(false);
  });

  if (primaryNavigation) {
    primaryNavigation.querySelectorAll("a").forEach(function (link) {
      on(link, "click", function () {
        setMenu(false);
      });
    });
  }

  on(document, "keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      setMenu(false);
      if (navToggle) navToggle.focus();
    }
  });

  function setupCarousel() {
    const carousel = document.querySelector("[data-evidence-carousel]");
    if (!carousel) return;
    const tabs = Array.from(carousel.querySelectorAll("[data-carousel-tab]"));
    const panels = Array.from(carousel.querySelectorAll("[data-carousel-panel]"));
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const tablist = carousel.querySelector(".evidence-carousel__tabs");
    let activeIndex = 0;

    function show(index, moveFocus) {
      const previousIndex = activeIndex;
      activeIndex = (index + panels.length) % panels.length;
      const wrapsForward = previousIndex === panels.length - 1 && activeIndex === 0 && index > previousIndex;
      const direction = index > previousIndex || wrapsForward ? "forward" : "back";
      carousel.dataset.carouselDirection = direction;
      carousel.dataset.carouselActive = String(activeIndex);
      if (tablist) tablist.style.setProperty("--tab-x", String(activeIndex * 100) + "%");
      tabs.forEach(function (tab, tabIndex) {
        const active = tabIndex === activeIndex;
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.setAttribute("tabindex", active ? "0" : "-1");
        if (active && moveFocus) tab.focus();
      });
      panels.forEach(function (panel, panelIndex) {
        const active = panelIndex === activeIndex;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    }

    tabs.forEach(function (tab, index) {
      on(tab, "click", function () {
        show(index, false);
      });
      on(tab, "keydown", function (event) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          show(activeIndex + 1, true);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          show(activeIndex - 1, true);
        }
        if (event.key === "Home") {
          event.preventDefault();
          show(0, true);
        }
        if (event.key === "End") {
          event.preventDefault();
          show(panels.length - 1, true);
        }
      });
    });

    on(previous, "click", function () {
      show(activeIndex - 1, false);
    });
    on(next, "click", function () {
      show(activeIndex + 1, false);
    });
    show(0, false);
  }

  function setupHeroBriefParallax() {
    const stage = document.querySelector("[data-hero-brief-stage]");
    if (!stage || !desktopHoverQuery.matches || reduceMotionQuery.matches) return;
    const pieces = [
      [stage.querySelector(".hero-brief__thesis--back"), 0.42],
      [stage.querySelector(".hero-brief__thesis--middle"), 0.68],
      [stage.querySelector(".hero-brief__sheet"), 1],
    ].filter(function (piece) { return piece[0]; });
    if (!pieces.length) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function paint() {
      frame = 0;
      pieces.forEach(function (piece) {
        const node = piece[0];
        const depth = piece[1];
        node.style.setProperty("--brief-x", (x * depth).toFixed(1) + "px");
        node.style.setProperty("--brief-y", (y * depth).toFixed(1) + "px");
      });
    }

    function queuePaint() {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }

    function reset() {
      x = 0;
      y = 0;
      queuePaint();
    }

    on(stage, "pointermove", function (event) {
      if (event.pointerType !== "mouse" || reduceMotionQuery.matches) return;
      const rect = stage.getBoundingClientRect();
      x = Math.max(-8, Math.min(8, ((event.clientX - rect.left) / rect.width - 0.5) * 16));
      y = Math.max(-6, Math.min(6, ((event.clientY - rect.top) / rect.height - 0.5) * 12));
      queuePaint();
    });

    on(stage, "pointerleave", reset);
    on(window, "blur", reset);
    on(reduceMotionQuery, "change", reset);
  }

  function setupRoadmapAccordion() {
    const accordion = document.querySelector("[data-roadmap-accordion]");
    if (!accordion) return;
    const panels = Array.from(accordion.querySelectorAll("[data-roadmap-panel]"));
    const roadmapHoverQuery = window.matchMedia("(min-width: 1081px) and (hover: hover)");
    let activeIndex = roadmapHoverQuery.matches ? -1 : 0;

    function activate(index, moveFocus) {
      activeIndex = index < 0 ? -1 : (index + panels.length) % panels.length;
      panels.forEach(function (panel, panelIndex) {
        const active = panelIndex === activeIndex;
        const button = panel.querySelector("button");
        const controlledContent = Array.from(
          panel.querySelectorAll(".roadmap-panel__body, .roadmap-panel__guard"),
        );
        panel.classList.toggle("is-active", active);
        controlledContent.forEach(function (content) {
          content.setAttribute("aria-hidden", active ? "false" : "true");
        });
        if (button) {
          button.setAttribute("aria-expanded", active ? "true" : "false");
          button.setAttribute(
            "aria-controls",
            controlledContent.map(function (content) { return content.id; }).join(" "),
          );
          if (active && moveFocus) button.focus();
        }
      });
    }

    function nextIndex(direction) {
      if (activeIndex < 0) return direction > 0 ? 0 : panels.length - 1;
      return activeIndex + direction;
    }

    panels.forEach(function (panel, index) {
      const button = panel.querySelector("button");
      on(button, "click", function () {
        activate(index, false);
      });
      on(button, "focus", function () {
        activate(index, false);
      });
      on(panel, "pointerenter", function () {
        if (roadmapHoverQuery.matches) activate(index, false);
      });
      on(button, "keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          activate(nextIndex(1), true);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          activate(nextIndex(-1), true);
        }
      });
    });

    on(accordion, "pointerleave", function () {
      if (roadmapHoverQuery.matches && !accordion.matches(":focus-within")) {
        activate(-1, false);
      }
    });

    on(roadmapHoverQuery, "change", function (event) {
      activate(event.matches ? -1 : 0, false);
    });

    activate(activeIndex, false);
  }

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    if (!form) return;

    form.querySelectorAll("input, textarea").forEach(function (field) {
      on(field, "input", function () {
        field.removeAttribute("aria-invalid");
        if (status) status.textContent = "";
      });
    });

    on(form, "submit", function (event) {
      event.preventDefault();
      const fields = Array.from(form.querySelectorAll("input, textarea"));
      fields.forEach(function (field) {
        if (field.validity.valid) field.removeAttribute("aria-invalid");
        else field.setAttribute("aria-invalid", "true");
      });

      if (!form.checkValidity()) {
        if (status) status.textContent = text("contact.invalid", "Revisá los campos marcados.");
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const subject = text("contact.mailSubject", "DeepFlow | muestra para ") + name;
      const body = message + "\n\n" + name + " (" + email + ")";

      if (status) status.textContent = text("contact.opening", "Abriendo tu correo...");
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  function clearScrubTween() {
    if (!scrubTween) return;
    if (scrubTween.scrollTrigger) scrubTween.scrollTrigger.kill();
    scrubTween.kill();
    scrubTween = null;
  }

  function prepareScrubText() {
    const element = document.querySelector("[data-scrub-text]");
    if (!element) return;
    clearScrubTween();
    const words = element.textContent.trim().split(/\s+/);
    const accentWords = new Set(
      String(element.dataset.scrubAccent || "")
        .split(/\s+/)
        .map(function (word) { return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ""); })
        .filter(Boolean),
    );
    element.textContent = "";
    words.forEach(function (word, index) {
      const span = document.createElement("span");
      span.className = "scrub-word";
      if (accentWords.has(word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ""))) {
        span.classList.add("scrub-word--accent");
      }
      span.textContent = word + (index === words.length - 1 ? "" : " ");
      element.appendChild(span);
    });

    const wordElements = element.querySelectorAll(".scrub-word");
    const animatedWordElements = element.querySelectorAll(".scrub-word:not(.scrub-word--accent)");
    if (!hasGsap || reduceMotionQuery.matches) {
      wordElements.forEach(function (word) {
        word.style.opacity = "1";
      });
      return;
    }

    scrubTween = window.gsap.to(animatedWordElements, {
      opacity: 1,
      stagger: 0.07,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top 78%",
        end: "bottom 30%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  function setupMotion() {
    prepareScrubText();
    if (!hasGsap || reduceMotionQuery.matches) {
      root.classList.remove("has-gsap");
      return;
    }

    root.classList.add("has-gsap");
    window.gsap.registerPlugin(window.ScrollTrigger);
    animationMedia = window.gsap.matchMedia();

    animationMedia.add(
      {
        desktop: "(min-width: 961px)",
        mobile: "(max-width: 960px)",
      },
      function (context) {
        const isDesktop = context.conditions.desktop;
        const intro = window.gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero__copy > *", {
            y: 30,
            autoAlpha: 0,
            duration: 0.82,
            stagger: 0.09,
          }, 0.08)
          .from(".hero__media", {
            scale: 0.94,
            autoAlpha: 0,
            duration: 1.12,
          }, 0.2);

        window.gsap.utils.toArray("[data-reveal]").forEach(function (element) {
          if (element.classList.contains("hero__media")) return;
          window.gsap.from(element, {
            y: 26,
            autoAlpha: 0,
            duration: 0.82,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          });
        });

        const process = document.querySelector(".process");
        const processIntro = document.querySelector("[data-process-pin]");
        if (isDesktop && process && processIntro) {
          window.ScrollTrigger.create({
            trigger: process,
            start: "top top",
            end: "bottom bottom",
            pin: processIntro,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });
        }

        window.gsap.utils.toArray("[data-process-step]").forEach(function (step) {
          window.gsap.fromTo(
            step,
            { y: 54 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: step,
                start: "top 84%",
                end: "center 48%",
                scrub: true,
              },
            },
          );
        });

        return function () {
          intro.kill();
        };
      },
    );
  }

  setupCarousel();
  setupHeroBriefParallax();
  setupRoadmapAccordion();
  setupContactForm();
  setupMotion();
  updateThemeLabel();
  setMenu(false);

  on(window, "deepflow:languagechange", function () {
    updateThemeLabel();
    setMenu(false);
    prepareScrubText();
    if (hasGsap) window.ScrollTrigger.refresh();
  });

  on(window, "pagehide", function (event) {
    if (event.persisted) return;
    clearScrubTween();
    if (animationMedia) animationMedia.revert();
    if (navObserver) navObserver.disconnect();
    disposers.splice(0).forEach(function (dispose) {
      dispose();
    });
  }, { once: true });
})();
