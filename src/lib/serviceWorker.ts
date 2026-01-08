interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker(config?: ServiceWorkerConfig) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Handle online/offline events
  window.addEventListener('online', () => {
    config?.onOnline?.();
  });

  window.addEventListener('offline', () => {
    config?.onOffline?.();
  });

  // Only register in production
  if (import.meta.env.PROD) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                config?.onUpdate?.(registration);
              } else {
                // Content is cached for offline use
                config?.onSuccess?.(registration);
              }
            }
          };
        };
      } catch (error) {
        console.error('[ServiceWorker] Registration failed:', error);
      }
    });
  } else {
    if (import.meta.env.DEV) {
      console.log('[ServiceWorker] Skipping registration in development mode');
    }
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  } catch (error) {
    console.error('[ServiceWorker] Unregistration failed:', error);
  }
}