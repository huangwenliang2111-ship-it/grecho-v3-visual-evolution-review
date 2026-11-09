/* Owner-authorized local contact correction; original geometry and images stay untouched. */
(()=>{'use strict';
const original=window.GRECHO_SOLUTIONS_REV03_GEOMETRY;
const math=window.GrechoSolutionsRev03Projective;
if(original&&math){
  const local=JSON.parse(JSON.stringify(original));
  const register=[];
  for(const [demo,cfg]of Object.entries(local)){
    const before=cfg.bottom.targetQuad.map(p=>p.slice());
    cfg.bottom.targetQuad=cfg.coreLower.map(p=>p.slice());
    const h=math.homography(cfg.bottom.sourceQuad,cfg.bottom.targetQuad);
    cfg.bottom.homographySourceToTarget=[h.slice(0,3),h.slice(3,6),h.slice(6,9)];
    cfg.intentionalBottomBoundaryVerticalNativePx=0;
    cfg.localContactCorrection='Bottom target coincides with existing coreLower; source/top/core unchanged.';
    register.push({demo,before,after:cfg.bottom.targetQuad,sourceQuad:cfg.bottom.sourceQuad});
  }
  window.GRECHO_SPLIT_ORIGINAL_GEOMETRY=original;
  window.GRECHO_SOLUTIONS_REV03_GEOMETRY=local;
  window.grechoSplitContactRegister=register;
}
document.querySelectorAll('#solution-hubs .grecho-home-split').forEach(root=>{
  const source=root.querySelector('.grecho-split-fallback');
  const ready=()=>source.decode().then(()=>root.classList.add('grecho-split-decoded')).catch(failed);
  function failed(){
    root.classList.remove('grecho-split-decoded');
    root.querySelector('.grecho-rev03-trigger').disabled=true;
    (window.grechoRev03QAEvents??=[]).push({type:'split-fallback-unavailable',demo:root.dataset.rev03Demo});
  }
  if(source.complete&&source.naturalWidth)ready();
  else{source.addEventListener('load',ready,{once:true});source.addEventListener('error',failed,{once:true});}
});
})();
