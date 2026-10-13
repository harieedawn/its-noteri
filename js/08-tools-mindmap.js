'use strict';
// 08-tools-mindmap.js: Thanh công cụ, sơ đồ tư duy, mũi tên, hít chữ. Dòng 986-1076 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: mmPath, mmSample, mmHit, ebp, mmDraw, mmOne, mmPlus, mmOver, mmSpawn, mmSide, mmGhost, addChild, addSib, mmEnd, mmLayout, mmEdgeBar, mmPop, tools, pop,
//   GC, MC, ink2, mkNode, mkEdge, EW0, ew, MN, EB, mmDirSide, LP, LPF, TL, TLA, dots, rec
/* tools UI */
/* ===== Sơ đồ tư duy: node = obj kind 'node' trong S.objs; mũi tên = S.edges [{id,a,b,st,ar,c}] ===== */
const GC=[null,'#FF4D55','#EE9A3A','#E0D95C','#3DCB6B','#4FD6D6','#4F9DFF','#A87BFF','#FF7EB6'],MC=['#F8E08E','#F5BE7E','#E8766D','#F2B8CE','#D8CBF0','#BFD8F2','#A8DDDA','#C4E3BF','#E4DFD4'];
const ink2=c=>lum(c)>.55?'#2E2822':'#FFF8EE',mkNode=(x,y,c)=>(c=c||T.mm.cc||MC[T.mm.c],{id:uid(),k:'node',x,y,w:420,h:112,r:0,fs:44,txt:'',c,c2:ink2(c),nw:1}),mkEdge=(a,b)=>({id:uid(),a,b,st:T.mm.st,ar:T.mm.ar,w:T.mm.w||EW0}),EW0=6,ew=e=>e.w||EW0;
const MN=[[0,-1],[1,0],[0,1],[-1,0]];
function mmPath(e,A,B){const a=A||obj(e.a),b=B||obj(e.b);if(!a||!b)return null;const la=!!(e.al&&a.k==='group'),lb=!!(e.bl&&b.k==='group'),ra=la?grpLab(a):a,rb=lb?grpLab(b):b,dx=rb.x+rb.w/2-ra.x-ra.w/2,dy=rb.y+rb.h/2-ra.y-ra.h/2,hz=Math.abs(dx)*ra.h>=Math.abs(dy)*ra.w,sa=hz?(dx>0?1:3):(dy>0?2:0),sb=hz?(dx>0?3:1):(dy>0?0:2),P=(o,s)=>[[o.x+o.w/2,o.y],[o.x+o.w,o.y+o.h/2],[o.x+o.w/2,o.y+o.h],[o.x,o.y+o.h/2]][s],ray=(r,vx,vy)=>{const n=Math.hypot(vx,vy)||1,ux=vx/n,uy=vy/n,k=Math.min(ux?r.w/2/Math.abs(ux):1e9,uy?r.h/2/Math.abs(uy):1e9);return[[r.x+r.w/2+ux*k,r.y+r.h/2+uy*k],[ux,uy]]},Q0=la?ray(ra,dx,dy):[P(ra,sa),MN[sa]],Q1=lb?ray(rb,-dx,-dy):[P(rb,sb),MN[sb]],p0=Q0[0],p1=Q1[0],n0=Q0[1],n1=Q1[1],ea=Math.atan2(-n1[1],-n1[0]);
 if(e.st==='line')return{b:0,pts:[p0,p1],ea:Math.atan2(p1[1]-p0[1],p1[0]-p0[0])};
 if(e.st==='elbow'){const m=hz?[(p0[0]+p1[0])/2,p0[1]]:[p0[0],(p0[1]+p1[1])/2],m2=hz?[m[0],p1[1]]:[p1[0],m[1]];return{b:0,pts:[p0,m,m2,p1],ea}}
 const d=Math.max(60,Math.hypot(p1[0]-p0[0],p1[1]-p0[1])*.4);return{b:1,pts:[p0,[p0[0]+n0[0]*d,p0[1]+n0[1]*d],[p1[0]+n1[0]*d,p1[1]+n1[1]*d],p1],ea}}
