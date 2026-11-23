/* Approved B3 Gallery interaction, scoped to the three B4 article pilots. */
(() => {
  'use strict';

  function bindGallery(gallery) {
    const track = gallery?.querySelector('[data-b4-track]');
    const controls = gallery?.querySelector('[data-b4-controls]');
    const previous = controls?.querySelector('[data-b4-prev]');
    const next = controls?.querySelector('[data-b4-next]');
    const progress = controls?.querySelector('[data-b4-count]');
    if (!track?.id || track.hasAttribute('data-b4-ready') || !previous || !next || !progress ||
        previous.getAttribute('aria-controls') !== track.id || next.getAttribute('aria-controls') !== track.id) return;
    const cards = [...track.children].filter(card => card.matches('.b4-gallery-card'));
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const epsilon = 1;
    const dragAttribute = 'data-b4-dragging';
    const edgeAttribute = 'data-b4-edge';
    const edgeProperty = '--b4-edge-x';
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
      const card = event.target.closest('.b4-gallery-card');
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

    track.setAttribute('data-b4-ready', '');
    update();
  }

  const article = document.querySelector('#grecho-v3-main > .b4-article');
  if (!article || article.hasAttribute('data-b4-ready')) return;
  article.setAttribute('data-b4-ready', '');
  article.querySelectorAll('[data-b4-gallery]').forEach(bindGallery);

  const header = document.querySelector('header[data-grecho-v3-nav]');
  const toc = article.querySelector('details[data-b4-toc]');
  const nav = toc?.querySelector('nav');
  const faqNav = nav?.querySelector('details[data-b4-toc-faq]');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const entries = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])].flatMap(link => {
    const target = fragmentTarget(link.hash);
    return target ? [{ link, target }] : [];
  });
  const entryForTarget = new Map(entries.map(entry => [entry.target, entry]));
  const faqChapterLink = faqNav?.parentElement.querySelector(':scope > a');
  const faqChapter = entries.find(entry => entry.link === faqChapterLink);
  const tableRegions = [...article.querySelectorAll('[data-b4-table-scroll]')];

  let active = null;
  let requestedFaqLink = null;
  let readingFrame = 0;
  let navigationFrame = 0;

  function fragmentTarget(hash) {
    if (!hash) return null;
    try {
      const node = document.getElementById(decodeURIComponent(hash.slice(1)));
      return node && article.contains(node) ? node : null;
    } catch {
      return null;
    }
  }

  function headerBottom() {
    return Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
  }

  function setCurrent(entry) {
    if (entry && faqNav && !faqNav.open && faqNav.contains(entry.link)) entry = faqChapter ?? null;
    if (active === entry) return;
    active?.link.removeAttribute('aria-current');
    active = entry;
    entry?.link.setAttribute('aria-current', 'location');
  }

  function readPosition() {
    readingFrame = 0;
    if (navigationFrame) return;
    // After an expanded FAQ answer is closed, its own summary still provides
    // the chapter position. Hidden descendants of closed disclosures do not.
    const line = headerBottom() + 38;
    let reached = null;
    for (const entry of entries) {
      const rect = entry.target.getBoundingClientRect();
      if (entry.target.getClientRects().length && rect.top <= line) reached = entry;
    }
    setCurrent(reached);
  }

  function requestReadingUpdate() {
    if (!readingFrame) readingFrame = window.requestAnimationFrame(readPosition);
  }

  function refreshGeometry() {
    if (header) article.style.setProperty('--b4-header-height', header.offsetHeight + 'px');
    tableRegions.forEach(region => {
      const cue = region.closest('.b4-table-frame')?.querySelector('[data-b4-table-cue]');
      if (!cue) return;
      cue.hidden = region.scrollWidth <= region.clientWidth;
      if (!cue.id) return;
      const previous = region.getAttribute('aria-describedby')?.trim() || '';
      const labels = previous.split(/\s+/).filter(id => id && id !== cue.id);
      if (!cue.hidden) labels.push(cue.id);
      const description = labels.join(' ');
      if (description && description !== previous) region.setAttribute('aria-describedby', description);
      if (!description && previous) region.removeAttribute('aria-describedby');
    });
    requestReadingUpdate();
  }

  function syncTocBreakpoint() {
    if (toc) toc.open = desktop.matches;
    requestReadingUpdate();
  }

  function revealRequestedFaqLink() {
    if (!requestedFaqLink || !toc?.open || !faqNav?.open) return;
    const link = requestedFaqLink;
    requestedFaqLink = null;
    if (nav.scrollHeight <= nav.clientHeight) return;
    const scrollBounds = nav.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    if (linkBounds.bottom > scrollBounds.bottom) nav.scrollTop += linkBounds.bottom - scrollBounds.bottom;
    if (linkBounds.top < scrollBounds.top) nav.scrollTop += linkBounds.top - scrollBounds.top;
  }

  function syncFragment() {
    const target = fragmentTarget(window.location.hash);
    const entry = entryForTarget.get(target);
    const answer = target?.closest('.b4-article-faq details');
    requestedFaqLink = null;
    if (answer) {
      answer.open = true;
      if (entry && faqNav?.contains(entry.link)) {
        faqNav.open = true;
        requestedFaqLink = entry.link;
      }
    }
    if (entry) setCurrent(entry);
    window.cancelAnimationFrame(navigationFrame);
    navigationFrame = window.requestAnimationFrame(() => {
      navigationFrame = 0;
      // Native link/history navigation handles regular fragments. An explicit
      // FAQ fragment can need realignment after opening its answer or TOC sublist.
      if (answer && fragmentTarget(window.location.hash) === target) {
        const desired = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || headerBottom() + 16;
        const delta = target.getBoundingClientRect().top - desired;
        if (Math.abs(delta) > 2) window.scrollBy({ top: delta, behavior: 'instant' });
        revealRequestedFaqLink();
      }
      requestReadingUpdate();
    });
  }

  nav?.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (link?.href === window.location.href) syncFragment();
  });

  refreshGeometry();
  syncTocBreakpoint();
  syncFragment();
  desktop.addEventListener('change', syncTocBreakpoint);
  window.addEventListener('hashchange', syncFragment);
  window.addEventListener('popstate', syncFragment);
  window.addEventListener('pageshow', event => { if (event.persisted) syncFragment(); });
  window.addEventListener('scroll', requestReadingUpdate, { passive: true });
  window.addEventListener('resize', refreshGeometry, { passive: true });
  article.addEventListener('toggle', event => {
    if (event.target === faqNav && !faqNav.open) requestedFaqLink = null;
    if (event.target === toc && toc.open) revealRequestedFaqLink();
    requestReadingUpdate();
  }, true);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refreshGeometry);
    if (header) observer.observe(header);
    tableRegions.forEach(region => {
      observer.observe(region);
      const table = region.querySelector('table');
      if (table) observer.observe(table);
    });
  }
  document.fonts?.ready.then(refreshGeometry);

  let closedForPrint = null;
  window.addEventListener('beforeprint', () => {
    if (closedForPrint) return;
    closedForPrint = [...article.querySelectorAll('details:not([open])')];
    closedForPrint.forEach(detail => { detail.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closedForPrint?.forEach(detail => { detail.open = false; });
    closedForPrint = null;
  });
})();
