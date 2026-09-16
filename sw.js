const CACHE_NAME = "fumeni-shell-v3-13";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./logo.png", "./sw.js"];
self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const u = new URL(event.request.url);
    if (u.origin !== self.location.origin) return;
    event.respondWith(fetch(event.request).then(response => {
        if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
    }).catch(() => caches.match(event.request)));
});
