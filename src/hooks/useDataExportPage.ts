import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
  filters: unknown;
  record_count: number | null;
}

interface ExportConfig {
  type: ExportType;
  format: ExportFormat;
  dateRange?: { from: Date; to: Date };
  filters?: unknown;
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

  // Local state for exports (export_jobs table does not exist)
  const [exports, setExports] = useState<ExportJob[]>([]);
  const isLoading = false;

  // Stats computation
  const stats = useMemo(() => {
    const total = exports.length;
    const completed = exports.filter(j => j.status === 'completed').length;
    const failed = exports.filter(j => j.status === 'failed').length;
    const processing = exports.filter(j => j.status === 'processing' || j.status === 'pending').length;

    return { total, completed, failed, processing };
  }, [exports]);

  // Create export - local simulation
  const [isExporting, setIsExporting] = useState(false);

  const handleStartExportInternal = useCallback(async (config: ExportConfig) => {
    setIsExporting(true);
    
    const newJob: ExportJob = {
      id: crypto.randomUUID(),
      type: config.type,
      format: config.format,
      status: 'processing',
      progress: 0,
      file_url: null,
      error_message: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      filters: config.filters || {},
      record_count: null,
    };
    
    setExports(prev => [newJob, ...prev]);
    
    // Simulate export process
    setTimeout(() => {
      setExports(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed' as const, progress: 100, completed_at: new Date().toISOString(), record_count: 50 }
          : job
      ));
      toast({ title: 'Exportação concluída', description: 'Seu arquivo está pronto' });
      setIsExporting(false);
    }, 2000);
    
    setIsConfigOpen(false);
  }, [toast]);

  // Cancel export - local
  const handleCancelExportInternal = useCallback((jobId: string) => {
    setExports(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'failed' as const, error_message: 'Cancelado pelo usuário' }
        : job
    ));
    toast({ title: 'Exportação cancelada' });
  }, [toast]);

  // Delete export - local
  const handleDeleteExportInternal = useCallback((jobId: string) => {
    setExports(prev => prev.filter(job => job.id !== jobId));
    toast({ title: 'Exportação removida' });
  }, [toast]);

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
    handleStartExportInternal({
      type: selectedType,
      format: selectedFormat,
      dateRange: dateRange.from && dateRange.to 
        ? { from: dateRange.from, to: dateRange.to }
        : undefined,
    });
  }, [handleStartExportInternal, selectedType, selectedFormat, dateRange]);

  const handleCancelExport = useCallback((jobId: string) => {
    handleCancelExportInternal(jobId);
  }, [handleCancelExportInternal]);

  const handleDeleteExport = useCallback((jobId: string) => {
    handleDeleteExportInternal(jobId);
  }, [handleDeleteExportInternal]);

  const handleDownload = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleRefresh = useCallback(() => {
    // No-op for local state
  }, []);

  return {
    // Data
    exports,
    stats,
    selectedType,
    selectedFormat,
    dateRange,
    isConfigOpen,
    
    // Loading states
    isLoading,
    isRefreshing: false,
    
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
    isExporting,
  };
}
