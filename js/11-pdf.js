'use strict';
// 11-pdf.js: PDF dựng lười, ảnh thu nhỏ, bộ đọc, cuộn. Dòng 1218-1295 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: pdfRat, shR, setCv, mkTh, evict, pdfReload, pdfClean, pump, job, anim, fling, endMove, magnet, icBuild, icAdd, thumb, thumbObj, PB, THB, PA, CN, tmo,
//   pdfOpen, pgAt, freeFar, wk, straight, elastic
/* PDF: dựng lười theo vùng nhìn. Trang đang xem dựng trước (gần giữa màn hình nhất), kèm vài trang liền kề theo hướng cuộn; trang trôi xa thì hủy và giải phóng; cuộn nhanh thì hoãn. Mọi lời gọi vào bộ đọc đều có thời hạn: kẹt thì nạp lại tài liệu. */
const PB=Math.round(Math.min(56e6,Math.max(20e6,(navigator.deviceMemory||4)*9e6))),THB=PB*.25,PA=2,CN=2;
const tmo=(p,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej({tmo:1}),ms);p.then(v=>{clearTimeout(t);res(v)},e=>{clearTimeout(t);rej(e)})});
const pdfOpen=buf=>pdfjsLib.getDocument({data:new Uint8Array(buf),verbosity:0}).promise;
async function pdfRat(id,d){let c=null;try{c=await get('r:'+id)}catch(e){}const n=d.numPages;if(Array.isArray(c)&&c.length===n&&c.every(r=>r>0))return c;
 const rs=[];let lr=1.4142,bad=0;for(let i=0;i<n;i+=12){const b=await Promise.all(Array.from({length:Math.min(12,n-i)},(_,j)=>tmo(d.getPage(i+j+1),20000).then(p=>{const v=p.getViewport({scale:1});p.cleanup();return v.width>0?v.height/v.width:0}).catch(()=>0)));for(const r of b){if(r>0)lr=r;else bad=1;rs.push(r>0?r:lr)}if(n>24)snack('Đang mở PDF… '+Math.min(i+12,n)+'/'+n)}
 if(!bad)try{await put('r:'+id,rs)}catch(e){}return rs}
const pgAt=cy=>{const s=S.sheets;let lo=0,hi=s.length-1,n=0;while(lo<=hi){const m=(lo+hi)>>1;if(s[m].y<=cy){n=m;lo=m+1}else hi=m-1}return n};
function shR(y0,y1){const s=S.sheets,N=s.length;let lo=0,hi=N-1,a=N;while(lo<=hi){const m=(lo+hi)>>1;if(s[m].y+s[m].h>=y0){a=m;hi=m-1}else lo=m+1}let b=a-1;while(b+1<N&&s[b+1].y<=y1)b++;return[a,b]}
function setCv(sh,cv){const o=sh.cv;S.tot+=(cv?cv.width*cv.height:0)-(o?o.width*o.height:0);sh.cv=cv;if(o)o.width=o.height=0}
/* ảnh thu nhỏ của trang đã dựng: hiện tạm khi bản đầy đủ đã bị giải phóng; trang đầu giữ 320px cho ảnh xem trước */
function mkTh(sh,i,cv){if(sh.th)return;const w=i?240:320,t=document.createElement('canvas');t.width=w;t.height=Math.max(1,Math.round(w*cv.height/cv.width));const c=t.getContext('2d');if(!c)return;c.imageSmoothingQuality='high';c.drawImage(cv,0,0,t.width,t.height);sh.th=t;S.tt+=t.width*t.height;
 if(S.tt>THB){const L=[],ci=S.pgn||0;S.sheets.forEach((q,j)=>{if(q.th&&j&&j!==i)L.push(j)});L.sort((p,q)=>Math.abs(q-ci)-Math.abs(p-ci));for(const j of L){if(S.tt<=THB)break;const q=S.sheets[j];S.tt-=q.th.width*q.th.height;q.th.width=q.th.height=0;q.th=null}}}
