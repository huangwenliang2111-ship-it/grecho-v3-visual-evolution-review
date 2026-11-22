/* Home Gallery interaction adapted by Resource R2.1 and scoped for the four B3 tracks. */
(() => {
  'use strict';

  function bindGallery(gallery) {
    const track = gallery?.querySelector('[data-b3-track]');
    const controls = gallery?.querySelector('[data-b3-controls]');
    const previous = controls?.querySelector('[data-b3-prev]');
    const next = controls?.querySelector('[data-b3-next]');
    const progress = controls?.querySelector('[data-b3-count]');
    if (!track?.id || !previous || !next || !progress ||
        previous.getAttribute('aria-controls') !== track.id || next.getAttribute('aria-controls') !== track.id) return;
    const cards = [...track.children].filter(card => card.matches('.b3-gallery-card'));
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const epsilon = 1;
    const dragAttribute = 'data-b3-dragging';
    const edgeAttribute = 'data-b3-edge';
    const edgeProperty = '--b3-edge-x';
    let pointer = null;
    let suppressClick = false;
    let updateFrame = 0;
    let arrowTarget = null;
    let edgeOffset = 0;
    let edgeTimer = 0;
    const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const clamp = value => Math.min(maximum(), Math.max(0, value));
    const position = () => clamp(track.scrollLeft);

    function cardStarts() {
      const left = track.getBoundingClientRect().left + track.clientLeft;
      return cards.map(card => card.getBoundingClientRect().left - left + track.scrollLeft);
    }

    function update() {
      updateFrame = 0;
      const left = position();
      const active = document.activeElement;
      controls.hidden = maximum() <= epsilon;
      previous.disabled = left <= epsilon;
      next.disabled = maximum() - left <= epsilon;
      const viewportLeft = track.getBoundingClientRect().left + track.clientLeft;
      const viewportRight = viewportLeft + track.clientWidth;
      const rects = cards.map(card => card.getBoundingClientRect());
      const visible = rects.flatMap((rect, index) =>
        rect.left >= viewportLeft - epsilon && rect.right <= viewportRight + epsilon ? [index + 1] : []);
      // The homepage counts complete cards, then uses the nearest center if none is complete.
      if (!visible.length) {
        const center = (viewportLeft + viewportRight) / 2;
        const distance = rect => Math.abs((rect.left + rect.right) / 2 - center);
        const nearest = rects.reduce((best, rect, index) =>
          distance(rect) < distance(rects[best]) ? index : best, 0);
        visible.push(nearest + 1);
      }
      const first = visible[0];
      const last = visible[visible.length - 1];
      const range = first === last ? String(first) : first + '\u2013' + last;
      const label = range + ' / ' + cards.length;
      if (progress.textContent !== label) progress.textContent = label;
      if (arrowTarget !== null && Math.abs(left - arrowTarget) <= epsilon) arrowTarget = null;
      if ((active === previous || active === next) && active.disabled) {
        const other = active === previous ? next : previous;
        (other.disabled ? track : other).focus({ preventScroll: true });
      }
    }

    function scheduleUpdate() {
      if (!updateFrame) updateFrame = window.requestAnimationFrame(update);
    }

    function scrollTo(left, behavior = 'instant') {
      track.scrollTo({ left: clamp(left), behavior });
      scheduleUpdate();
    }

    function clearEdge() {
      window.clearTimeout(edgeTimer);
      edgeTimer = 0;
      edgeOffset = 0;
      track.removeAttribute(edgeAttribute);
      track.style.removeProperty(edgeProperty);
    }

    function moveEdge(overflow) {
      if (reducedMotion.matches || Math.abs(overflow) < epsilon) {
        clearEdge();
        return;
      }
      window.clearTimeout(edgeTimer);
      // Exponential resistance reproduces the homepage's 20px limit.
      edgeOffset = -Math.sign(overflow) * 20 * (1 - Math.exp(-Math.abs(overflow) / 90));
      track.setAttribute(edgeAttribute, 'dragging');
      track.style.setProperty(edgeProperty, edgeOffset + 'px');
    }

    function releaseEdge(animate) {
      if (!animate || reducedMotion.matches || !edgeOffset) {
        clearEdge();
        return;
      }
      track.setAttribute(edgeAttribute, 'returning');
      track.style.setProperty(edgeProperty, '0px');
      edgeOffset = 0;
      edgeTimer = window.setTimeout(clearEdge, 200);
    }

    function advance(direction) {
      clearEdge();
      const from = arrowTarget ?? position();
      const starts = cardStarts();
      const target = direction > 0
        ? starts.find(start => start > from + epsilon) ?? maximum()
        : starts.reverse().find(start => start < from - epsilon) ?? 0;
      arrowTarget = clamp(target);
      scrollTo(arrowTarget, reducedMotion.matches ? 'instant' : 'smooth');
    }

    function finishPointer(event) {
      if (!pointer || (event?.pointerId !== undefined && event.pointerId !== pointer.id)) return;
      const finished = pointer;
      pointer = null;
      releaseEdge(event?.type === 'pointerup');
      if (finished.dragging) suppressClick = true;
      track.removeAttribute(dragAttribute);
      if (track.hasPointerCapture(finished.id)) track.releasePointerCapture(finished.id);
      scheduleUpdate();
    }

    previous.addEventListener('click', () => advance(-1));
    next.addEventListener('click', () => advance(1));
    track.addEventListener('pointerdown', event => {
      finishPointer();
      clearEdge();
      suppressClick = false;
      arrowTarget = null;
      // Touch and trackpads use the browser's native scrolling.
      if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: position(), dragging: false };
    });
    window.addEventListener('pointermove', event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (!(event.buttons & 1)) {
        finishPointer(event);
        return;
      }
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        pointer.dragging = true;
        track.setAttribute(dragAttribute, 'true');
        track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
        track.setPointerCapture(pointer.id);
      }
      event.preventDefault();
      const wanted = pointer.left - dx;
      scrollTo(wanted);
      moveEdge(wanted - clamp(wanted));
    }, { passive: false });
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
    track.addEventListener('lostpointercapture', finishPointer);

    function resetPointer() {
      finishPointer();
      clearEdge();
    }

    window.addEventListener('blur', resetPointer);
    window.addEventListener('pagehide', resetPointer);
    track.addEventListener('dragstart', event => {
      if (pointer) event.preventDefault();
    });
    track.addEventListener('click', event => {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    track.addEventListener('focusin', event => {
      if (pointer) return;
      clearEdge();
      arrowTarget = null;
      const card = event.target.closest('.b3-gallery-card');
      const index = cards.indexOf(card);
      if (index < 0) return;
      const left = track.getBoundingClientRect().left + track.clientLeft;
      const right = left + track.clientWidth;
      const rect = card.getBoundingClientRect();
      if (rect.left < left - epsilon || rect.right > right + epsilon) scrollTo(cardStarts()[index]);
    });

    track.addEventListener('scroll', scheduleUpdate, { passive: true });
    track.addEventListener('wheel', () => { arrowTarget = null; clearEdge(); }, { passive: true });
    track.addEventListener('keydown', () => { arrowTarget = null; clearEdge(); });

    function resized() {
      arrowTarget = null;
      resetPointer();
      scheduleUpdate();
    }

    window.addEventListener('resize', resized, { passive: true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(resized);
      observer.observe(track);
      cards.forEach(card => observer.observe(card));
    }
    reducedMotion.addEventListener('change', () => {
      resetPointer();
      if (reducedMotion.matches && arrowTarget !== null) scrollTo(arrowTarget);
    });

    track.setAttribute('data-b3-ready', '');
    update();
  }

  document.querySelectorAll('#grecho-v3-main .b3-page [data-b3-gallery]').forEach(bindGallery);
})();
