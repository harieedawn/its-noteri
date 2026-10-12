'use strict';
// 10-gestures-draw.js: Cử chỉ chạm, thả đối tượng, vẽ. Dòng 1152-1217 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: up, objDrop, tap, pgUpd, draw, P, g, mt, lastTap, ring
/* gestures */
const P=new Map();let g=null,mt=null,lastTap={t:0,x:0,y:0,id:null};
const ring=(x,y)=>{const r=$('#ring');if(S.tool==='erase'){r.style.cssText=`display:block;left:${x}px;top:${y}px;width:${T.er.w}px;height:${T.er.w}px`}else r.style.display='none'};
stage.addEventListener('pointerdown',e=>{if(!S||e.target.tagName==='TEXTAREA')return;if(S.popOn){S.popOn=null;pop();return}if(e.pointerType==='touch'){for(const v of P.values())if(v.pt==='pen')return}if(e.pointerType==='pen'){for(const[id,v]of[...P])if(v.pt==='touch')P.delete(id);if(g&&(g.m==='pan'||g.m==='pinch'))g=null}S.animId=0;let ended=false;if(S.edit){endEdit();ended=true}
 stage.setPointerCapture(e.pointerId);const[x,y]=sp(e),now=performance.now();P.set(e.pointerId,{x,y,x0:x,y0:y,pt:e.pointerType});if(e.pointerType==='pen')stylus=true;
 if(P.size===1)mt={t0:now,n:1,mv:0};else mt.n=Math.max(mt.n,P.size);
 if(P.size>=2){if(g&&g.m!=='pinch'){if(g.m==='stroke'){S.live=null;S.pm=[]}else{S.guides=[];S.gh=null;if(g.m==='erase'){S.strokes.forEach(s=>s.dim=0);S.inkV++}commit()}}const[a,b]=[...P.values()];g={m:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y)||1,c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},t0:{...S.tr}};$('#ring').style.display='none';req();return}
 let tool=S.tool;const[wx,wy]=W2(x,y);if(e.pointerType==='pen'&&(e.buttons&32||e.button===5))tool='erase';
 if(e.pointerType==='touch'&&stylus&&T.stylus)g={m:'pan',tr0:{...S.tr}};
 else if(tool==='pen'||tool==='hl'){const k=T[tool];S.live={t:tool==='pen'?'p':'h',c:k.c,w:k.w/S.f,p:[wx,wy]};g={m:'stroke',sx:wx,sy:wy,rx:wx,ry:wy}}
 else if(tool==='erase'){g={m:'erase'};eraseAt(wx,wy);ring(x,y)}
 else{const ob=tool==='select'||tool==='text'||tool==='note',hd=ob&&hitHandle(x,y);let o=null,ed=null;
  if(hd){const so=obj(S.sel);g=hd[0]==='c'?{m:'conn',from:so.id,side:+hd[1]}:{m:'obj',id:so.id,mode:hd,p0:[wx,wy],o0:{...so},d0:Math.hypot(wx-so.x-so.w/2,wy-so.y-so.h/2)||1}}
  else if(tool==='select'&&S.mm&&T.mm.mode==='link'&&(o=hitObj(wx,wy))&&(o.k==='node'||o.k==='group')){S.sel=o.id;S.selE=null;bar();g={m:'conn',from:o.id,al:o.k==='group'&&inR(grpLab(o),wx,wy)}}
  else if(ob&&(o=hitObj(wx,wy))&&(tool==='select'||o.k!=='img')){S.sel=o.id;S.selE=null;bar();req();g=o.lock?{m:'pan',tr0:{...S.tr}}:{m:'obj',id:o.id,mode:'move',p0:[wx,wy],o0:{...o}}}
  else if(tool==='select'&&(ed=mmHit(wx,wy))){S.selE=ed.id;S.sel=null;bar();req();g={m:'pan',tr0:{...S.tr}}}
  else{if(tool==='select'){S.sel=null;S.selE=null;bar()}g={m:'pan',tr0:{...S.tr},cand:tool}}}
 g.noTap=ended;g.x0=x;g.y0=y;g.t0=now;g.lx=x;g.ly=y;g.lt=now;g.vx=g.vy=0;
 if(g.m==='conn'&&g.side!=null){const gg=g,pid=e.pointerId,pt=e.pointerType;gg.ht=setTimeout(()=>{const pp=P.get(pid);if(g===gg&&pp&&P.size===1&&Math.hypot(pp.x-gg.x0,pp.y-gg.y0)<10){const ao=obj(gg.from);if(!ao)return;gg.dir=1;gg.pt=pt;gg.w0=W2(gg.x0,gg.y0);gg.gc=W2(...geo(ao).cn[gg.side]);gg.gs=.25;gg.gv=0;gg.ga=0;S.cp=W2(pp.x,pp.y);T.hap&&navigator.vibrate&&navigator.vibrate(18);req()}},300)}
 req()});
