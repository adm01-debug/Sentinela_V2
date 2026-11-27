import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import IntegrationsHealthPage from "@/pages/admin/IntegrationsHealthPage";

// Painel de saude das integracoes: a lista de funcoes monitoradas precisa ser
// conferida no gateway, nao so por logs antigos. Uma edge removida do projeto
// respondia 404 e o painel seguia dizendo "operacional".

const EMPTY = { data: [], count: 0, error: null };

function tabela() {
  const builder: Record<string, unknown> = {};
  for (const metodo of ["select", "eq", "in", "gte", "order", "limit"]) {
    builder[metodo] = () => builder;
  }
  builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(EMPTY).then(resolve);
  return builder;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => tabela() },
}));

vi.mock("@/components/admin/ChaosCoverageCard", () => ({
  ChaosCoverageCard: () => <div data-testid="chaos" />,
}));

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<IntegrationsHealthPage />, { wrapper: Wrapper });
};

describe("IntegrationsHealthPage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://projeto.supabase.co");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("ok", { status: 200 })))
    );
  });

  it("verifica no gateway toda funcao de push monitorada", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("3/3")).toBeTruthy());
    const alvos = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0])
    );
    expect(alvos.some((url) => url.endsWith("/functions/v1/send-push-notification"))).toBe(true);
    expect(alvos.some((url) => url.endsWith("/functions/v1/notify-dispute-decision"))).toBe(true);
    expect(alvos.some((url) => url.endsWith("/functions/v1/escalate-dispute-sla"))).toBe(true);
  });

  it("mostra o canal de funcoes fora do ar e expoe quais quebraram", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve(
          new Response(url.includes("delete-user-data") ? "nao" : "ok", {
            status: url.includes("delete-user-data") ? 404 : 200,
          })
        )
      )
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/funcao\(oes\) essencial\(is\) fora do ar/)).toBeTruthy()
    );
    expect(screen.getByText(/delete-user-data/)).toBeTruthy();
  });
});
