import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { useDailyJourney } from "@/hooks/useDailyJourney";

const { tabelas } = vi.hoisted(() => ({ tabelas: {} as Record<string, unknown> }));

function chain(result: unknown) {
  const obj: Record<string, unknown> = {};
  for (const metodo of ["select", "eq", "gte", "lte", "order", "limit"]) {
    obj[metodo] = vi.fn(() => obj);
  }
  obj.maybeSingle = vi.fn(() => Promise.resolve(result));
  obj.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return obj;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (tabela: string) => chain(tabelas[tabela] ?? { data: [], error: null }) },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("Jornada do dia - detalhe dos cliques", () => {
  beforeEach(() => {
    for (const chave of Object.keys(tabelas)) delete tabelas[chave];
    tabelas.employees = { data: { name: "Joao Silva" }, error: null };
    tabelas.time_entries = {
      data: [
        {
          clock_in: "2026-11-25T09:00:00",
          clock_out: "2026-11-25T18:00:00",
          duration_minutes: 540,
        },
      ],
      error: null,
    };
    tabelas.click_logs = {
      data: [
        {
          id: "c1",
          recorded_at: "2026-11-25T09:05:00",
          click_type: "left",
          target_element: "Botão Salvar",
          app_name: "Chrome",
          window_title: "Sistema - Pedidos",
          url: "https://app.local/pedidos",
        },
        {
          id: "c2",
          recorded_at: "2026-11-25T14:30:00",
          click_type: null,
          target_element: null,
          app_name: "Excel",
          window_title: null,
          url: null,
        },
      ],
      error: null,
    };
  });

  it("devolve o detalhe de cada clique do dia", async () => {
    const { result } = renderHook(() => useDailyJourney("e1", "2026-11-25"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clicks).toEqual([
      {
        id: "c1",
        recordedAt: "2026-11-25T09:05:00",
        clickType: "left",
        targetElement: "Botão Salvar",
        appName: "Chrome",
        windowTitle: "Sistema - Pedidos",
        url: "https://app.local/pedidos",
      },
      {
        id: "c2",
        recordedAt: "2026-11-25T14:30:00",
        clickType: "click",
        targetElement: null,
        appName: "Excel",
        windowTitle: null,
        url: null,
      },
    ]);
  });

  it("marca cada clique na jornada do dia", async () => {
    const { result } = renderHook(() => useDailyJourney("e1", "2026-11-25"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cliques = (result.current.data?.events ?? []).filter((e) => e.kind === "click");
    expect(cliques).toHaveLength(2);
    expect(cliques[0].startMinute).toBe(9 * 60 + 5);
    expect(cliques[0].label).toBe("left em Botão Salvar");
    expect(cliques[1].startMinute).toBe(14 * 60 + 30);
    expect(cliques[1].label).toBe("click em Excel");
  });

  it("nao quebra a jornada quando a funcao nao tem nome", async () => {
    tabelas.employees = { data: null, error: null };
    tabelas.click_logs = { data: [{ id: "c9" }], error: null };

    const { result } = renderHook(() => useDailyJourney("e1", "2026-11-25"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.clicks).toEqual([]);
    expect((result.current.data?.events ?? []).filter((e) => e.kind === "click")).toHaveLength(0);
  });
});
