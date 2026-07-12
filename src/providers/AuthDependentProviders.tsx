import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeatureFlagsProvider } from '@/lib/feature-flags/provider';
import { PermissionsProvider } from '@/lib/permissions/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TenantThemeProvider } from './TenantThemeProvider';

export const AuthDependentProviders = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <TooltipProvider delayDuration={200}>
      <FeatureFlagsProvider>
        <PermissionsProvider role={(user?.role as any) || 'viewer'}>
          <TenantThemeProvider>{children}</TenantThemeProvider>
        </PermissionsProvider>
      </FeatureFlagsProvider>
    </TooltipProvider>
  );
};
