'use strict';
// 12-boot.js: Khởi động: hiệu ứng nhấn, ảnh nền, mở màn hình chính, service worker. Dòng 1296-1301 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: applyBg, bgo
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn,.chip,.tile,.opt,.fab,.bt,.mb,.sbt,.nmc,#top .ib');if(!b||b.disabled)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.6,s=h('span',{class:'rp',style:`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`});b.append(s);setTimeout(()=>s.remove(),600)});
const bgo=()=>document.documentElement.style.setProperty('--bgo',T.bgo==null?.55:T.bgo);
async function applyBg(){let u=null;try{u=await get('bg')}catch(e){}const r=document.documentElement,b=$('#bgi');if(u&&typeof u==='string'){b.style.backgroundImage='url('+u+')';r.dataset.bg=1}else{b.style.backgroundImage='';delete r.dataset.bg}bgo()}
applyBg();home();(async()=>{try{M=await get('meta')||M;M.docs.filter(d=>d.deleted).forEach(d=>{del('d:'+d.id);del('p:'+d.id);del('r:'+d.id);del('i:'+d.id);del('a:'+d.id)});M.docs=M.docs.filter(d=>!d.deleted);home()}catch(e){}})();
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
