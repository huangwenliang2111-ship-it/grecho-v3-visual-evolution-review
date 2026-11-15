/* FAQ disclosure only. Existing gallery, video and facer controllers are untouched. */
(() => {
  'use strict';
  document.querySelectorAll('body.r61-closeout .r61-faq-open').forEach(trigger => {
    const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!dialog || typeof dialog.showModal !== 'function') return;
    trigger.addEventListener('click', () => {
      if (dialog.open) return;
      dialog.showModal();
      trigger.setAttribute('aria-expanded', 'true');
      dialog.querySelector('.r61-faq-close').focus();
    });
    dialog.querySelector('.r61-faq-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
      // One actionable element: keep both Tab directions inside the modal.
      if (event.key === 'Tab') {
        event.preventDefault();
        dialog.querySelector('.r61-faq-close').focus();
      }
    });
    dialog.addEventListener('close', () => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus({ preventScroll: true });
    });
  });
})();
