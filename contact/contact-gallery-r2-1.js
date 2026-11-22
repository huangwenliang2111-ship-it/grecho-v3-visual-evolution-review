(() => {
  'use strict';

  const contact = document.getElementById('contact-top');
  const form = contact?.querySelector('#request-form');
  if (!form) return;

  const requestTypes = new Map([
    ['technical-data', 'Request Technical Data'],
    ['sample', 'Request a Sample'],
    ['quote', 'Request a Quote'],
    ['technical-team', 'Talk to Technical Team'],
    ['general', 'General Inquiry'],
    ['application-review', 'Application Review'],
  ]);
  const documentTypes = new Map([
    ['product-brief', 'Product Brief'],
    ['color-tds', 'Color TDS / Marketing TDS'],
    ['full-tds', 'Full TDS by Review'],
    ['fire-test-document', 'Fire Test Document'],
    ['compliance-document', 'Compliance / Sustainability Document'],
    ['sds-msds', 'SDS / MSDS'],
    ['not-sure', 'Not Sure / Need Recommendation'],
  ]);
  const references = new Map([
    ['tds_id', 'TDS reference'],
    ['product', 'Product reference'],
    ['product_family', 'Product family reference'],
    ['sales_code', 'Sales code reference'],
    ['product_model', 'Model reference'],
    ['solution', 'Solution reference'],
    ['route_id', 'Route reference'],
    ['source', 'Source'],
  ]);

  const requestField = form.querySelector('#ff_3_dropdown');
  const directionField = form.querySelector('#ff_3_product_direction');
  const documentFields = [...form.querySelectorAll('input[name="requested_documents[]"]')];
  const notice = form.querySelector('[data-contact-context]');
  const summary = notice?.querySelector('[data-contact-context-summary]');
  const guidance = [...form.querySelectorAll('[data-contact-guidance]')];
  const guideTitle = form.querySelector('[data-contact-current-guide-title]');
  const guideText = form.querySelector('[data-contact-current-guide]');
  const defaultGuideTitle = guideTitle?.textContent;
  const defaultGuideText = guideText?.textContent;
  const requestPaths = [...contact.querySelectorAll('#request-paths a[href]')];
  const focusTarget = form.querySelector('[data-contact-request-focus]') || form;
  const formHashes = new Set(['#request-form', '#unified-request-form']);

  if (!focusTarget.hasAttribute('tabindex')) focusTarget.tabIndex = -1;

  function optionValue(select, value) {
    return value && select && [...select.options].some(option => option.value === value)
      ? value
      : '';
  }

  function contextValue(value) {
    return value?.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, 120) || '';
  }

  function requestToken(link, destination) {
    const href = link.getAttribute('href').trim();
    return link.dataset.contactIntent || (href.startsWith('#') ? '' : destination.searchParams.get('request')) || '';
  }

  function render(url) {
    const query = url.searchParams;
    const requested = query.get('request');
    const requestLabel = requestTypes.get(requested);
    const rawDirection = query.get('product_direction');
    const direction = optionValue(directionField, rawDirection);
    const documentTokens = new Set(query.getAll('doc'));
    const selectedDocuments = new Set();

    if (requestField) requestField.value = optionValue(requestField, requestLabel);
    if (directionField) directionField.value = direction;

    const parts = [];
    if (requestLabel) {
      parts.push('Request: ' + requestLabel);
    } else if (contextValue(requested)) {
      parts.push('Request reference (unmatched): ' + contextValue(requested));
    }

    for (const token of documentTokens) {
      const label = documentTypes.get(token);
      if (label) {
        selectedDocuments.add(label);
        parts.push('Document: ' + label);
      } else if (token === 'review-required') {
        parts.push('Document access: Review required');
      } else if (contextValue(token)) {
        parts.push('Document reference (unmatched): ' + contextValue(token));
      }
    }
    for (const field of documentFields) field.checked = selectedDocuments.has(field.value);

    if (direction) {
      parts.push('Product direction: ' + direction);
    } else if (contextValue(rawDirection)) {
      parts.push('Product direction reference (unmatched): ' + contextValue(rawDirection));
    }

    for (const [key, label] of references) {
      const value = contextValue(query.get(key));
      if (value) parts.push(label + ': ' + value);
    }
    if (notice && summary) {
      summary.textContent = parts.join(' · ');
      notice.hidden = parts.length === 0;
    }

    const guideToken = requested === 'technical-team' ? 'application-review' : requested;
    for (const panel of guidance) {
      const selected = panel.dataset.contactGuidance === guideToken;
      panel.classList.toggle('is-active', selected);
      if (selected && panel.tagName === 'DETAILS') panel.open = true;
    }
    if (guideTitle && guideText) {
      const activeGuide = guidance.find(panel => panel.dataset.contactGuidance === guideToken);
      guideTitle.textContent = activeGuide?.querySelector('summary').textContent || defaultGuideTitle;
      guideText.textContent = activeGuide?.dataset.contactGuidanceBrief || defaultGuideText;
    }
    for (const link of requestPaths) {
      const target = new URL(link.href);
      if (requestLabel && requestToken(link, target) === requested) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function pagePath(url) {
    return url.pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
  }

  function focusForm() {
    window.requestAnimationFrame(() => {
      focusTarget.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.closest('[aria-disabled="true"]') || link.hasAttribute('download') ||
        (link.target && link.target.toLowerCase() !== '_self')) return;

    const current = new URL(window.location.href);
    const destination = new URL(link.href);
    if (destination.origin !== current.origin || pagePath(destination) !== pagePath(current)) return;

    const nextRequest = requestToken(link, destination);
    if (nextRequest && !requestTypes.has(nextRequest)) return;
    if (!formHashes.has(destination.hash) && (destination.hash || !nextRequest)) return;

    const next = new URL(current);
    for (const [key, value] of destination.searchParams) {
      if (key !== 'request' && !current.searchParams.has(key)) next.searchParams.append(key, value);
    }
    if (nextRequest) next.searchParams.set('request', nextRequest);
    next.hash = destination.hash || '#request-form';

    event.preventDefault();
    if (next.href !== current.href) window.history.pushState(null, '', next.href);
    render(next);
    focusForm();
  });

  window.addEventListener('popstate', () => {
    window.requestAnimationFrame(() => render(new URL(window.location.href)));
  });

  const initial = new URL(window.location.href);
  render(initial);
  if (formHashes.has(initial.hash)) focusForm();
})();

/* Contact request gallery adapted from the accepted homepage native track. */
(() => {
  'use strict';

  const gallery = document.querySelector('#contact-top #request-paths[data-contact-gallery]');
  const track = gallery?.querySelector('[data-contact-gallery-track]');
  const controls = gallery?.querySelector('[data-contact-gallery-controls]');
  const previous = controls?.querySelector('[data-contact-gallery-prev]');
  const next = controls?.querySelector('[data-contact-gallery-next]');
  const progress = controls?.querySelector('[data-contact-gallery-count]');
  if (!track?.id || !previous || !next || !progress ||
      previous.getAttribute('aria-controls') !== track.id || next.getAttribute('aria-controls') !== track.id) return;
  const cards = [...track.children].filter(card => card.matches('.cg-path'));
  if (!cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const epsilon = 1;
  const dragAttribute = 'data-contact-gallery-dragging';
  const edgeAttribute = 'data-contact-gallery-edge';
  const edgeProperty = '--contact-gallery-edge-x';
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
    const card = event.target.closest('.cg-path');
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
  track.setAttribute('data-contact-gallery-ready', '');
  update();
})();
