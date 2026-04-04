// SecureWatch v2 — Sentinela
import React from 'react';
import './lib/i18n';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <React.Suspense fallback={<PageFallback />}>
      <AppProviders>
        <NetworkStatusBanner />
        <AppRoutes />
      </AppProviders>
    </React.Suspense>
  );
}
