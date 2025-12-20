import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

type ExportType = 'employees' | 'violations' | 'activities' | 'reports';
type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  filters: Record<string, unknown>;
  record_count: number | null;
}

interface ExportConfig {
  type: ExportType;
  format: ExportFormat;
  dateRange?: { from: Date; to: Date };
  filters?: Record<string, unknown>;
}

export function useDataExportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<ExportType>('employees');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Fetch export history
  const historyQuery = useQuery({
    queryKey: queryKeys.exports.history,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ExportJob[];
    },
    refetchInterval: 5000, // Poll for status updates
  });

  // Stats computation
  const stats = useMemo(() => {
    const jobs = historyQuery.data || [];
    const total = jobs.length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    const failed = jobs.filter(j => j.status === 'failed').length;
    const processing = jobs.filter(j => j.status === 'processing' || j.status === 'pending').length;

    return { total, completed, failed, processing };
  }, [historyQuery.data]);

  // Create export mutation
  const createExportMutation = useMutation({
    mutationFn: async (config: ExportConfig) => {
      const { data, error } = await supabase
        .from('export_jobs')
        .insert({
          type: config.type,
          format: config.format,
          status: 'pending',
          progress: 0,
          filters: config.filters || {},
        })
        .select()
        .single();
      
      if (error) throw error;

      // Trigger the export edge function
      await supabase.functions.invoke('generate-export', {
        body: { jobId: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
      toast({ title: 'Exportação iniciada', description: 'Você será notificado quando estiver pronta' });
      setIsConfigOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao iniciar exportação', variant: 'destructive' });
    },
  });

  // Cancel export mutation
  const cancelExportMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('export_jobs')
        .update({ status: 'failed', error_message: 'Cancelado pelo usuário' })
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
      toast({ title: 'Exportação cancelada' });
    },
  });

  // Delete export mutation
  const deleteExportMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('export_jobs')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
      toast({ title: 'Exportação removida' });
    },
  });

  // Handlers
  const handleTypeChange = useCallback((type: ExportType) => {
    setSelectedType(type);
  }, []);

  const handleFormatChange = useCallback((format: ExportFormat) => {
    setSelectedFormat(format);
  }, []);

  const handleDateRangeChange = useCallback((range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);
  }, []);

  const handleOpenConfig = useCallback(() => {
    setIsConfigOpen(true);
  }, []);

  const handleCloseConfig = useCallback(() => {
    setIsConfigOpen(false);
  }, []);

  const handleStartExport = useCallback(() => {
    createExportMutation.mutate({
      type: selectedType,
      format: selectedFormat,
      dateRange: dateRange.from && dateRange.to 
        ? { from: dateRange.from, to: dateRange.to }
        : undefined,
    });
  }, [createExportMutation, selectedType, selectedFormat, dateRange]);

  const handleCancelExport = useCallback((jobId: string) => {
    cancelExportMutation.mutate(jobId);
  }, [cancelExportMutation]);

  const handleDeleteExport = useCallback((jobId: string) => {
    deleteExportMutation.mutate(jobId);
  }, [deleteExportMutation]);

  const handleDownload = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
  }, [queryClient]);

  return {
    // Data
    exports: historyQuery.data || [],
    stats,
    selectedType,
    selectedFormat,
    dateRange,
    isConfigOpen,
    
    // Loading states
    isLoading: historyQuery.isLoading,
    isRefreshing: historyQuery.isFetching,
    
    // Handlers
    handleTypeChange,
    handleFormatChange,
    handleDateRangeChange,
    handleOpenConfig,
    handleCloseConfig,
    handleStartExport,
    handleCancelExport,
    handleDeleteExport,
    handleDownload,
    handleRefresh,
    
    // Mutation states
    isExporting: createExportMutation.isPending,
  };
}
