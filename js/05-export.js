'use strict';
// 05-export.js: Xuất ảnh/PDF của trang, tải ghi âm, hộp tiến trình. Dòng 725-884 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: xProg, xLoad, xBox, xPg, xLines, xObj, xCanvas, xShot, xPdfBuild, runExport, xSheet, audCaps, wavBlob, aacEnc, aacAdts, mp4Mux, audDown, audMenu,
//   xSave, xName, xLen, xDelay, xBlob, xSz, xWith, xSc, xFF, xFree, xOb, xSr, AFQ, xDec, aEnc
/* ===== Xuất ảnh/PDF, tải âm thanh, sao lưu .noteri ===== */
Object.assign(IC,{dl:'<path d="M12 4.5v11"/><path d="M7.5 11L12 15.5 16.5 11"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>'});
const xSave=(b,n)=>{const u=URL.createObjectURL(b),a=h('a',{href:u,download:n});a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),12e4)},
xName=(n,e)=>(String(n||'').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,80)||'Noteri')+'.'+e,
xLen=x=>x.size!=null?x.size:x.byteLength,xDelay=ms=>new Promise(r=>setTimeout(r,ms)),
xBlob=(cv,t,q)=>new Promise(r=>{try{cv.toBlob(r,t,q)}catch(e){r(null)}}),
xSz=s=>s<1e6?Math.max(1,Math.round(s/1e3))+' KB':(s/1e6).toFixed(1)+' MB',
xWith=(E,f)=>{const o=S;S=E.s;try{return f()}finally{S=o}},
xSc=(w,h,cap)=>Math.max(.04,Math.min(cap,Math.sqrt(Math.max(12e6,PB*.6)/(w*h)),15000/Math.max(w,h))),
xFF=()=>getComputedStyle(document.documentElement).getPropertyValue('--ff')||'sans-serif';
/* hộp tiến trình dùng chung; P.chk() ném {cancel:1} khi người dùng hủy hoặc đóng hộp */
function xProg(title,ind){const bar=h('i'),box=h('div',{class:'xpb'+(ind?' ind':'')},bar),tx=h('small',{class:'hn',style:'text-align:center',textContent:''});let c=0;
 modal(h('h2',{textContent:title}),box,tx,h('div',{class:'row',style:'margin-top:14px'},h('button',{class:'btn g',style:'flex:1',textContent:'Hủy',onclick:()=>{c=1;closeM()}})));
 const P={dead:()=>c||!bar.isConnected||$('#modal').classList.contains('out'),
  set:(p,t)=>{if(p!=null){box.classList.remove('ind');bar.style.width=Math.round(Math.max(0,Math.min(1,p))*100)+'%'}if(t!=null)tx.textContent=t},
  chk:()=>{if(P.dead())throw{cancel:1}}};return P}
/* ---------- ảnh PNG / PDF của trang, giấy note, ảnh, PDF ---------- */
async function xLoad(d){let c=await get('d:'+d.id);c=typeof c==='string'?JSON.parse(c):c||{};
 const E={d,pdf:d.type==='pdf',img:d.type==='image',strokes:c.strokes||[],objs:c.objs||[],edges:c.edges||[],paper:c.paper||d.paper||'#ffffff',pattern:c.pattern||d.pattern,sp:c.sp||d.sp,imgs:new Map(),sheets:[],doc:null,base:null};
 if(E.pdf){if(!window.pdfjsLib)throw{msg:'Cần kết nối mạng một lần để tải bộ đọc PDF.'};E.doc=await pdfOpen(await get('p:'+d.id));const rs=await pdfRat(d.id,E.doc);let y=0;for(const r of rs){const hh=SW*r;E.sheets.push({y,h:hh});y+=hh+48}E.W=SW;E.H=y-48}
 else if(E.img){E.base=await createImageBitmap(await get('i:'+d.id));E.W=c.cw||E.base.width;E.H=c.fh||c.ch||E.base.height}
 else{const[a,b]=RAT[c.ratio||d.ratio]||[3,4],k=2400/Math.max(a,b);E.W=a*k;E.H=b*k}
 for(const o of E.objs)if(o.k==='img'&&o.src){const im=new Image();im.src=o.src;try{await im.decode()}catch(e){}E.imgs.set(o.id,im)}
 E.s={c:{paper:E.paper,pattern:E.pattern,sp:E.sp},pdf:E.pdf,objs:E.objs,edges:E.edges,strokes:E.strokes,selE:null,ready:0,tr:{s:1,x:0,y:0},pr:'#C4673F',W:E.W,H:E.H,sheets:E.sheets};
 return E}
