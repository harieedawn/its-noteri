'use strict';
// 07-editor.js: Mở/đóng trình soạn, lưu, biến đổi và vừa khung. Dòng 944-985 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: load, commit, updUR, flush, open, closeEd, RV, fitT, fit, layout, clampT, settle, pgi, stage, c0, c1, x0, x1, world, els, obj, req, rep, repS, ser,
//   touch, undo, redo, svT, dirty, svErr, lkUp, zlo, mmg, rub, W2, sp
/* editor */
const pgi=$('#pgi'),stage=$('#stage'),c0=$('#c0'),c1=$('#c1'),x0=c0.getContext('2d'),x1=c1.getContext('2d'),world=$('#world'),els=new Map();
const obj=id=>S&&S.objs.find(o=>o.id===id),req=()=>{if(S&&!S.raf)S.raf=requestAnimationFrame(draw)};
const rep=(k,v)=>k==='b'||k==='dim'||k==='nw'||k==='src'?undefined:v,repS=(k,v)=>k==='b'||k==='dim'||k==='nw'?undefined:v;
const ser=()=>({s:S.strokes.slice(),o:JSON.stringify(S.objs,rep),e:JSON.stringify(S.edges)});
function load(d){S.strokes=d.s.slice();S.strokes.forEach(s=>s.dim=0);S.objs=JSON.parse(d.o);S.edges=JSON.parse(d.e||'[]');if(S.selE&&!S.edges.some(e=>e.id===S.selE))S.selE=null;S.objs.forEach(o=>{if(o.k==='img')o.src=S.imgs.get(o.id)});S.inkV++;if(!obj(S.sel))S.sel=null;renderObjs();bar();dirty();updUR();req()}
const touch=()=>{if(!S.pre)S.pre=ser()};
function commit(){if(S.pre){S.hist.push(S.pre);if(S.hist.length>200)S.hist.shift();S.fut=[];S.pre=null;dirty();updUR()}}
const undo=()=>{if(!S)return;if(S.edit&&endEdit()===true)return;if(!S.hist.length)return;S.fut.push(ser());load(S.hist.pop());hap()},redo=()=>{if(!S)return;if(S.edit&&endEdit()===true)return;if(!S.fut.length)return;S.hist.push(ser());load(S.fut.pop());hap()};
function updUR(){$('#un').disabled=!S.hist.length;$('#re').disabled=!S.fut.length}
let svT;const dirty=()=>{clearTimeout(svT);svT=setTimeout(flush,800)};
let svErr=0;async function flush(fin){if(!S)return;clearTimeout(svT);const m=S.meta;try{thumb()}catch(e){}m.updated=Date.now();m.txt=norm(S.objs.map(o=>o.txt||'').join(' '));try{await put('d:'+S.id,JSON.stringify({...S.c,strokes:S.strokes,objs:S.objs,edges:S.edges},repS));await sv()}catch(e){if(Date.now()-svErr>20000){svErr=Date.now();snack('Không lưu được. Bộ nhớ có thể đã đầy.')}}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)flush(1)});addEventListener('pagehide',flush);
async function open(id){aStop();const meta=M.docs.find(d=>d.id===id);if(meta.type==='pdf')snack('Đang mở PDF…');let c=await get('d:'+id);c=typeof c==='string'?JSON.parse(c):c||{strokes:[],objs:[]};
 if(meta.type!=='pdf'){meta.pattern=c.pattern;meta.sp=c.sp}S={id,meta,pdf:meta.type==='pdf',strokes:c.strokes||[],objs:c.objs||[],edges:c.edges||[],selE:null,mm:false,cp:null,tool:meta.type==='note'&&T.nqt?'text':'select',compact:!(meta.type==='note'&&T.nqt),note:meta.type==='note',sel:null,edit:null,hist:[],fut:[],pre:null,tr:{s:1,x:0,y:0},f:1,inited:false,zoomed:false,live:null,guides:[],fr:0,sheets:[],popOn:null,inkV:0,imgs:new Map(),ic:null,busyN:0,tot:0,tt:0,fl:new Set(),nr:0,er:0,gen:0,sp:0,dr:1,py:0,pt:0,animId:0,pm:[],c:{cw:c.cw,ch:c.ch,fh:c.fh,ratio:c.ratio,pattern:c.pattern,sp:c.sp,paper:c.paper||meta.paper}};S.objs.forEach(o=>{if(o.k==='img')S.imgs.set(o.id,o.src)});
 if(S.pdf){try{if(!window.pdfjsLib)throw 0;pdf=await pdfOpen(await get('p:'+id));const rs=await pdfRat(id,pdf);let y=0;for(const r of rs){const hh=SW*r;S.sheets.push({y,h:hh});y+=hh+48}S.W=SW;S.H=y-48}catch(e){if(pdf){try{pdf.destroy().catch(()=>{})}catch(x){}pdf=null}S=null;return alert('Không mở được PDF này. Hãy kiểm tra kết nối mạng hoặc tệp.')}}
 else if(meta.type==='image'){try{const bl=await get('i:'+id);S.base=await createImageBitmap(bl)}catch(e){S=null;return alert('Không mở được ảnh này.')}S.W=c.cw;S.fh=c.fh||c.ch;S.H=S.fh}
 else{const[a,b]=RAT[S.c.ratio]||[3,4],k=2400/Math.max(a,b);S.W=a*k;S.H=b*k}
 $('#home').hidden=true;$('#ed').hidden=false;setTimeout(()=>{if(S)S.ready=1},700);$('#snack').className='';history.pushState({e:1,cur:cur},'');$('#ttl').textContent=meta.name;TL=meta.type==='note'?TLA.filter(t=>'select,text,img'.includes(t[0])):meta.type==='image'?TLA.filter(t=>['select','pen','hl','erase','text','note'].includes(t[0])):TLA;tools();renderObjs();bar();pop();layout();updUR();
 wl();const cs=getComputedStyle(document.documentElement);S.pr=cs.getPropertyValue('--pr').trim()||'#C4673F'}
