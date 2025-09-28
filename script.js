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
    { speed = 60, delay = 0, cursor = true, callback } = {}
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
        speed: 80,
      },
      {
        el: jobEl,
        text: jobEl.textContent,
        speed: 40,
        delay: 500,
      },
      {
        el: summaryEl,
        text: summaryEl.textContent,
        speed: 30,
        delay: 800,
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
    `;
    document.head.appendChild(style);
  };

  const initializeApp = () => {
    addAnimationCSS();
    initSections();

    stagger(
      document.querySelectorAll("#soft-skills li"),
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
