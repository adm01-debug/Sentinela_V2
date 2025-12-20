import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'productivity' | 'violations' | 'activity' | 'summary' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  schedule: 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  schedule_day?: number;
  recipients: string[];
  filters?: Record<string, unknown>;
  is_active: boolean;
  last_sent?: string;
  next_run?: string;
  created_at: string;
}

export interface ReportFormData {
  name: string;
  description: string;
  report_type: string;
  format: string;
  schedule: string;
  schedule_time: string;
  schedule_day?: number;
  recipients: string[];
  is_active: boolean;
}

export const REPORT_TYPES = [
  { value: 'productivity', label: 'Produtividade' },
  { value: 'violations', label: 'Violacoes' },
  { value: 'activity', label: 'Atividade' },
  { value: 'summary', label: 'Resumo Executivo' },
  { value: 'custom', label: 'Personalizado' },
];

const initialFormData: ReportFormData = {
  name: '',
  description: '',
  report_type: 'summary',
  format: 'pdf',
  schedule: 'weekly',
  schedule_time: '08:00',
  recipients: [],
  is_active: true,
};

export function useScheduledReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<ScheduledReport | null>(null);
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [newRecipient, setNewRecipient] = useState('');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase.from('scheduled_reports').select('*').order('name');
      if (error) throw error;
      return data as ScheduledReport[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const { error } = await supabase.from('scheduled_reports').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast({ title: 'Relatorio agendado!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReportFormData }) => {
      const { error } = await supabase.from('scheduled_reports').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast({ title: 'Atualizado!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast({ title: 'Excluido!' });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const runNowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke('generate-report', { body: { report_id: id } });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Relatorio sendo gerado!' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = !searchTerm || report.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [reports, searchTerm, typeFilter]);

  const stats = useMemo(() => ({
    total: reports.length,
    active: reports.filter(r => r.is_active).length,
    daily: reports.filter(r => r.schedule === 'daily').length,
    weekly: reports.filter(r => r.schedule === 'weekly').length,
    monthly: reports.filter(r => r.schedule === 'monthly').length,
  }), [reports]);

  const handleOpenCreate = useCallback(() => {
    setEditingReport(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description || '',
      report_type: report.report_type,
      format: report.format,
      schedule: report.schedule,
      schedule_time: report.schedule_time,
      schedule_day: report.schedule_day,
      recipients: report.recipients || [],
      is_active: report.is_active,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingReport(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingReport, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingReport) {
      deleteMutation.mutate(deletingReport.id);
    }
  }, [deletingReport, deleteMutation]);

  const handleAddRecipient = useCallback(() => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData({ ...formData, recipients: [...formData.recipients, newRecipient] });
      setNewRecipient('');
    }
  }, [newRecipient, formData]);

  const handleRemoveRecipient = useCallback((email: string) => {
    setFormData({ ...formData, recipients: formData.recipients.filter(r => r !== email) });
  }, [formData]);

  return {
    searchTerm, setSearchTerm, typeFilter, setTypeFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingReport, deletingReport, setDeletingReport,
    formData, setFormData, newRecipient, setNewRecipient,
    reports: filteredReports, stats, isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRunning: runNowMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleAddRecipient, handleRemoveRecipient,
    handleRunNow: (id: string) => runNowMutation.mutate(id),
    REPORT_TYPES,
  };
}
