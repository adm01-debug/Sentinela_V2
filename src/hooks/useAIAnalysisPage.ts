import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysisResult {
  id: string;
  employee_id: string;
  employee_name: string;
  analysis_type: 'productivity' | 'behavior' | 'risk' | 'summary';
  score: number;
  insights: string[];
  recommendations: string[];
  data: unknown;
  created_at: string;
}

export interface AIInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  confidence: number;
}

export function useAIAnalysisPage() {
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [analysisType, setAnalysisType] = useState<string>('summary');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analyses = [], isLoading, refetch } = useQuery({
    queryKey: ['ai-analyses', selectedEmployee, analysisType, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('ai_analysis_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedEmployee !== 'all') {
        query = query.eq('employee_name', selectedEmployee);
      }

      if (analysisType !== 'all') {
        query = query.eq('report_type', analysisType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(a: unknown => ({
        id: a.id,
        employee_id: '',
        employee_name: a.employee_name || 'Desconhecido',
        analysis_type: a.report_type as 'productivity' | 'behavior' | 'risk' | 'summary',
        score: a.risk_score || 0,
        insights: Array.isArray(a.insights) ? a.insights as string[] : [],
        recommendations: Array.isArray(a.recommendations) ? a.recommendations as string[] : [],
        data: a.raw_data as Record<string, unknown> || {},
        created_at: a.created_at,
      })) as AIAnalysisResult[];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async (params: { employee_id?: string; type: string }) => {
      setIsAnalyzing(true);
      const { error } = await supabase.functions.invoke('analyze-activity', {
        body: {
          employee_id: params.employee_id || undefined,
          analysis_type: params.type,
          date_from: dateRange?.from?.toISOString(),
          date_to: dateRange?.to?.toISOString(),
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Analise concluida!' });
      refetch();
      setIsAnalyzing(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na analise', description: error.message, variant: 'destructive' });
      setIsAnalyzing(false);
    },
  });

  const stats = useMemo(() => {
    const avgScore = analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
      : 0;

    const byType = {
      productivity: analyses.filter(a => a.analysis_type === 'productivity').length,
      behavior: analyses.filter(a => a.analysis_type === 'behavior').length,
      risk: analyses.filter(a => a.analysis_type === 'risk').length,
      summary: analyses.filter(a => a.analysis_type === 'summary').length,
    };

    const recentInsights = analyses
      .slice(0, 5)
      .flatMap(a => a.insights || []);

    return { total: analyses.length, avgScore, byType, recentInsights };
  }, [analyses]);

  const handleRunAnalysis = useCallback((type?: string) => {
    runAnalysisMutation.mutate({
      employee_id: selectedEmployee !== 'all' ? selectedEmployee : undefined,
      type: type || analysisType,
    });
  }, [selectedEmployee, analysisType, runAnalysisMutation]);

  return {
    selectedEmployee,
    setSelectedEmployee,
    analysisType,
    setAnalysisType,
    dateRange,
    setDateRange,
    analyses,
    employees,
    stats,
    isLoading,
    isAnalyzing,
    handleRunAnalysis,
  };
}
