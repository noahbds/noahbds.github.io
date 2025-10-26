(function () {
  "use strict";

  const languages = {
    en: en,
    fr: fr,
  };

  let currentLang = localStorage.getItem("selectedLanguage") || "fr";

  function loadLanguage(lang) {
    if (!languages[lang]) {
      console.warn(`Language '${lang}' not found, falling back to 'fr'`);
      lang = "fr";
    }
    currentLang = lang;
    localStorage.setItem("selectedLanguage", lang);

    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (languages[lang][key]) {
        element.textContent = languages[lang][key];
      } else {
        console.warn(
          `Translation key '${key}' not found for language '${lang}'`
        );
      }
    });

    const langBtns = document.querySelectorAll("#language-switcher .lang-btn");
    langBtns.forEach((btn) => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function initLanguageSwitcher() {
    const header = document.querySelector("header");
    if (!header) return;

    const switcher = document.createElement("div");
    switcher.id = "language-switcher";
    switcher.innerHTML = `
      <button class="lang-btn" data-lang="fr" aria-label="Français">FR</button>
      <button class="lang-btn" data-lang="en" aria-label="English">EN</button>
    `;

    const darkToggle = document.getElementById("dark-mode-toggle");
    if (darkToggle) {
      const controlsWrapper = document.createElement("div");
      controlsWrapper.id = "header-controls";
      controlsWrapper.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
      `;
      darkToggle.parentNode.insertBefore(controlsWrapper, darkToggle);
      controlsWrapper.appendChild(darkToggle);
      darkToggle.style.position = "static";
      darkToggle.style.top = "";
      darkToggle.style.right = "";
      controlsWrapper.appendChild(switcher);
    } else {
      header.appendChild(switcher);
    }

    // Add event listeners
    switcher.addEventListener("click", (e) => {
      if (e.target.classList.contains("lang-btn")) {
        const lang = e.target.getAttribute("data-lang");
        loadLanguage(lang);
      }
    });

    loadLanguage(currentLang);
  }

  window.languageSwitcher = {
    loadLanguage,
    init: initLanguageSwitcher,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSwitcher();
    });
  } else {
    initLanguageSwitcher();
  }
})();
