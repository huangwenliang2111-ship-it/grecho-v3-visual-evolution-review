/* Selected editorial samples only. Native details are usable without this enhancement. */
(() => {
  'use strict';
  const root = document.querySelector('.sample-editorial-page');
  if (!root) return;
  const wide = window.matchMedia('(min-width: 851px)');
  const disclosures = Array.from(root.querySelectorAll('[data-editorial-toc]'));
  const sync = () => disclosures.forEach(details => { details.open = wide.matches; });
  sync();
  if (wide.addEventListener) wide.addEventListener('change', sync);
  else if (wide.addListener) wide.addListener(sync);
  // Close before the browser resolves its native fragment jump. No custom scrolling,
  // animation, history changes, state persistence, or requests are introduced.
  disclosures.forEach(details => details.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !wide.matches) details.open = false;
  }));
})();
