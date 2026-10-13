'use strict';
// 10-gestures-draw.js: Cử chỉ chạm, thả đối tượng, vẽ. Dòng 1152-1217 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: up, objDrop, tap, pgUpd, draw, P, g, mt, lastTap, ring, lqIn, lqPick, lqBox, lqHit, lqDraw, lqGhost, lqMove, lqEnd, lqRev, lqUng, lqDel, lqClr, hsK, hsInit, hsUpd, hsFin, hsGhost
/* gestures */
const P=new Map();let g=null,mt=null,lastTap={t:0,x:0,y:0,id:null};
const ring=(x,y)=>{const r=$('#ring');if(S.tool==='erase'){r.style.cssText=`display:block;left:${x}px;top:${y}px;width:${T.er.w}px;height:${T.er.w}px`}else r.style.display='none'};
stage.addEventListener('pointerdown',e=>{SRC=null;if(!S||e.target.tagName==='TEXTAREA')return;if(S.popOn){S.popOn=null;pop();return}if(e.pointerType==='touch'){for(const v of P.values())if(v.pt==='pen')return}if(e.pointerType==='pen'){for(const[id,v]of[...P])if(v.pt==='touch')P.delete(id);if(g&&(g.m==='pan'||g.m==='pinch'))g=null}S.animId=0;let ended=false;if(S.edit){endEdit();ended=true}
 stage.setPointerCapture(e.pointerId);const[x,y]=sp(e),now=performance.now();P.set(e.pointerId,{x,y,x0:x,y0:y,pt:e.pointerType});if(e.pointerType==='pen')stylus=true;
 if(P.size===1)mt={t0:now,n:1,mv:0};else mt.n=Math.max(mt.n,P.size);
 if(P.size>=2){if(g&&g.m!=='pinch'){if(g.m==='stroke'){S.live=null;S.pm=[]}else{S.guides=[];S.gh=null;if(g.m==='lasso')S.lp=null;if(g.m==='lmove')lqRev(g);if(g.m==='erase'){S.strokes.forEach(s=>s.dim=0);S.inkV++}commit()}}const[a,b]=[...P.values()];g={m:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y)||1,c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},t0:{...S.tr}};$('#ring').style.display='none';req();return}
 let tool=S.tool;const[wx,wy]=W2(x,y);if(e.pointerType==='pen'&&(e.buttons&32||e.button===5))tool='erase';
 if(e.pointerType==='touch'&&stylus&&T.stylus)g={m:'pan',tr0:{...S.tr}};
 else if(tool==='pen'||tool==='hl'){const k=T[tool];S.live={t:tool==='pen'?'p':'h',c:k.c,w:k.w/S.f,p:[wx,wy]};g={m:'stroke',sx:wx,sy:wy,rx:wx,ry:wy};if(tool==='hl')hsInit(wx,wy)}
 else if(tool==='erase'){g={m:'erase'};eraseAt(wx,wy);ring(x,y)}
 else{const ob=tool==='select'||tool==='text'||tool==='note',hd=ob&&hitHandle(x,y);let o=null,ed=null;
  if(hd){const so=obj(S.sel);g=hd[0]==='c'?{m:'conn',from:so.id,side:+hd[1]}:{m:'obj',id:so.id,mode:hd,p0:[wx,wy],o0:{...so},d0:Math.hypot(wx-so.x-so.w/2,wy-so.y-so.h/2)||1}}
  else if(tool==='select'&&S.lq&&lqHit(wx,wy))g={m:'lmove',p0:[wx,wy],dx:0,dy:0}
  else if(tool==='select'&&S.mm&&T.mm.mode==='link'&&(o=hitObj(wx,wy))&&(o.k==='node'||o.k==='group')){lqClr();S.sel=o.id;S.selE=null;bar();g={m:'conn',from:o.id,al:o.k==='group'&&inR(grpLab(o),wx,wy)}}
  else if(ob&&(o=hitObj(wx,wy))&&(tool==='select'||o.k!=='img')){lqClr();S.sel=o.id;S.selE=null;bar();req();g=o.lock?{m:'pan',tr0:{...S.tr}}:{m:'obj',id:o.id,mode:'move',p0:[wx,wy],o0:{...o}}}
  else if(tool==='select'&&(ed=mmHit(wx,wy))){lqClr();S.selE=ed.id;S.sel=null;bar();req();g={m:'pan',tr0:{...S.tr}}}
  else{if(tool==='select'){S.sel=null;S.selE=null;bar()}g={m:'pan',tr0:{...S.tr},cand:tool}}}
 g.noTap=ended;g.x0=x;g.y0=y;g.t0=now;g.lx=x;g.ly=y;g.lt=now;g.vx=g.vy=0;
 if(g.m==='conn'&&g.side!=null){const gg=g,pid=e.pointerId,pt=e.pointerType;gg.ht=setTimeout(()=>{const pp=P.get(pid);if(g===gg&&pp&&P.size===1&&Math.hypot(pp.x-gg.x0,pp.y-gg.y0)<10){const ao=obj(gg.from);if(!ao)return;gg.dir=1;gg.pt=pt;gg.w0=W2(gg.x0,gg.y0);gg.gc=W2(...geo(ao).cn[gg.side]);gg.gs=.25;gg.gv=0;gg.ga=0;S.cp=W2(pp.x,pp.y);T.hap&&navigator.vibrate&&navigator.vibrate(18);req()}},300)}
 if(g.m==='pan'&&g.cand==='select'&&!ended){const gg=g,pid=e.pointerId;gg.ht=setTimeout(()=>{const pp=P.get(pid);if(g===gg&&pp&&P.size===1&&Math.hypot(pp.x-gg.x0,pp.y-gg.y0)<10){S.tr={...gg.tr0};gg.m='lasso';S.lp=W2(gg.x0,gg.y0);hap();req()}},350)}
 req()});
