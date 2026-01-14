import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services';
import type { Settings } from '@/types';

// Backward-compatible export used by UI components
export type ApplicationRule = import('@/data/settingsData').ApplicationRule;

export const useSettings = () => {
  return useQuery({ queryKey: ['settings'], queryFn: () => settingsService.get() });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<Settings>) => settingsService.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdateSettingsSection = <K extends keyof Settings>() => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ section, values }: { section: K; values: Partial<Settings[K]> }) =>
      settingsService.updateSection(section, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useTestSlackWebhook = () => {
  return useMutation({ mutationFn: (webhook: string) => settingsService.testSlackWebhook(webhook) });
};

export const useTestEmailSettings = () => {
  return useMutation({ mutationFn: (email: string) => settingsService.testEmailSettings(email) });
};

export const useAuditLog = () => {
  return useQuery({ queryKey: ['audit-log'], queryFn: () => settingsService.getAuditLog() });
};
