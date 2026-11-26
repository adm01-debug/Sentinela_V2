import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import UsersPage from "../UsersPage";
import * as useUsersHook from "@/hooks/useUsers";

// Mocks
vi.mock("@/hooks/useUsers", () => ({
  useUsers: vi.fn(),
  useDeleteUser: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsersHook.useUsers).mockReturnValue({
      data: [
        { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
        { id: "2", name: "Regular User", email: "user@example.com", role: "user" },
      ],
      isLoading: false,
    } as any);
  });

  const renderUsers = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UsersPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it("renders users list correctly", () => {
    renderUsers();
    expect(screen.getByText("Usuários")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Regular User")).toBeInTheDocument();
  });

  it("filters users by search", () => {
    renderUsers();
    const searchInput = screen.getByPlaceholderText("Buscar usuários...");
    fireEvent.change(searchInput, { target: { value: "Admin" } });

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.queryByText("Regular User")).not.toBeInTheDocument();
  });

  it("links de convidar e de detalhe apontam para rotas que existem", () => {
    renderUsers();
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    // Antes: /users/invite e /users/:id, que nao existiam em AppRoutes (404).
    expect(hrefs).toContain("/admin/users/invite");
    expect(hrefs).toContain("/admin/users/1");
    expect(hrefs).not.toContain("/users/invite");
  });
});