stage.addEventListener('pointermove',e=>{if(!S)return;const[x,y]=sp(e),p=P.get(e.pointerId);if(S.tool==='erase'&&(p||e.pointerType==='pen'||e.pointerType==='mouse'))ring(x,y);if(!p)return;
 mt&&(mt.mv=Math.max(mt.mv,Math.hypot(x-p.x0,y-p.y0)));p.x=x;p.y=y;if(!g)return;if(g.m==='pinch'||g.m==='pan')S.mv=performance.now();
 if(g.m==='pinch'){if(P.size<2)return;const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1,cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,t0=g.t0,s=rub(t0.s*d/g.d0),wx=(g.c0.x-t0.x)/t0.s,wy=(g.c0.y-t0.y)/t0.s;S.tr={s,x:cx-wx*s,y:cy-wy*s};clampT();S.zoomed=true}
 else if(g.m==='stroke'){const kk=1-.85*(T.stab||0);for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);g.rx=wx;g.ry=wy;g.sx+=(wx-g.sx)*kk;g.sy+=(wy-g.sy)*kk;addPt(g.sx,g.sy)}if(g.h)hsUpd();S.pm=[];if(!(T.stab>.15)&&e.getPredictedEvents)for(const ev of e.getPredictedEvents().slice(0,3)){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);S.pm.push(wx,wy)}}
 else if(g.m==='erase'){for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[sx,sy]=sp(ev),[wx,wy]=W2(sx,sy);eraseAt(wx,wy)}}
 else if(g.m==='pan'){let nx=g.tr0.x+x-g.x0;if(straight()){const cx=(stage.clientWidth-S.W*S.tr.s)/2;nx=cx+elastic(nx-cx)}S.tr.x=nx;S.tr.y=g.tr0.y+y-g.y0;clampT();const dt=Math.max(1,e.timeStamp-g.lt);g.vx=.7*g.vx+.3*(x-g.lx)/dt;g.vy=.7*g.vy+.3*(y-g.ly)/dt;g.lx=x;g.ly=y;g.lt=e.timeStamp}
 else if(g.m==='conn'){S.cp=W2(x,y);if(g.dir){const ao=obj(g.from),T0=ao&&mmGhost(ao,S.cp[0],S.cp[1],g.pt,g),k=T0?T0.sn:-1;if(k===1&&g.k!==1)hap();g.k=k}}
 else if(g.m==='obj'){const[wx,wy]=W2(x,y);objMove(x,y,wx,wy)}
 else if(g.m==='lasso'){const[wx,wy]=W2(x,y),p=S.lp,n=p.length;if(Math.hypot(wx-p[n-2],wy-p[n-1])*S.tr.s>3)p.push(wx,wy)}
 else if(g.m==='lmove')lqMove(x,y);
 req()});
