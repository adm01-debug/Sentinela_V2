import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SmartRecommendationsPage from "@/pages/SmartRecommendationsPage";
import TrendForecastPage from "@/pages/TrendForecastPage";

vi.mock("@/hooks/useChartColors", () => ({
  useChartColors: () => ({ primary: "#000" }),
}));

const RECOMMENDATIONS_PAYLOAD = {
  recommendations: [
    {
      id: "rec-1",
      type: "policy",
      title: "Revisar política de senhas",
      description: "Muitas violações ligadas a credenciais fracas",
      impact: "high",
      effort: "medium",
      priority: 90,
      actions: ["Atualizar política", "Treinar equipe"],
      metrics: { violationCount: 12, avgProductivity: 71 },
    },
    {
      id: "rec-2",
      type: "resource",
      title: "Cobrir setor sem coleta",
      description: "Funcionários sem nenhuma atividade registrada",
      impact: "medium",
      effort: "low",
      priority: 60,
      actions: ["Instalar agente de coleta"],
      metrics: { lowActivityCount: 3 },
    },
  ],
  metadata: {
    context: "company",
    generatedAt: "2026-01-20T10:00:00.000Z",
    dataAnalyzed: { activities: 1200, violations: 12, employees: 40 },
  },
};

const FORECAST_PAYLOAD = {
  forecasts: [
    {
      metric: "activity_count",
      currentValue: 100,
      predictedValue: 120,
      trend: "increasing",
      confidence: 0.82,
      timeframe: "next 7 days",
      dataPoints: [
        { date: "2026-01-18", value: 95 },
        { date: "2026-01-19", value: 100 },
        { date: "2026-01-20", value: 104 },
      ],
    },
    {
      metric: "violation_count",
      currentValue: 5,
      predictedValue: 7,
      trend: "increasing",
      confidence: 0.7,
      timeframe: "next 7 days",
      dataPoints: [
        { date: "2026-01-18", value: 4 },
        { date: "2026-01-19", value: 5 },
      ],
    },
    {
      metric: "productivity_score",
      currentValue: 80,
      predictedValue: 78.4,
      trend: "decreasing",
      confidence: 0.6,
      timeframe: "next 7 days",
      dataPoints: [
        { date: "2026-01-18", value: 81 },
        { date: "2026-01-19", value: 80 },
      ],
    },
  ],
  metadata: { forecastDays: 7, generatedAt: "2026-01-20T10:00:00.000Z" },
};

const invoke = vi.mocked(supabase.functions.invoke);

function renderPage(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  invoke.mockReset();
});

describe("SmartRecommendationsPage", () => {
  it("lista as recomendações da edge com prioridade, ações e base analisada", async () => {
    invoke.mockResolvedValue({ data: RECOMMENDATIONS_PAYLOAD, error: null } as never);

    renderPage(<SmartRecommendationsPage />);

    expect(await screen.findByText("Revisar política de senhas")).toBeTruthy();
    expect(screen.getByText("Cobrir setor sem coleta")).toBeTruthy();
    expect(screen.getByText("Prioridade 90")).toBeTruthy();
    expect(screen.getByText("Atualizar política")).toBeTruthy();
    expect(screen.getByText("Impacto alto")).toBeTruthy();
    expect(screen.getByText(/40 funcionários ativos/)).toBeTruthy();
    expect(invoke).toHaveBeenCalledWith("smart-recommendations", { body: { limit: 20 } });
  });

  it("mostra estado vazio quando a edge não retorna recomendações", async () => {
    invoke.mockResolvedValue({
      data: { recommendations: [], metadata: { dataAnalyzed: { activities: 0 } } },
      error: null,
    } as never);

    renderPage(<SmartRecommendationsPage />);

    expect(await screen.findByText("Nenhuma recomendação no momento")).toBeTruthy();
  });

  it("mostra erro quando a edge falha", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("falha simulada") } as never);

    renderPage(<SmartRecommendationsPage />);

    expect(await screen.findByText("Não foi possível carregar as recomendações")).toBeTruthy();
    expect(screen.getByText(/falha simulada/)).toBeTruthy();
  });
});

describe("TrendForecastPage", () => {
  it("projeta as três métricas com direção, variação e confiança", async () => {
    invoke.mockResolvedValue({ data: FORECAST_PAYLOAD, error: null } as never);

    renderPage(<TrendForecastPage />);

    expect(await screen.findByText("Atividade monitorada")).toBeTruthy();
    expect(screen.getByText("Violações de política")).toBeTruthy();
    expect(screen.getByText("Produtividade média")).toBeTruthy();
    expect(screen.getByText("+20.0%")).toBeTruthy();
    expect(screen.getByText("-2.0%")).toBeTruthy();
    expect(screen.getByText("Violações em alta")).toBeTruthy();
    expect(screen.getByText(/Confiança 82%/)).toBeTruthy();
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith("trend-forecasting", {
        body: { metrics: ["activity", "violations", "productivity"], forecastDays: 7 },
      })
    );
  });

  it("avisa quando não há série histórica suficiente", async () => {
    invoke.mockResolvedValue({ data: { forecasts: [], metadata: {} }, error: null } as never);

    renderPage(<TrendForecastPage />);

    expect(await screen.findByText("Sem série histórica suficiente")).toBeTruthy();
  });
});
