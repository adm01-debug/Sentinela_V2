import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MFAGuard } from "@/guards/MFAGuard";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const mfaMock = {
  getAuthenticatorAssuranceLevel: vi.fn(),
  listFactors: vi.fn(),
  challenge: vi.fn(),
  verify: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (supabase.auth as unknown as { mfa: typeof mfaMock }).mfa = mfaMock;
  mfaMock.listFactors.mockResolvedValue({ data: { totp: [{ id: "factor-1" }] }, error: null });
});

function renderGuard() {
  return render(
    <MFAGuard>
      <div>conteudo protegido</div>
    </MFAGuard>
  );
}

describe("MFAGuard", () => {
  it("libera o app quando a conta nao tem fator cadastrado", async () => {
    mfaMock.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });

    renderGuard();

    await waitFor(() => expect(screen.getByText("conteudo protegido")).toBeInTheDocument());
    expect(screen.queryByText("Verificação em Duas Etapas")).not.toBeInTheDocument();
  });

  it("pede o codigo quando existe fator verificado e a sessao esta em aal1", async () => {
    mfaMock.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });

    renderGuard();

    await waitFor(() => expect(screen.getByText("Verificação em Duas Etapas")).toBeInTheDocument());
    expect(screen.queryByText("conteudo protegido")).not.toBeInTheDocument();
  });

  it("libera o app quando a sessao ja passou pelo segundo fator", async () => {
    mfaMock.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });

    renderGuard();

    await waitFor(() => expect(screen.getByText("conteudo protegido")).toBeInTheDocument());
  });

  it("falha aberta quando a Auth API responde erro", async () => {
    mfaMock.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: null,
      error: new Error("auth indisponivel"),
    });

    renderGuard();

    await waitFor(() => expect(screen.getByText("conteudo protegido")).toBeInTheDocument());
  });
});
