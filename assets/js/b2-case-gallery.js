(() => {
  'use strict';

  const section = document.querySelector('.b2-cases #application-examples');
  if (!section) return;

  const controls = section.querySelector('.case-controls');
  const count = section.querySelector('.case-result-count');
  const filters = [...section.querySelectorAll('[data-gcases-filter]')];
  const scenarios = [...section.querySelectorAll('[data-gcases-group]')];
  if (!controls || !count || filters.length !== 6 || scenarios.length !== 6) return;

  function showScenarios(active) {
    const filter = active.dataset.gcasesFilter;
    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button === active));
    }
    let shown = 0;
    for (const scenario of scenarios) {
      const matches = filter === 'all' || scenario.dataset.gcasesGroup === filter;
      scenario.hidden = !matches;
      if (matches) shown += 1;
    }
    count.textContent = String(shown) + (shown === 1 ? ' scenario shown' : ' scenarios shown');
  }

  for (const button of filters) {
    button.addEventListener('click', () => showScenarios(button));
  }
  controls.hidden = false;
})();

