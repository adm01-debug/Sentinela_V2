import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnomalyDetectionPanel } from "../AnomalyDetectionPanel";
import { useAnomalyDetection, type Anomaly } from "@/hooks/useAnomalyDetection";

vi.mock("@/hooks/useAnomalyDetection", () => ({ useAnomalyDetection: vi.fn() }));

const mockHook = vi.mocked(useAnomalyDetection);

const baseState = {
  anomalies: [] as Anomaly[],
  metadata: {
    analyzedRecords: 120,
    timeRange: "24h",
    threshold: 0.7,
    generatedAt: "2026-11-24T12:00:00.000Z",
  },
  isLoading: false,
  error: null as Error | null,
  detectAnomalies: vi.fn(),
  dismissAnomaly: vi.fn(),
  criticalCount: 0,
  highCount: 0,
};

const anomalia: Anomaly = {
  id: "a1",
  type: "unusual_high_activity",
  severity: "high",
  probability: 0.82,
  description: "Nível de atividade incomum às 14h: 90 ações (esperado ~12)",
  affectedEntities: ["Maria Souza"],
  suggestedActions: ["Revisar os logs desse período"],
  timestamp: new Date("2026-11-24T12:00:00.000Z"),
};

describe("AnomalyDetectionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.mockReturnValue(baseState as ReturnType<typeof useAnomalyDetection>);
  });

  it("analisa ao abrir e mostra o estado vazio", () => {
    render(<AnomalyDetectionPanel />);

    expect(baseState.detectAnomalies).toHaveBeenCalled();
    expect(screen.getByText(/Nenhuma anomalia de atividade/)).toBeInTheDocument();
    expect(screen.getByText(/120 registro\(s\)/)).toBeInTheDocument();
  });

  it("lista a anomalia com severidade, confiança e permite dispensar", () => {
    mockHook.mockReturnValue({
      ...baseState,
      anomalies: [anomalia],
      highCount: 1,
    } as ReturnType<typeof useAnomalyDetection>);

    render(<AnomalyDetectionPanel />);

    expect(screen.getByTestId("anomaly-list")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText(/82% de confiança/)).toBeInTheDocument();
    expect(screen.getByText(anomalia.description)).toBeInTheDocument();
    expect(screen.getByText(/Maria Souza/)).toBeInTheDocument();
    expect(screen.getByText("1 alta(s)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Dispensar anomalia a1/ }));
    expect(baseState.dismissAnomaly).toHaveBeenCalledWith("a1");
  });

  it("mostra o erro e permite tentar de novo", () => {
    mockHook.mockReturnValue({
      ...baseState,
      error: new Error("edge function offline"),
    } as ReturnType<typeof useAnomalyDetection>);

    render(<AnomalyDetectionPanel />);

    expect(
      screen.getByText(/Não foi possível analisar as atividades: edge function offline/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(baseState.detectAnomalies).toHaveBeenCalledTimes(2);
  });

  it("mostra o carregamento enquanto analisa", () => {
    mockHook.mockReturnValue({
      ...baseState,
      isLoading: true,
    } as ReturnType<typeof useAnomalyDetection>);

    render(<AnomalyDetectionPanel />);

    expect(screen.getByText(/Analisando atividades/)).toBeInTheDocument();
  });
});
