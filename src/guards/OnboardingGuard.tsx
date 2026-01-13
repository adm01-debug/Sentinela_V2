import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export interface OnboardingGuardProps { children: React.ReactNode; redirectTo?: string; }
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children, redirectTo = '/onboarding' }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (user && !user.onboardingCompleted) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};
export default OnboardingGuard;
