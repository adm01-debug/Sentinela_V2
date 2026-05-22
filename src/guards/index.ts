import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { BrandedSplash } from '@/components/ui/LoadingSpinner';

interface GuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <BrandedSplash />;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const GuestGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <BrandedSplash />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AdminGuard = ({ children }: GuardProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <BrandedSplash />;

  // Assuming roles are in user metadata or a specific field
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.endsWith('@securitywatch.com');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