const xFree=E=>{if(!E)return;try{E.doc&&E.doc.destroy().catch(()=>{})}catch(e){}try{E.base&&E.base.close&&E.base.close()}catch(e){}E.imgs.clear()},
xOb=o=>{const cx=o.x+o.w/2,cy=o.y+o.h/2,r=o.r||0,cs=Math.abs(Math.cos(r)),sn=Math.abs(Math.sin(r)),hx=(cs*o.w+sn*o.h)/2,hy=(sn*o.w+cs*o.h)/2;let t=cy-hy;if(o.k==='group')t=Math.min(t,o.y-4-(o.fs||48)*1.54);return[cx-hx-10,t-10,cx+hx+10,cy+hy+16]};
/* khung xuất: 'in' = đúng mép trang/PDF/ảnh; 'all' = mọi thứ đã vẽ, kể cả ngoài mép (zoom ra vừa đủ) */
function xBox(E,mode,i){const B=E.pdf?{x:0,y:E.sheets[i].y,w:SW,h:E.sheets[i].h}:{x:0,y:0,w:E.W,h:E.H};B.base={x:B.x,y:B.y,w:B.w,h:B.h};B.desk=false;if(mode!=='all')return B;
 let l=B.x,t=B.y,r=B.x+B.w,b=B.y+B.h;const lo=E.pdf&&i>0?B.y-24:-1e18,hi=E.pdf&&i<E.sheets.length-1?B.y+B.h+24:1e18,
 add=(x0,y0,x1,y1)=>{const cy=(y0+y1)/2;if(!(cy>=lo&&cy<=hi)||!isFinite(x0+y0+x1+y1))return;l=Math.min(l,x0);t=Math.min(t,y0);r=Math.max(r,x1);b=Math.max(b,y1)};
 for(const s of E.strokes){if(!s.p||!s.p.length)continue;const q=bb(s);add(q[0],q[1],q[2],q[3])}
 for(const o of E.objs){const q=xOb(o);add(q[0],q[1],q[2],q[3])}
 xWith(E,()=>{for(const e of E.edges){const pa=mmPath(e);if(!pa)continue;let x0=1e18,y0=1e18,x1=-1e18,y1=-1e18;for(const p of mmSample(pa)){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}const m=ew(e)*2+24;add(x0-m,y0-m,x1+m,y1+m)}});
 if(l<B.x||t<B.y||r>B.x+B.w||b>B.y+B.h){const g=60;return{x:l-g,y:t-g,w:r-l+2*g,h:b-t+2*g,base:B.base,desk:true}}return B}
async function xPg(E,i,cv){const pg=await tmo(E.doc.getPage(i+1),2e4),v1=pg.getViewport({scale:1}),vp=pg.getViewport({scale:cv.width/v1.width}),cx=cv.getContext('2d');if(!cx)throw{mem:1};
 try{await tmo(pg.render({canvasContext:cx,viewport:vp}).promise,6e4)}finally{try{pg.cleanup()}catch(e){}}return{w:v1.width,h:v1.height}}
function xLines(c,t,mw){const L=[];for(const p of String(t).split('\n')){let ln='';const ws=p.split(' ');for(let i=0;i<ws.length;i++){const wd=ws[i],tr=ln?ln+' '+wd:wd;
  if(!ln||c.measureText(tr).width<=mw){if(!ln&&c.measureText(wd).width>mw){let sg='';for(const ch of wd){if(sg&&c.measureText(sg+ch).width>mw){L.push(sg);sg=ch}else sg+=ch}ln=sg}else ln=tr}else{L.push(ln);ln='';i--}}L.push(ln)}return L}
