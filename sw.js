const CACHE_NAME="fumeni-shell-v3-9-7";
const APP_SHELL=["./","./index.html","./manifest.json","./logo.png","./sw.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin) return;
  const shellAsset=u.pathname.endsWith("/index.html")||u.pathname.endsWith("/manifest.json")||u.pathname.endsWith("/sw.js");
  if(shellAsset){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>cached)));
});
