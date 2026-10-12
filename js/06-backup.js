'use strict';
// 06-backup.js: Sao lưu và khôi phục tệp .noteri. Dòng 885-943 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: bkOut, bkRead, bkAdd, bkRep, bkDlg, bkIn, bkPick, BKM, bkVal, BKK
/* ---------- sao lưu và khôi phục .noteri ----------
   Tệp: 8 byte "NOTERI",1,0; rồi các mục [loại u8][độ dài khóa u16][độ dài mime u16][kích thước u64][khóa][mime][dữ liệu]; mục đầu 'manifest', mục cuối 'end'. */
const BKM=[78,79,84,69,82,73,1,0];
async function bkOut(fid){const P=xProg('Đang sao lưu…',1);
 try{const all=!fid,ids=all?null:desc(fid),FO=M.folders.filter(f=>!f.deleted&&(all||ids.includes(f.id))).map(f=>({...f})),DO=M.docs.filter(d=>!d.deleted&&(all||ids.includes(d.folder))).map(d=>({...d}));
  if(!all){const r=FO.find(f=>f.id===fid);if(r)r.parent=null}
  const E8=new TextEncoder(),parts=[Uint8Array.from(BKM)];let n=0;
  const add=(key,data,mime)=>{const bl=typeof data==='string'?new Blob([data]):data instanceof Blob?data:new Blob([data]),kb=E8.encode(key),mb=E8.encode(mime||bl.type||''),hd=new Uint8Array(13+kb.length+mb.length),v=new DataView(hd.buffer);
   v.setUint8(0,typeof data==='string'?0:1);v.setUint16(1,kb.length);v.setUint16(3,mb.length);v.setUint32(5,Math.floor(bl.size/4294967296));v.setUint32(9,bl.size>>>0);hd.set(kb,13);hd.set(mb,13+kb.length);parts.push(hd,bl);n++};
  const man={app:'noteri',fmt:1,ver:VER,t:Date.now(),scope:all?'all':'folder',root:fid||null,folders:FO,docs:DO};
  if(all){man.set={};for(const k of['t','col','den','srt']){const v=localStorage.getItem('noteri.'+k);if(v!=null)man.set[k]=v}}
  add('manifest',JSON.stringify(man));
  for(let i=0;i<DO.length;i++){P.chk();const d=DO[i];P.set(i/Math.max(1,DO.length),(i+1)+' / '+DO.length+' mục');
   const dv=await get('d:'+d.id);if(dv!=null)add('d:'+d.id,typeof dv==='string'?dv:JSON.stringify(dv));
   const bk=d.type==='pdf'?'p:':d.type==='image'?'i:':d.type==='audio'?'a:':null;if(bk){const x=await get(bk+d.id);if(x)add(bk+d.id,x,x.type||(bk==='p:'?'application/pdf':''))}}
  if(all){const bg=await get('bg');if(typeof bg==='string')add('bg',bg)}
  const cnt=n;add('end',JSON.stringify({n:cnt}));P.chk();
  xSave(new Blob(parts,{type:'application/octet-stream'}),xName(all?'Noteri '+new Date().toISOString().slice(0,10):(FO.find(f=>f.id===fid)||{}).name||'Thu muc','noteri'));closeM()}
 catch(e){if(e&&e.cancel)return;closeM();alert('Không sao lưu được. Bộ nhớ có thể đã đầy.')}}
async function bkRead(file,P){const h8=new Uint8Array(await file.slice(0,8).arrayBuffer());
 if(h8.length<8||BKM.some((v,i)=>i<6&&h8[i]!==v))throw{msg:'Đây không phải tệp sao lưu NOTERI (.noteri).'};
 if(h8[6]>1)throw{msg:'Tệp này do phiên bản NOTERI mới hơn tạo ra. Hãy cập nhật ứng dụng rồi thử lại.'};
 const D8=new TextDecoder(),ents=new Map();let p=8,man=null,end=null;
 while(p<file.size){P.chk();const hb=new DataView(await file.slice(p,p+13).arrayBuffer());if(hb.byteLength<13)throw{msg:'Tệp sao lưu bị cắt dở.'};
  const kind=hb.getUint8(0),kl=hb.getUint16(1),ml=hb.getUint16(3),size=hb.getUint32(5)*4294967296+hb.getUint32(9),mt=new Uint8Array(await file.slice(p+13,p+13+kl+ml).arrayBuffer());
  if(mt.length<kl+ml)throw{msg:'Tệp sao lưu bị cắt dở.'};const key=D8.decode(mt.subarray(0,kl)),mime=D8.decode(mt.subarray(kl)),st=p+13+kl+ml;if(st+size>file.size)throw{msg:'Tệp sao lưu bị cắt dở (thiếu dữ liệu).'};
  if(key==='manifest')man=JSON.parse(await file.slice(st,st+size).text());else if(key==='end')end=JSON.parse(await file.slice(st,st+size).text());else ents.set(key,{kind,mime,st,size});p=st+size}
 if(!man||man.app!=='noteri'||!Array.isArray(man.docs)||!Array.isArray(man.folders))throw{msg:'Tệp sao lưu không hợp lệ.'};
 if(!end||end.n!==ents.size+1)throw{msg:'Tệp sao lưu bị thiếu dữ liệu.'};
 return{file,man,ents,size:file.size}}
