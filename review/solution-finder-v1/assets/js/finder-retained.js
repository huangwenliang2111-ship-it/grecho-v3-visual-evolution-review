/* ---------- State ---------- */
let current='acoustic',activeCat=0;
const keys=Object.keys(BOARDS);
const selected=Object.fromEntries(keys.map(k=>[k,new Set()]));
const applications=Object.fromEntries(keys.map(k=>[k,new Set()]));
const productByBoard={};
// Requirements drafts stay in page memory, separately for each board.
let otherBoardDescription='';
const otherApplicationSelectedByBoard=Object.fromEntries(keys.map(k=>[k,false]));
const otherApplicationDescriptionByBoard=Object.fromEntries(keys.map(k=>[k,'']));
const $=id=>document.getElementById(id);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getProblems=(b=current)=>{const out=[];DATA[b].cats.forEach((c,i)=>c.issues.forEach((issue,j)=>{if(selected[b].has(i+'-'+j))out.push({id:i+'-'+j,category:c.name,issue})}));return out};
const selectedApps=()=>[...DATA[current].apps.filter(a=>applications[current].has(a)),...(otherApplicationSelectedByBoard[current]?['Other Application']:[])];
const catCount=i=>{let n=0;selected[current].forEach(id=>{if(id.split('-')[0]===String(i))n++});return n};
const boundedText=(value,max)=>typeof value==='string'?value.slice(0,max):'';
function validateBoardState(board){
  if(!keys.includes(board))return;
  const validIssues=new Set(DATA[board].cats.flatMap((c,i)=>c.issues.map((_,j)=>i+'-'+j)));
  selected[board]=new Set([...(selected[board] instanceof Set?selected[board]:[])].filter(id=>validIssues.has(id)));
  applications[board]=new Set([...(applications[board] instanceof Set?applications[board]:[])].filter(value=>DATA[board].apps.includes(value)));
  if(!BOARDS[board].products.includes(productByBoard[board]))delete productByBoard[board];
  otherApplicationSelectedByBoard[board]=otherApplicationSelectedByBoard[board]===true;
  otherApplicationDescriptionByBoard[board]=boundedText(otherApplicationDescriptionByBoard[board],200);
  otherBoardDescription=boundedText(otherBoardDescription,160);
}

/* ---------- Step 1 ---------- */
function drawBoards(){
  $('boardGrid').innerHTML=keys.filter(k=>k!=='other').map(k=>{const b=BOARDS[k],on=k===current,n=selected[k].size;
    return `<button type="button" class="gsf-board ${on?'is-on':''}" data-id="${k}" role="radio" tabindex="${on?0:-1}" aria-checked="${on}" aria-labelledby="board-title-${k}" aria-describedby="board-description-${k}">
      <span class="gsf-board__media"><img alt="${esc(b.name)}" loading="lazy" src="${IMG_BASE}${b.img}-1000.webp" srcset="${IMG_BASE}${b.img}-640.webp 640w, ${IMG_BASE}${b.img}-1000.webp 1000w" sizes="(max-width:680px) 120px, (max-width:1080px) 50vw, 25vw"></span>
      <span class="gsf-board__tick" aria-hidden="true">✓</span>
      ${n&&!on?`<span class="gsf-board__badge">${n} selected</span>`:''}
      <span class="gsf-board__body"><span class="gsf-board__title" id="board-title-${k}">${esc(b.short)}</span><span class="gsf-board__desc" id="board-description-${k}">${esc(b.desc)}</span></span>
    </button>`}).join('');
  $('boardGrid').querySelectorAll('.gsf-board').forEach(el=>el.onclick=()=>selectBoard(el.dataset.id));
  const otherOn=current==='other';
  $('otherBoard').classList.toggle('is-on',otherOn);
  $('otherBoard').setAttribute('aria-checked',String(otherOn));
  $('otherBoard').tabIndex=otherOn?0:-1;
  $('otherBoard').querySelector('.gsf-other__action').textContent=otherOn?'✓ Selected':'Select →';
  $('otherBoardDetails').hidden=!otherOn;
  $('otherBoardDescription').value=otherBoardDescription;
}
function drawProduct(){
  const b=BOARDS[current];
  $('boardTitle').textContent=b.name;
  $('productType').innerHTML='<option value="">Select your product type</option>'+b.products.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
  $('productType').value=productByBoard[current]||'';
  $('productType').classList.remove('is-invalid');
}
$('productType').onchange=()=>{productByBoard[current]=$('productType').value;$('productType').classList.remove('is-invalid');drawRecap();};

