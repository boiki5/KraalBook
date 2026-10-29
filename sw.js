/* KraalBook service worker: keeps the app files on the phone so it opens without internet.
   It never touches farm records. Records live in the browser's IndexedDB only. */
var CACHE = 'kraalbook-shell-v3';
var ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/dm-sans-latin-400-normal.woff2', 'fonts/dm-sans-latin-500-normal.woff2',
  'fonts/dm-sans-latin-700-normal.woff2', 'fonts/bricolage-grotesque-latin-700-normal.woff2'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Open from the saved copy first, then refresh it quietly so updates arrive on the next visit. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit || caches.match('index.html'); });
    return hit || net;
  }));
});
