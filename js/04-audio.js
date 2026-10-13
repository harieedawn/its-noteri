'use strict';
// 04-audio.js: Ghi âm, MIDI sang WAV, tải âm thanh lên, màn hình ghi âm. Dòng 576-724 của index.html gốc.
// Script cổ điển, dùng chung phạm vi toàn cục với các file js/ khác (thứ tự nạp theo số đầu tên file).
// Hàm/const cấp cao: auCtl, audCard, auSave, midiWav, auAdd, recorder, settings, p2, fmtT, stamp, wfN, wfR, wfP, wfF, wvEl, aStop, wavEnc, AMIME, auMeta, decImg, tgl
/* ===== ghi âm và âm thanh ===== */
const p2=n=>String(n).padStart(2,'0'),fmtT=s=>{s=Math.max(0,Math.floor(s||0));const hr=Math.floor(s/3600);return(hr?hr+':'+p2(Math.floor(s%3600/60)):p2(Math.floor(s/60)))+':'+p2(s%60)},
stamp=()=>{const d=new Date();return`${p2(d.getDate())}/${p2(d.getMonth()+1)}/${d.getFullYear()} - ${p2(d.getHours())}:${p2(d.getMinutes())}`},
wfN=o=>{let mx=1e-6;for(const v of o)if(v>mx)mx=v;return o.map(v=>Math.round(10+90*Math.pow(v/mx,.75)))},
wfR=(a,n)=>{if(!a||!a.length)return Array(n).fill(14);const o=[];for(let i=0;i<n;i++){const s=Math.floor(a.length*i/n),e=Math.max(s+1,Math.floor(a.length*(i+1)/n));let m=0;for(let j=s;j<e&&j<a.length;j++)if(a[j]>m)m=a[j];o.push(m)}return o},
wfP=(d,n=48)=>{const o=[],L=d.length;for(let i=0;i<n;i++){const a=Math.floor(L*i/n),b=Math.floor(L*(i+1)/n),st=Math.max(1,Math.floor((b-a)/300));let s=0,c=0;for(let j=a;j<b;j+=st){s+=d[j]*d[j];c++}o.push(Math.sqrt(s/(c||1)))}return wfN(o)},
wfF=async f=>{const o=[];for(let i=0;i<48;i++){const a=Math.floor(f.size*i/48),u=new Uint8Array(await f.slice(a,a+512).arrayBuffer());let s=0;for(const x of u)s+=Math.abs(x-128);o.push(s/(u.length||1))}return wfN(o)},
wvEl=(pk,cu)=>{const mk=c=>h('div',{class:c},pk.map(v=>h('i',{style:'height:'+Math.max(12,v)+'%'})));return h('div',{class:'wvf'+(cu?' cu':''),style:'--p:0%'},mk('wb'),mk('wb wf'))},
aStop=()=>{if(AP)AP.stop()};
function auCtl(getB,dur){let au=null,url=null,raf=0,bz=0;
 const c={playing:false,id:null,ui:{s(){},t(){}},
  tick(){if(!au)return;const t=au.currentTime,d=dur||(isFinite(au.duration)?au.duration:0)||1;c.ui.t(Math.min(1,t/d),t);raf=requestAnimationFrame(c.tick)},
  async toggle(){if(bz)return;if(c.playing){au.pause();c.playing=false;cancelAnimationFrame(raf);c.ui.s(false);return}
   bz=1;try{if(AP&&AP!==c)AP.stop();if(!au){const b=await getB();if(!b)return;url=URL.createObjectURL(b);au=new Audio(url);au.preload='auto';au.onended=()=>{c.playing=false;cancelAnimationFrame(raf);try{au.currentTime=0}catch(e){}c.ui.s(false);c.ui.t(0,0);if(AP===c)AP=null}}
   await au.play();c.playing=true;AP=c;c.ui.s(true);cancelAnimationFrame(raf);c.tick()}catch(e){c.playing=false;c.ui.s(false)}finally{bz=0}},
  seek(f){if(!au)return;const d=dur||(isFinite(au.duration)?au.duration:0);if(!d)return;f=Math.max(0,Math.min(1,f));try{au.currentTime=f*d}catch(e){}c.ui.t(f,f*d)},
  stop(){if(au){au.pause();try{au.currentTime=0}catch(e){}}c.playing=false;cancelAnimationFrame(raf);c.ui.s(false);c.ui.t(0,0);if(AP===c)AP=null},
  free(){c.stop();if(url)URL.revokeObjectURL(url);au=null;url=null}};
 return c}
