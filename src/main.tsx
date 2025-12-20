import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Sentry before rendering
import { initSentry } from './lib/sentry';
initSentry();

// Register Service Worker for PWA with update notifications
import { registerServiceWorker, skipWaiting } from './lib/serviceWorker';

registerServiceWorker({
  onUpdate: (registration) => {
    // Show update notification - will be handled by PWAInstallPrompt component
    const event = new CustomEvent('swUpdate', { detail: { registration } });
    window.dispatchEvent(event);
  },
  onSuccess: () => {
    console.log('[PWA] App is ready for offline use');
  },
  onOffline: () => {
    // Show offline notification
    const event = new CustomEvent('appOffline');
    window.dispatchEvent(event);
  },
  onOnline: () => {
    // Show back online notification
    const event = new CustomEvent('appOnline');
    window.dispatchEvent(event);
  },
});

// Render application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
