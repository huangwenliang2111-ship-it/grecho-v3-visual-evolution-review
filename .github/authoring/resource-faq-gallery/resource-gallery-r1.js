/* Local search for the fifteen Color TDS reference records. */
(() => {
  'use strict';

  const library = document.querySelector('#resource-gallery #color-tds-library');
  const controls = library?.querySelector('[data-rc-search-controls]');
  const input = controls?.querySelector('#rc-tds-search');
  const clear = controls?.querySelector('[data-rc-clear]');
  const status = controls?.querySelector('[data-rc-results-status]');
  if (!input || !clear || !status) return;

  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[-\u2010-\u2015]/g, ' ').trim();
  const records = [...library.querySelectorAll('[data-rc-record]')].map(element => {
    const id = element.getAttribute('data-rc-record');
    const title = element.querySelector('[data-rc-document-title]')?.textContent.trim();
    return { element, id, title, index: normalize(id + ' ' + (title || '')) };
  });
  if (records.length !== 15 || records.some(({ id, title }, index) =>
    !title || id !== 'CTDS-' + String(index + 1).padStart(3, '0'))) return;

  function updateResults() {
    const query = normalize(input.value);
    const terms = query ? query.split(/\s+/) : [];
    let count = 0;

    for (const record of records) {
      const matches = terms.every(term => record.index.includes(term));
      record.element.hidden = !matches;
      if (matches) count += 1;
    }

    const message = count === 0
      ? 'No references found. Clear the search to see all 15.'
      : count + (count === 1 ? ' reference' : ' references');
    if (status.textContent !== message) status.textContent = message;
  }

  function reset() {
    input.value = '';
    updateResults();
    input.focus();
  }

  input.addEventListener('input', updateResults);
  input.addEventListener('search', updateResults);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      reset();
    }
  });
  clear.addEventListener('click', reset);
  updateResults();
  controls.hidden = false;
})();

/* Access conditions remain native details when script is unavailable. */
(() => {
  'use strict';

  const items = document.querySelectorAll('#resource-gallery [data-rc-condition]');
  const states = [];
  function place({ details, trigger, text }) {
    if (!details.open) return;
    const from = trigger.getBoundingClientRect();
    const box = text.getBoundingClientRect();
    const gutter = 8;
    const left = Math.max(gutter, Math.min(from.left, document.documentElement.clientWidth - box.width - gutter));
    const below = from.bottom - 1;
    const top = below + box.height <= window.innerHeight - gutter ? below : from.top - box.height + 1;
    details.style.setProperty('--rc-tip-x', left + 'px');
    details.style.setProperty('--rc-tip-y', Math.max(gutter, top) + 'px');
  }

  function render(state) {
    state.details.open = !state.dismissed && (state.hovered || state.focused || state.pinned);
    place(state);
  }

  function dismiss(state) {
    state.pinned = false;
    state.dismissed = true;
    render(state);
  }

  for (const details of items) {
    const trigger = details.querySelector('summary');
    const text = details.querySelector('.rc-condition-text');
    if (!trigger || !text || trigger.getAttribute('aria-describedby') !== text.id) continue;
    const state = { details, trigger, text, hovered: false, focused: false, pinned: false, dismissed: false };
    states.push(state);
    details.setAttribute('data-rc-condition-ready', '');

    details.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      state.hovered = true;
      state.dismissed = false;
      render(state);
    });
    details.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      state.hovered = false;
      render(state);
    });
    trigger.addEventListener('focus', () => {
      state.focused = true;
      state.dismissed = false;
      render(state);
    });
    trigger.addEventListener('blur', () => {
      state.focused = false;
      render(state);
    });
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (state.pinned) {
        dismiss(state);
      } else {
        states.filter(other => other !== state && other.details.open).forEach(dismiss);
        state.pinned = true;
        state.dismissed = false;
        render(state);
      }
    });
  }

  if (!states.length) return;
  document.addEventListener('pointerdown', event => {
    states.filter(state => state.details.open && !state.details.contains(event.target)).forEach(dismiss);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') states.filter(state => state.details.open).forEach(dismiss);
  });
  const reposition = () => states.forEach(place);
  window.addEventListener('resize', reposition, { passive: true });
  window.addEventListener('scroll', reposition, { passive: true });
})();

/* Multi-instance adaptation of the accepted Contact/Home gallery. */
(() => {
  'use strict';

  function bindGallery(gallery) {
    const track = gallery?.querySelector('[data-rc-track]');
    const controls = gallery?.querySelector('[data-rc-controls]');
    const previous = controls?.querySelector('[data-rc-prev]');
    const next = controls?.querySelector('[data-rc-next]');
    const progress = controls?.querySelector('[data-rc-count]');
    if (!track?.id || !previous || !next || !progress ||
        previous.getAttribute('aria-controls') !== track.id || next.getAttribute('aria-controls') !== track.id) return;
    const cards = [...track.children].filter(card => card.matches('.rc-gallery-card'));
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const epsilon = 1;
    const dragAttribute = 'data-rc-dragging';
    const edgeAttribute = 'data-rc-edge';
    const edgeProperty = '--rc-edge-x';
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
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
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
      const card = event.target.closest('.rc-gallery-card');
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

    controls.hidden = false;
    track.setAttribute('data-rc-ready', '');
    update();
  }

  document.querySelectorAll('#resource-gallery [data-rc-gallery]').forEach(bindGallery);
})();