function xObj(c,o,E){c.save();c.translate(o.x+o.w/2,o.y+o.h/2);c.rotate(o.r||0);c.globalAlpha=o.op==null?1:o.op;const w=o.w,H=o.h,x=-w/2,y=-H/2;
 if(o.k==='img'){const i=E.imgs.get(o.id);if(i&&(i.naturalWidth||i.width)){c.scale(o.fx?-1:1,o.fy?-1:1);c.drawImage(i,x,y,w,H)}c.restore();return}
 const dk=lum(E.paper)<.5,fs=o.fs||48,K=o.k,gc=HX.test(o.gc||'')?o.gc:null,rr=(X,Y,W,Z,r)=>{c.beginPath();if(c.roundRect)c.roundRect(X,Y,W,Z,Math.max(0,r));else c.rect(X,Y,W,Z)};
 if(K==='group'){rr(x,y,w,H,40);c.fillStyle=gc?hexA(gc,dk?.12:.09):dk?'rgba(255,255,255,.055)':'rgba(46,40,34,.05)';c.fill();rr(x+1.5,y+1.5,w-3,H-3,38.5);c.lineWidth=3;c.strokeStyle=gc?hexA(gc,.75):dk?'rgba(255,255,255,.22)':'rgba(46,40,34,.2)';c.stroke()}
 else if(K==='node'){rr(x,y,w,H,32);c.fillStyle=o.c;c.fill();rr(x+1.5,y+1.5,w-3,H-3,30.5);c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.12)';c.stroke()}
 else if(K==='note'){c.save();c.shadowColor='rgba(0,0,0,.133)';c.shadowBlur=12;c.shadowOffsetY=4;c.fillStyle=o.c;c.fillRect(x,y,w,H);c.restore()}
 const t=o.txt||'';
 if(t){c.font=`${K==='node'||K==='group'?600:400} ${fs}px ${xFF()}`;c.textBaseline='alphabetic';const m=c.measureText('Hg'),A=m.fontBoundingBoxAscent||fs*.93,D=m.fontBoundingBoxDescent||fs*.24;
  if(K==='group'){const ch=fs*1.54,avail=Math.max(0,w-1.1*fs);let s=t;if(c.measureText(s).width>avail){while(s.length>1&&c.measureText(s+'…').width>avail)s=s.slice(0,-1);s+='…'}
   const cw=Math.min(w,c.measureText(s).width+1.1*fs),cy=y-4-ch;rr(x,cy,cw,ch,.5*fs);c.fillStyle=gc||(dk?'rgba(255,255,255,.1)':'rgba(46,40,34,.09)');c.fill();
   c.fillStyle=o.c2||(gc?(lum(gc)>.62?'#2E2822':'#fff'):dk?'#E6DECF':'#4A4036');c.fillText(s,x+.55*fs,cy+.12*fs+(fs*1.3-(A+D))/2+A)}
  else{const pad=K==='note'?28:K==='node'?31:0,lh=K==='text'&&o.sn&&GSP()?lnLH(o):fs*1.3,bs=(lh-(A+D))/2+A;c.fillStyle=o.c2||'#2E2822';xLines(c,t,w-2*pad).forEach((l,j)=>c.fillText(l,x+pad,y+pad+j*lh+bs))}}
 c.restore()}
