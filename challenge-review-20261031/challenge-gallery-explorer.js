/* Gallery family enhancement of the original, fully readable static explorer. */
(() => {
  "use strict";

  const root = document.querySelector("#main .challenge-gallery-family");
  if (!root) return;

 // Optional page-local navigation; the frozen site header is only measured.
 const subnav=root.querySelector('.gc-subnav');
 if(subnav){
  const links=[...subnav.querySelectorAll('a[href^="#"]')];
  const sections=links.map(a=>document.getElementById(a.hash.slice(1)));
  const header=document.querySelector('header.grecho-v3-nav');let queued=false,lastActive=-1;
  const update=()=>{
   queued=false;const h=header?header.getBoundingClientRect().height:0,n=subnav.getBoundingClientRect().height;
   root.style.setProperty('--gc-header-height',h+'px');root.style.setProperty('--gc-subnav-height',n+'px');
   let active=0;sections.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<=h+n+80)active=i;});
   links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
   if(active!==lastActive){const rail=subnav.querySelector('.gc-subnav-links'),a=links[active];if(rail&&a){const r=rail.getBoundingClientRect(),v=a.getBoundingClientRect();if(v.left<r.left||v.right>r.right)rail.scrollLeft+=v.left-r.left;}lastActive=active;}
  };
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(schedule);if(header)observer.observe(header);observer.observe(subnav);}
  update();
 }

  const explorer = root.querySelector("#solutions .gc-explorer");
  if (!explorer) return;

  const selector = explorer.querySelector(".gc-selector");
  const tabs = Array.from(explorer.querySelectorAll(".gc-selector .gc-select"));
  const panels = Array.from(explorer.querySelectorAll(".gc-panels .gc-pair"));
  const previous = explorer.querySelector(".gc-prev");
  const next = explorer.querySelector(".gc-next");
  if (!selector || !previous || !next || tabs.length < 2 ||
      tabs.length !== panels.length ||
      tabs.some((tab, index) => tab.hash !== "#" + panels[index].id || !tab.id)) {
    return;
  }

  const panelIndexes = new Map(panels.map((panel, index) => ["#" + panel.id, index]));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stackedSelector = window.matchMedia("(max-width: 1080px)");
  let active = 0;
  let pendingScroll = 0;
  let pendingHistory = 0;

  function displayPanel(index) {
    active = index;
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === active;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
    previous.disabled = active === 0;
    next.disabled = active === panels.length - 1;
  }

  function scrollToPanel(panel, instant = false) {
    window.cancelAnimationFrame(pendingScroll);
    pendingScroll = window.requestAnimationFrame(() => {
      if (panel.hidden) return;
      panel.scrollIntoView({
        block: "start",
        behavior: instant || reducedMotion.matches ? "instant" : "smooth",
      });
    });
  }

  function choose(index, options = {}) {
    if (index < 0 || index >= panels.length) return;
    displayPanel(index);
    const panel = panels[index];
    const hash = "#" + panel.id;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    if (options.tabFocus) {
      tabs[index].focus({ preventScroll: true });
      tabs[index].scrollIntoView({ block: "nearest", behavior: "instant" });
    }
    if (options.panelFocus) {
      panel.focus({ preventScroll: true });
    }
    if (options.scroll) scrollToPanel(panel);
  }

  function readLocation() {
    const hash = window.location.hash;
    const index = panelIndexes.get(hash);
    if (index !== undefined) {
      displayPanel(index);
      scrollToPanel(panels[index], true);
    } else if (!hash || hash === "#solutions") {
      displayPanel(0);
    }
  }

  function scheduleLocationRead() {
    window.cancelAnimationFrame(pendingHistory);
    pendingHistory = window.requestAnimationFrame(readLocation);
  }

  function unmodifiedClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey &&
      !event.shiftKey && !event.altKey && !event.defaultPrevented;
  }

  selector.setAttribute("role", "tablist");
  selector.setAttribute("aria-orientation", "vertical");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[index].id);
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", tab.id);
    panels[index].tabIndex = 0;
  });

  selector.addEventListener("click", (event) => {
    const tab = event.target.closest(".gc-select");
    if (!tab || !unmodifiedClick(event)) return;
    event.preventDefault();
    choose(tabs.indexOf(tab), { scroll: stackedSelector.matches });
  });

  selector.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(event.target);
    if (index === -1 || event.altKey || event.ctrlKey || event.metaKey) return;

    let target;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        target = (index + 1) % tabs.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        target = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = tabs.length - 1;
        break;
      case " ":
        target = index;
        break;
      default:
        return;
    }
    event.preventDefault();
    choose(target, { tabFocus: true });
  });

  root.addEventListener("click", (event) => {
    if (!unmodifiedClick(event)) return;
    const link = event.target.closest('a[href^="#solution-"]');
    if (!link || selector.contains(link)) return;
    const target = panelIndexes.get(link.hash);
    if (target === undefined) return;

    event.preventDefault();
    choose(target, { panelFocus: true, scroll: true });
  });

  previous.addEventListener("click", () => {
    choose(active - 1, { scroll: true, panelFocus: active === 1 });
  });
  next.addEventListener("click", () => {
    choose(active + 1, { scroll: true, panelFocus: active === panels.length - 2 });
  });

  window.addEventListener("hashchange", scheduleLocationRead);
  window.addEventListener("popstate", scheduleLocationRead);
  explorer.classList.add("is-enhanced");
  displayPanel(0);
  readLocation();
})();
