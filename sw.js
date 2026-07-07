const CACHE_NAME = 'youjia-v1';
const CACHE_URLS = [
  '/youjia/index.html',
  '/youjia/manifest.json'
];

// 安裝：快取基本檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

// 啟動：清除舊快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 攔截請求：網路優先，失敗才用快取
self.addEventListener('fetch', event => {
  // 只處理 GET 請求，API 請求直接放行
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('firestore.googleapis.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 更新快取
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
