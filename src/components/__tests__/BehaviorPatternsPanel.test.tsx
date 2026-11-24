import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BehaviorPatternsPanel } from "../BehaviorPatternsPanel";
import { useBehaviorPatterns, type BehaviorPattern } from "@/hooks/useBehaviorPatterns";

vi.mock("@/hooks/useBehaviorPatterns", () => ({ useBehaviorPatterns: vi.fn() }));

const mockHook = vi.mocked(useBehaviorPatterns);

const baseState = {
  patterns: [] as BehaviorPattern[],
  routines: [] as BehaviorPattern[],
  deviations: [] as BehaviorPattern[],
  anomalies: [] as BehaviorPattern[],
  isLoading: false,
  error: null as Error | null,
  analyzePatterns: vi.fn(),
  getPatternsByType: vi.fn(),
};

const desvio: BehaviorPattern = {
  id: "p1",
  type: "deviation",
  description: "Intervalos longos entre 15h e 16h",
  confidence: 0.71,
  frequency: "daily",
  recommendations: ["Revisar pausas do turno da tarde"],
};

describe("BehaviorPatternsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.mockReturnValue(baseState as ReturnType<typeof useBehaviorPatterns>);
  });

  it("analisa ao abrir e mostra o estado vazio", () => {
    render(<BehaviorPatternsPanel />);

    expect(baseState.analyzePatterns).toHaveBeenCalled();
    expect(screen.getByText(/Nenhum padrão de comportamento identificado/)).toBeInTheDocument();
  });

  it("repassa o nome do funcionário para o filtro do backend", () => {
    render(<BehaviorPatternsPanel employeeName="Maria Souza" />);

    expect(mockHook).toHaveBeenCalledWith({ employeeId: "Maria Souza" });
    expect(screen.getByText(/para Maria Souza/)).toBeInTheDocument();
  });

  it("lista o padrão com tipo, confiança, frequência e recomendações", () => {
    mockHook.mockReturnValue({
      ...baseState,
      patterns: [desvio],
      deviations: [desvio],
    } as ReturnType<typeof useBehaviorPatterns>);

    render(<BehaviorPatternsPanel />);

    expect(screen.getByTestId("behavior-pattern-list")).toBeInTheDocument();
    expect(screen.getByText("Desvio")).toBeInTheDocument();
    expect(screen.getByText(/71% de confiança/)).toBeInTheDocument();
    expect(screen.getByText(/diário/)).toBeInTheDocument();
    expect(screen.getByText("1 desvio(s)")).toBeInTheDocument();
    expect(screen.getByText("Revisar pausas do turno da tarde")).toBeInTheDocument();
  });

  it("mostra o erro e permite tentar de novo", () => {
    mockHook.mockReturnValue({
      ...baseState,
      error: new Error("edge function offline"),
    } as ReturnType<typeof useBehaviorPatterns>);

    render(<BehaviorPatternsPanel />);

    expect(
      screen.getByText(/Não foi possível analisar os padrões: edge function offline/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(baseState.analyzePatterns).toHaveBeenCalledTimes(2);
  });
});
