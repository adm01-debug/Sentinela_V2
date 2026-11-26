import { Minus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FORECAST_DAY_OPTIONS,
  forecastDirectionLabel,
  useTrendForecastPage,
  type TrendForecast,
} from "@/hooks/useTrendForecastPage";
import { useChartColors } from "@/hooks/useChartColors";

function DirectionIcon({ direction }: { direction: TrendForecast["direction"] }) {
  if (direction === "up") return <TrendingUp className="h-5 w-5 text-orange-500" />;
  if (direction === "down") return <TrendingDown className="h-5 w-5 text-green-500" />;
  return <Minus className="text-muted-foreground h-5 w-5" />;
}

function directionVariant(direction: TrendForecast["direction"]) {
  if (direction === "stable") return "secondary" as const;
  return "outline" as const;
}

export default function TrendForecastPage() {
  const {
    forecasts,
    days,
    setDays,
    generatedAt,
    worseningViolations,
    isLoading,
    isError,
    error,
    isRefreshing,
    handleRefresh,
  } = useTrendForecastPage();
  const colors = useChartColors();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="text-primary h-6 w-6" />
            Previsão de tendências
          </h1>
          <p className="text-muted-foreground mt-1">
            Projeção dos próximos {days} dias com base nos últimos 30 dias de dados da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Horizonte" />
            </SelectTrigger>
            <SelectContent>
              {FORECAST_DAY_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  Próximos {option} dias
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            {isRefreshing ? "Calculando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      {worseningViolations ? (
        <Alert variant="destructive">
          <AlertTitle>Violações em alta</AlertTitle>
          <AlertDescription>
            A projeção indica aumento de violações no período. Reforce as políticas com maior
            incidência.
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível calcular a previsão</AlertTitle>
          <AlertDescription>
            {error?.message ?? "Erro ao executar o cálculo."} Tente novamente em alguns instantes.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !isError && forecasts.length === 0 ? (
        <Alert>
          <AlertTitle>Sem série histórica suficiente</AlertTitle>
          <AlertDescription>
            A previsão exige pelo menos 7 dias de dados por métrica (atividade, violações e
            produtividade). Assim que houver histórico, os números aparecem aqui.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {forecasts.map((forecast) => (
          <Card key={forecast.metric}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DirectionIcon direction={forecast.direction} />
                  {forecast.label}
                </CardTitle>
                <Badge variant={directionVariant(forecast.direction)}>
                  {forecastDirectionLabel(forecast.direction)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Hoje</p>
                  <p className="text-xl font-semibold">{forecast.currentValue ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Previsto</p>
                  <p className="text-xl font-semibold">{forecast.predictedValue ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Variação</p>
                  <p
                    className={
                      forecast.percentChange >= 0
                        ? "text-xl font-semibold text-orange-500"
                        : "text-xl font-semibold text-green-500"
                    }
                  >
                    {forecast.percentChange >= 0 ? "+" : ""}
                    {forecast.percentChange.toFixed(1)}%
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                Unidade: {forecast.unit || forecast.metric} · Confiança{" "}
                {(forecast.confidence * 100).toFixed(0)}%
              </p>

              {forecast.dataPoints.length >= 2 ? (
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast.dataPoints}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip labelFormatter={(label) => `Data: ${label}`} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={forecast.label}
                        stroke={colors.primary}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Série histórica insuficiente para desenhar o gráfico.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {generatedAt ? (
        <p className="text-muted-foreground text-xs">
          Calculado em {new Date(generatedAt).toLocaleString("pt-BR")}.
        </p>
      ) : null}
    </div>
  );
}
