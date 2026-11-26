import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViolationAcknowledgeDialog } from "@/components/violations/ViolationAcknowledgeDialog";

const invoke = vi.fn();
const success = vi.fn();
const errorToast = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => success(...args),
    error: (...args: unknown[]) => errorToast(...args),
  },
}));

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  violationId: "11111111-1111-4111-8111-111111111111",
  employeeName: "Ana Souza",
  acknowledgedAt: null,
  onAcknowledged: vi.fn(),
};

describe("ViolationAcknowledgeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("registra a ciência chamando a edge acknowledge-violation", async () => {
    render(<ViolationAcknowledgeDialog {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/Observação/i), "Ciência presencial com o RH");
    await userEvent.click(screen.getByRole("button", { name: /Confirmar ciência/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    expect(invoke).toHaveBeenCalledWith("acknowledge-violation", {
      body: {
        violation_id: baseProps.violationId,
        action: "acknowledged",
        reason: "Ciência presencial com o RH",
        device: "painel-web",
      },
    });
    await waitFor(() => expect(baseProps.onAcknowledged).toHaveBeenCalled());
    expect(success).toHaveBeenCalled();
  });

  it("avisa o usuário quando a edge recusa o registro", async () => {
    invoke.mockResolvedValue({ data: { error: "Forbidden" }, error: null });

    render(<ViolationAcknowledgeDialog {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /Confirmar ciência/i }));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith("Forbidden"));
    expect(baseProps.onAcknowledged).not.toHaveBeenCalled();
  });

  it("não oferece confirmar quando a ciência já foi registrada", () => {
    render(<ViolationAcknowledgeDialog {...baseProps} acknowledgedAt="2026-11-26T12:00:00.000Z" />);

    expect(screen.getByText(/Ciência já registrada/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Confirmar ciência/i })).toBeNull();
  });
});
