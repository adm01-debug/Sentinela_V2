import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

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

// a tela fala em "comportamento/risco", mas a analyze-activity usa outro enum
const ANALYSIS_TYPE_BY_REPORT: Record<string, string> = {
  productivity: 'productivity',
  behavior: 'patterns',
  risk: 'anomalies',
  summary: 'summary',
  all: 'all',
};

export function useAIAnalysisPage() {
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [analysisType, setAnalysisType] = useState<string>('summary');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // ai_analysis_reports guarda employee_name (texto), não o id do funcionário
  const selectedEmployeeName = useMemo(
    () => employees.find((e) => e.id === selectedEmployee)?.name,
    [employees, selectedEmployee]
  );

  const { data: analyses = [], isLoading, refetch } = useQuery({
    queryKey: ['ai-analyses', selectedEmployeeName ?? 'all', analysisType, dateRange],
    enabled: selectedEmployee === 'all' || Boolean(selectedEmployeeName),
    queryFn: async () => {
      let query = supabase
        .from('ai_analysis_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedEmployeeName) {
        query = query.eq('employee_name', selectedEmployeeName);
      }

      if (analysisType !== 'all') {
        query = query.eq('report_type', analysisType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((a: Record<string, unknown>) => ({
        id: String(a.id),
        employee_id: '',
        employee_name: typeof a.employee_name === 'string' ? a.employee_name : 'Desconhecido',
        analysis_type: (typeof a.report_type === 'string' ? a.report_type : 'summary') as 'productivity' | 'behavior' | 'risk' | 'summary',
        score: typeof a.risk_score === 'number' ? a.risk_score : 0,
        insights: Array.isArray(a.insights) ? a.insights as string[] : [],
        recommendations: Array.isArray(a.recommendations) ? a.recommendations as string[] : [],
        data: (a.raw_data as Record<string, unknown>) || {},
        created_at: String(a.created_at),
      })) as AIAnalysisResult[];
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async (params: { employeeName: string; type: string }) => {
      setIsAnalyzing(true);
      const { data, error } = await supabase.functions.invoke('analyze-activity', {
        body: {
          employee_name: params.employeeName,
          analysis_type: ANALYSIS_TYPE_BY_REPORT[params.type] ?? 'summary',
          date_from: dateRange?.from?.toISOString(),
          date_to: dateRange?.to?.toISOString(),
        },
      });
      if (error) throw error;

      const analysis = (data as { analysis?: Record<string, unknown> } | null)?.analysis;
      if (!analysis) throw new Error('A análise não retornou dados.');

      const productivity = analysis.productivity as { score?: number } | undefined;
      const anomalies = Array.isArray(analysis.anomalies) ? (analysis.anomalies as string[]) : [];
      const insights = [
        ...(typeof productivity?.score === 'number'
          ? [`Score de produtividade: ${productivity.score}%`]
          : []),
        ...anomalies,
      ];

      // a lista desta tela lê ai_analysis_reports: sem gravar, a análise não aparece
      const { error: insertError } = await supabase.from('ai_analysis_reports').insert({
        employee_name: params.employeeName,
        report_type: params.type,
        summary: `Análise de ${params.type} de ${params.employeeName}`,
        risk_score: typeof productivity?.score === 'number' ? productivity.score : null,
        insights,
        raw_data: analysis as unknown as Json,
        analysis_period_start: dateRange?.from?.toISOString() ?? null,
        analysis_period_end: dateRange?.to?.toISOString() ?? null,
      });
      if (insertError) throw insertError;
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
    if (!selectedEmployeeName) {
      toast({
        title: 'Selecione um funcionário',
        description: 'A análise de IA é gerada por funcionário.',
      });
      return;
    }
    runAnalysisMutation.mutate({ employeeName: selectedEmployeeName, type: type || analysisType });
  }, [selectedEmployeeName, analysisType, runAnalysisMutation, toast]);

  return {
    selectedEmployee,
    setSelectedEmployee,
    selectedEmployeeName,
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
