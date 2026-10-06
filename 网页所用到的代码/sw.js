/* ============================================
   糖康孪生 - Service Worker
   离线缓存和 PWA 支持
   ============================================ */

const CACHE_NAME = 'tangkang-twin-v5.0';
const OFFLINE_URLS = [
    '/',
    './index2.html',
    './feature_center.html',
    './ai_assistant.html',
    './data_dashboard.html',
    './luntan.html',
    './tk-design-system.css',
    './tk-floating-menu.css',
    './tk-pet.css',
    './tk-pet.js',
    './tk-components.js',
    './manifest.json',
    './images/pet/piggy.png',
    './images/pet/piggy-alert.png',
    './images/pet/piggy-idle-2.png',
    './images/pet/piggy-walk-1.png',
    './images/pet/piggy-walk-2.png',
    './images/pet/doctor-dog.png',
    './images/pet/doctor-dog-alert.png',
    './images/pet/doctor-dog-idle-2.png',
    './images/pet/doctor-dog-walk-1.png',
    './images/pet/doctor-dog-walk-2.png',
    './images/pet/water-fairy.png',
    './images/pet/water-fairy-alert.png',
    './images/pet/water-fairy-idle-2.png',
    './images/pet/water-fairy-walk-1.png',
    './images/pet/water-fairy-walk-2.png',
    './images/pet/candy-cat.png',
    './images/pet/candy-cat-alert.png',
    './images/pet/candy-cat-idle-2.png',
    './images/pet/candy-cat-walk-1.png',
    './images/pet/candy-cat-walk-2.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// 安装阶段
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[PWA] 缓存已打开');
                return cache.addAll(OFFLINE_URLS);
            })
            .catch((error) => {
                console.warn('[PWA] 缓存打开失败:', error);
            })
    );
    self.skipWaiting();
});

// 激活阶段
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[PWA] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', (event) => {
    // 只拦截 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 缓存命中，直接返回
                if (response) {
                    return response;
                }

                // 缓存未命中，发起网络请求
                return fetch(event.request)
                    .then((response) => {
                        // 检查响应是否有效
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应并缓存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // 网络不可用时返回离线页面
                        return caches.match('./index2.html');
                    });
            })
    );
});

// 处理消息
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 推送通知
self.addEventListener('push', (event) => {
    let data = {
        title: '糖康孪生',
        body: '您好，请注意按时测量血糖',
        icon: 'images/logo.jpg'
    };
    
    if (event.data) {
        try {
            data = Object.assign(data, event.data.json());
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: 'images/logo.jpg',
            vibrate: [200, 100, 200],
            tag: 'tangkang-notification',
            renotify: true,
            requireInteraction: false
        })
    );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./feature_center.html')
    );
});

console.log('[PWA] Service Worker 已加载');
