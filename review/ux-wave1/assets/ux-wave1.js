window.GRECHO_UX_REQUEST_HELP={"Request Technical Data": "For product briefs, Color TDS / Marketing TDS access, Full TDS by review, test report scope and compliance document clarification.", "Request a Sample": "For material direction screening, sample comparison, trial-roll discussion and application-based review.", "Request a Quote": "For clearer product direction, specification, estimated volume, destination and quotation requirements.", "Application Review": "For uncertain material direction, special width, coating, process needs or project-specific coordination."};
window.GRECHO_UX_DOCUMENTS={"CTDS-001": {"title": "GCKF140–200gsm Plain White Coated Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-002": {"title": "GCKF_SD Colored Fiberglass Coated Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-003": {"title": "GCKF 600A / 700# / 900D Spray Dotted Fiberglass Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-004": {"title": "GCKF_QY 380gsm White Spray Sanded Fiberglass Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-005": {"title": "GCSD100–200gsm Fiberglass Black Coated Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-006": {"title": "GCJR360 Fiberglass Satin Fabric", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-007": {"title": "GCJR230 Fiberglass Plain Fabric", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-008": {"title": "Fiberglass Wood Grain Fabric 360gsm", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-009": {"title": "GCJR350 Fiberglass Jacquard Fabric", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-010": {"title": "Wood Grain Series Glass Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-011": {"title": "Silent Land Series Glass Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-012": {"title": "Black Plain Fiberglass Fabric", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-013": {"title": "120g–140g Acoustic Ceiling Veil", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}, "CTDS-014": {"title": "Fluorine-Free Fiberglass Coated Facer", "direction": "general", "solution": "general", "doc": "color-tds"}, "CTDS-015": {"title": "Acoustic Composite Fabric", "direction": "acoustic", "solution": "acoustic", "doc": "color-tds"}};
window.GRECHO_UX_PUBLIC_CONTEXT={"request": ["application-review", "quote", "sample", "technical-data"], "source": ["contact-v2-final", "contact-v2-path", "faq-v2-final", "faq-v2-hero", "faq-v2-next", "faq-v2-resource-card", "header-primary", "products", "resource-center", "resource-center-v2-category", "resource-center-v2-final", "resource-center-v2-hero", "resource-center-v2-review"], "cta_source": ["contact-v2-path", "header-primary", "products", "resource-center", "resource-center-v2-category"], "cta_location": ["category-card", "faq-preview", "final-cta", "header", "hero", "internal-link", "no-match", "path-card", "product-card"], "source_page_type": ["contact", "faq", "products_landing", "resource_center"], "solution": ["acoustic", "general", "gypsum", "mineral-wool", "pir-pur-etics"], "product_direction": ["acoustic", "acoustic-ceiling-facer", "acoustic-glass-paper", "black-acoustic-backing", "black-acoustic-facer", "co-development", "color-acoustic-facer", "controlled-decorative-facing", "fiberglass-fabric", "foil-composite-facer", "general", "glass-veil-tissue", "gypsum-board-facer", "mineral-wool-insulation-facer", "pfas-free-insulation-facer", "pir-pur-etics", "pir-pur-foam-board-facer", "reinforced-veil", "silicone-coated-glass-fabric"], "product_family": ["gc-ac", "gc-al", "gc-fb", "gc-fb-sl", "gc-gy", "gc-in", "gc-pir", "gc-v"], "doc": ["color-tds", "compliance-document", "fire-test-document", "full-tds", "not-sure", "product-brief", "review-required", "sds-msds"], "tds_id": ["CTDS-001", "CTDS-002", "CTDS-003", "CTDS-004", "CTDS-005", "CTDS-006", "CTDS-007", "CTDS-008", "CTDS-009", "CTDS-010", "CTDS-011", "CTDS-012", "CTDS-013", "CTDS-014", "CTDS-015"]};
/* UX_REVIEW_DRAFT. UI state exists only in memory. No submissions, network, storage or permission changes. */
(()=>{'use strict';
 const main=document.querySelector('[data-ux-wave1]');if(!main)return;
 const $=(q,r=main)=>r.querySelector(q),$$=(q,r=main)=>Array.from(r.querySelectorAll(q));
 const page=main.dataset.uxWave1;
 const enable=list=>list.forEach(e=>e.disabled=false);
 if(page==='products'){
  const root=$('[data-products-selector]'),cards=$$('[data-product-card]',root),inputs=$$('.gpl-filter-input',root),buttons=$$('[data-series-filter]',root),familySelect=$('[data-ux-family]',root);let family='featured';
  const tokens=s=>String(s||'').split(/\s+/).filter(Boolean);
  const render=()=>{
   const groups={};inputs.filter(i=>i.checked).forEach(i=>(groups[i.dataset.filterGroup]??=[]).push(i.value));
   let count=0;
   cards.forEach(c=>{const familyOK=family==='all'||(family==='featured'&&c.dataset.featured==='true')||c.dataset.series===family;
    const filterOK=Object.entries(groups).every(([g,vs])=>g==='flags'?vs.every(v=>tokens(c.dataset[g]).includes(v)):vs.some(v=>tokens(c.dataset[g]).includes(v)));
    c.hidden=!(familyOK&&filterOK);if(!c.hidden)count++;
   });
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.seriesFilter===family)));familySelect.value=family;
   $('[data-result-count]',root).textContent=count+' '+(count===1?'route':'routes');
   $('[data-selected-filters]',root).textContent=inputs.filter(i=>i.checked).map(i=>i.parentElement.textContent.trim()).join(' · ')||'No filters selected';
   $('[data-results-title]',root).textContent=family==='featured'?'Featured product routes':family==='all'?'All product routes':[...familySelect.options].find(b=>b.value===family)?.dataset.label+' product routes';
   $('[data-no-match]',root).hidden=count!==0;
  };
  buttons.forEach(b=>b.addEventListener('click',()=>{family=b.dataset.seriesFilter;render()}));
  familySelect.addEventListener('change',()=>{family=familySelect.value;render()});
  inputs.forEach(i=>i.addEventListener('change',render));
  $$('[data-clear-filters]',root).forEach(b=>b.addEventListener('click',()=>{inputs.forEach(i=>i.checked=false);family='featured';render()}));
  $('[class=ux-product-filter-panel]',root).open=matchMedia('(min-width:851px)').matches;render();enable([familySelect,...buttons,...inputs,...$$('[data-clear-filters]',root)]);root.dataset.selectorReady='true';
 }
 if(page==='resource-center'){
  const search=$('#ux-resource-search'),category=$('#ux-resource-category'),entries=$$('[data-resource-entry]');
  const filter=()=>{const q=search.value.trim().toLowerCase();let count=0;entries.forEach(e=>{e.hidden=!(e.textContent.toLowerCase().includes(q)&&(category.value==='all'||e.dataset.category===category.value));if(!e.hidden)count++});
   $('[data-resource-count]').textContent=count+' document '+(count===1?'entry':'entries');$('[data-resource-empty]').hidden=count!==0;};
  search.addEventListener('input',filter);category.addEventListener('change',filter);$('[data-resource-reset]').addEventListener('click',()=>{search.value='';category.value='all';filter()});filter();enable([search,category,$('[data-resource-reset]')]);
 }
 if(page==='contact'){
  const select=$('select[name="dropdown"]'),choices=$$('[data-request-choice]'),q=new URLSearchParams(location.search);
  const requestMap={'technical-data':'Request Technical Data','sample':'Request a Sample','quote':'Request a Quote','technical-team':'Talk to Technical Team','general-inquiry':'General Inquiry','application-review':'Application Review'};
  const state={request:requestMap[q.get('request')]||''};
  const render=()=>{const help=$('[data-request-help]');help.textContent=window.GRECHO_UX_REQUEST_HELP?.[state.request]||'';help.hidden=!help.textContent;select.value=state.request;choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.requestChoice===state.request)));$('[data-request-selected]').textContent=state.request?'Selected request: '+state.request:'Choose a request type';};
  choices.forEach(b=>b.addEventListener('click',()=>{state.request=b.dataset.requestChoice;render()}));
  const heroRequest=$('section[data-secondary-hero] a[href="#request-form"]');
  if(heroRequest&&heroRequest.textContent.trim()==='Request Technical Data')heroRequest.addEventListener('click',()=>{state.request='Request Technical Data';render()});
  render();enable(choices);
  // Public values are shown as text only after matching an existing source destination.
  const values=window.GRECHO_UX_PUBLIC_CONTEXT||{},parts=[];
  const labels={product:'Product',product_family:'Product family',sales_code:'Sales code',product_model:'Product model',route_id:'Product route',tds_id:'Document'};
  for(const key of Object.keys(labels)){
   const value=q.get(key);if(value&&values[key]?.includes(value)){
    const docRecord=key==='tds_id'?window.GRECHO_UX_DOCUMENTS?.[value]:null;
    if(key==='tds_id'&&(!docRecord||q.get('doc')!==docRecord.doc||q.get('solution')!==docRecord.solution||q.get('product_direction')!==docRecord.direction))continue;
    const title=docRecord?.title||'';
    parts.push(labels[key]+': '+value+(title?' · '+title:''));
   }
  }
  $('[data-ux-context-text]').textContent=parts.join(' · ');$('[data-ux-context]').hidden=parts.length===0;
 }
 if(page==='faq'){
  const search=$('[data-gfaq-search]'),buttons=$$('[data-gfaq-filter]'),groups=$$('[data-gfaq-group]'),items=$$('[data-gfaq-item]');let topic='all';
  const filter=()=>{const q=search.value.trim().toLowerCase();let total=0;groups.forEach(g=>{let count=0;$$('[data-gfaq-item]',g).forEach(i=>{i.hidden=!((topic==='all'||g.dataset.gfaqGroup===topic)&&i.textContent.toLowerCase().includes(q));if(!i.hidden)count++});g.hidden=count===0;total+=count});
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gfaqFilter===topic)));
   buttons.forEach(b=>b.classList.toggle('is-active',b.dataset.gfaqFilter===topic));
   $('[data-ux-faq-count]').textContent=total+' '+(total===1?'question':'questions');$('.gfaq-empty').hidden=total!==0;
  };
  buttons.forEach(b=>b.addEventListener('click',()=>{topic=b.dataset.gfaqFilter;filter()}));search.addEventListener('input',filter);
  $('[data-faq-clear]').addEventListener('click',()=>{search.value='';topic='all';filter()});
  $$('[data-ux-shortcut]').forEach(a=>a.addEventListener('click',()=>{search.value='';topic='all';filter();const target=document.getElementById(a.hash.slice(1));target.open=true;target.focus({preventScroll:true})}));
  // No forced scroll or focus movement during ordinary input/category filtering.
  filter();enable([search,...buttons,$('[data-faq-clear]')]);
 }
 main.dataset.enhanced='true';
})();
