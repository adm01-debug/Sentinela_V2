import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { EXECUTION_LIMIT, useScheduledReportsPage } from "@/hooks/useScheduledReportsPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

type Call = [string, unknown[]];

function makeBuilder(result: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "eq", "in", "order", "limit"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls };
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const REPORT_ROW = {
  id: "report-1",
  name: "Resumo semanal",
  report_type: "summary",
  format: "pdf",
  schedule: "weekly",
  recipients: ["gestor@empresa.com"],
  filters: { schedule_time: "08:00", schedule_day: 1 },
  is_active: true,
  last_run_at: "2026-11-25T08:00:00Z",
  next_run_at: "2026-12-02T08:00:00Z",
  created_at: "2026-11-01T10:00:00Z",
};

const LOG_ROWS = [
  {
    id: "log-2",
    report_id: "report-1",
    executed_at: "2026-11-25T08:00:00Z",
    manual: false,
    status: "success",
    records_count: 42,
    error_message: null,
  },
  {
    id: "log-1",
    report_id: "report-removido",
    executed_at: "2026-11-24T08:00:00Z",
    manual: true,
    status: "failed",
    records_count: 0,
    error_message: "SMTP recusou o envio",
  },
];

function mockSupabase(options: {
  reports?: unknown[];
  logs?: unknown[];
  reportsError?: unknown;
  logsError?: unknown;
}) {
  const reports = makeBuilder({ data: options.reports ?? [], error: options.reportsError ?? null });
  const logs = makeBuilder({ data: options.logs ?? [], error: options.logsError ?? null });
  (supabase.from as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
    (table: string) => (table === "scheduled_reports" ? reports.builder : logs.builder)
  );
  return { reports, logs };
}

describe("useScheduledReportsPage - execucoes", () => {
  beforeEach(() => {
    toastMock.mockClear();
  });

  it("carrega o historico de report_logs com o nome do agendamento", async () => {
    const { logs } = mockSupabase({ reports: [REPORT_ROW], logs: LOG_ROWS });
    const { result } = renderHook(() => useScheduledReportsPage(), { wrapper });

    await waitFor(() => expect(result.current.executions).toHaveLength(2));

    expect(result.current.executions[0].report_name).toBe("Resumo semanal");
    expect(result.current.executions[0].records_count).toBe(42);
    expect(result.current.executions[1].report_name).toBe("Agendamento removido");
    expect(result.current.executions[1].error_message).toBe("SMTP recusou o envio");
    expect(result.current.executionsError).toBeNull();

    const methods = logs.calls.map((c) => c[0]);
    expect(methods).toContain("in");
    expect(methods).toContain("order");
    const limitCall = logs.calls.find((c) => c[0] === "limit");
    expect(limitCall?.[1][0]).toBe(EXECUTION_LIMIT);
  });

  it("filtra report_logs pelos agendamentos visiveis", async () => {
    const { logs } = mockSupabase({ reports: [REPORT_ROW], logs: LOG_ROWS });
    const { result } = renderHook(() => useScheduledReportsPage(), { wrapper });

    await waitFor(() => expect(result.current.executions.length).toBeGreaterThan(0));

    const inCall = logs.calls.find((c) => c[0] === "in");
    expect(inCall?.[1][0]).toBe("report_id");
    expect(inCall?.[1][1]).toEqual(["report-1"]);
  });

  it("nao consulta report_logs quando nao existe agendamento", async () => {
    const { logs } = mockSupabase({ reports: [], logs: LOG_ROWS });
    const { result } = renderHook(() => useScheduledReportsPage(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.executions).toEqual([]);
    expect(logs.calls).toHaveLength(0);
  });

  it("expoe o erro do banco em executionsError", async () => {
    mockSupabase({
      reports: [REPORT_ROW],
      logsError: { message: "permission denied for table report_logs" },
    });
    const { result } = renderHook(() => useScheduledReportsPage(), { wrapper });

    await waitFor(() =>
      expect(result.current.executionsError).toBe("permission denied for table report_logs")
    );
    expect(result.current.executions).toEqual([]);
  });

  it("mantem o limite de execucoes exposto para a tela", async () => {
    mockSupabase({ reports: [REPORT_ROW], logs: [] });
    const { result } = renderHook(() => useScheduledReportsPage(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.executionLimit).toBe(50);
  });
});
