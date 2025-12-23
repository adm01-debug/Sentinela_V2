import { useMutation, useQueryClient } from '@tanstack/react-query';
import { screenshotsApi } from '@/api/screenshots';
import { screenshotsQueryKeys } from '@/queries/useScreenshotsQuery';

export function useCreateScreenshots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => screenshotsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: screenshotsQueryKeys.all }),
  });
}

export function useUpdateScreenshots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => screenshotsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: screenshotsQueryKeys.all }),
  });
}

export function useDeleteScreenshots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => screenshotsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: screenshotsQueryKeys.all }),
  });
}
