/* GRECHO Challenge explorer v1. Readable static content is the default. */
(() => {
 'use strict';
 const root=document.querySelector('.gc-reconstructed');if(!root)return;

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
 const explorer=root.querySelector('.gc-explorer');if(!explorer)return;
 const tabs=[...explorer.querySelectorAll('.gc-select')];
 const panels=[...explorer.querySelectorAll('.gc-pair')];
 const list=explorer.querySelector('.gc-selector');
 const prev=explorer.querySelector('.gc-prev'),next=explorer.querySelector('.gc-next');
 if(!tabs.length||tabs.length!==panels.length||tabs.some((a,i)=>a.hash!=='#'+panels[i].id))return;
 let active=0;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 function show(index,{focus=false,write=false,scroll=false}={}){
  active=Math.max(0,Math.min(index,panels.length-1));
  tabs.forEach((a,i)=>{a.setAttribute('aria-selected',String(i===active));a.tabIndex=i===active?0:-1;panels[i].hidden=i!==active;});
  prev.disabled=active===0;next.disabled=active===panels.length-1;
  if(write&&location.hash!=='#'+panels[active].id)history.pushState(null,'','#'+panels[active].id);
  if(focus){tabs[active].focus({preventScroll:true});tabs[active].scrollIntoView({block:'nearest',behavior:'instant'});}
  if(scroll)panels[active].scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});
 }
 function fromHash(scroll=false){let i=panels.findIndex(p=>'#'+p.id===location.hash);if(i>=0)show(i,{scroll});else if(!location.hash||location.hash==='#solutions')show(0);}
 function reset(){explorer.classList.remove('is-enhanced');list.removeAttribute('role');list.removeAttribute('aria-orientation');tabs.forEach(a=>{['role','aria-controls','aria-selected','tabindex'].forEach(n=>a.removeAttribute(n));});panels.forEach(p=>{p.hidden=false;['role','aria-labelledby','tabindex'].forEach(n=>p.removeAttribute(n));});}
 try {
  list.setAttribute('role','tablist');list.setAttribute('aria-orientation','vertical');
  tabs.forEach((a,i)=>{a.setAttribute('role','tab');a.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',a.id);panels[i].tabIndex=0;
   a.addEventListener('click',e=>{if(!explorer.classList.contains('is-enhanced'))return;e.preventDefault();show(i,{write:true,scroll:innerWidth<1080});});
   a.addEventListener('keydown',e=>{let n=i;if(['ArrowDown','ArrowRight'].includes(e.key))n=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else if(e.key===' ') {e.preventDefault();show(i,{write:true});return;}else return;e.preventDefault();show(n,{focus:true,write:true});});
  });
  root.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.classList.contains('gc-select'))return;const url=new URL(a.href,location.href);if(url.pathname!==location.pathname||url.origin!==location.origin)return;const i=panels.findIndex(p=>'#'+p.id===url.hash);if(i<0)return;e.preventDefault();show(i,{write:true,scroll:true});panels[i].focus({preventScroll:true});});
  prev.addEventListener('click',()=>show(active-1,{write:true,scroll:true}));next.addEventListener('click',()=>show(active+1,{write:true,scroll:true}));
  addEventListener('hashchange',()=>fromHash(true));addEventListener('popstate',()=>fromHash(true));
  explorer.classList.add('is-enhanced');show(0);fromHash(true);
 } catch(error){reset();}
})();
