"use strict";
(() => {
  const input = document.getElementById("review-search");
  const cards = [...document.querySelectorAll("a[data-family]")];
  const filters = [...document.querySelectorAll("button[data-filter]")];
  const count = document.getElementById("review-count");
  let family = "all";
  function update() {
    const query = input.value.trim().toLowerCase().replace(/\s+/g, " ");
    let visible = 0;
    for (const card of cards) {
      const match = (family === "all" || card.dataset.family === family) && card.dataset.search.toLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible++;
    }
    for (const group of document.querySelectorAll("section[data-review-group]")) group.hidden = ![...group.querySelectorAll("a[data-family]")].some(card => !card.hidden);
    for (const button of filters) button.setAttribute("aria-pressed", String(button.dataset.filter === family));
    count.textContent = `显示 ${visible} / ${cards.length} 页`;
    document.getElementById("review-empty").hidden = visible !== 0;
  }
  input.addEventListener("input", update);
  for (const button of filters) button.addEventListener("click", () => { family = button.dataset.filter; update(); });
  document.getElementById("review-clear").addEventListener("click", () => { input.value = ""; family = "all"; update(); input.focus(); });
  update();
})();