async function xCanvas(E,B,sc,i){const cw=Math.max(1,Math.round(B.w*sc)),ch=Math.max(1,Math.round(B.h*sc)),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const c=cv.getContext('2d');if(!c){cv.width=cv.height=0;throw{mem:1}}
 try{const k=cw/B.w,kv=ch/B.h,bs=B.base,px=(bs.x-B.x)*k,py=(bs.y-B.y)*kv,pw=bs.w*k,ph=bs.h*kv,dk=lum(E.paper)<.5;let pts=null;
  if(B.desk){c.fillStyle=dk?'#16130F':'#E9E4DA';c.fillRect(0,0,cw,ch)}
  c.fillStyle=E.pdf?'#fff':E.paper;c.fillRect(px,py,pw,ph);
  if(E.pdf){if(B.desk){const t=document.createElement('canvas');t.width=Math.max(1,Math.round(pw));t.height=Math.max(1,Math.round(ph));try{pts=await xPg(E,i,t);c.drawImage(t,px,py,pw,ph)}finally{t.width=t.height=0}}else pts=await xPg(E,i,cv)}
  xWith(E,()=>{c.save();c.setTransform(k,0,0,kv,-B.x*k,-B.y*kv);
   if(!E.pdf){if(E.base)c.drawImage(E.base,0,0,E.W,E.H);const pt=E.pattern;if(pt==='ruled'||pt==='grid'){c.strokeStyle=dk?'rgba(255,255,255,.14)':'rgba(0,0,0,.12)';c.lineWidth=2;const st={S:70,M:100,L:140}[E.sp||'M'];c.beginPath();for(let a=st;a<E.H;a+=st){c.moveTo(0,a);c.lineTo(E.W,a)}if(pt==='grid')for(let a=st;a<E.W;a+=st){c.moveTo(a,0);c.lineTo(a,E.H)}c.stroke()}}
   if(B.desk){c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=2;c.strokeRect(bs.x,bs.y,bs.w,bs.h)}
   if(E.edges.length){try{mmDraw(c)}catch(e){}}
   for(const o of E.objs){try{xObj(c,o,E)}catch(e){c.restore()}}
   const hs=E.strokes.some(s=>s.t==='h'&&!s.dim);let ink=c,lay=null;
   if(hs){try{lay=document.createElement('canvas');lay.width=cw;lay.height=ch;ink=lay.getContext('2d');if(!ink)throw 0;ink.setTransform(k,0,0,kv,-B.x*k,-B.y*kv)}catch(e){if(lay)lay.width=lay.height=0;lay=null;ink=c}}
   for(const s of E.strokes){if(s.dim||!s.p||!s.p.length)continue;const q=bb(s);if(q[2]<B.x||q[0]>B.x+B.w||q[3]<B.y||q[1]>B.y+B.h)continue;drawStroke(ink,s)}
   if(lay){c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(lay,0,0);c.restore();lay.width=lay.height=0}
   c.restore()});
  return{cv,w:cw,h:ch,pts}}catch(e){cv.width=cv.height=0;throw e}}
/* tạo ảnh; thiếu bộ nhớ thì tự giảm độ phân giải và thử lại */
async function xShot(E,B,cap,i,P,type,q){let sc=xSc(B.w,B.h,cap);
 for(let n=0;n<4;n++){P.chk();let r=null;try{r=await xCanvas(E,B,sc,i);const bl=await xBlob(r.cv,type,q);r.cv.width=r.cv.height=0;if(bl)return{blob:bl,w:r.w,h:r.h,pts:r.pts}}catch(e){if(!(e&&(e.mem||e.name==='RangeError')))throw e}sc*=.7}
 throw{msg:'Không đủ bộ nhớ để tạo ảnh lớn như vậy. Hãy thử chọn "Trong khung".'}}
