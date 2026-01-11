import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services';

export const useAlerts = (filters?: { severity?: string; acknowledged?: boolean }) => {
  return useQuery({ queryKey: ['alerts', filters], queryFn: () => alertService.list(filters) });
};

export const useAlert = (id: string) => {
  return useQuery({ queryKey: ['alert', id], queryFn: () => alertService.get(id), enabled: !!id });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.acknowledge(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); }
  });
};

export const useAcknowledgeAllAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => alertService.acknowledgeAll(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); }
  });
};

export const useAlertRules = () => {
  return useQuery({ queryKey: ['alert-rules'], queryFn: () => alertService.getRules() });
};