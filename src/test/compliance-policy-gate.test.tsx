import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import CompliancePage from "@/pages/CompliancePage";

vi.mock("@/hooks/useCompliance", () => ({
  useCompliance: () => ({
    rules: [
      {
        id: "1",
        name: "LGPD - Consentimento",
        category: "Dados Pessoais",
        description: "x",
        status: "partial",
      },
    ],
    checking: false,
    compliancePercentage: 0,
  }),
}));

vi.mock("@/hooks/useChartColors", () => ({
  useChartColors: () => ({ success: "#0f0", warning: "#ff0", primary: "#00f" }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1", name: "Maria Silva", email: "maria@x.com" } }),
}));

vi.mock("@/components/PolicyAcknowledgmentDialog", () => ({
  PolicyAcknowledgmentDialog: ({ employeeName }: { employeeName: string }) => (
    <button data-testid="aceite">{`Aceitar Políticas: ${employeeName}`}</button>
  ),
}));

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CompliancePage />, { wrapper: Wrapper });
};

describe("CompliancePage", () => {
  it("oferece o aceite de politicas com o nome do usuario logado", () => {
    renderPage();
    expect(screen.getByTestId("aceite").textContent).toContain("Maria Silva");
  });

  it("explica que o aceite muda a regra LGPD de parcial para conforme", () => {
    renderPage();
    expect(screen.getByText(/Termo de ciência das políticas de monitoramento/i)).toBeTruthy();
  });
});
