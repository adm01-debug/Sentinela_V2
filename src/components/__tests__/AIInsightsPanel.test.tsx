import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { useAIInsights, type AIInsight } from "@/hooks/useAIInsights";

vi.mock("@/hooks/useAIInsights", () => ({ useAIInsights: vi.fn() }));

const mockHook = vi.mocked(useAIInsights);

const baseState = {
  insights: [] as AIInsight[],
  metadata: {
    analyzedActivities: 320,
    analyzedViolations: 4,
    analyzedEmployees: 18,
    generatedAt: "2026-11-24T12:00:00.000Z",
  },
  isLoading: false,
  error: null as Error | null,
  fetchInsights: vi.fn(),
  dismissInsight: vi.fn(),
  getInsightsByType: vi.fn(),
  anomalies: [] as AIInsight[],
  recommendations: [] as AIInsight[],
};

const insight: AIInsight = {
  id: "i1",
  type: "recommendation",
  title: "Pico de ociosidade às 15h",
  description: "A produtividade cai 40% entre 15h e 16h",
  confidence: 0.9,
  severity: "medium",
  actions: ["Revisar pausas do turno da tarde"],
  createdAt: new Date("2026-11-24T12:00:00.000Z"),
};

describe("AIInsightsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.mockReturnValue(baseState as ReturnType<typeof useAIInsights>);
  });

  it("gera insights ao abrir pedindo apenas os tipos suportados", () => {
    render(<AIInsightsPanel />);

    expect(mockHook).toHaveBeenCalledWith({
      insightTypes: ["trend", "anomaly", "recommendation"],
    });
    expect(baseState.fetchInsights).toHaveBeenCalled();
    expect(
      screen.getByText(/320 atividade\(s\) e 18 funcionário\(s\) analisado\(s\)/)
    ).toBeInTheDocument();
  });

  it("lista o insight com tipo, severidade, confiança e permite dispensar", () => {
    mockHook.mockReturnValue({
      ...baseState,
      insights: [insight],
      recommendations: [insight],
    } as ReturnType<typeof useAIInsights>);

    render(<AIInsightsPanel />);

    expect(screen.getByTestId("ai-insight-list")).toBeInTheDocument();
    expect(screen.getByText("Recomendação")).toBeInTheDocument();
    expect(screen.getByText("Média")).toBeInTheDocument();
    expect(screen.getByText(/90% de confiança/)).toBeInTheDocument();
    expect(screen.getByText(insight.title)).toBeInTheDocument();
    expect(screen.getByText("Revisar pausas do turno da tarde")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Dispensar insight i1/ }));
    expect(baseState.dismissInsight).toHaveBeenCalledWith("i1");
  });

  it("mostra o erro e permite tentar de novo", () => {
    mockHook.mockReturnValue({
      ...baseState,
      error: new Error("generate-insights offline"),
    } as ReturnType<typeof useAIInsights>);

    render(<AIInsightsPanel />);

    expect(
      screen.getByText(/Não foi possível gerar os insights: generate-insights offline/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(baseState.fetchInsights).toHaveBeenCalledTimes(2);
  });

  it("mostra o carregamento enquanto analisa", () => {
    mockHook.mockReturnValue({
      ...baseState,
      isLoading: true,
    } as ReturnType<typeof useAIInsights>);

    render(<AIInsightsPanel />);

    expect(screen.getByText(/Analisando o histórico para gerar insights/)).toBeInTheDocument();
  });
});
