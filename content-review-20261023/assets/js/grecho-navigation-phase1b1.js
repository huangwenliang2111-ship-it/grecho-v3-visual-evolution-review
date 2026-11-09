(function () {
  'use strict';

  var header = document.querySelector('[data-grecho-v3-nav]');
  if (!header) {
    return;
  }

  var desktopTriggers = Array.prototype.slice.call(header.querySelectorAll('[data-nav-trigger]'));
  var desktopPanels = Array.prototype.slice.call(header.querySelectorAll('[data-nav-panel]'));
  var languageTrigger = header.querySelector('[data-language-trigger]');
  var languagePanel = header.querySelector('[data-language-panel]');
  var languageOptions = Array.prototype.slice.call(header.querySelectorAll('[data-language-option]'));
  var mobileTrigger = header.querySelector('[data-mobile-nav-trigger]');
  var mobilePanel = header.querySelector('[data-mobile-nav-panel]');
  var mobileBackdrop = header.querySelector('[data-mobile-nav-backdrop]');
  var mobileClose = header.querySelector('[data-mobile-nav-close]');
  var mobileAccordionTriggers = Array.prototype.slice.call(header.querySelectorAll('[data-mobile-accordion-trigger]'));
  var mobileAccordionPanels = Array.prototype.slice.call(header.querySelectorAll('[data-mobile-accordion-panel]'));
  var mobileSearchTrigger = header.querySelector('[data-mobile-search-trigger]');
  var mobileSearchPanel = header.querySelector('[data-mobile-search-panel]');
  var mobileSearchClose = header.querySelector('[data-mobile-search-close]');
  var lastDesktopTrigger = null;
  var lastMobileTrigger = null;
  var hoverCloseTimer = null;
  var desktopOpenOrigin = '';
  var homepageRoot = header.closest('.grecho-v3');
  var stickyHeaderOffset = '';
  var stickyStart = header.getBoundingClientRect().top + window.scrollY;

  function updateSafetyOffset() {
    var marker = document.getElementById('grecho-local-marker');
    var offset = marker ? Math.ceil(marker.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--grecho-local-safety-offset', offset + 'px');
  }

  function visibleFocusable(container) {
    if (!container) {
      return [];
    }
    return Array.prototype.slice.call(container.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(function (element) {
      return !element.hidden && element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null;
    });
  }

  function getDesktopPanel(name) {
    return header.querySelector('[data-nav-panel="' + name + '"]');
  }

  function closeDesktop(options) {
    var settings = options || {};
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = null;
    desktopTriggers.forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });
    desktopPanels.forEach(function (panel) {
      panel.hidden = true;
    });
    header.classList.remove('is-desktop-menu-open');
    desktopOpenOrigin = '';
    if (settings.restoreFocus && lastDesktopTrigger) {
      lastDesktopTrigger.focus();
    }
  }

  function openDesktop(trigger, focusFirst, origin) {
    var name = trigger.getAttribute('data-nav-trigger');
    var panel = getDesktopPanel(name);
    if (!panel) {
      return;
    }
    closeDesktop();
    closeLanguage();
    closeMobileSearch();
    closeMobile();
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    header.classList.add('is-desktop-menu-open');
    desktopOpenOrigin = origin;
    lastDesktopTrigger = trigger;
    if (focusFirst) {
      var first = visibleFocusable(panel)[0];
      if (first) {
        first.focus();
      }
    }
  }

  function toggleDesktop(trigger, origin) {
    if (trigger.getAttribute('aria-expanded') === 'true') {
      if (origin === 'click' && desktopOpenOrigin === 'hover') {
        window.clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
        desktopOpenOrigin = 'click';
        return;
      }
      closeDesktop({ restoreFocus: true });
      return;
    }
    openDesktop(trigger, false, origin);
  }

  function closeLanguage(options) {
    var settings = options || {};
    if (!languageTrigger || !languagePanel) {
      return;
    }
    languageTrigger.setAttribute('aria-expanded', 'false');
    languagePanel.hidden = true;
    if (settings.restoreFocus) {
      languageTrigger.focus();
    }
  }

  function openLanguage(focusFirst) {
    if (!languageTrigger || !languagePanel) {
      return;
    }
    closeDesktop();
    closeMobileSearch();
    languageTrigger.setAttribute('aria-expanded', 'true');
    languagePanel.hidden = false;
    if (focusFirst) {
      var first = visibleFocusable(languagePanel)[0];
      if (first) {
        first.focus();
      }
    }
  }

  function toggleLanguage() {
    if (languageTrigger.getAttribute('aria-expanded') === 'true') {
      closeLanguage({ restoreFocus: true });
    } else {
      openLanguage(false);
    }
  }

  function closeMobileSearch(options) {
    var settings = options || {};
    if (!mobileSearchTrigger || !mobileSearchPanel) {
      return;
    }
    mobileSearchTrigger.setAttribute('aria-expanded', 'false');
    mobileSearchPanel.hidden = true;
    if (settings.restoreFocus) {
      mobileSearchTrigger.focus();
    }
  }

  function openMobileSearch() {
    if (!mobileSearchTrigger || !mobileSearchPanel) {
      return;
    }
    closeMobile();
    closeDesktop();
    closeLanguage();
    mobileSearchTrigger.setAttribute('aria-expanded', 'true');
    mobileSearchPanel.hidden = false;
    window.setTimeout(function () {
      if (mobileSearchClose) {
        mobileSearchClose.focus();
      }
    }, 0);
  }

  function resetMobileAccordions() {
    mobileAccordionTriggers.forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });
    mobileAccordionPanels.forEach(function (panel) {
      panel.hidden = true;
    });
  }

  function closeMobile(options) {
    var settings = options || {};
    if (!mobileTrigger || !mobilePanel || !mobileBackdrop) {
      return;
    }
    mobileTrigger.setAttribute('aria-expanded', 'false');
    mobileTrigger.setAttribute('aria-label', 'Open navigation menu');
    mobilePanel.hidden = true;
    mobileBackdrop.hidden = true;
    header.classList.remove('is-mobile-menu-open');
    document.documentElement.classList.remove('grecho-v3-nav-lock');
    document.body.classList.remove('grecho-v3-nav-lock');
    if (settings.resetAccordions) {
      resetMobileAccordions();
    }
    if (settings.restoreFocus && lastMobileTrigger) {
      lastMobileTrigger.focus();
    }
  }

  function openMobile() {
    if (!mobileTrigger || !mobilePanel || !mobileBackdrop) {
      return;
    }
    closeDesktop();
    closeLanguage();
    closeMobileSearch();
    lastMobileTrigger = mobileTrigger;
    mobileTrigger.setAttribute('aria-expanded', 'true');
    mobileTrigger.setAttribute('aria-label', 'Close navigation menu');
    mobilePanel.hidden = false;
    mobileBackdrop.hidden = false;
    header.classList.add('is-mobile-menu-open');
    document.documentElement.classList.add('grecho-v3-nav-lock');
    document.body.classList.add('grecho-v3-nav-lock');
    window.setTimeout(function () {
      if (mobileClose) {
        mobileClose.focus();
      }
    }, 0);
  }

  function toggleMobile() {
    if (mobileTrigger.getAttribute('aria-expanded') === 'true') {
      closeMobile({ restoreFocus: true });
    } else {
      openMobile();
    }
  }

  function toggleMobileAccordion(trigger) {
    var panelId = trigger.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);
    var isOpen = trigger.getAttribute('aria-expanded') === 'true';
    mobileAccordionTriggers.forEach(function (otherTrigger) {
      otherTrigger.setAttribute('aria-expanded', 'false');
    });
    mobileAccordionPanels.forEach(function (otherPanel) {
      otherPanel.hidden = true;
    });
    if (!isOpen && panel) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  }

  function updateStickyState() {
    header.classList.toggle('is-stuck', window.scrollY > stickyStart + 1);
    if (homepageRoot) {
      var headerBottom = header.getBoundingClientRect().bottom;
      if (Number.isFinite(headerBottom)) {
        var nextOffset = Math.max(0, Math.ceil(headerBottom)) + 16 + 'px';
        if (nextOffset !== stickyHeaderOffset) {
          homepageRoot.style.setProperty('--grecho-v3-sticky-header-offset', nextOffset);
          stickyHeaderOffset = nextOffset;
        }
        homepageRoot.classList.add('has-sticky-header-offset');
      }
    }
  }

  desktopTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      toggleDesktop(trigger, 'click');
    });
    trigger.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 1100px) and (hover: hover)').matches) {
        window.clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
        if (trigger.getAttribute('aria-expanded') !== 'true') {
          openDesktop(trigger, false, 'hover');
        }
      }
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDesktop(trigger, 'keyboard');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        openDesktop(trigger, true, 'keyboard');
      }
    });
  });

  header.addEventListener('mouseenter', function () {
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = null;
  });

  header.addEventListener('mouseleave', function () {
    if (desktopOpenOrigin === 'hover' && window.matchMedia('(min-width: 1100px) and (hover: hover)').matches) {
      hoverCloseTimer = window.setTimeout(function () {
        if (desktopOpenOrigin === 'hover') {
          closeDesktop();
        }
      }, 180);
    }
  });

  if (languageTrigger) {
    languageTrigger.addEventListener('click', toggleLanguage);
    languageTrigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openLanguage(true);
      }
    });
  }

  languageOptions.forEach(function (option) {
    option.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

  if (mobileTrigger) {
    mobileTrigger.addEventListener('click', toggleMobile);
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', function () {
      closeMobile({ restoreFocus: true });
    });
  }
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', function () {
      closeMobile({ restoreFocus: true });
    });
  }

  mobileAccordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      toggleMobileAccordion(trigger);
    });
  });

  if (mobilePanel) {
    mobilePanel.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) {
        closeMobile();
      }
    });
  }

  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener('click', function () {
      if (mobileSearchTrigger.getAttribute('aria-expanded') === 'true') {
        closeMobileSearch({ restoreFocus: true });
      } else {
        openMobileSearch();
      }
    });
  }
  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', function () {
      closeMobileSearch({ restoreFocus: true });
    });
  }

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) {
      closeDesktop();
      closeLanguage();
      closeMobileSearch();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (header.classList.contains('is-mobile-menu-open')) {
        event.preventDefault();
        closeMobile({ restoreFocus: true });
      } else if (mobileSearchTrigger && mobileSearchTrigger.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        closeMobileSearch({ restoreFocus: true });
      } else if (languageTrigger && languageTrigger.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        closeLanguage({ restoreFocus: true });
      } else if (header.classList.contains('is-desktop-menu-open')) {
        event.preventDefault();
        closeDesktop({ restoreFocus: true });
      }
      return;
    }

    if (event.key === 'Tab' && header.classList.contains('is-mobile-menu-open')) {
      var focusable = visibleFocusable(mobilePanel);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('scroll', updateStickyState, { passive: true });
  window.addEventListener('resize', function () {
    updateSafetyOffset();
    if (window.innerWidth < 1100) {
      closeDesktop();
      closeLanguage();
    } else {
      closeMobile({ resetAccordions: true });
      closeMobileSearch();
    }
    if (!header.classList.contains('is-stuck')) {
      stickyStart = header.getBoundingClientRect().top + window.scrollY;
    }
    updateStickyState();
  });

  updateSafetyOffset();
  updateStickyState();
}());
