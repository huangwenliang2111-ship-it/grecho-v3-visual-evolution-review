/* Local review only. Eligibility comes from audit viewer_allowlist.json.
   Canonical images and business CTA attributes are never changed. */
(() => {
  'use strict';
  if (typeof HTMLDialogElement === 'undefined') return;

  const ELIGIBLE = [
  {
    "page_id": "P01",
    "media_binding": "white-acoustic-ceiling-facer:b0029:rId6",
    "section_id": "section-02",
    "src": "../media/a7b4212fa7a5d6b6f4f6c7dcd1aafaa64bc456a4d19c6fb364201067fa6b8457.webp",
    "source_media_sha256": "ba65ba19e11d124358908369fb7cf3c76cc7d580d8d9a79fb87af7a8aa579908"
  },
  {
    "page_id": "P01",
    "media_binding": "white-acoustic-ceiling-facer:b0100:rId10",
    "section_id": "section-06",
    "src": "../media/0458b77410a4da47d48343166551bffc0d80d3401b946a0dbe8dddd99ee40db1.webp",
    "source_media_sha256": "ac16186bd6a5b16ea308630b77e992f04d07ecebd6251bc1a87a9ced367c7815"
  },
  {
    "page_id": "P02",
    "media_binding": "aluminum-foil-facers-for-thermal-insulation:b0105:rId11",
    "section_id": "section-06",
    "src": "../media/fde66a74be4f4e98ed2c786b17aa973184e78bef28d155d873b9d6c3ca848205.webp",
    "source_media_sha256": "cbfe4bbcd472593e2cdabd66be223914322d102cdb9e662bf17926cb2add1862"
  },
  {
    "page_id": "P03",
    "media_binding": "fiberglass-coated-veil-for-mineral-wool-roof-insulation:b0105:rId10",
    "section_id": "section-06",
    "src": "../media/18ba8bd04ac467c97ae0a864c971d87d24c8a27b3d58634ba92cc9667e9f38cb.webp",
    "source_media_sha256": "3c236bcbc7ea4ca9cbaf08983e1a13f8c441d1df9d6cb09665e59ba09242a138"
  },
  {
    "page_id": "P04",
    "media_binding": "fiberglass-coated-veil-for-pir-pur-insulation-boards:b0105:rId10",
    "section_id": "section-06",
    "src": "../media/a3be7eeca5af74c02d72b84f7dacdeabf2a378ff162a6f9ccf2b1ecdf32faacd.webp",
    "source_media_sha256": "7c34f04b99d64ef7f622ff3bff3524ef06761abddad4e27f0a092c88aac20b2f"
  },
  {
    "page_id": "P06",
    "media_binding": "high-air-permeability-fiberglass-coated-veil:b0034:rId6",
    "section_id": "section-02",
    "src": "../media/3e92f0a1f0192d3d2255d71ce3e8d069dd7e36dc36d644c750cfc3d8ba0056cf.webp",
    "source_media_sha256": "d9c56b06839f0bb6560e67f5a8eb882c1c8c6ce1f6886e2cc394b3725053b501"
  },
  {
    "page_id": "P06",
    "media_binding": "high-air-permeability-fiberglass-coated-veil:b0105:rId10",
    "section_id": "section-06",
    "src": "../media/0458b77410a4da47d48343166551bffc0d80d3401b946a0dbe8dddd99ee40db1.webp",
    "source_media_sha256": "ac16186bd6a5b16ea308630b77e992f04d07ecebd6251bc1a87a9ced367c7815"
  },
  {
    "page_id": "P07",
    "media_binding": "low-air-permeability-fiberglass-coated-veil:b0034:rId6",
    "section_id": "section-02",
    "src": "../media/3e92f0a1f0192d3d2255d71ce3e8d069dd7e36dc36d644c750cfc3d8ba0056cf.webp",
    "source_media_sha256": "d9c56b06839f0bb6560e67f5a8eb882c1c8c6ce1f6886e2cc394b3725053b501"
  },
  {
    "page_id": "P07",
    "media_binding": "low-air-permeability-fiberglass-coated-veil:b0107:rId10",
    "section_id": "section-06",
    "src": "../media/0458b77410a4da47d48343166551bffc0d80d3401b946a0dbe8dddd99ee40db1.webp",
    "source_media_sha256": "ac16186bd6a5b16ea308630b77e992f04d07ecebd6251bc1a87a9ced367c7815"
  },
  {
    "page_id": "P08",
    "media_binding": "matte-black-fiberglass-coated-veil:b0029:rId6",
    "section_id": "section-02",
    "src": "../media/33eda9d98768e20163f0e28b9e8288c2967b24cadef14d8b4a7c84625e386906.webp",
    "source_media_sha256": "8f888104797b7dd7e98d622ebe7a894d93ff085594e5b8cc2677c6ce932fc66a"
  },
  {
    "page_id": "P08",
    "media_binding": "matte-black-fiberglass-coated-veil:b0092:rId10",
    "section_id": "section-06",
    "src": "../media/d209e920d85cbe0ef9920e60d720ce38ff87e21de16087259a2eb3e2fd544ea4.webp",
    "source_media_sha256": "8f0a19b5780f0bf6d79d9f8452ede60db60bb47c822a53932c98a6f96ba54cbe"
  },
  {
    "page_id": "P09",
    "media_binding": "washable-fiberglass-coated-veil:b0032:rId6",
    "section_id": "section-02",
    "src": "../media/ca91bb9c58d680f717f17dc6381e51510dc9b117333e548c579a4a8742b9cb64.webp",
    "source_media_sha256": "46e5653946a997547607e9edd67bdb341f8b9b2d0ef9cc9537377fa388fad07d"
  },
  {
    "page_id": "P09",
    "media_binding": "washable-fiberglass-coated-veil:b0095:rId10",
    "section_id": "section-06",
    "src": "../media/0458b77410a4da47d48343166551bffc0d80d3401b946a0dbe8dddd99ee40db1.webp",
    "source_media_sha256": "ac16186bd6a5b16ea308630b77e992f04d07ecebd6251bc1a87a9ced367c7815"
  },
  {
    "page_id": "P11",
    "media_binding": "wood-grain-fiberglass-coated-veil:b0033:rId6",
    "section_id": "section-02",
    "src": "../media/568e5fc659c675b0d47b9f0f4d45c0e57c804c2d3320f3a19ddf76f78f1b8e7c.webp",
    "source_media_sha256": "373c80aa01452ee3fec739140db91e050a9b12f24f086547fe8104d1c88eb059"
  },
  {
    "page_id": "P11",
    "media_binding": "wood-grain-fiberglass-coated-veil:b0096:rId10",
    "section_id": "section-06",
    "src": "../media/ee267759458dd8a41d69617628ad2d8eea5b762b32019a3dc9de182bf3b4ffa1.webp",
    "source_media_sha256": "ee267759458dd8a41d69617628ad2d8eea5b762b32019a3dc9de182bf3b4ffa1"
  },
  {
    "page_id": "P12",
    "media_binding": "fiberglass-coated-veil-for-gypsum-board:b0091:rId10",
    "section_id": "section-06",
    "src": "../media/f7c4be8783953edfa27606700f64b11ba1840c6f4dffb1edf0c672812e641cda.webp",
    "source_media_sha256": "c952beb8c4678a2ee1e0d9eff24d25ccff13e3aac0390dd5c9e77a62faa47f4e"
  },
  {
    "page_id": "P13",
    "media_binding": "high-waterproof-fiberglass-coated-veil-for-gypsum-board:b0096:rId10",
    "section_id": "section-06",
    "src": "../media/f7c4be8783953edfa27606700f64b11ba1840c6f4dffb1edf0c672812e641cda.webp",
    "source_media_sha256": "c952beb8c4678a2ee1e0d9eff24d25ccff13e3aac0390dd5c9e77a62faa47f4e"
  },
  {
    "page_id": "P14",
    "media_binding": "uv-resistant-fiberglass-coated-veil:b0033:rId6",
    "section_id": "section-02",
    "src": "../media/8a69bf9ea466c0543f3970cf4eea841027217ce7f7410408f627d0b18207211f.webp",
    "source_media_sha256": "f58bb5c8ad70b020e7714d8c18a2fe4c6aaed40a46b5d50bbc0a5d83c3afebc4"
  },
  {
    "page_id": "P14",
    "media_binding": "uv-resistant-fiberglass-coated-veil:b0090:rId10",
    "section_id": "section-06",
    "src": "../media/f7c4be8783953edfa27606700f64b11ba1840c6f4dffb1edf0c672812e641cda.webp",
    "source_media_sha256": "c952beb8c4678a2ee1e0d9eff24d25ccff13e3aac0390dd5c9e77a62faa47f4e"
  }
];
  const byBinding = new Map(ELIGIBLE.map(entry => [entry.media_binding, entry]));
  const canonicalImages = [...document.querySelectorAll('img[data-media-binding]')];
  const occurrences = new Map();
  canonicalImages.forEach(image => {
    const binding = image.getAttribute('data-media-binding');
    occurrences.set(binding, (occurrences.get(binding) || 0) + 1);
  });

  let dialog;
  let viewport;
  let canvas;
  let image;
  let status;
  let closeButton;
  let fitButton;
  let originalButton;
  let zoomOutButton;
  let zoomInButton;
  let invokingControl;
  let savedPage;
  let fitScale = 1;
  let scale = 1;
  let isFitView = true;

  function control(text, className, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  }

  function setScale(nextScale, fitView) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const previousWidth = parseFloat(image.style.width) || image.naturalWidth;
    const previousHeight = parseFloat(image.style.height) || image.naturalHeight;
    const previousLeft = Math.max(0, (viewport.clientWidth - previousWidth) / 2);
    const previousTop = Math.max(0, (viewport.clientHeight - previousHeight) / 2);
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - previousLeft) / previousWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2 - previousTop) / previousHeight;
    scale = Math.min(1, Math.max(fitScale, nextScale));
    isFitView = fitView;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    image.style.width = width + 'px';
    image.style.height = height + 'px';
    canvas.style.width = Math.max(viewport.clientWidth, width) + 'px';
    canvas.style.height = Math.max(viewport.clientHeight, height) + 'px';
    const newLeft = Math.max(0, (viewport.clientWidth - width) / 2);
    const newTop = Math.max(0, (viewport.clientHeight - height) / 2);
    viewport.scrollLeft = fitView ? 0 : centerX * width + newLeft - viewport.clientWidth / 2;
    viewport.scrollTop = fitView ? 0 : centerY * height + newTop - viewport.clientHeight / 2;
    zoomOutButton.disabled = scale <= fitScale + 0.001;
    zoomInButton.disabled = scale >= 0.999;
    status.textContent = Math.round(scale * 100) + '% · ' + image.naturalWidth + ' × ' + image.naturalHeight + ' px';
    viewport.dataset.viewerScale = String(scale);
    viewport.dataset.viewerFitScale = String(fitScale);
  }

  function resizeView() {
    if (!dialog?.open || !image?.naturalWidth || !image?.naturalHeight) return;
    fitScale = Math.min(1, viewport.clientWidth / image.naturalWidth, viewport.clientHeight / image.naturalHeight);
    setScale(isFitView ? fitScale : scale, isFitView);
  }

  function restorePage() {
    if (!savedPage) return;
    const root = document.documentElement;
    root.style.overflow = savedPage.rootOverflow;
    root.style.scrollbarGutter = savedPage.rootGutter;
    document.body.style.overflow = savedPage.bodyOverflow;
    // Native dialog restores focus too; preventScroll protects the exact scroll position.
    invokingControl?.focus({ preventScroll: true });
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(savedPage.x, savedPage.y);
    root.style.scrollBehavior = previousBehavior;
    savedPage = null;
    invokingControl = null;
    image?.remove();
    image = null;
    canvas.style.width = '';
    canvas.style.height = '';
    status.textContent = '';
    delete viewport.dataset.viewerScale;
    delete viewport.dataset.viewerFitScale;
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'grecho-image-viewer';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Larger image');
    const toolbar = document.createElement('div');
    toolbar.className = 'grecho-image-viewer__toolbar';
    const heading = document.createElement('strong');
    heading.className = 'grecho-image-viewer__heading';
    heading.textContent = 'Larger image';
    closeButton = control('Close', 'grecho-image-viewer__control grecho-image-viewer__close', () => dialog.close());
    closeButton.setAttribute('aria-label', 'Close image viewer');
    toolbar.append(heading, closeButton);

    const actions = document.createElement('div');
    actions.className = 'grecho-image-viewer__actions';
    fitButton = control('Fit image', 'grecho-image-viewer__control', () => setScale(fitScale, true));
    originalButton = control('Original size', 'grecho-image-viewer__control', () => setScale(1, false));
    zoomOutButton = control('Zoom out', 'grecho-image-viewer__control', () => setScale(scale / 1.4, false));
    zoomInButton = control('Zoom in', 'grecho-image-viewer__control', () => setScale(scale * 1.4, false));
    status = document.createElement('output');
    status.className = 'grecho-image-viewer__status';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-label', 'Image zoom and original dimensions');
    actions.append(fitButton, originalButton, zoomOutButton, zoomInButton, status);

    viewport = document.createElement('div');
    viewport.className = 'grecho-image-viewer__viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', 'Image viewport. Use arrow keys to pan when zoomed.');
    canvas = document.createElement('div');
    canvas.className = 'grecho-image-viewer__canvas';
    viewport.append(canvas);
    const help = document.createElement('p');
    help.className = 'grecho-image-viewer__help';
    help.textContent = 'Zoom in, then swipe, scroll or use arrow keys to pan. Original size shows the source pixels.';
    dialog.append(toolbar, actions, viewport, help);
    document.body.append(dialog);

    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener('close', restorePage);
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    });
    viewport.addEventListener('keydown', event => {
      if (event.target !== viewport) return;
      const steps = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] };
      if (!steps[event.key]) return;
      event.preventDefault();
      viewport.scrollBy({ left: steps[event.key][0], top: steps[event.key][1], behavior: 'instant' });
    });
    // Touch keeps native two-axis scrolling and browser pinch zoom. No touch suppression.
    new ResizeObserver(resizeView).observe(viewport);
  }

  function openViewer(source, trigger, entry) {
    if (dialog?.open) return; // One instance, one temporary image, no modal stacking.
    if (!source.complete || !source.naturalWidth) return;
    const asset = new URL(source.getAttribute('src'), document.baseURI);
    if (asset.origin !== window.location.origin) return;
    if (!dialog) createDialog();
    invokingControl = trigger;
    const root = document.documentElement;
    savedPage = {
      x: window.scrollX, y: window.scrollY,
      rootOverflow: root.style.overflow,
      rootGutter: root.style.scrollbarGutter,
      bodyOverflow: document.body.style.overflow
    };
    // Reserve only an existing scrollbar gap. Overlay-scrollbar environments have
    // no gap; forcing "stable" there would introduce a 15px page-width shift.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    dialog.style.fontFamily = getComputedStyle(trigger).fontFamily;
    dialog.setAttribute('aria-label', 'Larger image: ' + source.alt);
    image = document.createElement('img');
    image.className = 'grecho-image-viewer__image';
    image.alt = source.alt;
    image.draggable = false;
    image.setAttribute('data-viewer-origin-binding', entry.media_binding);
    image.addEventListener('load', resizeView, { once: true });
    image.src = asset.href;
    canvas.append(image);
    isFitView = true;
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
    resizeView();
  }

  canonicalImages.forEach(source => {
    const binding = source.getAttribute('data-media-binding');
    const entry = byBinding.get(binding);
    if (!entry || occurrences.get(binding) !== 1) return;
    if (source.getAttribute('src') !== entry.src || source.getAttribute('data-source-media-sha256') !== entry.source_media_sha256) return;
    if (source.closest('section')?.id !== entry.section_id) return;
    if ([...document.querySelectorAll('[data-viewer-trigger]')].some(button => button.getAttribute('data-viewer-trigger') === binding)) return;
    const trigger = control('View larger', 'grecho-image-viewer-trigger', () => openViewer(source, trigger, entry));
    trigger.setAttribute('data-viewer-trigger', binding);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-label', 'View larger: ' + source.alt);
    source.insertAdjacentElement('afterend', trigger);
  });
})();
