/* Kiểm tra trước khi phát hành: node tools/check.js (chạy ở thư mục gốc dự án; không cần thư viện) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const R=path.join(__dirname,'..'),err=[],rd=f=>fs.readFileSync(path.join(R,f),'utf8'),ex=f=>fs.existsSync(path.join(R,f));
const html=rd('index.html'),sw=rd('sw.js');
/* (a) mọi tệp cục bộ index.html tham chiếu (src, href) đều tồn tại */
const refs=[],js=[];
for(const m of html.matchAll(/<(script|link|img|source|audio|video)\b[^>]*>/gi)){
 for(const a of m[0].matchAll(/\b(src|href)\s*=\s*"([^"]*)"/gi)){
  const u=a[2];if(!u||/^(https?:|data:|blob:|#|mailto:|\/\/)/i.test(u))continue;
  const f=u.split(/[?#]/)[0];refs.push(f);if(m[1].toLowerCase()==='script'&&/\.js$/.test(f))js.push(f);
  if(f!=='./'&&!ex(f))err.push('(a) index.html tham chiếu tệp không tồn tại: '+f)}}
/* (b) mọi tệp đó nằm trong danh sách cài đặt trước của sw.js */
const arr=n=>{const m=sw.match(new RegExp('[,; ]'+n+"=\\[([^\\]]*)\\]"));if(!m){err.push('(b) không đọc được danh sách '+n+' trong sw.js');return[]}return[...m[1].matchAll(/'([^']*)'/g)].map(x=>x[1])};
const A=arr('A'),B=arr('B'),pre=new Set(A.concat(B));
for(const f of refs)if(!pre.has(f))err.push('(b) tệp không có trong danh sách cài đặt trước của sw.js: '+f);
for(const f of A.concat(B))if(f!=='./'&&!ex(f))err.push('(b) sw.js liệt kê tệp không tồn tại: '+f);
if(ex('js'))for(const f of fs.readdirSync(path.join(R,'js')).filter(x=>/\.js$/.test(x))){if(!js.includes('js/'+f))err.push('(a) js/'+f+' không được index.html nạp');if(!A.includes('js/'+f))err.push('(b) js/'+f+' không nằm trong danh sách BẮT BUỘC của sw.js')}
for(const f of['index.html','css/app.css','manifest.webmanifest'])if(!A.includes(f))err.push('(b) '+f+' phải nằm trong danh sách BẮT BUỘC (A) của sw.js');
/* (c) từng file js cú pháp */
const src=[];
for(const f of js){if(!ex(f))continue;const t=rd(f);src.push(t);try{new vm.Script(t,{filename:f})}catch(e){err.push('(c) '+f+': '+e.message)}}
try{new vm.Script(rd('sw.js'),{filename:'sw.js'})}catch(e){err.push('(c) sw.js: '+e.message)}
/* (d) ghép tất cả thành MỘT script (bắt khai báo trùng giữa các file); thứ tự theo index.html */
try{new vm.Script(src.join('\n'),{filename:'js/*.js (ghép)'})}catch(e){err.push('(d) ghép js/*.js: '+e.message)}
/* (e) kết quả */
if(err.length){console.log('LỖI ('+err.length+'):');err.forEach(x=>console.log(' - '+x));process.exit(1)}
console.log('OK: '+refs.length+' tham chiếu cục bộ, '+js.length+' file js, cú pháp từng file và bản ghép đều qua.');
