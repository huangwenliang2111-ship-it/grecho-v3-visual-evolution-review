/* Shared progressive enhancement for the Solution galleries. Native overflow
 * provides touch, trackpad and no-script access; only mouse drags are captured. */
(() => {
  'use strict';
  const main = document.querySelector('main[data-ui-family="hub-gallery"]');
  if (!main) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const epsilon = 2;

  for (const gallery of main.querySelectorAll('[data-gallery]')) {
    const track = gallery.querySelector('[data-track]');
    const cards = Array.from(track.children);
    const controls = gallery.querySelector('[data-controls]');
    const previous = controls.querySelector('[data-prev]');
    const next = controls.querySelector('[data-next]');
    const count = controls.querySelector('[data-count]');
    if (!cards.length) continue;

    let pointer = null;
    let suppressClick = false;
    let edgeTimer = 0;
    const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const clamp = n => Math.max(0, Math.min(n, maximum()));
    function starts() {
      const first = cards[0].getBoundingClientRect().left;
      return cards.map(card => clamp(card.getBoundingClientRect().left - first));
    }
    function sync() {
      const max = maximum();
      const focused = document.activeElement;
      controls.hidden = max <= epsilon;
      track.toggleAttribute('data-scrollable', max > epsilon);
      previous.disabled = track.scrollLeft <= epsilon;
      next.disabled = track.scrollLeft >= max - epsilon;
      // Keep keyboard users in this gallery when changing bounds removes their control.
      if ((focused === previous || focused === next) && (controls.hidden || focused.disabled)) {
        const target = controls.hidden ? track : focused === next ? previous : next;
        target.focus({preventScroll:true});
      }
      const bounds = track.getBoundingClientRect();
      const rects = cards.map(card => card.getBoundingClientRect());
      const full = rects.flatMap((r, index) =>
        r.left >= bounds.left - epsilon && r.right <= bounds.right + epsilon ? [index + 1] : []);
      let range;
      if (full.length) {
        range = full.length === 1 ? String(full[0]) : full[0] + '–' + full[full.length - 1];
      } else {
        // Between snap points report a single current item, never a range of partial cards.
        const centre = bounds.left + bounds.width / 2;
        let nearest = 0;
        rects.forEach((r, index) => {
          const distance = b => Math.abs((b.left + b.right) / 2 - centre);
          if (distance(r) < distance(rects[nearest])) nearest = index;
        });
        range = String(nearest + 1);
      }
      const value = range + ' / ' + cards.length;
      if (count.value !== value) count.value = value;
    }

    function scrollToX(left) {
      track.scrollTo({left:clamp(left), behavior:'instant'});
      sync();
    }
    function clearEdge() {
      clearTimeout(edgeTimer);
      track.removeAttribute('data-edge');
      track.style.removeProperty('--hg-edge-x');
    }
    function moveEdge(overshoot) {
      if (Math.abs(overshoot) <= epsilon || reducedMotion.matches) {
        clearEdge();
        return;
      }
      clearTimeout(edgeTimer);
      const offset = -Math.sign(overshoot) * 20 * (1 - Math.exp(-Math.abs(overshoot) / 90));
      track.dataset.edge = 'dragging';
      track.style.setProperty('--hg-edge-x', offset + 'px');
    }
    function finishPointer(event) {
      if (!pointer || (event?.pointerId != null && event.pointerId !== pointer.id)) return;
      const finished = pointer;
      pointer = null;
      if (finished.dragging) suppressClick = true;
      track.removeAttribute('data-dragging');
      if (event?.type === 'pointerup' && track.hasAttribute('data-edge') && !reducedMotion.matches) {
        track.dataset.edge = 'returning';
        track.style.setProperty('--hg-edge-x', '0px');
        edgeTimer = setTimeout(clearEdge, 200);
      } else clearEdge();
      if (track.hasPointerCapture(finished.id)) track.releasePointerCapture(finished.id);
      sync();
    }
    function move(direction) {
      clearEdge();
      const points = starts();
      const current = track.scrollLeft;
      const dest = direction > 0
        ? points.find(n => n > current + epsilon) ?? maximum()
        : points.reverse().find(n => n < current - epsilon) ?? 0;
      scrollToX(dest);
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', sync, {passive:true});
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') scrollToX(event.key === 'End' ? maximum() : 0);
      else move(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener('focusin', event => {
      if (pointer) return;
      const card = event.target.closest('article');
      if (!card) return;
      const r = card.getBoundingClientRect(), bounds = track.getBoundingClientRect();
      if (r.left < bounds.left - epsilon || r.right > bounds.right + epsilon) {
        scrollToX(starts()[cards.indexOf(card)]);
      }
    });

    track.addEventListener('pointerdown', event => {
      finishPointer();
      clearEdge();
      suppressClick = false;
      if (event.pointerType !== 'mouse' || !event.isPrimary || event.button !== 0 || maximum() <= epsilon) return;
      if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      pointer = {id:event.pointerId, x:event.clientX, y:event.clientY, left:track.scrollLeft, dragging:false};
    });
    window.addEventListener('pointermove', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (!(event.buttons & 1)) { finishPointer(event); return; }
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (!pointer.dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        pointer.dragging = true;
        track.setAttribute('data-dragging','');
        track.setPointerCapture(pointer.id);
      }
      event.preventDefault();
      const target = pointer.left - dx;
      scrollToX(target);
      moveEdge(target - clamp(target));
    }, {passive:false});
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
    track.addEventListener('lostpointercapture', finishPointer);
    window.addEventListener('blur', () => { finishPointer(); clearEdge(); });
    window.addEventListener('pagehide', () => { finishPointer(); clearEdge(); });
    track.addEventListener('dragstart', event => { if (pointer) event.preventDefault(); });
    track.addEventListener('click', event => {
      if (!suppressClick || !event.detail) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    function resetGeometry() { finishPointer(); clearEdge(); sync(); }
    new ResizeObserver(resetGeometry).observe(track);
    reducedMotion.addEventListener('change', resetGeometry);
    sync();
  }
})();
