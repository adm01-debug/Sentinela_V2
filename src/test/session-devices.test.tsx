import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describeDevice, useSessionManager } from "@/hooks/useSessionManager";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

type Call = [string, unknown[]];

function makeBuilder(queue: unknown[]) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "order",
    "limit",
    "single",
  ]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  let index = 0;
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
    const result = queue[Math.min(index, queue.length - 1)];
    index++;
    return Promise.resolve(result).then(onFulfilled, onRejected);
  };
  return { builder, calls };
}

function sessionRow(over: Record<string, unknown> = {}) {
  return {
    id: "sess-1",
    user_id: "user-1",
    device: "Windows",
    browser: "Chrome",
    ip_address: "200.10.20.30",
    location: "Sao Paulo",
    last_activity: "2026-11-20T12:00:00Z",
    created_at: "2026-11-01T12:00:00Z",
    ...over,
  };
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: { user: { id: "user-1" } } },
    error: null,
  } as never);
});

describe("describeDevice", () => {
  it("identifica Chrome no Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    expect(describeDevice(ua)).toEqual({ device: "Windows", browser: "Chrome" });
  });

  it("identifica Edge antes de Chrome", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0";
    expect(describeDevice(ua)).toEqual({ device: "Windows", browser: "Microsoft Edge" });
  });

  it("identifica iPhone com Safari", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(describeDevice(ua)).toEqual({ device: "iPhone", browser: "Safari" });
  });

  it("identifica Android com Firefox", () => {
    const ua = "Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0";
    expect(describeDevice(ua)).toEqual({ device: "Android", browser: "Firefox" });
  });

  it("user agent vazio nao inventa dispositivo", () => {
    expect(describeDevice("")).toEqual({
      device: "Dispositivo desconhecido",
      browser: "Navegador desconhecido",
    });
  });
});

describe("useSessionManager", () => {
  it("registra o dispositivo atual quando ele ainda nao existe", async () => {
    const { builder, calls } = makeBuilder([
      { data: [], error: null },
      { data: { id: "sess-nova" }, error: null },
      { data: [sessionRow({ id: "sess-nova" })], error: null },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(calls.some(([method]) => method === "insert")).toBe(true);
    expect(result.current.currentSessionId).toBe("sess-nova");
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].current).toBe(true);
  });

  it("atualiza o ultimo acesso em vez de criar linha duplicada", async () => {
    const { builder, calls } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      { data: [sessionRow()], error: null },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(calls.some(([method]) => method === "insert")).toBe(false);
    const updateCall = calls.find(([method]) => method === "update");
    expect(updateCall).toBeDefined();
    expect(calls).toContainEqual(["eq", ["id", "sess-1"]]);
    expect(result.current.currentSessionId).toBe("sess-1");
  });

  it("marca apenas o dispositivo atual e mantem os outros como nao atuais", async () => {
    const { builder } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      {
        data: [
          sessionRow(),
          sessionRow({ id: "sess-2", device: "iPhone", browser: "Safari", ip_address: null }),
        ],
        error: null,
      },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    expect(result.current.sessions.find((s) => s.id === "sess-1")?.current).toBe(true);
    expect(result.current.sessions.find((s) => s.id === "sess-2")?.current).toBe(false);
    expect(result.current.sessions.find((s) => s.id === "sess-2")?.ip).toBe("Nao registrado");
    expect(result.current.activeSessions).toBe(2);
  });

  it("recusa encerrar o proprio dispositivo atual", async () => {
    const { builder, calls } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      { data: [sessionRow()], error: null },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.currentSessionId).toBe("sess-1"));

    await act(async () => {
      await expect(result.current.revokeSession("sess-1")).rejects.toThrow(
        "O dispositivo atual nao pode ser encerrado"
      );
    });

    expect(calls.some(([method]) => method === "delete")).toBe(false);
    await waitFor(() =>
      expect(result.current.error).toBe("O dispositivo atual nao pode ser encerrado")
    );
  });

  it("encerra outro dispositivo", async () => {
    const { builder, calls } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      {
        data: [sessionRow(), sessionRow({ id: "sess-2", device: "iPhone", browser: "Safari" })],
        error: null,
      },
      { data: null, error: null },
      { data: null, error: null },
      { data: [sessionRow()], error: null },
      { data: [sessionRow()], error: null },
      { data: [sessionRow()], error: null },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    await act(async () => {
      await result.current.revokeSession("sess-2");
    });

    expect(calls).toContainEqual(["eq", ["id", "sess-2"]]);
    expect(result.current.error).toBeNull();
  });

  it("encerrar os outros preserva a sessao atual no filtro de delecao", async () => {
    const { builder, calls } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      {
        data: [sessionRow(), sessionRow({ id: "sess-2", device: "iPhone", browser: "Safari" })],
        error: null,
      },
      { data: null, error: null },
      { data: null, error: null },
      { data: [sessionRow()], error: null },
      { data: [sessionRow()], error: null },
      { data: [sessionRow()], error: null },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    await act(async () => {
      await result.current.revokeAllOtherSessions();
    });

    expect(calls).toContainEqual(["delete", []]);
    expect(calls).toContainEqual(["neq", ["id", "sess-1"]]);
  });

  it("erro de escrita vira mensagem visivel", async () => {
    const { builder } = makeBuilder([
      { data: [sessionRow()], error: null },
      { data: null, error: null },
      {
        data: [sessionRow(), sessionRow({ id: "sess-2", device: "iPhone", browser: "Safari" })],
        error: null,
      },
      { data: null, error: { message: "permission denied" } },
    ]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    await act(async () => {
      await expect(result.current.revokeSession("sess-2")).rejects.toThrow();
    });

    await waitFor(() => expect(result.current.error).toBe("permission denied"));
  });

  it("erro de leitura vira estado de erro", async () => {
    const { builder } = makeBuilder([{ data: null, error: { message: "PGRST205" } }]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.loadError).toBe("PGRST205");
  });

  it("sem sessao autenticada nao consulta o banco", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    const { builder, calls } = makeBuilder([{ data: [], error: null }]);
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useSessionManager(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(calls).toHaveLength(0);
    expect(result.current.sessions).toHaveLength(0);
  });
});
