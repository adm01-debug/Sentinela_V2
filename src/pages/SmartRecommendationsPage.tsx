import { CheckCircle2, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  recommendationEffortLabel,
  recommendationImpactLabel,
  recommendationImpactVariant,
  recommendationMetricLabel,
  recommendationTypeLabel,
  useSmartRecommendationsPage,
} from "@/hooks/useSmartRecommendationsPage";

const PRIORITY_OPTIONS = [
  { value: "0", label: "Todas as prioridades" },
  { value: "70", label: "Prioridade 70 ou mais" },
  { value: "85", label: "Prioridade 85 ou mais" },
];

export default function SmartRecommendationsPage() {
  const {
    recommendations,
    metadata,
    types,
    typeFilter,
    minPriority,
    total,
    highPriorityCount,
    setTypeFilter,
    setMinPriority,
    isLoading,
    isError,
    error,
    isRefreshing,
    handleRefresh,
  } = useSmartRecommendationsPage();

  const analyzed = metadata?.dataAnalyzed;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="text-primary h-6 w-6" />
            Recomendações inteligentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Sugestões geradas a partir da atividade monitorada, das violações e da cobertura de
            funcionários da sua empresa
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <span className="text-muted-foreground text-sm">Recomendações ativas</span>
            <p className="mt-2 text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <span className="text-muted-foreground text-sm">Prioridade alta (85+)</span>
            <p className="mt-2 text-3xl font-bold">{highPriorityCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <span className="text-muted-foreground text-sm">Tipos identificados</span>
            <p className="mt-2 text-3xl font-bold">{types.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Tipo de recomendação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {recommendationTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(minPriority)}
          onValueChange={(value) => setMinPriority(Number(value))}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Prioridade mínima" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar as recomendações</AlertTitle>
          <AlertDescription>
            {error?.message ?? "Erro ao executar a análise."} Tente novamente em alguns instantes.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !isError && recommendations.length === 0 ? (
        <Alert>
          <AlertTitle>Nenhuma recomendação no momento</AlertTitle>
          <AlertDescription>
            A análise só gera sugestões quando encontra volume relevante de atividade, violações ou
            funcionários sem coleta. Ajuste os filtros ou aguarde novos dados.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        {recommendations.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="text-primary h-4 w-4" />
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{recommendationTypeLabel(item.type)}</Badge>
                  <Badge variant={recommendationImpactVariant(item.impact)}>
                    {recommendationImpactLabel(item.impact)}
                  </Badge>
                  <Badge variant="secondary">Prioridade {item.priority ?? 0}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.actions?.length ? (
                <div>
                  <p className="mb-2 text-sm font-medium">Ações sugeridas</p>
                  <ul className="space-y-1">
                    {item.actions.map((action) => (
                      <li
                        key={action}
                        className="text-muted-foreground flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {Object.entries(item.metrics ?? {}).map(([key, value]) => (
                  <span
                    key={key}
                    className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs"
                  >
                    {recommendationMetricLabel(key)}: {String(value)}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground text-xs">
                Esforço estimado: {recommendationEffortLabel(item.effort)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {analyzed ? (
        <p className="text-muted-foreground text-xs">
          Base analisada: {analyzed.activities ?? 0} registros de atividade,{" "}
          {analyzed.violations ?? 0} violações e {analyzed.employees ?? 0} funcionários ativos.
          {metadata?.generatedAt
            ? ` Gerado em ${new Date(metadata.generatedAt).toLocaleString("pt-BR")}.`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