function evict(a,b){if(S.tot<=PB)return;const c=(a+b)/2,L=[];S.sheets.forEach((q,i)=>{if(q.cv&&(i<a||i>b))L.push(i)});L.sort((p,q)=>Math.abs(q-c)-Math.abs(p-c));for(const i of L){if(S.tot<=PB)break;setCv(S.sheets[i],null)}}
const freeFar=SS=>SS.sheets.forEach((q,i)=>{if(q.cv&&(i<SS.va||i>SS.vb))setCv(q,null)}),wk=(SS,ms)=>{clearTimeout(SS.pwt);SS.pwt=setTimeout(()=>{if(S===SS)req()},ms)};
/* bộ đọc ngừng phản hồi (bị hệ điều hành dừng, hết bộ nhớ): nạp lại tài liệu từ IndexedDB, các trang đã dựng giữ nguyên */
function pdfReload(){const SS=S,now=performance.now();if(!SS||!SS.pdf||SS.rl||now-(SS.rc||0)<15e3)return;SS.rl=1;SS.rc=now;SS.gen++;
 (async()=>{let d=null;try{d=await tmo((async()=>pdfOpen(await get('p:'+SS.id)))(),6e4)}catch(e){}
  if(S===SS){if(d){const o=pdf;pdf=d;if(o)try{o.destroy().catch(()=>{})}catch(e){}}SS.er=0;SS.nr=0;SS.rl=0;SS.sheets.forEach(q=>{q.nx=0});req()}else if(d)try{d.destroy().catch(()=>{})}catch(e){}})()}
/* dọn bộ nhớ đệm (phông, ảnh) của bộ đọc; chỉ khi không trang nào đang dựng */
function pdfClean(){const SS=S,d=pdf;SS.cln=1;SS.nr=0;tmo(Promise.resolve().then(()=>d.cleanup()),8e3).catch(e=>{if(e&&e.tmo)pdfReload()}).then(()=>{if(S===SS){SS.cln=0;req()}})}
function pump(a,b){const SS=S;if(!pdf)return;const now=performance.now(),s=SS.tr.s,cy=(stage.clientHeight/2-SS.tr.y)/s,N=SS.sheets.length;
 if(a>b)a=b=pgAt(cy);SS.va=a;SS.vb=b;
 const dt=now-SS.pt;if(dt>0&&dt<100)SS.sp=Math.max(Math.abs(cy-SS.py)*s/dt,SS.sp*.8);else SS.sp=0;if(Math.abs(cy-SS.py)>.5)SS.dr=cy>SS.py?1:-1;SS.pt=now;SS.py=cy;
 for(const j of SS.fl)if(j<a-PA-2||j>b+PA+2){const t=SS.sheets[j].tk;if(t)try{t.cancel()}catch(e){}}
 if(SS.rl||SS.cln)return;if(SS.tot>PB)evict(a,b);
 if(SS.sp>1){wk(SS,120);return}
 if(SS.busyN===0&&SS.nr>=(SS.sp>.3?30:8)){pdfClean();return}
 const pn=g&&g.m==='pinch',zw=Math.max(600,Math.ceil(SW*s*(devicePixelRatio||1)/200)*200),C=[];
 for(let i=a;i<=b;i++)C.push(i);C.sort((p,q)=>{const P=SS.sheets[p],Q=SS.sheets[q];return Math.abs(P.y+P.h/2-cy)-Math.abs(Q.y+Q.h/2-cy)});const nv=C.length;
 if(SS.sp<.35){const d=SS.dr;for(let k=1;k<=PA;k++)C.push(d>0?b+k:a-k);C.push(d>0?a-1:b+1)}
 for(let n=0;n<C.length&&SS.busyN<CN;n++){const i=C[n];if(i<0||i>=N)continue;const sh=SS.sheets[i],pre=n>=nv;
  if(sh.busy||(sh.nx&&now<sh.nx)||(pre&&SS.busyN>=CN-1))continue;
  const k=sh.lo||1,want=Math.min(3000*k,Math.sqrt(16e6*SW/sh.h),pre?Math.min(zw,1600):zw),w=sh.cv&&sh.cv.width;
  if(w&&(pn||(w>=want*.9&&w<=want*2.5)))continue;
  if(pre&&SS.tot+want*want*sh.h/SW>PB*.9)continue;
  job(sh,i,want)}}
