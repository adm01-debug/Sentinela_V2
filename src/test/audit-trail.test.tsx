import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  AUDIT_TRAIL_LIMIT,
  actionLabel,
  changedFields,
  describeEntry,
  diffValues,
  entityLabel,
  filterEntries,
  severityLabel,
  summarizeTrail,
  useAuditTrail,
  EMPTY_AUDIT_FILTERS,
  type AuditEntry,
} from "@/hooks/useAuditTrail";
import { supabase } from "@/integrations/supabase/client";
import { AuditTrailPanel } from "@/components/audit/AuditTrailPanel";

type Call = [string, unknown[]];

function makeBuilder(result: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "order", "limit"]) {
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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

function entry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: "a1",
    user_email: "admin@empresa.com",
    user_role: "admin",
    action: "update",
    entity_type: "work_schedules",
    entity_id: "ws-1",
    entity_name: "Escala Manha",
    changes: null,
    old_values: null,
    new_values: null,
    description: null,
    module: "escalas",
    severity: "info",
    created_at: "2026-11-26T10:00:00Z",
    ...overrides,
  };
}

describe("rotulos", () => {
  it("traduz acao, entidade e severidade conhecidas", () => {
    expect(actionLabel("update")).toBe("Alteração");
    expect(actionLabel("metodo-custom")).toBe("metodo-custom");
    expect(entityLabel("employees")).toBe("Funcionário");
    expect(entityLabel("tabela_nova")).toBe("tabela_nova");
    expect(severityLabel("critical")).toBe("Crítica");
    expect(severityLabel("outro")).toBe("outro");
  });
});

describe("changedFields", () => {
  it("usa as chaves de changes e ignora chaves internas do trigger", () => {
    expect(changedFields(entry({ changes: { name: "x", _meta: "y", team_id: "t" } }))).toEqual([
      "name",
      "team_id",
    ]);
  });

  it("cai para o diff de old/new quando changes vem vazio", () => {
    const rows = entry({
      changes: {},
      old_values: { name: "Antigo", active: true, untouched: 1 },
      new_values: { name: "Novo", active: true, untouched: 1 },
    });
    expect(changedFields(rows)).toEqual(["name"]);
  });

  it("devolve lista vazia sem changes nem old/new utilizaveis", () => {
    expect(changedFields(entry())).toEqual([]);
    expect(changedFields(entry({ old_values: { a: 1 }, new_values: null }))).toEqual([]);
  });
});

describe("diffValues", () => {
  it("formata antes/depois com traco para nulo e JSON para objeto", () => {
    const rows = entry({
      changes: { name: "name" },
      old_values: { name: null, meta: { a: 1 } },
      new_values: { name: "Novo", meta: { a: 2 } },
    });
    expect(diffValues(rows)).toEqual([{ field: "name", from: "-", to: "Novo" }]);
  });

  it("quando o campo so existe no novo valor o antes fica vazio", () => {
    const rows = entry({ changes: { active: true }, old_values: {}, new_values: { active: true } });
    expect(diffValues(rows)).toEqual([{ field: "active", from: "-", to: "true" }]);
  });
});

describe("describeEntry", () => {
  it("junta entidade e campos alterados", () => {
    const rows = entry({ changes: { status: true, team_id: true } });
    expect(describeEntry(rows)).toBe("Escala de trabalho: Escala Manha - campos: status, team_id");
  });

  it("usa o identificador quando nao ha nome", () => {
    expect(describeEntry(entry({ entity_name: null, entity_type: "teams" }))).toBe("Time: ws-1");
  });
});

