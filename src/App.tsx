// SecureWatch v2 — Sentinela
import React from 'react';
import './lib/i18n';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { BrandedSplash } from './components/ui/LoadingSpinner';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';

export default function App() {
  return (
    <React.Suspense fallback={<BrandedSplash />}>
      <AppProviders>
        <NetworkStatusBanner />
        <AppRoutes />
      </AppProviders>
    </React.Suspense>
  );
}
