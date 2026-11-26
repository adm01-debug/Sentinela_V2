import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { useEmployeeGamification } from "@/hooks/useEmployeeGamification";

const from = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (...args: unknown[]) => from(...args) },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

interface Chain extends Record<string, unknown> {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function chain(result: { data: unknown; error: unknown }): Chain {
  const obj: Record<string, unknown> = {};
  for (const metodo of ["select", "eq", "gte", "order", "limit", "insert", "delete"]) {
    obj[metodo] = vi.fn(() => obj);
  }
  obj.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return obj as Chain;
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const funcionarios = [
  { id: "emp-1", name: "Ana Souza", avatar_url: null },
  { id: "emp-2", name: "Bruno Lima", avatar_url: null },
];

const historico = [
  {
    id: "ph-1",
    points: 50,
    action_type: "meta_batida",
    description: "Meta diaria batida",
    created_at: "2026-11-25T12:00:00.000Z",
  },
  {
    id: "ph-2",
    points: -10,
    action_type: "atraso",
    description: "Atraso registrado",
    created_at: "2026-11-24T12:00:00.000Z",
  },
];

const conquistas = [
  {
    id: "eb-1",
    earned_at: "2026-11-20T12:00:00.000Z",
    badge: { id: "b-1", name: "Assíduo", icon: "🏅" },
  },
];

const catalogo = [
  { id: "b-1", name: "Assíduo", icon: "🏅", points_required: 100 },
  { id: "b-2", name: "Top produtividade", icon: "🚀", points_required: 500 },
];

const resultados: Record<string, { data: unknown; error: unknown }> = {
  employees: { data: funcionarios, error: null },
  points_history: { data: historico, error: null },
  employee_badges: { data: conquistas, error: null },
  badges: { data: catalogo, error: null },
};

describe("Gamificacao por funcionario", () => {
  const criadas: { tabela: string; cadeia: Chain }[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    criadas.length = 0;
    from.mockImplementation((tabela: string) => {
      const cadeia = chain(resultados[tabela] ?? { data: [], error: null });
      criadas.push({ tabela, cadeia });
      return cadeia;
    });
  });

  const cadeiasCom = (tabela: string, metodo: keyof Chain) =>
    criadas.filter(
      (c) =>
        c.tabela === tabela && (c.cadeia[metodo] as ReturnType<typeof vi.fn>).mock.calls.length > 0
    );

  it("carrega funcionarios ativos para o seletor", async () => {
    const { result } = renderHook(() => useEmployeeGamification(), { wrapper });

    await waitFor(() => {
      expect(result.current.funcionarios).toHaveLength(2);
    });

    expect(from).toHaveBeenCalledWith("employees");
    expect(result.current.funcionarios[0].name).toBe("Ana Souza");
    // Sem funcionario escolhido, as consultas de detalhe nao sao disparadas.
    expect(from).not.toHaveBeenCalledWith("points_history");
  });

  it("soma o historico do periodo e lista as conquistas do funcionario", async () => {
    const { result } = renderHook(() => useEmployeeGamification(), { wrapper });

    act(() => result.current.setEmployeeId("emp-1"));

    await waitFor(() => {
      expect(result.current.historico).toHaveLength(2);
    });

    expect(from).toHaveBeenCalledWith("points_history");
    expect(from).toHaveBeenCalledWith("employee_badges");
    expect(result.current.totalPontos).toBe(40);
    expect(result.current.conquistas[0].badge?.name).toBe("Assíduo");
    // O catalogo esconde o que o funcionario ja tem.
    expect(result.current.catalogo.map((b) => b.id)).toEqual(["b-2"]);
  });

  it("concede conquista inserindo em employee_badges", async () => {
    const { result } = renderHook(() => useEmployeeGamification(), { wrapper });

    act(() => result.current.setEmployeeId("emp-1"));
    await waitFor(() => expect(result.current.historico).toHaveLength(2));

    act(() => result.current.handleConceder("b-2"));

    await waitFor(() => {
      expect(cadeiasCom("employee_badges", "insert")).toHaveLength(1);
    });

    const [chamada] = cadeiasCom("employee_badges", "insert");
    expect(chamada.cadeia.insert).toHaveBeenCalledWith({
      employee_id: "emp-1",
      badge_id: "b-2",
    });
  });

  it("remove conquista pelo id em employee_badges", async () => {
    const { result } = renderHook(() => useEmployeeGamification(), { wrapper });

    act(() => result.current.setEmployeeId("emp-1"));
    await waitFor(() => expect(result.current.conquistas).toHaveLength(1));

    act(() => result.current.handleRemover("eb-1"));

    await waitFor(() => {
      expect(cadeiasCom("employee_badges", "delete")).toHaveLength(1);
    });

    const [chamada] = cadeiasCom("employee_badges", "delete");
    expect(chamada.cadeia.eq).toHaveBeenCalledWith("id", "eb-1");
  });
});
