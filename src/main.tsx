import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./lib/webVitals";
import { applySecurityHeaders } from "./lib/securityHeaders";
import { initErrorTracking } from "./lib/errorTracker";
import { initPerformanceMonitoring } from "./lib/performanceBudget";
import { injectStructuredData } from "./lib/structuredData";

// Apply security headers and SEO before rendering
applySecurityHeaders();
initPerformanceMonitoring();
injectStructuredData();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize performance monitoring & error tracking
initWebVitals();
initErrorTracking();