function mmSample(pa){if(!pa.b)return pa.pts;const[p0,c1,c2,p1]=pa.pts,o=[];for(let i=0;i<=24;i++){const t=i/24,u=1-t;o.push([u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p1[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p1[1]])}return o}
function mmHit(x,y){const r=14/S.tr.s;for(let i=S.edges.length-1;i>=0;i--){const pa=mmPath(S.edges[i]);if(!pa)continue;const p=mmSample(pa);for(let j=0;j<p.length-1;j++)if(sd(x,y,p[j][0],p[j][1],p[j+1][0],p[j+1][1])<r)return S.edges[i]}return null}
/* Mũi tên: độ dày `w` tính bằng đơn vị trang (mặc định EW0). Đầu mũi tên tỉ lệ theo w; đường dừng ở gốc đầu mũi tên để không chồng nét. */
const EB=new Map();function ebp(e){if(!S.ready){EB.set(e.id,-1e9);return 1}let t=EB.get(e.id);if(t===undefined){t=performance.now();EB.set(e.id,t)}const k=Math.min(1,(performance.now()-t)/420);if(k<1)S.eba=true;return 1-Math.pow(1-k,3)}
function mmDraw(c){const col=lum(S.c.paper||'#ffffff')<.5?'#C9BFAE':'#7B6F61';c.save();c.lineCap=c.lineJoin='round';
 for(const e of S.edges){const pa=mmPath(e);if(!pa)continue;mmOne(c,e,pa,col)}c.restore()}
function mmOne(c,e,pa,col){const w=ew(e),n=pa.pts.length-1,pts=pa.pts.map(q=>q.slice()),a=pa.ea,ca=Math.cos(a),sa=Math.sin(a),tip=pa.pts[n],ref=pa.b?pa.pts[2]:pa.pts[n-1];
  let hd=e.ar?Math.max(20,w*3.8):0;const dl=Math.hypot(tip[0]-ref[0],tip[1]-ref[1]);hd=Math.min(hd,dl*.9);const gp=hd?Math.min(Math.max(10,hd*.42),Math.max(0,dl*.9-hd)):0,tp=[tip[0]-ca*gp,tip[1]-sa*gp];if(hd){pts[n][0]=tp[0]-ca*hd*.8;pts[n][1]=tp[1]-sa*hd*.8}
  const tr=()=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
   if(pa.b)c.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
   else if(e.st==='elbow'&&n===3){const R=Math.min(70,Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]),Math.hypot(pts[2][0]-pts[1][0],pts[2][1]-pts[1][1])/2,Math.hypot(pts[3][0]-pts[2][0],pts[3][1]-pts[2][1]));if(R>1){c.arcTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],R);c.arcTo(pts[2][0],pts[2][1],pts[3][0],pts[3][1],R)}else{c.lineTo(pts[1][0],pts[1][1]);c.lineTo(pts[2][0],pts[2][1])}c.lineTo(pts[3][0],pts[3][1])}
   else for(let i=1;i<=n;i++)c.lineTo(pts[i][0],pts[i][1]);c.stroke()};
  if(e.id===S.selE){c.strokeStyle=S.pr;c.globalAlpha=.28;c.lineWidth=w+16/S.tr.s;tr();c.globalAlpha=1}
  c.strokeStyle=c.fillStyle=e.c||col;c.lineWidth=w;const pr=e.gh?1:ebp(e);if(pr<1){let L=0;for(let i=0;i<n;i++)L+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);L*=1.2;c.setLineDash([L*pr,L*4])}tr();c.setLineDash([]);
  if(hd&&pr>=1){const W=hd*.46;c.lineWidth=Math.max(2,w*.5);c.beginPath();c.moveTo(tp[0],tp[1]);c.lineTo(tp[0]-hd*ca+W*sa,tp[1]-hd*sa-W*ca);c.lineTo(tp[0]-hd*ca-W*sa,tp[1]-hd*sa+W*ca);c.closePath();c.fill();c.stroke()}}
