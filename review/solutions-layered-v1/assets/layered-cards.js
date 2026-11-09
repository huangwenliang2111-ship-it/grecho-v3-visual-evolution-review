/* REV03 engine adaptation: frozen planar geometry, 180ms handoff + 440ms motion.
 * One interruptible chain and one decode promise per card; no network telemetry. */
(() => {
  'use strict';
  const configs=window.GRECHO_SOLUTIONS_REV03_GEOMETRY;
  const math=window.GrechoSolutionsRev03Projective;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const MOTION=440,HANDOFF=180;
  const events=window.grechoRev03QAEvents=[];
  document.querySelectorAll('.grecho-solutions-rev03 [data-rev03-demo]').forEach(root=>{
    const cfg=configs?.['demo-'+root.dataset.rev03Demo];
    const trigger=root.querySelector('.grecho-rev03-trigger');
    const assembly=root.querySelector('.grecho-rev03-assembly');
    const source=root.querySelector('.grecho-rev03-source');
    const top=root.querySelector('.grecho-rev03-top'),bottom=root.querySelector('.grecho-rev03-bottom');
    const litBottom=root.querySelector('.grecho-rev03-lighting-bottom');
    const assets=[...root.querySelectorAll('[data-rev03-src]')];
    const label=root.querySelector('.grecho-rev03-state'),cue=root.querySelector('.grecho-rev03-cue-text');
    const status=root.querySelector('[role="status"]');
    let desired=false,ready=false,failed=false,loading=null;
    let progress=0,mix=0,frame=0,generation=0,lastTouch=0,announce=false;
    let fit={scale:1,ox:0,oy:0};
    const draw=()=>{
      root.style.setProperty('--assembly-progress',progress.toFixed(8));
      root.style.setProperty('--layer-mix',mix.toFixed(8));
      root.style.setProperty('--lighting-weight',Math.pow(1-progress,2).toFixed(8));
      for(const [part,img]of [['top',top],['bottom',bottom]]){
        if(progress<1e-9){img.style.transform='none';if(part==='bottom')litBottom.style.transform='none';continue;}
        const q=math.interpolate(cfg[part].sourceQuad,cfg[part].targetQuad,progress);
        const h=math.homography(cfg[part].sourceQuad,q);
        img.style.transform=math.css(math.fitMatrix(h,fit.scale,fit.ox,fit.oy));
        if(part==='bottom')litBottom.style.transform=img.style.transform;
      }
    };
    const phase=name=>{
      root.dataset.rev03Phase=name;
      const complete=name==='assembled';
      trigger.setAttribute('aria-pressed',String(complete));
      label.textContent=complete?'Assembled':name==='loading'?'Loading layers…':
        ['handoff-in','assembling'].includes(name)?'Assembling':
        ['separating','handoff-out'].includes(name)?'Exploding':'Exploded view';
      cue.textContent=name==='fallback'?'Static concept view':
        fine.matches?(desired?'Move away to explode':'Hover to assemble'):
        (desired?'Tap to explode':'Tap to assemble');
    };
    const cancel=()=>{generation++;cancelAnimationFrame(frame);frame=0;};
    const settled=()=>{
      draw();phase(desired?'assembled':'separated');
      if(announce&&!failed)status.textContent=desired?'Assembled. Activate again to show the exploded view.':'Exploded view restored.';
      announce=false;
    };
    const resize=()=>{
      if(!cfg)return;
      const s=getComputedStyle(assembly),w=parseFloat(s.width),h=parseFloat(s.height);
      fit.scale=Math.min(w/cfg.width,h/cfg.height);
      fit.ox=(w-cfg.width*fit.scale)/2;fit.oy=(h-cfg.height*fit.scale)/2;
      root.dataset.rev03FitScale=fit.scale.toFixed(9);draw();
    };
    const animate=()=>{
      cancel();const token=generation;if(!ready||failed)return;
      if(reduce.matches){progress=mix=desired?1:0;settled();return;}
      const tween=(key,to,baseMs,done)=>{
        const from=key==='progress'?progress:mix;
        const duration=baseMs*Math.abs(to-from),start=performance.now();
        if(duration<.5){if(token===generation){
          if(key==='progress')progress=to;else mix=to;
          draw();done();
        }return;}
        const tick=now=>{
          if(token!==generation||failed)return;
          const t=Math.min(1,(now-start)/duration),v=from+(to-from)*(.5-.5*Math.cos(Math.PI*t));
          if(key==='progress')progress=v;else mix=v;
          draw();
          if(t<1)frame=requestAnimationFrame(tick);else{frame=0;done();}
        };
        frame=requestAnimationFrame(tick);
      };
      if(desired){
        phase('handoff-in');tween('mix',1,HANDOFF,()=>{
          phase('assembling');tween('progress',1,MOTION,settled);
        });
      }else{
        phase('separating');tween('progress',0,MOTION,()=>{
          phase('handoff-out');tween('mix',0,HANDOFF,settled);
        });
      }
    };
    const fail=reason=>{
      cancel();failed=true;ready=false;desired=false;progress=mix=0;
      draw();phase('fallback');root.classList.remove('grecho-rev03-ready');
      trigger.disabled=true;
      status.textContent='Interactive layers unavailable. The original exploded illustration and solution link remain available.';
      events.push(Object.freeze({event:'layer-fallback',demo:root.dataset.rev03Demo,reason}));
      root.dispatchEvent(new CustomEvent('grecho:rev03-fallback',{bubbles:true,detail:{demo:root.dataset.rev03Demo,reason}}));
    };
    if(!cfg||!math||typeof math.homography!=='function'||typeof math.css!=='function'){
      root.dataset.rev03Phase='fallback';trigger.disabled=true;
      events.push(Object.freeze({event:'layer-fallback',demo:root.dataset.rev03Demo,reason:'geometry-unavailable'}));
      status.textContent='Static exploded concept view.';return;
    }
    const preload=()=>{
      if(failed||ready||loading)return loading;
      if(desired)phase('loading');
      loading=Promise.all(assets.map(async img=>{
        img.src=img.dataset.rev03Src;
        if(img.decode)await img.decode();else await new Promise((resolve,reject)=>{
          if(img.complete){img.naturalWidth?resolve():reject();return;}
          img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});
        });
        if(!img.naturalWidth)throw Error('Image decode failed');
      })).then(()=>{
        if(failed)return;
        ready=true;root.classList.add('grecho-rev03-ready');resize();
        if(desired)animate();else{draw();phase('separated');}
      }).catch(()=>fail('asset-unavailable'));
      return loading;
    };
    const request=(next,manual=false)=>{
      if(failed||next===desired)return;
      desired=next;announce=manual;
      if(ready)animate();else if(next)preload();else phase('separated');
    };
    trigger.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&fine.matches)request(true);});
    trigger.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')request(false);});
    trigger.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){lastTouch=Date.now();preload();}});
    trigger.addEventListener('pointercancel',()=>request(false));
    trigger.addEventListener('focus',preload);
    trigger.addEventListener('click',e=>{if(failed||(e.detail>0&&fine.matches&&Date.now()-lastTouch>800))return;request(!desired,true);});
    trigger.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();request(false,true);}});
    trigger.addEventListener('blur',()=>request(false));
    source.addEventListener('load',resize);
    if(window.ResizeObserver)new ResizeObserver(resize).observe(assembly);else addEventListener('resize',resize);
    if(reduce.addEventListener)reduce.addEventListener('change',()=>{if(ready&&!failed)animate();});
    if(fine.addEventListener)fine.addEventListener('change',()=>phase(root.dataset.rev03Phase));
    root.dataset.rev03Enhanced='true';trigger.disabled=false;
    draw();phase('separated');resize();
  });
})();
