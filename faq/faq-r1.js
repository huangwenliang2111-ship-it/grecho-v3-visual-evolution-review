
(() => {
  'use strict';

  const workspace = document.querySelector('[data-b1-faq]');
  if (!workspace) return;

  const searchControls = workspace.querySelector('[data-b1-faq-search-controls]');
  const topicControls = workspace.querySelector('[data-b1-faq-topic-controls]');
  const input = workspace.querySelector('#faq-question-search');
  const clear = workspace.querySelector('[data-b1-faq-clear]');
  const reset = workspace.querySelector('[data-b1-faq-reset]');
  const status = workspace.querySelector('[data-b1-faq-status]');
  const empty = workspace.querySelector('[data-b1-faq-empty]');
  const jumps = workspace.querySelector('[data-b1-faq-jumps]');
  const jumpFallback = jumps?.closest('details');
  const groups = [...workspace.querySelectorAll('[data-b1-faq-group]')];
  const buttons = [...workspace.querySelectorAll('[data-b1-faq-topic]')];
  if (!searchControls || !topicControls || !input || !clear || !reset || !status || !empty ||
      !jumpFallback || !groups.length || buttons.length !== groups.length + 1) return;

  const clean = value => value.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
  const answers = groups.flatMap(group => [...group.querySelectorAll('[data-b1-faq-item]')].map(detail => {
    const question = clean(detail.querySelector('summary').textContent);
    const answer = clean(detail.querySelector('.b1-faq-answer').textContent);
    return { detail, group, question, text: question + ' ' + answer };
  }));
  const topics = new Map(groups.map(group => [group.id, group]));
  let topic = 'all';
  let normalOpen = null;

  function render() {
    const terms = clean(input.value).split(' ').filter(Boolean);
    if (terms.length && normalOpen === null) normalOpen = answers.map(({ detail }) => detail.open);

    let count = 0;
    const visibleGroups = new Set();
    answers.forEach(({ detail, group, question, text }, index) => {
      const visible = (topic === 'all' || topic === group.id) && terms.every(term => text.includes(term));
      detail.hidden = !visible;
      if (normalOpen) {
        const answerOnly = visible && terms.some(term => !question.includes(term));
        detail.open = normalOpen[index] || answerOnly;
      }
      if (visible) {
        count += 1;
        visibleGroups.add(group);
      }
    });
    if (!terms.length) normalOpen = null;
    for (const group of groups) group.hidden = !visibleGroups.has(group);
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.b1FaqTopic === topic));
    }

    const text = count === 1 ? '1 matching question' :
      terms.length || topic !== 'all' ? count + ' matching questions' : count + ' questions';
    if (status.textContent !== text) status.textContent = text;
    empty.hidden = count > 0;
    clear.disabled = !input.value;
    reset.hidden = topic === 'all' && !input.value;
  }

  function focusGroup(group) {
    const heading = group.querySelector('h3');
    heading?.focus({ preventScroll: true });
    group.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function goToGroup(group) {
    topic = group.id;
    input.value = '';
    render();
    focusGroup(group);
  }

  function readAnchor() {
    const group = topics.get(window.location.hash.slice(1));
    if (group) {
      goToGroup(group);
      return;
    }
    topic = 'all';
    input.value = '';
    render();
  }

  input.addEventListener('input', render);
  clear.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });
  reset.addEventListener('click', () => {
    input.value = '';
    topic = 'all';
    render();
    input.focus();
  });
  for (const button of buttons) {
    button.addEventListener('click', () => {
      topic = button.dataset.b1FaqTopic;
      render();
    });
  }
  jumps.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    const group = link && topics.get(link.hash.slice(1));
    if (!group) return;
    event.preventDefault();
    if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
    goToGroup(group);
  });
  window.addEventListener('hashchange', readAnchor);

  const initialGroup = topics.get(window.location.hash.slice(1));
  if (initialGroup) topic = initialGroup.id;
  render();
  searchControls.hidden = false;
  topicControls.hidden = false;
  jumpFallback.hidden = true;
  if (initialGroup) window.requestAnimationFrame(() => focusGroup(initialGroup));
})();