function mmPlus(p){x1.fillStyle=S.pr;x1.beginPath();x1.arc(p[0],p[1],17,0,7);x1.fill();x1.strokeStyle='#fff';x1.lineWidth=3;x1.beginPath();x1.moveTo(p[0]-7.5,p[1]);x1.lineTo(p[0]+7.5,p[1]);x1.moveTo(p[0],p[1]-7.5);x1.lineTo(p[0],p[1]+7.5);x1.stroke()}
function mmOver(){if(!S.cp||!g||g.m!=='conn')return;const a=obj(g.from);if(!a)return;
 if(g.dir){const s=S.tr.s,[wx,wy]=S.cp,b=hitObj(wx,wy),lk=!!(b&&(b.k==='node'||b.k==='group')&&b!==a),T0=lk?null:mmGhost(a,wx,wy,g.pt,g),col=lum(S.c.paper||'#ffffff')<.5?'#C9BFAE':'#7B6F61',tg=T0?[T0.cx,T0.cy]:g.gc;
  g.gc[0]+=(tg[0]-g.gc[0])*.38;g.gc[1]+=(tg[1]-g.gc[1])*.38;const ts=T0?1:.3,ta=T0?.68:0;g.gv=((g.gv||0)+(ts-g.gs)*.2)*.7;g.gs+=g.gv;g.ga+=(ta-g.ga)*.3;
  if(Math.abs(tg[0]-g.gc[0])+Math.abs(tg[1]-g.gc[1])>.4/s||Math.abs(ts-g.gs)>.01||Math.abs(g.gv)>.003||Math.abs(ta-g.ga)>.01)req();
  const gw=420*Math.max(.05,g.gs),gh=112*Math.max(.05,g.gs),go={x:g.gc[0]-gw/2,y:g.gc[1]-gh/2,w:gw,h:gh},fe={st:T.mm.st,ar:T.mm.ar,w:T.mm.w||EW0,gh:1};
  if(lk){const G=geo(b);x1.strokeStyle=S.pr;x1.lineWidth=3;x1.beginPath();G.q.forEach((p,i)=>i?x1.lineTo(p[0],p[1]):x1.moveTo(p[0],p[1]));x1.closePath();x1.stroke()}
  if(lk&&b.k==='group'&&inR(grpLab(b),wx,wy))fe.bl=1;if(g.al)fe.al=1;const ea=lk?.68:g.ga,pa=ea>.01?mmPath(fe,a,lk?b:go):null;
  x1.save();x1.translate(S.tr.x,S.tr.y);x1.scale(s,s);x1.lineCap=x1.lineJoin='round';
  if(pa){x1.globalAlpha=ea;mmOne(x1,fe,pa,col)}
  if(!lk&&g.ga>.01){x1.globalAlpha=g.ga;x1.shadowColor='rgba(0,0,0,.28)';x1.shadowBlur=22;x1.shadowOffsetY=8;x1.fillStyle=a.c;x1.beginPath();if(x1.roundRect)x1.roundRect(go.x,go.y,gw,gh,32*g.gs);else x1.rect(go.x,go.y,gw,gh);x1.fill();x1.shadowColor='transparent';x1.lineWidth=3;x1.strokeStyle='rgba(0,0,0,.12)';x1.stroke()}
  x1.restore();return}const G=geo(a),c=[(G.q[0][0]+G.q[2][0])/2,(G.q[0][1]+G.q[2][1])/2];x1.setLineDash([8,6]);x1.strokeStyle=S.pr;x1.lineWidth=2.5;x1.beginPath();x1.moveTo(c[0],c[1]);x1.lineTo(S.tr.x+S.cp[0]*S.tr.s,S.tr.y+S.cp[1]*S.tr.s);x1.stroke();x1.setLineDash([])}
function mmSpawn(a,side){const dx=[0,1,0,-1][side],dy=[-1,0,1,0][side],kids=S.edges.filter(e=>e.a===a.id).map(e=>obj(e.b)).filter(Boolean);let x,y;
 if(dx){x=dx>0?a.x+a.w+180:a.x-180-420;const s=kids.filter(k=>dx>0?k.x>a.x+a.w/2:k.x+k.w<a.x+a.w/2);y=s.length?Math.max(...s.map(k=>k.y+k.h))+36:a.y}
 else{y=dy>0?a.y+a.h+140:a.y-140-112;const s=kids.filter(k=>dy>0?k.y>a.y:k.y<a.y);x=s.length?Math.max(...s.map(k=>k.x+k.w))+36:a.x}
 return[x,y]}
