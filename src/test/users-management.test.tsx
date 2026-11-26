import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { useInviteUser, useUsers } from "@/hooks/useUsers";

const from = vi.fn();
const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => from(...args),
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));

function chain(result: { data: unknown; error: unknown }) {
  const obj: Record<string, unknown> = {};
  for (const metodo of ["select", "order", "insert", "update", "eq", "in", "limit"]) {
    obj[metodo] = vi.fn(() => obj);
  }
  obj.maybeSingle = vi.fn(() => Promise.resolve(result));
  obj.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return obj;
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("Gestao de usuarios - papeis reais e convite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useUsers mostra o papel de user_roles em vez do 'user' fixo", async () => {
    from.mockImplementation((tabela: string) =>
      tabela === "profiles"
        ? chain({
            data: [
              {
                id: "u1",
                full_name: "Ana",
                email: "ana@empresa.com",
                created_at: "2026-01-01T00:00:00Z",
              },
            ],
            error: null,
          })
        : chain({ data: [{ user_id: "u1", role: "Admin" }], error: null })
    );

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data?.[0].role).toBe("Admin");
  });

  it("useInviteUser chama a edge admin-invite-user com o payload do formulario", async () => {
    invoke.mockResolvedValue({
      data: { success: true, user_id: "u9", email: "nova@empresa.com", role: "user" },
      error: null,
    });

    const { result } = renderHook(() => useInviteUser(), { wrapper });
    await result.current.mutateAsync({ email: "nova@empresa.com", role: "user" });

    expect(invoke).toHaveBeenCalledWith("admin-invite-user", {
      body: { email: "nova@empresa.com", role: "user" },
    });
  });

  it("useInviteUser propaga a mensagem real da edge (nao a generica do SDK)", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: {
          clone: () => ({
            json: async () => ({ error: "Apenas admin pode convidar usuario" }),
          }),
        },
      },
    });

    const { result } = renderHook(() => useInviteUser(), { wrapper });

    await expect(result.current.mutateAsync({ email: "nova@empresa.com" })).rejects.toThrow(
      "Apenas admin pode convidar usuario"
    );
  });
});