function up(e){if(!S||!P.has(e.pointerId))return;const p=P.get(e.pointerId);P.delete(e.pointerId);const now=performance.now();
 if(g&&g.m==='pinch'){if(P.size>=2){const[a,b]=[...P.values()];g={m:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y)||1,c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},t0:{...S.tr}}}if(!P.size){if(mt.n>=2&&now-mt.t0<350&&mt.mv<14)mt.n>=3?redo():undo();else if(!settle())magnet();g=null;mt=null}return}
 if(!g)return;const mv=Math.hypot(p.x-g.x0,p.y-g.y0),quick=now-g.t0<350;
 if(g.m==='stroke'&&S.live){if(T.stab>0)addPt(g.rx,g.ry);if(g.h){hsUpd();hsFin(S.live)}touch();const st=S.live;S.strokes.push(st);S.live=null;S.pm=[];icAdd(st);commit()}
 else if(g.m==='erase'){if(T.er.mode==='stroke'){const del=S.strokes.filter(s=>s.dim);if(del.length){touch();S.strokes=S.strokes.filter(s=>!s.dim)}}commit();S.inkV++}
 else if(g.m==='conn'){mmEnd(g,p)}
 else if(g.m==='lasso')lqPick();else if(g.m==='lmove')lqEnd(g);
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
 if(tool==='select'){lqClr();if(S.mm&&T.mm.mode==='node'){const n=mkNode(wx-210,wy-56);touch();S.objs.push(n);renderObjs();startEdit(n);return}if(now-lastTap.t<350&&Math.hypot(x-lastTap.x,y-lastTap.y)<30){fit(true,true);lastTap.t=0}else lastTap={t:now,x,y,id:null};return}
 const o=hitObj(wx,wy);if(o&&o.k!=='img')return;
 const ink=lum(S.c.paper||'#fff')<.5?'#F1E9DB':'#2E2822';
 if(tool==='text'){const nt=S.note,fs=Math.round(T.tfs*(nt?1.5:1)),n={id:uid(),k:'text',x:nt?S.W*.07:wx,y:wy-fs*.625,w:nt?S.W*.86:700,h:fs*1.45,r:0,fs,txt:'',c2:ink,nw:1};if(T.sn&&GSP()){n.sn=1;n.y=wy-lnLH(n)/2;lnSnap(n)}touch();S.objs.push(n);renderObjs();startEdit(n)}
 else if(tool==='note'){const n={id:uid(),k:'note',x:wx-250,y:wy-250,w:500,h:500,r:0,fs:40,txt:'',c:'#F8E08E',c2:'#2E2822',nw:1};touch();S.objs.push(n);renderObjs();startEdit(n)}}
