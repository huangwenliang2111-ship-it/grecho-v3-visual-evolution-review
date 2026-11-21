/* C01 R2 galleries use native overflow, enhanced with controls and mouse drag. */
(() => {
  const challenge = document.getElementById("grecho-challenge-C01");
  if (!challenge) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dragThreshold = 8;
  const edgeTolerance = 1;

  challenge.querySelectorAll("[data-c01-rail]").forEach(rail => {
    const controls = rail.parentElement.querySelector("[data-c01-rail-controls]");
    const previous = controls?.querySelector("[data-c01-rail-previous]");
    const next = controls?.querySelector("[data-c01-rail-next]");
    const firstCard = rail.firstElementChild;
    const secondCard = firstCard?.nextElementSibling;
    if (!previous || !next || !secondCard) return;

    const maximum = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
    const clamp = position => Math.max(0, Math.min(position, maximum()));
    const updateControls = () => {
      previous.disabled = rail.scrollLeft <= edgeTolerance;
      next.disabled = maximum() - rail.scrollLeft <= edgeTolerance;
    };
    const go = position => rail.scrollTo({
      left: clamp(position),
      behavior: motion.matches ? "instant" : "smooth",
    });
    const step = direction => {
      const cardStep = secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left;
      go(rail.scrollLeft + direction * cardStep);
    };

    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    rail.addEventListener("scroll", updateControls, { passive: true });
    new ResizeObserver(updateControls).observe(rail);

    rail.addEventListener("keydown", event => {
      if (event.target !== rail || event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key;
      if (key === "ArrowLeft" || key === "ArrowRight") step(key === "ArrowLeft" ? -1 : 1);
      else if (key === "Home" || key === "End") go(key === "Home" ? 0 : maximum());
      else return;
      event.preventDefault();
    });

    rail.addEventListener("focusin", event => {
      const card = event.target.closest("article");
      if (!card || card.parentElement !== rail) return;
      const trackBox = rail.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      if (cardBox.left < trackBox.left) rail.scrollLeft = clamp(rail.scrollLeft + cardBox.left - trackBox.left);
      if (cardBox.right > trackBox.right) rail.scrollLeft = clamp(rail.scrollLeft + cardBox.right - trackBox.right);
    });

    let drag = null;
    let blockDragClick = false;

    rail.addEventListener("pointerdown", event => {
      blockDragClick = false;
      if (event.pointerType !== "mouse" || event.button !== 0 || !event.isPrimary) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: rail.scrollLeft, started: false };
    });

    window.addEventListener("pointermove", event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.started) {
        if (Math.abs(dy) >= dragThreshold && Math.abs(dy) >= Math.abs(dx)) {
          drag = null;
          return;
        }
        if (Math.abs(dx) < dragThreshold) return;
        drag.started = true;
        rail.setPointerCapture(event.pointerId);
        rail.setAttribute("data-rail-grabbing", "");
        const selection = window.getSelection();
        if (selection?.anchorNode && rail.contains(selection.anchorNode)) selection.removeAllRanges();
      }
      rail.scrollLeft = clamp(drag.start - dx);
      event.preventDefault();
    }, { passive: false });

    const finishDrag = event => {
      if (!drag || event.pointerId !== drag.id) return;
      blockDragClick = drag.started && event.type === "pointerup";
      drag = null;
      rail.removeAttribute("data-rail-grabbing");
    };
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    rail.addEventListener("dragstart", event => {
      if (drag) event.preventDefault();
    });
    rail.addEventListener("click", event => {
      if (!blockDragClick || event.detail === 0) return;
      blockDragClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, { capture: true });

    updateControls();
    rail.setAttribute("data-rail-ready", "");
    controls.hidden = false;
  });
})();

