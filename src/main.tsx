import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initWebVitals } from './lib/webVitals';
import { applySecurityHeaders } from './lib/securityHeaders';

// Apply security headers before rendering
applySecurityHeaders();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize performance monitoring
initWebVitals();
