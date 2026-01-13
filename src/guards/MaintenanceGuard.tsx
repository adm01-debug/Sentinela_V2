import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppConfig } from '@/hooks/useAppConfig';
export interface MaintenanceGuardProps { children: React.ReactNode; }
export const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { config, isLoading } = useAppConfig();
  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (config?.maintenanceMode) return <Navigate to="/maintenance" replace />;
  return <>{children}</>;
};
export default MaintenanceGuard;
