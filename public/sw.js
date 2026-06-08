// Service Worker for MeroEdu
// Intercepts media requests and adds JWT Authorization header
// This allows browser-native <video>, <img>, <audio> elements to make
// authenticated requests with proper range request support for seeking

const MEDIA_PATTERN = /\/media\//;

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept media requests
  if (!MEDIA_PATTERN.test(url.pathname)) {
    return;
  }

  // Get token from localStorage (accessible via postMessage from main thread)
  // We use a simple approach: clone the request and add the auth header
  event.respondWith(
    (async () => {
      try {
        // Get the token from the main thread via message channel
        const token = await getTokenFromMainThread();

        if (!token) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Clone the request and add Authorization header
        const headers = new Headers(event.request.headers);
        headers.set('Authorization', `Bearer ${token}`);

        const authenticatedRequest = new Request(event.request, {
          headers,
        });

        return fetch(authenticatedRequest);
      } catch (error) {
        console.error('Service Worker fetch error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    })()
  );
});

// Get token from main thread
function getTokenFromMainThread() {
  return new Promise((resolve) => {
    // Broadcast channel to communicate with main thread
    const channel = new BroadcastChannel('meroedu_auth');
    channel.postMessage({ type: 'GET_TOKEN' });

    const timeout = setTimeout(() => {
      channel.close();
      resolve(null);
    }, 1000);

    channel.onmessage = (event) => {
      if (event.data.type === 'TOKEN_RESPONSE') {
        clearTimeout(timeout);
        channel.close();
        resolve(event.data.token);
      }
    };
  });
}

// Handle installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Handle activation
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
