(function () {
  'use strict';

  var root = document.querySelector('[data-grecho-v3-pilot]');
  if (!root) {
    return;
  }

  root.classList.add('grecho-v3--enhanced');

  var heroVideo = root.querySelector('[data-grecho-v3-hero-video]');
  var heroToggle = root.querySelector('[data-grecho-v3-hero-toggle]');
  var heroToggleLabel = root.querySelector('[data-grecho-v3-hero-toggle-label]');
  var heroToggleIcon = heroToggle ? heroToggle.querySelector('.grecho-v3-hero__media-toggle-icon') : null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowViewport = window.matchMedia('(max-width: 767px)');
  var heroInView = true;
  var heroUserPaused = false;

  function updateHeroControl() {
    if (!heroToggle || !heroVideo) {
      return;
    }
    var unavailable = narrowViewport.matches || reduceMotion.matches;
    var isPaused = heroVideo.paused;
    heroToggle.hidden = unavailable;
    heroToggle.setAttribute('aria-pressed', String(!isPaused));
    heroToggle.setAttribute('aria-label', isPaused ? 'Play background video' : 'Pause background video');
    if (heroToggleLabel) {
      heroToggleLabel.textContent = isPaused ? 'Play background video' : 'Pause background video';
    }
    if (heroToggleIcon) {
      heroToggleIcon.textContent = isPaused ? '▶' : 'Ⅱ';
    }
  }

  function ensureHeroSource() {
    if (!heroVideo) {
      return false;
    }
    var source = heroVideo.querySelector('source[data-src]');
    if (!source) {
      return false;
    }
    if (!source.getAttribute('src')) {
      source.setAttribute('src', source.getAttribute('data-src'));
      heroVideo.load();
    }
    return true;
  }

  function syncHeroMedia() {
    if (!heroVideo) {
      return;
    }

    var source = heroVideo.querySelector('source[data-src]');
    var videoAllowed = !narrowViewport.matches && !reduceMotion.matches;
    var shouldPlay = videoAllowed && heroInView && !document.hidden && !heroUserPaused;

    if (shouldPlay && ensureHeroSource()) {
      heroVideo.classList.remove('is-poster-only');
      var playAttempt = heroVideo.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          heroVideo.classList.add('is-poster-only');
          updateHeroControl();
        });
      }
    } else {
      heroVideo.pause();
      if (!videoAllowed) {
        heroVideo.classList.add('is-poster-only');
        if (source && source.getAttribute('src')) {
          source.removeAttribute('src');
          heroVideo.load();
        }
      }
    }
    updateHeroControl();
  }

  if (heroVideo) {
    heroVideo.addEventListener('play', updateHeroControl);
    heroVideo.addEventListener('pause', updateHeroControl);
    heroVideo.addEventListener('ended', updateHeroControl);
  }
  if (heroToggle && heroVideo) {
    heroToggle.addEventListener('click', function () {
      if (heroVideo.paused) {
        heroUserPaused = false;
      } else {
        heroUserPaused = true;
      }
      syncHeroMedia();
    });
  }

  var heroSection = heroVideo ? heroVideo.closest('.grecho-v3-hero') : null;
  if (heroSection && typeof IntersectionObserver === 'function') {
    var heroObserver = new IntersectionObserver(function (entries) {
      heroInView = entries[0] ? entries[0].isIntersecting : true;
      syncHeroMedia();
    }, { threshold: 0.08 });
    heroObserver.observe(heroSection);
  }

  document.addEventListener('visibilitychange', syncHeroMedia);
  syncHeroMedia();
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', syncHeroMedia);
    narrowViewport.addEventListener('change', syncHeroMedia);
  }
  window.addEventListener('resize', syncHeroMedia, { passive: true });

  var applicationGrid = root.querySelector('.grecho-v3-application-grid');
  var applicationWideViewport = window.matchMedia('(min-width: 851px)');
  var applicationPointerViewport = window.matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine)');
  var applicationMeasureFrame = 0;
  var applicationGeometryFrame = 0;
  var applicationGeometryEnd = 0;
  var applicationPointerOrder = '';

  function resetApplicationLayout(cards) {
    applicationGrid.classList.remove('is-measured-columns');
    applicationGrid.style.removeProperty('--grecho-v3-application-grid-height');
    cards.forEach(function (card) {
      card.style.removeProperty('--grecho-v3-application-stack-offset');
    });
    applicationGrid.setAttribute('data-application-layout-state', 'normal-flow');
  }

  function measureApplicationStacks() {
    applicationMeasureFrame = 0;
    if (!applicationGrid) {
      return;
    }
    var cards = Array.prototype.slice.call(applicationGrid.querySelectorAll('.grecho-v3-application-card'));
    if (!applicationWideViewport.matches || cards.length !== 6) {
      resetApplicationLayout(cards);
      return;
    }

    var styles = window.getComputedStyle(applicationGrid);
    var stackGap = parseFloat(styles.columnGap) || 22;
    var maxStackHeight = 0;

    for (var column = 0; column < 3; column += 1) {
      var topCard = cards[column];
      var bottomCard = cards[column + 3];
      var topHeight = topCard.getBoundingClientRect().height;
      var bottomHeight = bottomCard.getBoundingClientRect().height;
      var offset = topHeight + stackGap;
      bottomCard.style.setProperty('--grecho-v3-application-stack-offset', offset + 'px');
      maxStackHeight = Math.max(maxStackHeight, offset + bottomHeight);
    }

    applicationGrid.style.setProperty('--grecho-v3-application-grid-height', maxStackHeight + 'px');
    applicationGrid.classList.add('is-measured-columns');
    applicationGrid.setAttribute('data-application-layout-state', 'synchronized-paired-columns');
  }

  function runApplicationGeometrySync() {
    applicationGeometryEnd = window.performance.now() + 420;
    if (applicationGeometryFrame) {
      return;
    }
    function syncFrame(now) {
      measureApplicationStacks();
      if (now < applicationGeometryEnd) {
        applicationGeometryFrame = window.requestAnimationFrame(syncFrame);
      } else {
        applicationGeometryFrame = 0;
      }
    }
    applicationGeometryFrame = window.requestAnimationFrame(syncFrame);
  }

  function scheduleApplicationMeasure() {
    if (!applicationGrid || applicationMeasureFrame) {
      return;
    }
    applicationMeasureFrame = window.requestAnimationFrame(measureApplicationStacks);
  }

  if (applicationGrid) {
    var applicationCards = Array.prototype.slice.call(applicationGrid.querySelectorAll('.grecho-v3-application-card'));

    function syncApplicationActiveState() {
      // Focus adds visual emphasis without changing the pointer-controlled geometry.
      var activeOrder = applicationPointerViewport.matches ? applicationPointerOrder : '';
      if (applicationWideViewport.matches && activeOrder) {
        applicationGrid.setAttribute('data-application-active', activeOrder);
      } else {
        applicationGrid.removeAttribute('data-application-active');
      }
      runApplicationGeometrySync();
    }

    applicationGrid.setAttribute('data-application-default-state', 'balanced');
    applicationCards.forEach(function (card) {
      var order = card.getAttribute('data-application-order') || '';
      var media = card.querySelector('[data-application-media]');
      if (media) {
        media.addEventListener('pointerenter', function () {
          applicationPointerOrder = order;
          syncApplicationActiveState();
        });
        media.addEventListener('pointerleave', function () {
          if (applicationPointerOrder === order) {
            applicationPointerOrder = '';
            syncApplicationActiveState();
          }
        });
      }
    });

    scheduleApplicationMeasure();
    applicationGrid.querySelectorAll('img').forEach(function (image) {
      if (!image.complete) {
        image.addEventListener('load', scheduleApplicationMeasure, { once: true });
        image.addEventListener('error', scheduleApplicationMeasure, { once: true });
      }
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleApplicationMeasure);
    }
    if (typeof applicationWideViewport.addEventListener === 'function') {
      applicationWideViewport.addEventListener('change', scheduleApplicationMeasure);
      applicationPointerViewport.addEventListener('change', syncApplicationActiveState);
    }
    window.addEventListener('resize', scheduleApplicationMeasure, { passive: true });
  }

  root.querySelectorAll('[data-grecho-v3-faq]').forEach(function (faq) {
    faq.classList.add('is-enhanced');
    var buttons = faq.querySelectorAll('button[aria-controls]');

    buttons.forEach(function (button, index) {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var expanded = index === 0;
      button.setAttribute('aria-expanded', String(expanded));
      if (panel) {
        panel.hidden = !expanded;
      }

      button.addEventListener('click', function () {
        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        if (panel) {
          panel.hidden = isExpanded;
        }
      });
    });
  });
}());
