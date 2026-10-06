/* ============================================
   糖康孪生 - Service Worker（手机版）
   离线缓存和 PWA 支持
   ============================================ */

const CACHE_NAME = 'tangkang-mobile-v1.0';
const OFFLINE_URLS = [
    './',
    './index.html',
    './tk-design-system.css',
    './tk-floating-menu.css',
    './tk-components-mobile.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安装阶段 - 缓存核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[PWA-手机版] 正在缓存核心资源...');
                return cache.addAll(OFFLINE_URLS);
            })
            .then(() => {
                console.log('[PWA-手机版] 缓存完成！');
                return self.skipWaiting(); // 立即激活新版本
            })
            .catch((error) => {
                console.error('[PWA-手机版] 缓存失败:', error);
            })
    );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[PWA-手机版] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[PWA-手机版] 已激活！');
            return self.clients.claim(); // 立即接管所有页面
        })
    );
});

// 请求拦截 - 网络优先，失败时用缓存
self.addEventListener('fetch', (event) => {
    // 只处理同源请求和 CDN 请求
    if (!event.request.url.startsWith(self.location.origin) &&
        !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
        !event.request.url.startsWith('https://fonts.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 如果是成功的响应，克隆并缓存
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络失败，返回缓存
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // 如果请求的是 HTML，返回离线页面
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

// 更新提示
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
