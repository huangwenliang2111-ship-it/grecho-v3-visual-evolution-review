/* Only measure the existing header overlap; the original navigation/video controllers remain authoritative. */
(() => {const header=document.querySelector('body.r61-editorial header.grecho-v3-nav');if(!header)return;const sync=()=>document.body.style.setProperty('--r61-nav-height',`${header.offsetHeight}px`);sync();if('ResizeObserver' in window)new ResizeObserver(sync).observe(header);})();
