/**
 * =====================================================================
 * FUMENI ERP ENGINE - sw.js
 * Service Worker tối giản: chỉ đủ điều kiện để trình duyệt Mobile cho phép
 * "Add to Home Screen". KHÔNG cache dữ liệu nghiệp vụ — mọi request tới Apps
 * Script luôn đi thẳng ra mạng, tránh hiển thị dữ liệu cũ/sai quyền hạn.
 * =====================================================================
 */
var CACHE_NAME = "fumeni-bridge-v2-iframe";
var PRECACHE_URLS = ["./index.html", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(PRECACHE_URLS); }));
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
  var isIndex = url.indexOf("index.html") > -1 || url.endsWith("/");
  var isManifest = url.indexOf("manifest.json") > -1;
  if (!isIndex && !isManifest) return; // Apps Script + dữ liệu nghiệp vụ luôn qua mạng thật

  if (isIndex) {
    // Network-first: sau khi đổi bridge, người dùng không bị giữ index.html cũ
    // chỉ vì service worker còn cache bản redirect trước đó.
    event.respondWith(
      fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return response;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
