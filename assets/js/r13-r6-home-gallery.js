/* R13 R6 homepage: native overflow galleries, with mouse drag and buttons.
 * CSS owns overflow, scroll snap and the [data-r6-dragging] visual state.
 * The existing Hero player remains the sole video controller.
 */
(() => {
  'use strict';

  const init = () => {
    const home = document.querySelector('body.r13-home');
    if (!home) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const epsilon = 1;

    const hero = home.querySelector('main .r13-r3-hero');
    if (hero) {
      let headerFrame = 0;
      const measureHeader = () => {
        headerFrame = 0;
        // Normal-flow offsets do not change when the navigation becomes sticky.
        let top = 0;
        for (let node = hero; node; node = node.offsetParent) top += node.offsetTop;
        home.style.setProperty('--r6-header-height', `${Math.max(0, top)}px`);
      };
      const scheduleHeader = () => {
        if (!headerFrame) headerFrame = requestAnimationFrame(measureHeader);
      };
      if ('ResizeObserver' in window) {
        const headerObserver = new ResizeObserver(scheduleHeader);
        home.querySelectorAll('.grecho-public-preview-note, .grecho-v3-initiative, header.grecho-v3-nav').forEach(node => {
          if (node.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING) headerObserver.observe(node);
        });
      }
      window.addEventListener('resize', scheduleHeader, { passive: true });
      document.fonts?.ready.then(scheduleHeader);
      measureHeader();
    }

    home.querySelectorAll('#solution-hubs [data-r6-gallery], #application-examples [data-r6-gallery]').forEach(track => {
      const cards = [...track.children].filter(node => node.matches('article'));
      const controls = track.nextElementSibling;
      if (!cards.length || !track.id || !controls?.matches('[data-r6-gallery-controls]')) return;
      const previous = controls.querySelector('[data-gallery-prev]');
      const next = controls.querySelector('[data-gallery-next]');
      const progress = controls.querySelector('[data-gallery-progress]');
      if (!previous || !next || !progress || previous.getAttribute('aria-controls') !== track.id || next.getAttribute('aria-controls') !== track.id) return;
      controls.hidden = false;
      // The horizontal preview uses the approved static composites. Keep the
      // source-disabled layer toggles disabled after the legacy engine initializes.
      track.querySelectorAll('.grecho-rev03-trigger').forEach(button => { button.disabled = true; });

      let pointer = null;
      let suppressClick = false;
      let updateFrame = 0;
      let arrowTarget = null;
      const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
      const clamp = value => Math.min(maximum(), Math.max(0, value));
      const position = () => clamp(track.scrollLeft);
      const cardStarts = () => {
        const left = track.getBoundingClientRect().left + track.clientLeft;
        return cards.map(card => card.getBoundingClientRect().left - left + track.scrollLeft);
      };

      const update = () => {
        updateFrame = 0;
        const left = position();
        const active = document.activeElement;
        previous.disabled = left <= epsilon;
        next.disabled = maximum() - left <= epsilon;
        const viewportLeft = track.getBoundingClientRect().left + track.clientLeft;
        const viewportRight = viewportLeft + track.clientWidth;
        const rects = cards.map(card => card.getBoundingClientRect());
        const visible = rects.flatMap((rect, index) => rect.left >= viewportLeft - epsilon && rect.right <= viewportRight + epsilon ? [index + 1] : []);
        if (!visible.length) {
          const center = (viewportLeft + viewportRight) / 2;
          let closest = 0;
          rects.forEach((rect, index) => {
            if (Math.abs((rect.left + rect.right) / 2 - center) < Math.abs((rects[closest].left + rects[closest].right) / 2 - center)) closest = index;
          });
          visible.push(closest + 1);
        }
        const first = visible[0], last = visible[visible.length - 1];
        progress.textContent = `${first === last ? first : `${first}\u2013${last}`} / ${cards.length}`;
        if (arrowTarget !== null && Math.abs(left - arrowTarget) <= epsilon) arrowTarget = null;

        // A just-disabled arrow should not leave keyboard focus on the body.
        if ((active === previous || active === next) && active.disabled) {
          const other = active === previous ? next : previous;
          const fallback = track.hasAttribute('tabindex') ? track : track.querySelector('a[href], button:not([disabled])');
          (!other.disabled ? other : fallback)?.focus({ preventScroll: true });
        }
      };
      const scheduleUpdate = () => {
        if (!updateFrame) updateFrame = requestAnimationFrame(update);
      };
      const scrollTo = (left, behavior = 'instant') => {
        track.scrollTo({ left: clamp(left), behavior });
        scheduleUpdate();
      };
      const advance = direction => {
        const from = arrowTarget ?? position();
        const starts = cardStarts();
        const destination = direction > 0
          ? starts.find(start => start > from + epsilon) ?? maximum()
          : [...starts].reverse().find(start => start < from - epsilon) ?? 0;
        arrowTarget = clamp(destination);
        scrollTo(arrowTarget, reducedMotion.matches ? 'instant' : 'smooth');
      };
      previous.addEventListener('click', () => advance(-1));
      next.addEventListener('click', () => advance(1));

      const finishPointer = event => {
        if (!pointer || (event?.pointerId !== undefined && event.pointerId !== pointer.id)) return;
        const finished = pointer;
        pointer = null;
        if (finished.dragging) suppressClick = true;
        track.removeAttribute('data-r6-dragging');
        if (track.hasPointerCapture(finished.id)) track.releasePointerCapture(finished.id);
        scheduleUpdate();
      };
      track.addEventListener('pointerdown', event => {
        // Touch/pen and trackpads retain native scrolling and click behavior.
        finishPointer();
        suppressClick = false;
        arrowTarget = null;
        if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary) return;
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: position(), dragging: false };
      });
      window.addEventListener('pointermove', event => {
        if (!pointer || event.pointerId !== pointer.id) return;
        if (!(event.buttons & 1)) { finishPointer(event); return; }
        const dx = event.clientX - pointer.x;
        const dy = event.clientY - pointer.y;
        if (!pointer.dragging) {
          if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
          pointer.dragging = true;
          track.setAttribute('data-r6-dragging', 'true');
          // Stop a pending native smooth scroll before applying pointer deltas.
          track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
          track.setPointerCapture(pointer.id);
        }
        event.preventDefault();
        scrollTo(pointer.left - dx);
      }, { passive: false });
      window.addEventListener('pointerup', finishPointer);
      window.addEventListener('pointercancel', finishPointer);
      track.addEventListener('lostpointercapture', finishPointer);
      window.addEventListener('blur', () => finishPointer());
      track.addEventListener('dragstart', event => {
        if (pointer) event.preventDefault(); // No native image/link ghost drag.
      });
      track.addEventListener('click', event => {
        if (!suppressClick || event.detail === 0) return;
        suppressClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);

      track.addEventListener('focusin', event => {
        // A mouse press focuses its link before click. Keep that target still
        // through the whole gesture; keyboard focus has no pending pointer.
        if (pointer) return;
        arrowTarget = null;
        const viewport = track.getBoundingClientRect();
        const left = viewport.left + track.clientLeft;
        const right = left + track.clientWidth;
        const card = event.target.closest('article');
        let target = card?.getBoundingClientRect() ?? event.target.getBoundingClientRect();
        if (target.width > track.clientWidth) target = event.target.getBoundingClientRect();
        let delta = 0;
        if (target.left < left) delta = target.left - left;
        else if (target.right > right) delta = target.right - right;
        // Horizontal inline-nearest equivalent of scrollIntoView. Scrolling only
        // this track cannot unexpectedly move the page or another ancestor.
        if (Math.abs(delta) > epsilon) scrollTo(position() + delta);
      });
      track.addEventListener('scroll', scheduleUpdate, { passive: true });
      track.addEventListener('wheel', () => { arrowTarget = null; }, { passive: true });
      track.addEventListener('keydown', () => { arrowTarget = null; });
      const resized = () => { arrowTarget = null; finishPointer(); scheduleUpdate(); };
      window.addEventListener('resize', resized, { passive: true });
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(resized);
        observer.observe(track);
        cards.forEach(card => observer.observe(card));
      }
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches && arrowTarget !== null) scrollTo(arrowTarget);
      });
      update();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
