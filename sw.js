const C="bytespeak-v2";const SHELL=["./","index.html","manifest.json","icon-192.png","icon-512.png","account.js","fb-config.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=e.request.url;
 if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put("index.html",cp));return r;}).catch(()=>caches.match("index.html")));return;}
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&(u.startsWith(self.location.origin)||/fonts\.(googleapis|gstatic)\.com/.test(u))){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;})));});
