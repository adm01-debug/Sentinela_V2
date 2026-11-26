import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  EMPTY_EXEMPTION_FORM,
  exemptionKeyFor,
  exemptionState,
  expiresAtFromInput,
  filterExemptions,
  findEmployeeForKey,
  inputFromExpiresAt,
  isExemptionActive,
  summarizeExemptions,
  usePolicyExemptionsPage,
  type EmployeeOption,
  type PolicyExemption,
} from "@/hooks/usePolicyExemptionsPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function exemption(over: Partial<PolicyExemption>): PolicyExemption {
  return {
    id: "e1",
    employee_name: "ana@empresa.com",
    reason: "auditoria",
    exempted_by: null,
    created_at: "2026-11-01T10:00:00Z",
    expires_at: null,
    ...over,
  };
}

const NOW = new Date("2026-11-26T12:00:00Z");

describe("exemptionKeyFor", () => {
  it("usa o e-mail porque o JWT sempre carrega esse campo", () => {
    expect(exemptionKeyFor({ name: "Ana", email: "ana@empresa.com" })).toBe("ana@empresa.com");
  });

  it("cai para o nome quando o cadastro nao tem e-mail", () => {
    expect(exemptionKeyFor({ name: "  Ana Silva  ", email: null })).toBe("Ana Silva");
    expect(exemptionKeyFor({ name: "Ana Silva", email: "   " })).toBe("Ana Silva");
  });
});

describe("isExemptionActive", () => {
  it("sem prazo vale para sempre", () => {
    expect(isExemptionActive(null, NOW)).toBe(true);
    expect(exemptionState(null, NOW)).toBe("active");
  });

  it("compara com a data e trata valor invalido como sem prazo", () => {
    expect(isExemptionActive("2026-12-01T00:00:00Z", NOW)).toBe(true);
    expect(isExemptionActive("2026-11-01T00:00:00Z", NOW)).toBe(false);
    expect(exemptionState("2026-11-01T00:00:00Z", NOW)).toBe("expired");
    expect(isExemptionActive("nao-e-data", NOW)).toBe(true);
  });
});

describe("summarizeExemptions", () => {
  it("conta vigentes, expiradas e sem prazo", () => {
    const summary = summarizeExemptions(
      [
        exemption({ id: "1", expires_at: null }),
        exemption({ id: "2", expires_at: "2026-12-31T00:00:00Z" }),
        exemption({ id: "3", expires_at: "2026-01-01T00:00:00Z" }),
        exemption({ id: "4", expires_at: "2026-02-01T00:00:00Z" }),
      ],
      NOW
    );
    expect(summary).toEqual({ total: 4, active: 2, expired: 2, withoutDeadline: 1 });
  });

  it("nao inventa numero quando a lista esta vazia", () => {
    expect(summarizeExemptions([], NOW)).toEqual({
      total: 0,
      active: 0,
      expired: 0,
      withoutDeadline: 0,
    });
  });
});

describe("findEmployeeForKey", () => {
  const employees: EmployeeOption[] = [
    { id: "1", name: "Ana Silva", email: "Ana@Empresa.com", department: "Financeiro" },
    { id: "2", name: "Bruno Souza", email: null, department: null },
  ];

  it("casa por e-mail ignorando maiusculas", () => {
    expect(findEmployeeForKey(employees, "ana@empresa.com")?.id).toBe("1");
  });

  it("casa pelo nome e devolve undefined para chave desconhecida", () => {
    expect(findEmployeeForKey(employees, "Bruno Souza")?.id).toBe("2");
    expect(findEmployeeForKey(employees, "ninguem@x.com")).toBeUndefined();
    expect(findEmployeeForKey(employees, "  ")).toBeUndefined();
  });
});

describe("filterExemptions", () => {
  const rows = [
    exemption({ id: "1", employee_name: "ana@empresa.com", reason: "auditoria externa" }),
    exemption({
      id: "2",
      employee_name: "bruno@empresa.com",
      reason: null,
      expires_at: "2026-01-01T00:00:00Z",
    }),
  ];

  it("busca no funcionario e no motivo", () => {
    expect(filterExemptions(rows, { search: "auditoria", now: NOW }).map((r) => r.id)).toEqual([
      "1",
    ]);
    expect(filterExemptions(rows, { search: "bruno", now: NOW }).map((r) => r.id)).toEqual(["2"]);
    expect(filterExemptions(rows, { search: "nada", now: NOW })).toEqual([]);
  });

  it("filtra por situacao", () => {
    expect(filterExemptions(rows, { state: "expired", now: NOW }).map((r) => r.id)).toEqual(["2"]);
    expect(filterExemptions(rows, { state: "active", now: NOW }).map((r) => r.id)).toEqual(["1"]);
    expect(filterExemptions(rows, { state: "all", now: NOW })).toHaveLength(2);
  });
});

