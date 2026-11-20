(() => {
  const catalogue = document.querySelector('.pc-catalogue');
  const map = window.productsFacetMap;
  if (!catalogue || !map) return;

  const tools = catalogue.querySelector('[data-catalogue-tools]');
  const categories = catalogue.querySelector('[data-catalogue-controls]');
  const rail = catalogue.querySelector('.pc-rail');
  const groups = rail.querySelector('.pc-facet-groups');
  const toggle = rail.querySelector('#pc-filter-toggle');
  const panel = rail.querySelector('#pc-filter-panel');
  const activeTotal = toggle.querySelector('.pc-active-total');
  const count = catalogue.querySelector('[data-catalogue-count]');
  const reset = catalogue.querySelector('[data-catalogue-reset]');
  const chips = catalogue.querySelector('.pc-chips');
  const grid = catalogue.querySelector('#pc-grid');
  const cards = [...grid.querySelectorAll('[data-catalogue-card]')];
  const empty = catalogue.querySelector('.pc-empty');
  const compact = window.matchMedia('(max-width: 1023px)');
  let category = map.categories.find(item => item.key === 'all');
  let panelOpen = false;

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  for (const item of map.categories) {
    const button = make('button', '', item.label + ' ');
    button.type = 'button';
    button.dataset.catalogueFilter = item.key;
    button.setAttribute('aria-controls', grid.id);
    button.append(make('span', 'pc-filter-count', String(item.product_ids.length)));
    button.addEventListener('click', () => {
      category = item;
      render();
    });
    categories.append(button);
  }

  function makeGroup(group) {
    const details = make('details', 'pc-facet');
    details.dataset.group = group.key;
    details.open = !compact.matches && group.key === 'application';
    const summary = make('summary', '', group.label);
    summary.id = 'pc-title-' + group.key;
    const badge = make('span', 'pc-facet-count');
    summary.append(badge);
    details.append(summary);

    const choices = make('div', 'pc-choices');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-labelledby', summary.id);
    if (group.helper) {
      const help = make('p', 'pc-facet-help', group.helper);
      help.id = 'pc-help-' + group.key;
      choices.setAttribute('aria-describedby', help.id);
      details.append(help);
    }
    const options = group.options.map(option => {
      const label = make('label');
      const input = make('input');
      input.type = 'checkbox';
      input.name = group.key;
      input.value = option.key;
      input.setAttribute('aria-controls', grid.id);
      label.append(input, make('span', '', option.label));
      choices.append(label);
      return { option, input };
    });
    details.append(choices);
    groups.append(details);
    return { group, options, badge };
  }

  const facets = map.groups.map(makeGroup);
  const all = category;
  const categoryButtons = [...categories.children];

  function addChip(groupName, label, remove) {
    const item = make('li');
    const button = make('button', 'pc-chip');
    button.type = 'button';
    button.setAttribute('aria-label', 'Remove ' + groupName + ': ' + label);
    const cross = make('span', '', '×');
    cross.setAttribute('aria-hidden', 'true');
    // The same documentation-status option occurs under both numeric filters.
    const text = ['Width', 'GSM / Area Weight'].includes(groupName) ? groupName + ': ' + label : label;
    button.append(make('span', '', text), cross);
    button.addEventListener('click', () => {
      const index = [...chips.children].indexOf(item);
      remove();
      render();
      const remaining = chips.querySelectorAll('button');
      (remaining[Math.min(index, remaining.length - 1)] || reset).focus();
    });
    item.append(button);
    chips.append(item);
  }

  function render() {
    const selected = facets.map(({ group, options, badge }) => {
      const checked = options.filter(({ input }) => input.checked);
      badge.textContent = checked.length ? '(' + checked.length + ')' : '';
      return { group, checked };
    }).filter(({ checked }) => checked.length);

    const enabled = category.key !== all.key;
    for (const button of categoryButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.catalogueFilter === category.key));
    }
    chips.replaceChildren();
    if (enabled) addChip('Category', category.label, () => { category = all; });
    for (const { group, checked } of selected) {
      for (const { option, input } of checked) {
        addChip(group.label, option.label, () => { input.checked = false; });
      }
    }
    const active = chips.childElementCount;
    chips.hidden = active === 0;
    activeTotal.textContent = String(active);
    toggle.setAttribute('aria-label', 'Filters, ' + active + (active === 1 ? ' active selection' : ' active selections'));
    reset.setAttribute('aria-disabled', String(active === 0));

    let total = 0;
    for (const card of cards) {
      const id = card.dataset.catalogueCard;
      const matches = category.product_ids.includes(id) && selected.every(({ group, checked }) => {
        const contains = ({ option }) => option.product_ids.includes(id);
        return group.within_group_operator === 'AND' ? checked.every(contains) : checked.some(contains);
      });
      card.hidden = !matches;
      if (matches) total += 1;
    }
    const result = total + (total === 1 ? ' product' : ' products');
    if (count.textContent !== result) count.textContent = result;
    grid.hidden = total === 0;
    empty.hidden = total !== 0;
  }

  function setPanel() {
    panel.hidden = compact.matches && !panelOpen;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  }

  toggle.addEventListener('click', () => {
    panelOpen = !panelOpen;
    setPanel();
  });
  compact.addEventListener('change', () => {
    if (compact.matches && panel.contains(document.activeElement)) panelOpen = true;
    setPanel();
  });
  rail.querySelector('.pc-show-results').addEventListener('click', () => {
    panelOpen = false;
    setPanel();
    count.focus({ preventScroll: true });
    count.scrollIntoView({ block: 'start' });
  });
  reset.addEventListener('click', () => {
    if (reset.getAttribute('aria-disabled') === 'true') return;
    category = all;
    for (const { options } of facets) {
      for (const { input } of options) input.checked = false;
    }
    render();
  });
  groups.addEventListener('change', render);

  setPanel();
  render();
  catalogue.querySelector('.pc-directory').classList.add('is-filterable');
  tools.hidden = false;
  rail.hidden = false;
  reset.hidden = false;
})();
