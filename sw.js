/* Offline support: serve the cached app instantly, refresh the cache in the background.
   A new version shows up on the next open after it's been fetched. */
const CACHE = 'tp2list-v73';
const APP_SHELL = ['./', './index.html', './stock/index.html', './stock/vendor/jsQR.js', './stock/vendor/qrcode.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // leave sync (JSONBin) and anything non-GET alone
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // page navigations map to their app's index.html (main list or /stock/)
      const isStock = new URL(req.url).pathname.includes('/stock/');
      const key = req.mode === 'navigate' ? (isStock ? './stock/index.html' : './index.html') : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if(res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      if(cached){
        e.waitUntil(network);
        return cached;
      }
      return network;
    })
  );
});
