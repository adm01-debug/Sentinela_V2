import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Loader2,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Target,
  Calendar,
  User,
  Users,
  RefreshCw,
  Trash2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIReport {
  id: string;
  employee_name: string | null;
  report_type: string;
  summary: string;
  risk_score: number;
  recommendations: any[];
  insights: any;
  raw_data: any;
  created_at: string;
  analysis_period_start: string;
  analysis_period_end: string;
}

interface AnalysisResult {
  summary: string;
  risk_score: number;
  insights: any[];
  recommendations: any[];
  concerns: any[];
  raw_data: any;
}

export default function AIAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [formData, setFormData] = useState({
    report_type: 'general' as 'individual' | 'team' | 'general',
    employee_name: '',
    period_days: 7
  });

  const [employees, setEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchReports();
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_analysis_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data as AIReport[]);
    } catch (error: any) {
      toast.error('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await supabase
        .from('keystroke_logs')
        .select('employee_name')
        .limit(100);
      
      const uniqueEmployees = [...new Set(data?.map(d => d.employee_name) || [])];
      setEmployees(uniqueEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await supabase.functions.invoke('analyze-activity', {
        body: {
          report_type: formData.report_type,
          employee_name: formData.report_type === 'individual' ? formData.employee_name : undefined,
          period_days: formData.period_days
        }
      });

      if (response.error) throw response.error;
      
      const result = response.data;
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setAnalysisResult(result.report);
      toast.success('Análise concluída!');
      fetchReports();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Erro na análise: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_analysis_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
      toast.success('Relatório excluído');
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-success';
    if (score <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 30) return 'bg-success';
    if (score <= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const displayResult = analysisResult || (selectedReport ? {
    summary: selectedReport.summary,
    risk_score: selectedReport.risk_score,
    insights: selectedReport.insights?.insights || [],
    recommendations: selectedReport.recommendations || [],
    concerns: selectedReport.insights?.concerns || [],
    raw_data: selectedReport.raw_data
  } : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise com IA
            </h1>
            <p className="text-sm text-muted-foreground">Relatórios inteligentes e recomendações</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Analysis Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Nova Análise</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Relatório</Label>
                  <Select
                    value={formData.report_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, report_type: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Geral (Toda equipe)
                        </div>
                      </SelectItem>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Individual
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.report_type === 'individual' && (
                  <div className="space-y-2">
                    <Label>Funcionário</Label>
                    <Select
                      value={formData.employee_name}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, employee_name: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Período de Análise</Label>
                  <Select
                    value={formData.period_days.toString()}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, period_days: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Último dia</SelectItem>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="14">Últimos 14 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={runAnalysis} 
                  disabled={analyzing || (formData.report_type === 'individual' && !formData.employee_name)}
                  className="w-full gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Gerar Análise
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Previous Reports */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Relatórios Anteriores</h2>
                <Button variant="ghost" size="icon" onClick={fetchReports}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum relatório ainda
                  </p>
                ) : reports.map(report => (
                  <div 
                    key={report.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReport?.id === report.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => { setSelectedReport(report); setAnalysisResult(null); }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {report.report_type === 'individual' ? report.employee_name : 'Geral'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      <span className={`ml-auto font-medium ${getRiskColor(report.risk_score)}`}>
                        Risco: {report.risk_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {analyzing && (
              <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center">
                <Brain className="h-16 w-16 text-primary animate-pulse mb-4" />
                <p className="text-lg font-medium">Analisando dados com IA...</p>
                <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
              </div>
            )}

            {!analyzing && !displayResult && (
              <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Nenhuma análise selecionada</p>
                <p className="text-sm">Gere uma nova análise ou selecione um relatório anterior</p>
              </div>
            )}

            {!analyzing && displayResult && (
              <>
                {/* Risk Score */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Pontuação de Risco
                    </h2>
                    <span className={`text-3xl font-bold ${getRiskColor(displayResult.risk_score)}`}>
                      {displayResult.risk_score}/100
                    </span>
                  </div>
                  <Progress 
                    value={displayResult.risk_score} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Baixo Risco</span>
                    <span>Médio Risco</span>
                    <span>Alto Risco</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumo Executivo
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{displayResult.summary}</p>
                </div>

                {/* Insights */}
                {displayResult.insights?.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Insights
                    </h2>
                    <div className="space-y-3">
                      {displayResult.insights.map((insight: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-accent/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {insight.category || 'Geral'}
                            </Badge>
                            {insight.impact && (
                              <Badge 
                                variant={insight.impact === 'alto' ? 'destructive' : insight.impact === 'médio' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                Impacto {insight.impact}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{insight.finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {displayResult.recommendations?.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-warning" />
                      Recomendações
                    </h2>
                    <div className="space-y-3">
                      {displayResult.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={rec.priority === 'alta' ? 'destructive' : rec.priority === 'média' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              Prioridade {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{rec.action}</p>
                          {rec.reason && (
                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {displayResult.concerns?.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Áreas de Preocupação
                    </h2>
                    <div className="space-y-3">
                      {displayResult.concerns.map((concern: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                          <p className="text-sm font-medium mb-1">{concern.area}</p>
                          <p className="text-xs text-muted-foreground mb-2">{concern.description}</p>
                          {concern.suggested_action && (
                            <p className="text-xs text-primary">
                              <strong>Ação sugerida:</strong> {concern.suggested_action}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Data Stats */}
                {displayResult.raw_data && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold mb-4">Dados Analisados</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{displayResult.raw_data.keystrokesCount?.toLocaleString() || 0}</p>
                        <p className="text-xs text-muted-foreground">Teclas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{displayResult.raw_data.clicksCount?.toLocaleString() || 0}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{displayResult.raw_data.violationsCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Violações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{displayResult.raw_data.period_days || 7}</p>
                        <p className="text-xs text-muted-foreground">Dias</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
