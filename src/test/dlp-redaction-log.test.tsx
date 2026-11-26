import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  REDACTION_ALL,
  filterRedactions,
  labelForRedactionAction,
  sinceISO,
  summarizeRedactions,
  useDLPRedactionLogPage,
  type RedactionLogEntry,
} from "@/hooks/useDLPRedactionLogPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function entry(over: Partial<RedactionLogEntry>): RedactionLogEntry {
  return {
    id: "r1",
    company_id: "c1",
    incident_id: "i1",
    classifier_code: "CPF",
    action: "redact",
    bbox_count: 1,
    occurred_at: "2026-11-20T10:00:00Z",
    ...over,
  };
}

describe("labelForRedactionAction", () => {
  it("traduz as tres acoes gravadas pela edge", () => {
    expect(labelForRedactionAction("alert")).toBe("Alerta");
    expect(labelForRedactionAction("redact")).toBe("Redigido");
    expect(labelForRedactionAction("block")).toBe("Bloqueado");
  });

  it("mostra o valor cru quando a edge manda acao nova", () => {
    expect(labelForRedactionAction("quarantine")).toBe("quarantine");
  });
});

describe("sinceISO", () => {
  it("volta os dias pedidos mantendo UTC", () => {
    const now = new Date("2026-11-26T12:00:00Z");
    expect(sinceISO(30, now)).toBe("2026-10-27T12:00:00.000Z");
    expect(sinceISO(7, now)).toBe("2026-11-19T12:00:00.000Z");
  });
});

describe("summarizeRedactions", () => {
  it("zera tudo quando o log esta vazio", () => {
    expect(summarizeRedactions([])).toEqual({
      total: 0,
      redacted: 0,
      blocked: 0,
      alerted: 0,
      classifiers: [],
      bboxTotal: 0,
    });
  });

  it("conta por acao e soma as regioes mascaradas", () => {
    const summary = summarizeRedactions([
      entry({ id: "1", action: "redact", bbox_count: 3 }),
      entry({ id: "2", action: "redact", bbox_count: null }),
      entry({ id: "3", action: "block", bbox_count: 2 }),
      entry({ id: "4", action: "alert", bbox_count: 0 }),
    ]);
    expect(summary).toMatchObject({ total: 4, redacted: 2, blocked: 1, alerted: 1, bboxTotal: 5 });
  });

  it("ordena os classificadores do mais acionado para o menos", () => {
    const summary = summarizeRedactions([
      entry({ id: "1", classifier_code: "CPF" }),
      entry({ id: "2", classifier_code: "EMAIL" }),
      entry({ id: "3", classifier_code: "EMAIL" }),
      entry({ id: "4", classifier_code: "CARTAO" }),
      entry({ id: "5", classifier_code: "EMAIL" }),
    ]);
    expect(summary.classifiers).toEqual([
      { code: "EMAIL", count: 3 },
      { code: "CPF", count: 1 },
      { code: "CARTAO", count: 1 },
    ]);
  });
});