function audCard(d,i){const cl=den()*colK(),n=cl<=1?40:cl===2?14:cl===3?12:cl===4?10:8,
 pl=h('button',{class:'aup','aria-label':'Phát',innerHTML:ic('ply',18)}),w=wvEl(wfR(d.wf,n)),tm=h('span',{class:'aut',textContent:fmtT(d.dur)}),
 c=AP&&AP.id===d.id?AP:auCtl(()=>get('a:'+d.id),d.dur),
 el=h('div',{class:'doc au','data-id':d.id,style:'--i:'+Math.min(i,14),onclick:()=>c.toggle()},pl,h('div',{class:'auc'},h('div',{class:'auh'},h('div',{class:'nm',textContent:d.name}),h('button',{class:'mb','aria-label':'Tùy chọn',innerHTML:ic('mo',20),onclick:e=>{e.stopPropagation();docMenu(d)}})),h('div',{class:'auw'},w,tm)));
 c.id=d.id;c.ui={s:on=>{pl.innerHTML=ic(on?'pau':'ply',18);pl.setAttribute('aria-label',on?'Tạm dừng':'Phát');el.classList.toggle('pl',on)},t:(p,t)=>{w.style.setProperty('--p',(p*100)+'%');tm.textContent=fmtT(p>0?t:d.dur)}};
 if(c.playing)c.ui.s(true);return el}
async function auSave(r,name){const id=uid();await put('a:'+id,r.blob);M.docs.push({id,name:name||r.ts||stamp(),type:'audio',folder:r.fo,updated:Date.now(),dur:Math.round(r.dur*10)/10,wf:r.wf,txt:''});await sv()}
/* MIDI -> WAV (tự tổng hợp bằng Web Audio, chạy offline) */
const wavEnc=(ch,sr)=>{const n=ch.length,b=new ArrayBuffer(44+n*2),d=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');d.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,sr,true);d.setUint32(28,sr*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*2,true);for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,ch[i]));d.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return new Blob([b],{type:'audio/wav'})};
async function midiWav(buf){const u=new Uint8Array(buf),dv=new DataView(buf);let p=0;
 const tx=n=>{let s='';while(n--)s+=String.fromCharCode(u[p++]);return s},r32=()=>{const x=dv.getUint32(p);p+=4;return x},r16=()=>{const x=dv.getUint16(p);p+=2;return x},vl=()=>{let v=0,b;do{b=u[p++];v=v*128+(b&127)}while(b&128&&p<u.length);return v};
 if(tx(4)!=='MThd')throw 0;const hl=r32();r16();const nt=r16(),dvn=r16();p=8+hl;if(!dvn||dvn&32768)throw 0;
 const ev=[],tp=[[0,5e5]];
 for(let k=0;k<nt&&p+8<=u.length;k++){const id=tx(4),len=r32(),end=Math.min(u.length,p+len);if(id!=='MTrk'){p=end;continue}
  let t=0,rs=0;
  while(p<end){t+=vl();let s=u[p];
   if(s===255){const ty=u[p+1];p+=2;const l=vl();if(ty===81&&l===3)tp.push([t,u[p]<<16|u[p+1]<<8|u[p+2]]);p+=l;if(ty===47)break;continue}
   if(s===240||s===247){p++;p+=vl();continue}
   if(s&128){rs=s;p++}else s=rs;
   const c=s&15,ty=s>>4;
   if(ty===12)ev.push([t,0,c,u[p++]]);else if(ty===13)p++;
   else{const a=u[p++],b=u[p++];if(ty===9&&b)ev.push([t,2,c,a,b]);else if(ty===9||ty===8)ev.push([t,1,c,a])}}
  p=end}
 ev.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);tp.sort((a,b)=>a[0]-b[0]);
 const T2=t=>{let s=0,pt=0,m=5e5;for(const[tt,mp]of tp){if(tt>=t)break;s+=(tt-pt)*m/1e6/dvn;pt=tt;m=mp}return s+(t-pt)*m/1e6/dvn},pr=Array(16).fill(0),op={},ns=[];let mt=0;
 for(const[t,k,c,a,b]of ev){mt=Math.max(mt,t);if(k===0)pr[c]=a;else if(k===2)(op[c*128+a]=op[c*128+a]||[]).push([t,b,pr[c]]);else{const l=op[c*128+a];if(l&&l.length){const o=l.shift();ns.push([T2(o[0]),T2(t),a,c,o[1],o[2]])}}}
 for(const key in op)for(const o of op[key])ns.push([T2(o[0]),T2(mt),+key%128,Math.floor(+key/128),o[1],o[2]]);
 if(!ns.length)throw 0;let en=0;for(const n of ns)if(n[1]>en)en=n[1];
 const sr=22050,total=Math.min(480,en+1.5),oc=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,Math.ceil(total*sr),sr),mg=oc.createGain(),cp=oc.createDynamicsCompressor();mg.gain.value=.5;mg.connect(cp);cp.connect(oc.destination);
 const nb=oc.createBuffer(1,sr/2,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 for(const[s,e0,a,c,v,pg]of ns){if(s>=total)continue;const e=Math.min(total,Math.max(e0,s+.05)),vol=v/127;
  if(c===9){const g=oc.createGain();g.connect(mg);
   if(a===35||a===36){const o=oc.createOscillator();o.frequency.setValueAtTime(150,s);o.frequency.exponentialRampToValueAtTime(45,s+.12);g.gain.setValueAtTime(vol*1.2,s);g.gain.exponentialRampToValueAtTime(.001,s+.28);o.connect(g);o.start(s);o.stop(s+.3)}
   else{const n=oc.createBufferSource(),f=oc.createBiquadFilter(),sn=a===37||a===38||a===40,cy=a===49||a===51||a===52||a===55||a===57,d=sn?.16:cy?.45:.05;n.buffer=nb;f.type=sn?'bandpass':'highpass';f.frequency.value=sn?1900:7000;g.gain.setValueAtTime(vol*(sn?.6:.3),s);g.gain.exponentialRampToValueAtTime(.001,s+d);n.connect(f);f.connect(g);n.start(s);n.stop(s+d+.02)}
   continue}
  const o=oc.createOscillator(),g=oc.createGain(),sq=pg>=80&&pg<88,dc=pg<32||(pg>=104&&pg<112),a0=vol*(sq?.16:.28);
  o.type=sq?'square':'triangle';o.frequency.value=440*Math.pow(2,(a-69)/12);
  g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(a0,s+.008);if(dc)g.gain.setTargetAtTime(a0*.3,s+.008,.5);g.gain.setTargetAtTime(0,e,.07);
  o.connect(g);g.connect(mg);o.start(s);o.stop(e+.5)}
 const out=await oc.startRendering(),ch=out.getChannelData(0);return{blob:wavEnc(ch,sr),dur:total,wf:wfP(ch)}}
