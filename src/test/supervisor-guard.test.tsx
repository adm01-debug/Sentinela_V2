import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SupervisorGuard, AdminGuard } from "@/guards";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const authState: Record<string, unknown> = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRoleLoading: false,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

function renderWithGuard(guard: "supervisor" | "admin") {
  const Guard = guard === "supervisor" ? SupervisorGuard : AdminGuard;
  return render(
    <MemoryRouter>
      <Guard>
        <div>area restrita</div>
      </Guard>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.user = null;
  authState.isAuthenticated = false;
  authState.isLoading = false;
  authState.isRoleLoading = false;
});

describe("SupervisorGuard", () => {
  it("bloqueia usuario que so se declarou supervisor no metadata", async () => {
    // role vem de user_metadata, que o proprio usuario edita via updateUser.
    authState.user = { id: "u1", role: "supervisor", isAdmin: false };
    authState.isAuthenticated = true;

    renderWithGuard("supervisor");

    await waitFor(() => {
      expect(screen.queryByText("area restrita")).not.toBeInTheDocument();
    });
  });

  it("libera supervisor vindo de user_roles", async () => {
    authState.user = { id: "u2", role: "supervisor", isAdmin: false, roleFromDb: true };
    authState.isAuthenticated = true;

    renderWithGuard("supervisor");

    await waitFor(() => {
      expect(screen.getByText("area restrita")).toBeInTheDocument();
    });
  });

  it("libera admin", async () => {
    authState.user = { id: "u3", role: "admin", isAdmin: true };
    authState.isAuthenticated = true;

    renderWithGuard("supervisor");

    await waitFor(() => {
      expect(screen.getByText("area restrita")).toBeInTheDocument();
    });
  });
});

describe("AdminGuard", () => {
  it("bloqueia quem nao e admin", async () => {
    authState.user = { id: "u4", role: "user", isAdmin: false };
    authState.isAuthenticated = true;

    renderWithGuard("admin");

    await waitFor(() => {
      expect(screen.queryByText("area restrita")).not.toBeInTheDocument();
    });
  });
});