/* draw */
function pgUpd(){if(!S.pdf)return;const t=S.tr,cy=(stage.clientHeight/2-t.y)/t.s;const n=pgAt(cy),mv=performance.now()-(S.mv||0)<160;if(S.pgn!==n||mv){if(S.pgn!==n){S.pgn=n;pgi.textContent=(n+1)+' / '+S.sheets.length}pgi.classList.add('on');clearTimeout(S.pgt);S.pgt=setTimeout(()=>pgi.classList.remove('on'),1300)}}
function draw(){S.raf=0;S.fr++;pgUpd();const d=DPR(stage.clientWidth,stage.clientHeight),{s,x,y}=S.tr,vx=-x/s,vy=-y/s,vw=stage.clientWidth/s,vh=stage.clientHeight/s;world.style.transform=`translate(${x}px,${y}px) scale(${s})`;
 x0.setTransform(1,0,0,1,0,0);x0.clearRect(0,0,c0.width,c0.height);x0.setTransform(d*s,0,0,d*s,d*x,d*y);
 if(!S.pdf){const pc=S.c.paper||'#fff';x0.fillStyle=pc;x0.fillRect(0,0,S.W,S.H);if(S.base)x0.drawImage(S.base,0,0,S.base.width,Math.min(S.base.height,S.base.height*S.H/S.fh),0,0,S.W,S.H);const pt=S.c.pattern;if(pt==='ruled'||pt==='grid'){x0.strokeStyle=lum(pc)<.5?'rgba(255,255,255,.14)':'rgba(0,0,0,.12)';x0.lineWidth=Math.max(2,1.2/s);const st={S:70,M:100,L:140}[S.c.sp||'M'];x0.beginPath();for(let a=st;a<S.H;a+=st){x0.moveTo(0,a);x0.lineTo(S.W,a)}if(pt==='grid')for(let a=st;a<S.W;a+=st){x0.moveTo(a,0);x0.lineTo(a,S.H)}x0.stroke()}x0.strokeStyle='#0003';x0.lineWidth=Math.max(1.5,1.5/s);x0.strokeRect(0,0,S.W,S.H)}
 else{const[a,b]=shR(vy,vy+vh);for(let i=a;i<=b;i++){const sh=S.sheets[i],im=sh.cv||sh.th;x0.fillStyle='#fff';x0.fillRect(0,sh.y,SW,sh.h);if(im)x0.drawImage(im,0,sh.y,SW,sh.h)}pump(a,b)}
 if(S.edges.length){mmDraw(x0);if(S.eba){S.eba=false;req()}}
 x1.setTransform(1,0,0,1,0,0);x1.clearRect(0,0,c1.width,c1.height);
 const big=S.strokes.length>150&&!(g&&(g.m==='erase'||g.m==='lmove')),mvg=performance.now()-(S.mv||0)<120;let used=false;
 if(big){let ic=S.ic;const ok=ic&&ic.v===S.inkV&&ic.w===c1.width&&ic.h===c1.height,fits=ok&&Math.abs(s/ic.s-1)<1e-4&&Math.abs(d*(x-ic.x))<=ic.mx&&Math.abs(d*(y-ic.y))<=ic.my;
  if(!(fits||(ok&&mvg))){icBuild(c1.width,c1.height,d);ic=S.ic}const kk=s/ic.s;x1.setTransform(kk,0,0,kk,d*(x-kk*ic.x)-kk*ic.mx,d*(y-kk*ic.y)-kk*ic.my);x1.drawImage(ic.cv,0,0);used=true;if(mvg){clearTimeout(S.mt);S.mt=setTimeout(req,140)}}
 x1.setTransform(d*s,0,0,d*s,d*x,d*y);
 if(!used)for(const st of S.strokes){const b=bb(st);if(b[2]<vx||b[0]>vx+vw||b[3]<vy||b[1]>vy+vh)continue;drawStroke(x1,st)}if(S.live)drawStroke(x1,S.pm&&S.pm.length?{...S.live,p:S.live.p.concat(S.pm)}:S.live);lqGhost();hsGhost();
 if(S.guides.length){x1.strokeStyle=S.pr;x1.lineWidth=1.5/s;x1.beginPath();if(S.guides[0]!=null){x1.moveTo(S.guides[0],vy);x1.lineTo(S.guides[0],vy+vh)}if(S.guides[1]!=null){x1.moveTo(vx,S.guides[1]);x1.lineTo(vx+vw,S.guides[1])}x1.stroke()}
 x1.setTransform(d,0,0,d,0,0);const o=obj(S.sel);if(o&&!S.edit){const G=geo(o);x1.strokeStyle=S.pr;x1.fillStyle='#fff';x1.lineWidth=2;x1.setLineDash(o.lock?[6,5]:[]);x1.beginPath();G.q.forEach((p,i)=>i?x1.lineTo(p[0],p[1]):x1.moveTo(p[0],p[1]));x1.closePath();x1.stroke();x1.setLineDash([]);
  if(!o.lock){const dot=p=>{x1.beginPath();x1.arc(p[0],p[1],9,0,7);x1.fill();x1.stroke()};if(o.k!=='node'&&o.k!=='group'){x1.beginPath();x1.moveTo(G.t[0],G.t[1]);x1.lineTo(G.rot[0],G.rot[1]);x1.stroke();dot(G.rot)}if(o.k==='text')dot(G.e);else dot(G.se);if(o.k==='node'&&!(g&&g.m==='conn'&&g.dir))mmPlus(G.cn[mmSide(o)])}}lqDraw();mmOver();ghDraw();if(S.gh)req()}