async function job(sh,i,want){const SS=S,doc=pdf,gen=SS.gen,k=sh.lo||1;let pg=null,cv=null,to=0,tm=0;sh.busy=1;SS.busyN++;SS.fl.add(i);
 try{pg=await tmo(doc.getPage(i+1),2e4);const vp=pg.getViewport({scale:want/pg.getViewport({scale:1}).width});cv=document.createElement('canvas');cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);const cx=cv.getContext('2d');if(!cx)throw 0;const tk=sh.tk=pg.render({canvasContext:cx,viewport:vp});to=setTimeout(()=>{tm=1;tk.cancel()},3e4);await tk.promise;clearTimeout(to);sh.tk=null;pg.cleanup();
  if(S===SS){setCv(sh,cv);const c=cv;cv=null;try{mkTh(sh,i,c)}catch(x){}sh.err=0;SS.er=0;SS.nr++}}
 catch(e){clearTimeout(to);sh.tk=null;if(cv)cv.width=cv.height=0;if(pg)try{pg.cleanup()}catch(x){}
  if(S===SS&&!(!tm&&e&&e.name==='RenderingCancelledException')){
   if(SS.gen===gen){SS.er++;let wt=3e3;if(!(e&&e.tmo)){sh.err=(sh.err||0)+1;sh.lo=Math.max(.35,k*.7);wt=Math.min(8e3,700*sh.err);if(sh.err<=2)freeFar(SS)}
    sh.nx=performance.now()+wt;setTimeout(()=>{if(S===SS)req()},wt+50);if((e&&e.tmo)||SS.er>=3)pdfReload()}
   else sh.nx=0}}
 sh.busy=0;SS.fl.delete(i);if(S!==SS)return;SS.busyN--;evict(SS.va,SS.vb);req()}
function anim(t,ms,back){if(T.na)ms=1;const a={...S.tr},t0=performance.now(),id=S.animId=Math.random(),c=1.1;const st=n=>{if(!S||S.animId!==id)return;const k=Math.min(1,(n-t0)/ms),m=k-1,e=back?1+(c+1)*m*m*m+c*m*m:1-Math.pow(1-k,3);S.tr={s:a.s+(t.s-a.s)*e,x:a.x+(t.x-a.x)*e,y:a.y+(t.y-a.y)*e};S.mv=performance.now();req();if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)}
function fling(vx,vy){const id=S.animId=Math.random();let l=performance.now();const st=n=>{if(!S||S.animId!==id)return;const dt=Math.min(32,n-l);l=n;if(straight()){const cx=(stage.clientWidth-S.W*S.tr.s)/2;S.tr.x=cx+(S.tr.x-cx)*Math.pow(.992,dt)}else S.tr.x+=vx*dt;S.tr.y+=vy*dt;const f=Math.pow(.9965,dt);vx*=f;vy*=f;clampT();S.mv=performance.now();req();if(Math.hypot(vx,vy)>.03)requestAnimationFrame(st);else magnet()};requestAnimationFrame(st)}
function endMove(gg){const v=Math.hypot(gg.vx||0,gg.vy||0);if(v>.2&&performance.now()-gg.lt<90)fling(gg.vx,gg.vy);else magnet()}
/* Khóa + PDF vừa khít bề ngang: cuộn thẳng tắp, chỉ cho nhích ngang rất nhẹ (tối đa 12px) rồi thu về giữa */
const straight=()=>!!(T.lk&&S&&S.pdf&&!S.edit&&S.W*S.tr.s<=stage.clientWidth*1.02),elastic=o=>12*Math.tanh(o/28);
function magnet(){if(!S||!T.lk||S.edit)return;const w=stage.clientWidth,vh=stage.clientHeight-RV(),t=S.tr,ns=Math.abs(t.s/S.f-1)<.1?S.f:t.s,wx=(w/2-t.x)/t.s,wy=(vh/2-t.y)/t.s;let nx=w/2-wx*ns,ny=vh/2-wy*ns;
 if(S.W*ns<=w*1.02){const tx=(w-S.W*ns)/2;nx=tx}
 if(!S.pdf&&S.H*ns<=vh*1.02){const ty=(vh-S.H*ns)/2+4;ny=ty}
 if(ns===t.s&&Math.abs(nx-t.x)<.5&&Math.abs(ny-t.y)<.5)return;hap();anim({s:ns,x:nx,y:ny},280,1)}
