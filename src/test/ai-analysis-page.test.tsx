import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAIAnalysisPage } from "@/hooks/useAIAnalysisPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "order", "limit", "eq"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls };
}

const employeesResult = {
  data: [{ id: "u1", name: "Ana Souza" }],
  error: null,
};

let reportBuilders: Call[][] = [];
let insertPayloads: unknown[] = [];

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  toastMock.mockClear();
  reportBuilders = [];
  insertPayloads = [];
  vi.mocked(supabase.from).mockImplementation(((table: string) => {
    if (table === "employees") return makeBuilder(employeesResult).builder;
    if (table === "ai_analysis_reports") {
      const { builder, calls } = makeBuilder({ data: [], error: null });
      const insert = builder.insert as (payload: unknown) => unknown;
      builder.insert = vi.fn((payload: unknown) => {
        insertPayloads.push(payload);
        return insert(payload);
      });
      reportBuilders.push(calls);
      return builder;
    }
    return makeBuilder({ data: [], error: null }).builder;
  }) as never);
  vi.mocked(supabase.functions.invoke).mockResolvedValue({
    data: { success: true, analysis: { productivity: { score: 82 }, anomalies: [] } },
    error: null,
  } as never);
});

describe("useAIAnalysisPage", () => {
  it("filtra a lista pelo nome do funcionário, não pelo id", async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toHaveLength(1));

    act(() => result.current.setSelectedEmployee("u1"));

    await waitFor(() => {
      const filtros = reportBuilders.flat().filter(([m]) => m === "eq");
      expect(filtros).toContainEqual(["eq", ["employee_name", "Ana Souza"]]);
    });
    expect(reportBuilders.flat().filter(([m]) => m === "eq")).not.toContainEqual([
      "eq",
      ["employee_name", "u1"],
    ]);
  });

  it("envia employee_name e o tipo aceito pela analyze-activity", async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toHaveLength(1));
    act(() => result.current.setSelectedEmployee("u1"));
    act(() => result.current.setAnalysisType("behavior"));

    act(() => result.current.handleRunAnalysis());

    await waitFor(() => expect(supabase.functions.invoke).toHaveBeenCalled());
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "analyze-activity",
      expect.objectContaining({
        body: expect.objectContaining({
          employee_name: "Ana Souza",
          analysis_type: "patterns",
        }),
      })
    );
  });

  it("grava o resultado para a análise aparecer na lista", async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toHaveLength(1));
    act(() => result.current.setSelectedEmployee("u1"));

    act(() => result.current.handleRunAnalysis("risk"));

    await waitFor(() => expect(insertPayloads).toHaveLength(1));
    expect(insertPayloads[0]).toMatchObject({
      employee_name: "Ana Souza",
      report_type: "risk",
      risk_score: 82,
    });
  });

  it("não chama a análise sem funcionário selecionado", async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toHaveLength(1));

    act(() => result.current.handleRunAnalysis());

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalled();
  });
});
