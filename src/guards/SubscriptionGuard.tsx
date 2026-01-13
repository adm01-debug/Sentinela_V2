import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
export interface SubscriptionGuardProps { children: React.ReactNode; plans: string[]; fallback?: React.ReactNode; redirectTo?: string; }
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children, plans, fallback, redirectTo = '/billing' }) => {
  const { subscription, isLoading } = useSubscription();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  const hasAccess = subscription && plans.includes(subscription.plan);
  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};
export default SubscriptionGuard;