/* Vị trí mặc định của dấu +: dưới -> trên -> phải -> trái; chọn hướng đầu tiên mà nút mới không chạm mép trang / vật khác */
function mmSide(a){let bs=1e9,bi=2;for(const s of[2,0,1,3]){const[x,y]=mmSpawn(a,s);let c=0;if(x<0||x+420>S.W||y<0||(!S.pdf&&y+112>S.H))c+=1000;for(const q of S.objs)if(q!==a&&q.k!=='group'&&x<q.x+q.w+14&&x+420>q.x-14&&y<q.y+q.h+14&&y+112>q.y-14)c+=10;if(c<bs){bs=c;bi=s}}return bi}
const mmDirSide=(a,wx,wy)=>{const dx=wx-a.x-a.w/2,dy=wy-a.y-a.h/2;if(Math.abs(dx)<a.w/2&&Math.abs(dy)<a.h/2)return null;return Math.abs(dx)*a.h>=Math.abs(dy)*a.w?(dx>0?1:3):(dy>0?2:0)};
/* Preview đè giữ: nút mờ dính theo ngón tay; hít (snap) vào vị trí chuẩn của 4 hướng khi lại gần; chưa kéo thì bay về hướng mặc định */
function mmGhost(a,wx,wy,pt,g0){const s=S.tr.s,dx0=wx-a.x-a.w/2,dy0=wy-a.y-a.h/2;if(Math.abs(dx0)<a.w/2&&Math.abs(dy0)<a.h/2)return null;
 if(g0&&g0.w0&&Math.hypot(wx-g0.w0[0],wy-g0.w0[1])*s<14){const[x,y]=mmSpawn(a,g0.side);return{cx:x+210,cy:y+56,sn:1}}
 let cx=wx,cy=wy-(pt==='touch'?64/s:0),bd=72/s,sn=0;
 for(let sd=0;sd<4;sd++){const[x,y]=mmSpawn(a,sd),d=Math.hypot(x+210-cx,y+56-cy);if(d<bd){bd=d;cx=x+210;cy=y+56;sn=1}}
 if(!sn){const M=90,ox=cx-a.x-a.w/2,oy=cy-a.y-a.h/2;if(Math.abs(ox)<a.w/2+210+M&&Math.abs(oy)<a.h/2+56+M){if(Math.abs(ox)*(a.h+112+2*M)>=Math.abs(oy)*(a.w+420+2*M))cx=ox>0?a.x+a.w+M+210:a.x-M-210;else cy=oy>0?a.y+a.h+M+56:a.y-M-56}}
 return{cx,cy,sn}}
function addChild(a,side){const[x,y]=mmSpawn(a,side),n=mkNode(x,y,a.c);touch();S.objs.push(n);S.edges.push(mkEdge(a.id,n.id));renderObjs();startEdit(n)}
function addSib(o){const e=S.edges.find(q=>q.b===o.id),p=e&&obj(e.a);if(!p)return addChild(o,2);const ks=S.edges.filter(q=>q.a===p.id).map(q=>obj(q.b)).filter(Boolean),n=mkNode(o.x,Math.max(...ks.map(k=>k.y+k.h))+36,o.c);touch();S.objs.push(n);S.edges.push(mkEdge(p.id,n.id));renderObjs();startEdit(n)}
function mmEnd(gg,p){clearTimeout(gg.ht);S.cp=null;const a=obj(gg.from);if(!a)return;const[wx,wy]=W2(p.x,p.y),mv=Math.hypot(p.x-gg.x0,p.y-gg.y0),b=hitObj(wx,wy);
 if(gg.dir&&!(b&&(b.k==='node'||b.k==='group')&&b!==a)){const T0=mmGhost(a,wx,wy,gg.pt,gg);if(T0){const n=mkNode(T0.cx-210,T0.cy-56,a.c);touch();S.objs.push(n);S.edges.push(mkEdge(a.id,n.id));renderObjs();startEdit(n)}else{bar();req()}return}
 if(mv<10){if(gg.side!=null)addChild(a,gg.side);return}
 if(b&&(b.k==='node'||b.k==='group')&&b!==a){if(!S.edges.some(e=>(e.a===a.id&&e.b===b.id)||(e.a===b.id&&e.b===a.id))){touch();const ne=mkEdge(a.id,b.id);if(gg.al)ne.al=1;if(b.k==='group'&&inR(grpLab(b),wx,wy))ne.bl=1;S.edges.push(ne);commit();S.sel=b.id;hap()}}
 else if(mv>40){const n=mkNode(wx-210,wy-56,a.c);touch();S.objs.push(n);S.edges.push(mkEdge(a.id,n.id));renderObjs();startEdit(n)}
 bar();req()}
