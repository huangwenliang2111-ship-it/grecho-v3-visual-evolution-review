(() => {
  const catalogue = document.querySelector(".b3-insights [data-insight-catalog]");
  if (!catalogue) return;
  const tools = catalogue.querySelector("[data-insight-tools]");
  const search = tools.querySelector("#insight-search");
  const empty = tools.querySelector("[data-insight-empty]");
  const liveCount = tools.querySelector("[data-insight-count]");
  const filters = [...tools.querySelectorAll("[data-insight-filter]")];
  const choices = new Set(filters.map((button) => button.dataset.insightFilter));
  const grid = catalogue.querySelector("[data-insight-grid]");

  const normalize = (value) => value.trim().toLocaleLowerCase("en");
  const entries = [...grid.querySelectorAll("[data-insight-article]")].map((article) => {
    const fields = ["title", "summary", "topic-label"].map(
      (field) => article.querySelector("[data-insight-" + field + "]").textContent
    );
    return { article, topic: article.dataset.topic, text: normalize([...fields, article.dataset.topic].join(" ")) };
  });

  const readTopic = () => {
    const requested = new URL(location.href).searchParams.get("topic");
    return choices.has(requested) ? requested : "all";
  };
  let topic = readTopic();

  function render() {
    const query = normalize(search.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    entries.forEach(({ article, topic: itemTopic, text }) => {
      const matches = (topic === "all" || topic === itemTopic) && query.every((term) => text.includes(term));
      article.hidden = !matches;
      if (matches) visible += 1;
    });
    filters.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.insightFilter === topic));
    });
    grid.classList.toggle("is-single", visible === 1);
    empty.hidden = visible !== 0;
    const countText = visible === 1 ? "1 article" : visible + " articles";
    if (liveCount.textContent !== countText) liveCount.textContent = countText;
  }

  function changeTopic(next) {
    topic = next;
    const url = new URL(location.href);
    if (topic === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", topic);
    if (url.href !== location.href) history.replaceState(history.state, "", url);
    render();
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => changeTopic(button.dataset.insightFilter));
  });
  tools.querySelector("[data-insight-clear]").addEventListener("click", () => {
    search.value = "";
    render();
  });
  tools.querySelector("[data-insight-reset]").addEventListener("click", () => {
    search.value = "";
    changeTopic("all");
  });
  tools.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  search.addEventListener("input", render);
  window.addEventListener("popstate", () => {
    topic = readTopic();
    render();
  });
  render();
  tools.hidden = false;
})();

