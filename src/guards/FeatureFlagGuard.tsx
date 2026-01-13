import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
export interface FeatureFlagGuardProps { children: React.ReactNode; flag: string; fallback?: React.ReactNode; }
export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({ children, flag, fallback }) => {
  const { isEnabled } = useFeatureFlags();
  if (!isEnabled(flag)) return fallback ? <>{fallback}</> : null;
  return <>{children}</>;
};
export default FeatureFlagGuard;
