// Service Worker para OnboardingAudit
const CACHE_NAME = 'onboardingaudit-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Archivos a cachear inmediatamente
const STATIC_FILES = [
  '/onboardingaudit/',
  '/onboardingaudit/manifest.json',
  '/onboardingaudit/_next/static/css/',
  '/onboardingaudit/_next/static/js/',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/',
];

// Estrategias de cache
const cacheStrategies = {
  // Cache First para assets estáticos
  static: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      // Fallback para offline
      return new Response('Offline content not available', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    }
  },

  // Network First para APIs
  api: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Stale While Revalidate para HTML
  html: async (request) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const networkResponsePromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    return cachedResponse || networkResponsePromise;
  }
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Assets estáticos (CSS, JS, imágenes)
    if (url.pathname.includes('/_next/static/') || 
        url.pathname.includes('/static/') ||
        url.pathname.includes('.css') ||
        url.pathname.includes('.js') ||
        url.pathname.includes('.png') ||
        url.pathname.includes('.jpg') ||
        url.pathname.includes('.svg')) {
      event.respondWith(cacheStrategies.static(request));
    }
    // APIs
    else if (url.pathname.includes('/api/')) {
      event.respondWith(cacheStrategies.api(request));
    }
    // HTML y navegación
    else {
      event.respondWith(cacheStrategies.html(request));
    }
  }
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 