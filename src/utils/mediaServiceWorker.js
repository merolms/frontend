/**
 * Service Worker registration and auth token bridging.
 * Allows the Service Worker to access the JWT token from localStorage
 * via BroadcastChannel communication.
 */

let swRegistration = null;

/**
 * Register the Service Worker and set up the auth token bridge.
 * Call this once when the app initializes.
 */
export async function registerMediaServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Set up BroadcastChannel to provide token to Service Worker
    const channel = new BroadcastChannel('meroedu_auth');
    channel.onmessage = (event) => {
      if (event.data.type === 'GET_TOKEN') {
        const token = localStorage.getItem('auth_token');
        channel.postMessage({ type: 'TOKEN_RESPONSE', token });
      }
    };

    console.log('Media Service Worker registered');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Unregister the Service Worker.
 */
export async function unregisterMediaServiceWorker() {
  if (swRegistration) {
    await swRegistration.unregister();
    swRegistration = null;
  }
}