function mmLayout(){const ns=S.objs.filter(o=>o.k==='node');if(!ns.length)return;const ids=new Set(ns.map(o=>o.id)),kids=id=>S.edges.filter(e=>e.a===id&&ids.has(e.b)).map(e=>obj(e.b)),hasP=new Set(S.edges.filter(e=>ids.has(e.a)).map(e=>e.b)),roots=ns.filter(o=>!hasP.has(o.id)).sort((a,b)=>a.y-b.y||a.x-b.x),GX=160,GY=36,H=new Map(),K=new Map();
 const tb=ks=>ks.length?ks.reduce((s,k)=>s+H.get(k.id),0)+GY*(ks.length-1):0,meas=n=>{H.set(n.id,n.h);const ks=kids(n.id).filter(k=>!H.has(k.id));K.set(n.id,ks);ks.forEach(meas);H.set(n.id,Math.max(n.h,tb(ks)))},
 place=(n,x,y)=>{const hh=H.get(n.id),ks=K.get(n.id)||[];n.x=x;n.y=y+(hh-n.h)/2;let yy=y+(hh-tb(ks))/2;for(const k of ks){place(k,x+n.w+GX,yy);yy+=H.get(k.id)+GY}};
 touch();let y0=roots.length?roots[0].y:0;for(const r of roots){meas(r);place(r,r.x,y0);y0+=H.get(r.id)+GY*2}commit();renderObjs();req();hap()}
function mmEdgeBar(b,ed){const act=(i,l,f,cls)=>h('button',{class:'bt'+(cls?' '+cls:''),'aria-label':l,title:l,innerHTML:ic(i,20),onclick:()=>{touch();f();commit();bar();req()}});
 b.append(...[['curve','crv','Đường cong'],['line','lin','Đường thẳng'],['elbow','elb','Đường gấp khúc']].map(([k,i,l])=>act(i,l,()=>ed.st=k,ed.st===k?'on':'')),act('arw','Đầu mũi tên',()=>ed.ar=ed.ar?0:1,ed.ar?'on':''),h('span',{class:'op',innerHTML:ic('thk',20)}),h('input',{type:'range',min:2,max:24,step:1,value:ew(ed),style:'width:84px','aria-label':'Độ dày mũi tên',oninput:e=>{touch();ed.w=+e.target.value;req()},onchange:()=>commit()}),...GC.map(c=>h('button',{class:'sw'+((ed.c||null)===c?' on':''),style:'background:'+(c||'#7E7E7E')+';width:30px;height:30px','aria-label':'Màu mũi tên',onclick:()=>{touch();ed.c=c;commit();bar();req()}})),rb(ed.c,GC,c=>{touch();ed.c=c;commit();bar();req()},30),act('tr','Xóa mũi tên',()=>{S.edges=S.edges.filter(x=>x!==ed);S.selE=null},'del'))}