/* Lasso: giữ lâu trên chỗ trống (Con trỏ) rồi vẽ vòng; chọn nét vẽ/bút nhấn + chữ/ghi chú/ảnh/nút/nhóm. S.lq={s:[nét],o:[id đối tượng]}, S.lp=điểm vòng (thế giới). Chỉ có nút Xóa; kéo trong vùng chọn để di chuyển */
const lqIn=(q,x,y)=>{let r=false;for(let i=0,j=q.length-2;i<q.length;j=i,i+=2)if((q[i+1]>y)!==(q[j+1]>y)&&x<(q[j]-q[i])*(y-q[i+1])/(q[j+1]-q[i+1])+q[i])r=!r;return r};
const lqClr=()=>{if(S.lq){S.lq=null;bar();req()}};
function lqPick(){const p=S.lp;S.lp=null;if(!p||p.length<6)return;let L=0;for(let i=2;i<p.length;i+=2)L+=Math.hypot(p[i]-p[i-2],p[i+1]-p[i-1]);if(L*S.tr.s<40)return;
 const k=Math.max(1,Math.ceil(p.length/2/120)),q=[];for(let i=0;i<p.length;i+=2*k)q.push(p[i],p[i+1]);let a=1e9,b=1e9,c=-1e9,d=-1e9;for(let i=0;i<q.length;i+=2){a=Math.min(a,q[i]);c=Math.max(c,q[i]);b=Math.min(b,q[i+1]);d=Math.max(d,q[i+1])}
 const rs=[],ro=new Set();for(const s of S.strokes){if(s.dim)continue;const f=bb(s);if(f[2]<a||f[0]>c||f[3]<b||f[1]>d)continue;const m=s.p,st=2*Math.max(1,Math.ceil(m.length/2/60));let n=0,t=0;for(let i=0;i<m.length;i+=st){t++;if(lqIn(q,m[i],m[i+1]))n++}if(n*2>=t)rs.push(s)}
 for(const o of S.objs){if(o.lock)continue;const[x,y]=ctr(o);if(!lqIn(q,x,y))continue;ro.add(o.id);if(o.k==='group')for(const kd of grpKids(o)){const z=obj(kd.id);if(z&&!z.lock)ro.add(z.id)}}
 if(!rs.length&&!ro.size)return;S.lq={s:rs,o:[...ro]};S.sel=null;S.selE=null;bar();req()}
/* khung bao của vùng chọn (thế giới); ox,oy chỉ dời phần nét vẽ khi đang kéo */
function lqBox(ox,oy){const q=S.lq;let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const s of q.s){const f=bb(s);a=Math.min(a,f[0]+ox);c=Math.max(c,f[2]+ox);b=Math.min(b,f[1]+oy);d=Math.max(d,f[3]+oy)}
 for(const id of q.o){const o=obj(id);if(!o)continue;const r=o.r||0,co=Math.cos(r),si=Math.sin(r),[cx,cy]=ctr(o);for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const dx=u*o.w/2,dy=v*o.h/2,px=cx+dx*co-dy*si,py=cy+dx*si+dy*co;a=Math.min(a,px);c=Math.max(c,px);b=Math.min(b,py);d=Math.max(d,py)}}return c>a?[a,b,c,d]:null}
const lqHit=(x,y)=>{const f=lqBox(0,0),m=24/S.tr.s;return!!f&&x>=f[0]-m&&x<=f[2]+m&&y>=f[1]-m&&y<=f[3]+m};
/* vẽ vòng đang kéo và khung vùng chọn trên c1 (hệ tọa độ màn hình) */
function lqDraw(){const t=S.tr;if(!S.lp&&!S.lq)return;x1.save();x1.strokeStyle=S.pr;x1.lineWidth=2;x1.lineJoin='round';x1.setLineDash([8,6]);
 if(S.lp&&S.lp.length>=4){x1.beginPath();for(let i=0;i<S.lp.length;i+=2){const X=t.x+S.lp[i]*t.s,Y=t.y+S.lp[i+1]*t.s;i?x1.lineTo(X,Y):x1.moveTo(X,Y)}x1.stroke()}
 if(S.lq){const dm=g&&g.m==='lmove'&&g.dirty,f=lqBox(dm?g.dx:0,dm?g.dy:0);if(f){const e=8;rrect(x1,t.x+f[0]*t.s-e,t.y+f[1]*t.s-e,(f[2]-f[0])*t.s+2*e,(f[3]-f[1])*t.s+2*e,10);x1.stroke()}}x1.restore()}
/* bản dời của các nét đang kéo (nét gốc mờ đi nhờ dim) */
function lqGhost(){if(!g||g.m!=='lmove'||!g.dirty||!S.lq)return;x1.save();x1.translate(g.dx,g.dy);for(const s of S.lq.s)drawStroke(x1,{...s,dim:0});x1.restore()}
function lqMove(x,y){const[wx,wy]=W2(x,y);if(!g.dirty){if(Math.hypot(x-g.x0,y-g.y0)<4)return;touch();g.dirty=1;g.o0=S.lq.o.map(id=>{const o=obj(id);return o&&[id,o.x,o.y]}).filter(Boolean);S.lq.s.forEach(s=>s.dim=1);g.lg=g.o0.map(([id])=>{const e=els.get(id);if(!e)return null;const c=e.cloneNode(true);c.classList.remove('born');c.style.opacity=(+e.style.opacity||1)*.4;c.style.pointerEvents='none';world.insertBefore(c,e);return c}).filter(Boolean)}
 const dx=wx-g.p0[0],dy=wy-g.p0[1];g.dx=dx;g.dy=dy;for(const[id,ox,oy]of g.o0){const o=obj(id);o.x=ox+dx;o.y=oy+dy;renderObjs(o)}}
