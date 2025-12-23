import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LazyRoutes } from './LazyRoutes';
import { routeConfig } from './routeConfig';

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
      <Routes>
        {routeConfig.public.map(route => (
          <Route key={route.path} path={route.path} element={<PublicRoute><route.component /></PublicRoute>} />
        ))}
        {routeConfig.private.map(route => (
          <Route key={route.path} path={route.path} element={<PrivateRoute requiredRole={route.role}><route.component /></PrivateRoute>} />
        ))}
        <Route path="*" element={<LazyRoutes.NotFound />} />
      </Routes>
    </Suspense>
  );
}
