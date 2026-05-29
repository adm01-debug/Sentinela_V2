import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { BrandedSplash } from '@/components/ui/LoadingSpinner';

interface GuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <BrandedSplash />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedSplash />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: GuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedSplash />;
  }

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true || user?.email?.endsWith('@securitywatch.com');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function SupervisorGuard({ children }: GuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <BrandedSplash />;
  }

  const hasAccess = user?.role === 'admin' || user?.isAdmin === true || user?.role === 'supervisor' || user?.email?.endsWith('@securitywatch.com');

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