stage.addEventListener('pointermove',e=>{if(!S)return;const[x,y]=sp(e),p=P.get(e.pointerId);if(S.tool==='erase'&&(p||e.pointerType==='pen'||e.pointerType==='mouse'))ring(x,y);if(!p)return;
 mt&&(mt.mv=Math.max(mt.mv,Math.hypot(x-p.x0,y-p.y0)));p.x=x;p.y=y;if(!g)return;if(g.m==='pinch'||g.m==='pan')S.mv=performance.now();
 if(g.m==='pinch'){if(P.size<2)return;const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1,cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,t0=g.t0,s=rub(t0.s*d/g.d0),wx=(g.c0.x-t0.x)/t0.s,wy=(g.c0.y-t0.y)/t0.s;S.tr={s,x:cx-wx*s,y:cy-wy*s};clampT();S.zoomed=true}
 else if(g.m==='stroke'){const kk=1-.85*(T.stab||0);for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);g.rx=wx;g.ry=wy;g.sx+=(wx-g.sx)*kk;g.sy+=(wy-g.sy)*kk;addPt(g.sx,g.sy)}S.pm=[];if(!(T.stab>.15)&&e.getPredictedEvents)for(const ev of e.getPredictedEvents().slice(0,3)){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);S.pm.push(wx,wy)}}
 else if(g.m==='erase'){for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);eraseAt(wx,wy)}}
 else if(g.m==='pan'){let nx=g.tr0.x+x-g.x0;if(straight()){const cx=(stage.clientWidth-S.W*S.tr.s)/2;nx=cx+elastic(nx-cx)}S.tr.x=nx;S.tr.y=g.tr0.y+y-g.y0;clampT();const dt=Math.max(1,e.timeStamp-g.lt);g.vx=.7*g.vx+.3*(x-g.lx)/dt;g.vy=.7*g.vy+.3*(y-g.ly)/dt;g.lx=x;g.ly=y;g.lt=e.timeStamp}
 else if(g.m==='conn'){S.cp=W2(x,y);if(g.dir){const ao=obj(g.from),T0=ao&&mmGhost(ao,S.cp[0],S.cp[1],g.pt,g),k=T0?T0.sn:-1;if(k===1&&g.k!==1)hap();g.k=k}}
 else if(g.m==='obj'){const[wx,wy]=W2(x,y);objMove(x,y,wx,wy)}
 req()});
function up(e){if(!S||!P.has(e.pointerId))return;const p=P.get(e.pointerId);P.delete(e.pointerId);const now=performance.now();
 if(g&&g.m==='pinch'){if(P.size>=2){const[a,b]=[...P.values()];g={m:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y)||1,c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},t0:{...S.tr}}}if(!P.size){if(mt.n>=2&&now-mt.t0<350&&mt.mv<14)mt.n>=3?redo():undo();else if(!settle())magnet();g=null;mt=null}return}
 if(!g)return;const mv=Math.hypot(p.x-g.x0,p.y-g.y0),quick=now-g.t0<350;
 if(g.m==='stroke'&&S.live){if(T.stab>0)addPt(g.rx,g.ry);touch();const st=S.live;S.strokes.push(st);S.live=null;S.pm=[];icAdd(st);commit()}
 else if(g.m==='erase'){if(T.er.mode==='stroke'){const del=S.strokes.filter(s=>s.dim);if(del.length){touch();S.strokes=S.strokes.filter(s=>!s.dim)}}commit();S.inkV++}
 else if(g.m==='conn'){mmEnd(g,p)}
 else if(g.m==='obj'){S.guides=[];if(g.dirty)objDrop();else{S.gh=null;if(!g.noTap&&mv<8){const o=obj(g.id);if(o&&lastTap.id===o.id&&now-lastTap.t<400&&o.k!=='img'&&(o.k!=='group'||W2(p.x,p.y)[1]<o.y+8)){startEdit(o);lastTap.t=0}else lastTap={t:now,x:p.x,y:p.y,id:o&&o.id}}}}
 else if(g.m==='pan'&&!g.noTap&&g.cand&&mv<8&&quick)tap(p.x,p.y,g.cand);else if(g.m==='pan'&&mv>=8)endMove(g);
 g=null;$('#ring').style.display='none';renderObjs();req()}