/* tải tệp âm thanh lên */
const AMIME={mp3:'audio/mpeg',m4a:'audio/mp4',aac:'audio/aac',wav:'audio/wav',ogg:'audio/ogg',oga:'audio/ogg',opus:'audio/ogg',flac:'audio/flac',weba:'audio/webm',webm:'audio/webm',amr:'audio/amr','3gp':'audio/3gpp',aif:'audio/aiff',aiff:'audio/aiff'},
auMeta=b=>new Promise(r=>{const a=new Audio(),u=URL.createObjectURL(b),fin=v=>{a.src='';URL.revokeObjectURL(u);r(v)};a.preload='metadata';a.onloadedmetadata=()=>fin(isFinite(a.duration)?a.duration:0);a.onerror=()=>fin(null);setTimeout(()=>fin(null),6000);a.src=u});
async function auAdd(f,fo){const ex=((f.name.match(/\.([^.]+)$/)||[])[1]||'').toLowerCase();let blob=f,dur=0,wf;
 if(ex==='mid'||ex==='midi'||/midi/i.test(f.type)){const r=await midiWav(await f.arrayBuffer());blob=r.blob;dur=r.dur;wf=r.wf}
 else{let ok=0;if(f.size<=3e7){try{const b=await new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,1,44100).decodeAudioData(await f.arrayBuffer());dur=b.duration;wf=wfP(b.getChannelData(0));ok=1}catch(x){}}
  if(!ok){const d=await auMeta(f);if(d==null)throw 0;dur=d;wf=await wfF(f)}
  blob=new Blob([f],{type:f.type||AMIME[ex]||''})}
 const id=uid();await put('a:'+id,blob);M.docs.push({id,name:f.name.replace(/\.[^.]+$/,'')||'Âm thanh',type:'audio',folder:fo,updated:Date.now(),dur:Math.round(dur*10)/10,wf,txt:''});await sv()}
