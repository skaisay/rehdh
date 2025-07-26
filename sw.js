// Service Worker for Stats Tracker PWA

const CACHE_NAME = 'stats-tracker-v2.9.0';
const CACHE_URLS = [
    './index.html',
    './styles.css',
    './app-optimized.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './offline.html',
    './default.html',
    // Cache background images for offline use
    'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg',
    'https://i.postimg.cc/pdNMQZt8/korus-beachside-cafe-thumb.jpg',
    'https://i.postimg.cc/YSV8Zp3m/field-of-daisies-thumb.jpg',
    'https://i.postimg.cc/dVVB07Ny/luffy-clouds-one-piece-thumb.jpg',
    'https://i.postimg.cc/g0fq4gzV/black-cat-sakura-thumb.jpg'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_URLS);
            })
            .catch(error => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetch', event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.destination === 'document') {
                    return caches.match('./offline.html');
                }
            })
    );
});

// Background sync for data backup (when online)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Here you could implement automatic data backup to a remote server
        // For now, we'll just log that sync is working
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от Roblox Stats',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: './'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть приложение'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Roblox Stats Tracker', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click');
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Share target handling (future feature)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (url.pathname === '/share-target' && event.request.method === 'POST') {
        event.respondWith(handleShareTarget(event.request));
    }
});

async function handleShareTarget(request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';
        const url = formData.get('url') || '';
        
        // Handle shared content (e.g., Roblox screenshots)
        console.log('Shared content:', { title, text, url });
        
        // Redirect to app with shared data
        return Response.redirect('./?shared=true', 303);
    } catch (error) {
        console.error('Share target handling failed:', error);
        return Response.redirect('./', 303);
    }
}

// Periodic background sync (check for updates)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        // Check if there are any app updates
        console.log('Checking for updates...');
        
        // This could check a remote server for new versions
        // For now, just log the check
        console.log('Update check completed');
    } catch (error) {
        console.error('Update check failed:', error);
    }
}