describe("filterRedactions", () => {
  const rows = [
    entry({ id: "1", action: "redact", classifier_code: "CPF" }),
    entry({ id: "2", action: "block", classifier_code: "EMAIL" }),
    entry({ id: "3", action: "alert", classifier_code: "CPF" }),
  ];

  it("nao filtra nada quando os dois filtros estao em todas", () => {
    expect(
      filterRedactions(rows, { action: REDACTION_ALL, classifier: REDACTION_ALL })
    ).toHaveLength(3);
    expect(filterRedactions(rows, {})).toHaveLength(3);
  });

  it("filtra por acao e por classificador ao mesmo tempo", () => {
    expect(filterRedactions(rows, { action: "block" }).map((r) => r.id)).toEqual(["2"]);
    expect(filterRedactions(rows, { classifier: "CPF" }).map((r) => r.id)).toEqual(["1", "3"]);
    expect(filterRedactions(rows, { action: "redact", classifier: "EMAIL" })).toEqual([]);
  });
});

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "order", "eq", "gte", "limit"]) {
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

describe("useDLPRedactionLogPage", () => {
  let logCalls: Call[] = [];
  let logResult: unknown = { data: [], error: null };
  let companiesResult: unknown = { data: [], error: null };

  beforeEach(() => {
    toastMock.mockClear();
    logCalls = [];
    logResult = { data: [], error: null };
    companiesResult = { data: [], error: null };
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "companies") return makeBuilder(companiesResult).builder;
      const { builder, calls } = makeBuilder(logResult);
      logCalls = calls;
      return builder;
    }) as never);
  });

  it("consulta a janela de 30 dias por padrao, mais recente primeiro e limitada a 500", async () => {
    const { result } = renderHook(() => useDLPRedactionLogPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.days).toBe(30);
    const gte = logCalls.find((c) => c[0] === "gte");
    expect(gte?.[1][0]).toBe("occurred_at");
    const since = new Date(String(gte?.[1][1])).getTime();
    const esperado = Date.now() - 30 * 24 * 60 * 60 * 1000;
    expect(Math.abs(since - esperado)).toBeLessThan(60_000);
    expect(logCalls.find((c) => c[0] === "order")?.[1]).toEqual([
      "occurred_at",
      { ascending: false },
    ]);
    expect(logCalls.find((c) => c[0] === "limit")?.[1]).toEqual([500]);
  });

  it("resume o periodo e resolve o nome da empresa", async () => {
    logResult = {
      data: [
        entry({ id: "1", company_id: "c1", action: "redact", bbox_count: 2 }),
        entry({ id: "2", company_id: "c2", action: "block", bbox_count: 0 }),
      ],
      error: null,
    };
    companiesResult = {
      data: [
        { id: "c1", name: "Alfa" },
        { id: "c2", name: "Beta" },
      ],
      error: null,
    };

    const { result } = renderHook(() => useDLPRedactionLogPage(), { wrapper });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    expect(result.current.summary).toMatchObject({
      total: 2,
      redacted: 1,
      blocked: 1,
      bboxTotal: 2,
    });
    expect(result.current.companyNames.get("c1")).toBe("Alfa");
    expect(result.current.companyNames.get("c2")).toBe("Beta");
  });

  it("filtra a tabela sem refazer a consulta", async () => {
    logResult = {
      data: [
        entry({ id: "1", action: "redact", classifier_code: "CPF" }),
        entry({ id: "2", action: "alert", classifier_code: "EMAIL" }),
      ],
      error: null,
    };

    const { result } = renderHook(() => useDLPRedactionLogPage(), { wrapper });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    const consultas = logCalls.filter((c) => c[0] === "select").length;

    act(() => result.current.setAction("alert"));
    expect(result.current.entries.map((r) => r.id)).toEqual(["2"]);
    expect(result.current.allEntries).toHaveLength(2);
    expect(result.current.summary.total).toBe(1);

    act(() => result.current.setAction(REDACTION_ALL));
    act(() => result.current.setClassifier("CPF"));
    expect(result.current.entries.map((r) => r.id)).toEqual(["1"]);

    expect(logCalls.filter((c) => c[0] === "select").length).toBe(consultas);
  });

  it("oferece os classificadores vistos no periodo e as acoes conhecidas", async () => {
    logResult = {
      data: [
        entry({ id: "1", classifier_code: "EMAIL" }),
        entry({ id: "2", classifier_code: "CPF" }),
      ],
      error: null,
    };

    const { result } = renderHook(() => useDLPRedactionLogPage(), { wrapper });
    await waitFor(() => expect(result.current.classifierOptions).toHaveLength(2));

    expect(result.current.classifierOptions).toEqual(["CPF", "EMAIL"]);
    expect(result.current.actionOptions).toEqual(["alert", "redact", "block"]);
  });

  it("expoe erro quando a leitura do log falha", async () => {
    logResult = { data: null, error: new Error("permission denied") };

    const { result } = renderHook(() => useDLPRedactionLogPage(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.entries).toEqual([]);
  });
});
