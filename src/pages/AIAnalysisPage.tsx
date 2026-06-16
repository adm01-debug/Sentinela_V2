import {
  Brain,
  Play,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIAnalysisPage } from "@/hooks/useAIAnalysisPage";

const typeLabels: Record<string, string> = {
  productivity: "Produtividade",
  behavior: "Comportamento",
  risk: "Risco",
  summary: "Resumo",
};

const typeColors: Record<string, string> = {
  productivity: "bg-green-500/10 text-green-600",
  behavior: "bg-blue-500/10 text-blue-600",
  risk: "bg-red-500/10 text-red-600",
  summary: "bg-purple-500/10 text-purple-600",
};

export default function AIAnalysisPage() {
  const {
    selectedEmployee,
    setSelectedEmployee,
    analysisType,
    setAnalysisType,
    analyses,
    employees,
    stats,
    isLoading,
    isAnalyzing,
    handleRunAnalysis,
  } = useAIAnalysisPage();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Brain className="h-6 w-6 text-primary" />
            Análise com IA
          </h1>
          <p className="mt-1 text-muted-foreground">
            Insights e análises baseadas em inteligência artificial
          </p>
        </div>
        <Button onClick={() => handleRunAnalysis()} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isAnalyzing ? "Analisando..." : "Nova Análise"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Análises</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Score Médio</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.avgScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Análises de Risco</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.byType.risk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Insights</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stats.recentInsights.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="productivity">Produtividade</SelectItem>
            <SelectItem value="behavior">Comportamento</SelectItem>
            <SelectItem value="risk">Risco</SelectItem>
            <SelectItem value="summary">Resumo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhuma análise encontrada. Clique &quot;Nova Análise&quot; para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{analysis.employee_name}</CardTitle>
                    <Badge className={typeColors[analysis.analysis_type]}>
                      {typeLabels[analysis.analysis_type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Score: {analysis.score}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(analysis.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {analysis.insights.length > 0 && (
                  <div className="mb-3">
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-medium">
                      <Lightbulb className="h-3 w-3" /> Insights
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.insights.slice(0, 3).map((insight, i) => (
                        <li key={i} className="flex items-start gap-1">
                          • {String(insight)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">📋 Recomendações</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="flex items-start gap-1">
                          • {String(rec)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { AIAnalysisPage };