describe("filterEntries", () => {
  const rows = [
    entry({ id: "1", action: "update", entity_type: "work_schedules", changes: { status: true } }),
    entry({
      id: "2",
      action: "delete",
      entity_type: "employees",
      entity_name: "Ana Souza",
      user_email: "rh@empresa.com",
    }),
  ];

  it("sem filtro devolve tudo", () => {
    expect(filterEntries(rows, EMPTY_AUDIT_FILTERS)).toHaveLength(2);
  });

  it("filtra por acao e por tipo de registro", () => {
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, action: "delete" })).toHaveLength(1);
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, entityType: "employees" })[0].id).toBe(
      "2"
    );
  });

  it("busca por nome, usuario e nome de campo alterado", () => {
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, term: "ana" })).toHaveLength(1);
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, term: "rh@" })).toHaveLength(1);
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, term: "status" })).toHaveLength(1);
    expect(filterEntries(rows, { ...EMPTY_AUDIT_FILTERS, term: "inexistente" })).toHaveLength(0);
  });
});

describe("summarizeTrail", () => {
  it("conta acoes, criticas e usuarios distintos", () => {
    const summary = summarizeTrail([
      entry({ id: "1", action: "create", user_email: "a@x.com" }),
      entry({ id: "2", action: "update", user_email: "a@x.com", severity: "critical" }),
      entry({ id: "3", action: "delete", user_email: null }),
    ]);
    expect(summary).toEqual({
      total: 3,
      creates: 1,
      updates: 1,
      deletes: 1,
      critical: 1,
      actors: 1,
    });
  });
});

describe("useAuditTrail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta audit_logs com limite e expoe entradas, tipos e resumo", async () => {
    const { builder, calls } = makeBuilder({
      data: [
        entry({ id: "1", action: "create", entity_type: "teams" }),
        entry({ id: "2", action: "update", entity_type: "work_schedules" }),
      ],
      error: null,
    });
    vi.spyOn(supabase, "from").mockReturnValue(builder as never);

    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith("audit_logs");
    expect(calls.map(([method]) => method)).toEqual(["select", "order", "limit"]);
    expect(calls[1][1]).toEqual(["created_at", { ascending: false }]);
    expect(calls[2][1]).toEqual([AUDIT_TRAIL_LIMIT]);
    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entityTypes).toEqual(["teams", "work_schedules"]);
    expect(result.current.summary).toEqual({
      total: 2,
      creates: 1,
      updates: 1,
      deletes: 0,
      critical: 0,
      actors: 1,
    });
    expect(result.current.limit).toBe(AUDIT_TRAIL_LIMIT);
    expect(result.current.error).toBeNull();
  });

  it("devolve lista vazia quando nao ha linhas", async () => {
    const { builder } = makeBuilder({ data: null, error: null });
    vi.spyOn(supabase, "from").mockReturnValue(builder as never);

    const { result } = renderHook(() => useAuditTrail(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.entries).toEqual([]);
    expect(result.current.entityTypes).toEqual([]);
    expect(result.current.summary.total).toBe(0);
  });

  it("expõe a mensagem de erro da consulta", async () => {
    const { builder } = makeBuilder({ data: null, error: { message: "permission denied" } });
    vi.spyOn(supabase, "from").mockReturnValue(builder as never);

    const { result } = renderHook(() => useAuditTrail(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("permission denied");
  });
});

describe("AuditTrailPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lista as alteracoes com ator e resumo", async () => {
    const { builder } = makeBuilder({
      data: [
        entry({
          id: "1",
          entity_name: "Escala Manha",
          changes: { status: true },
          description: "Escala desativada",
        }),
      ],
      error: null,
    });
    vi.spyOn(supabase, "from").mockReturnValue(builder as never);

    render(<AuditTrailPanel />, { wrapper });

    await waitFor(() => expect(screen.getByText(/Escala Manha/)).toBeTruthy());
    expect(screen.getAllByText("Alteração").length).toBeGreaterThan(0);
    expect(screen.getByText("admin@empresa.com (admin)")).toBeTruthy();
    expect(screen.getByText("Escala desativada")).toBeTruthy();
    expect(screen.getByText("Detalhes")).toBeTruthy();
  });

  it("mostra estado vazio explicando quais tabelas alimentam a trilha", async () => {
    const { builder } = makeBuilder({ data: [], error: null });
    vi.spyOn(supabase, "from").mockReturnValue(builder as never);

    render(<AuditTrailPanel />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText(/Nenhuma alteração registrada ainda/)).toBeTruthy()
    );
  });
});
