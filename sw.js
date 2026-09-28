/**
 * =====================================================================
 * FUMENI ERP ENGINE - sw.js
 * Service Worker tối giản: chỉ đủ điều kiện để trình duyệt Mobile cho phép
 * "Add to Home Screen". KHÔNG cache dữ liệu nghiệp vụ (mọi request tới Apps
 * Script luôn đi thẳng ra mạng — tránh hiển thị dữ liệu cũ/sai quyền hạn).
 * =====================================================================
 */
var CACHE_NAME = "fumeni-bridge-v1";
var PRECACHE_URLS = ["./index.html", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(PRECACHE_URLS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = event.request.url;
  // Chỉ phục vụ cache cho chính trang bridge (index.html/manifest.json).
  // Mọi request khác (Apps Script, Sheet API, ảnh động...) luôn qua mạng thật.
  var isBridgeAsset = PRECACHE_URLS.some(function (p) { return url.indexOf(p.replace("./", "")) > -1; });
  if (!isBridgeAsset) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
