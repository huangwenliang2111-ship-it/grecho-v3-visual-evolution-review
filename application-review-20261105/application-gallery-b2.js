/* Local scene selection and inquiry preparation. No requests, persistence, or Contact prefill. */
(() => {
  'use strict';

  const page = document.querySelector('.b2-apps');
  if (!page) return;

  const tablist = page.querySelector('.solution-tabs');
  const tabs = Array.from(tablist.querySelectorAll('.solution-tab'));
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  const findScene = hash => {
    const id = hash.slice(1);
    return panels.findIndex((panel, index) => panel.id === id
      || panel.firstElementChild?.id === id || tabs[index].id === id
      || panel.querySelector('h3').id === id);
  };

  function activate(index) {
    tabs.forEach((tab, slot) => {
      const selected = index === slot;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[slot].hidden = !selected;
    });
  }

  function activateFromLocation() {
    const index = findScene(location.hash);
    if (index < 0 && location.hash) return;
    activate(Math.max(0, index));
    if (panels[index]?.id === location.hash.slice(1)) {
      requestAnimationFrame(() => panels[index].scrollIntoView({block: 'start'}));
    } else if (index >= 0) {
      const destination = document.getElementById(location.hash.slice(1));
      if (destination) requestAnimationFrame(() => destination.scrollIntoView({block: 'start'}));
    }
  }

  function select(index, focus) {
    const tab = tabs[index];
    activate(index);
    if (location.hash !== tab.hash) history.pushState(null, '', tab.hash);
    if (focus === 'tab') tab.focus({preventScroll: true});
    if (focus === 'panel') {
      panels[index].focus({preventScroll: true});
      panels[index].scrollIntoView({block: 'start'});
    }
  }

  const primaryClick = event => event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
  if (tabs.length && panels.every(Boolean)) {
    tablist.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', event => {
        if (!primaryClick(event)) return;
        event.preventDefault();
        select(index);
      });
      tab.addEventListener('keydown', event => {
        const nextByKey = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        const next = nextByKey[event.key];
        if (typeof next !== 'number') return;
        event.preventDefault();
        select(next, 'tab');
      });
    });
    page.querySelectorAll('[data-b2-scene-link]').forEach(link => {
      link.addEventListener('click', event => {
        if (!primaryClick(event)) return;
        const index = findScene(link.hash);
        if (index < 0) return;
        event.preventDefault();
        select(index, 'panel');
      });
    });
    activate(0);
    activateFromLocation();
    window.addEventListener('popstate', activateFromLocation);
    window.addEventListener('hashchange', activateFromLocation);
  }

  const form = page.querySelector('#enquiryForm');
  if (!form) return;
  const prepare = form.querySelector('[data-prepare-inquiry]');
  const result = form.querySelector('#inquiryResult');
  const notes = form.querySelector('#inquiryText');
  const status = form.querySelector('#copyStatus');
  const fields = Array.from(form.querySelectorAll('.field input, .field select, .field textarea'));
  prepare.disabled = false;
  form.addEventListener('submit', event => event.preventDefault());
  prepare.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const title = page.querySelector('h1').textContent.trim();
    const details = fields.map(field => {
      const label = field.labels[0].textContent;
      return label + ': ' + (field.value || 'Not specified');
    });
    notes.value = ['GRECHO — ' + title + ' Inquiry', ...details].join('\n');
    result.hidden = false;
    status.textContent = 'Prepared locally. No information has been submitted.';
  });

  form.querySelector('#copyInquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(notes.value);
      status.textContent = 'Inquiry details copied. No information has been submitted.';
    } catch {
      notes.focus();
      notes.select();
      status.textContent = 'The text is selected for manual copying. No information has been submitted.';
    }
  });
})();

