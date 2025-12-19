// ============================================================
// SERVICE WORKER REGISTRATION
// Handles PWA installation and updates
// ============================================================

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

// ============================================================
// REGISTRATION
// ============================================================

export function registerServiceWorker(config?: ServiceWorkerConfig) {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl);

      console.log('[SW] Service worker registered:', registration.scope);

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('[SW] New content available, please refresh');
              config?.onUpdate?.(registration);
            } else {
              // Content cached for offline use
              console.log('[SW] Content cached for offline use');
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  });

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[SW] Back online');
    config?.onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[SW] Gone offline');
    config?.onOffline?.();
  });
}

// ============================================================
// UNREGISTRATION
// ============================================================

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('[SW] Service worker unregistered');
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
  }
}

// ============================================================
// UPDATE CHECK
// ============================================================

export async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('[SW] Checked for updates');
  } catch (error) {
    console.error('[SW] Update check failed:', error);
  }
}

// ============================================================
// SKIP WAITING
// ============================================================

export function skipWaiting(registration: ServiceWorkerRegistration) {
  const waitingWorker = registration.waiting;
  if (!waitingWorker) return;

  waitingWorker.postMessage({ type: 'SKIP_WAITING' });

  // Reload page when new service worker activates
  waitingWorker.addEventListener('statechange', () => {
    if (waitingWorker.state === 'activated') {
      window.location.reload();
    }
  });
}

// ============================================================
// EXPORTS
// ============================================================

export default registerServiceWorker;
