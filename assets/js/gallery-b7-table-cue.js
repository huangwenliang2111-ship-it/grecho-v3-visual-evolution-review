(() => {
  "use strict";

  const language = document.documentElement.lang.toLowerCase().split("-")[0];
  const translations = {
    en: "Scroll horizontally to view all columns.",
    de: "Horizontal scrollen, um alle Spalten zu sehen.",
    fr: "Faites défiler horizontalement pour voir toutes les colonnes.",
    nl: "Scrol horizontaal om alle kolommen te bekijken."
  };
  const regions = [...document.querySelectorAll(".b6-topic .b6-table-scroll")];
  if (!regions.length) return;

  const entries = regions.map((region, index) => {
    const cue = document.createElement("p");
    cue.id = "b7-table-cue-" + (index + 1);
    cue.className = "b7-table-cue";
    cue.textContent = translations[language] || translations.en;
    cue.hidden = true;
    region.before(cue);
    const existing = (region.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    return { region, cue, existing };
  });

  const sync = () => {
    for (const { region, cue, existing } of entries) {
      const overflow = region.clientWidth > 0 && region.scrollWidth - region.clientWidth > 1;
      cue.hidden = !overflow;
      const description = overflow ? [...existing, cue.id] : existing;
      if (description.length) region.setAttribute("aria-describedby", description.join(" "));
      else region.removeAttribute("aria-describedby");
    }
  };

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(sync);
    for (const { region } of entries) {
      observer.observe(region);
      const table = region.querySelector("table");
      if (table) observer.observe(table);
    }
  } else {
    window.addEventListener("resize", sync, { passive: true });
  }
  sync();
})();
