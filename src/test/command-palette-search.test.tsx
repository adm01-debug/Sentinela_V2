import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { CommandPalette } from "@/components/CommandPalette";

const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invoke(...args),
    },
  },
}));

global.HTMLElement.prototype.scrollIntoView = vi.fn();
function renderPalette(onOpenChange = vi.fn()) {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="*" element={<CommandPalette open onOpenChange={onOpenChange} />} />
      </Routes>
    </MemoryRouter>
  );
  return onOpenChange;
}

describe("CommandPalette - busca em dados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockResolvedValue({
      data: {
        results: [
          {
            id: "emp-1",
            type: "employee",
            title: "Joao Silva",
            description: "Analista - TI (active)",
            score: 0.9,
          },
        ],
      },
      error: null,
    });
  });

  it("nao chama a busca para termo curto", async () => {
    const user = userEvent.setup();
    renderPalette();

    await user.type(screen.getByPlaceholderText("Buscar página, ação ou funcionário..."), "j");

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(invoke).not.toHaveBeenCalled();
  });

  it("mostra o resultado da busca e fecha a paleta ao selecionar", async () => {
    const user = userEvent.setup();
    const onOpenChange = renderPalette();

    await user.type(screen.getByPlaceholderText("Buscar página, ação ou funcionário..."), "joao");

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    expect(invoke).toHaveBeenCalledWith("natural-language-query", {
      body: { query: "joao", maxResults: 6 },
    });

    const item = await screen.findByText("Joao Silva");
    await user.click(item);

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("ignora resultado de tipo desconhecido", async () => {
    invoke.mockResolvedValue({
      data: {
        results: [
          { id: "x-9", type: "desconhecido", title: "Nada", description: "" },
          { id: "emp-2", type: "employee", title: "Maria Souza", description: "RH (active)" },
        ],
      },
      error: null,
    });

    const user = userEvent.setup();
    renderPalette();

    await user.type(screen.getByPlaceholderText("Buscar página, ação ou funcionário..."), "ma");

    expect(await screen.findByText("Maria Souza")).toBeInTheDocument();
    expect(screen.queryByText("Nada")).not.toBeInTheDocument();
  });
});
