import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PolicyGate } from "@/components/PolicyGate";

const rpc = vi.fn();

let authState: { user: { id: string; email: string; name: string } | null } = {
  user: { id: "u1", email: "ti@x.com", name: "TI" },
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...a: unknown[]) => rpc(...a) },
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => authState }));

vi.mock("@/components/PolicyAcknowledgmentDialog", () => ({
  PolicyAcknowledgmentDialog: () => <button type="button">Aceitar Politicas</button>,
}));

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

const renderGate = (children = <div>conteudo-protegido</div>) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PolicyGate>{children}</PolicyGate>
    </QueryClientProvider>
  );
};

describe("PolicyGate", () => {
  beforeEach(() => {
    rpc.mockReset();
    authState = { user: { id: "u1", email: "ti@x.com", name: "TI" } };
  });

  it("libera quando o aceite de hoje existe", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          has_acknowledged_today: true,
          last_acknowledged_at: "2026-11-22T10:00:00Z",
          is_exempt: false,
        },
      ],
      error: null,
    });
    renderGate();
    await waitFor(() => expect(screen.getByText("conteudo-protegido")).toBeTruthy());
    expect(rpc).toHaveBeenCalledWith("my_policy_acknowledgment_status");
  });

  it("bloqueia quando nao ha aceite hoje", async () => {
    rpc.mockResolvedValue({
      data: [{ has_acknowledged_today: false, last_acknowledged_at: null, is_exempt: false }],
      error: null,
    });
    renderGate();
    await waitFor(() => expect(screen.getByText(/Acesso Bloqueado/i)).toBeTruthy());
  });

  it("libera quando o usuario e isento", async () => {
    rpc.mockResolvedValue({
      data: [{ has_acknowledged_today: false, last_acknowledged_at: null, is_exempt: true }],
      error: null,
    });
    renderGate();
    await waitFor(() => expect(screen.getByText("conteudo-protegido")).toBeTruthy());
  });

  it("e fail-open: erro na consulta nunca tranca o sistema", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("permission denied") });
    renderGate();
    await waitFor(() => expect(screen.getByText("conteudo-protegido")).toBeTruthy());
    expect(screen.queryByText(/Acesso Bloqueado/i)).toBeNull();
  });

  it("e fail-open: excecao na RPC nunca tranca o sistema", async () => {
    rpc.mockRejectedValue(new Error("network down"));
    renderGate();
    await waitFor(() => expect(screen.getByText("conteudo-protegido")).toBeTruthy());
  });

  it("sem usuario logado nao bloqueia", async () => {
    authState = { user: null };
    renderGate();
    await waitFor(() => expect(screen.getByText("conteudo-protegido")).toBeTruthy());
    expect(rpc).not.toHaveBeenCalled();
  });
});
