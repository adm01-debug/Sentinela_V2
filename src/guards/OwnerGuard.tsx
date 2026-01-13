import React from 'react';
import { useAuth } from '@/hooks/useAuth';
export interface OwnerGuardProps { children: React.ReactNode; ownerId: string; fallback?: React.ReactNode; }
export const OwnerGuard: React.FC<OwnerGuardProps> = ({ children, ownerId, fallback }) => {
  const { user } = useAuth();
  const isOwner = user?.id === ownerId || user?.isAdmin;
  if (!isOwner) return fallback ? <>{fallback}</> : <div style={{ padding: 40, textAlign: 'center' }}>Access Denied</div>;
  return <>{children}</>;
};
export default OwnerGuard;
