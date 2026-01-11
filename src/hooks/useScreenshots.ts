import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { screenshotService } from '@/services';

export const useScreenshots = (employeeId: string, date: string) => {
  return useQuery({
    queryKey: ['screenshots', employeeId, date],
    queryFn: () => screenshotService.list(employeeId, date),
    enabled: !!employeeId && !!date
  });
};

export const useScreenshot = (id: string) => {
  return useQuery({
    queryKey: ['screenshot', id],
    queryFn: () => screenshotService.get(id),
    enabled: !!id
  });
};

export const useLatestScreenshot = (employeeId: string) => {
  return useQuery({
    queryKey: ['latest-screenshot', employeeId],
    queryFn: () => screenshotService.getLatest(employeeId),
    enabled: !!employeeId,
    refetchInterval: 60000
  });
};

export const useDeleteScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => screenshotService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['screenshots'] }); }
  });
};

export const useBulkDeleteScreenshots = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => screenshotService.bulkDelete(ids),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['screenshots'] }); }
  });
};