/* thả: nét đổi sang bản mới (không sửa tại chỗ), đối tượng đã dời trực tiếp */
/* bỏ bản mờ vị trí cũ của đối tượng */
function lqUng(gg){(gg.lg||[]).forEach(c=>c.remove());gg.lg=null}
function lqEnd(gg){lqUng(gg);if(!gg.dirty){S.lq=null;bar();return}const set=new Set(S.lq.s),ns=[],dx=gg.dx,dy=gg.dy;S.strokes=S.strokes.map(s=>{if(!set.has(s))return s;s.dim=0;const n={...s,p:s.p.map((v,i)=>v+(i%2?dy:dx)),dim:0};delete n.b;ns.push(n);return n});S.lq.s=ns;S.inkV++;commit()}
function lqRev(gg){lqUng(gg);if(!gg.dirty)return;for(const[id,ox,oy]of gg.o0){const o=obj(id);if(o){o.x=ox;o.y=oy;renderObjs(o)}}S.lq.s.forEach(s=>s.dim=0);S.pre=null;S.inkV++}
function lqDel(){const q=S.lq;if(!q)return;touch();const ss=new Set(q.s),oo=new Set(q.o);S.strokes=S.strokes.filter(s=>!ss.has(s));S.objs=S.objs.filter(o=>!oo.has(o.id));S.edges=S.edges.filter(e=>!oo.has(e.a)&&!oo.has(e.b));S.lq=null;S.inkV++;commit();renderObjs();bar();req()}
/* Bút nhấn: nét gần thẳng ngang/dọc thì hít nhẹ và hiện bản thẳng mờ; thả tay thì thành đường thẳng. Lệch ra khỏi hành lang thì tự bỏ; hoàn tác ngay nét đã hít = từ chối: thu hẹp ngưỡng, bỏ hít nét kế, 3 lần thì tắt trong phiên (S.hr, S.hk, S.hsn chỉ trong phiên, không lưu) */
const hsK=()=>Math.max(0,1-.35*(S.hr||0));
function hsInit(x,y){if(S.hsn){S.hr=Math.max(0,(S.hr||0)-.5);S.hsn=null}if(S.hk){S.hk=0;return}if(hsK()<=0)return;g.h={x,y,dx:0,dy:0,i:0,o:null}}
function hsUpd(){const h=g.h,p=S.live.p,s=S.tr.s,k=hsK(),n=p.length;for(let i=h.i;i<n;i+=2){h.dx=Math.max(h.dx,Math.abs(p[i]-h.x));h.dy=Math.max(h.dy,Math.abs(p[i+1]-h.y))}h.i=n;
 const rx=Math.abs(p[n-2]-h.x)*s,ry=Math.abs(p[n-1]-h.y)*s;let o=null;if(rx>=48&&rx>=ry&&h.dy*s<=(5+.03*rx)*k)o='h';else if(ry>=48&&ry>rx&&h.dx*s<=(5+.03*ry)*k)o='v';if(o&&!h.o)hap();h.o=o;h.ex=o==='h'?p[n-2]:h.x;h.ey=o==='v'?p[n-1]:h.y}
function hsFin(st){const h=g.h;if(!h||!h.o)return;const d=Math.hypot(h.ex-h.x,h.ey-h.y),k=Math.max(1,Math.ceil(d/(6/S.tr.s))),p=[h.x,h.y];for(let i=1;i<=k;i++)p.push(h.x+(h.ex-h.x)*i/k,h.y+(h.ey-h.y)*i/k);st.p=p;S.hsn={st,t:performance.now()}}
function hsGhost(){const h=g&&g.m==='stroke'&&g.h;if(!h||!h.o||!S.live)return;x1.save();x1.globalAlpha=.22;x1.globalCompositeOperation='multiply';x1.strokeStyle=S.live.c;x1.lineWidth=S.live.w;x1.lineCap='butt';x1.beginPath();x1.moveTo(h.x,h.y);x1.lineTo(h.ex,h.ey);x1.stroke();x1.restore()}