function mmPop(p){const M2=T.mm,rr=()=>mmPop(p),ed=()=>S.selE&&S.edges.find(e=>e.id===S.selE),upd=f=>{const e=ed();if(e){touch();f(e);commit()}req()};p.replaceChildren();p.className='on';
 p.append(h('div',{class:'lb',innerHTML:ic('mm',18)+'Sơ đồ tư duy'}),
  h('div',{class:'row'},chip('Thêm nút',M2.mode==='node',()=>{M2.mode='node';saveT();rr()},'nt'),chip('Nối nút',M2.mode==='link',()=>{M2.mode='link';saveT();rr()},'lnk')),
  h('div',{class:'lb',innerHTML:ic('arw',18)+'Mũi tên'}),
  h('div',{class:'row'},[['curve','crv'],['line','lin'],['elbow','elb']].map(([k,i])=>chip('',M2.st===k,()=>{M2.st=k;saveT();upd(e=>e.st=k);rr()},i)),chip('',!!M2.ar,()=>{M2.ar=M2.ar?0:1;saveT();upd(e=>e.ar=M2.ar);rr()},'arw')),
  h('div',{class:'lb',innerHTML:ic('thk',18)+'Độ dày mũi tên'}),h('input',{type:'range',min:2,max:24,step:1,value:M2.w||EW0,'aria-label':'Độ dày mũi tên',oninput:e=>{M2.w=+e.target.value;saveT();const d=ed();if(d){touch();d.w=M2.w}req()},onchange:()=>commit()}),
  h('div',{class:'lb',innerHTML:ic('pen',18)+'Màu nút'}),swatches(MC,M2.cc||MC[M2.c],c=>{const i=MC.indexOf(c);if(i>=0){M2.c=i;M2.cc=null}else M2.cc=c;saveT();const o=obj(S.sel);if(o&&o.k==='node'){touch();o.c=c;o.c2=ink2(c);commit();renderObjs()}rr()},1),
  h('button',{class:'btn g',style:'width:100%;margin-top:10px',innerHTML:ic('lay',20)+'<span>Sắp xếp tự động</span>',onclick:mmLayout}))}
let LP,LPF=0;let TL;const TLA=[['select','sel','Chọn'],['pen','pen','Bút'],['hl','hl','Bút dạ'],['erase','er','Tẩy'],['text','tx','Chữ'],['img','im','Ảnh'],['note','nt','Ghi chú'],['mm','mm','Sơ đồ tư duy']];TL=TLA;
function tools(){const box=$('#tools'),cp=S.compact&&S.tool==='select'&&!S.mm;if(!S.tbi)box.classList.add('nt');
 if(box.children.length!==TL.length)box.replaceChildren(...TL.map(([k,i,l],n)=>{const b=I(i,{'aria-label':l,title:l,class:'ib',onpointerdown:e=>{if(k==='select')tbHold(e);if(k==='mm'){clearTimeout(LP);LP=setTimeout(()=>{LPF=1;if(!S.mm)T.mm.mode='node';S.mm=true;S.tool='select';S.popOn='mm';S.sel=null;S.selE=null;bar();hap();document.querySelectorAll('#tools .ib').forEach((b,i)=>b.classList.toggle('on',TL[i][0]==='mm'));pop();req();setTimeout(()=>LPF=0,1500)},450)}},onpointerup:()=>clearTimeout(LP),onpointerleave:()=>clearTimeout(LP),onpointercancel:()=>clearTimeout(LP),onclick:()=>{if(TBF)return;if(LPF){LPF=0;return}if(k==='img'){$('#file').click();return}if(k==='select'){const was=S.tool==='select'&&!S.mm;S.compact=was?!S.compact:true;if(was&&!S.compact){const t=$('#tools');t.classList.add('ex');setTimeout(()=>t.classList.remove('ex'),700)}S.mm=false;S.tool='select';S.popOn=null;S.sel=null;S.selE=null;bar();hap();tools();pop();req();return}S.compact=false;if(k==='mm'){if(S.mm)S.popOn=S.popOn==='mm'?null:'mm';else{T.mm.mode='node';S.mm=true;S.tool='select';S.popOn=null;S.sel=null;S.selE=null;bar();hap()}}else if(S.tool===k&&!S.mm&&['pen','hl','erase'].includes(k))S.popOn=S.popOn?null:k;else{S.mm=false;S.tool=k;S.popOn=null;S.sel=null;S.selE=null;bar();hap()}tools();pop();req()}});if(k==='pen'||k==='hl')b.append(h('i',{class:'dot','data-k':k,style:'background:'+T[k].c}));b.dataset.k=k;b.style.setProperty('--n',n);return b}));
 box.classList.toggle('cp',cp);TL.forEach(([k],n)=>{const b=box.children[n],hid=cp&&k!=='select';b.classList.toggle('on',k==='mm'?S.mm:S.tool===k&&!S.mm);b.tabIndex=hid?-1:0;b.setAttribute('aria-hidden',hid?'true':'false')});dots();
 if(!S.tbi){void box.offsetWidth;box.classList.remove('nt');S.tbi=1;S.tbc=cp}else if(S.tbc!==cp){S.tbc=cp;const sl=box.children[0];sl.classList.remove('tbp');void sl.offsetWidth;sl.classList.add('tbp')}
 tbApply();tsnUp()}