/* ---------- Step 2 ---------- */
function drawCategories(){
  $('ctxBoard').textContent='Showing issues for: '+BOARDS[current].name;
  $('catGrid').innerHTML=DATA[current].cats.map((c,i)=>{const n=catCount(i),on=i===activeCat;
    return `<button class="gsf-cat ${on?'is-on':''}" data-index="${i}" id="category-${i}" aria-controls="challenge-panel" tabindex="${on?0:-1}" role="tab" aria-selected="${on}" type="button">
      <span class="gsf-cat__icon">${svg(ICONS[i])}</span>
      <span class="gsf-cat__txt"><strong>${esc(c.name)}</strong>${c.sub?`<small>${esc(c.sub)}</small>`:''}</span>
      <span class="gsf-cat__cnt ${n?'has':''}" aria-label="${n} selected">${n}</span>
    </button>`}).join('');
  $('catGrid').querySelectorAll('.gsf-cat').forEach(b=>b.onclick=()=>{activeCat=+b.dataset.index;drawCategories();drawProblems();document.querySelector(`.gsf-cat[data-index="${activeCat}"]`).focus();});
}
function drawProblems(){
  const cats=DATA[current].cats,cat=cats[activeCat];
  const setCount=()=>$('catCount').textContent=catCount(activeCat)+' / '+cat.issues.length+' selected';
  $('catTitle').textContent=cat.name;setCount();
  $('problems').innerHTML=cat.issues.map((v,i)=>{const id=activeCat+'-'+i,on=selected[current].has(id);
    return `<label class="gsf-issue ${on?'is-on':''}"><input type="checkbox" data-id="${id}" ${on?'checked':''}><span class="gsf-issue__box">${CHECK}</span><span>${esc(v)}</span></label>`}).join('');
  $('problems').querySelectorAll('input').forEach(inp=>inp.onchange=()=>{
    inp.checked?selected[current].add(inp.dataset.id):selected[current].delete(inp.dataset.id);
    inp.closest('label').classList.toggle('is-on',inp.checked);setCount();drawCategories();drawSummary();
  });
  $('prevCat').disabled=activeCat===0;$('nextCat').disabled=activeCat===cats.length-1;
}
$('prevCat').onclick=()=>{if(activeCat>0){activeCat--;drawCategories();drawProblems();}};
$('nextCat').onclick=()=>{if(activeCat<DATA[current].cats.length-1){activeCat++;drawCategories();drawProblems();}};
function drawSummary(){
  const items=getProblems();
  $('chosenCount').textContent=items.length;$('mCount').textContent=items.length;
  $('mbar').classList.toggle('is-show',items.length>0);$('mbar').setAttribute('aria-hidden',String(!items.length));
  if(!items.length){$('selectedList').innerHTML='<p class="gsf-sel__empty">No challenges specified. You can continue and ask our team for help.</p>';}
  else{
    const g={};items.forEach(o=>(g[o.category]=g[o.category]||[]).push(o));
    $('selectedList').innerHTML=Object.entries(g).map(([c,l])=>`<div class="gsf-sel__group"><h4>${esc(c)}</h4>${l.map(o=>`<span class="gsf-chip">${esc(o.issue)}<button type="button" data-rm="${o.id}" aria-label="Remove ${esc(o.issue)}">×</button></span>`).join('')}</div>`).join('');
    $('selectedList').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{selected[current].delete(b.dataset.rm);drawCategories();drawProblems();drawSummary();});
  }
  drawRecap();
}
$('clearBtn').onclick=()=>{selected[current].clear();drawCategories();drawProblems();drawSummary();};

/* ---------- Step 3 ---------- */
function drawApps(){
  $('appGrid').hidden=DATA[current].apps.length===0;
  $('appGrid').innerHTML=DATA[current].apps.map((s,i)=>{const on=applications[current].has(s),v=APP_VISUALS[current][i];
    return `<label class="gsf-app ${on?'is-on':''}">
      <input type="checkbox" data-index="${i}" ${on?'checked':''}>
      <span class="gsf-app__check" aria-hidden="true">✓</span>
      <span class="gsf-app__media"><img alt="${esc(s)}" loading="lazy" width="1100" height="825" src="${APP_IMG_BASE}${v.img}"></span>
      <span class="gsf-app__body"><span class="grecho-v3-kicker">${esc(v.k)}</span><span class="gsf-app__title">${esc(s)}</span>${APP_DESC[s]?`<small>${esc(APP_DESC[s])}</small>`:''}<span class="gsf-app__pick">${on?'✓ Selected':'Select application +'}</span></span>
    </label>`}).join('');
  $('appGrid').querySelectorAll('input').forEach(inp=>inp.onchange=()=>{
    const app=DATA[current].apps[+inp.dataset.index];
    inp.checked?applications[current].add(app):applications[current].delete(app);
    const card=inp.closest('label');card.classList.toggle('is-on',inp.checked);
    card.querySelector('.gsf-app__pick').textContent=inp.checked?'✓ Selected':'Select application +';
    drawRecap();
  });
  drawOtherApplication();
}
function drawOtherApplication(){
  const on=otherApplicationSelectedByBoard[current];
  $('otherApplicationCheckbox').checked=on;
  $('otherApplicationOption').classList.toggle('is-on',on);
  $('otherApplicationOption').querySelector('.gsf-other__action').textContent=on?'✓ Selected':'Select →';
  $('otherApplicationDetails').hidden=!on;
  $('otherApplicationDescription').value=otherApplicationDescriptionByBoard[current];
}

/* ---------- Step 4 ---------- */
function drawRecap(){
  const p=productByBoard[current],n=getProblems().length,a=selectedApps();
  $('rBoard').textContent=BOARDS[current].name;
  $('rProduct').textContent=p||'Not selected yet';$('rProduct').className=p?'':'is-miss';
  $('rIssues').textContent=n?n+' issue'+(n>1?'s':'')+' selected':'None selected yet';$('rIssues').className=n?'':'is-miss';
  $('rApps').textContent=a.length?a.join(', '):'Not specified (optional)';
  if(p&&n)$('ctaMsg').textContent='';
}
function render(){validateBoardState(current);drawBoards();drawProduct();drawCategories();drawProblems();drawSummary();drawApps();}