$('#audin').onchange=async e=>{const fs=[...e.target.files],fo=cur;e.target.value='';if(!fs.length)return;snack('Đang xử lý âm thanh…');let bad=0;for(const f of fs){try{await auAdd(f,fo)}catch(x){bad++}}$('#snack').className='';home(1);if(bad)alert('Không đọc được tệp âm thanh này. Định dạng có thể chưa được trình duyệt hỗ trợ.')};
/* màn hình ghi âm: nhấn = rảnh tay, đè = ghi, thả = lưu; đè rồi vuốt phải = rảnh tay, vuốt trái = xóa */
function recorder(){const R=RC={st:'idle',stream:null,ctx:null,an:null,buf:null,mr:null,chunks:[],lv:[],dur:0,blob:null,wf:null,mime:'',ts:'',fo:cur,pd:0,pid:0,x0:0,pt:0,up:0,zone:'',tm:0,on:0,tok:0,err:'',pm:'',ctl:null,gone:0,busy:0,sv:0,nm:null};
 const rt=h('span',{class:'rct',textContent:'00:00'}),lw=h('div',{class:'rcl'}),pill=h('div',{class:'rcp'}),
 mic=h('button',{class:'rcm',oncontextmenu:e=>e.preventDefault()}),
 bDel=h('button',{class:'rcs dl','aria-label':'Xóa',innerHTML:ic('tr',24)}),bLk=h('div',{class:'rcs lk',innerHTML:ic('lk',24)}),bPv=h('button',{class:'rcs pv','aria-label':'Nghe thử',innerHTML:ic('wav',24)}),
 lbL=h('small'),lbC=h('small'),lbR=h('small'),
 row=h('div',{class:'rcr'},h('div',{class:'rcc'},h('div',{class:'rcz'},bDel),lbL),h('div',{class:'rcc'},h('div',{class:'rcz'},mic),lbC),h('div',{class:'rcc'},h('div',{class:'rcz'},bLk,bPv),lbR)),
 up=h('button',{class:'rcu',innerHTML:ic('upl',18)+'<span>Tải tệp âm thanh lên</span>',onclick:()=>{rel();RC=null;R.gone=1;closeM();$('#audin').click()}}),
 wrap=h('div',{class:'rcw'},pill,row,up);
 const rel=()=>{if(R.stream){R.stream.getTracks().forEach(t=>t.stop());R.stream=null}if(R.ctx){try{R.ctx.close()}catch(e){}R.ctx=null}R.an=null},
 drawLive=()=>{const w=lw.clientWidth;if(!w)return;const n=Math.max(8,Math.floor((w+4)/7));if(lw.children.length!==n)lw.replaceChildren(...Array.from({length:n},()=>h('i')));const L=R.lv,off=Math.max(0,L.length-n);for(let i=0;i<n;i++){const v=L[off+i],e=lw.children[i];if(v==null){e.className='';e.style.height='3px'}else{e.className='on';e.style.height=Math.max(3,Math.round(v*36))+'px'}}},
 pillPlayer=()=>{const pb=h('button',{class:'rpb','aria-label':'Phát',innerHTML:ic('ply',20)}),w=wvEl(wfR(R.wf,40),1),tm=h('span',{class:'rct',textContent:fmtT(R.dur)}),c=R.ctl=auCtl(async()=>R.blob,R.dur);
  c.ui={s:on=>{pb.innerHTML=ic(on?'pau':'ply',20);pb.setAttribute('aria-label',on?'Tạm dừng':'Phát')},t:(p,t)=>{w.style.setProperty('--p',(p*100)+'%');tm.textContent=fmtT(p>0?t:R.dur)}};
  pb.onclick=()=>c.toggle();w.onpointerdown=e=>{const r=w.getBoundingClientRect();c.seek((e.clientX-r.left)/r.width)};return[pb,w,tm,c]},
 setPill=m=>{if(R.pm===m)return;R.pm=m;if(R.ctl&&m!=='p'){R.ctl.free();R.ctl=null}
  if(m==='p'){const[pb,w,tm,c]=pillPlayer();pill.replaceChildren(pb,w,tm);c.toggle()}else if(m==='e')pill.replaceChildren(h('span',{class:'rce',textContent:R.err}));else{pill.replaceChildren(lw,rt);requestAnimationFrame(drawLive)}},
 ui=()=>{const s=R.st,lr=s==='lock'||s==='rev';wrap.className='rcw st-'+s+(s==='lock'&&R.dur<1?' nv':'');
  mic.innerHTML=ic(lr?'ck':'mic',lr?46:42);mic.classList.toggle('hd',s==='hold');mic.setAttribute('aria-label',lr?'Lưu':'Ghi âm');
  lbL.textContent=lr?'Xóa':'';lbC.textContent=lr?'Lưu':'';lbR.textContent=s==='lock'&&R.dur>=1?'Nghe thử':'';
  rt.classList.toggle('rec',s==='hold'||s==='lock');bDel.classList.remove('hl');bLk.classList.remove('hl');
  setPill(s==='rev'?'p':R.err&&s==='idle'?'e':'l')},
 warm=async()=>{if(R.stream&&R.stream.active)return 1;try{R.err='';R.stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){R.err=e&&e.name==='NotFoundError'?'Không tìm thấy micro':'Chưa cấp quyền dùng micro';if(!R.gone&&R.st==='idle')ui();return 0}
  if(R.gone){rel();return 0}return 1},
 begin=async()=>{if(!await warm())return 0;
  try{const C=window.AudioContext||window.webkitAudioContext;if(!R.ctx)R.ctx=new C();if(R.ctx.state==='suspended')R.ctx.resume();if(!R.an){const an=R.ctx.createAnalyser();an.fftSize=512;R.ctx.createMediaStreamSource(R.stream).connect(an);R.an=an;R.buf=new Uint8Array(512)}}catch(e){}
  const mt=window.MediaRecorder&&['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  try{R.mr=new MediaRecorder(R.stream,mt?{mimeType:mt}:undefined)}catch(e){R.err='Thiết bị chưa hỗ trợ ghi âm';return 0}
  R.mime=R.mr.mimeType||mt||'audio/webm';R.chunks=[];R.mr.ondataavailable=e=>{if(e.data&&e.data.size)R.chunks.push(e.data)};R.mr.start(400);R.t0=performance.now();R.ts=stamp();R.lv=[];R.dur=0;R.tm=setInterval(tick,100);R.on=1;return 1},
 tick=()=>{if(R.an){R.an.getByteTimeDomainData(R.buf);let s=0;for(let i=0;i<R.buf.length;i++){const v=(R.buf[i]-128)/128;s+=v*v}R.lv.push(Math.min(1,Math.pow(Math.sqrt(s/R.buf.length)*5,.7)))}else R.lv.push(0);
  R.dur=(performance.now()-R.t0)/1000;rt.textContent=fmtT(R.dur);drawLive();if(R.st==='lock'&&R.dur>=1&&wrap.classList.contains('nv'))ui()},
 fin=()=>new Promise(res=>{clearInterval(R.tm);R.tm=0;const m=R.mr;if(R.on)R.dur=(performance.now()-R.t0)/1000;const done=()=>{R.on=0;R.wf=wfN(wfR(R.lv,48));rel();res()};if(!R.on||!m||m.state==='inactive')return done();m.onstop=()=>{R.blob=new Blob(R.chunks,{type:R.mime});done()};try{m.stop()}catch(e){done()}}),
 reset=()=>{if(R.ctl){R.ctl.free();R.ctl=null}clearInterval(R.tm);R.tm=0;R.tok++;if(R.on){try{R.mr.onstop=null;R.mr.stop()}catch(e){}R.on=0}rel();R.blob=null;R.lv=[];R.dur=0;R.pm='';R.err='';R.zone='';rt.textContent='00:00';mic.style.transform='';R.st='idle';ui();drawLive();if(!R.gone)warm()},
 ok=()=>R.blob&&R.blob.size&&R.dur>=1,
 toName=async()=>{R.busy=1;await fin();R.busy=0;if(R.gone)return;if(!ok())return reset();nameStep()},
 nameStep=()=>{R.st='name';if(R.ctl){R.ctl.free();R.ctl=null}R.pm='n';
  const nm=R.nm=h('input',{class:'in',placeholder:R.ts,maxLength:80,onkeydown:e=>{if(e.key==='Enter')save()}}),[pb,w,tm,c]=pillPlayer(),pl=h('div',{class:'rcp',style:'margin-top:4px'},pb,w,tm);
  const save=async()=>{if(R.sv)return;R.sv=1;const n=nm.value.trim()||R.ts;R.st='saved';RC=null;c.free();try{await auSave(R,n)}catch(e){R.st='name';R.sv=0;RC=R;return alert('Không lưu được bản ghi. Bộ nhớ có thể đã đầy.')}closeM();home(1)};
  modal(h('h2',{textContent:'Lưu bản ghi'}),pl,h('div',{style:'margin-top:14px'},nm),h('div',{class:'row',style:'margin-top:16px'},h('button',{class:'btn rcb',style:'flex:1',innerHTML:ic('ck',24)+'<span>Lưu</span>',onclick:save}),h('button',{class:'btn d rcb','aria-label':'Xóa bản ghi',innerHTML:ic('tr',22),onclick:()=>{if(R.dur>=5&&!confirm('Xóa bản ghi này?'))return;R.st='saved';RC=null;c.free();closeM()}})))};
 R.bye=async()=>{if(R.gone)return;R.gone=1;RC=null;R.tok++;if(R.ctl){R.ctl.free();R.ctl=null}clearInterval(R.tm);if(R.on)await fin();else rel();if(R.st!=='saved'&&ok()){try{await auSave(R,R.nm&&R.nm.value.trim()||R.ts);if(!$('#home').hidden)home(1)}catch(e){}}};
 mic.onpointerdown=e=>{if(R.st!=='idle'||R.busy)return;e.preventDefault();try{mic.setPointerCapture(e.pointerId)}catch(x){}
  R.pd=1;R.pid=e.pointerId;R.x0=e.clientX;R.pt=performance.now();R.zone='';R.st='hold';ui();hap();const k=++R.tok;
  begin().then(g=>{if(k!==R.tok||R.gone)return;if(!g){R.on=0;R.st='idle';ui();return}setPill('l');drawLive();if(!R.pd){if(R.zone==='del')return reset();R.st='lock';ui()}})};
 mic.onpointermove=e=>{if(R.st!=='hold'||e.pointerId!==R.pid)return;const dx=e.clientX-R.x0,z=dx<-56?'del':dx>56?'lock':'';mic.style.transform=`translateX(${Math.max(-40,Math.min(40,dx*.5))}px)`;if(z!==R.zone){R.zone=z;bDel.classList.toggle('hl',z==='del');bLk.classList.toggle('hl',z==='lock');if(z)hap()}};
 mic.onpointerup=async e=>{if(R.st!=='hold'||e.pointerId!==R.pid)return;R.pd=0;R.up=performance.now();mic.style.transform='';if(!R.on)return;
  if(R.zone==='del')return reset();
  if(R.zone==='lock'||R.up-R.pt<320){R.st='lock';ui();hap();return}
  toName()};
 mic.onpointercancel=e=>{if(R.st!=='hold'||e.pointerId!==R.pid)return;R.pd=0;R.up=performance.now();mic.style.transform='';if(R.on){R.st='lock';ui()}};
 mic.onclick=()=>{if(performance.now()-R.up<450||R.busy)return;if(R.st==='lock'||R.st==='rev')toName()};
 bDel.onclick=()=>{if(R.st!=='lock'&&R.st!=='rev')return;if(R.dur>=5&&!confirm('Xóa bản ghi này?'))return;reset()};
 bPv.onclick=async()=>{if(R.st!=='lock'||R.busy)return;R.busy=1;await fin();R.busy=0;if(R.gone)return;if(!ok())return reset();R.st='rev';ui()};
 modal(wrap);ui();warm()}
$('#pdfin').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(!await pdfEnsure())return alert('Cần kết nối mạng một lần để tải bộ đọc PDF.');
 let id,k=0;try{const buf=await f.arrayBuffer();id=uid();await put('p:'+id,buf);const t=await pdfOpen(buf);await pdfRat(id,t);t.destroy().catch(()=>{});M.docs.push({id,name:f.name.replace(/\.pdf$/i,''),type:'pdf',folder:cur,updated:Date.now(),paper:'#ffffff',txt:''});k=1;await put('d:'+id,JSON.stringify({strokes:[],objs:[]}));await sv();open(id)}catch(x){if(id&&!k){del('p:'+id);del('r:'+id)}alert('Không mở được PDF này (tệp hỏng hoặc có mật khẩu).')}};