describe("expiresAtFromInput", () => {
  it("trata o campo como fim do dia e aceita vazio", () => {
    expect(expiresAtFromInput("")).toBeNull();
    expect(expiresAtFromInput("   ")).toBeNull();
    expect(new Date(expiresAtFromInput("2026-12-31")!).getFullYear()).toBe(2026);
    expect(inputFromExpiresAt(null)).toBe("");
  });

  it("faz o caminho de ida e volta do input", () => {
    const iso = expiresAtFromInput("2026-12-31")!;
    expect(inputFromExpiresAt(iso)).toBe("2026-12-31");
  });
});

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "order", "eq"]) {
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

describe("usePolicyExemptionsPage", () => {
  let writes: { method: string; args: unknown[] }[] = [];
  let orderCalls: Call[] = [];
  let exemptionsResult: unknown = { data: [], error: null };
  let employeesResult: unknown = { data: [], error: null };

  beforeEach(() => {
    toastMock.mockClear();
    writes = [];
    orderCalls = [];
    exemptionsResult = { data: [], error: null };
    employeesResult = { data: [], error: null };
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    } as never);
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "employees") return makeBuilder(employeesResult).builder;
      const { builder, calls } = makeBuilder(exemptionsResult);
      orderCalls = calls;
      for (const method of ["insert", "update", "delete", "eq"]) {
        const original = builder[method] as (...args: unknown[]) => unknown;
        builder[method] = vi.fn((...args: unknown[]) => {
          writes.push({ method, args });
          return original(...args);
        });
      }
      return builder;
    }) as never);
  });

  it("lista as isencoes mais recentes primeiro", async () => {
    exemptionsResult = { data: [exemption({ id: "1" })], error: null };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.allExemptions).toHaveLength(1));

    expect(orderCalls.find((c) => c[0] === "order")?.[1]).toEqual([
      "created_at",
      { ascending: false },
    ]);
  });

  it("registra a isencao com a chave do funcionario e o autor logado", async () => {
    employeesResult = {
      data: [{ id: "1", name: "Ana Silva", email: "ana@empresa.com", department: "Financeiro" }],
      error: null,
    };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toHaveLength(1));

    act(() => result.current.handleOpenCreate());
    act(() =>
      result.current.setFormData({
        employeeKey: "ana@empresa.com",
        reason: "  auditoria externa  ",
        expiresAt: "2026-12-31",
      })
    );
    await act(async () => {
      result.current.handleSubmit();
    });

    const insert = writes.find((w) => w.method === "insert");
    expect(insert?.args[0]).toMatchObject({
      employee_name: "ana@empresa.com",
      reason: "auditoria externa",
      exempted_by: "admin-1",
    });
    expect(new Date((insert?.args[0] as { expires_at: string }).expires_at).getFullYear()).toBe(
      2026
    );
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.formData).toEqual(EMPTY_EXEMPTION_FORM);
  });

  it("nao grava isencao sem funcionario escolhido", () => {
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });

    act(() => {
      result.current.setFormData({ employeeKey: "   ", reason: "x", expiresAt: "" });
    });
    act(() => {
      result.current.handleSubmit();
    });

    expect(writes.filter((w) => w.method === "insert")).toHaveLength(0);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Selecione o funcionario", variant: "destructive" })
    );
  });

  it("avisa quando o funcionario ja tem isencao (unique)", async () => {
    exemptionsResult = { data: null, error: { code: "23505", message: "duplicate key" } };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    act(() => result.current.handleOpenCreate());
    act(() =>
      result.current.setFormData({ employeeKey: "ana@empresa.com", reason: "", expiresAt: "" })
    );
    await act(async () => {
      result.current.handleSubmit();
    });

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao registrar isencao",
          description: expect.stringContaining("ja tem isencao"),
        })
      )
    );
  });

  it("atualiza motivo e validade da isencao existente", async () => {
    exemptionsResult = { data: [exemption({ id: "e9" })], error: null };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.allExemptions).toHaveLength(1));

    act(() => result.current.handleOpenEdit(result.current.allExemptions[0]));
    expect(result.current.formData.employeeKey).toBe("ana@empresa.com");

    act(() =>
      result.current.setFormData({
        employeeKey: "ana@empresa.com",
        reason: "prazo prorrogado",
        expiresAt: "2027-01-31",
      })
    );
    await act(async () => {
      result.current.handleSubmit();
    });

    const update = writes.find((w) => w.method === "update");
    expect(update?.args[0]).toMatchObject({ reason: "prazo prorrogado" });
    expect(writes.find((w) => w.method === "eq")?.args).toEqual(["id", "e9"]);
  });

  it("estende a isencao por 30 dias a partir de hoje quando nao tem prazo", async () => {
    exemptionsResult = { data: [exemption({ id: "e9", expires_at: null })], error: null };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.allExemptions).toHaveLength(1));

    await act(async () => {
      result.current.handleExtend(result.current.allExemptions[0], 30);
    });

    const update = writes.find((w) => w.method === "update");
    const expiresAt = new Date((update?.args[0] as { expires_at: string }).expires_at).getTime();
    const esperado = Date.now() + 30 * 24 * 60 * 60 * 1000;
    expect(Math.abs(expiresAt - esperado)).toBeLessThan(60_000);
  });

  it("remove a isencao confirmada", async () => {
    exemptionsResult = { data: [exemption({ id: "e9" })], error: null };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.allExemptions).toHaveLength(1));

    act(() => result.current.setDeletingExemption(result.current.allExemptions[0]));
    await act(async () => {
      result.current.handleDelete();
    });

    expect(writes.some((w) => w.method === "delete")).toBe(true);
    expect(writes.find((w) => w.method === "eq")?.args).toEqual(["id", "e9"]);
    expect(result.current.deletingExemption).toBeNull();
  });

  it("resume a lista completa, nao a filtrada", async () => {
    exemptionsResult = {
      data: [
        exemption({ id: "1", employee_name: "ana@empresa.com" }),
        exemption({ id: "2", employee_name: "bruno@empresa.com" }),
      ],
      error: null,
    };
    const { result } = renderHook(() => usePolicyExemptionsPage(), { wrapper });
    await waitFor(() => expect(result.current.allExemptions).toHaveLength(2));

    act(() => result.current.setSearchTerm("ana"));

    expect(result.current.exemptions).toHaveLength(1);
    expect(result.current.summary.total).toBe(2);
  });
});