const bkVal=async(R,key,k)=>{const en=R.ents.get(key);if(!en)return undefined;const bl=R.file.slice(en.st,en.st+en.size,en.mime);if(en.kind===0)return bl.text();const ab=await bl.arrayBuffer();return k==='p:'?ab:new Blob([ab],{type:en.mime})};
const BKK=['d:','p:','i:','a:'];
async function bkAdd(R,P){const m=R.man,fm=new Map(),wr=[];m.folders.forEach(f=>fm.set(f.id,uid()));
 try{const nf=m.folders.map(f=>{const o={...f,id:fm.get(f.id),parent:f.parent&&fm.has(f.parent)?fm.get(f.parent):cur};delete o.o;return o}),nd=[];
  for(let i=0;i<m.docs.length;i++){P.chk();const d=m.docs[i],id=uid();P.set(i/Math.max(1,m.docs.length),(i+1)+' / '+m.docs.length+' mục');
   for(const k of BKK){const v=await bkVal(R,k+d.id,k);if(v!==undefined){await put(k+id,v);wr.push(k+id)}}
   const o={...d,id,folder:d.folder&&fm.has(d.folder)?fm.get(d.folder):cur};delete o.o;delete o.deleted;nd.push(o)}
  P.chk();M.folders.push(...nf);M.docs.push(...nd);await sv()}
 catch(e){for(const k of wr)try{await del(k)}catch(x){}throw e}}
async function bkRep(R,P){const m=R.man,old=await tx('readonly',s=>s.getAllKeys()),keep=new Set(['meta']),wr=[],sw=0,docs=m.docs.map(d=>{const o={...d};delete o.deleted;return o}),folders=m.folders.filter(f=>!f.deleted);
 try{if(navigator.storage&&navigator.storage.estimate){const es=await navigator.storage.estimate();if(es&&es.quota&&es.usage+R.file.size*1.1>es.quota)throw{msg:'Không đủ dung lượng để khôi phục.'}}
  for(let i=0;i<docs.length;i++){P.chk();const d=docs[i],id=uid();P.set(i/Math.max(1,docs.length),(i+1)+' / '+docs.length+' mục');for(const k of BKK){const v=await bkVal(R,k+d.id,k);if(v!==undefined){await put(k+id,v);wr.push(k+id)}}d.id=id}
  const bg=await bkVal(R,'bg','b');P.chk();const nm={folders,docs};await put('meta',nm);sw=1;
  /* từ đây không hủy được nữa: chuyển sang dữ liệu mới rồi dọn dữ liệu cũ */
  M=nm;for(const k of wr)keep.add(k);try{if(typeof bg==='string'){await put('bg',bg);keep.add('bg')}else await del('bg')}catch(e){}
  for(const k of['t','col','den','srt']){const v=m.set&&m.set[k];try{if(typeof v==='string'&&lso(v)!=null)localStorage.setItem('noteri.'+k,v);else localStorage.removeItem('noteri.'+k)}catch(e){}}
  for(const k of old)if(!keep.has(k))try{await del(k)}catch(e){}}
 catch(e){if(!sw)for(const k of wr)try{await del(k)}catch(x){}throw e}}
function bkDlg(R){const m=R.man,all=m.scope==='all',fo=cur&&M.folders.find(x=>x.id===cur);let mode='add';
 const ro=(m.folders.find(f=>f.id===m.root)||{}).name||'',body=h('div'),
 go=async()=>{if(mode==='rep'&&!confirm('Thay thế toàn bộ dữ liệu hiện có bằng bản sao lưu này? Không thể hoàn tác.'))return;const P=xProg(mode==='rep'?'Đang thay thế dữ liệu…':'Đang khôi phục…');
  try{if(mode==='rep'){await bkRep(R,P);location.reload()}else{await bkAdd(R,P);closeM();home(1)}}
  catch(e){if(e&&e.cancel)return;closeM();alert('Không khôi phục được. Bộ nhớ có thể đã đầy hoặc tệp bị hỏng.')}},
 rs=()=>body.replaceChildren(all?h('div',{class:'row'},opt('pl','Thêm vào hiện có',mode==='add',()=>{mode='add';rs()}),opt('imp','Thay thế tất cả',mode==='rep',()=>{mode='rep';rs()})):null,
  h('div',{class:'hn',textContent:mode==='add'?'Thêm vào '+(fo?'thư mục “'+fo.name+'”':'màn hình chính')+'. Dữ liệu hiện tại được giữ nguyên.':'Xóa toàn bộ dữ liệu hiện có trên máy rồi thay bằng nội dung tệp, gồm cả cài đặt giao diện. Không thể hoàn tác.'}),
  h('button',{class:'btn'+(mode==='rep'?' d':''),style:'width:100%;margin-top:14px',innerHTML:ic('ck',20)+'<span>Khôi phục</span>',onclick:go}));
 rs();modal(h('h2',{textContent:'Khôi phục từ sao lưu'}),h('div',{class:'xin'},h('b',{textContent:all?'Bản sao lưu toàn bộ':'Thư mục “'+ro+'”'}),h('small',{textContent:new Date(m.t).toLocaleString('vi-VN')+' · '+m.docs.length+' mục · '+m.folders.length+' thư mục · '+xSz(R.size)})),body)}
async function bkIn(file){const P=xProg('Đang đọc tệp…',1);let R;try{R=await bkRead(file,P)}catch(e){if(e&&e.cancel)return;closeM();return alert(e&&e.msg||'Không đọc được tệp sao lưu này.')}P.chk();bkDlg(R)}
function bkPick(){const f=h('input',{type:'file',onchange:()=>{const fl=f.files[0];if(fl)bkIn(fl)}});f.click()}