const decImg=async f=>{try{return await createImageBitmap(f,{imageOrientation:'from-image'})}catch(e){}return new Promise((res,rej)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{res(i);setTimeout(()=>URL.revokeObjectURL(u),3e4)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};i.src=u})};
$('#imgin').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;snack('Đang mở ảnh…');let id;try{const bm=await decImg(f),w0=bm.naturalWidth||bm.width||1000,h0=bm.naturalHeight||bm.height||1000,k=Math.min(1,Math.sqrt(14e6/(w0*h0)),16000/Math.max(w0,h0)),cw=Math.max(1,Math.round(w0*k)),ch=Math.max(1,Math.round(h0*k)),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const c=cv.getContext('2d'),png=/png|gif|webp|svg|avif|icon/i.test(f.type);if(!png){c.fillStyle='#fff';c.fillRect(0,0,cw,ch)}c.drawImage(bm,0,0,cw,ch);if(bm.close)bm.close();
  const blob=await new Promise(r=>cv.toBlob(r,png?'image/png':'image/jpeg',.92));if(!blob)throw 0;
  const ar=ch/cw,W=ar<=1?2400:1800,H=W*ar,cr=Math.max(9/16,Math.min(16/9,W/H)),th=document.createElement('canvas');th.width=320;th.height=Math.round(320/cr);const tc=th.getContext('2d'),kk=Math.max(320/cw,th.height/ch);tc.fillStyle='#fff';tc.fillRect(0,0,320,th.height);tc.drawImage(cv,(320-cw*kk)/2,0,cw*kk,ch*kk);
  id=uid();await put('i:'+id,blob);await put('d:'+id,JSON.stringify({ratio:'img',cw:W,ch:H,fh:H,paper:'#ffffff',strokes:[],objs:[]}));M.docs.push({id,name:f.name.replace(/\.[^.]+$/,'')||'Ảnh',type:'image',folder:cur,updated:Date.now(),paper:'#ffffff',car:cr,th:th.toDataURL('image/jpeg',.8),txt:''});await sv();$('#snack').className='';open(id)}catch(x){if(id){del('i:'+id);del('d:'+id)}alert('Không đọc được ảnh này. Định dạng có thể chưa được trình duyệt hỗ trợ.')}};