/* kéo thanh công cụ: đè nút Con trỏ rồi kéo đi đâu cũng được; thả sát cạnh trái/phải thì chuyển sang dạng đứng. TBP chỉ giữ trong phiên (không lưu vào dữ liệu) */
let TBP=null,TBF=0,TBH;
function tbEst(v){const box=$('#tools'),b=box.children[0],cs=getComputedStyle(box),p=parseFloat(cs.paddingTop)||5,q=parseFloat(cs.paddingLeft)||7,a=Math.min(p,q),c=Math.max(p,q),k=box.classList.contains('cp')?1:TL.length,bw=b.offsetWidth,bh=b.offsetHeight;return v?{W:bw+2*a+2,H:k*(bh+2)+2*c+2,c,bw,bh}:{W:k*(bw+2)+2*c+2,H:bh+2*a+2,c,bw,bh}}
function tbPlace(el,m,fx,fy,W,H,d){d=d||0;const ed=$('#ed'),w=ed.clientWidth,hh=ed.clientHeight,s=el.style;s.bottom='auto';s.top=Math.min(Math.max(fy*hh,$('#stage').offsetTop+6+H/2),hh-6-H/2)+'px';
 if(m==='h'){s.left=Math.min(Math.max(fx*w,6+W/2),w-6-W/2)+'px';s.right='auto';s.transform='translate(-50%,-50%)'}
 else{s.transform='translateY(-50%)';const e='calc('+(8-d)+'px + env(safe-area-inset-'+(m==='l'?'left':'right')+',0px))';if(m==='l'){s.left=e;s.right='auto'}else{s.right=e;s.left='auto'}}}
function tbApply(){const box=$('#tools');if(!box||!TBP||$('#ed').hidden||!TL||!box.children.length)return;const v=TBP.m!=='h',e=tbEst(v);box.classList.toggle('tv',v);box.classList.toggle('tvl',TBP.m==='l');box.classList.toggle('tvr',TBP.m==='r');tbPlace(box,TBP.m,TBP.fx,TBP.fy,e.W,e.H)}
function tbHold(e){clearTimeout(TBH);const x0=e.clientX,y0=e.clientY,pid=e.pointerId,off=()=>{clearTimeout(TBH);removeEventListener('pointermove',mv);removeEventListener('pointerup',off);removeEventListener('pointercancel',off)},mv=ev=>{if(ev.pointerId===pid&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>10)off()};addEventListener('pointermove',mv);addEventListener('pointerup',off);addEventListener('pointercancel',off);TBH=setTimeout(()=>{off();tbDrag(pid)},200)}
function tbDrag(pid){const box=$('#tools'),ed=$('#ed'),W0=ed.clientWidth,H0=ed.clientHeight,zn=Math.min(48,W0*.12),nw=!TBP;let dk=null,mvd=0,fyv=0,g=$('#tgh');if(!g){g=h('div',{id:'tgh'});ed.append(g)}
 if(nw){const r=box.getBoundingClientRect();TBP={m:'h',fx:(r.left+r.width/2)/W0,fy:(r.top+r.height/2)/H0}}
 TBF=1;box.classList.add('tdr');hap();
 const mv=ev=>{if(ev.pointerId!==pid)return;mvd=1;const px=ev.clientX,py=ev.clientY,k=px<zn?'l':px>W0-zn?'r':null,vh=tbEst(true),hz=tbEst(false);if(k&&k!==dk)hap();dk=k;fyv=(py+vh.H/2-(1+vh.c+(vh.bh+2)/2))/H0;
  if(dk&&TBP.m===dk)TBP.fy=fyv;else{TBP.m='h';TBP.fx=(px+hz.W/2-(1+hz.c+(hz.bw+2)/2))/W0;TBP.fy=py/H0}
  tbApply();if(dk&&TBP.m!==dk){g.style.width=(vh.W+8)+'px';g.style.height=(vh.H+8)+'px';tbPlace(g,dk,0,fyv,vh.W+8,vh.H+8,4);g.classList.add('on')}else g.classList.remove('on')},
 up=ev=>{if(ev.pointerId!==pid)return;removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(dk&&TBP.m!==dk){TBP.m=dk;TBP.fy=fyv}box.classList.remove('tdr');g.classList.remove('on');if(!mvd&&nw)TBP=null;else tbApply();setTimeout(()=>TBF=0,400)};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)}
