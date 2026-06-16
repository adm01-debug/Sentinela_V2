import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ForgotPasswordPage from "../ForgotPasswordPage";
import { supabase } from "@/integrations/supabase/client";

// Mocks
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Esqueceu a senha?")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar instruções/i })).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar instruções/i });

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
    });
  });

  it("calls supabase resetPasswordForEmail on valid submit", async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.resetPasswordForEmail>>);

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Enviar instruções/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(Object)
      );
    });
  });
});
