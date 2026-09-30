/**
 * FUMENI ERP ENGINE - sw.js
 * Service Worker TỐI GIẢN — mục đích DUY NHẤT là để trình duyệt (đặc biệt
 * Android/Chrome) coi trang này đủ điều kiện "cài đặt như app" (PWA
 * installability yêu cầu có Service Worker đăng ký hợp lệ).
 *
 * KHÔNG cache nội dung động của Apps Script (script.google.com) — dữ liệu
 * đăng nhập/nghiệp vụ luôn phải lấy mới, cache lại sẽ gây hiển thị dữ liệu
 * cũ hoặc lộ dữ liệu giữa các phiên trên thiết bị dùng chung. Chỉ cache
 * đúng vỏ tĩnh của trang này (index.html/manifest.json) để mở lại nhanh
 * hơn khi mất mạng chập chờn.
 */

var CACHE_NAME = "fumeni-shell-v1";
var SHELL_FILES = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); }));
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
  var url = new URL(event.request.url);
  // Chỉ can thiệp với chính domain GitHub Pages này; mọi request sang
  // script.google.com (Apps Script) đi thẳng qua mạng, không đụng vào.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(function () { return caches.match(event.request); })
  );
});