addEventListener('resize',()=>requestAnimationFrame(tbApply));$('#tools').addEventListener('contextmenu',e=>{if(e.target.closest('[data-k=select]'))e.preventDefault()});
/* nút hít chữ: không cướp tiêu điểm khỏi ô đang gõ; bật/tắt áp dụng cho chữ mới và chữ đang sửa */
$('#tsn').innerHTML=ic('snp',24);$('#tsn').onmousedown=e=>e.preventDefault();$('#tsn').onpointerdown=e=>e.preventDefault();
$('#tsn').onclick=()=>{T.sn=!T.sn;saveT();hap();const o=S&&S.edit&&obj(S.edit);if(o&&o.k==='text'&&GSP()){touch();if(T.sn){o.sn=1;lnSnap(o)}else delete o.sn;renderObjs(o);const ta=els.get(o.id).querySelector('textarea');if(ta){ta.style.height='auto';ta.style.height=Math.max(ta.scrollHeight,o.fs*1.3)+'px';o.h=ta.scrollHeight}}tsnUp();req()};
const dots=()=>document.querySelectorAll('#tools .dot').forEach(d=>d.style.background=T[d.dataset.k].c);
const rec=c=>{T.rec=[c,...T.rec.filter(x=>x!==c)].slice(0,6);saveT()};
function pop(){const p=$('#pop'),k=S.popOn;if(!k||(k==='mm'?!S.mm:S.tool!==k)){p.className='';return}p.replaceChildren();p.className='on';if(k==='mm'){mmPop(p);return}
 const sl=(mn,mx,st,v,f)=>h('input',{type:'range',min:mn,max:mx,step:st,value:v,oninput:e=>{f(+e.target.value);saveT();dr()}});let dr=()=>{};
 if(k==='erase'){p.append(h('div',{class:'lb',innerHTML:ic('er',18)+'Cỡ tẩy'}),sl(10,80,1,T.er.w,v=>T.er.w=v),h('div',{class:'row'},chip('Từng phần',T.er.mode==='part',()=>{T.er.mode='part';saveT();pop()},'wp'),chip('Cả nét',T.er.mode==='stroke',()=>{T.er.mode='stroke';saveT();pop()},'ws')));return}
 const c=T[k],hl=k==='hl',pv=h('canvas',{class:'pv',width:340,height:44});dr=()=>{const x=pv.getContext('2d');x.clearRect(0,0,340,44);x.lineWidth=c.w;x.strokeStyle=c.c;x.lineCap=k==='hl'?'butt':'round';x.globalAlpha=k==='hl'?.35:1;x.beginPath();x.moveTo(20,28);x.bezierCurveTo(100,4,200,50,320,16);x.stroke()};
 const dm=v=>Math.min(24,4+v*(hl?.6:1.5));
 p.append(pv,h('div',{class:'row',style:'margin:0 0 2px'},(hl?[10,20,32]:[1.5,3,6,12]).map(v=>h('button',{class:'sz'+(c.w===v?' on':''),'aria-label':'Cỡ '+v,onclick:()=>{c.w=v;saveT();pop()}},h('i',{style:`width:${dm(v)}px;height:${dm(v)}px;background:${c.c}`})))),
  sl(.5,40,.5,c.w,v=>c.w=v),swatches(PAL,c.c,col=>{c.c=col;rec(col);saveT();dots();pop()}),T.rec.length?swatches(T.rec,c.c,col=>{c.c=col;saveT();dots();pop()}):'',h('input',{type:'color',value:c.c,onchange:e=>{c.c=e.target.value;rec(c.c);dots();pop()}}),
  h('div',{class:'lb',innerHTML:ic('sm',18)+'Độ mượt nét'}),sl(0,1,.05,T.stab,v=>T.stab=v));dr()}