function closeEd(){if(!S)return;wlOff();if(S.edit)endEdit();flush(1);if(S.pdf){clearTimeout(S.pwt);for(const q of S.sheets){if(q.tk)try{q.tk.cancel()}catch(e){}if(q.cv)q.cv.width=q.cv.height=0;if(q.th)q.th.width=q.th.height=0}}if(pdf){try{pdf.destroy().catch(()=>{})}catch(e){}}if(S.base&&S.base.close)try{S.base.close()}catch(e){}pdf=null;S=null;els.forEach(e=>e.remove());els.clear();$('#ed').hidden=true;$('#home').hidden=false;P.clear();g=null;pgi.classList.remove('on');home(1)}
history.replaceState({cur:null},'');
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(!S||!S.edit)return;const hh=visualViewport.height;if(hh<S.vh0*.8)S.kb=1;else if(S.kb&&hh>=S.vh0*.92){S.kb=0;endEdit()}});
onpopstate=e=>{if(!$('#ed').hidden){closeEd();return}const st=e.state,c=st&&st.cur!==undefined?st.cur:null;if(c!==cur){cur=c;q='';home()}};
$('#bk').innerHTML=ic('bk');$('#bk').onclick=()=>history.back();$('#un').innerHTML=ic('un');$('#un').onclick=undo;$('#re').innerHTML=ic('re');$('#re').onclick=redo;$('#ft').innerHTML=ic('ft');$('#ft').onclick=()=>fit(true,true);
const lkUp=()=>{$('#lk').innerHTML=ic(T.lk?'lk':'ul');$('#lk').classList.toggle('on',!!T.lk)};$('#lk').onclick=()=>{T.lk=!T.lk;saveT();lkUp();hap();if(T.lk&&S)magnet()};lkUp();
$('#ttl').onclick=()=>ask('Đổi tên',S.meta.name,n=>{S.meta.name=n;$('#ttl').textContent=n;dirty()});
/* transform: ONE fit function used everywhere */
function RV(){return stage.clientHeight>520?80:54}
function fitT(keep){const w=stage.clientWidth,hh=stage.clientHeight-RV();if(S.pdf){const s=w*.92/S.W;let y=hh*.04;if(keep){const oh=S.hh||hh,wy=(oh/2-S.tr.y)/S.tr.s,t={s,x:0,y:hh/2-wy*s};clampT(t);y=t.y}return{s,x:(w-S.W*s)/2,y}}const m=.07,s=Math.min(w*(1-2*m)/S.W,hh*(1-2*m)/S.H);return{s,x:(w-S.W*s)/2,y:(hh-S.H*s)/2+4}}
/* keep=true: chỉ đưa zoom về mặc định, PDF giữ nguyên vị trí đang xem (không nhảy về trang đầu) */
function fit(a,keep){const t=fitT(keep);S.f=t.s;S.zoomed=false;if(!a){S.animId=0;S.tr=t;req();return}anim(t,300,1)}
function layout(){const d=devicePixelRatio||1;c0.width=c1.width=stage.clientWidth*d;c0.height=c1.height=stage.clientHeight*d;S.f=fitT().s;if(!S.inited||(!S.zoomed&&!S.edit))fit(0,S.inited);S.hh=stage.clientHeight-RV();S.inited=true;req()}
new ResizeObserver(()=>S&&layout()).observe(stage);
/* Lề ngoài trang tính bằng PIXEL MÀN HÌNH, cố định ở mọi mức zoom (bằng lề khi zoom-out tối đa); zlo = mức zoom nhỏ nhất */
const zlo=()=>.15*stage.clientWidth/S.W+.255*S.f,mmg=()=>Math.max(0,.425*stage.clientWidth-.1275*S.W*S.f);
function clampT(t=S.tr){const s=t.s,vw=stage.clientWidth,vh=stage.clientHeight,Bx=mmg()/s,By=Bx,ww=vw/s,wh=vh/s;
 if(S.W+2*Bx>=ww){const L=Math.min(S.W+Bx-ww,Math.max(-Bx,-t.x/s));t.x=-L*s}else t.x=(vw-S.W*s)/2;
 if(S.H+2*By>=wh){const T0=Math.min(S.H+By-wh,Math.max(-By,-t.y/s));t.y=-T0*s}else t.y=(vh-RV()-S.H*s)/2+4}
const rub=v=>{const lo=zlo(),hi=10*S.f;return v<lo?Math.max(lo*.72,lo*Math.pow(v/lo,.45)):v>hi?Math.min(hi*1.4,hi*Math.pow(v/hi,.45)):v};
function settle(){const lo=zlo(),hi=10*S.f,t=S.tr,ns=Math.min(hi,Math.max(lo,t.s));if(Math.abs(ns-t.s)<1e-6)return false;const cx=stage.clientWidth/2,cy=stage.clientHeight/2,wx=(cx-t.x)/t.s,wy=(cy-t.y)/t.s;anim({s:ns,x:cx-wx*ns,y:cy-wy*ns},320,0);return true}
const W2=(x,y)=>[(x-S.tr.x)/S.tr.s,(y-S.tr.y)/S.tr.s],sp=e=>{const r=stage.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
