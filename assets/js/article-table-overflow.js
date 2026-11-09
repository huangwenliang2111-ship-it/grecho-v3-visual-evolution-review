/* Opt-in technical articles: measure existing scroll regions; never resize tables. */
(() => {
  'use strict';
  const article = document.querySelector('main.gc-article-page.sample-editorial-article');
  if (!article) return;
  const entries = [];
  let nextId = 0;
  article.querySelectorAll('.sample-editorial-table').forEach(region => {
    const table = region.querySelector('table');
    if (!table || region.dataset.articleOverflowHint) return;
    const hint = document.createElement('p');
    do { hint.id = `article-table-overflow-hint-${++nextId}`; }
    while (document.getElementById(hint.id));
    hint.className = 'article-table-overflow-hint';
    hint.textContent = 'Scroll horizontally to view all columns';
    hint.hidden = true;
    region.before(hint);
    region.dataset.articleOverflowHint = hint.id;
    entries.push({ region, table, hint });
  });
  if (!entries.length) return;
  const measure = () => entries.forEach(({ region, hint }) => {
    const overflowing = region.clientWidth > 0 && region.scrollWidth > region.clientWidth;
    hint.hidden = !overflowing;
    // Preserve any original descriptions; only add/remove this enhancement's ID.
    const descriptions = (region.getAttribute('aria-describedby') || '').split(/\s+/)
      .filter(id => id && id !== hint.id);
    if (overflowing) descriptions.push(hint.id);
    if (descriptions.length) region.setAttribute('aria-describedby', descriptions.join(' '));
    else region.removeAttribute('aria-describedby');
  });
  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; measure(); });
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    entries.forEach(({ region, table }) => { observer.observe(region); observer.observe(table); });
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  measure();
})();
