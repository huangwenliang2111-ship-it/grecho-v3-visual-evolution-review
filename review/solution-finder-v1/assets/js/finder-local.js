'use strict';
/* Inline local preview. No submission adapter, persistence or console payload. */
const form=$('inquiryForm');
const intentLabels={sample:'Request a Sample',consultation:'Talk to Our Team'};
let requestIntent='sample',lastPreviewPayload=null,lastRequirements='';
const requirements=()=>({board:BOARDS[current].name,otherBoard:current==='other'?otherBoardDescription.trim():'',product:productByBoard[current]||'Not specified — our team can help clarify',challenges:getProblems().map(o=>o.category+': '+o.issue),applications:selectedApps(),otherApplication:otherApplicationSelectedByBoard[current]?otherApplicationDescriptionByBoard[current].trim():''});
function resetPreviewFeedback(){lastPreviewPayload=null;$('previewResult').hidden=true;$('restartPreview').hidden=true;$('intentStatus').textContent='';}
function drawRecap(){
  const r=requirements(),signature=JSON.stringify(r);
  if(lastRequirements&&signature!==lastRequirements)resetPreviewFeedback();
  lastRequirements=signature;
  $('rBoard').textContent=r.board+(r.otherBoard?' — '+r.otherBoard:'');$('rProduct').textContent=r.product;
  $('rIssues').innerHTML=r.challenges.length?`<span>${r.challenges.length} challenge${r.challenges.length===1?'':'s'} selected.</span><ul class="gsf-recap__issues" tabindex="0" aria-label="Selected challenges">${r.challenges.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'No specific challenges selected.';
  $('rApps').textContent=r.applications.length?r.applications.map(a=>a==='Other Application'&&r.otherApplication?a+' — '+r.otherApplication:a).join(', '):'Not specified (optional)';
  $('copyStatus').textContent=current==='other'?'Other Board / Product · REVIEW CANDIDATE · six generic challenge categories (36 positions) await business and technical approval. No automatic product recommendation.':current==='acoustic'?'Acoustic · primary QA workflow · Business Copy Final pending. No automatic product recommendation.':BOARDS[current].name+' · internal draft review only · technical and Business Copy approval pending. No approved public guidance.';
  $('challenge-panel').setAttribute('aria-labelledby','category-'+activeCat);
}
function clearError(el){
  el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');
  const wrap=el.closest('.gsf-f')||$('consentWrap');wrap.classList.remove('is-error');
  const msg=$(el.id+'_error');if(msg)msg.remove();
}
function showError(el,message){
  const wrap=el.closest('.gsf-f')||$('consentWrap');wrap.classList.add('is-error');el.setAttribute('aria-invalid','true');
  const msg=document.createElement('span');msg.id=el.id+'_error';msg.className='gsf-err';msg.textContent=message;wrap.append(msg);el.setAttribute('aria-describedby',msg.id);
}
$('f_country').insertAdjacentHTML('beforeend',COUNTRIES.map(c=>`<option>${esc(c)}</option>`).join(''));
form.querySelectorAll('input,select,textarea').forEach(el=>{
  el.addEventListener('input',()=>{clearError(el);resetPreviewFeedback();});
  el.addEventListener('change',()=>{clearError(el);resetPreviewFeedback();});
});
form.addEventListener('submit',event=>{
  event.preventDefault();requestIntent=event.submitter?.value==='consultation'?'consultation':'sample';
  validateBoardState(current);
  resetPreviewFeedback();$('intentStatus').textContent='Selected action: '+intentLabels[requestIntent];let first=null;
  form.querySelectorAll('[required]').forEach(el=>{
    clearError(el);const valid=el.type==='checkbox'?el.checked:el.value.trim()!==''&&el.checkValidity();
    if(!valid){showError(el,el.type==='checkbox'?'Please confirm privacy consent.':el.validity.typeMismatch?'Please enter a valid email address.':el.tagName==='SELECT'?'Please choose a country or region.':'Please fill in this field.');first=first||el;}
  });
  if(first){$('ctaMsg').textContent='Please complete the highlighted fields.';first.focus();return;}
  // A synthetic payload exists in page memory only. It is never transmitted, persisted or logged.
  lastPreviewPayload={request_intent:requestIntent,board_system:current,board_label:BOARDS[current].name,product_type:productByBoard[current]||null,selected_challenges:getProblems().map(o=>({...o})),applications:[...selectedApps()],contact_person:$('f_name').value.trim(),email:$('f_email').value.trim(),company_name:$('f_company').value.trim(),country_region:$('f_country').value,privacy_consent:$('f_privacy').checked,consent_version:'LOCAL_REVIEW_PENDING_APPROVAL',optional_project_details:{phone_whatsapp:$('f_phone').value.trim(),project_details:$('f_details').value.trim()},source_attribution:'solution-finder-local-review'};
  if(current==='other')lastPreviewPayload.other_board_description=otherBoardDescription.trim();
  if(otherApplicationSelectedByBoard[current])lastPreviewPayload.other_application_description=otherApplicationDescriptionByBoard[current].trim();
  $('ctaMsg').textContent='';$('previewIntent').textContent='Preview action: '+intentLabels[requestIntent];$('previewResult').hidden=false;$('restartPreview').hidden=false;$('previewResult').focus();
});
$('restartPreview').addEventListener('click',()=>{
  form.reset();form.querySelectorAll('[required]').forEach(clearError);$('additionalDetails').open=false;requestIntent='sample';resetPreviewFeedback();$('ctaMsg').textContent='';$('f_name').focus();
});
document.querySelectorAll('[data-edit]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();const target=link.dataset.edit==='board'?(current==='other'?$('otherBoardDescription'):$('productType')):link.dataset.edit==='challenges'?$('category-'+activeCat):($('appGrid').querySelector('input')||$('otherApplicationCheckbox'));document.querySelector(link.getAttribute('href')).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});target.focus({preventScroll:true});
}));
function selectBoard(key){if(!keys.includes(key))return;current=key;activeCat=0;render();$('boardSelector').querySelector(`[role="radio"][data-id="${current}"]`).focus();}
$('otherBoard').addEventListener('click',()=>selectBoard('other'));
$('otherBoardDescription').addEventListener('input',event=>{otherBoardDescription=boundedText(event.target.value,160);drawRecap();});
$('otherApplicationCheckbox').addEventListener('change',event=>{otherApplicationSelectedByBoard[current]=event.target.checked;drawOtherApplication();drawRecap();});
$('otherApplicationDescription').addEventListener('input',event=>{otherApplicationDescriptionByBoard[current]=boundedText(event.target.value,200);drawRecap();});
$('boardSelector').addEventListener('keydown',e=>{
  if(!e.target.closest('[role="radio"]'))return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
  e.preventDefault();const i=keys.indexOf(current),next=e.key==='Home'?0:e.key==='End'?keys.length-1:(i+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+keys.length)%keys.length;selectBoard(keys[next]);
});
$('catGrid').addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
  e.preventDefault();const n=DATA[current].cats.length;activeCat=e.key==='Home'?0:e.key==='End'?n-1:(activeCat+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+n)%n;drawCategories();drawProblems();drawRecap();document.querySelector(`.gsf-cat[data-index="${activeCat}"]`).focus();
});
const originalDrawProblems=drawProblems;
drawProblems=function(){originalDrawProblems();$('challenge-panel').setAttribute('aria-labelledby','category-'+activeCat);};
const originalDrawSummary=drawSummary;
drawSummary=function(){originalDrawSummary();$('selectedList').querySelectorAll('[data-rm]').forEach(button=>button.onclick=()=>{selected[current].delete(button.dataset.rm);drawCategories();drawProblems();drawSummary();($('selectedList').querySelector('[data-rm]')||$('clearBtn')).focus();});};
function updateFloatingBar(){const r=$('finder-inquiry').getBoundingClientRect();$('mbar').classList.toggle('is-inquiry',r.top<innerHeight&&r.bottom>0);}
window.addEventListener('scroll',updateFloatingBar,{passive:true});window.addEventListener('resize',updateFloatingBar);
if('IntersectionObserver' in window)new IntersectionObserver(updateFloatingBar).observe($('finder-inquiry'));

// Clone-only navigation controller; shared source remains byte-identical.
(()=>{
  const header=document.querySelector('[data-grecho-v3-nav]'),desktop=[...header.querySelectorAll('[data-nav-trigger]:not([disabled])')],drawer=header.querySelector('[data-mobile-nav-panel]'),mobileButton=header.querySelector('[data-mobile-nav-trigger]'),backdrop=header.querySelector('[data-mobile-nav-backdrop]'),language=header.querySelector('[data-language-trigger]'),languagePanel=header.querySelector('[data-language-panel]');let mobileFocus=null;
  const closeDesktop=()=>desktop.forEach(b=>{b.setAttribute('aria-expanded','false');$(b.getAttribute('aria-controls')).hidden=true;});
  desktop.forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';closeDesktop();b.setAttribute('aria-expanded',String(open));$(b.getAttribute('aria-controls')).hidden=!open;}));
  function closeMobile(){drawer.hidden=true;backdrop.hidden=true;mobileButton.setAttribute('aria-expanded','false');document.documentElement.classList.remove('grecho-v3-nav-lock');document.body.classList.remove('grecho-v3-nav-lock');if(mobileFocus)mobileFocus.focus();}
  mobileButton.addEventListener('click',()=>{mobileFocus=mobileButton;drawer.hidden=false;backdrop.hidden=false;mobileButton.setAttribute('aria-expanded','true');document.documentElement.classList.add('grecho-v3-nav-lock');document.body.classList.add('grecho-v3-nav-lock');drawer.querySelector('[data-mobile-nav-close]').focus();});
  drawer.querySelector('[data-mobile-nav-close]').addEventListener('click',closeMobile);backdrop.addEventListener('click',closeMobile);
  header.querySelectorAll('[data-mobile-accordion-trigger]').forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$(b.getAttribute('aria-controls')).hidden=!open;}));
  language.addEventListener('click',()=>{const open=language.getAttribute('aria-expanded')!=='true';language.setAttribute('aria-expanded',String(open));languagePanel.hidden=!open;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!drawer.hidden)closeMobile();else{const active=desktop.find(b=>b.getAttribute('aria-expanded')==='true');closeDesktop();if(active)active.focus();languagePanel.hidden=true;language.setAttribute('aria-expanded','false');}}if(e.key==='Tab'&&!drawer.hidden){const items=[...drawer.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))closeDesktop();});
  matchMedia('(min-width:1100px)').addEventListener('change',e=>{if(e.matches&&!drawer.hidden)closeMobile();closeDesktop();});
})();
render();