/* Thả đối tượng sau khi kéo: nút thả vào nút khác (đang có gợi ý) -> tạo nhóm và đặt tên; ngược lại chỉ mở rộng nhóm nếu thả vào trong nhóm */
function objDrop(){const o=obj(g.id),gid=S.gh&&!S.gh.out?S.gh.id:null;S.gh=null;
 if(o&&g.mode==='move'&&o.k!=='group'){const t=gid&&obj(gid);if(o.k==='node'&&t&&t.k==='node'&&t!==o){const gr=mkGroup(o,t,g.o0);renderObjs();startEdit(gr);return}grpGrow(o)}
 if(o&&o.k==='group'&&g.mode==='se')gfix();
 commit()}
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',e=>{if(g&&g.m==='stroke')S.live=null;up(e)});
function tap(x,y,tool){const[wx,wy]=W2(x,y),now=performance.now();
 if(tool==='select'){if(S.mm&&T.mm.mode==='node'){const n=mkNode(wx-210,wy-56);touch();S.objs.push(n);renderObjs();startEdit(n);return}if(now-lastTap.t<350&&Math.hypot(x-lastTap.x,y-lastTap.y)<30){fit(true,true);lastTap.t=0}else lastTap={t:now,x,y,id:null};return}
 const o=hitObj(wx,wy);if(o&&o.k!=='img')return;
 const ink=lum(S.c.paper||'#fff')<.5?'#F1E9DB':'#2E2822';
 if(tool==='text'){const nt=S.note,fs=Math.round(T.tfs*(nt?1.5:1)),n={id:uid(),k:'text',x:nt?S.W*.07:wx,y:wy-fs*.625,w:nt?S.W*.86:700,h:fs*1.45,r:0,fs,txt:'',c2:ink,nw:1};if(T.sn&&GSP()){n.sn=1;n.y=wy-lnLH(n)/2;lnSnap(n)}touch();S.objs.push(n);renderObjs();startEdit(n)}
 else if(tool==='note'){const n={id:uid(),k:'note',x:wx-250,y:wy-250,w:500,h:500,r:0,fs:40,txt:'',c:'#F8E08E',c2:'#2E2822',nw:1};touch();S.objs.push(n);renderObjs();startEdit(n)}}
