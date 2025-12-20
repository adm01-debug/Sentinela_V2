import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

type ReportType = 'productivity' | 'violations' | 'attendance' | 'summary';
interface Report { id: string; name: string; type: ReportType; status: 'pending' | 'generating' | 'completed' | 'failed'; created_at: string; file_url: string | null; }

export function useReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType>('summary');

  const reportsQuery = useQuery({
    queryKey: queryKeys.reports.list({ type: typeFilter }),
    queryFn: async () => {
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(20);
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    },
    refetchInterval: 5000,
  });

  const stats = useMemo(() => {
    const reports = reportsQuery.data || [];
    return {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      pending: reports.filter(r => r.status === 'pending' || r.status === 'generating').length,
      failed: reports.filter(r => r.status === 'failed').length,
    };
  }, [reportsQuery.data]);

  const generateMutation = useMutation({
    mutationFn: async (type: ReportType) => {
      const { data, error } = await supabase.from('reports').insert({ type, name: type + '_' + Date.now(), status: 'pending' }).select().single();
      if (error) throw error;
      await supabase.functions.invoke('generate-report', { body: { reportId: data.id } });
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }); toast({ title: 'Relatório em geração!' }); setIsGenerateOpen(false); },
    onError: () => { toast({ title: 'Erro ao gerar', variant: 'destructive' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('reports').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }); toast({ title: 'Relatório removido' }); },
  });

  return {
    reports: reportsQuery.data || [],
    stats, typeFilter, isGenerateOpen, selectedType, isLoading: reportsQuery.isLoading,
    setTypeFilter, setIsGenerateOpen, setSelectedType,
    handleGenerate: useCallback(() => generateMutation.mutate(selectedType), [generateMutation, selectedType]),
    handleDelete: useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]),
    handleDownload: useCallback((url: string) => window.open(url, '_blank'), []),
    isGenerating: generateMutation.isPending,
  };
}
