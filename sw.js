// Service Worker for Progressive Web App (PWA) Offline Cache & Installation
const CACHE_NAME = 'ai-agent-pwa-v1';
const ASSETS_TO_CACHE = [
    './',
    './app.html',
    './index.html',
    './manifest.webmanifest',
    './me.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                console.warn('Pre-cache partial warning:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Pass Google Gemini API calls directly to network without caching
    if (event.request.method !== 'GET' || event.request.url.includes('generativelanguage.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network fetch succeeds, return it
                return response;
            })
            .catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
    );
});