function icBuild(W,H,d){const mx=Math.round(W*.25),my=Math.round(H*.25);let ic=S.ic;if(!ic||ic.w!==W||ic.h!==H){const cv=document.createElement('canvas');cv.width=W+2*mx;cv.height=H+2*my;ic=S.ic={cv,cx:cv.getContext('2d'),w:W,h:H,mx,my}}
 const{s,x,y}=S.tr,c=ic.cx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,ic.cv.width,ic.cv.height);c.setTransform(d*s,0,0,d*s,d*x+mx,d*y+my);
 const l=(-mx-d*x)/(d*s),r=(ic.cv.width-mx-d*x)/(d*s),t=(-my-d*y)/(d*s),b2=(ic.cv.height-my-d*y)/(d*s);
 for(const st of S.strokes){const b=bb(st);if(b[2]<l||b[0]>r||b[3]<t||b[1]>b2)continue;drawStroke(c,st)}
 ic.v=S.inkV;ic.s=s;ic.x=x;ic.y=y;ic.d=d}
function icAdd(st){const ic=S.ic;if(ic&&ic.v===S.inkV){ic.cx.setTransform(ic.d*ic.s,0,0,ic.d*ic.s,ic.d*ic.x+ic.mx,ic.d*ic.y+ic.my);drawStroke(ic.cx,st)}else S.inkV++}
function thumb(){const W=320,im=!!S.base,cr=im?Math.max(9/16,Math.min(16/9,S.W/S.H)):0,hh=S.pdf?S.sheets[0].h:S.H,k=im?Math.max(W/S.W,W/cr/S.H):W/S.W,cv=document.createElement('canvas');cv.width=W;cv.height=im?Math.round(W/cr):Math.max(1,Math.round(hh*(W/S.W)));if(im)S.meta.car=cr;const c=cv.getContext('2d');c.fillStyle=S.pdf?'#fff':S.c.paper||'#fff';c.fillRect(0,0,W,cv.height);const s0=S.pdf&&(S.sheets[0].cv||S.sheets[0].th);if(s0&&s0.width>0)try{c.drawImage(s0,0,0,W,cv.height)}catch(e){}if(im){c.translate((W-S.W*k)/2,0);c.drawImage(S.base,0,0,S.base.width,Math.min(S.base.height,S.base.height*S.H/S.fh),0,0,S.W*k,S.H*k)}c.scale(k,k);if(!S.pdf&&(S.c.pattern==='ruled'||S.c.pattern==='grid')){const st={S:70,M:100,L:140}[S.c.sp||'M'];c.strokeStyle=lum(S.c.paper||'#fff')<.5?'rgba(255,255,255,.22)':'rgba(0,0,0,.15)';c.lineWidth=Math.max(2,1/k);c.beginPath();for(let a=st;a<S.H;a+=st){c.moveTo(0,a);c.lineTo(S.W,a)}if(S.c.pattern==='grid')for(let a=st;a<S.W;a+=st){c.moveTo(a,0);c.lineTo(a,S.H)}c.stroke()}
 const se=S.selE;S.selE=null;try{if(S.edges.length)mmDraw(c)}catch(e){}S.selE=se;
 for(const o of S.objs)try{thumbObj(c,o)}catch(e){c.restore()}
 for(const s of S.strokes)if(!s.dim)try{drawStroke(c,s)}catch(e){}
 S.meta.th=cv.toDataURL('image/jpeg',.76)}
