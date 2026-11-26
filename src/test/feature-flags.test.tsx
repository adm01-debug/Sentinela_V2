import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  DESCRIPTION_MAX_LENGTH,
  EMPTY_FLAG_FORM,
  filterFlags,
  formFromFlag,
  isEnabledFlag,
  normalizeFlagName,
  parseConditions,
  summarizeFlags,
  useFeatureFlagsPage,
  validateFlagForm,
  type FeatureFlag,
} from "@/hooks/useFeatureFlagsPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function flag(over: Partial<FeatureFlag> = {}): FeatureFlag {
  return {
    id: "flag-1",
    company_id: "company-1",
    name: "novo_dashboard",
    enabled: false,
    description: "Dashboard novo",
    conditions: null,
    created_at: "2026-11-01T10:00:00Z",
    updated_at: "2026-11-02T10:00:00Z",
    ...over,
  };
}

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "eq", "order", "limit"]) {
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

describe("normalizeFlagName", () => {
  it("remove acentos, espacos e simbolos", () => {
    expect(normalizeFlagName("Novo Dashboard")).toBe("novo_dashboard");
    expect(normalizeFlagName("Ação Rápida!")).toBe("acao_rapida");
    expect(normalizeFlagName("  --teste--  ")).toBe("teste");
  });

  it("corta em 50 caracteres", () => {
    expect(normalizeFlagName("a".repeat(80))).toHaveLength(50);
  });

  it("texto vazio continua vazio", () => {
    expect(normalizeFlagName("!!!")).toBe("");
  });
});

describe("parseConditions", () => {
  it("texto vazio vira null", () => {
    expect(parseConditions("   ")).toEqual({ ok: true, value: null });
  });

  it("aceita objeto JSON", () => {
    expect(parseConditions('{"plano":"enterprise"}')).toEqual({
      ok: true,
      value: { plano: "enterprise" },
    });
  });

  it("recusa JSON invalido", () => {
    const parsed = parseConditions("{plano:}");
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("JSON invalido");
  });

  it("recusa valores que nao sao objeto", () => {
    const parsed = parseConditions('"texto"');
    expect(parsed.ok).toBe(false);
  });
});

describe("formFromFlag", () => {
  it("serializa condicoes existentes", () => {
    const form = formFromFlag(flag({ conditions: { plano: "enterprise" } }));
    expect(form.name).toBe("novo_dashboard");
    expect(JSON.parse(form.conditions)).toEqual({ plano: "enterprise" });
  });

  it("sem condicoes deixa o campo vazio", () => {
    expect(formFromFlag(flag()).conditions).toBe("");
  });

  it("descricao nula vira string vazia", () => {
    expect(formFromFlag(flag({ description: null })).description).toBe("");
  });
});

describe("validateFlagForm", () => {
  it("aceita flag valida", () => {
    expect(validateFlagForm({ ...EMPTY_FLAG_FORM, name: "novo_dashboard" })).toEqual({});
  });

  it("exige nome", () => {
    expect(validateFlagForm(EMPTY_FLAG_FORM).name).toBeTruthy();
  });

  it("exige formato snake_case", () => {
    expect(validateFlagForm({ ...EMPTY_FLAG_FORM, name: "AB" }).name).toBeTruthy();
    expect(validateFlagForm({ ...EMPTY_FLAG_FORM, name: "1flag" }).name).toBeTruthy();
  });

  it("bloqueia nome repetido", () => {
    const form = { ...EMPTY_FLAG_FORM, name: "novo_dashboard" };
    expect(validateFlagForm(form, [flag()]).name).toContain("Ja existe");
    expect(validateFlagForm(form, [flag()], "flag-1")).toEqual({});
  });

  it("limita o tamanho da descricao", () => {
    const form = {
      ...EMPTY_FLAG_FORM,
      name: "nova_flag",
      description: "x".repeat(DESCRIPTION_MAX_LENGTH + 1),
    };
    expect(validateFlagForm(form).description).toBeTruthy();
  });

  it("valida as condicoes", () => {
    const form = { ...EMPTY_FLAG_FORM, name: "nova_flag", conditions: "{errado" };
    expect(validateFlagForm(form).conditions).toBeTruthy();
  });
});

describe("filterFlags", () => {
  const flags = [
    flag(),
    flag({ id: "2", name: "beta_relatorios", description: "Relatorios beta" }),
  ];

  it("busca por nome", () => {
    expect(filterFlags(flags, "beta")).toHaveLength(1);
  });

  it("busca por descricao", () => {
    expect(filterFlags(flags, "dashboard")).toHaveLength(1);
  });

  it("sem termo devolve tudo", () => {
    expect(filterFlags(flags, "   ")).toHaveLength(2);
  });
});

describe("summarizeFlags", () => {
  it("conta ativas e desligadas", () => {
    expect(summarizeFlags([flag(), flag({ id: "2", enabled: true })])).toEqual({
      total: 2,
      enabled: 1,
      disabled: 1,
    });
  });
});

describe("isEnabledFlag", () => {
  it("responde pelo nome normalizado", () => {
    const flags = [flag({ enabled: true })];
    expect(isEnabledFlag(flags, "Novo Dashboard")).toBe(true);
    expect(isEnabledFlag(flags, "outra_flag")).toBe(false);
  });
});

describe("useFeatureFlagsPage", () => {
  let result: unknown = { data: [], error: null };
  let calls: Call[] = [];
  let writes: { method: string; args: unknown[] }[] = [];

  beforeEach(() => {
    result = { data: [], error: null };
    calls = [];
    writes = [];
    toastMock.mockClear();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    } as never);
    vi.mocked(supabase.rpc).mockResolvedValue({ data: "company-1", error: null } as never);

    vi.mocked(supabase.from).mockImplementation((() => {
      const { builder, calls: builderCalls } = makeBuilder(result);
      calls = builderCalls;
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

  it("carrega as flags ordenadas por nome", async () => {
    result = { data: [flag()], error: null };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(1));
    expect(calls.find((call) => call[0] === "order")?.[1]).toEqual(["name", { ascending: true }]);
  });

  it("cria flag desligada com a empresa do usuario", async () => {
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.openCreate());
    act(() =>
      hook.current.setFormData({
        name: "Novo Dashboard",
        description: "libera o dashboard novo",
        conditions: '{"plano":"enterprise"}',
      })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.dialogOpen).toBe(false));
    const insert = writes.find((write) => write.method === "insert");
    expect(insert?.args[0]).toEqual({
      name: "novo_dashboard",
      description: "libera o dashboard novo",
      conditions: { plano: "enterprise" },
      company_id: "company-1",
      enabled: false,
    });
  });

  it("nao cria flag com nome repetido", async () => {
    result = { data: [flag()], error: null };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(1));

    act(() => hook.current.openCreate());
    act(() => hook.current.setFormData({ ...EMPTY_FLAG_FORM, name: "novo_dashboard" }));
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.showErrors).toBe(true));
    expect(writes).toHaveLength(0);
    expect(hook.current.dialogOpen).toBe(true);
  });

  it("edita a flag existente pelo id", async () => {
    result = { data: [flag()], error: null };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(1));

    act(() => hook.current.openEdit(hook.current.flags[0]));
    act(() =>
      hook.current.setFormData({ ...hook.current.formData, description: "nova descricao" })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.dialogOpen).toBe(false));
    expect(writes.find((write) => write.method === "update")?.args[0]).toMatchObject({
      name: "novo_dashboard",
      description: "nova descricao",
    });
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "flag-1"]);
  });

  it("alterna a flag invertendo o valor atual", async () => {
    result = { data: [flag()], error: null };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(1));

    act(() => hook.current.toggleFlag(hook.current.flags[0]));

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(writes.find((write) => write.method === "update")?.args[0]).toEqual({ enabled: true });
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "flag-1"]);
  });

  it("remove a flag pelo id", async () => {
    result = { data: [flag()], error: null };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(1));

    act(() => hook.current.setRemoving(hook.current.flags[0]));
    act(() => hook.current.handleRemove());

    await waitFor(() => expect(hook.current.removing).toBeNull());
    expect(writes.find((write) => write.method === "delete")).toBeTruthy();
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "flag-1"]);
  });

  it("mantem o dialogo aberto quando o banco recusa", async () => {
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    result = { data: null, error: new Error("RLS bloqueou") };
    act(() => hook.current.openCreate());
    act(() => hook.current.setFormData({ ...EMPTY_FLAG_FORM, name: "nova_flag" }));
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(hook.current.dialogOpen).toBe(true);
  });

  it("filtra pela busca", async () => {
    result = {
      data: [flag(), flag({ id: "2", name: "beta_relatorios", description: "Relatorios beta" })],
      error: null,
    };
    const { result: hook } = renderHook(() => useFeatureFlagsPage(), { wrapper });
    await waitFor(() => expect(hook.current.flags).toHaveLength(2));

    act(() => hook.current.setTerm("beta"));
    expect(hook.current.visibleFlags.map((item) => item.name)).toEqual(["beta_relatorios"]);
  });
});
