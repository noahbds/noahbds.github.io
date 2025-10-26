(function () {
  "use strict";

  const throttle = (fn, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const debounce = (fn, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const initSections = () => {
    const sections = document.querySelectorAll("section");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    sections.forEach((s, i) => {
      s.style.opacity = 0;
      s.style.transform = "translateY(20px)";
      s.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      s.style.transitionDelay = `${i * 0.05}s`;

      s.addEventListener(
        "mouseenter",
        throttle(() => s.classList.add("section-float"), 150),
        { passive: true }
      );
      s.addEventListener(
        "mouseleave",
        throttle(() => s.classList.remove("section-float"), 150),
        { passive: true }
      );

      observer.observe(s);
    });
  };

  const stagger = (
    elements,
    delayStart = 0,
    step = 100,
    animClass = "fade-in-up"
  ) => {
    if (!elements.length) return;
    const obs = new IntersectionObserver(
      (entries, ob) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = parseInt(e.target.dataset.idx) || 0;
            setTimeout(() => {
              e.target.classList.add(animClass);
              e.target.style.visibility = "visible";
            }, delayStart + idx * step);
            ob.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el, i) => {
      el.dataset.idx = i;
      el.style.visibility = "hidden";
      obs.observe(el);
    });
  };

  const typeWriter = (
    el,
    text,
    { speed = 30, delay = 0, cursor = true, callback } = {}
  ) => {
    if (!el) return;

    el.textContent = "";
    el.style.opacity = "1";

    if (cursor) {
      el.classList.add("typing-cursor");
    }

    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        const nextDelay =
          text[i - 1] === " " ? speed / 2 : speed + Math.random() * speed * 0.2;
        setTimeout(type, nextDelay);
      } else {
        if (cursor) {
          setTimeout(() => {
            el.classList.remove("typing-cursor");
          }, 500);
        }
        if (callback) {
          setTimeout(callback, 200);
        }
      }
    };

    setTimeout(type, delay);
  };

  const initTyping = () => {
    const nameEl = document.querySelector("#profile-section h1");
    const jobEl = document.querySelector("#profile-section p");
    const summaryEl = document.querySelector("#summary p");
    if (!nameEl || !jobEl || !summaryEl) return;

    const sequences = [
      {
        el: nameEl,
        text: nameEl.textContent,
        speed: 40,
      },
      {
        el: jobEl,
        text: jobEl.textContent,
        speed: 20,
        delay: 300,
      },
      {
        el: summaryEl,
        text: summaryEl.textContent,
        speed: 15,
        delay: 500,
      },
    ];

    sequences.forEach((seq) => {
      seq.el.style.opacity = "1";
      seq.el.textContent = "";
    });

    const runSequence = (idx = 0) => {
      if (idx >= sequences.length) return;
      const s = sequences[idx];
      typeWriter(s.el, s.text, {
        speed: s.speed,
        delay: s.delay || 0,
        cursor: true,
        callback: () => runSequence(idx + 1),
      });
    };
    runSequence();
  };

  const addAnimationCSS = () => {
    const style = document.createElement("style");
    style.textContent = `
      .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
      }
      .slide-in-left {
        animation: slideInLeft 0.6s ease forwards;
      }
      .slide-in-right {
        animation: slideInRight 0.6s ease forwards;
      }
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const initDarkMode = () => {
    const toggle = document.getElementById("dark-mode-toggle");
    if (!toggle) {
      console.warn("Dark mode toggle button not found");
      return;
    }

    const stored = localStorage.getItem("theme");
    const theme = stored || "light";

    document.documentElement.setAttribute("data-theme", theme);

    toggle.setAttribute("type", "button");

    let iconEl = toggle.querySelector(".material-symbols-outlined");
    if (!iconEl) iconEl = toggle.firstElementChild;

    const updateButtonUI = (t) => {
      const isDark = t === "dark";
      if (iconEl) {
        iconEl.textContent = isDark ? "light_mode" : "dark_mode";
      }
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      toggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    };

    updateButtonUI(theme);

    const setTheme = (newTheme) => {
      document.documentElement.setAttribute("data-theme", newTheme);
      try {
        localStorage.setItem("theme", newTheme);
      } catch (err) {
        console.debug("Could not write theme to localStorage:", err);
      }
      updateButtonUI(newTheme);
      console.log(`Theme switched to: ${newTheme}`);
    };

    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
    };

    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    iconEl = newToggle.querySelector(".material-symbols-outlined");
    if (!iconEl) iconEl = newToggle.firstElementChild;

    updateButtonUI(theme);

    newToggle.addEventListener("click", handleToggle);

    newToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        handleToggle(e);
      }
    });

    console.log("Dark mode initialized successfully");
  };

  const initScrollProgress = () => {
    if (document.getElementById("scroll-progress")) return;
    const progressBar = document.createElement("div");
    progressBar.id = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    progressBar.style.transform = "scaleX(0)";
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      const clamped = Math.max(0, Math.min(1, ratio));
      progressBar.style.transform = `scaleX(${clamped})`;
    };

    updateProgress();
    window.addEventListener("scroll", throttle(updateProgress, 20));
    window.addEventListener("resize", debounce(updateProgress, 120));
  };

  const initScrollToTop = () => {
    const button = document.getElementById("scroll-to-top");
    if (!button) return;

    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        button.classList.add("show");
        button.setAttribute("aria-hidden", "false");
      } else {
        button.classList.remove("show");
        button.setAttribute("aria-hidden", "true");
      }
    };

    window.addEventListener("scroll", throttle(toggleVisibility, 100));
    toggleVisibility();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const initFormValidation = () => {
    const form = document.querySelector("#contact form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      const name = ((form.name && form.name.value) || "").trim();
      const email = ((form.email && form.email.value) || "").trim();
      const message = ((form.message && form.message.value) || "").trim();

      if (!name || !email || !message) {
        e.preventDefault();
        alert("Please fill in all fields.");
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        e.preventDefault();
        alert("Please enter a valid email.");
      }
    });
  };

  const initKeyboardNav = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
      }
    });
  };

  const initNavHighlight = () => {
    const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
    if (!navLinks.length) return;

    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = document.querySelector(`.main-nav a[href="#${id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { threshold: 0.45 }
    );

    sections.forEach((s) => observer.observe(s));

    document.querySelectorAll(".main-nav a").forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) {
          setTimeout(
            () => target.setAttribute("tabindex", "-1") || target.focus(),
            0
          );
        }
      });
    });
  };

  const initProjectCards = () => {
    const projectCards = document.querySelectorAll(".project-card");
    const filterButtons = document.querySelectorAll(".filter-btn");
    if (!projectCards.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        projectCards.forEach((card) => {
          const techBadges = card.querySelectorAll(".tech-badge");
          const techStack = Array.from(techBadges).map((badge) =>
            badge.textContent.toLowerCase().replace(/\s+/g, "")
          );

          if (
            filter === "all" ||
            techStack.some((tech) => tech.includes(filter.toLowerCase()))
          ) {
            card.style.display = "block";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "scale(1)";
            }, 10);
          } else {
            card.style.opacity = "0";
            card.style.transform = "scale(0.8)";
            setTimeout(() => {
              card.style.display = "none";
            }, 300);
          }
        });
      });
    });

    projectCards.forEach((card, index) => {
      const techBadges = card.querySelectorAll(".tech-badge");
      techBadges.forEach((badge) => {
        const tech = badge.textContent.toLowerCase().replace(/\s+/g, "");
        badge.setAttribute("data-tech", tech);
      });

      card.style.opacity = "0";
      card.style.transform = "translateY(30px) scale(0.9)";

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.style.display !== "none") {
              setTimeout(() => {
                entry.target.style.transition = "all 0.6s ease";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0) scale(1)";
              }, index * 150);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(card);

      const features = card.querySelectorAll(".feature");

      card.addEventListener("mouseenter", () => {
        features.forEach((feature, i) => {
          setTimeout(() => {
            feature.style.transform = "translateX(5px)";
            feature.style.opacity = "0.8";
          }, i * 50);
        });
      });

      card.addEventListener("mouseleave", () => {
        features.forEach((feature) => {
          feature.style.transform = "translateX(0)";
          feature.style.opacity = "1";
        });
      });

      const buttons = card.querySelectorAll(".btn-primary, .btn-secondary");
      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const ripple = document.createElement("span");
          ripple.style.position = "absolute";
          ripple.style.borderRadius = "50%";
          ripple.style.background = "rgba(255, 255, 255, 0.6)";
          ripple.style.transform = "scale(0)";
          ripple.style.animation = "ripple 0.6s linear";
          ripple.style.left = "50%";
          ripple.style.top = "50%";
          ripple.style.width = "20px";
          ripple.style.height = "20px";
          ripple.style.marginLeft = "-10px";
          ripple.style.marginTop = "-10px";
          ripple.style.pointerEvents = "none";

          button.style.position = "relative";
          button.style.overflow = "hidden";
          button.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });
    });
  };

  const initSkillProgress = () => {
    const skillsSection = document.getElementById("skills");
    if (!skillsSection) return;

    const fills = Array.from(skillsSection.querySelectorAll(".progress-fill"));
    if (!fills.length) return;

    fills.forEach((f) => {
      f.style.width = "0%";
    });

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fills.forEach((f) => {
              const target = f.dataset.width || "0%";
              f.style.width = target;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    obs.observe(skillsSection);
  };

  const initializeApp = () => {
    addAnimationCSS();
    initSections();
    initDarkMode();
    initScrollProgress();
    initScrollToTop();
    initFormValidation();
    initKeyboardNav();
    initProjectCards();
    initSkillProgress();

    stagger(
      document.querySelectorAll("#soft-skills .soft-skill-badges span"),
      300,
      100,
      "slide-in-left"
    );
    stagger(
      document.querySelectorAll("#experience .job"),
      500,
      150,
      "slide-in-right"
    );
    stagger(
      document.querySelectorAll("#education .education-item"),
      700,
      120,
      "fade-in-up"
    );

    initTyping();
    initNavHighlight();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