function thumbObj(c,o){c.save();c.translate(o.x+o.w/2,o.y+o.h/2);c.rotate(o.r||0);c.globalAlpha=o.op==null?1:o.op;const w=o.w,H=o.h,x=-w/2,y=-H/2;
 if(o.k==='img'){const e=els.get(o.id),i=e&&e.firstChild;if(i&&i.complete&&i.naturalWidth){c.scale(o.fx?-1:1,o.fy?-1:1);c.drawImage(i,x,y,w,H)}c.restore();return}
 const dk=lum(S.c.paper||'#fff')<.5,rr=r=>{c.beginPath();if(c.roundRect)c.roundRect(x,y,w,H,r);else c.rect(x,y,w,H)},fs=o.fs||48,lh=fs*1.3,pad=o.k==='note'||o.k==='node'?28:0;
 if(o.k==='group'){rr(40);c.fillStyle=o.gc?hexA(o.gc,dk?.12:.09):dk?'rgba(255,255,255,.055)':'rgba(46,40,34,.05)';c.fill();c.lineWidth=3;c.strokeStyle=o.gc?hexA(o.gc,.75):dk?'rgba(255,255,255,.22)':'rgba(46,40,34,.2)';c.stroke()}
 else if(o.k==='node'){rr(32);c.fillStyle=o.c;c.fill();c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.12)';c.stroke()}
 else if(o.k==='note'){c.shadowColor='rgba(0,0,0,.22)';c.shadowBlur=14;c.shadowOffsetY=4;c.fillStyle=o.c;c.fillRect(x,y,w,H);c.shadowColor='transparent'}
 const t=o.txt||'';if(t){c.font=`${o.k==='node'?600:400} ${fs}px "Google Sans",system-ui,sans-serif`;c.textBaseline='top';
  if(o.k==='group'){const tw=Math.min(w,c.measureText(t).width+.9*fs);c.fillStyle=o.gc||(dk?'rgba(255,255,255,.1)':'rgba(46,40,34,.09)');c.fillRect(x,y-lh-7,tw,lh);c.fillStyle=o.c2||(o.gc?(lum(o.gc)>.62?'#2E2822':'#fff'):dk?'#E6DECF':'#4A4036');c.fillText(t,x+.45*fs,y-lh-7+(lh-fs)/2,tw)}
  else{c.fillStyle=o.c2||'#2E2822';if(pad){c.beginPath();c.rect(x,y,w,H);c.clip()}const mw=w-pad*2,L=[];for(const p of t.split('\n')){let ln='';for(const wd of p.split(' ')){const tr=ln?ln+' '+wd:wd;if(ln&&c.measureText(tr).width>mw){L.push(ln);ln=wd}else ln=tr}L.push(ln)}L.forEach((l,i)=>c.fillText(l,x+pad,y+pad+i*lh+(lh-fs)/2))}}
 c.restore()}
stage.addEventListener('wheel',e=>{if(!S)return;e.preventDefault();S.animId=0;const[x,y]=sp(e),t=S.tr;if(e.ctrlKey||e.metaKey){const s=Math.min(10*S.f,Math.max(zlo(),t.s*Math.exp(-e.deltaY*.01))),wx=(x-t.x)/t.s,wy=(y-t.y)/t.s;S.tr={s,x:x-wx*s,y:y-wy*s}}else{if(!straight())t.x-=e.deltaX;t.y-=e.deltaY}clampT();S.zoomed=true;S.mv=performance.now();req()},{passive:false});
$('#home').addEventListener('scroll',()=>{if(!$('#home').hidden)hsc=$('#home').scrollTop},{passive:true});
