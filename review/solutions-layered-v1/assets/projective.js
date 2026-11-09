/* Planar four-point registration; dependency-free shared browser helper. */
(() => {
  'use strict';
  const solve=(a,b)=>{
    const n=b.length,m=a.map((row,i)=>[...row,b[i]]);
    for(let k=0;k<n;k++){
      let pivot=k;for(let r=k+1;r<n;r++)if(Math.abs(m[r][k])>Math.abs(m[pivot][k]))pivot=r;
      [m[k],m[pivot]]=[m[pivot],m[k]];
      const d=m[k][k];if(Math.abs(d)<1e-12)throw Error('Degenerate planar registration');
      for(let j=k;j<=n;j++)m[k][j]/=d;
      for(let r=0;r<n;r++)if(r!==k){const v=m[r][k];for(let j=k;j<=n;j++)m[r][j]-=v*m[k][j];}
    }
    return m.map(row=>row[n]);
  };
  const homography=(source,target)=>{
    const a=[],b=[];
    source.forEach(([x,y],i)=>{const[u,v]=target[i];a.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);b.push(u,v);});
    return [...solve(a,b),1];
  };
  const multiply=(a,b)=>Array.from({length:9},(_,i)=>{const r=Math.floor(i/3),c=i%3;return a[r*3]*b[c]+a[r*3+1]*b[c+3]+a[r*3+2]*b[c+6];});
  const fitMatrix=(h,scale,ox,oy)=>multiply(multiply([scale,0,ox,0,scale,oy,0,0,1],h),[1/scale,0,-ox/scale,0,1/scale,-oy/scale,0,0,1]);
  const css=h=>'matrix3d('+[h[0],h[3],0,h[6],h[1],h[4],0,h[7],0,0,1,0,h[2],h[5],0,h[8]].map(v=>Number(v.toPrecision(13))).join(',')+')';
  const interpolate=(a,b,p)=>a.map((q,i)=>q.map((v,j)=>v+(b[i][j]-v)*p));
  const project=(h,[x,y])=>{const w=h[6]*x+h[7]*y+h[8];return[(h[0]*x+h[1]*y+h[2])/w,(h[3]*x+h[4]*y+h[5])/w];};
  globalThis.GrechoSolutionsRev03Projective=Object.freeze({homography,fitMatrix,css,interpolate,project});
})();