/* ghi PDF: mỗi trang là một ảnh JPEG toàn trang (đã gồm nét vẽ, chữ, ảnh, sơ đồ tư duy) */
function xPdfBuild(pg,title){const E8=new TextEncoder(),parts=[],offs=[];let off=0;
 const w=x=>{const b=typeof x==='string'?E8.encode(x):x;parts.push(b);off+=xLen(b)},o=(n,s)=>{offs[n]=off;w(n+' 0 obj\n'+s+'\nendobj\n')};
 let hx='FEFF';for(let i=0;i<title.length;i++)hx+=title.charCodeAt(i).toString(16).padStart(4,'0');
 w('%PDF-1.4\n');w(Uint8Array.of(37,226,227,207,211,10));
 const N=pg.length;o(1,'<< /Type /Catalog /Pages 2 0 R >>');o(2,`<< /Type /Pages /Count ${N} /Kids [${pg.map((_,i)=>(4+3*i)+' 0 R').join(' ')}] >>`);o(3,`<< /Producer (Noteri) /Title <${hx}> >>`);
 pg.forEach((p,i)=>{const a=4+3*i,f=p.pw.toFixed(2),g=p.ph.toFixed(2),cs=`q ${f} 0 0 ${g} 0 0 cm /Im0 Do Q`;
  o(a,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f} ${g}] /Resources << /XObject << /Im0 ${a+2} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${a+1} 0 R >>`);
  o(a+1,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
  offs[a+2]=off;w(`${a+2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.blob.size} >>\nstream\n`);w(p.blob);w('\nendstream\nendobj\n')});
 const xr=off,Mx=4+3*N;let s=`xref\n0 ${Mx}\n0000000000 65535 f \n`;for(let n=1;n<Mx;n++)s+=String(offs[n]).padStart(10,'0')+' 00000 n \n';
 s+=`trailer\n<< /Size ${Mx} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xr}\n%%EOF\n`;w(s);return new Blob(parts,{type:'application/pdf'})}
async function runExport(d,s){const P=xProg('Đang xuất…',1);let E=null;
 try{P.set(null,'Đang đọc nội dung…');E=await xLoad(d);P.chk();
  try{await Promise.all([document.fonts.load('400 40px "Google Sans"'),document.fonts.load('600 40px "Google Sans"')])}catch(e){}
  const cap=E.img?Math.min(4,Math.max(1,E.base.width/E.W)):3;
  if(!E.pdf||s.fmt==='png'){const i=E.pdf?s.pg-1:0,B=xBox(E,s.sc,i);P.set(null,'Đang tạo ảnh…');const r=await xShot(E,B,cap,i,P,'image/png');P.chk();xSave(r.blob,xName(E.pdf?d.name+' - trang '+s.pg:d.name,'png'));closeM()}
  else{const pg=[],a=s.a-1,b=s.b-1;
   for(let i=a;i<=b;i++){P.chk();P.set((i-a)/(b-a+1),'Trang '+(i+1)+' / '+s.n);const B=xBox(E,s.sc,i),r=await xShot(E,B,2,i,P,'image/jpeg',.92),k=r.pts.w/SW;let pw=B.w*k,ph=B.h*k;const m=Math.max(pw,ph);if(m>14000){pw*=14000/m;ph*=14000/m}pg.push({blob:r.blob,w:r.w,h:r.h,pw,ph})}
   P.set(1,'Đang ghép tệp PDF…');await xDelay(30);P.chk();
   xSave(xPdfBuild(pg,d.name),xName(a===b?d.name+' - trang '+(a+1):s.a===1&&s.b===s.n?d.name:d.name+' (trang '+s.a+'-'+s.b+')','pdf'));closeM()}}
 catch(e){if(e&&e.cancel)return;closeM();alert(e&&e.msg||'Không xuất được. Thiết bị có thể thiếu bộ nhớ hoặc tệp bị hỏng.')}
 finally{xFree(E)}}
async function xSheet(d){const pd=d.type==='pdf';let N=1;
 if(pd){if(!window.pdfjsLib)return alert('Cần kết nối mạng một lần để tải bộ đọc PDF.');
  try{let r=null;try{r=await get('r:'+d.id)}catch(e){}if(Array.isArray(r)&&r.length)N=r.length;else{const t=await pdfOpen(await get('p:'+d.id));N=t.numPages;t.destroy().catch(()=>{})}}catch(e){return alert('Không đọc được PDF này.')}}
 const st={fmt:pd?'pdf':'png',sc:'in',rg:'all',a:1,b:N,pg:1},body=h('div'),what=pd?'trang PDF':d.type==='image'?'ảnh':'trang',
 fix=k=>{let v=Math.round(+st[k]);if(!(v>=1))v=1;if(v>N)v=N;st[k]=v},
 inp=k=>{const i=h('input',{class:'in',type:'number',inputMode:'numeric',min:1,max:N,value:st[k],onchange:()=>{st[k]=i.value;fix(k);i.value=st[k]}});return i},
 pick=()=>{const i=inp('pg'),stp=n=>()=>{st.pg+=n;fix('pg');i.value=st.pg};return h('div',{class:'xr'},h('button',{class:'nb','aria-label':'Trang trước',innerHTML:ic('bk',22),onclick:stp(-1)}),i,h('small',{textContent:'/ '+N}),h('button',{class:'nb r','aria-label':'Trang sau',innerHTML:ic('bk',22),onclick:stp(1)}))},
 go=()=>{if(st.a>st.b){const t=st.a;st.a=st.b;st.b=t}runExport(d,{...st,n:N})},
 rs=()=>{const pf=pd&&st.fmt==='pdf',pn=pd&&st.fmt==='png';
  body.replaceChildren(
   pd?h('div',{},h('div',{class:'lb',innerHTML:ic('pdf',18)+'Định dạng'}),h('div',{class:'row'},opt('pdf','PDF',pf,()=>{st.fmt='pdf';rs()}),opt('im','PNG',pn,()=>{st.fmt='png';rs()}))):null,
   pf&&N>1?h('div',{},h('div',{class:'lb',innerHTML:ic('pg',18)+'Trang xuất'}),h('div',{class:'row'},chip('Tất cả '+N+' trang',st.rg==='all',()=>{st.rg='all';rs()}),chip('Một đoạn',st.rg==='range',()=>{st.rg='range';rs()})),
    st.rg==='range'?h('div',{class:'xr'},h('small',{textContent:'Từ trang'}),inp('a'),h('small',{textContent:'đến'}),inp('b'),h('small',{textContent:'/ '+N})):null):null,
   pn?h('div',{},h('div',{class:'lb',innerHTML:ic('pg',18)+'Trang cần xuất'}),pick()):null,
   h('div',{class:'lb',innerHTML:ic('ft',18)+'Phạm vi'}),
   h('div',{class:'row'},opt('pg','Trong khung',st.sc==='in',()=>{st.sc='in';rs()}),opt('ft','Toàn bộ vùng vẽ',st.sc==='all',()=>{st.sc='all';rs()})),
   h('div',{class:'hn',textContent:st.sc==='in'?'Chỉ phần nằm trong mép '+what+'. Nét vẽ, chữ hay ảnh đặt ngoài mép sẽ không có trong tệp.':'Gồm cả mọi thứ bạn vẽ hoặc đặt ngoài mép '+what+', thu nhỏ vừa đủ để thấy hết, ở độ phân giải cao nhất có thể.'+(pf&&N>1?' Nội dung ngoài lề được gắn vào trang gần nhất.':'')}),
   h('button',{class:'btn',style:'width:100%;margin-top:16px',innerHTML:ic('dl',20)+'<span>'+(pf?'Xuất PDF':'Xuất ảnh PNG')+'</span>',onclick:go}))};
 rs();modal(h('h2',{textContent:'Xuất '+d.name}),body)}
/* ---------- tải ghi âm: AAC, MP4, WAV (chỉ hiện định dạng thiết bị làm được) ---------- */
const xSr=s=>s<=2200?44100:s<=4500?22050:0,AFQ=[96000,88200,64000,48000,44100,32000,24000,22050,16000,12000,11025,8000,7350],
xDec=(ctx,ab)=>new Promise((res,rej)=>{try{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)}catch(e){rej(e)}}),
aEnc=async sr=>{try{if(!window.AudioEncoder||!window.AudioData)return 0;const r=await AudioEncoder.isConfigSupported({codec:'mp4a.40.2',sampleRate:sr,numberOfChannels:1,bitrate:96000});return r&&r.supported?1:0}catch(e){return 0}};
async function audCaps(d){let b=null;try{b=await get('a:'+d.id)}catch(e){}if(!b)return null;
 const t=(b.type||'').toLowerCase(),wav=/wav|wave/.test(t),mp4=/mp4|m4a/.test(t),aac=!mp4&&/aac/.test(t),sr=xSr(d.dur||0),C=window.OfflineAudioContext||window.webkitOfflineAudioContext;let pl=true;try{pl=!t||!!new Audio().canPlayType(t)}catch(e){}
 const dec=!!(C&&sr&&pl),en=dec?await aEnc(sr):0;return{b,t,sr,wav:wav||dec,aac:aac||!!en,mp4:mp4||!!en}}
async function wavBlob(buf,P){const ch=Math.min(2,buf.numberOfChannels),n=buf.length,sr=buf.sampleRate,hd=new ArrayBuffer(44),d=new DataView(hd),w=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i))};
 w(0,'RIFF');d.setUint32(4,36+n*ch*2,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,ch,true);d.setUint32(24,sr,true);d.setUint32(28,sr*ch*2,true);d.setUint16(32,ch*2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*ch*2,true);
 const parts=[hd],C=[];for(let c=0;c<ch;c++)C.push(buf.getChannelData(c));const N=1<<18;
 for(let i=0;i<n;i+=N){P.chk();const len=Math.min(N,n-i),o=new Int16Array(len*ch);for(let j=0;j<len;j++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,C[c][i+j]));o[j*ch+c]=x<0?x*32768:x*32767}parts.push(o.buffer);P.set(i/n);await xDelay(0)}
 return new Blob(parts,{type:'audio/wav'})}
async function aacEnc(buf,ch,P){const sr=buf.sampleRate,fr=[];let err=null;const en=new AudioEncoder({output:c=>{const u=new Uint8Array(c.byteLength);c.copyTo(u);fr.push(u)},error:e=>{err=e}});
 en.configure({codec:'mp4a.40.2',sampleRate:sr,numberOfChannels:ch,bitrate:ch===1?96000:128000});
 const n=buf.length,C=[],N=16384;for(let c=0;c<ch;c++)C.push(buf.getChannelData(c));
 try{for(let i=0;i<n;i+=N){P.chk();if(err)throw err;const len=Math.min(N,n-i),pl=new Float32Array(len*ch);for(let c=0;c<ch;c++)pl.set(C[c].subarray(i,i+len),c*len);
   const ad=new AudioData({format:'f32-planar',sampleRate:sr,numberOfFrames:len,numberOfChannels:ch,timestamp:Math.round(i*1e6/sr),data:pl});en.encode(ad);ad.close();P.set(i/n);while(en.encodeQueueSize>6){await xDelay(4);P.chk()}}
  await en.flush();if(err)throw err}finally{try{en.close()}catch(e){}}
 if(!fr.length)throw 0;return fr}
function aacAdts(fr,sr,ch){const sf=Math.max(0,AFQ.indexOf(sr));return new Blob(fr.map(f=>{const L=f.length+7,o=new Uint8Array(L);o.set([0xFF,0xF1,(1<<6)|(sf<<2)|(ch>>2),((ch&3)<<6)|((L>>11)&3),(L>>3)&255,((L&7)<<5)|0x1F,0xFC]);o.set(f,7);return o}),{type:'audio/aac'})}
function mp4Mux(fr,sr,ch){const u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255),u16=n=>Uint8Array.of(n>>8&255,n&255),Z=n=>new Uint8Array(n),
 cat=(...a)=>{const o=new Uint8Array(a.reduce((s,x)=>s+x.length,0));let p=0;for(const x of a){o.set(x,p);p+=x.length}return o},str=s=>Uint8Array.from(s,c=>c.charCodeAt(0)),
 box=(t,...a)=>{const b=cat(...a);return cat(u32(b.length+8),str(t),b)},fb=(t,v,...a)=>box(t,u32(v),...a);
 const n=fr.length,dur=n*1024,sf=Math.max(0,AFQ.indexOf(sr)),asc=Uint8Array.of((2<<3)|(sf>>1),((sf&1)<<7)|(ch<<3)),dsi=cat(Uint8Array.of(5,asc.length),asc),
 dcd=cat(Uint8Array.of(4,13+dsi.length,0x40,0x15,0,0,0),u32(0),u32(0),dsi),es=cat(Uint8Array.of(3,3+dcd.length+3),u16(0),Uint8Array.of(0),dcd,Uint8Array.of(6,1,2)),
 mp4a=box('mp4a',Z(6),u16(1),Z(8),u16(ch),u16(16),u16(0),u16(0),u32(sr*65536),fb('esds',0,es)),
 ftyp=box('ftyp',str('M4A '),u32(0),str('M4A '),str('mp42'),str('isom')),mdatOff=ftyp.length+8,sz=new Uint8Array(n*4);
 let tot=0;fr.forEach((f,i)=>{sz.set(u32(f.length),i*4);tot+=f.length});
 const stbl=box('stbl',fb('stsd',0,u32(1),mp4a),fb('stts',0,u32(1),u32(n),u32(1024)),fb('stsc',0,u32(1),u32(1),u32(n),u32(1)),fb('stsz',0,u32(0),u32(n),sz),fb('stco',0,u32(1),u32(mdatOff))),
 mat=cat(u32(65536),Z(12),u32(65536),Z(12),u32(0x40000000)),
 mdhd=fb('mdhd',0,u32(0),u32(0),u32(sr),u32(dur),u16(0x55C4),u16(0)),hdlr=fb('hdlr',0,u32(0),str('soun'),Z(12),cat(str('SoundHandler'),Z(1))),
 minf=box('minf',fb('smhd',0,u16(0),u16(0)),box('dinf',fb('dref',0,u32(1),fb('url ',1))),stbl),
 tkhd=fb('tkhd',3,u32(0),u32(0),u32(1),u32(0),u32(dur),Z(8),u16(0),u16(0),u16(0x100),u16(0),mat,u32(0),u32(0)),
 mvhd=fb('mvhd',0,u32(0),u32(0),u32(sr),u32(dur),u32(65536),u16(0x100),Z(10),mat,Z(24),u32(2)),
 moov=box('moov',mvhd,box('trak',tkhd,box('mdia',mdhd,hdlr,minf)));
 return new Blob([ftyp,u32(tot+8),str('mdat'),...fr,moov],{type:'audio/mp4'})}
async function audDown(d,k,c){const ext={aac:'aac',mp4:'mp4',wav:'wav'}[k],mt={aac:'audio/aac',mp4:'audio/mp4',wav:'audio/wav'}[k],t=c.t,
 same=k==='wav'?/wav|wave/.test(t):k==='mp4'?/mp4|m4a/.test(t):(!/mp4|m4a/.test(t)&&/aac/.test(t));
 if(same){xSave(new Blob([c.b],{type:mt}),xName(d.name,ext));closeM();return}
 const P=xProg('Đang chuyển sang '+k.toUpperCase()+'…',1);
 try{P.set(null,'Đang giải mã âm thanh…');const C=window.OfflineAudioContext||window.webkitOfflineAudioContext,buf=await xDec(new C(1,1,c.sr),await c.b.arrayBuffer());P.chk();P.set(0,'Đang chuyển đổi…');
  let out;if(k==='wav')out=await wavBlob(buf,P);else{const ch=Math.min(2,buf.numberOfChannels),fr=await aacEnc(buf,ch,P);out=k==='aac'?aacAdts(fr,buf.sampleRate,ch):mp4Mux(fr,buf.sampleRate,ch)}
  P.chk();xSave(out,xName(d.name,ext));closeM()}
 catch(e){if(e&&e.cancel)return;closeM();alert('Không chuyển được bản ghi này. Thiết bị có thể thiếu bộ nhớ hoặc chưa hỗ trợ định dạng.')}}
async function audMenu(d,box){let c=null;try{c=await audCaps(d)}catch(e){}if(!c||!box.isConnected)return;const L=[['aac','AAC'],['mp4','MP4'],['wav','WAV']].filter(([k])=>c[k]);if(!L.length)return;
 box.append(h('div',{class:'lb',innerHTML:ic('dl',18)+'Tải về'}),h('div',{class:'row'},L.map(([k,t])=>chip(t,false,()=>audDown(d,k,c),'dl'))))}
