'use strict';
// 02-home.js: Lưu trữ IndexedDB, tiện ích giao diện, màn hình chính. Dòng 439-495 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: home, paperCss, card, rnm, folderCard, seedFree, sec, pinchHome, list, idb, tx, get, put, del, M, cur, q, S, pdf, stylus, sv, RC, AP, cmT, modal,
//   closeM, chip, opt, tile, ask, ago, snT, snack, HX, rb, swatches, flt, hsc, rl, colK, rzT, COL, DEN, den, SRT, sortK, setSrt, ok0, SORTS, inCur, desc,
//   SX
/* storage */
const idb=new Promise((r,j)=>{const q=indexedDB.open('noteri',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const tx=async(m,f)=>{const d=await idb;return new Promise((res,rej)=>{const t=d.transaction('k',m),q=f(t.objectStore('k'));t.oncomplete=()=>res(q.result);t.onerror=()=>rej(q.error||t.error);t.onabort=()=>rej(t.error||q.error||new Error('abort'))})};
const get=k=>tx('readonly',s=>s.get(k)),put=(k,v)=>tx('readwrite',s=>s.put(v,k)),del=k=>tx('readwrite',s=>s.delete(k));
let pdfP=null;const pdfEnsure=()=>{const W='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc=W+'pdf.worker.min.js';return Promise.resolve(true)}return pdfP||(pdfP=new Promise(r=>{const s=document.createElement('script');s.src=W+'pdf.min.js';s.onload=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc=W+'pdf.worker.min.js';r(true)};s.onerror=()=>{pdfP=null;s.remove();r(false)};document.head.appendChild(s)}))};
let M={folders:[],docs:[]},cur=null,q='',S=null,pdf=null,stylus=false;
const sv=()=>put('meta',M);
/* ui helpers */
let RC=null,AP=null;let cmT;const modal=(...c)=>{const m=$('#modal'),sh=h('div',{class:'sheet'},h('div',{class:'gr'}),...c);clearTimeout(cmT);m.replaceChildren(sh);m.className='on';m.onclick=e=>{if(e.target===m)closeM()};let y0=null,dy=0;sh.ontouchstart=e=>{if(e.target.closest('.gr')){y0=e.touches[0].clientY;dy=0}};sh.ontouchmove=e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition='none';sh.style.transform=`translateY(${dy}px)`}};sh.ontouchend=()=>{if(y0==null)return;sh.style.transition='transform .25s';if(dy>110)closeM();else sh.style.transform='';y0=null}};
const closeM=()=>{const m=$('#modal');if(!m.classList.contains('on'))return;if(RC)RC.bye();m.classList.add('out');clearTimeout(cmT);cmT=setTimeout(()=>{m.className='';m.replaceChildren()},230)};
const chip=(t,on,f,i)=>{const b=h('button',{class:'chip'+(on?' on':''),onclick:f});if(i)b.innerHTML=ic(i,18);b.append(t);return b};
const opt=(i,t,on,f)=>h('button',{class:'opt'+(on?' on':''),onclick:f,innerHTML:ic(i,24)+'<span>'+t+'</span>'});
const tile=(i,t,a,b,f,n)=>h('button',{class:'tile',style:`--a:${a};--b:${b};--i:${n||0}`,onclick:f,innerHTML:`<span class="ti">${ic(i,28)}</span><span>${t}</span>`});
const ask=(t,v,f)=>{const ok=()=>{const n=i.value.trim();if(n){closeM();f(n)}},i=h('input',{class:'in',value:v,onkeydown:e=>{if(e.key==='Enter')ok()}});modal(h('h2',{textContent:t}),i,h('button',{class:'btn',style:'width:100%;margin-top:14px',innerHTML:ic('ck',20)+'<span>Lưu</span>',onclick:ok}));setTimeout(()=>{i.focus();i.select()},380)};
const ago=t=>{const d=(Date.now()-t)/6e4;if(d<1)return'Vừa xong';if(d<60)return Math.floor(d)+' phút trước';if(d<1440)return Math.floor(d/60)+' giờ trước';if(d<10080)return Math.floor(d/1440)+' ngày trước';return new Date(t).toLocaleDateString('vi-VN')};
let snT;const snack=(t,act,f)=>{const s=$('#snack');s.replaceChildren(h('span',{textContent:t}),act?h('button',{textContent:act,onclick:()=>{f();s.className=''}}):'');s.className='on';clearTimeout(snT);snT=setTimeout(()=>s.className='',6000)};
const HX=/^#[0-9a-f]{6}$/i,rb=(val,list,f,sz)=>h('label',{class:'sw rb'+(val&&!list.includes(val)?' on':''),style:'--cc:'+(HX.test(val||'')?val:'#888')+(sz?`;width:${sz}px;height:${sz}px`:''),'aria-label':'Màu tùy chọn'},h('input',{type:'color',value:HX.test(val||'')?val:'#888888',onchange:e=>f(e.target.value)})),
swatches=(list,val,f,cu)=>h('div',{class:'row'},list.map(c=>h('button',{class:'sw'+(c===val?' on':''),style:'background:'+c,'aria-label':c,onclick:()=>f(c)})),cu?rb(val,list,f):null);
/* home */
let flt='all',hsc=0;
function home(keep){const r=$('#home');r.replaceChildren();
 const f=cur&&M.folders.find(x=>x.id===cur),nP=M.docs.filter(d=>!d.deleted).length;
 const inp=h('input',{class:'q',placeholder:'Tìm trang, PDF, thư mục…',value:q,oninput:e=>{q=e.target.value;xq.hidden=!q;list()}});
 const xq=h('button',{class:'xq',hidden:!q,'aria-label':'Xóa tìm kiếm',innerHTML:ic('x',18),onclick:()=>{q='';inp.value='';xq.hidden=true;list();inp.focus()}});
 r.append(h('header',{},f?h('div',{class:'fh'},I('bk',{onclick:()=>history.back(),'aria-label':'Quay lại','data-drop':'up'}),h('div',{},h('b',{textContent:f.name}),h('small',{textContent:(M.docs.filter(d=>d.folder===f.id&&!d.deleted).length+M.folders.filter(y=>!y.deleted&&y.parent===f.id).length)+' mục'}))):h('div',{class:'wm'},h('b',{textContent:'NOTERI'})),I('st',{class:'ib sbt',onclick:settings,'aria-label':'Cài đặt'})),h('div',{class:'sbx'},h('span',{class:'si',innerHTML:ic('se',20)}),inp,xq),h('div',{id:'list'}),h('button',{class:'fab','aria-label':'Thêm',onclick:fabMenu,innerHTML:ic('pl',30)}));list();if(keep)r.scrollTop=hsc;pinchHome(r);bindDrag(r)}
function paperCss(d){const pc=d.paper||'#fff';let s=`background-color:${pc};`;if(d.th)return s+`background-image:url(${d.th});background-size:cover;background-position:top`;
 if(d.type!=='pdf'&&(d.pattern==='ruled'||d.pattern==='grid')){const[a,b]=RAT[d.ratio]||[3,4],m=2400/Math.max(a,b),H=b*m,W=a*m,st={S:70,M:100,L:140}[d.sp||'M'],ln=lum(pc)<.5?'rgba(255,255,255,.22)':'rgba(0,0,0,.15)',im=[`linear-gradient(to bottom,transparent calc(100% - 1px),${ln} 0)`],sz=[`100% ${st/H*100}%`];if(d.pattern==='grid'){im.push(`linear-gradient(to right,transparent calc(100% - 1px),${ln} 0)`);sz.push(`${st/W*100}% 100%`)}s+=`background-image:${im.join(',')};background-size:${sz.join(',')}`}return s}
function card(d,i){if(d.type==='audio')return audCard(d,i);const pdf=d.type==='pdf',im=d.type==='image',[a,b]=pdf?[3,4]:RAT[d.ratio]||[3,4];
 return h('div',{class:'doc','data-id':d.id,style:'--i:'+Math.min(i,14),onclick:()=>open(d.id)},
  h('div',{class:'pp'+(pdf?' pdf':''),style:`aspect-ratio:${im?(d.car||.75):a+'/'+b};${paperCss(d)}`},pdf?h('span',{class:'bd',innerHTML:ic('pdf',12)+'PDF'}):'',d.type==='note'?h('span',{class:'bd nb',innerHTML:ic('nt',12)+'Note'}):'',pdf&&!d.th?h('span',{class:'wp',innerHTML:ic('pdf',38)}):''),
  h('div',{class:'mt'},h('div',{style:'min-width:0;flex:1'},h('div',{class:'nm',textContent:d.name}),h('div',{class:'dt',textContent:ago(d.updated)})),h('button',{class:'mb','aria-label':'Tùy chọn',innerHTML:ic('mo',20),onclick:e=>{e.stopPropagation();docMenu(d)}})))}
const rl=()=>{const L=$('#list');if(L){L.classList.add('na');list()}};
function rnm(el,o,done){let fin=0;const inp=h('input',{class:'rni',value:o.name,maxLength:80,onclick:e=>e.stopPropagation(),onpointerdown:e=>e.stopPropagation()}),ok=()=>{if(fin)return;fin=1;const n=inp.value.trim();if(n&&n!==o.name){o.name=n;sv()}done()};
 inp.onblur=ok;inp.onkeydown=e=>{if(e.key==='Enter')inp.blur();else if(e.key==='Escape'){inp.value=o.name;inp.blur()}};el.replaceWith(inp);inp.focus();inp.select()}
function folderCard(x,i){const dn=den(),ds=M.docs.filter(d=>d.folder===x.id&&!d.deleted).sort((a,b)=>b.updated-a.updated),sf=M.folders.filter(y=>!y.deleted&&y.parent===x.id).slice(0,5),pv=[];let u=0;for(const d of ds){const w=d.type==='audio'?1:2;if(pv.length<(dn===5?6:5)&&u+w<=(dn===5?10:6)&&(d.type==='audio'||pv.filter(t=>t.type!=='audio').length<(dn===5?5:3))){u+=w;pv.push(d)}}
 const n=pv.length,mx=pv.some(d=>d.type==='audio'),pos=mx||n>3?null:{1:[1],2:[0,2],3:[0,1,2]}[n]||[],ws=pv.map(d=>d.type==='audio'?18:44),sx=[];let tot=0;if(mx){ws.forEach((w,j)=>{if(j)tot+=.62*(w+ws[j-1])/2;sx.push(tot)});const c=tot/2;sx.forEach((v,j)=>sx[j]=v-c)}
 return h('div',{class:'fold','data-id':x.id,style:`--i:${Math.min(i,14)};--c:${x.color};color:${lum(x.color)>.6?'#2E2822':'#FFF8EE'}`,onclick:()=>{cur=x.id;q='';history.pushState({cur:x.id},'');home()}},h('div',{class:'bk'}),h('div',{class:'pgs'},...pv.map((d,j)=>d.type==='audio'?h('div',{class:'mini fn au',style:`--x:${sx[j].toFixed(1)}%;--r:${((j-(n-1)/2)*5).toFixed(1)}deg`},...wfR(d.wf,9).map(v=>h('span',{style:`width:${Math.max(24,Math.min(100,v))}%`}))):h('div',{class:'mini '+(mx?'fn':pos?'p'+pos[j]:'q'),style:paperCss(d)+(mx?`;--x:${sx[j].toFixed(1)}%;--r:${((j-(n-1)/2)*5).toFixed(1)}deg`:pos?'':`;--j:${j};--m:${n}`)}))),h('div',{class:'shf'},...sf.map((v,j)=>h('i',{class:'bkr',style:`--bc:${v.color};--j:${j}`}))),
  h('div',{class:'fr'},h('i',{class:'fi',innerHTML:ic(x.ic||'fo',28)}),h('div',{class:'nm',textContent:x.name}),h('div',{class:'dt',textContent:(ds.length+sf.length)+' mục'}),h('button',{class:'mb','aria-label':'Tùy chọn',innerHTML:ic('mo',20),onclick:e=>{e.stopPropagation();folderSheet(x)}})))}
const colK=()=>innerWidth>=900?3:innerWidth>=620?2:1;let rzT;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(!$('#home').hidden&&$('#list'))list()},150)});
const COL=lsj('noteri.col',{}),DEN=lsj('noteri.den',{}),den=()=>DEN[cur||'r']||2;
const SRT=lsj('noteri.srt',{}),sortK=()=>{const k=cur||'r';return SRT[k]||(k==='r'&&T.sort==='name'?'name':'new')},setSrt=v=>{SRT[cur||'r']=v;lss('noteri.srt',JSON.stringify(SRT))};
const ok0=x=>x.o==null?-1e18:x.o,SORTS={new:(a,b)=>b.updated-a.updated,old:(a,b)=>a.updated-b.updated,name:(a,b)=>a.name.localeCompare(b.name,'vi'),free:(a,b)=>ok0(a)-ok0(b)||(b.updated||0)-(a.updated||0)};
const inCur=()=>[M.folders.filter(x=>!x.deleted&&(x.parent||null)===cur),M.docs.filter(d=>!d.deleted&&(d.folder||null)===cur)];
function seedFree(){const[fs,ds]=inCur(),cm=SORTS[sortK()];ds.sort(cm);if(sortK()==='name')fs.sort(cm);ds.forEach((d,i)=>d.o=i);fs.forEach((x,i)=>x.o=i)}
const desc=id=>[id,...M.folders.filter(x=>x.parent===id).flatMap(x=>desc(x.id))];
let SX=null;function sec(ik,t,key,body,extra){const c=!!COL[key],hd=h('div',{class:'sec cl'+(c?' c':''),innerHTML:(ik?ic(ik,18):'<i class="sbr"></i>')+'<span>'+t+'</span>',onclick:()=>{COL[key]=!c;lss('noteri.col',JSON.stringify(COL));SX=key;list()}});if(extra){extra.addEventListener('click',e=>e.stopPropagation());hd.append(extra)}hd.append(h('i',{class:'chv',innerHTML:ic('bk',16)}));return c?[hd]:(SX===key&&(body.classList.add('xp'),SX=null),[hd,body])}
function pinchHome(r){let d0=0,l0=2;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY),set=n=>{if(DR)return;n=Math.max(1,Math.min(5,n));if(n===den())return;DEN[cur||'r']=n;lss('noteri.den',JSON.stringify(DEN));$('#list').classList.add('na');hap();const y=r.scrollTop;list();r.scrollTop=y;{const L=$('#list');L.classList.remove('dz');void L.offsetWidth;L.classList.add('dz')}};
 r.ontouchstart=e=>{if(e.touches.length===2){if(DR0){clearTimeout(DR0.tm);DR0=null}if(!DR){d0=dist(e.touches);l0=den()}}};r.ontouchmove=e=>{if(!DR&&e.touches.length===2&&d0)set(l0-Math.round(Math.log2(dist(e.touches)/d0)*2.2))};r.ontouchend=e=>{if(e.touches.length<2)d0=0};r.onwheel=e=>{if(e.ctrlKey){e.preventDefault();set(den()+(e.deltaY>0?1:-1))}}}
