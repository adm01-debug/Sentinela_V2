import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeatureFlagsProvider } from '@/lib/feature-flags/provider';
import { PermissionsProvider } from '@/lib/permissions/provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const AuthDependentProviders = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  return (
    <TooltipProvider delayDuration={200}>
      <FeatureFlagsProvider>
        <PermissionsProvider role={user?.role || 'viewer'}>
          {children}
        </PermissionsProvider>
      </FeatureFlagsProvider>
    </TooltipProvider>
  );
};
