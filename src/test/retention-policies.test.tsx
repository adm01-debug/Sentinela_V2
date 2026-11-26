import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  resolveEffectiveRetention,
  findPolicy,
  useRetentionPoliciesPage,
  type RetentionPolicy,
} from "@/hooks/useRetentionPoliciesPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function policy(over: Partial<RetentionPolicy>): RetentionPolicy {
  return {
    id: "p1",
    company_id: null,
    data_type: "recordings",
    retention_days: 30,
    is_active: true,
    updated_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...over,
  };
}

describe("resolveEffectiveRetention", () => {
  it("usa o fallback do codigo quando nao existe politica nenhuma", () => {
    expect(resolveEffectiveRetention([], "c1", "recordings")).toEqual({
      days: 30,
      source: "padrao",
      policyId: null,
    });
    expect(resolveEffectiveRetention([], null, "file_transfers")).toEqual({
      days: 90,
      source: "padrao",
      policyId: null,
    });
  });

  it("nao inventa retencao para tipo sem job de expurgo", () => {
    expect(resolveEffectiveRetention([], "c1", "screenshots")).toEqual({
      days: null,
      source: "sem-padrao",
      policyId: null,
    });
  });

  it("politica ativa da empresa vence a global", () => {
    const policies = [
      policy({ id: "global", company_id: null, retention_days: 30 }),
      policy({ id: "empresa", company_id: "c1", retention_days: 120 }),
    ];
    expect(resolveEffectiveRetention(policies, "c1", "recordings")).toEqual({
      days: 120,
      source: "empresa",
      policyId: "empresa",
    });
    // outra empresa segue na global
    expect(resolveEffectiveRetention(policies, "c2", "recordings")).toEqual({
      days: 30,
      source: "global",
      policyId: "global",
    });
  });

  it("politica inativa nao vale e cai para o proximo nivel", () => {
    const policies = [
      policy({ id: "global", company_id: null, retention_days: 45, is_active: false }),
      policy({ id: "empresa", company_id: "c1", retention_days: 120, is_active: false }),
    ];
    expect(resolveEffectiveRetention(policies, "c1", "recordings")).toEqual({
      days: 30,
      source: "padrao",
      policyId: null,
    });
  });

  it("nao mistura tipo de dado diferente", () => {
    const policies = [policy({ id: "outro", data_type: "file_transfers", retention_days: 365 })];
    expect(resolveEffectiveRetention(policies, "c1", "file_transfers")).toEqual({
      days: 365,
      source: "global",
      policyId: "outro",
    });
    expect(resolveEffectiveRetention(policies, "c1", "recordings")).toEqual({
      days: 30,
      source: "padrao",
      policyId: null,
    });
  });
});

describe("findPolicy", () => {
  it("casa escopo global por company_id NULL", () => {
    const policies = [policy({ id: "g", company_id: null })];
    expect(findPolicy(policies, null, "recordings")?.id).toBe("g");
    expect(findPolicy(policies, "c1", "recordings")).toBeUndefined();
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

describe("useRetentionPoliciesPage", () => {
  let writes: { table: string; method: string; args: unknown[] }[] = [];
  let policiesResult: unknown = { data: [], error: null };

  beforeEach(() => {
    toastMock.mockClear();
    writes = [];
    policiesResult = { data: [], error: null };
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "companies") return makeBuilder({ data: [], error: null }).builder;
      const { builder, calls } = makeBuilder(policiesResult);
      for (const method of ["insert", "update", "delete", "eq"]) {
        const original = builder[method] as (...args: unknown[]) => unknown;
        builder[method] = vi.fn((...args: unknown[]) => {
          writes.push({ table, method, args });
          return original(...args);
        });
      }
      void calls;
      return builder;
    }) as never);
  });

  it("cria a politica quando o escopo ainda nao tem linha", async () => {
    const { result } = renderHook(() => useRetentionPoliciesPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.savePolicy({
        companyId: "c1",
        dataType: "recordings",
        retentionDays: 15,
        isActive: true,
      });
    });

    const mutations = writes.filter((w) => w.method !== "eq");
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe("insert");
    expect(mutations[0].args[0]).toMatchObject({
      company_id: "c1",
      data_type: "recordings",
      retention_days: 15,
      is_active: true,
    });
  });

  it("atualiza a linha existente em vez de duplicar o escopo global", async () => {
    policiesResult = {
      data: [policy({ id: "global-rec", company_id: null, retention_days: 30 })],
      error: null,
    };
    const { result } = renderHook(() => useRetentionPoliciesPage(), { wrapper });
    await waitFor(() => expect(result.current.policies).toHaveLength(1));

    await act(async () => {
      await result.current.savePolicy({
        companyId: null,
        dataType: "recordings",
        retentionDays: 60,
        isActive: false,
      });
    });

    const mutations = writes.filter((w) => w.method !== "eq");
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe("update");
    expect(mutations[0].args[0]).toMatchObject({ retention_days: 60, is_active: false });
    const scoped = writes.find((w) => w.method === "eq");
    expect(scoped?.args).toEqual(["id", "global-rec"]);
  });

  it("expÃµe a retencao vigente do escopo selecionado", async () => {
    policiesResult = {
      data: [
        policy({ id: "global-rec", company_id: null, retention_days: 30 }),
        policy({ id: "emp-rec", company_id: "c1", retention_days: 200 }),
      ],
      error: null,
    };
    const { result } = renderHook(() => useRetentionPoliciesPage(), { wrapper });
    await waitFor(() => expect(result.current.policies).toHaveLength(2));

    const gravacoes = () => result.current.effective.find((r) => r.dataType === "recordings")!;
    expect(gravacoes()).toMatchObject({ days: 30, source: "global" });

    act(() => result.current.setSelectedCompanyId("c1"));
    expect(gravacoes()).toMatchObject({ days: 200, source: "empresa" });
  });
});
