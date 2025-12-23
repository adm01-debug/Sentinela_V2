import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

export function Router() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export { AppRoutes } from './routes';
export { PrivateRoute } from './PrivateRoute';
export { PublicRoute } from './PublicRoute';
