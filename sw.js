const CACHE_NAME='fumeni-bridge-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
      const hit=await cache.match(event.request);
      const network=fetch(event.request).then(r=>{if(r.ok) cache.put(event.request,r.clone());return r;}).catch(()=>hit);
      return hit||network;
    }));
  }
});