const tgl=(t,k,rs,i,o={})=>h('div',{class:'rw'},h('div',{class:'rl'},h('i',{class:'rb',innerHTML:ic(o.off&&!T[k]?o.off:i,20)}),h('div',{},h('span',{textContent:t}),o.d?h('small',{class:'hn',textContent:o.d}):'')),h('button',{class:'tg'+(T[k]?' on':''),'aria-label':t,onclick:()=>{T[k]=!T[k];saveT();o.cb&&o.cb();rs()}}));
function settings(){const b=h('div');
 let more=!!TH[T.theme]&&T.theme!=='gray';
 const pick=()=>{const f=h('input',{type:'file',accept:'image/*',onchange:async()=>{const fl=f.files[0];if(!fl)return;try{const bm=await createImageBitmap(fl),k=Math.min(1,1400/Math.max(bm.width,bm.height)),cv=document.createElement('canvas');cv.width=Math.round(bm.width*k);cv.height=Math.round(bm.height*k);cv.getContext('2d').drawImage(bm,0,0,cv.width,cv.height);await put('bg',cv.toDataURL('image/jpeg',.82));await applyBg();rs()}catch(x){snack('Không đọc được ảnh này.')}}});f.click()},
 bgRow=()=>{const on=!!document.documentElement.dataset.bg;return h('div',{},h('div',{class:'row'},chip(on?'Đổi ảnh':'Chọn ảnh',false,pick,'im'),on?chip('Xóa ảnh',false,async()=>{await del('bg');await applyBg();rs()},'tr'):''),on?h('div',{},h('div',{class:'hn',textContent:'Độ phủ màu giao diện'}),h('input',{type:'range',min:0,max:90,step:1,value:Math.round((T.bgo==null?.55:T.bgo)*100),'aria-label':'Độ phủ màu giao diện',oninput:e=>{T.bgo=e.target.value/100;saveT();bgo()}})):h('div',{class:'hn',textContent:'Chỉ thay nền màn hình chính, màu giao diện vẫn áp dụng cho mọi thứ khác.'}))};
 const cuBox=()=>{const u=Object.assign({h:255,s:.3,d:1},T.cu);let dg=0;const hk=h('b',{class:'hk'}),hb=h('div',{class:'hb',role:'slider','aria-label':'Màu chủ đạo','aria-valuemin':0,'aria-valuemax':360,tabindex:0},Array.from({length:36},(_,i)=>h('i',{style:'background:'+okh(.74,.13,i*10+5)})),hk),
  mk=()=>{hk.style.left=u.h/3.6+'%';hk.style.background=okh(.74,.13,u.h);hb.setAttribute('aria-valuenow',Math.round(u.h))},
  ap=()=>{T.cu={h:u.h,s:u.s,d:u.d};T.theme='custom';theme();document.documentElement.classList.remove('tt');const c=TH.custom,t=b.querySelector('.thc');if(t){t.style.cssText=`background:${c[1]};--s:${c[2]};--p:${c[7]};--o:${c[4]}`;b.querySelectorAll('.thp').forEach(x=>x.classList.toggle('on',x===t))}mk()},
  go=()=>{ap();saveT();rs()},at=e=>{const r=hb.getBoundingClientRect();u.h=Math.max(0,Math.min(359.9,(e.clientX-r.left)/r.width*360));ap()};
  hb.onpointerdown=e=>{hb.setPointerCapture(e.pointerId);dg=1;at(e)};hb.onpointermove=e=>{if(dg)at(e)};hb.onpointerup=hb.onpointercancel=()=>{if(dg){dg=0;saveT();rs()}};
  hb.onkeydown=e=>{const d=e.key==='ArrowLeft'?-6:e.key==='ArrowRight'?6:0;if(!d)return;e.preventDefault();u.h=(u.h+d+360)%360;ap();saveT()};mk();
  return h('div',{},h('div',{class:'lb',innerHTML:ic('k_palette',18)+'Tự chọn màu'}),h('div',{class:'hn',textContent:'Chọn một màu, ứng dụng tự phối nền, chữ và nút cho dễ nhìn.'}),hb,h('div',{class:'row'},chip('Nền sáng',!u.d,()=>{u.d=0;go()},'sn'),chip('Nền tối',!!u.d,()=>{u.d=1;go()},'mn')),h('div',{class:'hn',textContent:'Độ ngả màu của nền'}),h('input',{type:'range',min:0,max:100,step:1,value:Math.round(u.s*100),'aria-label':'Độ ngả màu của nền',oninput:e=>{u.s=e.target.value/100;ap()},onchange:()=>{saveT();rs()}}))};
 const rs=()=>b.replaceChildren(h('div',{class:'lb',innerHTML:ic('sn',18)+'Giao diện'}),h('div',{class:'row'},[['light','sn','Sáng'],['gray','gy','Xám'],['dark','mn','Tối']].map(([k,i,t])=>opt(i,t,T.theme===k,()=>{T.theme=k;saveT();theme();more=false;rs()})),opt('k_palette','Thêm',(!!TH[T.theme]&&T.theme!=='gray')||more,()=>{more=!more;rs()})),more?h('div',{class:'thg'},Object.keys(TH).filter(k=>k!=='gray').map(k=>h('button',{class:'thp'+(T.theme===k?' on':'')+(k==='custom'?' thc':''),'aria-label':'Màu giao diện',style:`background:${TH[k][1]};--s:${TH[k][2]};--p:${TH[k][7]};--o:${TH[k][4]}`,onclick:()=>{T.theme=k;saveT();theme();rs()}},h('b'),h('i')))):'',more?cuBox():'',
  h('div',{class:'lb',innerHTML:ic('im',18)+'Ảnh nền'}),bgRow(),
  h('div',{class:'lb',innerHTML:ic('pen',18)+'Viết và vẽ'}),
  tgl('Chống chạm nhầm bằng tay','stylus',rs,'pen',{d:'Sau khi đã dùng bút cảm ứng, ngón tay chỉ cuộn và thu phóng, không vẽ.'}),
  tgl('Giấy note mở sẵn chế độ gõ chữ','nqt',rs,'nt',{d:'Vào giấy note là chạm để gõ ngay, không cần chọn công cụ.'}),
  h('div',{class:'lb',innerHTML:ic('tx',18)+'Cỡ chữ khi gõ'}),h('div',{class:'row'},[['Nhỏ',36],['Vừa',48],['Lớn',64]].map(([t,v])=>chip(t,T.tfs===v,()=>{T.tfs=v;saveT();rs()}))),h('div',{class:'hn',textContent:'Giấy note luôn có chữ lớn hơn 1,5 lần.'}),
  h('div',{class:'lb',textContent:'Sắp xếp file'}),h('div',{class:'row'},[['new','Mới nhất'],['old','Cũ nhất'],['name','Tên A–Z'],['free','Tự do']].map(([k,t])=>chip(t,sortK()===k,()=>{if(k==='free'&&sortK()!=='free')seedFree();setSrt(k);sv();list();rs()}))),h('div',{class:'hn',textContent:'Áp dụng riêng cho '+(cur?'thư mục đang mở':'màn hình chính')+'. Ở chế độ Tự do, đè vào một mục rồi kéo để đặt vị trí; các chế độ khác chỉ cho kéo vào thư mục.'}),
  h('div',{class:'lb',innerHTML:ic('au',18)+'Trải nghiệm'}),
  tgl('Rung','hap',rs,'vb',{off:'vbo'}),
  tgl('Tắt animation','na',rs,'spk',{d:'Tắt chuyển động và hiệu ứng mờ kính, hợp cho máy yếu.',cb:()=>document.documentElement.toggleAttribute('data-na',!!T.na)}),
  tgl('Giữ màn hình sáng khi đang viết','wl',rs,'sn',{cb:()=>{if(T.wl)wl();else wlOff()}}),
  h('div',{class:'lb',innerHTML:ic('dl',18)+'Sao lưu'}),
  h('div',{class:'row'},chip('Sao lưu tất cả',false,()=>bkOut(null),'dl'),chip('Khôi phục từ tệp',false,bkPick,'upl')),
  h('div',{class:'hn',textContent:'Tệp .noteri chứa mọi thư mục, trang, PDF, ảnh, ghi âm và sơ đồ tư duy. Khi khôi phục có thể thêm vào dữ liệu hiện có hoặc thay thế toàn bộ. Sao lưu riêng từng thư mục nằm trong phần sửa thư mục.'}),
  h('div',{class:'ver',textContent:'Phiên bản '+VER}));rs();modal(h('h2',{textContent:'Cài đặt'}),b)}
