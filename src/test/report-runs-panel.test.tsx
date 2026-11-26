import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { ReportRunsPanel } from "@/components/reports/ReportRunsPanel";

const from = vi.fn();
const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => from(...args),
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { id: "admin-1", isAdmin: true } }),
}));

interface Chain extends Record<string, unknown> {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
}

function chain(
  result: { data: unknown; error: unknown },
  single: { data: unknown; error: unknown } = result
): Chain {
  const obj: Record<string, unknown> = {};
  for (const metodo of ["select", "order", "limit", "eq", "insert", "delete", "update"]) {
    obj[metodo] = vi.fn(() => obj);
  }
  obj.maybeSingle = vi.fn(() => Promise.resolve(single));
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

const execucoes = [
  {
    id: "r-1",
    name: "summary_1",
    type: "summary",
    status: "completed",
    created_at: "2026-11-20T10:00:00.000Z",
    file_url: "https://exemplo/relatorio.pdf",
  },
  {
    id: "r-2",
    name: "violations_2",
    type: "violations",
    status: "failed",
    created_at: "2026-11-19T10:00:00.000Z",
    file_url: null,
  },
  {
    id: "r-3",
    name: "productivity_3",
    type: "productivity",
    status: "generating",
    created_at: "2026-11-18T10:00:00.000Z",
    file_url: null,
  },
];

describe("Painel de execucoes do gerador de relatorios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("lista as execucoes da tabela reports com status e estatisticas", async () => {
    from.mockReturnValue(chain({ data: execucoes, error: null }));

    render(<ReportRunsPanel />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Resumo geral/)).toBeTruthy();
    });

    expect(from).toHaveBeenCalledWith("reports");
    expect(screen.getByText("Concluído")).toBeTruthy();
    expect(screen.getByText("Falhou")).toBeTruthy();
    expect(screen.getByText("Gerando")).toBeTruthy();
    expect(screen.getByText("Execuções").previousSibling?.textContent).toBe("3");
    expect(screen.getByText("Concluídas").previousSibling?.textContent).toBe("1");
    expect(screen.getByText("Falhas").previousSibling?.textContent).toBe("1");
    expect(screen.getByText("Em andamento").previousSibling?.textContent).toBe("1");
    expect(screen.getAllByText("Baixar")).toHaveLength(1);
  });

  it("dispara o gerador cria registro em reports e invoca a edge generate-report", async () => {
    from.mockReturnValue(chain({ data: [], error: null }, { data: { id: "novo-1" }, error: null }));

    render(<ReportRunsPanel />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /gerar agora/i }));
    fireEvent.click(await screen.findByRole("button", { name: /^gerar$/i }));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("generate-report", {
        body: { reportId: "novo-1", type: "summary" },
      });
    });

    const insertChain = from.mock.results.at(-1)?.value as Chain;
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "summary", status: "pending" })
    );
  });
});