/* draw */
function pgUpd(){if(!S.pdf)return;const t=S.tr,cy=(stage.clientHeight/2-t.y)/t.s;const n=pgAt(cy),mv=performance.now()-(S.mv||0)<160;if(S.pgn!==n||mv){if(S.pgn!==n){S.pgn=n;pgi.textContent=(n+1)+' / '+S.sheets.length}pgi.classList.add('on');clearTimeout(S.pgt);S.pgt=setTimeout(()=>pgi.classList.remove('on'),1300)}}
function draw(){S.raf=0;S.fr++;pgUpd();const d=devicePixelRatio||1,{s,x,y}=S.tr,vx=-x/s,vy=-y/s,vw=stage.clientWidth/s,vh=stage.clientHeight/s;world.style.transform=`translate(${x}px,${y}px) scale(${s})`;
 x0.setTransform(1,0,0,1,0,0);x0.clearRect(0,0,c0.width,c0.height);x0.setTransform(d*s,0,0,d*s,d*x,d*y);
 if(!S.pdf){const pc=S.c.paper||'#fff';x0.fillStyle=pc;x0.fillRect(0,0,S.W,S.H);if(S.base)x0.drawImage(S.base,0,0,S.base.width,Math.min(S.base.height,S.base.height*S.H/S.fh),0,0,S.W,S.H);const pt=S.c.pattern;if(pt==='ruled'||pt==='grid'){x0.strokeStyle=lum(pc)<.5?'rgba(255,255,255,.14)':'rgba(0,0,0,.12)';x0.lineWidth=Math.max(2,1.2/s);const st={S:70,M:100,L:140}[S.c.sp||'M'];x0.beginPath();for(let a=st;a<S.H;a+=st){x0.moveTo(0,a);x0.lineTo(S.W,a)}if(pt==='grid')for(let a=st;a<S.W;a+=st){x0.moveTo(a,0);x0.lineTo(a,S.H)}x0.stroke()}x0.strokeStyle='#0003';x0.lineWidth=Math.max(1.5,1.5/s);x0.strokeRect(0,0,S.W,S.H)}
 else{const[a,b]=shR(vy,vy+vh);for(let i=a;i<=b;i++){const sh=S.sheets[i],im=sh.cv||sh.th;x0.fillStyle='#fff';x0.fillRect(0,sh.y,SW,sh.h);if(im)x0.drawImage(im,0,sh.y,SW,sh.h)}pump(a,b)}
 if(S.edges.length){mmDraw(x0);if(S.eba){S.eba=false;req()}}
 x1.setTransform(1,0,0,1,0,0);x1.clearRect(0,0,c1.width,c1.height);
 const big=S.strokes.length>150&&!(g&&g.m==='erase'),mvg=performance.now()-(S.mv||0)<120;let used=false;
 if(big){let ic=S.ic;const ok=ic&&ic.v===S.inkV&&ic.w===c1.width&&ic.h===c1.height,fits=ok&&Math.abs(s/ic.s-1)<1e-4&&Math.abs(d*(x-ic.x))<=ic.mx&&Math.abs(d*(y-ic.y))<=ic.my;
  if(!(fits||(ok&&mvg))){icBuild(c1.width,c1.height,d);ic=S.ic}const kk=s/ic.s;x1.setTransform(kk,0,0,kk,d*(x-kk*ic.x)-kk*ic.mx,d*(y-kk*ic.y)-kk*ic.my);x1.drawImage(ic.cv,0,0);used=true;if(mvg){clearTimeout(S.mt);S.mt=setTimeout(req,140)}}
 x1.setTransform(d*s,0,0,d*s,d*x,d*y);
 if(!used)for(const st of S.strokes){const b=bb(st);if(b[2]<vx||b[0]>vx+vw||b[3]<vy||b[1]>vy+vh)continue;drawStroke(x1,st)}if(S.live)drawStroke(x1,S.pm&&S.pm.length?{...S.live,p:S.live.p.concat(S.pm)}:S.live);
 if(S.guides.length){x1.strokeStyle=S.pr;x1.lineWidth=1.5/s;x1.beginPath();if(S.guides[0]!=null){x1.moveTo(S.guides[0],vy);x1.lineTo(S.guides[0],vy+vh)}if(S.guides[1]!=null){x1.moveTo(vx,S.guides[1]);x1.lineTo(vx+vw,S.guides[1])}x1.stroke()}
 x1.setTransform(d,0,0,d,0,0);const o=obj(S.sel);if(o&&!S.edit){const G=geo(o);x1.strokeStyle=S.pr;x1.fillStyle='#fff';x1.lineWidth=2;x1.setLineDash(o.lock?[6,5]:[]);x1.beginPath();G.q.forEach((p,i)=>i?x1.lineTo(p[0],p[1]):x1.moveTo(p[0],p[1]));x1.closePath();x1.stroke();x1.setLineDash([]);
  if(!o.lock){const dot=p=>{x1.beginPath();x1.arc(p[0],p[1],9,0,7);x1.fill();x1.stroke()};if(o.k!=='node'&&o.k!=='group'){x1.beginPath();x1.moveTo(G.t[0],G.t[1]);x1.lineTo(G.rot[0],G.rot[1]);x1.stroke();dot(G.rot)}if(o.k==='text')dot(G.e);else dot(G.se);if(o.k==='node'&&!(g&&g.m==='conn'&&g.dir))mmPlus(G.cn[mmSide(o)])}}mmOver();ghDraw();if(S.gh)req()}
