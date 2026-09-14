const CACHE_NAME="fumeni-shell-v2";
const APP_SHELL=["./","./index.html","./manifest.json","./logo.png","./sw.js"];

self.addEventListener("install",e=>{
e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
self.skipWaiting();
});

self.addEventListener("activate",e=>{
e.waitUntil(
caches.keys().then(keys=>Promise.all(
keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
))
);
self.clients.claim();
});

self.addEventListener("fetch",e=>{
if(e.request.method!=="GET")return;
const u=new URL(e.request.url);
if(u.origin!==self.location.origin)return;

e.respondWith(
caches.match(e.request).then(cached=>{
const network=fetch(e.request).then(r=>{
if(r.ok){
caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));
}
return r;
}).catch(()=>cached);
return cached||network;
})
);
});
