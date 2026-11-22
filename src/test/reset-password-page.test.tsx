import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { supabase } from "@/integrations/supabase/client";

const authState: {
  session: { user: { email: string } } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} = {
  session: null,
  isAuthenticated: false,
  isLoading: false,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderPage() {
  return render(
    <BrowserRouter>
      <ResetPasswordPage />
    </BrowserRouter>
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
    authState.session = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;
  });

  it("mostra link invalido quando nao existe sessao de recovery", () => {
    renderPage();
    expect(screen.getByText("Link invalido")).toBeInTheDocument();
    expect(screen.getByText("Solicitar novo link")).toBeInTheDocument();
  });

  it("mostra erro quando o hash traz link expirado", () => {
    window.location.hash =
      "#error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";
    renderPage();
    expect(screen.getByText(/expirou ou ja foi usado/i)).toBeInTheDocument();
  });

  it("troca a senha quando existe sessao de recovery", async () => {
    authState.session = { user: { email: "user@teste.com" } };
    authState.isAuthenticated = true;
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: { user: {} },
      error: null,
    } as never);

    renderPage();

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "NovaSenha@2026" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "NovaSenha@2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar nova senha/i }));

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "NovaSenha@2026" });
    });
    await waitFor(() => expect(screen.getByText("Senha redefinida")).toBeInTheDocument());
  });

  it("bloqueia o envio enquanto as senhas nao coincidem", () => {
    authState.session = { user: { email: "user@teste.com" } };
    authState.isAuthenticated = true;

    renderPage();

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "NovaSenha@2026" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "OutraSenha@2026" },
    });

    expect(screen.getByText("As senhas nao coincidem")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Salvar nova senha/i })).toBeDisabled();
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });
});