function list(){const L=$('#list');L.replaceChildren();L.style.setProperty('--n',den()*colK());L.dataset.n=den();const nq=norm(q),live=M.docs.filter(d=>!d.deleted);
 let fs=nq?[]:M.folders.filter(x=>!x.deleted&&(x.parent||null)===cur),ds=live.filter(d=>nq?norm(d.name+' '+d.txt).includes(nq):d.folder===cur);
 if(nq)fs=M.folders.filter(x=>!x.deleted&&norm(x.name).includes(nq));
 if(!fs.length&&!ds.length){L.innerHTML=`<div class="empty"><p>${nq?'Không tìm thấy kết quả.':'Chưa có gì ở đây. Nhấn <i class="mfab">'+ic('pl',17)+'</i> để tạo trang, note, thư mục hoặc nhập PDF.'}</p></div>`;return}
 const sk=sortK(),cm=SORTS[sk];ds.sort(cm);if(sk==='name'||sk==='free')fs.sort(cm);L.dataset.k=nq?'':sk;
 if(fs.length)L.append(...sec('fo','Thư mục','f',h('div',{class:'fgrid'},fs.map((x,i)=>folderCard(x,i)))));
 if(ds.length){const shown=nq?ds:ds.filter(d=>flt==='all'||(d.type!=='audio'&&(flt==='pdf')===(d.type==='pdf'))),sg=h('div',{class:'seg'},[['all','gd','Tất cả'],['page','pg','Trang'],['pdf','pdf','PDF']].map(([k,i,t])=>h('button',{class:flt===k?'on':'',innerHTML:ic(i,15)+t,onclick:()=>{flt=k;list()}})));
  L.append(...sec('','Tệp','d',shown.length?h('div',{class:'mas'},shown.map((d,i)=>card(d,i))):h('div',{class:'empty',style:'padding:24px 0'},'Chưa có mục nào ở đây.'),nq?'':sg))}}

